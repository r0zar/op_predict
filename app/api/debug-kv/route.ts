import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import * as kvStore from '@/lib/src/kv-store';

export async function GET() {
    try {
        // List all keys
        const allKeys = await kv.keys('*');

        // Check for market data in both old and new formats
        const oldMarketKeys = allKeys.filter(key => key.startsWith('markets:'));
        const newMarketKeys = allKeys.filter(key => key.startsWith('market:'));

        // Check for market IDs in both formats
        const oldMarketIdsKey = 'market_ids';
        const newMarketIdsKey = kvStore.getKey('MARKET_IDS', '');

        const oldMarketIds = await kv.smembers(oldMarketIdsKey);
        const newMarketIds = await kv.smembers(newMarketIdsKey);

        // Get a sample market if available
        let sampleMarket = null;
        if (oldMarketKeys.length > 0) {
            sampleMarket = await kv.get(oldMarketKeys[0]);
        } else if (newMarketKeys.length > 0) {
            sampleMarket = await kv.get(newMarketKeys[0]);
        }

        // Check the implementation of getMarkets
        let marketIdsFromHelper: string[] = [];
        try {
            marketIdsFromHelper = await kvStore.getSetMembers('MARKET_IDS', '');
        } catch (e) {
            console.error('Error calling getSetMembers:', e);
        }

        // Return debug info
        return NextResponse.json({
            totalKeys: allKeys.length,
            oldFormatMarketKeys: {
                count: oldMarketKeys.length,
                sample: oldMarketKeys.slice(0, 5)
            },
            newFormatMarketKeys: {
                count: newMarketKeys.length,
                sample: newMarketKeys.slice(0, 5)
            },
            marketIds: {
                oldFormat: {
                    key: oldMarketIdsKey,
                    count: oldMarketIds?.length || 0,
                    ids: oldMarketIds || []
                },
                newFormat: {
                    key: newMarketIdsKey,
                    count: newMarketIds?.length || 0,
                    ids: newMarketIds || []
                },
                fromHelper: {
                    count: marketIdsFromHelper.length,
                    ids: marketIdsFromHelper
                }
            },
            sampleMarket: sampleMarket ?
                { key: oldMarketKeys.length > 0 ? oldMarketKeys[0] : newMarketKeys[0], data: sampleMarket } :
                null
        });
    } catch (error) {
        console.error('Error in debug endpoint:', error);
        return NextResponse.json({
            error: String(error),
            stack: (error as Error).stack
        }, { status: 500 });
    }
} 