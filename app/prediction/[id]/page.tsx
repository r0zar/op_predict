import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Clock, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import PredictionShare from '@/components/prediction-share';
import ReturnPredictionButton from '@/components/return-prediction-button';
import { RedeemPredictionButton } from '@/components/redeem-prediction-button';
// Use any type instead of defining explicit types
import { calculateOutcomePercentages } from "@/lib/utils";
import { marketStore, custodyStore } from 'wisdom-sdk';
import { canReturnPrediction, canClaimReward } from '@/app/actions/prediction-actions';

// Dynamic metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oppredict.com';

    // Fetch transaction/prediction data using wisdom-sdk
    let prediction;
    try {
        // Use custody store to get the transaction
        prediction = await custodyStore.getTransaction(id);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return {
            title: 'Prediction Not Found',
            description: 'The requested prediction could not be found.',
        };
    }

    if (!prediction) {
        return {
            title: 'Prediction Not Found',
            description: 'The requested prediction could not be found.',
        };
    }

    // Get market details
    let market;
    try {
        if (prediction.marketId) {
            market = await marketStore.getMarket(prediction.marketId);
        }
    } catch (error) {
        console.error('Error fetching market:', error);
        return {
            title: 'Market Not Found | OP_PREDICT',
        };
    }

    if (!market) {
        return {
            title: 'Market Not Found | OP_PREDICT',
        };
    }

    const marketName = market.name as string;
    const isResolved = market.status === 'resolved';

    return {
        title: isResolved
            ? `Prediction Result: ${marketName} | OP_PREDICT`
            : `Prediction: ${marketName} | OP_PREDICT`,
        description: isResolved
            ? `See the result of this prediction on "${marketName}" on OP_PREDICT.`
            : `Check out this prediction on "${marketName}" on OP_PREDICT.`,
        openGraph: {
            title: isResolved
                ? `Prediction Result: ${marketName}`
                : `Prediction: ${marketName}`,
            description: isResolved
                ? `See the result of this prediction on "${marketName}" on OP_PREDICT.`
                : `Check out this prediction on "${marketName}" on OP_PREDICT.`,
            type: 'website',
            url: `${baseUrl}/prediction/${id}`,
            images: [
                {
                    url: `${baseUrl}/api/og/prediction/${id}`,
                    width: 1200,
                    height: 630,
                    alt: isResolved
                        ? `Prediction result for ${marketName}`
                        : `Prediction for ${marketName}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: isResolved
                ? `Prediction Result: ${marketName}`
                : `Prediction: ${marketName}`,
            description: isResolved
                ? `See the result of this prediction on "${marketName}" on OP_PREDICT.`
                : `Check out this prediction on "${marketName}" on OP_PREDICT.`,
            images: [`${baseUrl}/api/og/prediction/${id}`],
        },
    };
}

export default async function PredictionPage({ params }: { params: { id: string } }) {
    const id = params.id;
    const user = await currentUser();

    // Fetch transaction/prediction data using wisdom-sdk
    let prediction;
    try {
        // Use custody store to get the transaction
        prediction = await custodyStore.getTransaction(id);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return (
            <div className="container mx-auto py-10">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-100">Prediction Not Found</CardTitle>
                        <CardDescription className="">
                            This prediction might have been deleted or does not exist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="container mx-auto py-10">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-100">Prediction Not Found</CardTitle>
                        <CardDescription className="">
                            This prediction might have been deleted or does not exist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Fetch market data using wisdom-sdk
    let market;
    try {
        if (prediction.marketId) {
            market = await marketStore.getMarket(prediction.marketId);
        }
    } catch (error) {
        console.error('Error fetching market:', error);
        return (
            <div className="container mx-auto py-10">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-100">Market Not Found</CardTitle>
                        <CardDescription className="">
                            The market for this prediction might have been deleted or does not exist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!market) {
        return (
            <div className="container mx-auto py-10">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-100">Market Not Found</CardTitle>
                        <CardDescription className="">
                            The market for this prediction might have been deleted or does not exist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Extract data (with proper type handling)
    const marketName = market.name;
    const isResolved = market.status === 'resolved';
    const selectedOutcomeId = typeof prediction.outcomeId === 'number'
        ? prediction.outcomeId
        : Number(prediction.outcomeId);

    const amount = typeof prediction.amount === 'number'
        ? prediction.amount
        : Number(prediction.amount);

    // Get outcomes with proper type handling
    const outcomes: any[] = Array.isArray(market.outcomes)
        ? market.outcomes
        : JSON.parse(typeof market.outcomes === 'string' ? market.outcomes : '[]');

    const selectedOutcome = outcomes.find((o: any) => o.id === selectedOutcomeId);

    // Calculate outcome percentages properly
    const { outcomesWithPercentages } = calculateOutcomePercentages(outcomes);

    // Calculate proper odds based on percentages (implied probability)
    // If the outcome has a percentage, calculate odds as 100/percentage
    // This represents the fair payout for a given probability
    const selectedOutcomeWithPercentage = outcomesWithPercentages.find((o: any) => o.id === selectedOutcomeId);
    const outcomePercentage = selectedOutcomeWithPercentage?.percentage || 0;

    // Calculate odds: 100 / percentage (with a minimum to avoid division by zero)
    // This converts a percentage probability to decimal odds
    const odds = outcomePercentage > 0
        ? Number(((100 / outcomePercentage)).toFixed(2))
        : Number((prediction as any).odds || 2.0); // Fallback to stored odds or default

    // Calculate potential profit based on the fair odds
    const potentialPnl = amount * (odds - 1);

    // For debugging purposes
    console.log('Prediction odds calculation:', {
        predictionId: id,
        selectedOutcomeId,
        outcomePercentage,
        calculatedOdds: odds,
        amount,
        potentialPnl
    });

    // Safely parse the creation date with fallback
    let createdAt: Date;
    try {
        // For custody transactions, use takenCustodyAt, otherwise fall back to createdAt
        const dateString = prediction.takenCustodyAt || prediction.createdAt;

        if (typeof dateString === 'string' && dateString.includes('-')) {
            // Handle ISO format string
            createdAt = new Date(dateString);
        } else if (typeof dateString === 'number') {
            // Handle timestamp as number
            createdAt = new Date(dateString);
        } else {
            // Try to parse as number, but handle potential NaN
            const timestamp = Number(dateString);
            createdAt = !isNaN(timestamp) ? new Date(timestamp) : new Date();
        }

        // Verify it's a valid date, if not use current date as fallback
        if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
            console.warn('Invalid date detected, using fallback');
            createdAt = new Date();
        }
    } catch (error) {
        console.error('Error parsing date:', error);
        createdAt = new Date(); // Fallback to current date
    }

    // For resolved markets, calculate actual PnL
    let actualPnl = 0;
    let percentageGain = 0;
    let isWinner = false;

    if (isResolved) {
        // Use resolvedOutcomeId or winningOutcomeId (backward compatibility)
        const winningOutcomeId = market.resolvedOutcomeId || (market as any).winningOutcomeId;
        isWinner = selectedOutcomeId === winningOutcomeId;

        if (isWinner) {
            actualPnl = potentialPnl;
            percentageGain = ((odds - 1) * 100);
        } else {
            actualPnl = -amount;
            percentageGain = -100;
        }
    }

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    // Format date
    const formatDate = (date: Date) => {
        try {
            // Add a validity check before formatting
            if (!(date instanceof Date) || isNaN(date.getTime())) {
                console.warn('Invalid date in formatDate, using current date');
                return new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                }).format(new Date());
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Unknown date'; // Fallback to a string
        }
    };

    // Check if user owns the prediction
    const isOwner = user?.id === prediction.userId;

    // Get the prediction's on-chain identifier (nonce or receiptId)
    const nftId = prediction.receiptId || prediction.nonce;

    if (!nftId) {
        console.warn('Warning: Prediction does not have a valid nonce or receiptId for on-chain identification');
    }

    // Check if the prediction can be returned
    // Note: canReturnPrediction will need the database ID for lookup, then use nonce internally
    const canReturn = isOwner && prediction.status === 'pending' ?
        await canReturnPrediction(id) : { canReturn: false };

    // Check if the prediction can claim rewards
    // Note: canClaimReward will need the database ID for lookup, then use nonce internally
    const canClaim = isOwner && isResolved && isWinner ?
        await canClaimReward(nftId) : { canClaim: false };

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href={`/markets/${prediction.marketId}`}>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            View Market
                        </Button>
                    </Link>

                    {isOwner && (
                        <div className="flex space-x-2">
                            {canReturn.canReturn && (
                                <ReturnPredictionButton
                                    predictionId={id}
                                    tooltip={canReturn.reason || 'Return this prediction'}
                                    predictionNonce={nftId}
                                />
                            )}
                            {canClaim.canClaim && (
                                <RedeemPredictionButton
                                    predictionId={id}
                                    predictionNonce={nftId}
                                    marketName={marketName}
                                    outcomeName={selectedOutcome?.name || 'Unknown'}
                                    potentialPayout={actualPnl}
                                    tooltip="Claim your winnings for this prediction"
                                />
                            )}
                            <PredictionShare
                                predictionId={id}
                                predictionNonce={nftId}
                                marketName={marketName}
                                isResolved={isResolved}
                                outcomeSelected={selectedOutcome?.name || 'Unknown'}
                                amount={amount}
                                pnl={isResolved ? actualPnl : undefined}
                            />
                        </div>
                    )}
                </div>

                <Card className="">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{marketName}</CardTitle>
                                <CardDescription className=" mt-1">
                                    Prediction made on {formatDate(createdAt)}
                                </CardDescription>
                            </div>
                            <Badge
                                className={
                                    isResolved
                                        ? isWinner
                                            ? 'bg-green-600'
                                            : 'bg-red-600'
                                        : prediction.status === 'submitted'
                                            ? 'bg-yellow-600'
                                            : prediction.status === 'confirmed'
                                                ? 'bg-purple-600'
                                                : prediction.status === 'rejected'
                                                    ? 'bg-red-600'
                                                    : 'bg-blue-600'
                                }
                            >
                                {isResolved
                                    ? (isWinner ? 'Won' : 'Lost')
                                    : prediction.status === 'submitted'
                                        ? 'Submitted'
                                        : prediction.status === 'confirmed'
                                            ? 'Confirmed'
                                            : prediction.status === 'rejected'
                                                ? 'Rejected'
                                                : 'Pending'
                                }
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Prediction Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium ">Selected Outcome</h3>
                                    <div className="mt-1 flex items-center gap-2">
                                        {isResolved && (
                                            <span>
                                                {isWinner ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </span>
                                        )}
                                        <p className="text-xl font-semibold">{selectedOutcome?.name || 'Unknown'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium ">Prediction Amount</h3>
                                    <p className="mt-1 text-xl font-semibold">{formatCurrency(amount)}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium ">Odds</h3>
                                    <p className="mt-1 text-xl font-semibold">{odds.toFixed(2)}x</p>
                                </div>
                            </div>

                            <div className={`space-y-4 ${isResolved ? 'block' : 'hidden md:block'}`}>
                                {isResolved ? (
                                    <>
                                        <div>
                                            <h3 className="text-sm font-medium ">Result</h3>
                                            <p className={`mt-1 text-xl font-semibold ${isWinner ? 'text-green-500' : 'text-red-500'}`}>
                                                {isWinner ? 'Prediction Correct' : 'Prediction Incorrect'}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium ">Profit/Loss</h3>
                                            <p className={`mt-1 text-xl font-semibold flex items-center gap-1 ${actualPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                <DollarSign className="h-5 w-5" />
                                                {actualPnl >= 0 ? '+' : ''}{formatCurrency(actualPnl).slice(1)}
                                                <span className="text-sm">({actualPnl >= 0 ? '+' : ''}{percentageGain.toFixed(0)}%)</span>
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium ">Total Payout</h3>
                                            <p className="mt-1 text-xl font-semibold">
                                                {formatCurrency(actualPnl > 0 ? amount + actualPnl : 0)}
                                            </p>
                                        </div>

                                        {isOwner && isWinner && canClaim?.canClaim && (
                                            <div className="mt-4">
                                                <RedeemPredictionButton
                                                    predictionId={id}
                                                    marketName={marketName}
                                                    outcomeName={selectedOutcome?.name || 'Unknown'}
                                                    potentialPayout={actualPnl}
                                                    predictionNonce={nftId}
                                                    tooltip="Claim your winnings for this prediction"
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="text-sm font-medium ">Status</h3>
                                            <p className="mt-1 text-xl font-semibold text-blue-500 flex items-center gap-1">
                                                <Clock className="h-5 w-5" />
                                                Awaiting Resolution
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium ">Potential Profit</h3>
                                            <p className="mt-1 text-xl font-semibold flex items-center gap-1">
                                                <DollarSign className="h-5 w-5" />
                                                {formatCurrency(potentialPnl).slice(1)}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium ">Potential Payout</h3>
                                            <p className="mt-1 text-xl font-semibold">
                                                {formatCurrency(amount + potentialPnl)}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Call to action */}
                        {!user && (
                            <div className="mt-8 pt-6 border-t border-slate-700">
                                <div className="rounded-md bg-slate-700 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium">Make your own predictions</h3>
                                            <p className=" mt-1">
                                                Sign up to make predictions on various topics and win rewards!
                                            </p>
                                        </div>
                                        <Link href="/sign-up">
                                            <Button>Sign Up</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 