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
    getPendingPredictions
} from '@/app/actions/custody-actions';

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [adminUsers, setAdminUsers] = useState<string[]>([]);

    // Data debugging states
    const [marketId, setMarketId] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [transactionSignature, setTransactionSignature] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [debugOutput, setDebugOutput] = useState<string>('');
    const [pendingCount, setPendingCount] = useState(0);

    // Set initial admin users from constants
    useEffect(() => {
        setAdminUsers(ADMIN_USER_IDS);
    }, []);

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
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <Tabs defaultValue="debug">
                <div className="mb-6 border-b">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="admin">Admin Management</TabsTrigger>
                        <TabsTrigger value="debug">Data Debugging</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction Management</TabsTrigger>
                        <TabsTrigger value="batch">Batch Processing</TabsTrigger>
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
                                                                <td className="p-2 font-mono text-xs">{tx.id.substring(0, 10)}...</td>
                                                                <td className="p-2">{tx.marketId || 'N/A'}</td>
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
                                                                <td className="p-2">{tx.type}</td>
                                                                <td className="p-2">{new Date(tx.takenCustodyAt).toLocaleString()}</td>
                                                                <td className="p-2 font-mono text-xs">{tx.userId.substring(0, 8)}...</td>
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
                                                                <td className="p-2 font-mono text-xs">{tx.id.substring(0, 10)}...</td>
                                                                <td className="p-2">{tx.marketId || 'N/A'}</td>
                                                                <td className="p-2">${tx.amount || 0}</td>
                                                                <td className="p-2">{tx.outcomeName || tx.outcomeId || 'N/A'}</td>
                                                                <td className="p-2">{Math.floor((Date.now() - new Date(tx.takenCustodyAt).getTime()) / (1000 * 60))}</td>
                                                                <td className="p-2 font-mono text-xs">{tx.userId.substring(0, 8)}...</td>
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