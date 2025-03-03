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
import { cn, isAdmin, calculateOutcomePercentages } from "@/lib/src/utils";
import { PredictionCard } from "@/components/prediction-card";
import { ResolveMarketButton } from "@/components/resolve-market-button";
import { Metadata } from "next";
import { Suspense } from "react";

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const market = await getMarket(params.id);
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
    const predictions = await getMarketPredictions(marketId);
    if (!predictions.success) {
        throw new Error("Failed to load predictions");
    }

    // Import the function to get usernames
    const { getUserNameById } = await import("@/lib/clerk-user");

    // Use Promise.all to fetch all usernames in parallel for better performance
    const predictionsWithCreatorNames = await Promise.all(
        predictions.predictions?.map(async (prediction) => {
            const creatorName = await getUserNameById(prediction.userId);
            return {
                ...prediction,
                creatorName
            };
        }) || []
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Predictions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {predictionsWithCreatorNames.map((prediction) => (
                    <PredictionCard
                        key={prediction.id}
                        prediction={prediction}
                        creatorName={prediction.creatorName}
                    />
                ))}
            </div>
        </div>
    );
}

// Related markets component
async function RelatedMarkets({ marketId }: { marketId: string }) {
    const relatedMarkets = await getRelatedMarkets(marketId);
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Related Markets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedMarkets.map((market) => {
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
                })}
            </div>
        </div>
    );
}

export default async function MarketPage({ params }: { params: { id: string } }) {
    const [user, market, predictions] = await Promise.all([
        currentUser(),
        getMarket(params.id),
        getMarketPredictions(params.id)
    ]);

    if (!market) {
        notFound();
    }

    // Calculate actual votes from predictions
    const votesByOutcome = predictions.predictions?.reduce((acc, prediction) => {
        const outcomeId = prediction.outcomeId;
        acc[outcomeId] = (acc[outcomeId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    // Calculate total votes
    const totalVotes = Object.values(votesByOutcome).reduce((sum, count) => sum + count, 0);

    // Calculate percentages with actual vote counts
    const outcomesWithVotes = market.outcomes.map(outcome => ({
        ...outcome,
        votes: votesByOutcome[outcome.id] || 0,
        percentage: totalVotes === 0
            ? 100 / market.outcomes.length // Equal distribution if no votes
            : ((votesByOutcome[outcome.id] || 0) / totalVotes) * 100
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
    const isMarketClosed = isMarketResolved || isMarketCancelled;

    return (
        <div className="container max-w-5xl xl:max-w-7xl py-10 space-y-8">
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

            {/* Market status notifications */}
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
                        </div>
                    </div>
                </div>
            )}

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

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <Card className="border-2 shadow-sm lg:col-span-2">
                    <CardHeader className="border-b bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={market.type === 'binary' ? 'secondary' : 'secondary'}>
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
                            {sortedOutcomes.map((outcome) => (
                                <div key={outcome.id} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className={cn("font-medium",
                                            isMarketResolved && market.resolvedOutcomeId === outcome.id && "text-green-600 dark:text-green-400"
                                        )}>
                                            {outcome.name}
                                            {isMarketResolved && market.resolvedOutcomeId === outcome.id && (
                                                <Check className="inline h-4 w-4 ml-1" />
                                            )}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {outcome.votes} {outcome.votes === 1 ? 'vote' : 'votes'} ({outcome.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <Progress
                                        value={outcome.percentage}
                                        className={cn("h-2",
                                            market.type === 'binary' && outcome.name === 'Yes' && "bg-green-100 dark:bg-green-900/20"
                                        )}
                                        indicatorClassName={cn(
                                            market.type === 'binary' && outcome.name === 'Yes' && "bg-green-600 dark:bg-green-500"
                                        )}
                                    />
                                </div>
                            ))}
                            {totalVotes === 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    <Info className="inline h-3 w-3 mr-1" />
                                    No predictions yet. Showing equal distribution.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center text-sm bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Voting Deadline</h3>
                                <p className="text-blue-700 dark:text-blue-400">
                                    Predictions for this market {isMarketClosed ? 'ended' : 'will end'} on{' '}
                                    {new Date(market.endDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZoneName: 'short'
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    {!isMarketClosed && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Make a Prediction</CardTitle>
                                <CardDescription>
                                    Select an outcome and set your confidence level
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PredictionForm
                                    market={market}
                                    outcomes={market.outcomes as any}
                                    userId={user?.id as string}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {isUserAdmin && !isMarketClosed && (
                        <div className="mt-6">
                            <ResolveMarketButton
                                marketName={market.name}
                                marketId={market.id}
                                outcomes={market.outcomes}
                                isAdmin={isUserAdmin}
                            />
                        </div>
                    )}
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