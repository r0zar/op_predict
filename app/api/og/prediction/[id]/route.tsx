import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

/**
 * Generate dynamic Open Graph images for predictions
 * @route GET /api/og/prediction/[id]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const id = params.id;

        // Fetch prediction data from KV store
        const prediction = await kv.hgetall(`prediction:${id}`);

        if (!prediction) {
            return new Response('Prediction not found', { status: 404 });
        }

        // Get market data
        const marketId = prediction.marketId as string;
        const market = await kv.hgetall(`market:${marketId}`);

        if (!market) {
            return new Response('Market not found', { status: 404 });
        }

        // Determine if market is resolved
        const isResolved = market.status === 'resolved';

        // Extract key data for the OG image
        const marketName = market.name as string;
        const selectedOutcomeId = prediction.outcomeId as string;
        const amount = parseFloat(prediction.amount as string);
        const odds = parseFloat(prediction.odds as string);
        const potentialPnl = amount * (odds - 1);

        // For resolved markets, calculate actual PnL
        let actualPnl = 0;
        let percentageGain = 0;

        if (isResolved) {
            const winningOutcomeId = market.winningOutcomeId;
            if (selectedOutcomeId === winningOutcomeId) {
                actualPnl = potentialPnl;
                percentageGain = ((odds - 1) * 100);
            } else {
                actualPnl = -amount;
                percentageGain = -100;
            }
        }

        // Get outcomes
        const outcomes = JSON.parse(market.outcomes as string || '[]');

        // Format currency
        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(value);
        };

        // Generate the OG image based on market status
        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#0f172a', // slate-900
                        padding: 40,
                        color: 'white',
                        fontFamily: 'SF Pro, Inter, system-ui, sans-serif',
                    }}
                >
                    {/* Branding header */}
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            top: 30,
                            left: 40,
                            alignItems: 'center',
                            color: '#94a3b8', // slate-400
                        }}
                    >
                        <span style={{ fontSize: 24, fontWeight: 'bold' }}>Charisma Prediction</span>
                    </div>

                    {isResolved ? (
                        // Layout for resolved markets - focus on financial outcome
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: 24,
                            }}
                        >
                            <div style={{ fontSize: 32, color: '#94a3b8' }}>Prediction Result</div>

                            <div
                                style={{
                                    fontSize: 72,
                                    fontWeight: 'bold',
                                    color: actualPnl >= 0 ? '#22c55e' : '#ef4444', // green-500 or red-500
                                }}
                            >
                                {actualPnl >= 0 ? '+' : ''}{formatCurrency(actualPnl)}
                            </div>

                            <div style={{ fontSize: 36, color: actualPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                                {actualPnl >= 0 ? '+' : ''}{percentageGain.toFixed(0)}%
                            </div>

                            <div style={{ fontSize: 24, marginTop: 40, color: '#e2e8f0' }}>
                                {marketName}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: 28,
                                    gap: 12,
                                }}
                            >
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: actualPnl >= 0 ? '#22c55e' : '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {actualPnl >= 0 ? '✓' : '✗'}
                                </div>
                                <div>
                                    {outcomes.find((o: any) => o.id === selectedOutcomeId)?.name || 'Unknown'}
                                </div>
                            </div>

                            <div style={{ fontSize: 20, color: '#94a3b8', marginTop: 20 }}>
                                Predicted with {formatCurrency(amount)}
                            </div>
                        </div>
                    ) : (
                        // Layout for unresolved markets - focus on market and prediction
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: 20,
                            }}
                        >
                            <div style={{ fontSize: 26, color: '#94a3b8' }}>Open Prediction</div>

                            <div style={{ fontSize: 52, fontWeight: 'bold', maxWidth: 900, lineHeight: 1.2 }}>
                                {marketName}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    maxWidth: 700,
                                    marginTop: 20,
                                    gap: 16,
                                }}
                            >
                                {outcomes.map((outcome: any) => (
                                    <div
                                        key={outcome.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: selectedOutcomeId === outcome.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)', // selected: blue-500 with opacity
                                            borderRadius: 12,
                                            padding: '12px 20px',
                                            gap: 16,
                                        }}
                                    >
                                        {selectedOutcomeId === outcome.id && (
                                            <div style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                backgroundColor: '#3b82f6', // blue-500
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 16,
                                            }}>
                                                ✓
                                            </div>
                                        )}

                                        <div style={{ flex: 1, fontSize: 24, textAlign: 'left' }}>
                                            {outcome.name}
                                        </div>

                                        <div style={{ fontSize: 20, color: '#94a3b8' }}>
                                            {((outcome.id === selectedOutcomeId ? odds : outcome.odds) || 1).toFixed(2)}x
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: 40,
                                    marginTop: 40,
                                }}
                            >
                                <div style={{ fontSize: 18, color: '#94a3b8' }}>
                                    <span style={{ color: '#e2e8f0' }}>Amount:</span> {formatCurrency(amount)}
                                </div>

                                <div style={{ fontSize: 18, color: '#94a3b8' }}>
                                    <span style={{ color: '#e2e8f0' }}>Potential Payout:</span> {formatCurrency(amount + potentialPnl)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer with website URL */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 30,
                            fontSize: 16,
                            color: '#64748b', // slate-500
                        }}
                    >
                        charisma.fi
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error('Error generating OG image:', error);
        return new Response('Error generating image', { status: 500 });
    }
} 