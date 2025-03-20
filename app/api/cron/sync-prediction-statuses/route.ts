import { NextRequest, NextResponse } from 'next/server';
import { custodyStore } from 'wisdom-sdk';
import { revalidatePath } from 'next/cache';

// Allowed cron API key
const CRON_API_KEY = process.env.CRON_API_KEY;

/**
 * API route to handle synchronization of prediction statuses with blockchain data
 * This should be called by a cron job (e.g., Vercel Cron) every 15 minutes
 * It updates the status of submitted predictions based on their blockchain state
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
      console.error('Invalid API key provided for prediction status sync cron job');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the sync function from custody store
    const result = await custodyStore.syncSubmittedPredictionStatuses();

    // Log the results
    console.log('Prediction status sync cron job results:', result);

    // Revalidate relevant paths
    if (result.updated > 0) {
      revalidatePath('/portfolio');
      revalidatePath('/markets');
      revalidatePath('/admin');
    }

    // Return the results
    return NextResponse.json(
      { 
        success: result.success, 
        updated: result.updated,
        errors: result.errors,
        details: result.details,
        timestamp: new Date().toISOString()
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error in prediction-status-sync cron job:', error);
    
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