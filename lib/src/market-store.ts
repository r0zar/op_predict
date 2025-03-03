import * as kvStore from "./kv-store.js";
import crypto from 'crypto';

// Define market types
export type MarketOutcome = {
    id: number;
    name: string;
    votes?: number;
    amount?: number; // Total amount staked on this outcome
    isWinner?: boolean;
};

export type Market = {
    id: string;
    type: 'binary' | 'multiple';
    name: string;
    description: string;
    createdBy: string;
    outcomes: MarketOutcome[];
    category: string;
    endDate: string;
    createdAt: string;
    updatedAt?: string;
    imageUrl?: string;
    participants?: number;
    poolAmount?: number;
    status: 'draft' | 'active' | 'resolved' | 'cancelled';
    resolvedOutcomeId?: number; // The ID of the winning outcome
    resolvedAt?: string; // When the market was resolved
    resolvedBy?: string; // Admin who resolved the market
    adminFee?: number; // 5% fee taken by admin on resolution
    remainingPot?: number; // Pot after admin fee
    totalWinningAmount?: number; // Total amount staked on winning outcome
};

// Market store with Vercel KV
export const marketStore = {
    // Get all markets
    async getMarkets(): Promise<Market[]> {
        try {
            // Get all market IDs
            const marketIds = await kvStore.getSetMembers('MARKET_IDS', '');

            if (marketIds.length === 0) {
                // If no markets exist, create sample markets
                await this.createSampleMarkets();
                return this.getMarkets();
            }

            // Get all markets in parallel
            const markets = await Promise.all(
                marketIds.map(id => this.getMarket(id))
            );

            // Filter out any undefined markets (in case of data inconsistency)
            return markets.filter(Boolean) as Market[];
        } catch (error) {
            console.error('Error getting markets:', error);
            return [];
        }
    },

    // Get a specific market by ID
    async getMarket(id: string): Promise<Market | undefined> {
        try {
            const market = await kvStore.getEntity<Market>('MARKET', id);
            return market || undefined;
        } catch (error) {
            console.error(`Error getting market ${id}:`, error);
            return undefined;
        }
    },

    // Create a new market
    async createMarket(
        data: {
            type: 'binary' | 'multiple';
            name: string;
            description: string;
            outcomes: { id: number; name: string; }[];
            createdBy: string;
            category: string;
            endDate: string;
            imageUrl?: string;
        }
    ): Promise<Market> {
        try {
            const id = crypto.randomUUID();
            const now = new Date().toISOString();

            const market: Market = {
                id,
                type: data.type,
                name: data.name,
                description: data.description,
                outcomes: data.outcomes,
                createdBy: data.createdBy,
                category: data.category,
                endDate: data.endDate,
                imageUrl: data.imageUrl,
                createdAt: now,
                participants: 0,
                poolAmount: 0,
                status: 'active'
            };

            // Store market by ID
            await kvStore.storeEntity('MARKET', id, market);

            // Add to market_ids set
            await kvStore.addToSet('MARKET_IDS', '', id);

            // Add to user's markets set
            if (data.createdBy) {
                await kvStore.addToSet('USER_MARKETS', data.createdBy, id);
            }

            return market;
        } catch (error) {
            console.error('Error creating market:', error);
            throw error;
        }
    },

    // Update a market
    async updateMarket(id: string, marketData: Partial<Market>): Promise<Market | undefined> {
        try {
            const market = await this.getMarket(id);
            if (!market) return undefined;

            const updatedMarket = { ...market, ...marketData };

            // Store the updated market
            await kvStore.storeEntity('MARKET', id, updatedMarket);

            return updatedMarket;
        } catch (error) {
            console.error(`Error updating market ${id}:`, error);
            return undefined;
        }
    },

    // Delete a market
    async deleteMarket(id: string): Promise<boolean> {
        try {
            // Delete the market
            await kvStore.deleteEntity('MARKET', id);

            // Remove the market ID from the set of all market IDs
            await kvStore.removeFromSet('MARKET_IDS', '', id);

            return true;
        } catch (error) {
            console.error(`Error deleting market ${id}:`, error);
            return false;
        }
    },

    // Update market stats when a prediction is made
    async updateMarketStats(marketId: string, outcomeId: number, amount: number, userId: string): Promise<Market | undefined> {
        const market = await this.getMarket(marketId);
        if (!market) return undefined;

        // Check if this user has already participated in this market
        const userParticipated = await kvStore.isSetMember(`MARKET_PARTICIPANTS`, marketId, userId);
        
        // Update the market stats - only increment participants if it's a new user
        if (!userParticipated) {
            market.participants = (market.participants || 0) + 1;
            // Add user to the set of participants for this market
            await kvStore.addToSet(`MARKET_PARTICIPANTS`, marketId, userId);
        }
        
        market.poolAmount = (market.poolAmount || 0) + amount;

        // Update the outcome stats
        const outcome = market.outcomes.find(o => o.id === outcomeId);
        if (outcome) {
            outcome.votes = (outcome.votes || 0) + 1;
            outcome.amount = (outcome.amount || 0) + amount;
        }

        // Save the updated market
        return this.updateMarket(marketId, market);
    },

    // Get related markets based on category and similarity
    async getRelatedMarkets(marketId: string, limit: number = 3): Promise<Market[]> {
        try {
            const market = await this.getMarket(marketId);
            if (!market) return [];

            // Get all markets
            const allMarkets = await this.getMarkets();

            // Filter out the current market and non-active markets
            const candidates = allMarkets.filter(m =>
                m.id !== marketId &&
                m.status === 'active' &&
                (
                    // Same category
                    m.category === market.category ||
                    // Or contains similar keywords in name/description
                    this.calculateSimilarity(m, market) > 0.3
                )
            );

            // Sort by similarity score
            const sortedMarkets = candidates.sort((a, b) =>
                this.calculateSimilarity(b, market) - this.calculateSimilarity(a, market)
            );

            return sortedMarkets.slice(0, limit);
        } catch (error) {
            console.error('Error getting related markets:', error);
            return [];
        }
    },

    // Calculate similarity score between two markets
    calculateSimilarity(market1: Market, market2: Market): number {
        const text1 = `${market1.name} ${market1.description}`.toLowerCase();
        const text2 = `${market2.name} ${market2.description}`.toLowerCase();

        // Get unique words
        const words1 = new Set(text1.split(/\W+/));
        const words2 = new Set(text2.split(/\W+/));

        // Calculate intersection
        const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));

        // Calculate Jaccard similarity
        const union = new Set(Array.from(words1).concat(Array.from(words2)));
        return intersection.size / union.size;
    },

    // Create sample markets for testing
    async createSampleMarkets(): Promise<void> {
        try {
            console.log('Creating sample markets...');

            const sampleMarkets = [
                {
                    type: 'binary' as const,
                    name: 'Will Bitcoin reach $100,000 by the end of 2024?',
                    description: 'This market will resolve to "Yes" if the price of Bitcoin reaches or exceeds $100,000 USD on any major exchange before January 1, 2025. It will resolve to "No" otherwise.',
                    outcomes: [
                        { id: 1, name: 'Yes' },
                        { id: 2, name: 'No' },
                    ],
                },
                {
                    type: 'multiple' as const,
                    name: 'Which country will win the 2024 Summer Olympics medal count?',
                    description: 'This market will resolve based on the total medal count (gold, silver, and bronze) at the conclusion of the 2024 Summer Olympics in Paris.',
                    outcomes: [
                        { id: 1, name: 'United States' },
                        { id: 2, name: 'China' },
                        { id: 3, name: 'Japan' },
                        { id: 4, name: 'Russia' },
                        { id: 5, name: 'Other' },
                    ],
                },
                {
                    type: 'binary' as const,
                    name: 'Will SpaceX successfully land humans on Mars by 2030?',
                    description: 'This market resolves to "Yes" if SpaceX successfully lands at least one human on the surface of Mars before January 1, 2031. The landing must be officially confirmed by SpaceX and independent space agencies.',
                    outcomes: [
                        { id: 1, name: 'Yes' },
                        { id: 2, name: 'No' },
                    ],
                },
            ];

            // Create each sample market
            console.log(`Creating ${sampleMarkets.length} sample markets...`);

            for (const marketData of sampleMarkets) {
                try {
                    const market = await this.createMarket({
                        ...marketData,
                        createdBy: 'admin',
                        category: 'general',
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    });
                    console.log(`Created sample market: ${market.id} - ${market.name}`);
                } catch (marketError) {
                    console.error(`Error creating sample market: ${marketData.name}`, marketError);
                }
            }

            console.log('Sample markets creation completed');
        } catch (error) {
            console.error('Error creating sample markets:', error);
        }
    },
}; 