"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Market, MarketOutcome } from "@op-predict/lib";
import { createPrediction } from "@/app/actions/prediction-actions";
import { PredictionReceipt } from "@/components/prediction-receipt";
import { PredictionNFTReceipt } from "@op-predict/lib";
import { cn } from "@/lib/src/utils";
import { InfoIcon } from "lucide-react";

interface PredictionFormProps {
    market: Market;
    outcomes: (MarketOutcome & { percentage: number })[];
    userId: string;
}

export function PredictionForm({ market, outcomes, userId }: PredictionFormProps) {
    // Component needs to be wrapped in TooltipProvider
    return (
        <TooltipProvider>
            <PredictionFormContent market={market} outcomes={outcomes} userId={userId} />
        </TooltipProvider>
    );
}

function PredictionFormContent({ market, outcomes, userId }: PredictionFormProps) {
    const router = useRouter();
    const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
    const [nftReceipt, setNftReceipt] = useState<PredictionNFTReceipt | null>(null);

    // Predefined amounts for quick selection
    const predefinedAmounts = [5, 10, 25, 50];

    // Handle outcome selection
    const handleOutcomeSelect = (outcomeId: number) => {
        setSelectedOutcome(outcomeId);
    };

    // Handle amount selection
    const handleAmountSelect = (value: number) => {
        setAmount(value);
    };

    // Calculate potential payout for an outcome
    const calculatePotentialPayout = (outcome: MarketOutcome & { percentage: number }) => {
        // If no percentage data or amount is not set, return 0
        if (!outcome.percentage || amount <= 0) return 0;

        // Simplified payout calculation based on odds
        // Formula: amount * (100/outcome_percentage)
        // Higher percentage = lower payout, Lower percentage = higher payout
        // 5% admin fee is subtracted
        const rawPayout = amount * (100 / outcome.percentage);
        const adminFee = rawPayout * 0.05; // 5% fee
        return rawPayout - adminFee;
    };

    // Navigate to portfolio
    const handleViewPortfolio = () => {
        router.push('/portfolio');
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedOutcome) {
            toast.error("Please select an outcome");
            return;
        }

        if (amount <= 0) {
            toast.error("Please select an amount");
            return;
        }

        setIsSubmitting(true);

        try {
            // Call the server action to create a prediction
            const result = await createPrediction({
                marketId: market.id,
                outcomeId: selectedOutcome,
                amount,
                userId
            });

            if (result.success && result.prediction) {
                toast.success("Prediction placed successfully!");

                // Set the NFT receipt to show in the dialog
                setNftReceipt(result.prediction.nftReceipt);

                // Open the receipt dialog
                setReceiptDialogOpen(true);

                // Reset form
                setSelectedOutcome(null);
                setAmount(0);

                // Refresh the page data
                router.refresh();
            } else {
                toast.error("Failed to place prediction", {
                    description: result.error || "An unexpected error occurred.",
                });
            }
        } catch (error) {
            console.error("Error making prediction:", error);
            toast.error("Something went wrong", {
                description: "Failed to place your prediction. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Explanation of how predictions work */}
            <div className="text-right">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="inline-flex items-center text-xs text-muted-foreground cursor-help">
                            <InfoIcon className="h-3 w-3 mr-1" />
                            <span>How do predictions work?</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent
                        side="left"
                        className="max-w-xs bg-background border border-border text-foreground p-3 shadow-md"
                    >
                        <div className="space-y-2 text-xs">
                            <p className="font-semibold">How Predictions Work</p>
                            <p>1. Select an outcome you think will win</p>
                            <p>2. Choose your stake amount</p>
                            <p>3. If your prediction is correct, you'll receive a payout based on the odds</p>
                            <p>4. If incorrect, you'll lose your stake</p>
                            <p className="mt-2 pt-1 border-t border-border">
                                Lower percentage outcomes offer higher potential payouts because they're considered less likely.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Outcome selection - Fixed height buttons to prevent layout shift */}
            <div className="space-y-2">
                {outcomes.map((outcome) => {
                    const isSelected = selectedOutcome === outcome.id;
                    const isBinary = market.type === 'binary';
                    const isYes = outcome.name === 'Yes';
                    const isNo = outcome.name === 'No';

                    return (
                        <Button
                            key={outcome.id}
                            variant="outline"
                            className={cn(
                                "w-full justify-between min-h-[60px] py-3 px-4 transition-colors border-2 group",
                                // Base styles that don't change between states
                                {
                                    // Yes button styling (binary market)
                                    "border-primary/50 hover:border-primary hover:bg-primary/5": isBinary && isYes && !isSelected,
                                    "bg-primary text-primary-foreground border-primary": isBinary && isYes && isSelected,

                                    // No button styling (binary market)
                                    "border-destructive/50 hover:border-destructive hover:bg-destructive/5": isBinary && isNo && !isSelected,
                                    "bg-destructive text-destructive-foreground border-destructive": isBinary && isNo && isSelected,

                                    // Multiple choice styling
                                    "border-muted hover:border-primary/50 hover:bg-primary/5": !isBinary && !isSelected,
                                    "bg-secondary border-secondary/80 text-secondary-foreground": !isBinary && isSelected,
                                }
                            )}
                            onClick={() => handleOutcomeSelect(outcome.id)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="font-medium items-center">
                                    {outcome.name}
                                    {isSelected && (
                                        <svg className="ml-1 mb-1 h-4 w-4 text-primary inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </span>

                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center space-x-2">
                                                <span className={cn(
                                                    "text-sm font-semibold",
                                                    isSelected ? "text-primary" : "text-primary/80"
                                                )}>
                                                    x{amount > 0 ? (calculatePotentialPayout(outcome) / amount).toFixed(1) : ((100 / outcome.percentage) * 0.95).toFixed(1)}
                                                </span>

                                                <Badge
                                                    variant={isSelected ? "outline" : "secondary"}
                                                    className={cn(
                                                        "transition-colors items-center justify-center",
                                                        {
                                                            "bg-background border-background-foreground text-foreground": isSelected,
                                                            "group-hover:bg-background/80": !isSelected
                                                        }
                                                    )}
                                                >
                                                    {outcome.percentage?.toFixed(1) || "0.0"}%
                                                </Badge>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="bottom"
                                            align="end"
                                            className="max-w-xs bg-background border border-border text-foreground p-3 shadow-md"
                                        >
                                            <div className="space-y-2 text-xs">
                                                <p className="font-semibold">Multiplier: x{amount > 0 ? (calculatePotentialPayout(outcome) / amount).toFixed(1) : ((100 / outcome.percentage) * 0.95).toFixed(1)}</p>
                                                <p>Your stake will be multiplied by this amount if this outcome wins.</p>
                                                <div className="text-muted-foreground">
                                                    <p>• Raw odds multiplier: x{(100 / outcome.percentage).toFixed(1)}</p>
                                                    <p>• After 5% fee: x{((100 / outcome.percentage) * 0.95).toFixed(1)}</p>
                                                    {amount > 0 && (
                                                        <>
                                                            <p className="mt-1">• Your stake: ${amount.toFixed(2)}</p>
                                                            <p>• Potential payout: ${calculatePotentialPayout(outcome).toFixed(2)}</p>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="pt-1 border-t border-border">
                                                    {isSelected ? "✓ Currently selected" : "Select this outcome to predict"}
                                                </p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </Button>
                    );
                })}
            </div>

            <Separator className="my-2" />

            {/* Amount selection - Fixed height buttons to prevent layout shift */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount to stake</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {predefinedAmounts.map((predefinedAmount) => {
                        const isSelected = amount === predefinedAmount;

                        return (
                            <Button
                                key={predefinedAmount}
                                variant="outline"
                                className={cn(
                                    "font-medium h-9 border-2 transition-colors items-center justify-center",
                                    {
                                        "border-muted hover:border-primary/50 hover:bg-primary/5": !isSelected,
                                        "bg-secondary border-secondary/80 text-secondary-foreground": isSelected,
                                    }
                                )}
                                onClick={() => handleAmountSelect(predefinedAmount)}
                            >
                                ${predefinedAmount}
                            </Button>
                        );
                    })}
                </div>


                <div className="pt-2">
                    <Button
                        className={cn(
                            "w-full h-12 items-center justify-center",
                            {
                                "opacity-70": !selectedOutcome || amount <= 0 || isSubmitting
                            }
                        )}
                        disabled={!selectedOutcome || amount <= 0 || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            `Place $${amount} Prediction`
                        )}
                    </Button>
                </div>
            </div>

            {/* Prediction Receipt Dialog */}
            {nftReceipt && (
                <PredictionReceipt
                    open={receiptDialogOpen}
                    onOpenChange={setReceiptDialogOpen}
                    receipt={nftReceipt}
                    onViewPortfolio={handleViewPortfolio}
                />
            )}
        </div>
    );
} 