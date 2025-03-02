import { getAllMarkets } from "@/app/actions/market-actions";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ListFilter, Users, DollarSign, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DeleteMarketButton } from "@/components/delete-market-button";
import { isAdmin } from "@/lib/utils";

export default async function MarketsPage() {
    // Get current user to check if they're an admin
    const user = await currentUser();
    const isUserAdmin = isAdmin(user?.id);

    const markets = await getAllMarkets();

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Prediction Markets</h1>
                <Link href="/create">
                    <Button>Create Market</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markets.map((market) => {
                    // Calculate total votes for percentage
                    const totalVotes = market.outcomes.reduce((sum, outcome) => sum + (outcome.votes || 0), 0);

                    // Get the top two outcomes for display
                    const topOutcomes = [...market.outcomes]
                        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                        .slice(0, 2)
                        .map(outcome => ({
                            ...outcome,
                            percentage: totalVotes > 0 ? Math.round(((outcome.votes || 0) / totalVotes) * 100) : 0
                        }));

                    return (
                        <div key={market.id} className="relative">
                            {isUserAdmin && (
                                <div className="absolute top-2 right-2 z-10">
                                    <DeleteMarketButton marketId={market.id} />
                                </div>
                            )}
                            <Link href={`/markets/${market.id}`}>
                                <Card className="h-full border-2 hover:border-primary/50 hover:shadow-md transition-all">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={market.type === 'binary' ? 'default' : 'secondary'}>
                                                {market.type === 'binary' ? (
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <ListFilter className="h-3 w-3 mr-1" />
                                                )}
                                                {market.type === 'binary' ? 'Yes/No' : 'Multiple Choice'}
                                            </Badge>
                                            <Badge variant={market.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                                                {market.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="line-clamp-2">{market.name}</CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-muted-foreground line-clamp-2 mb-4">{market.description}</p>

                                        <div className="space-y-3">
                                            {topOutcomes.map((outcome) => (
                                                <div key={outcome.id} className="space-y-1">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-medium">{outcome.name}</span>
                                                        <span>{outcome.percentage}%</span>
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
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-0">
                                        <div className="flex items-center">
                                            <Users className="h-3 w-3 mr-1" />
                                            <span>{market.participants || 0}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <DollarSign className="h-3 w-3 mr-1" />
                                            <span>${market.poolAmount || 0}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            <span>{new Date(market.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </div>
                    );
                })}
            </div>

            {markets.length === 0 && (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-2">No markets found</h2>
                    <p className="text-muted-foreground mb-6">Be the first to create a prediction market!</p>
                    <Link href="/create">
                        <Button size="lg">Create Market</Button>
                    </Link>
                </div>
            )}

            {/* Admin section indicator */}
            {isUserAdmin && (
                <div className="mt-12 p-4 border rounded-md max-w-2xl mx-auto">
                    <p className="font-medium">Admin mode active</p>
                    <p className="text-sm">You can delete markets by clicking the trash icon in the top right corner of each market card.</p>
                </div>
            )}
        </div>
    );
}