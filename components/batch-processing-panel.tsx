'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Server, RefreshCw, Database, Info, Clock, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { triggerBatchProcessing } from '@/app/actions/custody-actions';
import { useToast } from '@/components/ui/use-toast';

type BatchProcessingPanelProps = {
  marketId: string;
  pendingCount: number;
  pendingTransactions?: any[];
};

export function BatchProcessingPanel({ marketId, pendingCount, pendingTransactions }: BatchProcessingPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastBatchRun, setLastBatchRun] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any>(null);
  const { toast } = useToast();

  const hasPendingTransactions = pendingCount > 0;

  useEffect(() => {
    // We could fetch the last batch run time from an API endpoint
    // For now, we'll just use a mock value
    const mockLastRun = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
    setLastBatchRun(mockLastRun.toISOString());
  }, []);

  // Get last batch run time in human-readable format
  const lastRunDisplay = lastBatchRun
    ? formatDistanceToNow(new Date(lastBatchRun), { addSuffix: true })
    : 'Unknown';

  // Calculate next batch run (assuming hourly)
  const nextBatchRunDisplay = lastBatchRun
    ? formatDistanceToNow(new Date(new Date(lastBatchRun).getTime() + 60 * 60 * 1000), { addSuffix: true })
    : 'Soon';

  // Function to handle manual batch processing
  const handleProcessBatch = async () => {
    setIsProcessing(true);
    setProcessResult(null);

    try {
      const result = await triggerBatchProcessing(marketId);
      setProcessResult(result);

      if (result.success) {
        toast({
          title: "Batch processing successful",
          description: result.processedForMarket !== undefined
            ? `Processed ${result.processedForMarket} predictions for this market (${result.processed} total across all markets)`
            : `Processed ${result.processed} predictions in ${result.batched} batches`,
          variant: "default",
        });

        // Update the last batch run time
        setLastBatchRun(new Date().toISOString());
      } else {
        toast({
          title: "Batch processing failed",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      setProcessResult({ success: false, error: 'Failed to process batch' });
      toast({
        title: "Batch processing failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-card/50 backdrop-blur h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">What is this?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    Predictions are processed in batches every hour to optimize transaction costs.
                    Click "View Details" to see pending predictions for this market.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Pending Predictions</span>
              <Badge variant={hasPendingTransactions ? "outline" : "secondary"} className="text-xs h-5">
                {pendingCount}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Last Processing</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{lastRunDisplay}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Next Processing</span>
              <div className="flex items-center space-x-1">
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{nextBatchRunDisplay}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant={'default'}
                size="sm"
                className={`w-full text-xs ${hasPendingTransactions && pendingCount > 3 ? "border-cyber-blue/30" : ""}`}>
                {hasPendingTransactions
                  ? <>
                    {pendingCount > 3 && <RefreshCw className="mr-2 h-4 w-4 animate-pulse text-cyber-blue" />}
                    Manage {pendingCount} Pending Prediction{pendingCount !== 1 ? 's' : ''}
                  </>
                  : "View Batch Processing Details"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Batch Processing Details</DialogTitle>
                <DialogDescription>
                  Predictions are processed in batches every hour to reduce transaction costs.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Next Batch Processing</span>
                    <Badge variant="outline">{nextBatchRunDisplay}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Last Run</span>
                      <span>{lastRunDisplay}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Pending Predictions</span>
                      <span>{pendingCount} for this market</span>
                    </div>
                  </div>
                </div>

                {/* Manual Batch Processing Button */}
                {hasPendingTransactions && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleProcessBatch}
                      disabled={isProcessing}
                      variant="outline"
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Process Pending Predictions Now
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Process Result Display */}
                {processResult && (
                  <div className={`rounded-lg p-3 ${processResult.success ? 'bg-green-950/10 border border-green-500/20' : 'bg-red-950/10 border border-red-500/20'}`}>
                    <div className="flex items-start space-x-2">
                      {processResult.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <h3 className="text-sm font-medium">
                          {processResult.success ? 'Processing Successful' : 'Processing Failed'}
                        </h3>
                        {processResult.success ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            {processResult.processedForMarket !== undefined ? (
                              <>
                                Processed {processResult.processedForMarket} prediction{processResult.processedForMarket !== 1 ? 's' : ''} for this market
                                {processResult.processed > 0 && (
                                  <span className="block mt-1">
                                    ({processResult.processed} total prediction{processResult.processed !== 1 ? 's' : ''} processed across all markets)
                                  </span>
                                )}
                              </>
                            ) : (
                              <>Processed {processResult.processed} prediction{processResult.processed !== 1 ? 's' : ''} in {processResult.batched} batch{processResult.batched !== 1 ? 'es' : ''}</>
                            )}.
                            {processResult.txid && (
                              <span className="block mt-1">Transaction ID: {processResult.txid}</span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-red-400 mt-1">
                            {processResult.error || 'An unknown error occurred'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {hasPendingTransactions && pendingTransactions && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Pending Predictions</h3>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="bg-muted/30 px-3 py-2 text-xs grid grid-cols-5">
                        <div>User</div>
                        <div>Amount</div>
                        <div>Outcome</div>
                        <div>Created</div>
                        <div>Status</div>
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {pendingTransactions.map((tx: any) => (
                          <div key={tx.id} className="px-3 py-2 text-xs border-t grid grid-cols-5 hover:bg-muted/10">
                            <div className="truncate">{tx.userId?.substring(0, 8) || 'Anonymous'}</div>
                            <div>${tx.amount?.toFixed(2) || '0.00'}</div>
                            <div className="truncate">{tx.outcomeName || `Outcome ${tx.outcomeId}`}</div>
                            <div>{formatDistanceToNow(new Date(tx.takenCustodyAt), { addSuffix: true })}</div>
                            <div>
                              <Badge variant="outline" className="text-xs">
                                {tx.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!hasPendingTransactions && !isProcessing && (
                  <div className="py-4 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm font-medium">No pending predictions</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All predictions for this market have been processed
                    </p>
                  </div>
                )}

                <div className="rounded-lg bg-muted/20 p-3">
                  <h3 className="text-sm font-medium mb-2">About Batch Processing</h3>
                  <p className="text-xs text-muted-foreground">
                    When users make predictions, they are initially held in custody and then processed in batches
                    to reduce blockchain transaction costs. Batches run every hour automatically, but admins
                    can also trigger manual processing.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </div>
    </>
  );
}