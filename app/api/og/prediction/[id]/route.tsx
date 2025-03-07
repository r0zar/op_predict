import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { marketStore, predictionStore } from 'wisdom-sdk';

export const runtime = 'edge';

// Disable caching to ensure fresh content on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        let prediction: any = null;
        let nftReceipt: any = null;

        // Try to fetch as a prediction first using wisdom-sdk
        try {
            prediction = await predictionStore.getPrediction(id);
            console.log(`[OG Debug] Direct prediction lookup result: ${prediction ? 'found' : 'not found'}`);
        } catch (err) {
            console.log(`[OG Debug] Error fetching prediction: ${err}`);
        }

        // If not found, try to see if it's an NFT receipt ID
        if (!prediction) {
            console.log(`[OG Debug] Looking up as NFT receipt`);
            try {
                nftReceipt = await predictionStore.getNFTReceipt(id);
                console.log(`[OG Debug] NFT receipt lookup result: ${nftReceipt ? 'found' : 'not found'}`);

                // If we found an NFT receipt, get the associated prediction
                if (nftReceipt && nftReceipt.predictionId) {
                    console.log(`[OG Debug] Found NFT with prediction ID: ${nftReceipt.predictionId}`);
                    // Get the prediction using the predictionId from the receipt
                    prediction = await predictionStore.getPrediction(nftReceipt.predictionId);
                    console.log(`[OG Debug] Prediction from NFT lookup: ${prediction ? 'found' : 'not found'}`);

                    // Add the NFT receipt to the prediction
                    if (prediction) {
                        prediction.nftReceipt = nftReceipt;
                    }
                }
            } catch (err) {
                console.log(`[OG Debug] Error fetching NFT receipt: ${err}`);
            }
        }
        // If ID is a prediction but it might have an NFT receipt, check for that
        else if (prediction) {
            // Try to find an NFT receipt for this prediction
            try {
                const nftId = prediction.id;
                const receipt = await predictionStore.getNFTReceipt(nftId);
                if (receipt) {
                    console.log(`[OG Debug] Found matching NFT receipt for prediction`);
                    prediction.nftReceipt = receipt;
                    nftReceipt = receipt;
                }
            } catch (err) {
                console.log(`[OG Debug] Error fetching NFT receipt for prediction: ${err}`);
            }
        }

        // If still no prediction found
        if (!prediction) {
            console.log(`[OG Debug] All lookups failed, returning 404`);
            return new Response('Prediction not found', { status: 404 });
        }

        // Fetch the market using wisdom-sdk
        console.log(`[OG Debug] Looking up market with ID: ${prediction.marketId}`);
        let market: any = null;
        
        try {
            if (prediction.marketId) {
                market = await marketStore.getMarket(prediction.marketId);
            }
            console.log(`[OG Debug] Market lookup result: ${market ? 'found' : 'not found'}`);
        } catch (err) {
            console.log(`[OG Debug] Error fetching market: ${err}`);
        }

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

        // Calculate the odds based on market state - similar to how it's calculated elsewhere
        // First get the total amount staked on all outcomes
        const totalPredictions = outcomes.reduce((total: number, outcome: any) => {
            const outcomeTotal = typeof outcome.total === 'number'
                ? outcome.total
                : Number(outcome.total || 0);
            return total + outcomeTotal;
        }, 0);
        
        // Then calculate the odds for the selected outcome
        const selectedOutcomeTotal = selectedOutcome && typeof selectedOutcome.total === 'number'
            ? selectedOutcome.total
            : Number(selectedOutcome?.total || 0);
            
        // Calculate odds using the parimutuel formula with house edge
        const houseEdge = 0.95; // 5% house edge
        
        // If we have meaningful data, calculate odds properly, otherwise use odds from prediction or default to 2.0
        let odds: number;
        if (totalPredictions > 0 && selectedOutcomeTotal > 0) {
            odds = +((totalPredictions * houseEdge) / selectedOutcomeTotal).toFixed(2);
        } else if (typeof (prediction as any).odds === 'number') {
            odds = (prediction as any).odds;
        } else if (typeof (prediction as any).odds === 'string') {
            odds = Number((prediction as any).odds || 2.0);
        } else {
            odds = 2.0;  // Default odds if no data is available
        }
        
        console.log(`[OG Debug] Calculated odds for prediction: ${odds}`)

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

        // Reuse the already calculated totalPredictions for the multipliers

        // Function to calculate the potential multiplier more accurately
        const calculateMultiplier = (outcome: any): number => {
            const outcomeTotal = typeof outcome.total === 'number'
                ? outcome.total
                : Number(outcome.total || 0);

            // Default to 2x if no meaningful data
            if (totalPredictions === 0 || outcomeTotal === 0) return 2.0;

            // More accurate multiplier calculation with house edge factor
            const houseEdge = 0.95; // 5% house edge
            return +((totalPredictions * houseEdge) / outcomeTotal).toFixed(2);
        };

        // Add multipliers to outcomes
        const outcomesWithMultipliers = outcomes.map((outcome: any) => ({
            ...outcome,
            multiplier: calculateMultiplier(outcome)
        }));

        // Get user's selection 
        const mySelection = outcomesWithMultipliers.find((o: any) => o.id === selectedOutcomeId);

        // High-impact social OG image - REDESIGNED VERSION
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#0c1629', // Darker background for more impact
                        padding: '40px',
                        color: 'white',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background gradient effect */}
                    <div style={{
                        position: 'absolute',
                        top: '-300px',
                        right: '-300px',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)',
                        display: 'flex',
                        zIndex: 1,
                    }}></div>

                    {/* Content wrapper */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        zIndex: 2,
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '40px',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{
                                    backgroundColor: '#3b82f6',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '20px'
                                }}>OP</div>
                                <div style={{
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    display: 'flex'
                                }}>PREDICT</div>
                            </div>

                            <div style={{
                                fontSize: '20px',
                                backgroundColor: '#1e3a8a',
                                border: '2px solid #3b82f6',
                                padding: '8px 20px',
                                borderRadius: '24px',
                                fontWeight: '600',
                                display: 'flex'
                            }}>
                                {isResolved ? 'MARKET RESOLVED' : 'PREDICTION MARKET'}
                            </div>
                        </div>

                        {/* Main content split into 2/3 - 1/3 */}
                        <div style={{
                            display: 'flex',
                            flexGrow: 1,
                            gap: '40px',
                        }}>
                            {/* Market Name (2/3) */}
                            <div style={{
                                flex: '2',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}>
                                    <div style={{
                                        fontSize: '24px',
                                        color: '#3b82f6',
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        display: 'flex'
                                    }}>
                                        PREDICT NOW
                                    </div>

                                    <div style={{
                                        fontSize: '60px',
                                        fontWeight: '800',
                                        lineHeight: 1.2,
                                        letterSpacing: '-0.02em',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}>
                                        {marketName}
                                    </div>

                                    {/* Pot and Call to Action */}
                                    <div style={{
                                        marginTop: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '24px'
                                    }}>
                                        {/* Large Pot Size */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <div style={{ 
                                                fontSize: '40px',
                                                fontWeight: '800', 
                                                color: '#10b981',
                                                display: 'flex'
                                            }}>
                                                💰 ${totalPredictions.toFixed(2)}
                                            </div>
                                        </div>
                                        
                                        {/* Join Button */}
                                        <div style={{
                                            backgroundColor: '#3b82f6',
                                            padding: '15px 30px',
                                            borderRadius: '12px',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                        }}>
                                            <div style={{ display: 'flex' }}>JOIN</div>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: 'flex' }}>
                                                <path d="M13.5 4.5L21 12M21 12L13.5 19.5M21 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Outcomes Section (1/3) */}
                            <div style={{
                                flex: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: '15px',
                                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                borderRadius: '16px',
                                padding: '30px',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '10px',
                                    width: '100%'
                                }}>
                                    <div style={{
                                        fontSize: '20px',
                                        color: '#94a3b8',
                                        display: 'flex'
                                    }}>
                                        CURRENT PAYOUTS
                                    </div>
                                </div>

                                {/* Display outcomes with multipliers */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                }}>
                                    {outcomesWithMultipliers.slice(0, 5).map((outcome: any, index: number) => {
                                        // Determine color based on outcome name if binary market
                                        let badgeColor = '#3b82f6'; // default blue
                                        if (outcome.name === 'Yes') badgeColor = '#10b981'; // green
                                        if (outcome.name === 'No') badgeColor = '#ef4444'; // red

                                        return (
                                            <div key={index} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px 16px',
                                                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(59, 130, 246, 0.1)',
                                            }}>
                                                {/* Outcome Name */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                }}>
                                                    <div style={{
                                                        backgroundColor: badgeColor,
                                                        borderRadius: '6px',
                                                        width: '16px',
                                                        height: '16px',
                                                        display: 'flex'
                                                    }}></div>

                                                    <div style={{
                                                        fontSize: '20px',
                                                        fontWeight: 'bold',
                                                        maxWidth: '200px',
                                                        overflow: 'hidden',
                                                        display: 'flex'
                                                    }}>
                                                        {outcome.name}
                                                    </div>
                                                </div>

                                                {/* Multiplier */}
                                                <div style={{
                                                    fontSize: '22px',
                                                    fontWeight: 'bold',
                                                    color: '#3b82f6',
                                                    display: 'flex'
                                                }}>
                                                    {outcome.multiplier}×
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Show "+ X more options" if there are more than 5 outcomes */}
                                    {outcomes.length > 5 && (
                                        <div style={{
                                            fontSize: '16px',
                                            color: '#94a3b8',
                                            textAlign: 'center',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            padding: '8px'
                                        }}>
                                            + {outcomes.length - 5} more options
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            marginTop: '40px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            fontSize: '16px',
                            color: '#64748b',
                        }}>
                            <div style={{ display: 'flex', fontWeight: 'bold' }}>oppredict.com</div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630
            }
        );
    } catch (error: any) {
        console.error('Error generating prediction OG image:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}