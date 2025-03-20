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
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ResolveMarketButtonProps = {
    marketId: string;
    marketName: string;
    outcomes: {
        id: number;
        name: string;
    }[];
    isAdmin: boolean;
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning';
};

export function ResolveMarketButton({
    marketId,
    marketName,
    outcomes,
    isAdmin,
    className,
    variant = 'default'
}: ResolveMarketButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const router = useRouter();

    // Only show for admins
    if (!isAdmin) {
        return null;
    }

    const handleResolveMarket = async () => {
        if (!selectedOutcome) {
            return;
        }

        setLoading(true);
        setError(null);
        setInfo(null);

        try {
            console.log(`Resolving market ${marketId} with outcome ${selectedOutcome}`);
            
            const result = await resolveMarket({
                marketId,
                winningOutcomeId: selectedOutcome
            });

            console.log("Resolution result:", result);

            if (result.success) {
                // If there's an info message, show it before closing
                if (result.info) {
                    setInfo(result.info);
                    // Keep dialog open to show info message
                    setTimeout(() => {
                        setOpen(false);
                        // Force a full page refresh to ensure UI updates properly
                        window.location.reload();
                    }, 3000); // Auto close after 3 seconds
                } else {
                    // With successful resolution, force a full page refresh
                    setInfo("Market resolved successfully! Refreshing page...");
                    setTimeout(() => {
                        setOpen(false);
                        // Force a full page refresh to ensure UI updates properly
                        window.location.reload();
                    }, 1500);
                }
            } else if (result.error) {
                console.error("Error from server:", result.error);
                setError(result.error);
                // Try to refresh the page anyway after error, after giving user time to read the error
                setTimeout(() => {
                    router.refresh();
                }, 3000);
            }
        } catch (error) {
            console.error('Exception resolving market:', error);
            setError('An unexpected error occurred. Please try again.');
            // Try to refresh the page anyway after error
            setTimeout(() => {
                router.refresh();
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex justify-center w-full'>
            <Button
                onClick={() => setOpen(true)}
                className={cn("flex items-center justify-center gap-2 w-full", className)}
                variant={variant}
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
                        {/* Show info messages */}
                        {info && (
                            <div className="p-3 mb-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                                {info}
                            </div>
                        )}
                        
                        {/* Show error messages */}
                        {error && (
                            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                        
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
        </div>
    );
} 