'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
    marketStore,
    predictionStore,
    userBalanceStore,
    userStatsStore,
    Market,
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

        // If no results found, try getting all markets without filters as fallback
        if (result.items.length === 0 && (params.category || params.status)) {
            console.log("No markets found with filters, trying without filters");
            const allMarkets = await marketStore.getMarkets({
                limit: params.limit || 20
            });
            console.log(`Found ${allMarkets.items.length} markets without filters`);
            if (allMarkets.items.length > 0) {
                return allMarkets;
            }
        }
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
 * Get a specific market by ID
 */
export async function getMarket(id: string): Promise<any> {
    return marketStore.getMarket(id);
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
}> {
    try {
        // Validate input data
        const validatedData = marketResolutionSchema.parse(formData);

        // Check if user is admin
        const user = await currentUser();
        if (!user || !isAdmin(user.id)) {
            return {
                success: false,
                error: 'Unauthorized: Only admins can resolve markets'
            };
        }

        // Get the market
        const market: any = await marketStore.getMarket(validatedData.marketId);
        if (!market) {
            return { success: false, error: 'Market not found' };
        }

        // Check if market is already resolved
        if (market.resolvedOutcomeId !== undefined) {
            return { success: false, error: 'Market is already resolved' };
        }

        // Find the winning outcome
        const winningOutcome = market.outcomes.find((o: any) => o.id === validatedData.winningOutcomeId);
        if (!winningOutcome) {
            return { success: false, error: 'Winning outcome not found' };
        }

        // Get all predictions for this market
        const marketPredictions: any[] = await predictionStore.getMarketPredictions(market.id);

        if (marketPredictions.length === 0) {
            return { success: false, error: 'No predictions found for this market' };
        }

        // Calculate total pot and admin fee (5%)
        const totalPot: any = marketPredictions.reduce((sum, prediction: any) => sum + prediction.amount, 0);
        const adminFee = totalPot * 0.05; // 5% of the total pot
        const remainingPot = totalPot - adminFee;

        // Find winning predictions
        const winningPredictions = marketPredictions.filter(
            (p: any) => p.outcomeId === validatedData.winningOutcomeId
        );

        // Calculate total winning amount
        const totalWinningAmount = winningPredictions.reduce(
            (sum, prediction: any) => sum + prediction.amount,
            0
        );

        // Update market as resolved
        await marketStore.updateMarket(market.id, {
            resolvedOutcomeId: validatedData.winningOutcomeId,
            resolvedAt: new Date().toISOString(),
            status: 'resolved',
            resolvedBy: user.id,
            adminFee: adminFee,
            remainingPot: remainingPot,
            totalWinningAmount: totalWinningAmount || 0
        });

        // Add admin fee to admin's balance
        await userBalanceStore.addFunds(user.id, adminFee);

        // Mark all predictions for this market as won or lost
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

        // Revalidate relevant paths
        revalidatePath(`/markets/${market.id}`);
        revalidatePath('/markets');
        revalidatePath('/portfolio');
        revalidatePath('/explore');
        revalidatePath('/leaderboard');

        return {
            success: true,
            adminFee: adminFee
        };
    } catch (error) {
        console.error('Error resolving market:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
            };
        }

        return {
            success: false,
            error: 'Failed to resolve market. Please try again.'
        };
    }
} 