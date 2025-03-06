// Testing wisdom-sdk imports and functionality
import {
  marketStore,
  predictionStore,
  userStatsStore,
  userBalanceStore,
  type Market,
  type Prediction
} from 'wisdom-sdk';

// Log package exports to verify they exist
console.log('marketStore:', Object.keys(marketStore));
console.log('predictionStore:', Object.keys(predictionStore));
console.log('userStatsStore:', Object.keys(userStatsStore));
console.log('userBalanceStore:', Object.keys(userBalanceStore));

// Test function to get markets
async function testGetMarkets() {
  try {
    const markets = await marketStore.getMarkets();
    console.log('Markets count:', markets.length);
    return markets;
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
}

// Test function to export
export async function runTests() {
  console.log('Starting wisdom-sdk tests...');
  const markets = await testGetMarkets();
  console.log('Tests completed.');
  return { success: true, marketsCount: markets.length };
}