'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Check, Trophy } from 'lucide-react';
import { resolveMarket } from '@/app/actions/market-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

type ResolveMarketButtonProps = {
    marketId: string;
    marketName: string;
    outcomes: {
        id: number;
        name: string;
    }[];
    isAdmin: boolean;
    className?: string;
};

export function ResolveMarketButton({
    marketId,
    marketName,
    outcomes,
    isAdmin,
    className
}: ResolveMarketButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
    const router = useRouter();

    // Only show for admins
    if (!isAdmin) {
        return null;
    }

    const handleResolveMarket = async () => {
        if (!selectedOutcome) {
            toast.error('Please select a winning outcome');
            return;
        }

        setLoading(true);

        try {
            const result = await resolveMarket({
                marketId,
                winningOutcomeId: selectedOutcome
            });

            if (result.success) {
                toast.success(`Market resolved successfully! Admin fee: $${result.adminFee?.toFixed(2)}`);
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to resolve market');
            }
        } catch (error) {
            console.error('Error resolving market:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className={cn("flex items-center justify-center gap-2", className)}
                variant="default"
                size="lg"
            >
                <Trophy className="h-5 w-5" />
                <span>Resolve This Market</span>
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Resolve Market</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select the winning outcome for &quot;{marketName}&quot;. You will receive a 5% admin fee upon resolution.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="mt-4 mb-6">
                        <RadioGroup onValueChange={(value) => setSelectedOutcome(Number(value))}>
                            {outcomes.map((outcome) => (
                                <div key={outcome.id} className="flex items-center space-x-2 py-2">
                                    <RadioGroupItem value={outcome.id.toString()} id={`outcome-${outcome.id}`} />
                                    <Label htmlFor={`outcome-${outcome.id}`} className="cursor-pointer">
                                        {outcome.name}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <Button
                            onClick={handleResolveMarket}
                            disabled={!selectedOutcome || loading}
                            className="flex items-center"
                        >
                            {loading ? (
                                <span>Resolving...</span>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Confirm Resolution
                                </>
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 