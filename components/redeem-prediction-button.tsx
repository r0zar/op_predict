'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CoinsIcon, AlertCircle, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from "@/components/ui/use-toast"
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { canClaimReward, claimRewardWithCustody } from '@/app/actions/prediction-actions';

type RedeemPredictionButtonProps = {
    predictionId: string;
    predictionNonce: number; // Add this for on-chain interactions
    marketName?: string;
    outcomeName?: string;
    potentialPayout?: number;
    tooltip?: string;
    variant?: 'small' | 'default';
    status?: 'won' | 'pending' | 'claimed' | 'redeemed'; // Add status from server
    predictionStatus?: string; // The old prop name that other components are using
};

export function RedeemPredictionButton({
    predictionId,
    marketName = '',
    outcomeName = '',
    potentialPayout = 0,
    tooltip = 'Claim your winnings for this prediction',
    variant = 'default',
    predictionNonce,
    status = 'won',
    predictionStatus
}: RedeemPredictionButtonProps) {
    // Use predictionStatus prop if provided (backward compatibility)
    const effectiveStatus = predictionStatus || status;
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [claimStatus, setClaimStatus] = useState<string>(
        effectiveStatus === 'redeemed' || effectiveStatus === 'claimed' ? 'claimed' : 
        effectiveStatus === 'won' ? 'unclaimed' : effectiveStatus
    );
    const router = useRouter();
    const { toast } = useToast();

    // Update claim status if server-side status changes
    useEffect(() => {
        setClaimStatus(
            effectiveStatus === 'redeemed' || effectiveStatus === 'claimed' ? 'claimed' : 
            effectiveStatus === 'won' ? 'unclaimed' : effectiveStatus
        );
    }, [effectiveStatus]);

    const handleOpenDialog = async () => {
        setOpen(true);
    };

    const handleClaimReward = async () => {
        setLoading(true);
        setError(null);

        try {
            // Import Signet SDK functions
            const { claimRewards, requestTransactionCustody } = await import('signet-sdk');

            // Request signature for claiming rewards
            const signetResponse = await claimRewards({
                subnetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v1',
                to: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-predictions-v1',
                nonce: Date.now(),
                receiptId: predictionNonce, // The on-chain identifier
                amount: potentialPayout, // Use potential payout as amount
            });

            // If user rejected the claim reward in Signet, abort
            if (!signetResponse.success) {
                setLoading(false);
                setError('Claim reward transaction was rejected');
                toast({
                    title: "Transaction Rejected",
                    description: "Claim reward transaction was rejected by the wallet",
                    variant: "destructive",
                });
                return;
            }

            // Request custody of the signed claim reward transaction
            const custodyResponse = await requestTransactionCustody({
                type: 'claim-reward',
                receiptId: predictionNonce,
            }, signetResponse.subnetId);

            // If we couldn't get custody of the transaction, abort
            if (!custodyResponse.success || !custodyResponse.transaction) {
                console.warn('Custody aborted/failed!');
                setLoading(false);
                setError('Failed to create claim reward transaction');
                toast({
                    title: "Custody Failed",
                    description: "Failed to create claim reward transaction",
                    variant: "destructive",
                });
                return;
            }

            // Send the signature to the server
            const result = await claimRewardWithCustody({
                // Signet signature details
                signature: custodyResponse.transaction.data.signature,
                nonce: signetResponse.transaction.nonce,
                signer: signetResponse.transaction.signer,
                subnetId: signetResponse.transaction.subnetId,

                // Claim reward details
                predictionId: predictionId, // Database ID
            });

            if (result.success) {
                // Update local state and close dialog
                setClaimStatus('claimed');
                setOpen(false);

                // Show success toast
                toast({
                    title: "Reward claimed successfully",
                    description: `Your $${potentialPayout} reward has been added to your balance.`,
                    variant: "default",
                });

                // Refresh the page data to get updated status from server
                router.refresh();
                
                // Set a timeout to check status again after refresh
                // This ensures UI shows correctly even if server update is delayed
                setTimeout(() => {
                    router.refresh();
                }, 2000);
            } else {
                const errorMessage = result.error || 'Failed to claim rewards. Please try again.';
                setError(errorMessage);
                toast({
                    title: "Claim failed",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error claiming rewards:', error);
            const errorMessage = 'Failed to claim rewards. Please try again.';
            setError(errorMessage);
            toast({
                title: "Claim error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Render claim status button/badge based on current status
    const renderClaimStatus = () => {
        if (claimStatus === 'claimed') {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                className="flex h-8 items-center gap-2 cursor-default justify-center text-primary"
                                variant="outline"
                            >
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                Claimed
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Your reward of ${potentialPayout} has been added to your balance</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        } else {
            if (variant === 'small') {
                return (
                    <Button
                        onClick={handleOpenDialog}
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={loading || !!error}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CoinsIcon className="h-4 w-4" />
                        )}
                        Claim Reward
                    </Button>
                );
            } else {
                return (
                    <Button
                        onClick={handleOpenDialog}
                        className="flex items-center w-full"
                        variant="default"
                        disabled={loading || !!error}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CoinsIcon className="h-4 w-4 mr-2" />
                        )}
                        {error ? error : `Claim $${potentialPayout}`}
                    </Button>
                );
            }
        }
    };

    if (variant === 'small') {
        return (
            <>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {renderClaimStatus()}
                        </TooltipTrigger>
                        {claimStatus === 'unclaimed' && (
                            <TooltipContent>
                                <p>{error || tooltip}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Claim Your Prediction Winnings
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Your prediction that <strong>{outcomeName}</strong> for market &quot;{marketName}&quot; was correct!
                                You will receive <strong>${potentialPayout}</strong> in winnings.
                            </AlertDialogDescription>
                            <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
                                <p className="font-medium">Claim your winnings</p>
                                <p className="mt-2 text-muted-foreground">
                                    When you click "Claim Winnings", your reward will be immediately
                                    added to your balance and available for use.
                                </p>
                            </div>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                            <Button
                                onClick={handleClaimReward}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CoinsIcon className="h-4 w-4" />
                                )}
                                Claim Winnings
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    return (
        <>
            {renderClaimStatus()}

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Claim Your Prediction Winnings
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Your prediction that <strong>{outcomeName}</strong> for market &quot;{marketName}&quot; was correct!
                            You will receive <strong>${potentialPayout}</strong> in winnings.
                        </AlertDialogDescription>
                        <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
                            <p className="font-medium">Claim your winnings</p>
                            <p className="mt-2 text-muted-foreground">
                                When you click "Claim Winnings", your reward will be immediately
                                added to your balance and available for use.
                            </p>
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <Button
                            onClick={handleClaimReward}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CoinsIcon className="h-4 w-4" />
                            )}
                            Claim Winnings
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}