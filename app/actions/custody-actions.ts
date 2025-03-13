'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { marketStore, userBalanceStore, userStatsStore, custodyStore } from 'wisdom-sdk';
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
 * Take custody of a signed transaction
 */
export async function takeCustodyOfTransaction(formData: CustodyFormData): Promise<{
    success: boolean;
    transaction?: any;
    error?: string;
}> {
    try {
        // Validate input data
        const validatedData = custodyFormSchema.parse(formData);

        // Ensure the user is authorized
        const user = await currentUser();
        if (!user || user.id !== validatedData.userId) {
            return { success: false, error: 'Unauthorized: User ID mismatch' };
        }

        // Take custody of the transaction
        const result = await custodyStore.takeCustody(validatedData);

        // Revalidate relevant paths
        revalidatePath('/portfolio');

        // If this is a prediction, also revalidate markets page
        if (validatedData.type === TransactionType.PREDICT && validatedData.marketId) {
            revalidatePath(`/markets/${validatedData.marketId}`);
            revalidatePath('/markets');
        }

        return result;
    } catch (error) {
        console.error('Error taking custody of transaction:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to take custody of transaction'
        };
    }
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
 * Find transactions by criteria
 */
export async function findCustodyTransactions(criteria: Record<string, any>): Promise<{
    success: boolean;
    transactions?: any[];
    error?: string;
}> {
    try {
        if (!criteria || Object.keys(criteria).length === 0) {
            return { success: false, error: 'Search criteria are required' };
        }

        // Find transactions matching criteria
        const transactions = await custodyStore.findByCriteria(criteria);

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

        // For admin, we'll need to get transactions for all users
        // This is an expensive operation and should be paginated in production
        // For simplicity in this demo, we'll get the first 100 transactions

        // Get all users and their transactions
        const allUsers = await custodyStore.findByCriteria({});

        if (!allUsers || allUsers.length === 0) {
            return { success: true, transactions: [] };
        }

        // Sort by creation date (newest first)
        const sortedTransactions = allUsers.sort((a, b) =>
            new Date(b.takenCustodyAt).getTime() - new Date(a.takenCustodyAt).getTime()
        );

        return {
            success: true,
            transactions: sortedTransactions.slice(0, 100) // Limit to first 100
        };
    } catch (error) {
        console.error('Error getting all custody transactions:', error);
        return {
            success: false,
            error: 'Failed to get transactions. Please try again.'
        };
    }
}