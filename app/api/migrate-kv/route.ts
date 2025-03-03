import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import * as kvStore from '@/lib/src/kv-store';
import { Market } from '@op-predict/lib';
import { Prediction } from '@/lib/src/prediction-store';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/src/utils';

export async function GET() {
    try {
        // Check if user is admin
        const user = await currentUser();
        if (!user || !isAdmin(user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const results: Record<string, any> = {
            markets: { migrated: 0, errors: 0, details: [] },
            predictions: { migrated: 0, errors: 0, details: [] },
            sets: { migrated: 0, errors: 0, details: [] }
        };

        // 1. Migrate markets from "markets:id" to "market:id"
        const marketKeys = await kv.keys('markets:*');
        for (const oldKey of marketKeys) {
            try {
                // Extract ID from key
                const id = oldKey.split(':')[1];
                if (!id) continue;

                // Get market data
                const marketData = await kv.get(oldKey);
                if (!marketData) continue;

                // Store using new format
                await kvStore.storeEntity('MARKET', id, marketData);

                // Add to MARKET_IDS set
                await kvStore.addToSet('MARKET_IDS', '', id);

                results.markets.migrated++;
                results.markets.details.push({ id, success: true });
            } catch (error) {
                console.error(`Error migrating market: ${oldKey}`, error);
                results.markets.errors++;
                results.markets.details.push({ key: oldKey, error: String(error) });
            }
        }

        // 2. Migrate predictions from "predictions:id" to "prediction:id"
        const predictionKeys = await kv.keys('predictions:*');
        for (const oldKey of predictionKeys) {
            try {
                // Extract ID from key
                const id = oldKey.split(':')[1];
                if (!id) continue;

                // Get prediction data
                const predictionData = await kv.get(oldKey);
                if (!predictionData) continue;

                // Store using new format
                await kvStore.storeEntity('PREDICTION', id, predictionData);

                // Add to relevant sets
                if (typeof predictionData === 'object' && predictionData !== null) {
                    const prediction = predictionData as Prediction;

                    if (prediction.userId) {
                        await kvStore.addToSet('USER_PREDICTIONS', prediction.userId, id);
                    }

                    if (prediction.marketId) {
                        await kvStore.addToSet('MARKET_PREDICTIONS', prediction.marketId, id);
                    }
                }

                results.predictions.migrated++;
                results.predictions.details.push({ id, success: true });
            } catch (error) {
                console.error(`Error migrating prediction: ${oldKey}`, error);
                results.predictions.errors++;
                results.predictions.details.push({ key: oldKey, error: String(error) });
            }
        }

        // 3. Migrate NFT receipts if needed
        const nftKeys = await kv.keys('prediction_nfts:*');
        for (const oldKey of nftKeys) {
            try {
                // Extract ID from key
                const id = oldKey.split(':')[1];
                if (!id) continue;

                // Get NFT data
                const nftData = await kv.get(oldKey);
                if (!nftData) continue;

                // Store using new format
                await kvStore.storeEntity('PREDICTION_NFT', id, nftData);

                results.predictions.migrated++;
            } catch (error) {
                console.error(`Error migrating NFT: ${oldKey}`, error);
                results.predictions.errors++;
            }
        }

        // 4. Ensure market_ids set is migrated
        const marketIds = await kv.smembers('market_ids');
        if (marketIds && marketIds.length > 0) {
            for (const id of marketIds) {
                await kvStore.addToSet('MARKET_IDS', '', id as string);
                results.sets.migrated++;
            }
        }

        // Get stats after migration
        const stats = await kvStore.getDebugInfo();

        return NextResponse.json({
            success: true,
            migrationResults: results,
            currentStats: stats
        });
    } catch (error) {
        console.error('Error migrating KV data:', error);
        return NextResponse.json({
            success: false,
            error: String(error),
            stack: (error as Error).stack
        }, { status: 500 });
    }
} 