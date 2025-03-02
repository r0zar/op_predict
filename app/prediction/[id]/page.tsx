import { Metadata } from 'next';
import { kv } from '@vercel/kv';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';
import PredictionShare from '@/components/prediction-share';

// Dynamic metadata for the page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const id = params.id;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oppredict.com';

    // Fetch prediction and market data
    const prediction = await kv.hgetall(`prediction:${id}`);

    if (!prediction) {
        return {
            title: 'Prediction Not Found | OP_PREDICT',
        };
    }

    const marketId = prediction.marketId as string;
    const market = await kv.hgetall(`market:${marketId}`);

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

    // Fetch prediction data
    const prediction = await kv.hgetall(`prediction:${id}`);

    if (!prediction) {
        return (
            <div className="container mx-auto py-10">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-100">Prediction Not Found</CardTitle>
                        <CardDescription className="text-slate-400">
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

    // Fetch market data
    const marketId = prediction.marketId as string;
    const market = await kv.hgetall(`market:${marketId}`);

    if (!market) {
        return (
            <div className="container mx-auto py-10">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-100">Market Not Found</CardTitle>
                        <CardDescription className="text-slate-400">
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

    // Extract data
    const marketName = market.name as string;
    const isResolved = market.status === 'resolved';
    const selectedOutcomeId = prediction.outcomeId as string;
    const amount = parseFloat(prediction.amount as string);
    const odds = parseFloat(prediction.odds as string);
    const potentialPnl = amount * (odds - 1);
    const createdAt = new Date(parseInt(prediction.createdAt as string));

    // For resolved markets, calculate actual PnL
    let actualPnl = 0;
    let percentageGain = 0;
    let isWinner = false;

    if (isResolved) {
        const winningOutcomeId = market.winningOutcomeId;
        isWinner = selectedOutcomeId === winningOutcomeId;

        if (isWinner) {
            actualPnl = potentialPnl;
            percentageGain = ((odds - 1) * 100);
        } else {
            actualPnl = -amount;
            percentageGain = -100;
        }
    }

    // Get outcomes
    const outcomes = JSON.parse(market.outcomes as string || '[]');
    const selectedOutcome = outcomes.find((o: any) => o.id === selectedOutcomeId);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    // Format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(date);
    };

    // Check if user owns the prediction
    const isOwner = user?.id === prediction.userId;

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href={`/markets/${marketId}`}>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            View Market
                        </Button>
                    </Link>

                    {isOwner && (
                        <PredictionShare
                            predictionId={id}
                            marketName={marketName}
                            isResolved={isResolved}
                            outcomeSelected={selectedOutcome?.name || 'Unknown'}
                            amount={amount}
                            pnl={isResolved ? actualPnl : undefined}
                        />
                    )}
                </div>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl text-slate-100">{marketName}</CardTitle>
                                <CardDescription className="text-slate-400 mt-1">
                                    Prediction made on {formatDate(createdAt)}
                                </CardDescription>
                            </div>
                            <Badge
                                className={
                                    isResolved
                                        ? isWinner
                                            ? 'bg-green-600'
                                            : 'bg-red-600'
                                        : 'bg-blue-600'
                                }
                            >
                                {isResolved ? (isWinner ? 'Won' : 'Lost') : 'Pending'}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Prediction Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400">Selected Outcome</h3>
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
                                        <p className="text-xl font-semibold text-slate-100">{selectedOutcome?.name || 'Unknown'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-400">Prediction Amount</h3>
                                    <p className="mt-1 text-xl font-semibold text-slate-100">{formatCurrency(amount)}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-400">Odds</h3>
                                    <p className="mt-1 text-xl font-semibold text-slate-100">{odds.toFixed(2)}x</p>
                                </div>
                            </div>

                            <div className={`space-y-4 ${isResolved ? 'block' : 'hidden md:block'}`}>
                                {isResolved ? (
                                    <>
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-400">Result</h3>
                                            <p className={`mt-1 text-xl font-semibold ${isWinner ? 'text-green-500' : 'text-red-500'}`}>
                                                {isWinner ? 'Prediction Correct' : 'Prediction Incorrect'}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-slate-400">Profit/Loss</h3>
                                            <p className={`mt-1 text-xl font-semibold flex items-center gap-1 ${actualPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                <DollarSign className="h-5 w-5" />
                                                {actualPnl >= 0 ? '+' : ''}{formatCurrency(actualPnl).slice(1)}
                                                <span className="text-sm">({actualPnl >= 0 ? '+' : ''}{percentageGain.toFixed(0)}%)</span>
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-slate-400">Total Payout</h3>
                                            <p className="mt-1 text-xl font-semibold text-slate-100">
                                                {formatCurrency(actualPnl > 0 ? amount + actualPnl : 0)}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-400">Status</h3>
                                            <p className="mt-1 text-xl font-semibold text-blue-500 flex items-center gap-1">
                                                <Clock className="h-5 w-5" />
                                                Awaiting Resolution
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-slate-400">Potential Profit</h3>
                                            <p className="mt-1 text-xl font-semibold text-slate-100 flex items-center gap-1">
                                                <DollarSign className="h-5 w-5" />
                                                {formatCurrency(potentialPnl).slice(1)}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-slate-400">Potential Payout</h3>
                                            <p className="mt-1 text-xl font-semibold text-slate-100">
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
                                            <h3 className="text-lg font-medium text-slate-100">Make your own predictions</h3>
                                            <p className="text-slate-400 mt-1">
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