'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { predictionStore } from '@op-predict/lib';
import { Market, marketStore, userStatsStore } from "@op-predict/lib";
import { userBalanceStore } from '@op-predict/lib';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/src/utils';

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
});

export type CreateMarketFormData = z.infer<typeof marketFormSchema>;

export async function createMarket(formData: CreateMarketFormData): Promise<{ success: boolean; market?: Market; error?: string }> {
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
            category: 'general',
            endDate: new Date(validatedData.endDate).toISOString(),
            imageUrl: '',
        });

        // Revalidate the markets page to show the new market
        revalidatePath('/');
        revalidatePath('/markets');

        return {
            success: true,
            market: newMarket
        };
    } catch (error) {
        console.error('Error creating market:', error);

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

// Get all markets
export async function getMarkets(): Promise<Market[]> {
    return marketStore.getMarkets();
}

// Alias for getMarkets for consistency
export const getAllMarkets = getMarkets;

// Get a specific market
export async function getMarket(id: string): Promise<Market | undefined> {
    return marketStore.getMarket(id);
}

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
        const market = await marketStore.getMarket(validatedData.marketId);
        if (!market) {
            return { success: false, error: 'Market not found' };
        }

        // Check if market is already resolved
        if (market.resolvedOutcomeId !== undefined) {
            return { success: false, error: 'Market is already resolved' };
        }

        // Find the winning outcome
        const winningOutcome = market.outcomes.find(o => o.id === validatedData.winningOutcomeId);
        if (!winningOutcome) {
            return { success: false, error: 'Winning outcome not found' };
        }

        // Get all predictions for this market
        const marketPredictions = await predictionStore.getMarketPredictions(market.id);

        if (marketPredictions.length === 0) {
            return { success: false, error: 'No predictions found for this market' };
        }

        // Calculate total pot and admin fee (5%)
        const totalPot = marketPredictions.reduce((sum, prediction) => sum + prediction.amount, 0);
        const adminFee = totalPot * 0.05; // 5% of the total pot
        const remainingPot = totalPot - adminFee;

        // Find winning predictions
        const winningPredictions = marketPredictions.filter(
            p => p.outcomeId === validatedData.winningOutcomeId
        );

        // Calculate total winning amount
        const totalWinningAmount = winningPredictions.reduce(
            (sum, prediction) => sum + prediction.amount,
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