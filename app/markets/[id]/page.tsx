import { getMarket } from "@/app/actions/market-actions";
import { getMarketPredictions } from "@/app/actions/prediction-actions";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle2,
    ListFilter,
    Users,
    DollarSign,
    Calendar,
    ArrowLeft,
    Clock,
    Info,
    Trophy,
    Check,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PredictionForm } from "@/components/prediction-form";
import { cn, isAdmin, calculateOutcomePercentages } from "@/lib/utils";
import { PredictionCard } from "@/components/prediction-card";
import { ResolveMarketButton } from "@/components/resolve-market-button";

export default async function MarketPage({ params }: { params: { id: string } }) {
    console.log("Market ID from params:", params.id);

    // Get the current user and market data in parallel
    const [user, market, marketPredictionsResult] = await Promise.all([
        currentUser(),
        getMarket(params.id),
        getMarketPredictions(params.id)
    ]);

    console.log("Market found:", market ? "Yes" : "No");

    if (!market) {
        console.log("Market not found, returning 404");
        notFound();
    }

    // Get market predictions
    const marketPredictions = marketPredictionsResult.success ? marketPredictionsResult.predictions || [] : [];

    // Calculate percentages using the utility function
    const { outcomesWithPercentages, useFallbackVotes } = calculateOutcomePercentages(market.outcomes);

    // Create a map of outcome IDs to percentages for the PredictionCard component
    const outcomeOddsMap = outcomesWithPercentages.reduce((map, outcome) => {
        map[outcome.id] = outcome.percentage;
        return map;
    }, {} as { [key: number]: number });

    // Check if user is authenticated
    const isAuthenticated = !!user;

    // Check if user is an admin
    const isUserAdmin = isAdmin(user?.id);

    // Check if user has made predictions in this market
    const userPredictions = isAuthenticated
        ? marketPredictions.filter(p => p.userId === user.id)
        : [];

    // Check if market is already resolved or cancelled
    const isMarketResolved = market.status === 'resolved';
    const isMarketCancelled = market.status === 'cancelled';
    const isMarketClosed = isMarketResolved || isMarketCancelled;

    return (
        <div className="container max-w-5xl py-10">
            <div className="flex items-center justify-between mb-8">
                <Link href="/markets" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Markets
                </Link>

                <div className="flex items-center space-x-2">
                    <Badge
                        variant={
                            market.status === 'active'
                                ? 'outline'
                                : market.status === 'resolved'
                                    ? 'secondary'
                                    : 'destructive'
                        }
                        className="px-3 py-1"
                    >
                        {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
                    </Badge>
                </div>
            </div>

            {/* If market is resolved, show winning outcome */}
            {isMarketResolved && market.resolvedOutcomeId && (
                <div className="mb-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                    <div className="flex items-start">
                        <Trophy className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-green-800 dark:text-green-300 mb-1">Market Resolved</h3>
                            <p className="text-sm text-green-700 dark:text-green-400">
                                This market was resolved on {new Date(market.resolvedAt || '').toLocaleDateString()}.
                                The winning outcome was <strong>{market.outcomes.find(o => o.id === market.resolvedOutcomeId)?.name}</strong>.
                            </p>
                            {user && userPredictions.length > 0 && (
                                <p className="text-sm mt-2 text-green-700 dark:text-green-400">
                                    Check your prediction receipts below to see if you won!
                                </p>
                            )}

                            {/* Admin-only details */}
                            {isUserAdmin && (
                                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                    <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Admin Resolution Details</h4>
                                    <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                                        <li>Resolved by: {market.resolvedBy || 'Unknown admin'}</li>
                                        <li>Admin fee (5%): ${market.adminFee?.toFixed(2) || '0.00'}</li>
                                        <li>Total pot size: ${(market.poolAmount || 0).toFixed(2)}</li>
                                        <li>Remaining pot for winners: ${market.remainingPot?.toFixed(2) || '0.00'}</li>
                                        <li>Total winning amount: ${market.totalWinningAmount?.toFixed(2) || '0.00'}</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* If market is cancelled, show cancellation notice */}
            {isMarketCancelled && (
                <div className="mb-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Market Cancelled</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                This market has been cancelled. Any funds committed to predictions have been returned to users.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content grid with market details and prediction form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Market Card - Left side on large screens, full width on small */}
                <Card className="border-2 shadow-sm lg:col-span-2">
                    <CardHeader className="border-b bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={market.type === 'binary' ? 'default' : 'secondary'}>
                                {market.type === 'binary' ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                    <ListFilter className="h-3 w-3 mr-1" />
                                )}
                                {market.type === 'binary' ? 'Yes/No Question' : 'Multiple Choice'}
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl">{market.name}</CardTitle>
                        <CardDescription className="flex flex-wrap gap-4 mt-2">
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{market.participants || 0} participants</span>
                            </div>
                            <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>${market.poolAmount || 0} pool</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Created {new Date(market.createdAt).toLocaleDateString()}</span>
                            </div>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <h2 className="text-lg font-semibold mb-3">Description</h2>
                        <p className="text-muted-foreground whitespace-pre-wrap mb-6">{market.description}</p>

                        <h2 className="text-lg font-semibold mb-3">Current Predictions</h2>
                        <div className="space-y-4 mb-6">
                            {outcomesWithPercentages.map((outcome) => (
                                <div key={outcome.id} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className={`font-medium ${isMarketResolved && market.resolvedOutcomeId === outcome.id ? 'text-green-600 dark:text-green-400 flex items-center' : ''}`}>
                                            {outcome.name}
                                            {isMarketResolved && market.resolvedOutcomeId === outcome.id && (
                                                <Trophy className="h-4 w-4 ml-2 text-green-600 dark:text-green-400" />
                                            )}
                                        </span>
                                        <span className="text-sm font-semibold">{outcome.percentage}%</span>
                                    </div>
                                    <Progress
                                        value={outcome.percentage}
                                        className={`h-2 ${isMarketResolved && market.resolvedOutcomeId === outcome.id
                                            ? 'bg-green-200 dark:bg-green-900'
                                            : market.type === 'binary'
                                                ? outcome.name === 'Yes'
                                                    ? 'bg-primary/20'
                                                    : 'bg-destructive/20'
                                                : 'bg-secondary/50'
                                            }`}
                                        indicatorClassName={
                                            isMarketResolved && market.resolvedOutcomeId === outcome.id
                                                ? 'bg-green-600 dark:bg-green-400'
                                                : market.type === 'binary'
                                                    ? outcome.name === 'Yes'
                                                        ? 'bg-primary'
                                                        : 'bg-destructive'
                                                    : ''
                                        }
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{outcome.votes || 0} votes</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4 flex items-start">
                            <Info className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium mb-1">How prediction markets work</h3>
                                <p className="text-sm text-muted-foreground">
                                    Prediction markets allow participants to buy shares in potential outcomes.
                                    The market price reflects the probability that the community assigns to each outcome.
                                    When the market resolves, correct predictions receive payouts proportional to their stake.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Prediction Form - Right side on large screens, below market details on small */}
                <div>
                    <Card className="border shadow-sm sticky top-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                                {isMarketResolved ? 'Market Resolved' : isMarketCancelled ? 'Market Cancelled' : 'Make a Prediction'}
                            </CardTitle>
                            <CardDescription>
                                {isMarketResolved
                                    ? "This market has been resolved and no longer accepts predictions"
                                    : isMarketCancelled
                                        ? "This market has been cancelled and is no longer active"
                                        : isAuthenticated
                                            ? "Select an outcome and amount to predict"
                                            : "Sign in to participate in this market"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 pb-3">
                            {isMarketClosed ? (
                                <div className="py-2">
                                    {isMarketResolved && (
                                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                                            <h3 className="font-medium mb-2">Final Results:</h3>
                                            {outcomesWithPercentages.map((outcome) => (
                                                <div key={outcome.id} className="flex justify-between items-center mb-2">
                                                    <span className={`${market.resolvedOutcomeId === outcome.id ? 'font-semibold text-green-600 dark:text-green-400 flex items-center' : ''}`}>
                                                        {outcome.name}
                                                        {market.resolvedOutcomeId === outcome.id && (
                                                            <Trophy className="h-4 w-4 ml-2" />
                                                        )}
                                                    </span>
                                                    <Badge variant={market.resolvedOutcomeId === outcome.id ? "default" : "outline"}>
                                                        {outcome.percentage}%
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isMarketCancelled && (
                                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                                            <h3 className="font-medium mb-2">Market Information:</h3>
                                            <p className="text-sm text-muted-foreground">
                                                This market was cancelled and all predictions have been refunded.
                                            </p>
                                        </div>
                                    )}

                                    {!isAuthenticated && (
                                        <Link href={`/sign-in?redirect_url=/markets/${market.id}`}>
                                            <Button className="w-full items-center justify-center" size="lg">
                                                Sign In to View Receipts
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ) : isAuthenticated ? (
                                <PredictionForm market={market} outcomes={outcomesWithPercentages} userId={user.id} />
                            ) : (
                                <>
                                    {/* Preview of outcomes for non-authenticated users */}
                                    {outcomesWithPercentages.map((outcome) => (
                                        <Button
                                            key={outcome.id}
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-between h-[52px] py-3 px-4 border-2",
                                                {
                                                    "border-primary/50": market.type === 'binary' && outcome.name === 'Yes',
                                                    "border-destructive/50": market.type === 'binary' && outcome.name === 'No',
                                                }
                                            )}
                                            disabled
                                        >
                                            <span className="font-medium">{outcome.name}</span>
                                            <Badge variant="secondary" className="ml-2">
                                                {outcome.percentage}%
                                            </Badge>
                                        </Button>
                                    ))}

                                    <Separator className="my-2" />

                                    <div className="pt-2">
                                        <Link href={`/sign-in?redirect_url=/markets/${market.id}`}>
                                            <Button className="w-full items-center justify-center" size="lg">
                                                Sign In to Predict
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </CardContent>

                        <CardFooter className="pt-0 pb-4">
                            <p className="text-xs text-muted-foreground">
                                {isMarketResolved ? (
                                    <>
                                        <Check className="h-3 w-3 inline mr-1" />
                                        Resolved on {new Date(market.resolvedAt || '').toLocaleDateString()}
                                    </>
                                ) : isMarketCancelled ? (
                                    <>
                                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                                        Cancelled
                                    </>
                                ) : (
                                    <>
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Resolves when outcome is determined
                                    </>
                                )}
                            </p>
                        </CardFooter>
                    </Card>

                    {/* Add ResolveMarketButton here for admin users */}
                    {isUserAdmin && !isMarketClosed && (
                        <div className="mt-6">
                            <Card className="border border-primary/30 shadow-sm bg-primary/5">
                                <CardContent className="pt-6 pb-4">
                                    <h3 className="text-center font-semibold mb-4 text-primary">Admin Controls</h3>
                                    <ResolveMarketButton
                                        marketId={market.id}
                                        marketName={market.name}
                                        outcomes={market.outcomes}
                                        isAdmin={isUserAdmin}
                                        className="w-full py-6 text-base font-medium"
                                    />
                                    <p className="text-xs text-muted-foreground mt-3 text-center">
                                        As an admin, you can resolve this market when the outcome is determined.
                                        You will receive a 5% admin fee from the total pool.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* User's prediction receipts - Moved outside the market card */}
            {isAuthenticated && userPredictions.length > 0 && (
                <Card className="border shadow-sm mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Your Prediction Receipts</CardTitle>
                        <CardDescription>
                            {isMarketResolved
                                ? "Your predictions for this resolved market"
                                : "Your active predictions for this market"}
                        </CardDescription>
                    </CardHeader>

                    {/* Add information about winnings distribution for resolved markets */}
                    {isMarketResolved && (
                        <div className="px-6 -mt-2 mb-4">
                            <div className="p-3 rounded-md bg-muted/30 text-sm">
                                <h4 className="font-medium mb-1">Market Resolution Information</h4>
                                <p className="text-xs text-muted-foreground">
                                    In resolved markets, 5% of the total prediction pool is collected as an admin fee.
                                    The remaining 95% is distributed to winners proportionally to their stake.
                                </p>

                                {/* Show personalized winning information if the user won */}
                                {userPredictions.some(p => p.status === 'won' || p.status === 'redeemed' && p.outcomeId === market.resolvedOutcomeId) && (
                                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-900">
                                        <p className="text-xs text-green-700 dark:text-green-400">
                                            <span className="font-medium">Congratulations!</span> You made a winning prediction in this market.
                                            {userPredictions.some(p => p.status === 'won') && (
                                                <> Redeem your prediction receipt to claim your winnings.</>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {userPredictions.map(prediction => (
                                <PredictionCard
                                    key={prediction.id}
                                    prediction={prediction}
                                    isAdmin={isUserAdmin}
                                    marketOdds={outcomeOddsMap}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Related Markets</h2>
                <Link href="/markets">
                    <Button variant="outline">View All Markets</Button>
                </Link>
            </div>

            <div className="text-center py-10 text-muted-foreground">
                <p>No related markets found</p>
            </div>
        </div>
    );
} 