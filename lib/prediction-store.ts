import { kv } from '@vercel/kv';
import crypto from 'crypto';

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
    status: 'active' | 'won' | 'lost' | 'cancelled';
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

// KV store keys
const PREDICTIONS_KEY = 'predictions';
const USER_PREDICTIONS_KEY = 'user_predictions';
const MARKET_PREDICTIONS_KEY = 'market_predictions';
const PREDICTION_NFT_KEY = 'prediction_nfts';

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

            // Create the prediction with NFT receipt
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

            // Store prediction
            await kv.set(`${PREDICTIONS_KEY}:${id}`, JSON.stringify(prediction));

            // Add to user's predictions set
            await kv.sadd(`${USER_PREDICTIONS_KEY}:${data.userId}`, id);

            // Add to market's predictions set
            await kv.sadd(`${MARKET_PREDICTIONS_KEY}:${data.marketId}`, id);

            // Store NFT receipt
            await kv.set(`${PREDICTION_NFT_KEY}:${nftReceipt.id}`, JSON.stringify(nftReceipt));

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
            const predictionIds = await kv.smembers(`${USER_PREDICTIONS_KEY}:${userId}`) as string[];

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
            const predictionIds = await kv.smembers(`${MARKET_PREDICTIONS_KEY}:${marketId}`) as string[];

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

            const prediction = await kv.get<Prediction>(`${PREDICTIONS_KEY}:${id}`);
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

            const receipt = await kv.get<PredictionNFTReceipt>(`${PREDICTION_NFT_KEY}:${id}`);
            return receipt || undefined;
        } catch (error) {
            console.error(`Error getting NFT receipt ${id}:`, error);
            return undefined;
        }
    },

    // Update prediction status
    async updatePredictionStatus(
        id: string,
        status: 'active' | 'won' | 'lost' | 'cancelled'
    ): Promise<Prediction | undefined> {
        try {
            const prediction = await this.getPrediction(id);
            if (!prediction) return undefined;

            const updatedPrediction = { ...prediction, status };

            // Store the updated prediction
            await kv.set(`${PREDICTIONS_KEY}:${id}`, JSON.stringify(updatedPrediction));

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
            await kv.del(`${PREDICTIONS_KEY}:${predictionId}`);

            // Remove from user's predictions set
            await kv.srem(`${USER_PREDICTIONS_KEY}:${prediction.userId}`, predictionId);

            // Remove from market's predictions set
            await kv.srem(`${MARKET_PREDICTIONS_KEY}:${prediction.marketId}`, predictionId);

            // Delete the NFT receipt if it exists
            if (prediction.nftReceipt?.id) {
                await kv.del(`${PREDICTION_NFT_KEY}:${prediction.nftReceipt.id}`);
            }

            return true;
        } catch (error) {
            console.error(`Error deleting prediction ${predictionId}:`, error);
            return false;
        }
    }
}; 