'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

// Create a simple Alert component since it might not exist in the project
const Alert = ({
    variant = 'default',
    children,
    className = '',
}: {
    variant?: 'default' | 'destructive';
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={`p-4 rounded-md border ${variant === 'destructive' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-blue-50 border-blue-300 text-blue-800'
                } ${className}`}
        >
            {children}
        </div>
    );
};

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-medium mb-1">{children}</h3>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
    <div className="text-sm">{children}</div>
);

export default function KVDebugPage() {
    const [debugData, setDebugData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [migrationResult, setMigrationResult] = useState<any>(null);
    const [migrationLoading, setMigrationLoading] = useState(false);
    const [migrationError, setMigrationError] = useState<string | null>(null);

    const fetchDebugData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/debug-kv');
            const data = await response.json();
            setDebugData(data);
        } catch (e) {
            setError(String(e));
        } finally {
            setLoading(false);
        }
    };

    const runMigration = async () => {
        if (!confirm('Are you sure you want to run data migration? This will convert data from the old format to the new format.')) {
            return;
        }

        setMigrationLoading(true);
        setMigrationError(null);
        try {
            const response = await fetch('/api/migrate-kv');
            const data = await response.json();
            setMigrationResult(data);
            // Refresh debug data after migration
            fetchDebugData();
        } catch (e) {
            setMigrationError(String(e));
        } finally {
            setMigrationLoading(false);
        }
    };

    // Fetch debug data on mount
    useEffect(() => {
        fetchDebugData();
    }, []);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">KV Data Debug</h1>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchDebugData}
                        disabled={loading}
                        variant="outline"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={runMigration}
                        disabled={migrationLoading}
                        variant="destructive"
                    >
                        {migrationLoading ? 'Migrating...' : 'Run Migration'}
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {migrationResult && (
                <Alert variant={migrationResult.success ? "default" : "destructive"}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Migration Result</AlertTitle>
                    <AlertDescription>
                        <div className="mt-2 space-y-2">
                            <div>Markets Migrated: {migrationResult.migrationResults?.markets?.migrated || 0}</div>
                            <div>Markets Errors: {migrationResult.migrationResults?.markets?.errors || 0}</div>
                            <div>Predictions Migrated: {migrationResult.migrationResults?.predictions?.migrated || 0}</div>
                            <div>Sets Migrated: {migrationResult.migrationResults?.sets?.migrated || 0}</div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {migrationError && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Migration Error</AlertTitle>
                    <AlertDescription>{migrationError}</AlertDescription>
                </Alert>
            )}

            {debugData && (
                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="markets">Markets</TabsTrigger>
                        <TabsTrigger value="predictions">Predictions</TabsTrigger>
                        <TabsTrigger value="ids">IDs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Card>
                            <CardHeader>
                                <CardTitle>KV Store Overview</CardTitle>
                                <CardDescription>Summary of KV store data</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <h3 className="font-semibold mb-2">Total Keys</h3>
                                        <p className="text-2xl">{debugData.totalKeys}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <h3 className="font-semibold mb-2">Markets</h3>
                                        <p className="text-2xl">
                                            {(debugData.oldFormatMarketKeys?.count || 0) +
                                                (debugData.newFormatMarketKeys?.count || 0)}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline">
                                                Old: {debugData.oldFormatMarketKeys?.count || 0}
                                            </Badge>
                                            <Badge variant="outline">
                                                New: {debugData.newFormatMarketKeys?.count || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <h3 className="font-semibold mb-2">Market IDs</h3>
                                        <div className="flex gap-2">
                                            <Badge variant="outline">
                                                Old: {debugData.marketIds?.oldFormat?.count || 0}
                                            </Badge>
                                            <Badge variant="outline">
                                                New: {debugData.marketIds?.newFormat?.count || 0}
                                            </Badge>
                                            <Badge variant="outline">
                                                Helper: {debugData.marketIds?.fromHelper?.count || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="markets">
                        <Card>
                            <CardHeader>
                                <CardTitle>Markets</CardTitle>
                                <CardDescription>Market data in KV store</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold mb-2">Old Format Keys</h3>
                                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto my-2 text-xs">
                                    {JSON.stringify(debugData.oldFormatMarketKeys, null, 2)}
                                </pre>

                                <h3 className="font-semibold mb-2 mt-4">New Format Keys</h3>
                                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto my-2 text-xs">
                                    {JSON.stringify(debugData.newFormatMarketKeys, null, 2)}
                                </pre>

                                <h3 className="font-semibold mb-2 mt-4">Sample Market</h3>
                                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto my-2 text-xs">
                                    {JSON.stringify(debugData.sampleMarket, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="predictions">
                        <Card>
                            <CardHeader>
                                <CardTitle>Predictions</CardTitle>
                                <CardDescription>Prediction data in KV store</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Content for predictions tab...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ids">
                        <Card>
                            <CardHeader>
                                <CardTitle>IDs</CardTitle>
                                <CardDescription>ID collections in KV store</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold mb-2">Market IDs</h3>
                                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto my-2 text-xs">
                                    {JSON.stringify(debugData.marketIds, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
} 