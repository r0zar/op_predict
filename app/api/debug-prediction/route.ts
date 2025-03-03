import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import * as kvStore from '@/lib/src/kv-store';

export async function GET(request: Request) {
    try {
        // Get prediction ID from query parameter
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                error: 'Missing prediction ID. Use ?id=your_prediction_id'
            }, { status: 400 });
        }

        // Test both methods of fetching prediction
        const directKvResult = await kv.hgetall(`prediction:${id}`);
        const kvStoreResult = await kvStore.getEntity('PREDICTION', id);

        // Check old format (if exists)
        const oldFormatResult = await kv.get(`predictions:${id}`);

        // Get all Redis keys that might match this prediction
        const allKeys = await kv.keys(`*${id}*`);
        const predictionKeys = allKeys.filter(key =>
            key.includes('prediction') || key.includes('predictions')
        );

        // Return debug info
        return NextResponse.json({
            predictionId: id,
            methods: {
                direct_kv_hgetall: {
                    key: `prediction:${id}`,
                    result: directKvResult,
                    type: directKvResult ? typeof directKvResult : null,
                    isNull: directKvResult === null,
                    keys: directKvResult ? Object.keys(directKvResult) : []
                },
                kvStore_getEntity: {
                    key: 'PREDICTION/' + id,
                    result: kvStoreResult,
                    type: kvStoreResult ? typeof kvStoreResult : null,
                    isNull: kvStoreResult === null,
                    keys: kvStoreResult ? Object.keys(kvStoreResult) : []
                },
                old_format: {
                    key: `predictions:${id}`,
                    result: oldFormatResult,
                    type: oldFormatResult ? typeof oldFormatResult : null,
                    isNull: oldFormatResult === null,
                    keys: oldFormatResult && typeof oldFormatResult === 'object' ? Object.keys(oldFormatResult) : []
                }
            },
            matching_keys: predictionKeys
        });
    } catch (error) {
        console.error('Error in debug prediction endpoint:', error);
        return NextResponse.json({
            error: String(error),
            stack: (error as Error).stack
        }, { status: 500 });
    }
} 