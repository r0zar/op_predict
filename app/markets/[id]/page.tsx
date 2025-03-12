import { getMarket } from "@/app/actions/market-actions";
import { getMarketPredictions, getRelatedMarkets } from "@/app/actions/prediction-actions";
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
import { ResolveMarketButton } from "@/components/resolve-market-button";
import { MarketDeadlineSection } from "@/components/market-deadline-section";
import { Metadata } from "next";
import { Suspense } from "react";
import { MarketCountdown } from "@/components/market-countdown";
import { PredictionsTable } from "@/components/predictions-table";

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const market: any = await getMarket(params.id);
    if (!market) return { title: "Market Not Found" };

    return {
        title: market.name,
        description: market.description,
        openGraph: {
            title: market.name,
            description: market.description,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: market.name,
            description: market.description,
        },
    };
}

// Loading component
function LoadingState() {
    return (
        <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
        </div>
    );
}

// Error component
function ErrorState({ error }: { error: Error }) {
    return (
        <div className="text-center py-10">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <Button asChild className="mt-4">
                <Link href="/markets">Return to Markets</Link>
            </Button>
        </div>
    );
}

// Market predictions component
async function MarketPredictions({ marketId }: { marketId: string }) {
    try {
        const predictions = await getMarketPredictions(marketId);
        if (!predictions.success || !predictions.predictions || predictions.predictions.length === 0) {
            return (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Predictions</h2>
                    <p className="text-muted-foreground">No predictions yet. Be the first to predict!</p>
                </div>
            );
        }

        const { getUserNameById } = await import("@/lib/clerk-user");

        const predictionsWithCreatorNames = await Promise.all(
            predictions.predictions.map(async (prediction) => {
                try {
                    const creatorName = prediction.userId ?
                        await getUserNameById(prediction.userId).catch(() => 'Anonymous User') :
                        'Anonymous User';

                    return {
                        ...prediction,
                        creatorName
                    };
                } catch (error) {
                    return {
                        ...prediction,
                        creatorName: 'Anonymous User'
                    };
                }
            })
        );

        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Predictions</h2>
                <PredictionsTable predictions={predictionsWithCreatorNames} />
            </div>
        );
    } catch (error) {
        console.error("Error in MarketPredictions component:", error);
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Predictions</h2>
                <p className="text-muted-foreground">Unable to load predictions at this time.</p>
            </div>
        );
    }
}

// Related markets component
async function RelatedMarkets({ marketId }: { marketId: string }) {
    try {
        const relatedMarkets = await getRelatedMarkets(marketId);

        if (!relatedMarkets || relatedMarkets.length === 0) {
            return (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Related Markets</h2>
                    <p className="text-muted-foreground">No related markets found.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Related Markets</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedMarkets.map((market) => {
                        try {
                            if (!market.outcomes || market.outcomes.length === 0) {
                                return null; // Skip markets with no outcomes
                            }

                            const { outcomesWithPercentages } = calculateOutcomePercentages(market.outcomes);
                            const topOutcome = outcomesWithPercentages.reduce((prev, current) =>
                                current.percentage > prev.percentage ? current : prev
                            );

                            return (
                                <Card key={market.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-lg">{market.name}</CardTitle>
                                            <Badge variant={market.status === 'active' ? 'outline' : 'secondary'}>
                                                {market.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground line-clamp-2">{market.description}</p>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Top Outcome:</span>
                                                <span className="font-medium">{topOutcome.name}</span>
                                            </div>
                                            <Progress value={topOutcome.percentage} className="h-2" />
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Odds:</span>
                                                <span className="font-medium">{topOutcome.percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{market.participants || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                <span>${market.poolAmount || 0}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={`/markets/${market.id}`}>View Market</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        } catch (error) {
                            console.error(`Error rendering related market ${market.id}:`, error);
                            return null; // Skip rendering this market if there's an error
                        }
                    }).filter(Boolean)}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error in RelatedMarkets component:", error);
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Related Markets</h2>
                <p className="text-muted-foreground">Unable to load related markets at this time.</p>
            </div>
        );
    }
}

export default async function MarketPage({ params }: { params: { id: string } }) {
    const [user, marketData, predictions] = await Promise.all([
        currentUser(),
        getMarket(params.id),
        getMarketPredictions(params.id)
    ]);

    if (!marketData) {
        notFound();
    }

    // Use type assertion for the market data
    const market = marketData as any;

    // Calculate actual votes and amounts from predictions
    const predictionsByOutcome = predictions.predictions?.reduce((acc, prediction) => {
        const outcomeId = prediction.outcomeId;
        if (!acc[outcomeId]) {
            acc[outcomeId] = {
                votes: 0,
                amount: 0
            };
        }
        acc[outcomeId].votes += 1;
        acc[outcomeId].amount += prediction.amount || 0;
        return acc;
    }, {} as Record<string, { votes: number, amount: number }>) || {};

    // Calculate total votes and amounts
    let totalVotes = 0;
    let totalAmount = 0;

    // Manually iterate to avoid TypeScript errors
    Object.values(predictionsByOutcome).forEach((data: any) => {
        totalVotes += data.votes || 0;
        totalAmount += data.amount || 0;
    });

    // Calculate percentages with actual vote counts and amounts
    const outcomesWithVotes = market.outcomes.map((outcome: any) => ({
        ...outcome,
        votes: predictionsByOutcome[outcome.id]?.votes || 0,
        amount: predictionsByOutcome[outcome.id]?.amount || 0,
        percentage: totalAmount === 0
            ? 100 / market.outcomes.length // Equal distribution if no amounts
            : ((predictionsByOutcome[outcome.id]?.amount || 0) / totalAmount) * 100
    }));

    // Sort outcomes by percentage
    const sortedOutcomes = [...outcomesWithVotes].sort((a, b) => b.percentage - a.percentage);

    // Create a map of outcome IDs to percentages for the PredictionCard component
    const outcomeOddsMap = sortedOutcomes.reduce((map, outcome) => {
        map[outcome.id] = outcome.percentage;
        return map;
    }, {} as { [key: number]: number });

    // Check if user is authenticated
    const isAuthenticated = !!user;

    // Check if user is an admin
    const isUserAdmin = isAdmin(user?.id || '');

    // Check if market is already resolved or cancelled
    const isMarketResolved = market.status === 'resolved';
    const isMarketCancelled = market.status === 'cancelled';

    // Check if market has expired (end date has passed)
    const isMarketExpired = new Date(market.endDate) < new Date();

    // A market is considered closed if it's resolved, cancelled, or expired
    const isMarketClosed = isMarketResolved || isMarketCancelled || isMarketExpired;

    return (
        <div className="container max-w-5xl xl:max-w-7xl py-10 space-y-8">
            <div className="flex items-center justify-between mb-4">
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

            {/* Futuristic Control Panel */}
            <div className="relative mb-12 overflow-hidden rounded-lg bg-card border shadow-md">
                {/* Enhanced shimmer effects */}
                {/* <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyber-blue/5 to-transparent bg-[length:200%_100%] animate-nav-shimmer"></div> */}
                {/* <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyber-blue/5 to-transparent bg-[length:200%_100%] animate-nav-shimmer"></div> */}
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent"></div>
                {/* <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent"></div> */}

                <div className="relative z-10">
                    {/* Market status header with enhanced glow pulse for active markets */}
                    <div className="px-6 pt-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Badge variant={market.type === 'binary' ? 'secondary' : 'secondary'} className="px-3 py-1 bg-black/50 backdrop-blur">
                                {market.type === 'binary' ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                    <ListFilter className="h-3 w-3 mr-1" />
                                )}
                                {market.type === 'binary' ? 'Yes/No Question' : 'Multiple Choice'}
                            </Badge>

                            <Badge
                                variant={
                                    market.status === 'active'
                                        ? 'outline'
                                        : market.status === 'resolved'
                                            ? 'secondary'
                                            : 'destructive'
                                }
                                className="px-3 py-1 bg-black/50 backdrop-blur border-cyber-blue/20"
                            >
                                {!isMarketClosed && (
                                    <span className="mr-1.5 relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-blue opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-blue"></span>
                                    </span>
                                )}
                                {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
                            </Badge>
                        </div>

                        {/* Enhanced deadline timer */}
                        <div className="bg-black/50 backdrop-blur rounded-lg px-4 py-1.5 border border-cyber-blue/20">
                            <div className="flex items-center text-xs">
                                <Clock className="h-3.5 w-3.5 mr-2 text-cyber-blue" />
                                {!isMarketClosed ? (
                                    <span className="text-cyan-400 font-mono">
                                        <MarketCountdown endDate={market.endDate} />
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">
                                        Ended {new Date(market.endDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Market title with subtle glow effect */}
                    <div className="px-6 pt-4 pb-6">
                        <h1 className="text-2xl font-bold text-foreground">{market.name}</h1>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center px-2 py-1 rounded-md bg-muted bg-opacity-30">
                                <Users className="h-3.5 w-3.5 mr-1 text-cyber-blue" />
                                <span>{market.participants || 0} participants</span>
                            </div>
                            <div className="flex items-center px-2 py-1 rounded-md bg-muted bg-opacity-30">
                                <DollarSign className="h-3.5 w-3.5 mr-1 text-cyber-blue" />
                                <span>${market.poolAmount || 0} pool</span>
                            </div>
                            <div className="flex items-center px-2 py-1 rounded-md bg-muted bg-opacity-30">
                                <Calendar className="h-3.5 w-3.5 mr-1 text-cyber-blue" />
                                <span>Created {new Date(market.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status notifications for resolved/cancelled markets */}
                    {isMarketResolved && market.resolvedOutcomeId && (
                        <div className="mx-6 mb-6 bg-green-950/5 border border-green-600/90 rounded-lg p-4 backdrop-blur">
                            <div className="flex items-start">
                                <Trophy className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-green-300 mb-1">Market Resolved</h3>
                                    <p className="text-sm text-green-600/90">
                                        This market was resolved on {new Date(market.resolvedAt || '').toLocaleDateString()}.
                                        The winning outcome was <strong>{market.outcomes.find((o: any) => o.id === market.resolvedOutcomeId)?.name}</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isMarketCancelled && (
                        <div className="mx-6 mb-6 bg-yellow-950/30 border border-yellow-500/30 rounded-lg p-4 backdrop-blur">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-yellow-300 mb-1">Market Cancelled</h3>
                                    <p className="text-sm text-yellow-400/80">
                                        This market has been cancelled. Any funds committed to predictions have been returned to users.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isMarketExpired && !isMarketResolved && !isMarketCancelled && (
                        <div className="mx-6 mb-6 bg-amber-950/30 border border-amber-500/30 rounded-lg p-4 backdrop-blur">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-amber-300 mb-1">Market Expired</h3>
                                    <p className="text-sm text-amber-400/80">
                                        This market has reached its end date but hasn't been resolved yet.
                                        {isUserAdmin && " As an admin, you can resolve this market using the admin controls."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main content - horizontally split into 2 columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                        {/* Left panel - about 60% width */}
                        <div className="lg:col-span-3 px-6 pb-6 lg:border-r border-muted">
                            <div className="space-y-6">
                                {/* Description section with subtle corner accents */}
                                <div>
                                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                        Description
                                    </h2>
                                    <p className="text-foreground/90 whitespace-pre-wrap p-4 rounded-md bg-black/20">
                                        {market.description}
                                    </p>
                                </div>

                                {/* Current predictions section */}
                                <div>
                                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                        Current Predictions
                                    </h2>
                                    <div className="space-y-4">
                                        {sortedOutcomes.map((outcome) => (
                                            <div key={outcome.id} className="space-y-1 p-2 rounded-md hover:bg-muted/20 transition-colors">
                                                <div className="flex justify-between items-center">
                                                    <span className={cn("font-medium text-sm",
                                                        isMarketResolved && market.resolvedOutcomeId === outcome.id && "text-green-400"
                                                    )}>
                                                        {outcome.name}
                                                        {isMarketResolved && market.resolvedOutcomeId === outcome.id && (
                                                            <Check className="inline h-4 w-4 ml-1" />
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-mono bg-black/30 px-2 py-0.5 rounded-md">
                                                        ${outcome.amount.toFixed(2)} ({outcome.percentage.toFixed(1)}%) · {outcome.votes} {outcome.votes === 1 ? 'vote' : 'votes'}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50 backdrop-blur">
                                                    <div
                                                        className="h-full transition-all duration-200"
                                                        style={{
                                                            width: `${outcome.percentage}%`,
                                                            backgroundColor: market.type === 'binary' && outcome.name === 'Yes'
                                                                ? 'hsl(var(--neon-green) / 0.8)'
                                                                : market.type === 'binary' && outcome.name === 'No'
                                                                    ? 'hsl(var(--neon-red) / 0.8)'
                                                                    : 'hsl(var(--cyber-blue) / 0.8)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {totalVotes === 0 && (
                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                <Info className="inline h-3 w-3 mr-1" />
                                                No predictions yet. Showing equal distribution.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right panel - about 40% width */}
                        <div className="lg:col-span-2">
                            <div className="h-full py-6 px-6 flex flex-col">
                                {!isMarketClosed ? (
                                    <>
                                        {/* Make a Prediction section */}
                                        <div className="mb-4">
                                            <PredictionForm
                                                market={market}
                                                outcomes={sortedOutcomes}
                                                userId={user?.id as string}
                                            />
                                        </div>

                                        {/* Admin resolve section */}
                                        {isUserAdmin && (
                                            <div className="mt-auto pt-4 border-t border-muted">
                                                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                                    Admin Controls
                                                </h2>
                                                <ResolveMarketButton
                                                    marketName={market.name}
                                                    marketId={market.id}
                                                    outcomes={market.outcomes}
                                                    isAdmin={isUserAdmin}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : isMarketExpired && !isMarketResolved && !isMarketCancelled ? (
                                    <div className="h-full flex flex-col justify-center items-center text-center p-6">
                                        <div className="rounded-full bg-amber-950/30 p-4 mb-4">
                                            <AlertTriangle className="h-10 w-10 text-amber-400" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">
                                            Market Expired
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            This market has ended but hasn't been resolved yet.
                                            {isUserAdmin && " As an admin, you can resolve this market below."}
                                        </p>
                                        <p className="text-xs text-muted-foreground border-t border-muted pt-4 mt-4">
                                            Market ended on {new Date(market.endDate).toLocaleDateString()}
                                        </p>

                                        {isUserAdmin && (
                                            <div className="mt-6 w-full">
                                                <ResolveMarketButton
                                                    marketName={market.name}
                                                    marketId={market.id}
                                                    outcomes={market.outcomes}
                                                    isAdmin={isUserAdmin}
                                                    variant="warning"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col justify-center items-center text-center p-6">
                                        <div className="rounded-full bg-muted p-4 mb-4">
                                            {isMarketResolved ? (
                                                <Trophy className="h-10 w-10 text-green-400" />
                                            ) : (
                                                <AlertTriangle className="h-10 w-10 text-yellow-400" />
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">
                                            {isMarketResolved ? "Market Resolved" : "Market Closed"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {isMarketResolved
                                                ? `The winning outcome was "${market.outcomes.find((o: any) => o.id === market.resolvedOutcomeId)?.name}".`
                                                : "This market is no longer accepting predictions."}
                                        </p>
                                        <p className="text-xs text-muted-foreground border-t border-muted pt-4 mt-4">
                                            Market ended on {new Date(market.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <Suspense fallback={<LoadingState />}>
                <MarketPredictions marketId={market.id} />
            </Suspense>


            <Suspense fallback={<LoadingState />}>
                <RelatedMarkets marketId={market.id} />
            </Suspense>
        </div>
    );
}