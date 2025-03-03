import { NextResponse } from 'next/server';
import { getMarket } from '@/app/actions/market-actions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;
    const market = await getMarket(marketId);
    
    if (!market) {
      return new NextResponse(JSON.stringify({ error: 'Market not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return NextResponse.json(market);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch market' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}