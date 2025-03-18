import { NextRequest, NextResponse } from 'next/server';
import { marketStore } from 'wisdom-sdk';
import { revalidatePath } from 'next/cache';

// Allowed cron API key
const CRON_API_KEY = process.env.CRON_API_KEY;

/**
 * API route to handle automated closing of expired markets.
 * This should be called by a cron job (e.g., Vercel Cron).
 * 
 * Required auth:
 * - Authorization header with the CRON_API_KEY
 * 
 * @param req Next.js request object
 * @returns Response with results of the auto-close operation
 */
export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : '';

    // If CRON_API_KEY is not set, only allow in development
    if (CRON_API_KEY && apiKey !== CRON_API_KEY) {
      console.error('Invalid API key provided for cron job');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call the auto-close function
    const result = await marketStore.autoCloseExpiredMarkets();

    // Log the results
    console.log('Auto-close markets cron job results:', result);

    // Revalidate relevant pages if any markets were closed
    if (result.closed > 0) {
      // Revalidate key pages to reflect updated market statuses
      revalidatePath('/markets');
      revalidatePath('/explore');
      revalidatePath('/portfolio');
    }

    // Return the results
    return NextResponse.json(
      { 
        success: true, 
        processed: result.processed,
        closed: result.closed,
        errors: result.errors,
        onChainSucceeded: result.onChainSucceeded,
        onChainFailed: result.onChainFailed,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in close-expired-markets cron job:', error);
    
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