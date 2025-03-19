import { NextRequest, NextResponse } from 'next/server';
import { custodyStore } from 'wisdom-sdk';
import { revalidatePath } from 'next/cache';

// Allowed cron API key
const CRON_API_KEY = process.env.CRON_API_KEY;

/**
 * API route to handle batch processing of prediction transactions
 * This should be called by a cron job (e.g., Vercel Cron) hourly
 * It processes prediction transactions that are at least 15 minutes old
 * 
 * Required auth:
 * - Authorization header with the CRON_API_KEY
 * 
 * @param req Next.js request object
 * @returns Response with results of the batch process operation
 */
export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : '';

    // If CRON_API_KEY is not set, only allow in development
    if (CRON_API_KEY && apiKey !== CRON_API_KEY) {
      console.error('Invalid API key provided for batch predictions cron job');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the batch processing function
    const result = await custodyStore.batchProcessPredictions();

    // Log the results
    console.log('Batch predictions cron job results:', result);

    // Return the results
    return NextResponse.json(
      { 
        success: result.success, 
        processed: result.processed,
        batched: result.batched,
        errors: result.errors,
        txid: result.txid,
        timestamp: new Date().toISOString()
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error in batch-predictions cron job:', error);
    
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