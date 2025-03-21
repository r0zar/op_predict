/**
 * Test script for the Polymarket integration
 * 
 * Usage:
 * npx tsx scripts/test-polymarket-sync.ts            # Run normal sync
 * npx tsx scripts/test-polymarket-sync.ts --reset    # Reset KV state before sync
 * npx tsx scripts/test-polymarket-sync.ts --force    # Force reset a stuck "in progress" sync
 * 
 * Required environment variables (from .env.local file):
 * KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN - Vercel KV credentials
 * 
 * Optional environment variables:
 * POLYMARKET_API_URL - Override the API URL
 * CRON_SECRET - Authentication secret
 * RESET_KV - Set to "true" to reset KV state before testing
 */

import { loadEnvConfig } from '@next/env';
import { kv } from '@vercel/kv';
import path from 'path';

// Load environment variables from .env.local
const projectDir = path.resolve(__dirname, '..');
loadEnvConfig(projectDir, true, console); // true forces reload

// Verify required environment variables
const requiredEnvVars = [
  'KV_URL',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'KV_REST_API_READ_ONLY_TOKEN'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing environment variable: ${envVar}`);
  }
});

// KV Keys used by the integration
const KV_KEYS = {
  LAST_CURSOR: 'POLYMARKET_LAST_CURSOR',
  LAST_UPDATED: 'POLYMARKET_LAST_UPDATED',
  SYNC_STATUS: 'POLYMARKET_SYNC_STATUS',
  PROCESSED_MARKETS: 'POLYMARKET_PROCESSED_MARKETS'
};

/**
 * Reset KV state if requested
 */
async function resetKvState(): Promise<void> {
  if (process.env.RESET_KV === 'true' || process.argv.includes('--reset')) {
    console.log('Resetting KV state...');
    try {
      await kv.set(KV_KEYS.LAST_CURSOR, '');
      await kv.set(KV_KEYS.SYNC_STATUS, {
        lastRun: new Date().toISOString(),
        inProgress: false,
        currentPage: 0,
        totalPages: 0,
        marketsProcessed: 0,
        marketsCreated: 0,
        marketsSkipped: 0,
        marketsUpdated: 0,
        errors: 0
      });
      console.log('KV state reset successfully');
    } catch (error) {
      console.error('Error resetting KV state:', error);
    }
  }
}

/**
 * Force reset the sync in progress state to allow new runs
 */
async function resetSyncInProgress(): Promise<void> {
  if (process.argv.includes('--force')) {
    console.log('Forcing reset of "in progress" status...');
    try {
      const syncStatus = await kv.get(KV_KEYS.SYNC_STATUS);
      if (syncStatus) {
        const updatedStatus = { ...syncStatus, inProgress: false };
        await kv.set(KV_KEYS.SYNC_STATUS, updatedStatus);
        console.log('Sync "in progress" status reset successfully');
      }
    } catch (error) {
      console.error('Error resetting sync in progress state:', error);
    }
  }
}

/**
 * Display current KV state
 */
async function displayKvState(): Promise<void> {
  try {
    const cursor = await kv.get(KV_KEYS.LAST_CURSOR);
    const lastUpdated = await kv.get(KV_KEYS.LAST_UPDATED);
    const syncStatus = await kv.get(KV_KEYS.SYNC_STATUS);
    const processedCount = (await kv.get<string[]>(KV_KEYS.PROCESSED_MARKETS) || []).length;

    console.log('\nCurrent KV State:');
    console.log(`- Last cursor: ${cursor || '(empty)'}`);
    console.log(`- Last updated: ${lastUpdated || '(never)'}`);
    console.log(`- Processed markets: ${processedCount}`);
    console.log('- Sync status:');
    console.log(JSON.stringify(syncStatus, null, 2));
  } catch (error) {
    console.error('Error displaying KV state:', error);
  }
}

/**
 * Test the Polymarket sync endpoint
 */
async function testPolymarketSync() {
  try {
    // Reset KV state if requested
    await resetKvState();

    // Force reset sync in progress state if requested
    await resetSyncInProgress();

    // Display current KV state before sync
    await displayKvState();

    console.log('\nTesting Polymarket sync...');

    // Make a request to the local API endpoint
    const url = 'http://localhost:3000/api/cron/sync-polymarket';

    // Use the CRON_SECRET from environment if available
    const CRON_SECRET = process.env.CRON_SECRET || 'test-secret';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    // Parse the response
    const data = await response.json();

    // Log the results
    console.log('\nPolymarket sync test results:');

    if (data.success) {
      console.log(`Success! Run summary:`);
      console.log(`- Created: ${data.created}`);
      console.log(`- Skipped: ${data.skipped}`);
      console.log(`- Updated: ${data.updated}`);
      console.log(`- Errors: ${data.errors}`);
      console.log(`- Has more pages: ${data.hasMorePages}`);

      if (data.details && data.details.length > 0) {
        console.log('\nProcessed markets:');
        data.details.forEach((detail: any, index: number) => {
          console.log(`${index + 1}. ${detail.name} (${detail.status})`);
        });
      }
    } else {
      console.error(`Failed: ${data.error}`);
      if (data.syncStatus) {
        console.log('\nSync status from failed run:');
        console.log(JSON.stringify(data.syncStatus, null, 2));
      }
    }

    // Display updated KV state after sync
    console.log('\nUpdated KV state after sync:');
    await displayKvState();
  } catch (error) {
    console.error('Error running Polymarket sync test:', error);
  }
}

// Run the test
testPolymarketSync();