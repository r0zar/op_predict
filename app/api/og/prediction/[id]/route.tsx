import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import * as kvStore from '@op-predict/lib/kv-store';
import { Prediction } from '@op-predict/lib';
import { Market } from '@op-predict/lib';

export const runtime = 'edge';

// Use a generic type approach to avoid conflicts with imported types
interface BasicNFTReceipt {
    id: string;
    predictionId: string;
    userId: string;
    createdAt: string | number;
    tokenId?: string;
    transactionHash?: string;
    // Optional fields that might exist in some receipts
    image?: string;
    marketName?: string;
    outcomeName?: string;
    amount?: number;
}

// Extended prediction type with NFT info - avoiding intersection with imported types
type PredictionWithNFT = {
    id: string;
    marketId: string;
    userId: string;
    outcomeId: number | string;
    amount: number | string;
    createdAt: number | string;
    // Include any other prediction fields we might need
    odds?: number | string;
    potentialPayout?: number;
    status?: string;
    // NFT receipt info
    nftReceipt?: Record<string, any>;
};

// Preload the font
const interBold = fetch(
    new URL('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-0.woff2', import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) {
            return new Response('Prediction ID is required', { status: 400 });
        }

        // Debug logging
        console.log(`[OG Debug] Processing prediction OG for ID: ${id}`);

        // First determine if the ID is for a prediction or NFT receipt
        let prediction: PredictionWithNFT | null = null;

        // Try to fetch as a prediction first
        prediction = await kvStore.getEntity<PredictionWithNFT>('PREDICTION', id);
        console.log(`[OG Debug] Direct prediction lookup result: ${prediction ? 'found' : 'not found'}`);

        // If not found, try to see if it's an NFT receipt ID
        if (!prediction) {
            console.log(`[OG Debug] Looking up as NFT receipt`);
            const nftReceipt = await kvStore.getEntity<BasicNFTReceipt>('PREDICTION_NFT', id);
            console.log(`[OG Debug] NFT receipt lookup result: ${nftReceipt ? 'found' : 'not found'}`);

            // If we found an NFT receipt, get the associated prediction
            if (nftReceipt && nftReceipt.predictionId) {
                console.log(`[OG Debug] Found NFT with prediction ID: ${nftReceipt.predictionId}`);
                // Get the prediction using the predictionId from the receipt
                prediction = await kvStore.getEntity<PredictionWithNFT>('PREDICTION', nftReceipt.predictionId);
                console.log(`[OG Debug] Prediction from NFT lookup: ${prediction ? 'found' : 'not found'}`);

                // Add the NFT receipt to the prediction
                if (prediction) {
                    prediction.nftReceipt = nftReceipt as Record<string, any>;
                }
            }
        }
        // If ID is a prediction but it might have an NFT receipt, check for that
        else if (prediction) {
            // Try to find an NFT receipt for this prediction
            const nftId = prediction.id;
            const receipt = await kvStore.getEntity<BasicNFTReceipt>('PREDICTION_NFT', nftId);
            if (receipt) {
                console.log(`[OG Debug] Found matching NFT receipt for prediction`);
                prediction.nftReceipt = receipt as Record<string, any>;
            }
        }

        // If still no prediction found
        if (!prediction) {
            console.log(`[OG Debug] Final check - prediction not found`);
            // Check if it's in the old format
            prediction = await kvStore.getEntity<PredictionWithNFT>('PREDICTION', id);
            if (!prediction) {
                console.log(`[OG Debug] All lookups failed, returning 404`);
                return new Response('Prediction not found', { status: 404 });
            }
        }

        // Fetch the market
        console.log(`[OG Debug] Looking up market with ID: ${prediction.marketId}`);
        const market = prediction.marketId
            ? await kvStore.getEntity<Market>('MARKET', prediction.marketId)
            : null;

        console.log(`[OG Debug] Market lookup result: ${market ? 'found' : 'not found'}`);

        if (!market) {
            console.log(`[OG Debug] Market not found for prediction with ID: ${id}, returning 404`);
            return new Response('Market not found for this prediction', { status: 404 });
        }

        // Extract data with type safety
        console.log(`[OG Debug] Generating OG image with market name: ${market.name}`);
        const marketName = market.name;
        const isResolved = market.status === 'resolved';

        const selectedOutcomeId = typeof prediction.outcomeId === 'number'
            ? prediction.outcomeId
            : Number(prediction.outcomeId);

        const amount = typeof prediction.amount === 'number'
            ? prediction.amount
            : Number(prediction.amount || 0);

        // Find the selected outcome
        const outcomes = Array.isArray(market.outcomes)
            ? market.outcomes
            : JSON.parse(typeof market.outcomes === 'string' ? market.outcomes : '[]');

        const selectedOutcome = outcomes.find((o: any) => o.id === selectedOutcomeId) || { name: 'Unknown' };

        // Get the odds (might not be in the type definition)
        const odds = typeof (prediction as any).odds === 'number'
            ? (prediction as any).odds
            : Number((prediction as any).odds || 1);

        // For resolved markets, calculate actual PnL
        let pnlText = '';
        let isWinner = false;

        if (isResolved) {
            // Use resolvedOutcomeId or winningOutcomeId (backward compatibility)
            const winningOutcomeId = market.resolvedOutcomeId || (market as any).winningOutcomeId;
            isWinner = selectedOutcomeId === winningOutcomeId;

            const pnl = isWinner ? amount * (odds - 1) : -amount;
            pnlText = `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toFixed(2)}`;
        }

        // Load font
        const fontData = await interBold;

        // Generate image
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#1e293b',
                        padding: '40px',
                        color: 'white',
                        fontFamily: 'Inter',
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: 36, margin: 0 }}>OP_PREDICT</h1>
                        <div style={{
                            fontSize: 24,
                            backgroundColor: isResolved ? (isWinner ? '#10b981' : '#ef4444') : '#3b82f6',
                            borderRadius: 20,
                            padding: '6px 16px',
                        }}>
                            {isResolved ? (isWinner ? 'Won' : 'Lost') : 'Active'}
                        </div>
                    </div>

                    {/* Market Name */}
                    <div style={{
                        fontSize: 44,
                        fontWeight: 'bold',
                        lineHeight: 1.2,
                        marginBottom: '30px',
                        maxHeight: 160,
                        overflow: 'hidden',
                    }}>
                        {marketName}
                    </div>

                    {/* Prediction Details */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#2d3748',
                        borderRadius: 12,
                        padding: '24px',
                        marginBottom: '20px',
                    }}>
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: 20, color: '#94a3b8' }}>Selected Outcome</div>
                            <div style={{ fontSize: 36, fontWeight: 'bold' }}>{selectedOutcome?.name || 'Unknown'}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '40px' }}>
                            <div>
                                <div style={{ fontSize: 20, color: '#94a3b8' }}>Amount</div>
                                <div style={{ fontSize: 32, fontWeight: 'bold' }}>${amount.toFixed(2)}</div>
                            </div>

                            {isResolved && (
                                <div>
                                    <div style={{ fontSize: 20, color: '#94a3b8' }}>Result</div>
                                    <div style={{
                                        fontSize: 32,
                                        fontWeight: 'bold',
                                        color: isWinner ? '#10b981' : '#ef4444',
                                    }}>
                                        {pnlText}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: 'auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 16,
                        color: '#94a3b8',
                    }}>
                        <div>Prediction #{id.substring(0, 8)}</div>
                        {prediction.nftReceipt && (
                            <div style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: 8,
                            }}>
                                NFT Minted
                            </div>
                        )}
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Inter',
                        data: fontData,
                        style: 'normal',
                        weight: 700,
                    },
                ],
            }
        );
    } catch (error: any) {
        console.error('Error generating prediction OG image:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
} 