'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { isAdmin } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ADMIN_USER_IDS } from "@/lib/utils";
import {
    getAllCustodyTransactions,
    findCustodyTransactions,
    deleteCustodyTransaction,
    triggerBatchProcessing,
    getPendingPredictions,
    getAllClaimRewardTransactions,
    syncSubmittedPredictionStatuses,
    getPendingClaimRewards,
    triggerBatchClaimRewardProcessing
} from '@/app/actions/custody-actions';
import {
    getMarkets,
    deleteMarket,
    resolveMarket,
    syncMarketsWithBlockchain
} from '@/app/actions/market-actions';
export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('debug');
    const [userId, setUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [adminUsers, setAdminUsers] = useState<string[]>([]);

    // Data debugging states
    const [marketId, setMarketId] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [transactionSignature, setTransactionSignature] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [markets, setMarkets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [debugOutput, setDebugOutput] = useState<string>('');
    const [pendingCount, setPendingCount] = useState(0);
    const [syncLoading, setSyncLoading] = useState(false);
    const [marketSyncLoading, setMarketSyncLoading] = useState(false);
    const [selectedMarketStatus, setSelectedMarketStatus] = useState<string>('active');

    // Handler to fetch markets by status
    const handleFetchMarkets = async (status = 'active') => {
        setLoading(true);
        setMarkets([]);
        setErrorMessage('');
        setResultMessage('');

        try {
            const result = await getMarkets({ status: status as any });
            if (result && result.items) {
                setMarkets(result.items);
                setResultMessage(`Found ${result.items.length} markets with status "${status}"`);
            } else {
                setErrorMessage('Failed to fetch markets');
            }
        } catch (error) {
            console.error('Error fetching markets:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Set initial admin users from constants and check for tab in URL
    useEffect(() => {
        setAdminUsers(ADMIN_USER_IDS);

        // Check for tab parameter in URL
        const tabParams = new URLSearchParams(window.location.search);
        const tab = tabParams.get('tab');
        if (tab) {
            setActiveTab(tab);
            // If markets tab is selected, load markets
            if (tab === 'markets') {
                handleFetchMarkets(selectedMarketStatus);
            }
        }
    }, []);

    // Load markets when status changes
    useEffect(() => {
        if (activeTab === 'markets') {
            handleFetchMarkets(selectedMarketStatus);
        }
    }, [selectedMarketStatus, activeTab]);

    // Check if user is admin
    if (isLoaded && user) {
        const userIsAdmin = isAdmin(user.id);

        if (!userIsAdmin) {
            // Redirect non-admin users
            redirect('/');
        }
    }

    if (!isLoaded) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }

    if (!user) {
        redirect('/');
    }

    // Handler to fetch all transactions
    const handleFetchAllTransactions = async () => {
        setLoading(true);
        setTransactions([]);
        setErrorMessage('');
        setResultMessage('');

        try {
            const result = await getAllCustodyTransactions();
            if (result.success && result.transactions) {
                setTransactions(result.transactions);
                setResultMessage(`Found ${result.transactions.length} transactions`);
            } else {
                setErrorMessage(result.error || 'Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handler to find transactions by market
    const handleFindMarketTransactions = async () => {
        if (!marketId) {
            setErrorMessage('Please enter a market ID');
            return;
        }

        setLoading(true);
        setTransactions([]);
        setErrorMessage('');
        setResultMessage('');

        try {
            const result = await findCustodyTransactions({ marketId });
            if (result.success && result.transactions) {
                setTransactions(result.transactions);
                setResultMessage(`Found ${result.transactions.length} transactions for market ${marketId}`);
            } else {
                setErrorMessage(result.error || 'Failed to find transactions');
            }
        } catch (error) {
            console.error('Error finding transactions:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handler to get pending predictions
    const handleGetPendingPredictions = async () => {
        if (!marketId) {
            setErrorMessage('Please enter a market ID');
            return;
        }

        setLoading(true);
        setTransactions([]);
        setErrorMessage('');
        setResultMessage('');

        try {
            const result = await getPendingPredictions(marketId);
            if (result.success) {
                setTransactions(result.pendingTransactions || []);
                setPendingCount(result.pendingCount || 0);
                setResultMessage(`Found ${result.pendingCount} pending predictions for market ${marketId}`);
            } else {
                setErrorMessage(result.error || 'Failed to get pending predictions');
            }
        } catch (error) {
            console.error('Error getting pending predictions:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handler to process batch
    const handleProcessBatch = async () => {
        if (!marketId) {
            setErrorMessage('Please enter a market ID');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setResultMessage('');

        try {
            const result = await triggerBatchProcessing(marketId);
            if (result.success) {
                setResultMessage(`Successfully processed ${result.batched} transactions. Transaction ID: ${result.txid || 'N/A'}`);
                // Refresh pending predictions after processing
                handleGetPendingPredictions();
            } else {
                setErrorMessage(result.error || 'Failed to process batch');
            }
        } catch (error) {
            console.error('Error processing batch:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handler to synchronize prediction statuses with blockchain
    const handleSyncPredictionStatuses = async () => {
        setSyncLoading(true);
        setErrorMessage('');
        setResultMessage('');

        try {
            const result = await syncSubmittedPredictionStatuses();

            if (result.success) {
                let message = `Successfully synchronized ${result.updated} predictions with blockchain.`;

                // Add details if available
                if (result.details) {
                    const details = result.details;
                    const detailsText = [
                        details.won ? `${details.won} won` : '',
                        details.lost ? `${details.lost} lost` : '',
                        details.pending ? `${details.pending} pending` : '',
                        details.redeemed ? `${details.redeemed} redeemed` : ''
                    ].filter(Boolean).join(', ');

                    if (detailsText) {
                        message += ` Details: ${detailsText}`;
                    }
                }

                setResultMessage(message);
            } else {
                setErrorMessage(result.error || 'Failed to synchronize prediction statuses');
            }
        } catch (error) {
            console.error('Error synchronizing prediction statuses:', error);
            setErrorMessage('An unexpected error occurred during synchronization');
        } finally {
            setSyncLoading(false);
        }
    };

    // Handler to synchronize markets with blockchain
    const handleSyncMarketsWithBlockchain = async () => {
        setMarketSyncLoading(true);
        setErrorMessage('');
        setResultMessage('');

        try {
            const result = await syncMarketsWithBlockchain();

            if (result.success) {
                const processedCount = result.processed || 0;
                const updatedCount = result.updated || 0;
                const errorsCount = result.errors || 0;

                let message = `Successfully checked ${processedCount} markets against blockchain.`;

                if (updatedCount > 0) {
                    message += ` Updated ${updatedCount} markets to match blockchain state.`;
                } else {
                    message += " All markets are already in sync with blockchain.";
                }

                if (errorsCount > 0) {
                    message += ` Encountered ${errorsCount} errors during synchronization.`;
                }

                // Optional: Display detailed results in debug output
                if ((result.syncResults ?? []).length > 0) {
                    setDebugOutput(formatJson(result.syncResults));
                }

                setResultMessage(message);

                // If markets were updated, refresh the market list
                if (updatedCount > 0) {
                    handleFetchMarkets(selectedMarketStatus);
                }
            } else {
                setErrorMessage(result.error || 'Failed to synchronize markets with blockchain');
            }
        } catch (error) {
            console.error('Error synchronizing markets with blockchain:', error);
            setErrorMessage('An unexpected error occurred during market synchronization');
        } finally {
            setMarketSyncLoading(false);
        }
    };

    // Handler to delete a transaction
    const handleDeleteTransaction = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            const result = await deleteCustodyTransaction(id);
            if (result.success) {
                setTransactions(prev => prev.filter(tx => tx.id !== id));
                setResultMessage(`Successfully deleted transaction ${id}`);
            } else {
                setErrorMessage(result.error || 'Failed to delete transaction');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Format JSON for display
    const formatJson = (data: any) => {
        return JSON.stringify(data, null, 2);
    };

    // Handler to delete a market
    const handleDeleteMarket = async (id: string) => {
        if (!confirm('Are you sure you want to delete this market? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            const result = await deleteMarket(id);
            if (result.success) {
                setMarkets(prev => prev.filter(m => m.id !== id));
                setResultMessage(`Successfully deleted market ${id}`);
            } else {
                setErrorMessage(result.error || 'Failed to delete market');
            }
        } catch (error) {
            console.error('Error deleting market:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handler to resolve a market
    const handleResolveMarket = async (marketId: string, winningOutcomeId: number) => {
        if (!confirm(`Are you sure you want to resolve this market with outcome ID ${winningOutcomeId}?`)) {
            return;
        }

        setLoading(true);
        try {
            const result = await resolveMarket({ marketId, winningOutcomeId });
            if (result.success) {
                // Refresh markets after resolution
                handleFetchMarkets(selectedMarketStatus);
                setResultMessage(`Successfully resolved market. Admin fee collected: $${result.adminFee?.toFixed(2)}`);
            } else {
                setErrorMessage(result.error || 'Failed to resolve market');
            }
        } catch (error) {
            console.error('Error resolving market:', error);
            setErrorMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSetAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Call the API to update user role
            const response = await fetch('/api/admin/set-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to set user as admin');
            }

            // Show success message

            // Add to local admin users list
            setAdminUsers(prev => [...prev, userId]);

            // Reset form
            setUserId('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-[1600px] mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs
                value={activeTab}
                defaultValue="debug"
                onValueChange={(value) => {
                    // Update URL with tab parameter
                    const url = new URL(window.location.href);
                    url.searchParams.set('tab', value);
                    window.history.pushState({}, '', url);

                    // Update active tab state
                    setActiveTab(value);

                    // Auto-load data for the markets tab
                    if (value === 'markets') {
                        handleFetchMarkets(selectedMarketStatus);
                    }
                }}
            >
                <div className="mb-6 border-b">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="admin">Admin Management</TabsTrigger>
                        <TabsTrigger value="debug">Data Debugging</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction Management</TabsTrigger>
                        <TabsTrigger value="markets">Market Management</TabsTrigger>
                        <TabsTrigger value="batch">Batch Processing</TabsTrigger>
                        <TabsTrigger value="claim-rewards">Claim Rewards</TabsTrigger>
                    </TabsList>
                </div>

                {/* Admin Management Tab */}
                <TabsContent value="admin">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Grant Admin Permissions</CardTitle>
                                <CardDescription>
                                    Add admin privileges to a user by their ID
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSetAdmin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="userId">User ID</Label>
                                        <Input
                                            id="userId"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            placeholder="user_2tkBcBEVGanm3LHkg6XK7j91DRj"
                                        />
                                        <p className="text-xs">
                                            The ID should be in the format: user_xxxxx
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Grant Admin Access'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Admin User List</CardTitle>
                                <CardDescription>
                                    List of current admin users
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {adminUsers.map((adminId) => (
                                        <div key={adminId} className="p-3 rounded border">
                                            <p className="font-medium">{adminId}</p>
                                            {adminId === "user_2tkBcBEVGanm3LHkg6XK7j91DRj" && (
                                                <p className="text-xs mt-1">Added recently</p>
                                            )}
                                        </div>
                                    ))}
                                    {adminUsers.length === 0 && (
                                        <p>No admin users found</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Data Debugging Tab */}
                <TabsContent value="debug">
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Debugging Tools</CardTitle>
                                <CardDescription>
                                    Tools to help debug and fix data issues
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Transaction Lookup */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Transaction Lookup</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label htmlFor="marketId" className="mb-1 block">Market ID</Label>
                                                <Input
                                                    id="marketId"
                                                    value={marketId}
                                                    onChange={(e) => setMarketId(e.target.value)}
                                                    placeholder="Enter market ID (optional)"
                                                />
                                            </div>
                                            <div className="flex items-end space-x-2">
                                                <Button
                                                    onClick={handleFindMarketTransactions}
                                                    disabled={loading || !marketId}
                                                    variant="outline"
                                                >
                                                    Find Market Transactions
                                                </Button>
                                                <Button
                                                    onClick={handleFetchAllTransactions}
                                                    disabled={loading}
                                                >
                                                    Fetch All Transactions
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    {resultMessage && (
                                        <div className="p-3 rounded border">
                                            {resultMessage}
                                        </div>
                                    )}

                                    {errorMessage && (
                                        <div className="p-3 rounded border border-destructive">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="p-3 rounded border">
                                            Loading...
                                        </div>
                                    )}

                                    {/* Transaction List */}
                                    {transactions.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium">Transaction Results ({transactions.length})</h3>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Group transactions by market ID
                                                            const marketGroups = transactions.reduce((acc, tx) => {
                                                                const marketId = tx.marketId || 'unknown';
                                                                if (!acc[marketId]) {
                                                                    acc[marketId] = [];
                                                                }
                                                                acc[marketId].push(tx);
                                                                return acc;
                                                            }, {} as Record<string, any[]>);

                                                            // Create summary
                                                            const summary = {
                                                                total: transactions.length,
                                                                byMarket: Object.entries(marketGroups).map(([marketId, txs]: any) => ({
                                                                    marketId,
                                                                    count: txs.length,
                                                                    pendingCount: txs.filter(tx => tx.status === 'pending').length,
                                                                    confirmedCount: txs.filter(tx => tx.status === 'confirmed').length,
                                                                    submittedCount: txs.filter(tx => tx.status === 'submitted').length,
                                                                    rejectedCount: txs.filter(tx => tx.status === 'rejected').length,
                                                                })),
                                                                byStatus: {
                                                                    pending: transactions.filter(tx => tx.status === 'pending').length,
                                                                    confirmed: transactions.filter(tx => tx.status === 'confirmed').length,
                                                                    submitted: transactions.filter(tx => tx.status === 'submitted').length,
                                                                    rejected: transactions.filter(tx => tx.status === 'rejected').length,
                                                                },
                                                                byType: {
                                                                    predict: transactions.filter(tx => tx.type === 'predict').length,
                                                                    transfer: transactions.filter(tx => tx.type === 'transfer').length,
                                                                    claimReward: transactions.filter(tx => tx.type === 'claim-reward').length,
                                                                }
                                                            };

                                                            setDebugOutput(formatJson(summary));
                                                        }}
                                                    >
                                                        View Summary
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.print()}
                                                    >
                                                        Print
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Debug output area */}
                                            {debugOutput && (
                                                <div className="mb-4 p-4 border rounded">
                                                    <h4 className="font-medium mb-2">Summary</h4>
                                                    <pre className="text-xs p-2 rounded overflow-x-auto border bg-muted">
                                                        {debugOutput}
                                                    </pre>
                                                    <div className="flex justify-end mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDebugOutput('')}
                                                        >
                                                            Close
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Table view for transactions */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left p-2">ID</th>
                                                            <th className="text-left p-2">Market ID</th>
                                                            <th className="text-left p-2">Status</th>
                                                            <th className="text-left p-2">Type</th>
                                                            <th className="text-left p-2">Date</th>
                                                            <th className="text-left p-2">User</th>
                                                            <th className="text-right p-2">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.map((tx, index) => (
                                                            <tr key={tx.id || index} className="border-b hover:bg-muted/50">
                                                                <td className="p-2 font-mono text-xs">{tx.id}</td>
                                                                <td className="p-2 font-mono text-xs">{tx.marketId || 'N/A'}</td>
                                                                <td className="p-2 font-mono text-xs">
                                                                    <span className={
                                                                        tx.status === 'pending' ? 'text-yellow-500' :
                                                                            tx.status === 'confirmed' ? 'text-green-500' :
                                                                                tx.status === 'rejected' ? 'text-red-500' :
                                                                                    'text-blue-500'
                                                                    }>
                                                                        {tx.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-2 font-mono text-xs">{tx.type}</td>
                                                                <td className="p-2 text-xs">{new Date(tx.takenCustodyAt).toLocaleString()}</td>
                                                                <td className="p-2 font-mono text-xs">{tx.userId}</td>
                                                                <td className="p-2 text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            // Toggle expanded state for this transaction
                                                                            const txIndex = transactions.findIndex(t => t.id === tx.id);
                                                                            if (txIndex !== -1) {
                                                                                setTransactions(prev => {
                                                                                    const newTxs = [...prev];
                                                                                    newTxs[txIndex] = { ...newTxs[txIndex], expanded: !newTxs[txIndex].expanded };
                                                                                    return newTxs;
                                                                                });
                                                                            }
                                                                        }}
                                                                    >
                                                                        Details
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteTransaction(tx.id)}
                                                                        disabled={loading}
                                                                        className="ml-2"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Selected transaction details */}
                                            {transactions.some(tx => tx.expanded) && (
                                                <div className="mt-4 p-4 border rounded">
                                                    <h4 className="font-medium mb-2">Transaction Details</h4>
                                                    {transactions.filter(tx => tx.expanded).map(tx => (
                                                        <div key={`details-${tx.id}`}>
                                                            <pre className="text-xs p-2 rounded overflow-x-auto border bg-muted">
                                                                {formatJson(tx)}
                                                            </pre>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Transaction Management Tab */}
                <TabsContent value="transactions">
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Management</CardTitle>
                                <CardDescription>
                                    Manage and process transactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Transaction Lookup */}
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Transaction Management</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label htmlFor="transactionId" className="mb-1 block">Transaction ID</Label>
                                                <Input
                                                    id="transactionId"
                                                    value={transactionId}
                                                    onChange={(e) => setTransactionId(e.target.value)}
                                                    placeholder="Enter transaction ID"
                                                />
                                            </div>
                                            <div className="flex items-end space-x-2">
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => transactionId && handleDeleteTransaction(transactionId)}
                                                    disabled={loading || !transactionId}
                                                >
                                                    Delete Transaction
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    {resultMessage && (
                                        <div className="p-3 rounded border">
                                            {resultMessage}
                                        </div>
                                    )}

                                    {errorMessage && (
                                        <div className="p-3 rounded border border-destructive">
                                            {errorMessage}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Market Management Tab */}
                <TabsContent value="markets">
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Market Management</CardTitle>
                                <CardDescription>
                                    View, edit, and resolve markets
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Market Controls</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label htmlFor="marketStatus" className="mb-1 block">Market Status</Label>
                                                <Select
                                                    value={selectedMarketStatus}
                                                    onValueChange={(value) => {
                                                        setSelectedMarketStatus(value);
                                                    }}
                                                >
                                                    <SelectTrigger id="marketStatus">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="resolved">Resolved</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        <SelectItem value="all">All</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-end space-x-2">
                                                <Button
                                                    onClick={() => handleFetchMarkets(selectedMarketStatus)}
                                                    disabled={loading || marketSyncLoading}
                                                >
                                                    Fetch Markets
                                                </Button>
                                                <Button
                                                    onClick={handleSyncMarketsWithBlockchain}
                                                    disabled={marketSyncLoading}
                                                    variant="outline"
                                                    className="bg-blue-100 hover:bg-blue-200"
                                                >
                                                    {marketSyncLoading ? 'Syncing...' : 'Sync with Blockchain'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    {resultMessage && (
                                        <div className="p-3 rounded border">
                                            {resultMessage}
                                        </div>
                                    )}

                                    {errorMessage && (
                                        <div className="p-3 rounded border border-destructive">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="p-3 rounded border">
                                            Loading...
                                        </div>
                                    )}

                                    {/* Markets List */}
                                    {markets.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium">Markets ({markets.length})</h3>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Create summary of markets
                                                            const summary = {
                                                                total: markets.length,
                                                                byCategory: markets.reduce((acc, market) => {
                                                                    const category = market.category || 'uncategorized';
                                                                    acc[category] = (acc[category] || 0) + 1;
                                                                    return acc;
                                                                }, {}),
                                                                byStatus: {
                                                                    active: markets.filter(m => m.status === 'active').length,
                                                                    resolved: markets.filter(m => m.status === 'resolved').length,
                                                                    cancelled: markets.filter(m => m.status === 'cancelled').length,
                                                                }
                                                            };
                                                            setDebugOutput(formatJson(summary));
                                                        }}
                                                    >
                                                        View Summary
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Debug output area */}
                                            {debugOutput && (
                                                <div className="mb-4 p-4 border rounded">
                                                    <h4 className="font-medium mb-2">Summary</h4>
                                                    <pre className="text-xs p-2 rounded overflow-x-auto border bg-muted">
                                                        {debugOutput}
                                                    </pre>
                                                    <div className="flex justify-end mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDebugOutput('')}
                                                        >
                                                            Close
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Table view for markets */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left p-2">ID</th>
                                                            <th className="text-left p-2">Name</th>
                                                            <th className="text-left p-2">Status</th>
                                                            <th className="text-left p-2">Category</th>
                                                            <th className="text-left p-2">End Date</th>
                                                            <th className="text-right p-2">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {markets.map((market, index) => (
                                                            <>
                                                                <tr key={market.id || index} className="border-b hover:bg-muted/50">
                                                                    <td className="p-2 font-mono text-xs">{market.id}</td>
                                                                    <td className="p-2">{market.name}</td>
                                                                    <td className="p-2">
                                                                        <span className={
                                                                            market.status === 'active' ? 'text-green-500' :
                                                                                market.status === 'resolved' ? 'text-blue-500' :
                                                                                    'text-red-500'
                                                                        }>
                                                                            {market.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-2">{market.category || 'general'}</td>
                                                                    <td className="p-2">{new Date(market.endDate).toLocaleString()}</td>
                                                                    <td className="p-2 text-right">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                // Toggle expanded state for this market
                                                                                const marketIndex = markets.findIndex(m => m.id === market.id);
                                                                                if (marketIndex !== -1) {
                                                                                    setMarkets(prev => {
                                                                                        const newMarkets = [...prev];
                                                                                        newMarkets[marketIndex] = { ...newMarkets[marketIndex], expanded: !newMarkets[marketIndex].expanded };
                                                                                        return newMarkets;
                                                                                    });
                                                                                }
                                                                            }}
                                                                        >
                                                                            {market.expanded ? 'Hide' : 'Details'}
                                                                        </Button>
                                                                        {market.status === 'active' && (
                                                                            <Select
                                                                                onValueChange={(value) => {
                                                                                    if (value && value !== "choose") {
                                                                                        handleResolveMarket(market.id, parseInt(value));
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="ml-2 h-8 text-xs">
                                                                                    <SelectValue placeholder="Resolve" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="choose" disabled>Choose outcome</SelectItem>
                                                                                    {market.outcomes?.map((outcome: any) => (
                                                                                        <SelectItem key={outcome.id} value={outcome.id.toString()}>
                                                                                            {outcome.name}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteMarket(market.id)}
                                                                            disabled={loading}
                                                                            className="ml-2"
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                                {market.expanded && (
                                                                    <tr>
                                                                        <td colSpan={6} className="p-0 border-b">
                                                                            <div className="p-4 bg-muted/20">
                                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                                                                    <div>
                                                                                        <h4 className="font-medium mb-2">Details</h4>
                                                                                        <dl className="space-y-2 text-sm">
                                                                                            <div>
                                                                                                <dt className="font-medium">ID:</dt>
                                                                                                <dd className="font-mono">{market.id}</dd>
                                                                                            </div>
                                                                                            <div>
                                                                                                <dt className="font-medium">Created By:</dt>
                                                                                                <dd className="font-mono">{market.createdBy}</dd>
                                                                                            </div>
                                                                                            <div>
                                                                                                <dt className="font-medium">Created At:</dt>
                                                                                                <dd>{new Date(market.createdAt).toLocaleString()}</dd>
                                                                                            </div>
                                                                                            {market.resolvedAt && (
                                                                                                <div>
                                                                                                    <dt className="font-medium">Resolved At:</dt>
                                                                                                    <dd>{new Date(market.resolvedAt).toLocaleString()}</dd>
                                                                                                </div>
                                                                                            )}
                                                                                            <div>
                                                                                                <dt className="font-medium">Description:</dt>
                                                                                                <dd className="whitespace-pre-wrap">{market.description}</dd>
                                                                                            </div>
                                                                                        </dl>
                                                                                    </div>
                                                                                    <div>
                                                                                        <h4 className="font-medium mb-2">Outcomes</h4>
                                                                                        <div className="space-y-2">
                                                                                            {market.outcomes?.map((outcome: any) => (
                                                                                                <div key={outcome.id} className={`p-2 border rounded ${outcome.id === market.resolvedOutcomeId ? 'border-green-500 bg-green-50' : ''}`}>
                                                                                                    <p className="font-medium">
                                                                                                        {outcome.name} {outcome.id === market.resolvedOutcomeId && '(Winner)'}
                                                                                                    </p>
                                                                                                    <p className="text-xs font-mono">ID: {outcome.id}</p>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <details className="text-sm">
                                                                                    <summary className="cursor-pointer font-medium">Raw JSON Data</summary>
                                                                                    <pre className="mt-2 text-xs p-2 rounded overflow-x-auto border bg-muted">
                                                                                        {formatJson(market)}
                                                                                    </pre>
                                                                                </details>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Batch Processing Tab */}
                <TabsContent value="batch">
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Batch Processing</CardTitle>
                                <CardDescription>
                                    Process pending predictions in batch
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Process Pending Predictions</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label htmlFor="batchMarketId" className="mb-1 block">Market ID</Label>
                                                <Input
                                                    id="batchMarketId"
                                                    value={marketId}
                                                    onChange={(e) => setMarketId(e.target.value)}
                                                    placeholder="Enter market ID"
                                                />
                                            </div>
                                            <div className="flex items-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleGetPendingPredictions}
                                                    disabled={loading || !marketId}
                                                >
                                                    Check Pending
                                                </Button>
                                                <Button
                                                    onClick={handleProcessBatch}
                                                    disabled={loading || !marketId}
                                                >
                                                    Process Batch
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4 mt-6">
                                            <h3 className="text-lg font-medium mb-2">Blockchain Synchronization</h3>
                                            <div className="flex flex-col space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Synchronize prediction statuses with the blockchain. This will
                                                    update the status of all submitted predictions based on their
                                                    actual state on the blockchain.
                                                </p>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        onClick={handleSyncPredictionStatuses}
                                                        disabled={syncLoading}
                                                        variant="default"
                                                    >
                                                        {syncLoading ? 'Synchronizing...' : 'Sync Prediction Statuses with Blockchain'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    {resultMessage && (
                                        <div className="p-3 rounded border">
                                            {resultMessage}
                                        </div>
                                    )}

                                    {errorMessage && (
                                        <div className="p-3 rounded border border-destructive">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Pending Predictions */}
                                    {pendingCount > 0 && (
                                        <div className="p-3 rounded border">
                                            Found {pendingCount} pending predictions that need processing.
                                        </div>
                                    )}

                                    {/* Transaction List */}
                                    {transactions.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium">Pending Predictions ({transactions.length})</h3>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Group transactions by market ID
                                                            const marketGroups = transactions.reduce((acc, tx) => {
                                                                const marketId = tx.marketId || 'unknown';
                                                                if (!acc[marketId]) {
                                                                    acc[marketId] = [];
                                                                }
                                                                acc[marketId].push(tx);
                                                                return acc;
                                                            }, {} as Record<string, any[]>);

                                                            // Create summary
                                                            const summary = {
                                                                total: transactions.length,
                                                                byMarket: Object.entries(marketGroups).map(([marketId, txs]: any) => ({
                                                                    marketId,
                                                                    count: txs.length,
                                                                    totalAmount: txs.reduce((sum, tx) => sum + (tx.amount || 0), 0),
                                                                    byOutcome: txs.reduce((acc, tx) => {
                                                                        const outcomeId = tx.outcomeId?.toString() || 'unknown';
                                                                        if (!acc[outcomeId]) {
                                                                            acc[outcomeId] = 0;
                                                                        }
                                                                        acc[outcomeId]++;
                                                                        return acc;
                                                                    }, {} as Record<string, number>)
                                                                })),
                                                                pendingAge: {
                                                                    averageMinutes: Math.round(transactions.reduce((sum, tx) =>
                                                                        sum + Math.floor((Date.now() - new Date(tx.takenCustodyAt).getTime()) / (1000 * 60)), 0) / transactions.length),
                                                                    oldest: Math.max(...transactions.map(tx =>
                                                                        Math.floor((Date.now() - new Date(tx.takenCustodyAt).getTime()) / (1000 * 60)))),
                                                                    newest: Math.min(...transactions.map(tx =>
                                                                        Math.floor((Date.now() - new Date(tx.takenCustodyAt).getTime()) / (1000 * 60))))
                                                                }
                                                            };

                                                            setDebugOutput(formatJson(summary));
                                                        }}
                                                    >
                                                        View Summary
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.print()}
                                                    >
                                                        Print
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Debug output area */}
                                            {debugOutput && (
                                                <div className="mb-4 p-4 border rounded">
                                                    <h4 className="font-medium mb-2">Summary</h4>
                                                    <pre className="text-xs p-2 rounded overflow-x-auto border bg-muted">
                                                        {debugOutput}
                                                    </pre>
                                                    <div className="flex justify-end mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDebugOutput('')}
                                                        >
                                                            Close
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Table view for transactions */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left p-2">ID</th>
                                                            <th className="text-left p-2">Market ID</th>
                                                            <th className="text-left p-2">Amount</th>
                                                            <th className="text-left p-2">Outcome</th>
                                                            <th className="text-left p-2">Age (min)</th>
                                                            <th className="text-left p-2">User</th>
                                                            <th className="text-right p-2">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.map((tx, index) => (
                                                            <tr key={tx.id || index} className="border-b hover:bg-muted/50">
                                                                <td className="p-2 font-mono text-xs">{tx.id}</td>
                                                                <td className="p-2">{tx.marketId || 'N/A'}</td>
                                                                <td className="p-2">${tx.amount || 0}</td>
                                                                <td className="p-2">{tx.outcomeName || tx.outcomeId || 'N/A'}</td>
                                                                <td className="p-2">{Math.floor((Date.now() - new Date(tx.takenCustodyAt).getTime()) / (1000 * 60))}</td>
                                                                <td className="p-2 font-mono text-xs">{tx.userId}</td>
                                                                <td className="p-2 text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            // Toggle expanded state for this transaction
                                                                            const txIndex = transactions.findIndex(t => t.id === tx.id);
                                                                            if (txIndex !== -1) {
                                                                                setTransactions(prev => {
                                                                                    const newTxs = [...prev];
                                                                                    newTxs[txIndex] = { ...newTxs[txIndex], expanded: !newTxs[txIndex].expanded };
                                                                                    return newTxs;
                                                                                });
                                                                            }
                                                                        }}
                                                                    >
                                                                        Details
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteTransaction(tx.id)}
                                                                        disabled={loading}
                                                                        className="ml-2"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Selected transaction details */}
                                            {transactions.some(tx => tx.expanded) && (
                                                <div className="mt-4 p-4 border rounded">
                                                    <h4 className="font-medium mb-2">Transaction Details</h4>
                                                    {transactions.filter(tx => tx.expanded).map(tx => (
                                                        <div key={`details-${tx.id}`}>
                                                            <pre className="text-xs p-2 rounded overflow-x-auto border bg-muted">
                                                                {formatJson(tx)}
                                                            </pre>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Claim Rewards Tab */}
                <TabsContent value="claim-rewards">
                    <div className="grid grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Claim Rewards Management</CardTitle>
                                <CardDescription>
                                    Process and monitor claim reward transactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Claim Rewards Management</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex flex-col space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    View and process pending claim reward transactions. These are rewards that
                                                    users have requested to claim, but have not yet been processed on the blockchain.
                                                </p>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            setTransactions([]);
                                                            setErrorMessage('');
                                                            setResultMessage('');
                                                            setPendingCount(0);

                                                            try {
                                                                const result = await getPendingClaimRewards();
                                                                if (result.success) {
                                                                    setTransactions(result.pendingTransactions || []);
                                                                    setPendingCount(result.pendingCount || 0);
                                                                    setResultMessage(`Found ${result.pendingCount} pending claim rewards`);
                                                                } else {
                                                                    setErrorMessage(result.error || 'Failed to get pending claim rewards');
                                                                }
                                                            } catch (error) {
                                                                console.error('Error getting pending claim rewards:', error);
                                                                setErrorMessage('An unexpected error occurred');
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        Check Pending Claim Rewards
                                                    </Button>
                                                    <Button
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            setErrorMessage('');
                                                            setResultMessage('');

                                                            try {
                                                                const result = await triggerBatchClaimRewardProcessing();
                                                                if (result.success) {
                                                                    setResultMessage(`Successfully processed ${result.batched} claim rewards. Transaction ID: ${result.txid || 'N/A'}`);

                                                                    // Refresh pending claim rewards after processing
                                                                    const pendingResult = await getPendingClaimRewards();
                                                                    if (pendingResult.success) {
                                                                        setTransactions(pendingResult.pendingTransactions || []);
                                                                        setPendingCount(pendingResult.pendingCount || 0);
                                                                    }
                                                                } else {
                                                                    setErrorMessage(result.error || 'Failed to process claim rewards');
                                                                }
                                                            } catch (error) {
                                                                console.error('Error processing claim rewards:', error);
                                                                setErrorMessage('An unexpected error occurred');
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        Process Pending Claim Rewards
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-4">
                                                <p className="text-sm text-muted-foreground flex-auto">
                                                    View all claim reward transactions in the system, regardless of status.
                                                </p>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            setTransactions([]);
                                                            setErrorMessage('');
                                                            setResultMessage('');

                                                            try {
                                                                const result = await getAllClaimRewardTransactions();
                                                                if (result.success && result.transactions) {
                                                                    setTransactions(result.transactions);
                                                                    setResultMessage(`Found ${result.transactions.length} claim reward transactions`);
                                                                } else {
                                                                    setErrorMessage(result.error || 'Failed to fetch claim reward transactions');
                                                                }
                                                            } catch (error) {
                                                                console.error('Error fetching claim reward transactions:', error);
                                                                setErrorMessage('An unexpected error occurred');
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        View All Claim Reward Transactions
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    {resultMessage && (
                                        <div className="p-3 rounded border">
                                            {resultMessage}
                                        </div>
                                    )}

                                    {errorMessage && (
                                        <div className="p-3 rounded border border-destructive">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="p-3 rounded border">
                                            Loading...
                                        </div>
                                    )}

                                    {/* Pending Claim Rewards */}
                                    {pendingCount > 0 && (
                                        <div className="p-3 rounded border">
                                            Found {pendingCount} pending claim rewards that need processing.
                                        </div>
                                    )}

                                    {/* Transaction List */}
                                    {transactions.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium">Claim Reward Transactions ({transactions.length})</h3>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Create summary stats for claim rewards
                                                            const summary = {
                                                                total: transactions.length,
                                                                byStatus: {
                                                                    pending: transactions.filter(tx => tx.status === 'pending').length,
                                                                    confirmed: transactions.filter(tx => tx.status === 'confirmed').length,
                                                                    submitted: transactions.filter(tx => tx.status === 'submitted').length,
                                                                    rejected: transactions.filter(tx => tx.status === 'rejected').length,
                                                                },
                                                                pendingAge: transactions.filter(tx => tx.status === 'pending').length > 0 ? {
                                                                    averageMinutes: Math.round(transactions.filter(tx => tx.status === 'pending').reduce((sum, tx) =>
                                                                        sum + Math.floor((Date.now() - new Date(tx.createdAt).getTime()) / (1000 * 60)), 0) /
                                                                        transactions.filter(tx => tx.status === 'pending').length),
                                                                    oldest: Math.max(...transactions.filter(tx => tx.status === 'pending').map(tx =>
                                                                        Math.floor((Date.now() - new Date(tx.createdAt).getTime()) / (1000 * 60)))),
                                                                    newest: Math.min(...transactions.filter(tx => tx.status === 'pending').map(tx =>
                                                                        Math.floor((Date.now() - new Date(tx.createdAt).getTime()) / (1000 * 60))))
                                                                } : 'No pending transactions',
                                                                totalAmount: transactions.reduce((sum, tx) => sum + (tx.potentialPayout || 0), 0)
                                                            };

                                                            setDebugOutput(formatJson(summary));
                                                        }}
                                                    >
                                                        View Summary
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Debug output area */}
                                            {debugOutput && (
                                                <div className="mb-4 p-4 border rounded">
                                                    <h4 className="font-medium mb-2">Summary</h4>
                                                    <pre className="text-xs p-2 rounded overflow-x-auto border bg-muted">
                                                        {debugOutput}
                                                    </pre>
                                                    <div className="flex justify-end mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDebugOutput('')}
                                                        >
                                                            Close
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Table view for transactions */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left p-2">ID</th>
                                                            <th className="text-left p-2">Receipt ID</th>
                                                            <th className="text-left p-2">Status</th>
                                                            <th className="text-left p-2">Amount</th>
                                                            <th className="text-left p-2">Age</th>
                                                            <th className="text-left p-2">User</th>
                                                            <th className="text-right p-2">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.map((tx, index) => (
                                                            <tr key={tx.id || index} className="border-b hover:bg-muted/50">
                                                                <td className="p-2 font-mono text-xs">{tx.id}</td>
                                                                <td className="p-2 font-mono text-xs">{tx.receiptId ? `${tx.receiptId}` : '...'}</td>
                                                                <td className="p-2">
                                                                    <span className={
                                                                        tx.status === 'pending' ? 'text-yellow-500' :
                                                                            tx.status === 'confirmed' ? 'text-green-500' :
                                                                                tx.status === 'rejected' ? 'text-red-500' :
                                                                                    'text-blue-500'
                                                                    }>
                                                                        {tx.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-2">${tx.potentialPayout || 0}</td>
                                                                <td className="p-2">{Math.floor((Date.now() - new Date(tx.createdAt).getTime()) / (1000 * 60))} min</td>
                                                                <td className="p-2 font-mono text-xs">{tx.userId}</td>
                                                                <td className="p-2 text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            // Toggle expanded state for this transaction
                                                                            const txIndex = transactions.findIndex(t => t.id === tx.id);
                                                                            if (txIndex !== -1) {
                                                                                setTransactions(prev => {
                                                                                    const newTxs = [...prev];
                                                                                    newTxs[txIndex] = { ...newTxs[txIndex], expanded: !newTxs[txIndex].expanded };
                                                                                    return newTxs;
                                                                                });
                                                                            }
                                                                        }}
                                                                    >
                                                                        Details
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteTransaction(tx.id)}
                                                                        disabled={loading}
                                                                        className="ml-2"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Selected transaction details */}
                                            {transactions.some(tx => tx.expanded) && (
                                                <div className="mt-4 p-4 border rounded">
                                                    <h4 className="font-medium mb-2">Transaction Details</h4>
                                                    {transactions.filter(tx => tx.expanded).map(tx => (
                                                        <div key={`details-${tx.id}`}>
                                                            <pre className="text-xs p-2 rounded overflow-x-auto border bg-muted">
                                                                {formatJson(tx)}
                                                            </pre>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}