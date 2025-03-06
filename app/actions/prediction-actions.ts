'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getMarketStore, getPredictionStore, getUserBalanceStore, getUserStatsStore } from 'wisdom-sdk';
import type { Prediction, Market } from 'wisdom-sdk';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from "@/lib/utils";

// Get store instances
const marketStore = getMarketStore();
const predictionStore = getPredictionStore();
const userBalanceStore = getUserBalanceStore();
const userStatsStore = getUserStatsStore();

// Define the validation schema for prediction creation
const predictionFormSchema = z.object({
    marketId: z.string().min(1, { message: "Market ID is required" }),
    outcomeId: z.number({ required_error: "Outcome ID is required" }),
    amount: z.number().positive({ message: "Amount must be positive" }),
    userId: z.string().min(1, { message: "User ID is required" }),
});

export type CreatePredictionFormData = z.infer<typeof predictionFormSchema>;

export async function getRelatedMarkets(marketId: string): Promise<Market[]> {
    const market = await marketStore.getMarket(marketId);
    if (!market) {
        return [];
    }
    return marketStore.getRelatedMarkets(marketId, 3);
}

/**
 * Create a new prediction and generate an NFT receipt
 */
export async function createPrediction(formData: CreatePredictionFormData): Promise<{
    success: boolean;
    prediction?: Prediction;
    nftReceipt?: any;
    outcomeName?: string;
    error?: string;
}> {
    try {
        // Validate input data
        const validatedData = predictionFormSchema.parse(formData);

        // Get the market to verify it exists and get outcome name
        const market = await marketStore.getMarket(validatedData.marketId);
        if (!market) {
            return { success: false, error: 'Market not found' };
        }
        
        // Check if the market has ended
        if (market.endDate) {
            const endDate = new Date(market.endDate);
            const now = new Date();
            if (now >= endDate) {
                return { success: false, error: 'This market has ended and is no longer accepting predictions' };
            }
        }

        // Find the outcome
        const outcome = market.outcomes.find(o => o.id === validatedData.outcomeId);
        if (!outcome) {
            return { success: false, error: 'Outcome not found' };
        }

        // Deduct the amount from user's balance
        const balanceResult = await userBalanceStore.updateBalanceForPrediction(
            validatedData.userId,
            validatedData.amount
        );

        if (!balanceResult) {
            return { success: false, error: 'Failed to update user balance' };
        }

        // Create the prediction with NFT receipt
        const prediction = await predictionStore.createPrediction({
            marketId: market.id,
            marketName: market.name,
            outcomeId: validatedData.outcomeId,
            outcomeName: outcome.name,
            userId: validatedData.userId,
            amount: validatedData.amount
        });

        // Update the market outcome votes and pool amount
        const updatedOutcomes = market.outcomes.map(o => {
            if (o.id === validatedData.outcomeId) {
                return {
                    ...o,
                    votes: (o.votes || 0) + 1,
                    amount: (o.amount || 0) + validatedData.amount,
                };
            }
            return o;
        });

        // Note: We no longer update the participants count here
        // It's now handled properly in the marketStore.updateMarketStats method
        await marketStore.updateMarket(market.id, {
            outcomes: updatedOutcomes,
            poolAmount: (market.poolAmount || 0) + validatedData.amount,
        });

        // Update user stats for leaderboard tracking
        await userStatsStore.updateStatsForNewPrediction(validatedData.userId, prediction);

        // Revalidate relevant paths
        revalidatePath(`/markets/${market.id}`);
        revalidatePath('/markets');
        revalidatePath('/portfolio');
        revalidatePath('/leaderboard'); // Revalidate leaderboard

        return {
            success: true,
            prediction,
            nftReceipt: prediction.nftReceipt,
            outcomeName: outcome.name
        };
    } catch (error) {
        console.error('Error creating prediction:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
            };
        }

        if (error instanceof Error && error.message === 'Insufficient balance') {
            return {
                success: false,
                error: 'Insufficient balance. Please add more funds to your account.'
            };
        }

        return {
            success: false,
            error: 'Failed to create prediction. Please try again.'
        };
    }
}

/**
 * Get all predictions for the current authenticated user
 */
export async function getUserPredictions(): Promise<{
    success: boolean;
    predictions?: Prediction[];
    error?: string;
}> {
    try {
        const user = await currentUser();

        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get all predictions for the user
        const predictions = await predictionStore.getUserPredictions(user.id);

        return {
            success: true,
            predictions
        };
    } catch (error) {
        console.error('Error getting user predictions:', error);
        return {
            success: false,
            error: 'Failed to get predictions. Please try again.'
        };
    }
}

/**
 * Get all predictions for a specific market
 */
export async function getMarketPredictions(marketId: string): Promise<{
    success: boolean;
    predictions?: Prediction[];
    error?: string;
}> {
    try {
        if (!marketId) {
            return { success: false, error: 'Market ID is required' };
        }

        // Get all predictions for the market
        const predictions = await predictionStore.getMarketPredictions(marketId);

        return {
            success: true,
            predictions
        };
    } catch (error) {
        console.error('Error getting market predictions:', error);
        return {
            success: false,
            error: 'Failed to get predictions. Please try again.'
        };
    }
}

/**
 * Get a specific prediction by ID
 */
export async function getPrediction(id: string): Promise<{
    success: boolean;
    prediction?: Prediction;
    error?: string;
}> {
    try {
        if (!id) {
            return { success: false, error: 'Prediction ID is required' };
        }

        // Get the prediction
        const prediction = await predictionStore.getPrediction(id);

        if (!prediction) {
            return { success: false, error: 'Prediction not found' };
        }

        return {
            success: true,
            prediction
        };
    } catch (error) {
        console.error('Error getting prediction:', error);
        return {
            success: false,
            error: 'Failed to get prediction. Please try again.'
        };
    }
}

/**
 * Get a specific NFT receipt
 */
export async function getNFTReceipt(id: string): Promise<{
    success: boolean;
    receipt?: any;
    error?: string;
}> {
    try {
        if (!id) {
            return { success: false, error: 'NFT Receipt ID is required' };
        }

        // Get the NFT receipt
        const receipt = await predictionStore.getNFTReceipt(id);

        if (!receipt) {
            return { success: false, error: 'NFT Receipt not found' };
        }

        return {
            success: true,
            receipt
        };
    } catch (error) {
        console.error('Error getting NFT receipt:', error);
        return {
            success: false,
            error: 'Failed to get NFT receipt. Please try again.'
        };
    }
}

/**
 * Delete a prediction (admin only)
 */
export async function deletePrediction(predictionId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const user = await currentUser();
        const userId = user?.id;

        // Check if user is an admin
        if (!userId || !isAdmin(userId)) {
            return {
                success: false,
                error: 'Unauthorized: Admin permissions required'
            };
        }

        if (!predictionId) {
            return { success: false, error: 'Prediction ID is required' };
        }

        // Delete the prediction
        const result = await predictionStore.deletePrediction(predictionId);

        if (!result) {
            return { success: false, error: 'Failed to delete prediction' };
        }

        // Revalidate relevant paths
        revalidatePath('/portfolio');
        revalidatePath('/markets');

        return { success: true };
    } catch (error) {
        console.error('Error deleting prediction:', error);
        return {
            success: false,
            error: 'Failed to delete prediction. Please try again.'
        };
    }
}

/**
 * Get all predictions (admin only)
 */
export async function getAllPredictions(): Promise<{
    success: boolean;
    predictions?: Prediction[];
    error?: string;
}> {
    try {
        const user = await currentUser();
        const userId = user?.id;

        // Check if user is an admin
        if (!userId || !isAdmin(userId)) {
            return {
                success: false,
                error: 'Unauthorized: Admin permissions required'
            };
        }

        // Get all market predictions to get all prediction IDs
        const markets = await marketStore.getMarkets();
        const allPredictions: Prediction[] = [];

        // Gather all predictions from all markets
        for (const market of markets) {
            const marketPredictions = await predictionStore.getMarketPredictions(market.id);
            if (marketPredictions.length > 0) {
                allPredictions.push(...marketPredictions);
            }
        }

        // Sort by created date (newest first)
        allPredictions.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
            success: true,
            predictions: allPredictions
        };
    } catch (error) {
        console.error('Error getting all predictions:', error);
        return {
            success: false,
            error: 'Failed to get predictions. Please try again.'
        };
    }
}

/**
 * Redeem a prediction receipt
 * Winners will receive their share of the pot, losers just mark their receipt as redeemed
 */
export async function redeemPredictionReceipt(predictionId: string): Promise<{
    success: boolean;
    payout?: number;
    error?: string;
}> {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get the prediction
        const predictionResult = await getPrediction(predictionId);
        if (!predictionResult.success || !predictionResult.prediction) {
            return { success: false, error: 'Prediction not found' };
        }

        const prediction = predictionResult.prediction;

        // Verify the prediction belongs to the user
        if (prediction.userId !== user.id && !isAdmin(user.id)) {
            return { success: false, error: 'Unauthorized: This prediction does not belong to you' };
        }

        // Check if prediction is already redeemed
        if (prediction.status === 'redeemed') {
            return { success: false, error: 'Prediction has already been redeemed' };
        }

        // Check if prediction is eligible for redemption (must be won or lost)
        if (prediction.status !== 'won' && prediction.status !== 'lost') {
            return { success: false, error: 'Prediction is not eligible for redemption yet' };
        }

        // Redeem the prediction
        const redemptionResult = await predictionStore.redeemPrediction(predictionId);

        if (!redemptionResult.prediction) {
            return { success: false, error: 'Failed to redeem prediction' };
        }

        // If there's a payout, add it to the user's balance
        if (redemptionResult.payout > 0) {
            await userBalanceStore.updateBalanceForResolvedPrediction(
                user.id,
                prediction.amount,
                redemptionResult.payout
            );
        } else {
            // For losers, just update to decrease the inPredictions amount
            await userBalanceStore.updateBalanceForResolvedPrediction(
                user.id,
                prediction.amount,
                0
            );
        }

        // Revalidate relevant paths
        revalidatePath('/portfolio');
        revalidatePath(`/markets/${prediction.marketId}`);

        return {
            success: true,
            payout: redemptionResult.payout
        };
    } catch (error) {
        console.error('Error redeeming prediction:', error);
        return {
            success: false,
            error: 'Failed to redeem prediction. Please try again.'
        };
    }
}
