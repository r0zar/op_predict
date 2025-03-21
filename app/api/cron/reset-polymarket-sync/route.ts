import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { isAdmin } from '@/lib/user-utils';

// Allowed cron API key
const CRON_SECRET = process.env.CRON_SECRET;

// KV Keys for tracking pagination state (must match those in sync-polymarket/route.ts)
const KV_KEYS = {
  LAST_CURSOR: 'POLYMARKET_LAST_CURSOR',
  LAST_UPDATED: 'POLYMARKET_LAST_UPDATED',
  SYNC_STATUS: 'POLYMARKET_SYNC_STATUS',
  PROCESSED_MARKETS: 'POLYMARKET_PROCESSED_MARKETS'
};

/**
 * API route to reset Polymarket sync state
 * This allows administrators to reset a stuck sync process
 * 
 * Required auth:
 * - Authorization header with the CRON_SECRET OR
 * - A valid admin user ID in the request body
 */
export async function POST(req: NextRequest) {
  try {
    // Check authorization - either CRON_SECRET or admin user
    const authHeader = req.headers.get('authorization');
    const apiKey = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    // Parse the request body for user ID
    const data = await req.json();
    const userId = data.userId;
    const force = data.force === true;
    
    let authorized = false;
    
    // Check if authorized via API key
    if (CRON_SECRET && apiKey === CRON_SECRET) {
      authorized = true;
    }
    
    // Check if authorized via admin user
    if (!authorized && userId) {
      authorized = await isAdmin(userId);
    }
    
    if (!authorized) {
      console.error('Unauthorized attempt to reset Polymarket sync');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Resetting Polymarket sync state...');
    
    // Get current sync status first
    const currentStatus = await kv.get(KV_KEYS.SYNC_STATUS);
    
    // Reset the sync status
    await kv.set(KV_KEYS.SYNC_STATUS, {
      lastRun: new Date().toISOString(),
      inProgress: false,
      currentPage: 0,
      totalPages: 0,
      marketsProcessed: currentStatus ? (currentStatus as any).marketsProcessed || 0 : 0,
      marketsCreated: currentStatus ? (currentStatus as any).marketsCreated || 0 : 0,
      marketsSkipped: currentStatus ? (currentStatus as any).marketsSkipped || 0 : 0,
      marketsUpdated: currentStatus ? (currentStatus as any).marketsUpdated || 0 : 0,
      errors: currentStatus ? (currentStatus as any).errors || 0 : 0
    });
    
    // Reset the cursor if forced
    if (force) {
      await kv.set(KV_KEYS.LAST_CURSOR, '');
      await kv.set(KV_KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('Reset Polymarket sync cursor to beginning');
    }
    
    return NextResponse.json(
      {
        success: true,
        message: `Polymarket sync state reset successfully${force ? ' with cursor reset' : ''}`,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting Polymarket sync state:', error);
    
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