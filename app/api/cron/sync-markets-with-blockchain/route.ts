import { NextRequest, NextResponse } from 'next/server';
import { marketStore } from 'wisdom-sdk';
import { revalidatePath } from 'next/cache';

// Allowed cron API key
const CRON_API_KEY = process.env.CRON_API_KEY;

/**
 * API route to handle synchronization of markets with blockchain data
 * This should be called by a cron job (e.g., Vercel Cron) every 30 minutes
 * It updates the status and outcome data of markets based on their blockchain state
 * 
 * Required auth:
 * - Authorization header with the CRON_API_KEY
 * 
 * @param req Next.js request object
 * @returns Response with results of the synchronization operation
 */
export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : '';

    // If CRON_API_KEY is not set, only allow in development
    if (CRON_API_KEY && apiKey !== CRON_API_KEY) {
      console.error('Invalid API key provided for market blockchain sync cron job');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the sync function from market store
    const result = await marketStore.syncMarketsWithBlockchain();

    // Log the results
    console.log('Market blockchain sync cron job results:', {
      processed: result.processed,
      updated: result.updated,
      errors: result.errors
    });

    // Revalidate relevant paths if any markets were updated
    if (result.updated > 0) {
      revalidatePath('/markets');
      revalidatePath('/admin');
      revalidatePath('/');
    }

    // Return the results
    return NextResponse.json(
      { 
        success: result.success, 
        processed: result.processed,
        updated: result.updated,
        errors: result.errors,
        timestamp: new Date().toISOString()
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error in market-blockchain-sync cron job:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}