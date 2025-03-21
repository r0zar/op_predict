import { NextRequest, NextResponse } from 'next/server';
import { marketStore } from 'wisdom-sdk';
import { revalidatePath } from 'next/cache';
import { kv } from '@vercel/kv';

// Allowed cron API key
const CRON_SECRET = process.env.CRON_SECRET;

// Polymarket API configuration
const POLYMARKET_API_URL = process.env.POLYMARKET_API_URL || 'https://clob.polymarket.com';

// Configuration for Bitcoin and Stacks markets
// This could be moved to a database or environment variables
const POLYMARKET_CONFIG = {
  // Enable/disable the sync feature
  enabled: process.env.POLYMARKET_SYNC_ENABLED === 'true',

  // Categories to filter markets by
  categories: ['crypto', 'bitcoin', 'blockchain', 'stacks'],

  // Keywords to match in market descriptions/questions
  keywords: ['bitcoin', 'btc', 'stacks', 'stx', 'crypto', 'blockchain'],

  // Maximum number of markets to create in a single run
  maxMarketsPerRun: Number(process.env.POLYMARKET_MAX_MARKETS_PER_RUN || '5'),

  // Minimum market end date in days from now
  minEndDateDays: Number(process.env.POLYMARKET_MIN_END_DATE_DAYS || '1'),

  // Maximum market end date in days from now
  maxEndDateDays: Number(process.env.POLYMARKET_MAX_END_DATE_DAYS || '90'),

  // Default category for created markets
  defaultCategory: process.env.POLYMARKET_DEFAULT_CATEGORY || 'crypto',

  // Default user ID for market creator
  defaultCreatorId: process.env.POLYMARKET_DEFAULT_CREATOR_ID || 'system',

  // How to handle duplicates ('skip' or 'update')
  duplicateHandling: process.env.POLYMARKET_DUPLICATE_HANDLING || 'skip',

  // Maximum number of pages to fetch per run
  maxPagesPerRun: Number(process.env.POLYMARKET_MAX_PAGES_PER_RUN || '50'),
};

// KV Keys for tracking pagination state
const KV_KEYS = {
  LAST_CURSOR: 'POLYMARKET_LAST_CURSOR',
  LAST_UPDATED: 'POLYMARKET_LAST_UPDATED',
  SYNC_STATUS: 'POLYMARKET_SYNC_STATUS',
  PROCESSED_MARKETS: 'POLYMARKET_PROCESSED_MARKETS'
};

// Interface for Polymarket API response
interface PolymarketApiResponse {
  limit: number;
  count: number;
  next_cursor: string;
  data: PolymarketMarket[];
}

// Interface for Polymarket market
interface PolymarketMarket {
  condition_id: string;
  question_id: string;
  tokens: {
    token_id: string;
    outcome: string;
  }[];
  description: string;
  tags: string[];
  end_date_iso: string;
  question: string;
  market_slug: string;
  active: boolean;
  closed: boolean;
  icon?: string;
}

// Interface for sync status
interface SyncStatus {
  lastRun: string;
  inProgress: boolean;
  currentPage: number;
  totalPages: number;
  marketsProcessed: number;
  marketsCreated: number;
  marketsSkipped: number;
  marketsUpdated: number;
  errors: number;
  lastError?: string;
}

/**
 * Initialize or get the current sync status
 */
async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const status = await kv.get(KV_KEYS.SYNC_STATUS);
    if (status) {
      return status as SyncStatus;
    }
  } catch (error) {
    console.warn('Error getting sync status from KV:', error);
  }

  // Default initial status
  return {
    lastRun: new Date().toISOString(),
    inProgress: false,
    currentPage: 0,
    totalPages: 0,
    marketsProcessed: 0,
    marketsCreated: 0,
    marketsSkipped: 0,
    marketsUpdated: 0,
    errors: 0
  };
}

/**
 * Update the sync status in KV store
 */
async function updateSyncStatus(updates: Partial<SyncStatus>): Promise<void> {
  try {
    const currentStatus = await getSyncStatus();
    const newStatus = { ...currentStatus, ...updates };
    await kv.set(KV_KEYS.SYNC_STATUS, newStatus);
  } catch (error) {
    console.error('Error updating sync status in KV:', error);
  }
}

/**
 * Checks if a market contains any of the configured keywords
 */
function containsKeywords(market: PolymarketMarket): boolean {
  const textToSearch = [
    market.question.toLowerCase(),
    market.description.toLowerCase(),
    market.tags.join(',').toLowerCase()
  ].join(' ');

  return POLYMARKET_CONFIG.keywords.some(keyword =>
    textToSearch.includes(keyword.toLowerCase())
  );
}

/**
 * Checks if market end date is within the configured range
 */
function isEndDateValid(endDateIso: string): boolean {
  const endDate = new Date(endDateIso);
  const now = new Date();

  // Convert configured days to milliseconds
  const minEndDateMs = now.getTime() + (POLYMARKET_CONFIG.minEndDateDays * 24 * 60 * 60 * 1000);
  const maxEndDateMs = now.getTime() + (POLYMARKET_CONFIG.maxEndDateDays * 24 * 60 * 60 * 1000);

  return endDate.getTime() >= minEndDateMs && endDate.getTime() <= maxEndDateMs;
}

/**
 * Fetches a page of markets from Polymarket API
 */
async function fetchPolymarketPage(cursor = ''): Promise<PolymarketApiResponse> {
  try {
    const url = `${POLYMARKET_API_URL}/markets${cursor ? `?next_cursor=${cursor}` : ''}`;
    console.log(`Fetching Polymarket page with cursor: ${cursor || 'start'}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Polymarket API:', error);
    throw error;
  }
}

/**
 * Fetches multiple pages of markets from Polymarket API
 * Uses a stored cursor to continue from where we left off previously
 */
async function fetchPolymarketMarkets(): Promise<{
  markets: PolymarketMarket[],
  nextCursor: string,
  hasMorePages: boolean
}> {
  try {
    // Get the last cursor from KV (if any)
    let cursor = '';
    try {
      const savedCursor = await kv.get(KV_KEYS.LAST_CURSOR);
      if (savedCursor) {
        console.log(`Resuming from saved cursor: ${savedCursor}`);
        cursor = String(savedCursor);
      }
    } catch (error) {
      console.warn('Error retrieving last cursor from KV:', error);
    }

    // Get the current sync status
    const syncStatus = await getSyncStatus();

    // Initialize response variables
    let allMarkets: PolymarketMarket[] = [];
    let nextCursor = cursor;
    let pageCount = 0;
    let hasMorePages = true;

    // Update sync status to indicate we're starting
    await updateSyncStatus({
      inProgress: true,
      currentPage: syncStatus.currentPage + 1,
      lastRun: new Date().toISOString()
    });

    // Fetch up to maxPagesPerRun pages
    while (pageCount < POLYMARKET_CONFIG.maxPagesPerRun) {
      // Fetch a page of markets
      const pageData = await fetchPolymarketPage(nextCursor);

      // Add markets from this page to our collection
      allMarkets = allMarkets.concat(pageData.data);

      // Update the cursor for the next page
      nextCursor = pageData.next_cursor;

      // Save the current cursor to KV
      await kv.set(KV_KEYS.LAST_CURSOR, nextCursor);
      await kv.set(KV_KEYS.LAST_UPDATED, new Date().toISOString());

      // Update sync status with progress
      await updateSyncStatus({
        currentPage: syncStatus.currentPage + pageCount + 1,
        marketsProcessed: syncStatus.marketsProcessed + pageData.data.length
      });

      // Check if we've reached the end of the pagination
      if (nextCursor === 'LTE=' || !nextCursor) {
        console.log('Reached the end of Polymarket pages');

        // Reset the cursor since we've processed all markets
        await kv.set(KV_KEYS.LAST_CURSOR, '');

        hasMorePages = false;
        break;
      }

      pageCount++;

      // Add a small delay between requests to be kind to the API
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    console.log(`Fetched ${allMarkets.length} markets from Polymarket in ${pageCount + 1} pages`);

    return {
      markets: allMarkets,
      nextCursor,
      hasMorePages
    };
  } catch (error) {
    // Update sync status to indicate error
    await updateSyncStatus({
      inProgress: false,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    });

    console.error('Error fetching from Polymarket API:', error);
    throw error;
  }
}

/**
 * Converts a Polymarket market to op_predict market format
 */
function convertToOpPredictMarket(polyMarket: PolymarketMarket): any {
  // Map the outcomes from Polymarket format to op_predict format
  const outcomes = polyMarket.tokens.map((token, index) => ({
    id: index, // Use sequential IDs starting from 0
    name: token.outcome
  }));

  // Build a market object that matches the op_predict structure
  return {
    type: 'binary', // Polymarket markets are binary
    name: polyMarket.question,
    description: polyMarket.description || `${polyMarket.question}`,
    outcomes,
    createdBy: POLYMARKET_CONFIG.defaultCreatorId,
    category: POLYMARKET_CONFIG.defaultCategory,
    endDate: polyMarket.end_date_iso,
    imageUrl: polyMarket.icon || '',
    externalId: polyMarket.condition_id, // Store the original Polymarket ID
    externalSource: 'polymarket',
    externalUrl: `https://polymarket.com/${polyMarket.market_slug}`,
  };
}

/**
 * Check if market already exists in op_predict
 */
async function marketExists(externalId: string): Promise<boolean> {
  try {
    // Check processed markets set first for better performance
    try {
      const processedMarkets = await kv.get<string[]>(KV_KEYS.PROCESSED_MARKETS);
      if (processedMarkets && Array.isArray(processedMarkets)) {
        if (processedMarkets.includes(externalId)) {
          return true;
        }
      }
    } catch (error) {
      console.warn('Error checking processed markets in KV:', error);
    }

    // Fallback to database search
    const existingMarkets = await marketStore.searchMarkets(`externalId:${externalId}`, {
      limit: 1,
    });

    const exists = existingMarkets.items.length > 0;

    // If the market exists, add to our processed markets set
    if (exists) {
      try {
        const processedMarkets = await kv.get<string[]>(KV_KEYS.PROCESSED_MARKETS) || [];
        if (!processedMarkets.includes(externalId)) {
          processedMarkets.push(externalId);
          await kv.set(KV_KEYS.PROCESSED_MARKETS, processedMarkets);
        }
      } catch (error) {
        console.warn('Error updating processed markets in KV:', error);
      }
    }

    return exists;
  } catch (error) {
    console.error('Error checking if market exists:', error);
    return false;
  }
}

/**
 * API route to handle synchronized market creation from Polymarket
 * This should be called by a cron job (e.g., Vercel Cron)
 * 
 * Required auth:
 * - Authorization header with the CRON_SECRET
 * 
 * @param req Next.js request object
 * @returns Response with results of the sync operation
 */
export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : '';

    // If CRON_SECRET is not set, only allow in development
    if (CRON_SECRET && apiKey !== CRON_SECRET) {
      console.error('Invalid API key provided for Polymarket sync cron job');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the feature is enabled
    if (!POLYMARKET_CONFIG.enabled) {
      console.log('Polymarket sync is disabled. Set POLYMARKET_SYNC_ENABLED=true to enable.');
      return NextResponse.json(
        { success: false, error: 'Feature disabled' },
        { status: 200 }
      );
    }

    console.log('Starting Polymarket sync...');

    // Get current sync status
    const syncStatus = await getSyncStatus();

    // Check if a sync is already in progress (and not stale)
    if (syncStatus.inProgress) {
      const lastRunTime = new Date(syncStatus.lastRun).getTime();
      const currentTime = new Date().getTime();
      const timeDiffMinutes = (currentTime - lastRunTime) / (1000 * 60);

      // If the last run was less than 15 minutes ago, consider it still in progress
      if (timeDiffMinutes < 15) {
        return NextResponse.json(
          {
            success: false,
            error: 'Sync already in progress',
            syncStatus
          },
          { status: 200 }
        );
      }

      // If it's been more than 15 minutes, assume the previous sync failed and reset
      console.log('Previous sync appears to be stale. Resuming from last state.');
    }

    // Fetch markets from Polymarket
    let polymarketData;
    try {
      polymarketData = await fetchPolymarketMarkets();
    } catch (error) {
      // Update sync status to indicate error
      await updateSyncStatus({
        inProgress: false,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      });

      console.error('Failed to fetch from Polymarket API:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch from Polymarket API',
          syncStatus: await getSyncStatus()
        },
        { status: 500 }
      );
    }

    console.log(`Retrieved ${polymarketData.markets.length} markets from Polymarket`);

    // Filter markets by our criteria
    const eligibleMarkets = polymarketData.markets.filter(market =>
      market.active &&
      !market.closed &&
      containsKeywords(market) &&
      isEndDateValid(market.end_date_iso) &&
      market.tokens.length === 2 // Only binary markets
    );

    console.log(`Found ${eligibleMarkets.length} eligible markets out of ${polymarketData.markets.length} total markets`);

    // Limit the number of markets to create
    const marketsToCreate = eligibleMarkets.slice(0, POLYMARKET_CONFIG.maxMarketsPerRun);

    // Create markets in op_predict
    const results = {
      total: marketsToCreate.length,
      created: 0,
      skipped: 0,
      updated: 0,
      errors: 0,
      hasMorePages: polymarketData.hasMorePages,
      nextCursor: polymarketData.nextCursor,
      details: [] as any[]
    };

    for (const polyMarket of marketsToCreate) {
      try {
        // Check if this market already exists
        const exists = await marketExists(polyMarket.condition_id);

        if (exists) {
          if (POLYMARKET_CONFIG.duplicateHandling === 'skip') {
            console.log(`Skipping existing market: ${polyMarket.question}`);
            results.skipped++;
            results.details.push({
              externalId: polyMarket.condition_id,
              name: polyMarket.question,
              status: 'skipped',
              reason: 'Market already exists'
            });
            continue;
          } else if (POLYMARKET_CONFIG.duplicateHandling === 'update') {
            // Logic for updating existing markets could be added here
            results.updated++;
            results.details.push({
              externalId: polyMarket.condition_id,
              name: polyMarket.question,
              status: 'updated'
            });
            continue;
          }
        }

        // Convert to op_predict format
        const opPredictMarket = convertToOpPredictMarket(polyMarket);

        // Create the market
        const newMarket = await marketStore.createMarket(opPredictMarket);

        // Add a small delay between requests to be kind to the API
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`Created new market: ${newMarket.name} (ID: ${newMarket.id})`);

        // Add this market ID to our processed markets set
        try {
          const processedMarkets = await kv.get<string[]>(KV_KEYS.PROCESSED_MARKETS) || [];
          if (!processedMarkets.includes(polyMarket.condition_id)) {
            processedMarkets.push(polyMarket.condition_id);
            await kv.set(KV_KEYS.PROCESSED_MARKETS, processedMarkets);
          }
        } catch (error) {
          console.warn('Error updating processed markets in KV:', error);
        }

        results.created++;
        results.details.push({
          externalId: polyMarket.condition_id,
          internalId: newMarket.id,
          name: newMarket.name,
          status: 'created'
        });
      } catch (error) {
        console.error(`Failed to create market: ${polyMarket.question}`, error);
        results.errors++;
        results.details.push({
          externalId: polyMarket.condition_id,
          name: polyMarket.question,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Revalidate relevant pages if any markets were created
    if (results.created > 0 || results.updated > 0) {
      revalidatePath('/markets');
      revalidatePath('/explore');
    }

    // Update sync status with results
    await updateSyncStatus({
      inProgress: results.hasMorePages, // If there are more pages, we're still in progress
      marketsCreated: syncStatus.marketsCreated + results.created,
      marketsSkipped: syncStatus.marketsSkipped + results.skipped,
      marketsUpdated: syncStatus.marketsUpdated + results.updated,
      errors: syncStatus.errors + results.errors,
      lastRun: new Date().toISOString()
    });

    // If we've processed all pages, reset the cursor
    if (!results.hasMorePages) {
      await kv.set(KV_KEYS.LAST_CURSOR, '');
    }

    // Return the results
    return NextResponse.json(
      {
        success: true,
        ...results,
        syncStatus: await getSyncStatus(),
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    // Update sync status to indicate error
    await updateSyncStatus({
      inProgress: false,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    });

    console.error('Error in Polymarket sync cron job:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        syncStatus: await getSyncStatus(),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}