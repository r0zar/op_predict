import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUp, DollarSign, PieChart, TrendingUp, Wallet, ChevronRight, RefreshCcw, Clock, CheckCircle } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getUserCustodyTransactions, getAllCustodyTransactions } from "../actions/custody-actions";
import { isAdmin } from "@/lib/utils";
import { userBalanceStore } from "wisdom-sdk";
import { PredictionsTable } from "@/components/predictions-table";

// Mock data - used only for transactions and active markets until we implement those fully
const mockPortfolioData = {
    recentTransactions: [
        { id: 1, type: "deposit", amount: 500, date: "2023-07-15", status: "completed" },
        { id: 2, type: "prediction", amount: -200, date: "2023-07-16", market: "Will Bitcoin reach $100k by end of 2025?", status: "active" },
        { id: 3, type: "prediction", amount: -350, date: "2023-07-18", market: "Will Ethereum 2.0 launch before July 2025?", status: "active" },
        { id: 4, type: "withdrawal", amount: -100, date: "2023-07-20", status: "completed" },
        { id: 5, type: "prediction", amount: -625.25, date: "2023-07-22", market: "Will Apple release a foldable device in 2025?", status: "active" },
    ],
    activeMarkets: [
        { id: 1, title: "Will Bitcoin reach $100k by end of 2025?", invested: 200, currentValue: 320, prediction: "Yes", endDate: "2025-12-31" },
        { id: 2, title: "Will Ethereum 2.0 launch before July 2025?", invested: 350, currentValue: 280, prediction: "Yes", endDate: "2025-06-30" },
        { id: 3, title: "Will Apple release a foldable device in 2025?", invested: 625.25, currentValue: 575.25, prediction: "No", endDate: "2025-12-31" },
    ]
};

export default async function PortfolioPage() {
    const user = await currentUser();

    // Redirect if not signed in
    if (!user) {
        redirect("/");
    }

    // Check if user is an admin
    const isUserAdmin = isAdmin(user.id);

    // Fetch user's transactions/predictions
    const predictionsResult = await getUserCustodyTransactions();
    const userPredictions = predictionsResult.success ? predictionsResult.transactions || [] : [];

    // For admin users, fetch all transactions/predictions
    const allPredictionsResult = isUserAdmin
        ? await getAllCustodyTransactions()
        : { success: false, transactions: [] };

    const allPredictions = allPredictionsResult.success
        ? allPredictionsResult.transactions || []
        : [];

    // Import function to get user names
    const { getUserNameById } = await import("@/lib/clerk-user");

    // Get creator names for the user's predictions
    const userPredictionsWithCreatorNames = await Promise.all(
        userPredictions.map(async (prediction) => {
            const creatorName = await getUserNameById(prediction.userId);
            return { ...prediction, creatorName };
        })
    );

    // Get creator names for all predictions (admin view)
    const allPredictionsWithCreatorNames = isUserAdmin
        ? await Promise.all(
            allPredictions.map(async (prediction) => {
                const creatorName = await getUserNameById(prediction.userId);
                return { ...prediction, creatorName };
            })
        )
        : [];

    // Get user balance data
    const userBalance: any = await userBalanceStore.getUserBalance(user.id);

    // Set default values if balance doesn't exist (should never happen since we initialize on get)
    const availableBalance = (userBalance && userBalance.availableBalance) || 1000;
    const inPredictions = (userBalance && userBalance.inPredictions) || 0;
    const totalBalance = availableBalance + inPredictions;

    // Calculate portfolio metrics
    const totalPredictionAmount = userPredictions.reduce(
        (sum, prediction) => sum + prediction.amount,
        0
    );

    // Use mock data for profit/loss calculation until we have real data
    const totalProfitLoss = mockPortfolioData.activeMarkets.reduce(
        (sum, market) => sum + (market.currentValue - market.invested),
        0
    );

    const profitLossPercentage = totalPredictionAmount > 0
        ? (totalProfitLoss / totalPredictionAmount) * 100
        : 0;

    return (
        <div className="container max-w-6xl py-10">
            <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Total Balance Card */}
                <Card className="">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-primary-foreground/80">Total Balance</CardDescription>
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
                            Active in {userPredictions.length} markets
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="prediction-receipts" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="prediction-receipts">Prediction Receipts</TabsTrigger>
                    {isUserAdmin && (
                        <TabsTrigger value="admin-management">Admin</TabsTrigger>
                    )}
                </TabsList>

                {/* Prediction Receipts Tab */}
                <TabsContent value="prediction-receipts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Prediction Receipt NFTs</CardTitle>
                            <CardDescription>Your collection of prediction receipt NFTs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {userPredictionsWithCreatorNames.length > 0 ? (
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
                                    <PredictionsTable
                                        predictions={userPredictionsWithCreatorNames}
                                        isAdmin={isUserAdmin}
                                    />
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
                </TabsContent>

                {/* Admin Management Tab */}
                {isUserAdmin && (
                    <TabsContent value="admin-management">
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin: All Predictions</CardTitle>
                                <CardDescription>Manage all prediction receipts from all users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allPredictions.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="text-sm text-muted-foreground mb-4">
                                            Showing {allPredictions.length} prediction receipts from all users
                                        </div>
                                        <PredictionsTable
                                            predictions={allPredictionsWithCreatorNames}
                                            isAdmin={true}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-muted-foreground mb-4">No prediction receipts found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
