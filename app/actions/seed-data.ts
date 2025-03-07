'use server'

import { Market, marketStore } from 'wisdom-sdk';

// Sample markets to create if no markets exist
const sampleMarkets = [
  {
    type: 'binary',
    name: 'Will Bitcoin reach $100,000 by the end of 2025?',
    description: 'This market will resolve to YES if the price of Bitcoin reaches or exceeds $100,000 USD on any major exchange before January 1, 2026. It will resolve to NO otherwise.',
    outcomes: [
      { id: 1, name: 'Yes' },
      { id: 2, name: 'No' }
    ],
    createdBy: 'system',
    category: 'crypto',
    endDate: new Date(2025, 11, 31).toISOString(), // December 31, 2025
    imageUrl: '',
  },
  {
    type: 'multiple',
    name: 'Which company will have the largest market cap by end of 2025?',
    description: 'This market will resolve to the outcome representing the company with the largest market capitalization as of December 31, 2025.',
    outcomes: [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Microsoft' },
      { id: 3, name: 'Google' },
      { id: 4, name: 'Nvidia' },
      { id: 5, name: 'Other' }
    ],
    createdBy: 'system',
    category: 'economics',
    endDate: new Date(2025, 11, 31).toISOString(), // December 31, 2025
    imageUrl: '',
  },
  {
    type: 'binary',
    name: 'Will humans land on Mars before 2030?',
    description: 'This market will resolve to YES if humans successfully land on the surface of Mars before January 1, 2030. It will resolve to NO otherwise.',
    outcomes: [
      { id: 1, name: 'Yes' },
      { id: 2, name: 'No' }
    ],
    createdBy: 'system',
    category: 'science',
    endDate: new Date(2029, 11, 31).toISOString(), // December 31, 2029
    imageUrl: '',
  },
  {
    type: 'multiple',
    name: 'Who will win the 2024 US Presidential Election?',
    description: 'This market will resolve to the candidate who is officially declared the winner of the 2024 US Presidential Election.',
    outcomes: [
      { id: 1, name: 'Kamala Harris' },
      { id: 2, name: 'Donald Trump' },
      { id: 3, name: 'Other' }
    ],
    createdBy: 'system',
    category: 'politics',
    endDate: new Date(2024, 10, 5).toISOString(), // November 5, 2024
    imageUrl: '',
  },
  {
    type: 'binary',
    name: 'Will Ethereum surpass Bitcoin in market cap before 2027?',
    description: 'This market will resolve to YES if the total market capitalization of Ethereum exceeds that of Bitcoin at any point before January 1, 2027. It will resolve to NO otherwise.',
    outcomes: [
      { id: 1, name: 'Yes' },
      { id: 2, name: 'No' }
    ],
    createdBy: 'system',
    category: 'crypto',
    endDate: new Date(2026, 11, 31).toISOString(), // December 31, 2026
    imageUrl: '',
  }
];

/**
 * Create sample markets if none exist
 */
export async function createSampleMarkets(): Promise<{ success: boolean, count: number }> {
  try {
    // Check if there are any existing markets
    const existingMarkets = await marketStore.getMarkets();

    if (existingMarkets.items.length > 0) {
      console.log(`Found ${existingMarkets.items.length} existing markets, skipping sample data creation`);
      return { success: true, count: 0 };
    }

    console.log("No existing markets found, creating sample data...");

    // Create sample markets
    const createdMarkets: Market[] = [];
    for (const marketData of sampleMarkets) {
      try {
        const market: Market = await marketStore.createMarket(marketData as any);
        createdMarkets.push(market);
        console.log(`Created sample market: ${market.name}`);
      } catch (error) {
        console.error(`Error creating sample market ${marketData.name}:`, error);
      }
    }

    // Build indexes for the new markets
    await marketStore.buildMarketIndexes();

    return {
      success: true,
      count: createdMarkets.length
    };
  } catch (error) {
    console.error("Error creating sample markets:", error);
    return { success: false, count: 0 };
  }
}