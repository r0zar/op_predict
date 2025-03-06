'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { userBalanceStore } from 'wisdom-sdk';
import { currentUser } from '@clerk/nextjs/server';

// Define the validation schema for deposit/withdraw operations
const balanceOperationSchema = z.object({
    amount: z.number().positive({ message: "Amount must be positive" }),
});

export type BalanceOperationData = z.infer<typeof balanceOperationSchema>;

/**
 * Deposit funds into a user's account
 */
export async function depositFunds(formData: BalanceOperationData): Promise<{
    success: boolean;
    newBalance?: number;
    error?: string;
}> {
    try {
        // Validate input data
        const validatedData = balanceOperationSchema.parse(formData);

        // Get current user
        const user = await currentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Add funds to user's balance
        const updatedBalance = await userBalanceStore.addFunds(user.id, validatedData.amount);

        if (!updatedBalance) {
            return { success: false, error: 'Failed to deposit funds' };
        }

        // Revalidate portfolio page
        revalidatePath('/portfolio');

        return {
            success: true,
            newBalance: updatedBalance.availableBalance
        };
    } catch (error) {
        console.error('Error depositing funds:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
            };
        }

        return {
            success: false,
            error: 'Failed to deposit funds. Please try again.'
        };
    }
}

/**
 * Withdraw funds from a user's account
 */
export async function withdrawFunds(formData: BalanceOperationData): Promise<{
    success: boolean;
    newBalance?: number;
    error?: string;
}> {
    try {
        // Validate input data
        const validatedData = balanceOperationSchema.parse(formData);

        // Get current user
        const user = await currentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Withdraw funds from user's balance
        const updatedBalance = await userBalanceStore.withdrawFunds(user.id, validatedData.amount);

        if (!updatedBalance) {
            return { success: false, error: 'Failed to withdraw funds' };
        }

        // Revalidate portfolio page
        revalidatePath('/portfolio');

        return {
            success: true,
            newBalance: updatedBalance.availableBalance
        };
    } catch (error) {
        console.error('Error withdrawing funds:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed: ' + error.errors.map(e => e.message).join(', ')
            };
        }

        if (error instanceof Error && error.message === 'Insufficient balance') {
            return {
                success: false,
                error: 'Insufficient balance for withdrawal.'
            };
        }

        return {
            success: false,
            error: 'Failed to withdraw funds. Please try again.'
        };
    }
} 