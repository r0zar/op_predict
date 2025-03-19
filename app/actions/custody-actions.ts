'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { marketStore, userBalanceStore, userStatsStore, custodyStore, getSetMembers, CustodyTransaction } from 'wisdom-sdk';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from "@/lib/utils";

enum TransactionType {
    TRANSFER = "transfer",
    PREDICT = "predict",
    CLAIM_REWARD = "claim-reward"
}

// Define the validation schema for transaction custody
const custodyFormSchema = z.object({
    // Transaction data
    signature: z.string().min(1, { message: "Transaction signature is required" }),
    nonce: z.number({ required_error: "Transaction nonce is required" }),
    signer: z.string().min(1, { message: "Transaction signer is required" }),
    type: z.enum([
        TransactionType.TRANSFER,
        TransactionType.PREDICT,
        TransactionType.CLAIM_REWARD
    ], { required_error: "Transaction type is required" }),
    subnetId: z.string().min(1, { message: "Subnet ID is required" }),

    // Transaction-specific data (optional based on type)
    to: z.string().optional(),
    amount: z.number().optional(),
    marketId: z.union([z.string(), z.number()]).optional(),
    outcomeId: z.number().optional(),
    receiptId: z.number().optional(),

    // User requesting custody
    userId: z.string().min(1, { message: "User ID is required" }),
});

export type CustodyFormData = z.infer<typeof custodyFormSchema>;

/**
 * Get related markets for a specific market
 */
export async function getRelatedMarkets(marketId: string): Promise<any[]> {
    const market = await marketStore.getMarket(marketId);
    if (!market) {
        return [];
    }
    return marketStore.getRelatedMarkets(marketId, 3);
}

/**
 * Create a prediction with custody of a signed transaction
 * This is the primary function that should be used for creating predictions with Signet
 */
export async function createPredictionWithCustody(formData: {
    // Transaction data
    signature: string;
    nonce: number;
    signer: string;
    subnetId: string;

    // Prediction data
    marketId: string;
    outcomeId: number;
    userId: string;
    amount: number;
}): Promise<{
    success: boolean;
    transaction?: any;
    nftReceipt?: any;
    outcomeName?: string;
    error?: string;
}> {
    try {
        // Ensure the user is authorized
        const user = await currentUser();
        if (!user || user.id !== formData.userId) {
            return { success: false, error: 'Unauthorized: User ID mismatch' };
        }

        // Get the market to verify it exists and get outcome name
        const market: any = await marketStore.getMarket(formData.marketId);
        if (!market) {
            return { success: false, error: 'Market not found' };
        }

        // Check if the market has ended
        if (market.endDate) {
            const endDate = new Date(market.endDate);
            const now = new Date();
            if (now >= endDate) {
                return {
                    success: false,
                    error: 'This market has ended and is no longer accepting predictions'
                };
            }
        }

        // Find the outcome
        const outcome = market.outcomes?.find((o: any) => o.id === formData.outcomeId);
        if (!outcome) {
            return { success: false, error: 'Outcome not found' };
        }

        // Create the prediction with custody
        const result = await custodyStore.createPredictionWithCustody({
            signature: formData.signature,
            nonce: formData.nonce,
            signer: formData.signer,
            subnetId: formData.subnetId,
            marketId: formData.marketId,
            outcomeId: formData.outcomeId,
            userId: formData.userId,
            amount: formData.amount
        });

        if (!result.success || !result.transaction) {
            return {
                success: false,
                error: result.error || 'Failed to create prediction with custody'
            };
        }

        // Revalidate relevant paths
        revalidatePath(`/markets/${market.id}`);
        revalidatePath('/markets');
        revalidatePath('/portfolio');
        revalidatePath('/leaderboard');

        return {
            success: true,
            transaction: result.transaction,
            nftReceipt: result.transaction.nftReceipt,
            outcomeName: outcome.name
        };
    } catch (error) {
        console.error('Error creating prediction with custody:', error);

        if (error instanceof Error && error.message.includes('Insufficient balance')) {
            return {
                success: false,
                error: 'Insufficient balance. Please add more funds to your account.'
            };
        }

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : 'Failed to create prediction with custody'
        };
    }
}

/**
 * Get all transactions in custody for the current user
 */
export async function getUserCustodyTransactions(): Promise<{
    success: boolean;
    transactions?: any[];
    error?: string;
}> {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get all transactions for the user
        const transactions = await custodyStore.getUserTransactions(user.id);

        return {
            success: true,
            transactions
        };
    } catch (error) {
        console.error('Error getting user custody transactions:', error);
        return {
            success: false,
            error: 'Failed to get transactions. Please try again.'
        };
    }
}

/**
 * Get all transactions in custody for a specific market
 */
export async function getMarketCustodyTransactions(marketId: string): Promise<{
    success: boolean;
    transactions?: any[];
    error?: string;
}> {
    try {
        if (!marketId) {
            return { success: false, error: 'Market ID is required' };
        }

        // Get all transactions for the market
        const transactions = await custodyStore.getMarketTransactions(marketId);

        return {
            success: true,
            transactions
        };
    } catch (error) {
        console.error('Error getting market custody transactions:', error);
        return {
            success: false,
            error: 'Failed to get transactions. Please try again.'
        };
    }
}

/**
 * Get a specific transaction in custody
 */
export async function getCustodyTransaction(id: string): Promise<{
    success: boolean;
    transaction?: any;
    error?: string;
}> {
    try {
        if (!id) {
            return { success: false, error: 'Transaction ID is required' };
        }

        // Get the transaction
        const transaction = await custodyStore.getTransaction(id);

        if (!transaction) {
            return { success: false, error: 'Transaction not found' };
        }

        return {
            success: true,
            transaction
        };
    } catch (error) {
        console.error('Error getting custody transaction:', error);
        return {
            success: false,
            error: 'Failed to get transaction. Please try again.'
        };
    }
}

/**
 * Get NFT receipt for a transaction in custody
 */
export async function getCustodyNFTReceipt(id: string): Promise<{
    success: boolean;
    receipt?: any;
    error?: string;
}> {
    try {
        if (!id) {
            return { success: false, error: 'NFT Receipt ID is required' };
        }

        // Get the NFT receipt
        const receipt = await custodyStore.getNFTReceipt(id);

        if (!receipt) {
            return { success: false, error: 'NFT Receipt not found' };
        }

        return {
            success: true,
            receipt
        };
    } catch (error) {
        console.error('Error getting custody NFT receipt:', error);
        return {
            success: false,
            error: 'Failed to get NFT receipt. Please try again.'
        };
    }
}

/**
 * Find transactions by status, type, and marketId
 */
export async function findCustodyTransactions(criteria: {
    status?: string,
    type?: string,
    marketId?: string
}): Promise<{
    success: boolean;
    transactions?: any[];
    error?: string;
}> {
    try {
        if (!criteria || Object.keys(criteria).length === 0) {
            return { success: false, error: 'Search criteria are required' };
        }

        let transactions: any[] = [];

        // If we have a marketId, get market transactions
        if (criteria.marketId) {
            if (criteria.status === 'pending' && criteria.type === 'predict') {
                // Use the specific function for pending predictions
                transactions = await custodyStore.getPendingPredictionsForMarket(criteria.marketId);
            } else {
                // Get all market transactions and filter manually
                const marketTransactions = await custodyStore.getMarketTransactions(criteria.marketId);
                transactions = marketTransactions.filter((tx: any) => {
                    // Filter by status if specified
                    if (criteria.status && tx.status !== criteria.status) {
                        return false;
                    }
                    // Filter by type if specified
                    if (criteria.type && tx.type !== criteria.type) {
                        return false;
                    }
                    return true;
                });
            }
        }
        // If we only have status=pending and type=predict, use getAllPendingPredictions
        else if (criteria.status === 'pending' && criteria.type === 'predict') {
            transactions = await custodyStore.getAllPendingPredictions();
        }
        // For other cases, we'll need to get transactions from all users and filter
        else {
            console.log('Advanced filtering not supported - please specify marketId, or status=pending + type=predict');
            return { success: false, error: 'Advanced filtering not supported' };
        }

        return {
            success: true,
            transactions
        };
    } catch (error) {
        console.error('Error finding custody transactions:', error);
        return {
            success: false,
            error: 'Failed to find transactions. Please try again.'
        };
    }
}

/**
 * Update transaction status (admin or user who has custody)
 */
export async function updateCustodyTransactionStatus(
    id: string,
    status: 'submitted' | 'confirmed' | 'rejected',
    details?: { reason?: string }
): Promise<{
    success: boolean;
    transaction?: any;
    error?: string;
}> {
    try {
        if (!id) {
            return { success: false, error: 'Transaction ID is required' };
        }

        // Get the current user
        const user = await currentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get the transaction to check ownership
        const transaction = await custodyStore.getTransaction(id);
        if (!transaction) {
            return { success: false, error: 'Transaction not found' };
        }

        // Check if user is authorized (admin or transaction owner)
        if (transaction.userId !== user.id && !isAdmin(user.id)) {
            return {
                success: false,
                error: 'Unauthorized: You do not have permission to update this transaction'
            };
        }

        // Update the transaction status
        let updatedTransaction;
        if (status === 'submitted') {
            updatedTransaction = await custodyStore.markAsSubmitted(id);
        } else if (status === 'confirmed') {
            updatedTransaction = await custodyStore.markAsConfirmed(id);
        } else if (status === 'rejected') {
            updatedTransaction = await custodyStore.markAsRejected(id, details?.reason);
        } else {
            return { success: false, error: 'Invalid status' };
        }

        if (!updatedTransaction) {
            return { success: false, error: 'Failed to update transaction status' };
        }

        // Revalidate paths
        revalidatePath('/portfolio');

        // If this is a prediction, also revalidate markets page
        if (transaction.type === TransactionType.PREDICT && transaction.marketId) {
            revalidatePath(`/markets/${transaction.marketId}`);
            revalidatePath('/markets');
        }

        return {
            success: true,
            transaction: updatedTransaction
        };
    } catch (error) {
        console.error('Error updating custody transaction status:', error);
        return {
            success: false,
            error: 'Failed to update transaction status. Please try again.'
        };
    }
}

/**
 * Delete a transaction (admin only)
 */
export async function deleteCustodyTransaction(id: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Check if user is an admin
        if (!isAdmin(user.id)) {
            return {
                success: false,
                error: 'Unauthorized: Admin permissions required'
            };
        }

        if (!id) {
            return { success: false, error: 'Transaction ID is required' };
        }

        // Get the transaction for reference before deletion
        const transaction = await custodyStore.getTransaction(id);

        // Delete the transaction
        const result = await custodyStore.deleteTransaction(id);

        if (!result) {
            return { success: false, error: 'Failed to delete transaction' };
        }

        // Revalidate paths
        revalidatePath('/portfolio');

        // If this was a prediction, also revalidate markets page
        if (transaction?.type === TransactionType.PREDICT && transaction.marketId) {
            revalidatePath(`/markets/${transaction.marketId}`);
            revalidatePath('/markets');
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting custody transaction:', error);
        return {
            success: false,
            error: 'Failed to delete transaction. Please try again.'
        };
    }
}

/**
 * Get all transactions (admin only)
 */
export async function getAllCustodyTransactions(): Promise<{
    success: boolean;
    transactions?: any[];
    error?: string;
}> {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Check if user is an admin
        if (!isAdmin(user.id)) {
            return {
                success: false,
                error: 'Unauthorized: Admin permissions required'
            };
        }

        // Get all markets
        const marketsResult = await marketStore.getMarkets();
        const markets = marketsResult.items;
        console.log(`Found ${markets.length} markets to check for transactions`);

        if (markets.length === 0) {
            return { success: true, transactions: [] };
        }

        // Get transactions for each market
        const allTransactions = [];
        for (const market of markets) {
            const marketTransactions = await custodyStore.getMarketTransactions(market.id);
            if (marketTransactions.length > 0) {
                console.log(`Found ${marketTransactions.length} transactions for market ${market.id}`);
                //@ts-ignore
                allTransactions.push(...marketTransactions);
            }
        }

        if (allTransactions.length === 0) {
            console.log('No transactions found across all markets');
            return { success: true, transactions: [] };
        }

        console.log(`Found ${allTransactions.length} total transactions across all markets`);

        // Sort by creation date (newest first)
        const sortedTransactions = allTransactions.sort((a: CustodyTransaction, b: CustodyTransaction) =>
            new Date(b.takenCustodyAt).getTime() - new Date(a.takenCustodyAt).getTime()
        );

        return {
            success: true,
            transactions: sortedTransactions.slice(0, 200) // Limit to first 200
        };
    } catch (error) {
        console.error('Error getting all custody transactions:', error);
        return {
            success: false,
            error: 'Failed to get transactions. Please try again.'
        };
    }
}

/**
 * Get pending prediction transactions for a market (admin only)
 * These are predictions that have been taken custody of but not yet submitted to the blockchain
 */
export async function getPendingPredictions(marketId: string): Promise<{
    success: boolean;
    pendingCount: number;
    pendingTransactions?: any[];
    error?: string;
    debug?: any;
}> {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, pendingCount: 0, error: 'User not authenticated' };
        }

        // Check if user is an admin
        if (!isAdmin(user.id)) {
            return {
                success: false,
                pendingCount: 0,
                error: 'Unauthorized: Admin permissions required'
            };
        }

        console.log(`Looking for pending transactions for market: ${marketId}`);

        // Using our new specific function instead of generic criteria
        const pendingTransactions = await custodyStore.getPendingPredictionsForMarket(marketId);

        // Log some debug info
        if (!pendingTransactions || pendingTransactions.length === 0) {
            console.log(`No pending transactions found for market: ${marketId}`);

            // Debug: Get ALL pending transactions to see if any exist
            const allPendingTx = await custodyStore.getAllPendingPredictions();

            console.log(`Total pending transactions across all markets: ${allPendingTx.length}`);

            // If we have some pendingTx but none for this market, check if marketId format is the issue
            if (allPendingTx.length > 0) {
                const distinctMarketIds = new Set(allPendingTx.map(tx => tx.marketId));
                console.log(`Found pending transactions for these market IDs:`, Array.from(distinctMarketIds));
                console.log(`Comparing with requested marketId: ${marketId} (${typeof marketId})`);
            }
        } else {
            console.log(`Found ${pendingTransactions.length} pending transactions for market ${marketId}`);
        }

        if (!pendingTransactions) {
            return {
                success: true,
                pendingCount: 0,
                pendingTransactions: []
            };
        }

        return {
            success: true,
            pendingCount: pendingTransactions.length,
            pendingTransactions
        };
    } catch (error) {
        console.error('Error getting pending predictions:', error);
        return {
            success: false,
            pendingCount: 0,
            error: 'Failed to get pending predictions. Please try again.'
        };
    }
}

/**
 * Manually trigger batch processing for predictions (admin only)
 * This is similar to what the cron job does but can be triggered manually for testing
 */
export async function triggerBatchProcessing(marketId: string): Promise<{
    success: boolean;
    processed?: number;
    batched?: number;
    txid?: string;
    error?: string;
    processedForMarket?: number;
}> {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Check if user is an admin
        if (!isAdmin(user.id)) {
            return {
                success: false,
                error: 'Unauthorized: Admin permissions required'
            };
        }

        // For market-specific stats, count pending transactions for this market before processing
        let marketPendingBefore = 0;
        if (marketId) {
            const pendingTransactions = await custodyStore.getPendingPredictionsForMarket(marketId);
            marketPendingBefore = pendingTransactions?.length || 0;
            console.log(`Before batch processing: ${marketPendingBefore} pending transactions for market ${marketId}`);
        }

        // Call the batch processing function with forceProcess option
        // to process all pending predictions regardless of age
        const result = await custodyStore.batchProcessPredictions({ forceProcess: true, marketId });

        if (!result.success) {
            return {
                success: false,
                error: result.error || 'Failed to process predictions'
            };
        }

        // For market-specific stats, count remaining pending transactions after processing
        let processedForMarket = 0;
        if (marketId) {
            const pendingTransactionsAfter = await custodyStore.getPendingPredictionsForMarket(marketId);
            const marketPendingAfter = pendingTransactionsAfter?.length || 0;
            processedForMarket = marketPendingBefore - marketPendingAfter;
            console.log(`After batch processing: ${marketPendingAfter} pending transactions for market ${marketId}`);
            console.log(`Processed ${processedForMarket} transactions for market ${marketId}`);
        }

        // Revalidate paths
        revalidatePath('/markets');
        if (marketId) {
            revalidatePath(`/markets/${marketId}`);
        }
        revalidatePath('/portfolio');

        return {
            success: true,
            processed: result.processed,
            batched: result.batched,
            txid: result.txid,
            processedForMarket: marketId ? processedForMarket : undefined
        };
    } catch (error) {
        console.error('Error triggering batch processing:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}