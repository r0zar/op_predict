import { NextRequest, NextResponse } from 'next/server';
import { getMarkets } from '@/app/actions/market-actions';
import { SortDirection, SortField } from 'wisdom-sdk/dist/utils.cjs';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'active' | 'resolved' | 'cancelled' | 'all' | undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') as SortField | undefined;
    const sortDirection = searchParams.get('sortDirection') as SortDirection | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const cursor = searchParams.get('cursor') || undefined;
    const creatorId = searchParams.get('creatorId') || undefined;
    const source = searchParams.get('source') || undefined;
    
    // Build query options
    const queryOptions: any = {
      status,
      category,
      search,
      sortBy,
      sortDirection,
      limit,
      cursor,
      creatorId
    };
    
    // Filter by external source if provided
    if (source) {
      // Add a search term to find markets with the specific source
      queryOptions.search = queryOptions.search 
        ? `${queryOptions.search} externalSource:${source}`
        : `externalSource:${source}`;
    }
    
    // Get markets based on the query parameters
    const markets = await getMarkets(queryOptions);

    return NextResponse.json(markets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch markets' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}