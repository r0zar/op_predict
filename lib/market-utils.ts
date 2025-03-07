'use client';

import { Market, PaginatedResult } from 'wisdom-sdk';

/**
 * Helper function to merge paginated results for infinite loading
 * Combines items while preserving pagination metadata
 */
export function mergeMarketResults(
  existingResult: PaginatedResult<Market>, 
  newResult: PaginatedResult<Market>
): PaginatedResult<Market> {
  return {
    items: [...existingResult.items, ...newResult.items],
    total: newResult.total, // Use the most recent total count
    hasMore: newResult.hasMore,
    nextCursor: newResult.nextCursor
  };
}