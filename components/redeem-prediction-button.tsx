'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CoinsIcon, TrendingUp, AlertCircle } from 'lucide-react';
import { updateCustodyTransactionStatus } from '@/app/actions/custody-actions';
import { useRouter } from 'next/navigation';
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

type RedeemPredictionButtonProps = {
    predictionId: string;
    predictionStatus: string;
    marketName: string;
    outcomeName: string;
    potentialPayout?: number;
};

export function RedeemPredictionButton({
    predictionId,
    predictionStatus,
    marketName,
    outcomeName,
    potentialPayout = 0
}: RedeemPredictionButtonProps) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Only show for resolved predictions (won or lost) that haven't been redeemed
    if (predictionStatus !== 'won' && predictionStatus !== 'lost') {
        return null;
    }

    const isWinner = predictionStatus === 'won';

    const handleRedeemPrediction = async () => {
        setLoading(true);

        try {
            // Use the custody system's status update to mark as confirmed (redeemed)
            const result = await updateCustodyTransactionStatus(predictionId, 'confirmed');

            if (result.success) {
                const message = isWinner
                    ? `Prediction redeemed! You received $${potentialPayout?.toFixed(2)}`
                    : 'Prediction redeemed. Better luck next time!';

                setOpen(false);
                router.refresh();
            } else {
                console.error('Failed to redeem prediction:', result.error);
            }
        } catch (error) {
            console.error('Error redeeming prediction:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="flex items-center w-full"
                variant={isWinner ? "default" : "outline"}
                size="sm"
            >
                {isWinner ? (
                    <>
                        <CoinsIcon className="h-4 w-4 mr-2" />
                        Redeem ${potentialPayout.toFixed(2)}
                    </>
                ) : (
                    <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Discard Receipt
                    </>
                )}
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isWinner ? 'Redeem Your Winnings' : 'Discard Prediction Receipt'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isWinner ? (
                                <>
                                    Your prediction that <strong>{outcomeName}</strong> for market &quot;{marketName}&quot; was correct!
                                    You will receive <strong>${potentialPayout.toFixed(2)}</strong> in winnings.
                                </>
                            ) : (
                                <>
                                    Your prediction that <strong>{outcomeName}</strong> for market &quot;{marketName}&quot; was incorrect.
                                    You won't receive any payout, but you can still discard this receipt.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <Button
                            onClick={handleRedeemPrediction}
                            disabled={loading}
                            variant={isWinner ? "default" : "secondary"}
                            className="flex items-center"
                        >
                            {loading ? (
                                <span>Processing...</span>
                            ) : (
                                <>
                                    <CoinsIcon className="h-4 w-4 mr-2" />
                                    {isWinner ? 'Redeem Winnings' : 'Discard Receipt'}
                                </>
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 