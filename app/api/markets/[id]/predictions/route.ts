import { NextResponse } from 'next/server';
import { getMarketPredictions } from '@/app/actions/prediction-actions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;
    const result = await getMarketPredictions(marketId);
    
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: result.error || 'Failed to fetch predictions' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return NextResponse.json(result.predictions || []);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch predictions' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}