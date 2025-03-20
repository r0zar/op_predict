'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
    marketStore,
    predictionStore,
    userBalanceStore,
    userStatsStore,
    Market,
    custodyStore,
    logger,
} from 'wisdom-sdk';
import {
    MarketQueryOptions,
    PaginatedResult,
    SortField,
    SortDirection
} from 'wisdom-sdk/dist/utils.cjs';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from "@/lib/utils";

// Define the validation schema for market creation
const marketFormSchema = z.object({
    type: z.enum(['binary', 'multiple']),
    name: z.string().min(10, {
        message: "Market name must be at least 10 characters.",
    }).max(100, {
        message: "Market name must not exceed 100 characters."
    }),
    description: z.string().min(20, {
        message: "Description must be at least 20 characters.",
    }).max(500, {
        message: "Description must not exceed 500 characters."
    }),
    endDate: z.string().min(1, {
        message: "Voting deadline is required"
    }),
    category: z.string().min(1, {
        message: "Please select a valid category"
    }).default('general'),
    outcomes: z.array(
        z.object({
            id: z.number(),
            name: z.string().min(1, { message: "Outcome name is required" })
        })
    ).min(2, {
        message: "At least two outcomes are required."
    }).max(15, {
        message: "Maximum 15 outcomes allowed."
    }),
    imageUrl: z.string().optional(),
});

export type CreateMarketFormData = z.infer<typeof marketFormSchema>;

export async function createMarket(formData: CreateMarketFormData) {
    try {
        // Validate the input data
        const validatedData = marketFormSchema.parse(formData);

        // Create the market
        const newMarket = await marketStore.createMarket({
            type: validatedData.type,
            name: validatedData.name,
            description: validatedData.description,
            outcomes: validatedData.outcomes,
            createdBy: (await currentUser())?.id || '',
            category: validatedData.category,
            endDate: new Date(validatedData.endDate).toISOString(),
            imageUrl: validatedData.imageUrl || '',
        });

        // Revalidate the markets page to show the new market
        revalidatePath('/');
        revalidatePath('/markets');

        return {
            success: true,
            market: newMarket
        };
    } catch (error) {
        console.error('Error creating market from actions:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
            };
        }

        return {
            success: false,
            error: 'Failed to create market. Please try again.'
        };
    }
}

/**
 * Query parameters for fetching markets
 */
export interface MarketQueryParams {
    status?: 'active' | 'resolved' | 'cancelled' | 'all';
    category?: string;
    search?: string;
    sortBy?: SortField;
    sortDirection?: SortDirection;
    limit?: number;
    cursor?: string;
    creatorId?: string;
}

/**
 * Get markets with pagination and filtering
 */
export async function getMarkets(params: MarketQueryParams = {}): Promise<PaginatedResult<Market>> {
    // First, ensure indexes are built
    try {
        await marketStore.buildMarketIndexes();
    } catch (e) {
        console.error("Error building market indexes:", e);
    }

    const queryOptions: MarketQueryOptions = {
        status: params.status || 'active',
        category: params.category,
        search: params.search,
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc',
        limit: params.limit || 20,
        cursor: params.cursor,
        creatorId: params.creatorId
    };

    console.log("Fetching markets with options:", JSON.stringify(queryOptions));

    // Try to get markets with the new method
    let result;

    try {
        result = await marketStore.getMarkets(queryOptions);
        console.log(`Found ${result.items.length} markets of ${result.total} total`);
    } catch (error) {
        console.error("Error fetching markets:", error);

        // Return empty result on error
        return {
            items: [],
            total: 0,
            hasMore: false
        };
    }

    return result || { items: [], total: 0, hasMore: false };
}

/**
 * Legacy alias for getMarkets with no parameters
 * @deprecated Use getMarkets() with explicit parameters instead
 */
export async function getAllMarkets(): Promise<PaginatedResult<Market>> {
    return getMarkets({ limit: 100 });
}

/**
 * Get a specific market by ID with optional blockchain verification
 */
export async function getMarket(id: string, options?: { verifyWithBlockchain?: boolean }): Promise<any> {
    return marketStore.getMarket(id, { verifyWithBlockchain: options?.verifyWithBlockchain || true });
}

/**
 * Search for markets containing specific text
 */
export async function searchMarkets(searchText: string, params: Omit<MarketQueryParams, 'search'> = {}): Promise<PaginatedResult<Market>> {
    return marketStore.searchMarkets(searchText, {
        status: params.status || 'active',
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc',
        limit: params.limit || 20,
        cursor: params.cursor
    });
}

/**
 * Get markets by category
 */
export async function getMarketsByCategory(category: string, params: Omit<MarketQueryParams, 'category'> = {}): Promise<PaginatedResult<Market>> {
    return marketStore.getMarketsByCategory(category, {
        status: params.status || 'active',
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc',
        limit: params.limit || 20,
        cursor: params.cursor
    });
}

/**
 * Get trending markets (markets with highest pool amount)
 */
export async function getTrendingMarkets(limit: number = 5): Promise<Market[]> {
    return marketStore.getTrendingMarkets(limit);
}

/**
 * Get markets created by a specific user
 */
export async function getUserCreatedMarkets(userId: string, params: Omit<MarketQueryParams, 'creatorId'> = {}): Promise<PaginatedResult<Market>> {
    return getMarkets({
        ...params,
        creatorId: userId
    });
}

/**
 * Get related markets similar to the specified market
 */
export async function getRelatedMarkets(marketId: string, limit: number = 3): Promise<Market[]> {
    return marketStore.getRelatedMarkets(marketId, limit);
}

/**
 * Load the next page of markets using cursor-based pagination
 * Useful for "Load More" functionality in UIs
 */
export async function loadMoreMarkets(currentResult: PaginatedResult<Market>, params: MarketQueryParams = {}): Promise<PaginatedResult<Market>> {
    if (!currentResult.hasMore || !currentResult.nextCursor) {
        // No more results to load
        return currentResult;
    }

    // Get next page using the cursor
    return getMarkets({
        ...params,
        cursor: currentResult.nextCursor
    });
}

// The mergeMarketResults function is now moved to lib/market-utils.ts since
// server actions must be async functions

// Delete a market (admin only)
export async function deleteMarket(marketId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Delete the market
        const result = await marketStore.deleteMarket(marketId);

        if (!result) {
            return { success: false, error: 'Failed to delete market' };
        }

        // Revalidate the markets page
        revalidatePath('/markets');

        return { success: true };
    } catch (error) {
        console.error('Error deleting market:', error);
        return {
            success: false,
            error: 'Failed to delete market. Please try again.'
        };
    }
}

// Define the validation schema for market resolution
const marketResolutionSchema = z.object({
    marketId: z.string().min(1, { message: "Market ID is required" }),
    winningOutcomeId: z.number({ required_error: "Winning outcome ID is required" }),
});

export type MarketResolutionData = z.infer<typeof marketResolutionSchema>;

/**
 * Resolve a market (admin only)
 * Sets the winning outcome, calculates payouts, and collects admin fee (5%)
 */
export async function resolveMarket(formData: MarketResolutionData): Promise<{
    success: boolean;
    adminFee?: number;
    error?: string;
    info?: string;
}> {
    console.log("Starting market resolution with data:", formData);

    // Validate input data
    const validatedData = marketResolutionSchema.parse(formData);
    try {

        // Check if user is admin
        const user = await currentUser();
        if (!user || !isAdmin(user.id)) {
            return {
                success: false,
                error: 'Unauthorized: Only admins can resolve markets'
            };
        }

        // SIMPLER APPROACH: First check blockchain state - this is our source of truth
        const onChainMarket = await marketStore.getMarket(validatedData.marketId, { verifyWithBlockchain: true });
        console.log("On-chain market state:", onChainMarket);

        // 1. Handle blockchain-resolved markets first
        if (onChainMarket && onChainMarket['is-resolved']) {
            const winningOutcomeOnChain = onChainMarket.resolvedOutcomeId;
            console.log("Market is already resolved on blockchain with outcome:", winningOutcomeOnChain);

            // Always sync to our database with the blockchain state
            await marketStore.updateMarket(validatedData.marketId, {
                resolvedOutcomeId: winningOutcomeOnChain,
                resolvedAt: new Date().toISOString(),
                status: 'resolved',
            });

            // Force revalidation of ALL relevant paths
            revalidatePath('/');
            revalidatePath(`/markets/${validatedData.marketId}`);
            revalidatePath('/markets');
            revalidatePath('/admin');
            revalidatePath('/explore');

            // Tell admin what happened
            if (winningOutcomeOnChain === validatedData.winningOutcomeId) {
                console.log("Admin selected same outcome as blockchain");
                return {
                    success: true,
                    adminFee: 0,
                    info: `Market was already resolved on blockchain with this outcome. Database updated.`
                };
            } else {
                console.log("Admin selected different outcome than blockchain");
                return {
                    success: false,
                    error: `Cannot resolve: Market is already resolved on blockchain with outcome #${winningOutcomeOnChain}`
                };
            }
        }

        // 3. Proceed with normal resolution flow
        console.log("Proceeding with normal market resolution");

        const resolutionResult = await marketStore.resolveMarketOnChain(onChainMarket!.id, validatedData.winningOutcomeId)
        console.log(resolutionResult)

        // Find the winning outcome
        const winningOutcome = onChainMarket!.outcomes.find((o: any) => o.id === validatedData.winningOutcomeId);
        if (!winningOutcome) {
            return { success: false, error: 'Winning outcome not found' };
        }

        // Get all predictions for this market
        const marketPredictions: any[] = await custodyStore.getMarketTransactions(onChainMarket!.id);
        console.log(`Found ${marketPredictions.length} predictions for this market`);

        // Calculate total pot and admin fee (5%)
        const totalPot: any = marketPredictions.reduce((sum, prediction: any) => sum + prediction.amount, 0);
        const adminFee = totalPot * 0.05; // 5% of the total pot
        const remainingPot = totalPot - adminFee;
        console.log(`Total pot: ${totalPot}, Admin fee: ${adminFee}, Remaining pot: ${remainingPot}`);

        // Find winning predictions
        const winningPredictions = marketPredictions.filter(
            (p: any) => p.outcomeId === validatedData.winningOutcomeId
        );
        console.log(`Found ${winningPredictions.length} winning predictions`);

        // Calculate total winning amount
        const totalWinningAmount = winningPredictions.reduce(
            (sum, prediction: any) => sum + prediction.amount,
            0
        );
        console.log(`Total winning amount: ${totalWinningAmount}`);

        console.log("Updating market as resolved in database...");
        // Update market as resolved
        await marketStore.updateMarket(onChainMarket!.id, {
            resolvedOutcomeId: validatedData.winningOutcomeId,
            resolvedAt: new Date().toISOString(),
            status: 'resolved',
            resolvedBy: user.id,
            adminFee: adminFee,
            remainingPot: remainingPot,
            totalWinningAmount: totalWinningAmount || 0
        });

        // Add admin fee to admin's balance
        console.log(`Adding ${adminFee} to admin balance...`);
        await userBalanceStore.addFunds(user.id, adminFee);

        // Mark all predictions for this market as won or lost
        console.log("Updating prediction statuses...");
        for (const prediction of marketPredictions) {
            const isWinner = prediction.outcomeId === validatedData.winningOutcomeId;

            // Calculate payout for winners (proportional to their stake in winning pool)
            // If no winners, winnerShare will be 0
            const winnerShare = isWinner && totalWinningAmount > 0
                ? (prediction.amount / totalWinningAmount) * remainingPot
                : 0;

            // Update prediction status
            await predictionStore.updatePrediction(prediction.id, {
                status: isWinner ? 'won' : 'lost',
                potentialPayout: isWinner ? winnerShare : 0,
                resolvedAt: new Date().toISOString()
            });

            // Update user stats for leaderboard
            await userStatsStore.updateStatsForResolvedPrediction(
                prediction.userId,
                prediction,
                isWinner,
                isWinner ? winnerShare : -prediction.amount
            );
        }

        // Aggressive revalidation of ALL relevant paths
        console.log("Revalidating all relevant paths...");
        revalidatePath('/'); // Home page
        revalidatePath(`/markets/${onChainMarket!.id}`); // Market detail page
        revalidatePath('/markets'); // Markets listing
        revalidatePath('/portfolio'); // User portfolio
        revalidatePath('/explore'); // Explore page
        revalidatePath('/leaderboard'); // Leaderboard
        revalidatePath('/admin'); // Admin page

        console.log("Market resolution completed successfully!");
        return {
            success: true,
            adminFee: adminFee
        };
    } catch (error) {
        console.error('Error resolving market:', error);

        // Attempt to revalidate paths even on error to refresh the UI
        try {
            console.log("Revalidating paths after error...");
            revalidatePath('/');
            revalidatePath('/markets');
            revalidatePath('/admin');

            if (validatedData?.marketId) {
                revalidatePath(`/markets/${validatedData.marketId}`);
            }
        } catch (revalidateError) {
            console.error("Error during revalidation after failure:", revalidateError);
        }

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
            };
        }

        return {
            success: false,
            error: 'Failed to resolve market. Please try again.' + (error instanceof Error ? ` (${error.message})` : '')
        };
    }
}

/**
 * Synchronize market statuses with blockchain state (admin only)
 * This checks all markets against their on-chain state and updates them if they don't match
 */
export async function syncMarketsWithBlockchain(): Promise<{
    success: boolean;
    processed?: number;
    updated?: number;
    errors?: number;
    syncResults?: any[];
    error?: string;
}> {
    try {
        // Check if user is admin
        const user = await currentUser();
        if (!user || !isAdmin(user.id)) {
            return {
                success: false,
                error: 'Unauthorized: Only admins can synchronize markets with blockchain'
            };
        }

        // Call the market store's syncMarketsWithBlockchain function
        const result = await marketStore.syncMarketsWithBlockchain();

        if (!result.success) {
            return {
                success: false,
                error: 'Failed to synchronize markets with blockchain'
            };
        }

        // Revalidate relevant paths
        revalidatePath('/markets');
        revalidatePath('/admin');

        return {
            success: true,
            processed: result.processed,
            updated: result.updated,
            errors: result.errors,
            syncResults: result.syncResults
        };
    } catch (error) {
        console.error('Error synchronizing markets with blockchain:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}