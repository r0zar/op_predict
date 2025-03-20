import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowDown, ArrowUp, PieChart, Wallet, RefreshCcw, Clock, CheckCircle, InfoIcon,
    Trophy, PercentIcon, BarChart, Target, Gift, AlertTriangle, CreditCard
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserCustodyTransactions } from "../actions/custody-actions";
import { getCurrentUserStats } from "../actions/leaderboard-actions";
import { userBalanceStore } from "wisdom-sdk";
import { PredictionsTable } from "@/components/predictions-table";

export default async function PortfolioPage() {
    const user = await currentUser();

    // Redirect if not signed in
    if (!user) {
        redirect("/");
    }

    // Fetch user's transactions/predictions
    const predictionsResult = await getUserCustodyTransactions();
    const userPredictions = predictionsResult.success ? predictionsResult.transactions || [] : [];

    // Count and calculate unclaimed winnings
    const unclaimedPredictions = userPredictions.filter(p => p.status === 'won' && !p.redeemed);
    const totalUnclaimedAmount = unclaimedPredictions.reduce((sum, p) => sum + (p.potentialPayout || 0), 0);

    // Get user stats for the dashboard
    const userStatsResult = await getCurrentUserStats();
    const userStats = userStatsResult.success ? userStatsResult.stats : {
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        totalAmount: 0,
        totalEarnings: 0,
        pnl: 0
    };

    // Calculate PnL if not present
    if (userStats && !userStats.pnl) {
        userStats.pnl = (userStats.totalEarnings || 0) - (userStats.totalAmount || 0);
    }

    // Get user balance data
    const userBalance = await userBalanceStore.getUserBalance(user.id);

    // Set default values if balance doesn't exist (should never happen since we initialize on get)
    const availableBalance = (userBalance && userBalance.availableBalance) || 1000;
    const inPredictions = (userBalance && userBalance.inPredictions) || 0;
    const totalBalance = availableBalance + inPredictions;

    // Calculate portfolio metrics
    const totalPredictionAmount = userPredictions.reduce(
        (sum, prediction) => sum + prediction.amount,
        0
    );

    // Use the actual profit/loss from user stats
    const totalProfitLoss = userStats.pnl || 0;
    const profitLossPercentage = userStats.totalAmount > 0
        ? (totalProfitLoss / userStats.totalAmount) * 100
        : 0;

    return (
        <div className="container max-w-6xl py-10">
            <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Unclaimed Winnings Card - Only show if there are unclaimed winnings */}
                {unclaimedPredictions.length > 0 && (
                    <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800 shadow-md">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-green-700 dark:text-green-400 font-medium flex items-center">
                                <Gift className="h-4 w-4 mr-1" />
                                Unclaimed Winnings
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
                                ${totalUnclaimedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <div className="text-sm text-green-700 dark:text-green-400">
                                    {unclaimedPredictions.length} winning prediction{unclaimedPredictions.length !== 1 ? 's' : ''} ready to claim
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                        // Add smooth scroll to the predictions table
                                        document.getElementById('predictions-table')?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start'
                                        });
                                    }}
                                >
                                    View & Redeem
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Total Balance Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Balance</CardDescription>
                        <CardTitle className="text-3xl font-bold">
                            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm">
                            {totalProfitLoss >= 0 ? (
                                <div className="flex items-center">
                                    <ArrowUp className="mr-1 h-4 w-4 text-green-500/90" />
                                    <span className="text-green-500/90">
                                        ${totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({profitLossPercentage.toFixed(2)}%)
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <ArrowDown className="mr-1 h-4 w-4 text-red-300" />
                                    <span className="text-red-300">
                                        ${Math.abs(totalProfitLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({Math.abs(profitLossPercentage).toFixed(2)}%)
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Available Balance Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Available Balance</CardDescription>
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <Wallet className="mr-2 h-5 w-5 text-muted-foreground" />
                            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                className='items-center'
                                disabled
                                title="Deposit functionality coming soon"
                            >
                                Deposit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className='items-center'
                                disabled
                                title="Withdraw functionality coming soon"
                            >
                                Withdraw
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Earnings Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Earnings</CardDescription>
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <Trophy className="mr-2 h-5 w-5 text-muted-foreground" />
                            ${userStats.totalEarnings?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            {userStats.totalEarnings > 0 ? (
                                <span className="text-green-500/90">
                                    Won {userStats.correctPredictions || 0} predictions
                                </span>
                            ) : (
                                <span>No earnings yet</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* In Markets Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>In Prediction Markets</CardDescription>
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <PieChart className="mr-2 h-5 w-5 text-muted-foreground" />
                            ${inPredictions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            {(() => {
                                // Count unique market IDs for active predictions
                                const activeMarketIds = new Set(
                                    userPredictions
                                        .filter(p => p.status === 'pending')
                                        .map(p => p.marketId)
                                );
                                return `Active in ${activeMarketIds.size} markets`;
                            })()}
                        </div>
                    </CardContent>
                </Card>

                {/* Accuracy Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Prediction Accuracy</CardDescription>
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <Target className="mr-2 h-5 w-5 text-muted-foreground" />
                            {userStats.accuracy?.toFixed(1) || "0.0"}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            {userStats.correctPredictions || 0} correct out of {userStats.totalPredictions || 0} total
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card id="predictions-table">
                <CardHeader>
                    <CardTitle>Prediction Receipt NFTs</CardTitle>
                    <CardDescription>Your collection of prediction receipt NFTs</CardDescription>
                </CardHeader>
                <CardContent>
                    {userPredictions.length > 0 ? (
                        <>
                            <div className="bg-primary/50 border border-primary dark:border-primary rounded-lg p-4 mb-6 shadow-sm">
                                <div className="flex items-start">
                                    <div className="bg-secondary dark:bg-secondary/50 p-2 rounded-full mr-4 flex-shrink-0">
                                        <RefreshCcw className="h-5 w-5 text-secondary dark:text-secondary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary dark:text-secondary mb-2">Return Predictions</h3>
                                        <p className="text-sm dark:text-secondary mb-3">
                                            You can return predictions within 15 minutes of creation if they haven't been submitted to the blockchain yet.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-semibold">
                                            <div className="flex items-center dark:bg-secondary/20 rounded-md p-2">
                                                <Clock className="h-4 w-4 mr-2 text-secondary dark:text-secondary flex-shrink-0" />
                                                <span className="text-xs text-primary dark:text-primary">15-minute window</span>
                                            </div>
                                            <div className="flex items-center dark:bg-secondary/20 rounded-md p-2">
                                                <CheckCircle className="h-4 w-4 mr-2 text-secondary dark:text-secondary flex-shrink-0" />
                                                <span className="text-xs text-primary dark:text-primary">Full refund to balance</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Tabs defaultValue={unclaimedPredictions.length > 0 ? "redeemable" : "all"} className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="all">All ({userPredictions.length})</TabsTrigger>
                                    <TabsTrigger value="active">Active ({userPredictions.filter(p => p.status === 'pending').length})</TabsTrigger>
                                    <TabsTrigger value="redeemable" className={unclaimedPredictions.length ? "bg-green-100 text-green-700 data-[state=active]:bg-green-200" : ""}>
                                        Ready to Redeem ({unclaimedPredictions.length})
                                        {unclaimedPredictions.length > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-green-700 text-white text-xs font-bold">
                                                ${totalUnclaimedAmount.toFixed(2)}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="resolved">Resolved ({userPredictions.filter(p => p.status === 'won' || p.status === 'lost' || p.status === 'redeemed').length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="all">
                                    <PredictionsTable
                                        predictions={userPredictions}
                                        isAdmin={false}
                                    />
                                </TabsContent>

                                <TabsContent value="active">
                                    {userPredictions.filter(p => p.status === 'pending').length > 0 ? (
                                        <PredictionsTable
                                            predictions={userPredictions.filter(p => p.status === 'pending')}
                                            isAdmin={false}
                                        />
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-muted-foreground mb-4">You don't have any active predictions</p>
                                            <Link href="/markets">
                                                <Button>Explore Markets</Button>
                                            </Link>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="redeemable">
                                    {unclaimedPredictions.length > 0 ? (
                                        <div>
                                            {unclaimedPredictions.length > 1 && (
                                                <div className="bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 p-4 rounded-lg mb-4 flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <Gift className="h-5 w-5 mr-2" />
                                                        <span>You have {unclaimedPredictions.length} winning predictions totaling ${totalUnclaimedAmount.toFixed(2)}</span>
                                                    </div>
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700"
                                                        disabled={true} // Not implemented yet
                                                    >
                                                        Redeem All
                                                    </Button>
                                                </div>
                                            )}

                                            <PredictionsTable
                                                predictions={unclaimedPredictions}
                                                isAdmin={false}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-muted-foreground mb-4">You don't have any predictions ready to redeem</p>
                                            <Link href="/markets">
                                                <Button>Explore Markets</Button>
                                            </Link>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="resolved">
                                    {userPredictions.filter(p => p.status === 'won' || p.status === 'lost' || p.status === 'redeemed').length > 0 ? (
                                        <PredictionsTable
                                            predictions={userPredictions.filter(p => p.status === 'won' || p.status === 'lost' || p.status === 'redeemed')}
                                            isAdmin={false}
                                        />
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-muted-foreground mb-4">You don't have any resolved predictions yet</p>
                                            <Link href="/markets">
                                                <Button>Explore Markets</Button>
                                            </Link>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground mb-4">You don't have any prediction receipts yet</p>
                            <Link href="/markets">
                                <Button>Explore Markets</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
