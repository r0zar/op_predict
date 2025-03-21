import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/utils';

// GET is not allowed for this endpoint
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

/**
 * Secure endpoint that returns the CRON_SECRET to authorized admins
 * This allows the admin UI to trigger cron jobs manually
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const user = await currentUser();
    
    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is an admin
    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    }
    
    // Get the CRON_SECRET from environment
    const CRON_SECRET = process.env.CRON_SECRET;
    
    // If CRON_SECRET is not set in production, return an error
    if (!CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'CRON_SECRET is not configured' },
        { status: 500 }
      );
    }
    
    // Return the CRON_SECRET or a development fallback
    return NextResponse.json({
      secret: CRON_SECRET || 'dev-cron-secret'
    });
  } catch (error) {
    console.error('Error in get-cron-secret:', error);
    
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}