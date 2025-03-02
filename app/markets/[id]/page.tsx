import { getMarket } from "@/app/actions/market-actions";
import { getMarketPredictions } from "@/app/actions/prediction-actions";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ListFilter, Users, DollarSign, Calendar, ArrowLeft, Clock, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PredictionForm } from "@/components/prediction-form";
import { cn, isAdmin } from "@/lib/utils";
import { PredictionCard } from "@/components/prediction-card";

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

    // Calculate total votes for percentage
    const totalVotes = market.outcomes.reduce((sum, outcome) => sum + (outcome.votes || 0), 0);

    // Update percentages
    const outcomesWithPercentages = market.outcomes.map(outcome => ({
        ...outcome,
        percentage: totalVotes > 0 ? Math.round(((outcome.votes || 0) / totalVotes) * 100) : 0
    }));

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

    return (
        <div className="container max-w-5xl py-10">
            <div className="flex items-center justify-between mb-8">
                <Link href="/markets" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Markets
                </Link>

                <Badge variant={market.status === 'active' ? 'outline' : 'secondary'} className="px-3 py-1">
                    {market.status === 'active' ? 'Active' : market.status}
                </Badge>
            </div>

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
                                        <span className="font-medium">{outcome.name}</span>
                                        <span className="text-sm font-semibold">{outcome.percentage}%</span>
                                    </div>
                                    <Progress
                                        value={outcome.percentage}
                                        className={`h-2 ${market.type === 'binary'
                                            ? outcome.name === 'Yes'
                                                ? 'bg-primary/20'
                                                : 'bg-destructive/20'
                                            : 'bg-secondary/50'
                                            }`}
                                        indicatorClassName={
                                            market.type === 'binary'
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
                            <CardTitle className="text-lg">Make a Prediction</CardTitle>
                            <CardDescription>
                                {isAuthenticated
                                    ? "Select an outcome and amount to predict"
                                    : "Sign in to participate in this market"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 pb-3">
                            {isAuthenticated ? (
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
                                <Clock className="h-3 w-3 inline mr-1" />
                                Resolves when outcome is determined
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* User's prediction receipts - Moved outside the market card */}
            {isAuthenticated && userPredictions.length > 0 && (
                <Card className="border shadow-sm mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Your Prediction Receipts</CardTitle>
                        <CardDescription>Your active predictions for this market</CardDescription>
                    </CardHeader>
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