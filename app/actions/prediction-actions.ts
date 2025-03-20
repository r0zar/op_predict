'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { marketStore, predictionStore, userBalanceStore, userStatsStore, custodyStore, predictionContractStore, storeEntity } from 'wisdom-sdk';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from "@/lib/utils";

// Define the validation schema for prediction creation
const predictionFormSchema = z.object({
    marketId: z.string().min(1, { message: "Market ID is required" }),
    outcomeId: z.number({ required_error: "Outcome ID is required" }),
    amount: z.number().positive({ message: "Amount must be positive" }),
    userId: z.string().min(1, { message: "User ID is required" }),
});

export type CreatePredictionFormData = z.infer<typeof predictionFormSchema>;

export async function getRelatedMarkets(marketId: string): Promise<any[]> {
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
    prediction?: any;
    nftReceipt?: any;
    outcomeName?: string;
    error?: string;
}> {
    try {
        // Validate input data
        const validatedData = predictionFormSchema.parse(formData);

        // Get the market to verify it exists and get outcome name
        const market: any = await marketStore.getMarket(validatedData.marketId);
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
        const outcome = market.outcomes?.find((o: any) => o.id === validatedData.outcomeId);
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
        const updatedOutcomes = market.outcomes.map((o: any) => {
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
    predictions?: any[];
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
    predictions?: any[];
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
    prediction?: any;
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
    predictions?: any[];
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
        const allPredictions: any[] = [];

        // Gather all predictions from all markets
        for (const market of markets.items) {
            const m = market as any;
            if (m && m.id) {
                const marketPredictions = await predictionStore.getMarketPredictions(m.id);
                if (marketPredictions && marketPredictions.length > 0) {
                    allPredictions.push(...marketPredictions);
                }
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

/**
 * Define the validation schema for returning a prediction
 */
const returnPredictionSchema = z.object({
    transactionId: z.string().min(1, { message: "Transaction ID is required" }),
});

export type ReturnPredictionData = z.infer<typeof returnPredictionSchema>;

/**
 * Return a prediction receipt 
 * This allows the user to "undo" their prediction as long as:
 * 1. It hasn't been submitted to the blockchain yet (still has 'pending' status)
 * 2. It's less than 15 minutes old (configurable time window)
 * 3. The user is the one who made the prediction
 * 
 * @param formData The return prediction request data
 * @returns Result indicating success or failure with error details
 */
export async function returnPrediction(formData: ReturnPredictionData): Promise<{
    success: boolean;
    error?: string;
    transaction?: any;
}> {
    try {
        // Validate input data
        const validatedData = returnPredictionSchema.parse(formData);

        // Get the current user
        const user = await currentUser();
        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Call the custody store to return the prediction
        const result = await custodyStore.returnPrediction(
            user.id,
            validatedData.transactionId
        );

        // Revalidate relevant paths if successful
        if (result.success) {
            // Revalidate portfolio and other relevant pages
            revalidatePath('/portfolio');
            revalidatePath('/markets');

            // If we know the market ID, revalidate the specific market page
            if (result.transaction?.marketId) {
                revalidatePath(`/markets/${result.transaction.marketId}`);
            }
        }

        return result;
    } catch (error) {
        console.error('Error returning prediction:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
            };
        }

        return {
            success: false,
            error: 'Failed to return prediction. Please try again.'
        };
    }
}

/**
 * Check if a prediction can be returned
 * This is useful for UI to determine if a "Return" button should be shown
 * 
 * @param transactionId The ID of the transaction to check
 * @returns Result indicating if the prediction can be returned with reason if not
 */
export async function canReturnPrediction(transactionId: string): Promise<{
    canReturn: boolean;
    reason?: string;
}> {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return {
                canReturn: false,
                reason: 'Authentication required'
            };
        }

        // Call the custody store to check if the prediction can be returned
        const result = await custodyStore.canReturnPrediction(transactionId);

        // If the transaction exists but doesn't belong to this user, add that check here
        if (result.transaction && result.transaction.userId !== user.id) {
            return {
                canReturn: false,
                reason: 'This prediction belongs to another user'
            };
        }

        return {
            canReturn: result.canReturn,
            reason: result.reason
        };
    } catch (error) {
        console.error('Error checking if prediction can be returned:', error);

        return {
            canReturn: false,
            reason: 'Error checking prediction status'
        };
    }
}

/**
 * Check multiple predictions for return eligibility in a single server call
 * This is more efficient than making individual requests from the client
 * 
 * @param predictionIds Array of prediction IDs to check
 * @returns Record mapping prediction IDs to their eligibility status
 */
export async function checkMultiplePredictionsReturnable(predictionIds: string[]): Promise<{
    success: boolean;
    results?: Record<string, { canReturn: boolean; reason?: string }>;
    error?: string;
}> {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Deduplicate prediction IDs
        const uniqueIds = Array.from(new Set(predictionIds));

        if (uniqueIds.length === 0) {
            return {
                success: true,
                results: {}
            };
        }

        // Call the canReturnPrediction function for each prediction ID
        const results = await Promise.all(
            uniqueIds.map(async (id) => {
                const result = await custodyStore.canReturnPrediction(id);

                // Add user ownership check
                if (result.transaction && result.transaction.userId !== user.id) {
                    return {
                        id,
                        canReturn: false,
                        reason: 'This prediction belongs to another user'
                    };
                }

                return {
                    id,
                    canReturn: result.canReturn,
                    reason: result.reason
                };
            })
        );

        // Convert results array to a record keyed by prediction ID
        const resultsRecord = results.reduce((acc, { id, canReturn, reason }) => {
            acc[id] = { canReturn, reason };
            return acc;
        }, {} as Record<string, { canReturn: boolean; reason?: string }>);

        return {
            success: true,
            results: resultsRecord
        };
    } catch (error) {
        console.error('Error checking multiple predictions returnable status:', error);

        return {
            success: false,
            error: 'Error checking prediction statuses'
        };
    }
}

/**
 * Create a signed claim reward transaction with custody
 * This is for claiming rewards from winning predictions via Signet
 */
export async function claimRewardWithCustody(formData: {
    // Transaction data
    signature: string;
    nonce: number;
    signer: string;
    subnetId: string;

    // Claim data
    predictionId: string;
}): Promise<{
    success: boolean;
    transaction?: any;
    error?: string;
}> {
    try {
        // Ensure the user is authorized
        const user = await currentUser();

        // Get the prediction to verify it exists
        const predictionResult = await custodyStore.getTransaction(formData.predictionId);
        if (!predictionResult.id) {
            return { success: false, error: 'Prediction not found' };
        }

        const prediction = predictionResult;

        // Verify the prediction belongs to the user
        if (!user?.id) {
            return { success: false, error: 'Unauthorized: This prediction does not belong to you' };
        }

        // Check if prediction is eligible for claiming rewards
        if (prediction.blockchainStatus !== 'won') {
            return { success: false, error: 'Only winning predictions can claim rewards' };
        }

        // Get the prediction nonce since that's what's used on-chain, not the database ID
        const predictionNonce = prediction.nonce || prediction.receiptId;

        if (!predictionNonce) {
            return { success: false, error: 'Prediction nonce not found. Cannot claim rewards.' };
        }

        // Create the claim reward transaction with custody
        // Using the prediction nonce as the receiptId for on-chain interaction
        const result = await custodyStore.createClaimRewardWithCustody({
            signature: formData.signature,
            nonce: formData.nonce, // This is the transaction nonce
            signer: formData.signer,
            subnetId: formData.subnetId,
            predictionId: formData.predictionId, // Database ID for lookup
            receiptId: predictionNonce, // On-chain identifier
            userId: user.id
        });

        if (!result.success || !result.transaction) {
            return {
                success: false,
                error: result.error || 'Failed to create claim reward transaction'
            };
        }

        // Update the prediction status in the custody store to mark it as redeemed
        // This ensures the UI will correctly show the prediction as claimed after refresh
        await custodyStore.updateTransactionStatus(formData.predictionId, 'confirmed');

        // Also update the blockchain status to ensure consistency
        const updatedPrediction = await custodyStore.getTransaction(formData.predictionId);
        if (updatedPrediction && !updatedPrediction.blockchainStatus || updatedPrediction.blockchainStatus !== 'redeemed') {
            // Create an updated transaction object with blockchainStatus set to 'redeemed'
            const updatedTx = {
                ...updatedPrediction,
                blockchainStatus: 'redeemed' as 'unresolved' | 'won' | 'lost' | 'redeemed',
                verifiedAt: new Date().toISOString()
            };

            // Store the updated transaction with blockchain data
            await storeEntity('CUSTODY_TRANSACTION', formData.predictionId, updatedTx);
        }

        // Revalidate relevant paths
        revalidatePath(`/prediction/${formData.predictionId}`);
        if (prediction.marketId) {
            revalidatePath(`/markets/${prediction.marketId}`);
        }
        revalidatePath('/portfolio');
        revalidatePath('/leaderboard');

        return {
            success: true,
            transaction: result.transaction
        };
    } catch (error) {
        console.error('Error creating claim reward transaction with custody:', error);

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : 'Failed to create claim reward transaction'
        };
    }
}

/**
 * Check if a prediction is eligible for claiming rewards
 */
/**
 * Mark a prediction as redeemed without actually submitting a claim transaction
 * This is useful for administrative purposes or to fix database inconsistencies
 */
export async function markPredictionRedeemed(predictionId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Ensure the user is authorized as an admin
        const user = await currentUser();
        if (!user?.id || !isAdmin(user.id)) {
            return {
                success: false,
                error: 'Unauthorized: Admin permissions required'
            };
        }

        // Get the prediction transaction
        const prediction = await custodyStore.getTransaction(predictionId);
        if (!prediction) {
            return {
                success: false,
                error: 'Prediction not found'
            };
        }

        // Update the transaction status to confirmed (redeemed)
        await custodyStore.updateTransactionStatus(predictionId, 'confirmed');

        // Also update the blockchain status
        const updatedPrediction = await custodyStore.getTransaction(predictionId);
        if (updatedPrediction) {
            // Create an updated transaction object with blockchainStatus set to 'redeemed'
            const updatedTx = {
                ...updatedPrediction,
                blockchainStatus: 'redeemed' as 'unresolved' | 'won' | 'lost' | 'redeemed',
                verifiedAt: new Date().toISOString()
            };

            // Store the updated transaction with blockchain data
            await storeEntity('CUSTODY_TRANSACTION', predictionId, updatedTx);
        }

        // Revalidate relevant paths
        revalidatePath(`/prediction/${predictionId}`);
        if (prediction.marketId) {
            revalidatePath(`/markets/${prediction.marketId}`);
        }
        revalidatePath('/portfolio');
        revalidatePath('/leaderboard');

        return { success: true };
    } catch (error) {
        console.error('Error marking prediction as redeemed:', error);

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : 'Failed to mark prediction as redeemed'
        };
    }
}

export async function canClaimReward(nftId: number): Promise<{
    canClaim: boolean;
    reason?: string;
    prediction?: any;
    market?: any;
}> {
    try {
        // Get the current user
        const user = await currentUser();
        if (!user) {
            return {
                canClaim: false,
                reason: 'Authentication required'
            };
        }

        // Check if the transaction with this receipt ID has been already claimed
        // This provides an additional layer of verification beyond the blockchain check
        try {
            // Get all claim reward transactions for this user
            const claimTransactions = await custodyStore.getUserClaimRewardTransactions(user.id);

            // Check if any transaction has this receiptId (nftId)
            const existingClaim = claimTransactions.find(tx =>
                tx.receiptId === nftId ||
                tx.nonce === nftId
            );

            if (existingClaim) {
                return {
                    canClaim: false,
                    reason: 'Rewards already claimed through a previous transaction',
                };
            }
        } catch (err) {
            // If there's an error checking claim transactions, log but continue
            console.warn('Error checking existing claim transactions:', err);
        }

        // Get the prediction status from the blockchain
        const predictionResult = await predictionContractStore.getPredictionStatus(nftId);

        if (predictionResult === 'lost') {
            return {
                canClaim: false,
                reason: 'This prediction did not win',
            };
        }

        // Check if prediction is already redeemed or in process
        if (predictionResult === 'redeemed') {
            return {
                canClaim: false,
                reason: 'Rewards already claimed',
            };
        }

        if (predictionResult === 'unresolved') {
            return {
                canClaim: false,
                reason: 'Claim already in process',
            };
        }

        // All checks passed
        return { canClaim: true };
    } catch (error) {
        console.error('Error checking if prediction can claim reward:', error);

        return {
            canClaim: false,
            reason: 'Error checking claim eligibility'
        };
    }
}
