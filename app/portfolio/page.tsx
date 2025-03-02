import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUp, DollarSign, PieChart, TrendingUp, Wallet, ChevronRight } from "lucide-react";

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
import { getUserPredictions, getAllPredictions } from "../actions/prediction-actions";
import { PredictionCard } from "@/components/prediction-card";
import { isAdmin } from "@/lib/utils";

// Mock data - would be replaced with actual API calls
const mockPortfolioData = {
    totalBalance: 2450.75,
    availableBalance: 1275.50,
    inMarkets: 1175.25,
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

    // Fetch user's predictions
    const predictionsResult = await getUserPredictions();
    const userPredictions = predictionsResult.success ? predictionsResult.predictions || [] : [];

    // For admin users, fetch all predictions
    const allPredictionsResult = isUserAdmin
        ? await getAllPredictions()
        : { success: false, predictions: [] };

    const allPredictions = allPredictionsResult.success
        ? allPredictionsResult.predictions || []
        : [];

    // Calculate portfolio metrics
    const totalPredictionAmount = userPredictions.reduce(
        (sum, prediction) => sum + prediction.amount,
        0
    );

    const totalBalance = mockPortfolioData.availableBalance + totalPredictionAmount;

    // Use mock data for profit/loss calculation until we have real data
    const totalProfitLoss = mockPortfolioData.activeMarkets.reduce(
        (sum, market) => sum + (market.currentValue - market.invested),
        0
    );

    const profitLossPercentage = (totalProfitLoss / totalPredictionAmount) * 100;

    return (
        <div className="container max-w-6xl py-10">
            <h1 className="text-3xl font-bold mb-6">Your Portfolio</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Total Balance Card */}
                <Card className="bg-primary text-primary-foreground">
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
                                    <ArrowUp className="mr-1 h-4 w-4 text-green-100" />
                                    <span className="text-green-100">
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
                            ${mockPortfolioData.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2">
                            <Button size="sm" className='items-center'>Deposit</Button>
                            <Button size="sm" variant="outline" className='items-center'>Withdraw</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* In Markets Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>In Prediction Markets</CardDescription>
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <PieChart className="mr-2 h-5 w-5 text-muted-foreground" />
                            ${totalPredictionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    <TabsTrigger value="active-markets">Active Markets</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
                            {userPredictions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {userPredictions.map((prediction) => (
                                        <PredictionCard
                                            key={prediction.id}
                                            prediction={prediction}
                                            isAdmin={isUserAdmin}
                                            marketOdds={{
                                                [prediction.outcomeId]: prediction.outcomeName === 'Yes' ? 65 :
                                                    prediction.outcomeName === 'No' ? 35 : 50
                                            }}
                                        />
                                    ))}
                                </div>
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

                <TabsContent value="active-markets">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Predictions</CardTitle>
                            <CardDescription>Your current positions in prediction markets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Market</TableHead>
                                        <TableHead>Prediction</TableHead>
                                        <TableHead className="text-right">Invested</TableHead>
                                        <TableHead className="text-right">Current Value</TableHead>
                                        <TableHead className="text-right">Profit/Loss</TableHead>
                                        <TableHead>End Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockPortfolioData.activeMarkets.map((market) => {
                                        const profitLoss = market.currentValue - market.invested;
                                        const profitLossPercentage = (profitLoss / market.invested) * 100;

                                        return (
                                            <TableRow key={market.id}>
                                                <TableCell className="font-medium">{market.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant={market.prediction === "Yes" ? "default" : "outline"}>
                                                        {market.prediction}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">${market.invested.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">${market.currentValue.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className={profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                                                        {profitLoss >= 0 ? "+" : ""}${profitLoss.toFixed(2)} ({profitLossPercentage.toFixed(2)}%)
                                                    </span>
                                                </TableCell>
                                                <TableCell>{new Date(market.endDate).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>Recent activity in your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockPortfolioData.recentTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="capitalize">{transaction.type}</TableCell>
                                            <TableCell>
                                                {transaction.type === "prediction" ? transaction.market : transaction.type}
                                            </TableCell>
                                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                            <TableCell className={`text-right ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        transaction.status === "completed" ? "outline" :
                                                            transaction.status === "active" ? "default" :
                                                                "secondary"
                                                    }
                                                >
                                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {allPredictions.map((prediction) => (
                                                <PredictionCard
                                                    key={prediction.id}
                                                    prediction={prediction}
                                                    isAdmin={true}
                                                    marketOdds={{
                                                        [prediction.outcomeId]: prediction.outcomeName === 'Yes' ? 65 :
                                                            prediction.outcomeName === 'No' ? 35 : 50
                                                    }}
                                                />
                                            ))}
                                        </div>
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
