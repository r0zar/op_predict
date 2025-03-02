import { kv } from '@vercel/kv';

// Define the market data types
export type MarketOption = {
    id: number;
    name: string;
    votes?: number;
    percentage?: number;
};

export type Market = {
    id: string;
    type: 'binary' | 'multiple';
    name: string;
    description: string;
    outcomes: MarketOption[];
    createdAt: string;
    createdBy?: string;
    status: 'active' | 'resolved' | 'cancelled';
    participants?: number;
    poolAmount?: number;
};

// KV store keys
const MARKETS_KEY = 'markets';
const MARKET_IDS_KEY = 'market_ids';

// Market store with Vercel KV
export const marketStore = {
    // Get all markets
    async getMarkets(): Promise<Market[]> {
        try {
            // Get all market IDs
            const marketIds = await kv.smembers(MARKET_IDS_KEY) as string[];

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
            const market = await kv.get<Market>(`${MARKETS_KEY}:${id}`);
            return market || undefined;
        } catch (error) {
            console.error(`Error getting market ${id}:`, error);
            return undefined;
        }
    },

    // Create a new market
    async createMarket(marketData: Omit<Market, 'id' | 'createdAt' | 'status'>): Promise<Market> {
        try {
            const id = crypto.randomUUID();
            const newMarket: Market = {
                id,
                ...marketData,
                createdAt: new Date().toISOString(),
                status: 'active',
                participants: Math.floor(Math.random() * 50), // Random participants for demo
                poolAmount: Math.floor(Math.random() * 1000), // Random pool amount for demo
            };

            // Add random votes for demo purposes
            newMarket.outcomes = newMarket.outcomes.map(outcome => ({
                ...outcome,
                votes: Math.floor(Math.random() * 100),
            }));

            // Store the market
            await kv.set(`${MARKETS_KEY}:${id}`, JSON.stringify(newMarket));

            // Add the market ID to the set of all market IDs
            await kv.sadd(MARKET_IDS_KEY, id);

            return newMarket;
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
            await kv.set(`${MARKETS_KEY}:${id}`, JSON.stringify(updatedMarket));

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
            await kv.del(`${MARKETS_KEY}:${id}`);

            // Remove the market ID from the set of all market IDs
            await kv.srem(MARKET_IDS_KEY, id);

            return true;
        } catch (error) {
            console.error(`Error deleting market ${id}:`, error);
            return false;
        }
    },

    // Create sample markets for testing
    async createSampleMarkets(): Promise<void> {
        try {
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
            for (const marketData of sampleMarkets) {
                await this.createMarket(marketData);
            }
        } catch (error) {
            console.error('Error creating sample markets:', error);
        }
    },
}; 