'use server'

import { z } from 'zod';
import { marketStore, Market, MarketOption } from '@/lib/market-store';
import { revalidatePath } from 'next/cache';

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