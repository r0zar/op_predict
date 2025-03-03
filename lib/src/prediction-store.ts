import * as kvStore from "./kv-store.js";
import crypto from 'crypto';
import { marketStore } from "./market-store.js";

// Define the prediction data types
export type Prediction = {
    id: string;
    marketId: string;
    outcomeId: number;
    outcomeName: string;
    userId: string;
    amount: number;
    createdAt: string;
    nftReceipt: PredictionNFTReceipt;
    status: 'active' | 'won' | 'lost' | 'redeemed' | 'cancelled';
    potentialPayout?: number;
    resolvedAt?: string;
    redeemedAt?: string;
};

export type PredictionNFTReceipt = {
    id: string;
    tokenId: string;
    image: string;
    predictionId: string;
    marketName: string;
    outcomeName: string;
    amount: number;
    createdAt: string;
};

// Prediction store with Vercel KV
export const predictionStore = {
    // Create a new prediction
    async createPrediction(data: {
        marketId: string;
        marketName: string;
        outcomeId: number;
        outcomeName: string;
        userId: string;
        amount: number;
    }): Promise<Prediction> {
        try {
            const id = crypto.randomUUID();
            const now = new Date().toISOString();

            // Generate NFT receipt
            const nftReceipt: PredictionNFTReceipt = {
                id: crypto.randomUUID(),
                tokenId: `${data.marketId}-${data.userId}-${now}`,
                image: this.generateNftImage(data.marketName, data.outcomeName, data.amount),
                predictionId: id,
                marketName: data.marketName,
                outcomeName: data.outcomeName,
                amount: data.amount,
                createdAt: now
            };

            // Create the prediction
            const prediction: Prediction = {
                id,
                marketId: data.marketId,
                outcomeId: data.outcomeId,
                outcomeName: data.outcomeName,
                userId: data.userId,
                amount: data.amount,
                createdAt: now,
                nftReceipt,
                status: 'active'
            };

            // Store the prediction and NFT receipt
            await Promise.all([
                kvStore.storeEntity('PREDICTION', id, prediction),
                kvStore.storeEntity('PREDICTION_NFT', nftReceipt.id, nftReceipt),
                kvStore.addToSet('USER_PREDICTIONS', data.userId, id),
                kvStore.addToSet('MARKET_PREDICTIONS', data.marketId, id),
                // Update market stats - passing userId to track unique participants
                marketStore.updateMarketStats(data.marketId, data.outcomeId, data.amount, data.userId)
            ]);

            return prediction;
        } catch (error) {
            console.error('Error creating prediction:', error);
            throw error;
        }
    },

    // Get all predictions for a user
    async getUserPredictions(userId: string): Promise<Prediction[]> {
        try {
            if (!userId) return [];

            // Get all prediction IDs for the user
            const predictionIds = await kvStore.getSetMembers('USER_PREDICTIONS', userId);

            if (predictionIds.length === 0) {
                return [];
            }

            // Get all predictions in parallel
            const predictions = await Promise.all(
                predictionIds.map(id => this.getPrediction(id))
            );

            // Filter out any undefined predictions (in case of data inconsistency)
            return predictions.filter(Boolean) as Prediction[];
        } catch (error) {
            console.error('Error getting user predictions:', error);
            return [];
        }
    },

    // Get all predictions for a market
    async getMarketPredictions(marketId: string): Promise<Prediction[]> {
        try {
            if (!marketId) return [];

            // Get all prediction IDs for the market
            const predictionIds = await kvStore.getSetMembers('MARKET_PREDICTIONS', marketId);

            if (predictionIds.length === 0) {
                return [];
            }

            // Get all predictions in parallel
            const predictions = await Promise.all(
                predictionIds.map(id => this.getPrediction(id))
            );

            // Filter out any undefined predictions (in case of data inconsistency)
            return predictions.filter(Boolean) as Prediction[];
        } catch (error) {
            console.error('Error getting market predictions:', error);
            return [];
        }
    },

    // Get a specific prediction by ID
    async getPrediction(id: string): Promise<Prediction | undefined> {
        try {
            if (!id) return undefined;

            const prediction = await kvStore.getEntity<Prediction>('PREDICTION', id);
            return prediction || undefined;
        } catch (error) {
            console.error(`Error getting prediction ${id}:`, error);
            return undefined;
        }
    },

    // Get a specific NFT receipt
    async getNFTReceipt(id: string): Promise<PredictionNFTReceipt | undefined> {
        try {
            if (!id) return undefined;

            const receipt = await kvStore.getEntity<PredictionNFTReceipt>('PREDICTION_NFT', id);
            return receipt || undefined;
        } catch (error) {
            console.error(`Error getting NFT receipt ${id}:`, error);
            return undefined;
        }
    },

    // Update prediction status
    async updatePredictionStatus(
        id: string,
        status: 'active' | 'won' | 'lost' | 'redeemed' | 'cancelled'
    ): Promise<Prediction | undefined> {
        try {
            const prediction = await this.getPrediction(id);
            if (!prediction) return undefined;

            const updatedPrediction = { ...prediction, status };

            // Store the updated prediction
            await kvStore.storeEntity('PREDICTION', id, updatedPrediction);

            return updatedPrediction;
        } catch (error) {
            console.error(`Error updating prediction ${id}:`, error);
            return undefined;
        }
    },

    // Generate a placeholder image URL for the NFT
    // In a real app, this would generate or reference an actual image
    generateNftImage(marketName: string, outcomeName: string, amount: number): string {
        // Create a data URI for a simple SVG image
        // This approach doesn't rely on external services and works in all environments
        const bgColor = "#1a2026";
        const textColor = "#ffffff";

        // Sanitize text to prevent SVG injection
        const sanitizedOutcome = outcomeName.replace(/[<>&"']/g, "");
        const sanitizedMarket = marketName.substring(0, 30).replace(/[<>&"']/g, "");

        const svg = `
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="400" fill="${bgColor}" />
            <text x="300" y="170" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="${textColor}">Prediction Receipt</text>
            <text x="300" y="210" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="${textColor}">${sanitizedOutcome}</text>
            <text x="300" y="250" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="${textColor}">${sanitizedMarket}</text>
            <text x="300" y="280" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="${textColor}">$${amount.toFixed(2)}</text>
        </svg>`;

        // Convert SVG to a data URI
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    },

    // Delete a prediction and its associated NFT receipt
    async deletePrediction(predictionId: string): Promise<boolean> {
        try {
            if (!predictionId) return false;

            // Get the prediction to retrieve its data
            const prediction = await this.getPrediction(predictionId);
            if (!prediction) return false;

            // Delete from the main predictions store
            await kvStore.deleteEntity('PREDICTION', predictionId);

            // Remove from user's predictions set
            await kvStore.removeFromSet('USER_PREDICTIONS', prediction.userId, predictionId);

            // Remove from market's predictions set
            await kvStore.removeFromSet('MARKET_PREDICTIONS', prediction.marketId, predictionId);

            // Delete the NFT receipt if it exists
            if (prediction.nftReceipt?.id) {
                await kvStore.deleteEntity('PREDICTION_NFT', prediction.nftReceipt.id);
            }

            return true;
        } catch (error) {
            console.error(`Error deleting prediction ${predictionId}:`, error);
            return false;
        }
    },

    /**
     * Update a prediction with new data
     */
    async updatePrediction(predictionId: string, data: Partial<Prediction>): Promise<Prediction | null> {
        try {
            // Get existing prediction
            const prediction = await this.getPrediction(predictionId);
            if (!prediction) {
                return null;
            }

            // Update prediction data
            const updatedPrediction: Prediction = {
                ...prediction,
                ...data,
            };

            // Store updated prediction
            await kvStore.storeEntity('PREDICTION', predictionId, updatedPrediction);

            return updatedPrediction;
        } catch (error) {
            console.error(`Error updating prediction ${predictionId}:`, error);
            return null;
        }
    },

    /**
     * Redeem a prediction after market resolution
     */
    async redeemPrediction(predictionId: string): Promise<{
        prediction: Prediction | null;
        payout: number;
    }> {
        try {
            // Get prediction
            const prediction = await this.getPrediction(predictionId);
            if (!prediction) {
                return { prediction: null, payout: 0 };
            }

            // Check if prediction is already redeemed
            if (prediction.status === 'redeemed') {
                return { prediction: prediction, payout: 0 };
            }

            // Check if prediction is eligible for redemption (must be won or lost)
            if (prediction.status !== 'won' && prediction.status !== 'lost') {
                return { prediction: prediction, payout: 0 };
            }

            // Calculate payout (winners get their calculated payout, losers get 0)
            const payout = prediction.status === 'won' ? prediction.potentialPayout || 0 : 0;

            // Update prediction as redeemed
            const updatedPrediction = await this.updatePrediction(predictionId, {
                status: 'redeemed',
                redeemedAt: new Date().toISOString()
            });

            return {
                prediction: updatedPrediction,
                payout: payout
            };
        } catch (error) {
            console.error(`Error redeeming prediction ${predictionId}:`, error);
            return { prediction: null, payout: 0 };
        }
    },

    /**
     * Get all predictions for a specific market with a specific status
     */
    async getMarketPredictionsByStatus(marketId: string, status: string): Promise<Prediction[]> {
        try {
            const predictions = await this.getMarketPredictions(marketId);
            return predictions.filter(p => p.status === status);
        } catch (error) {
            console.error(`Error getting market predictions by status for market ${marketId}:`, error);
            return [];
        }
    }
}; 