"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Define types locally
type Market = any;
type MarketOutcome = any;
type PredictionNFTReceipt = any;
import { createPrediction } from "@/app/actions/prediction-actions";
import { createPredictionWithCustody } from "@/app/actions/custody-actions";
import { PredictionReceipt } from "@/components/prediction-receipt";
import { cn } from "@/lib/utils";
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

    // Use the Signet context
    const signet = {} as any

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

        // For very small percentages (< 0.1%), use a minimum value to avoid extremely high multipliers
        const safePercentage = Math.max(outcome.percentage, 0.1);

        // Simplified payout calculation based on odds
        // Formula: amount * (100/outcome_percentage)
        // Higher percentage = lower payout, Lower percentage = higher payout
        // 5% admin fee is subtracted
        const rawPayout = amount * (100 / safePercentage);
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
            return;
        }

        if (amount <= 0) {
            return;
        }

        setIsSubmitting(true);

        try {

            // Get the selected outcome details
            const selectedOutcomeData = outcomes.find(o => o.id === selectedOutcome);
            if (!selectedOutcomeData) {
                throw new Error("Selected outcome not found");
            }


            const { signPrediction, requestTransactionCustody } = await import('signet-sdk')

            // request a predict signature
            const signetResponse = await signPrediction({
                subnetId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v1',
                to: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-predictions-v1',
                nonce: Date.now(),
                marketId: market.id,
                outcomeId: selectedOutcome,
                amount,
            })

            // If user rejected the prediction in Signet, abort
            if (!signetResponse.success) {
                return;
            }

            // Request custody of the signed prediction transaction
            const custodyResponse = await requestTransactionCustody({
                type: 'predict',
                marketId: market.id,
                outcomeId: selectedOutcome,
                amount: amount,
            }, signetResponse.subnetId)

            // If we couldn't get custody of the transaction, abort
            if (!custodyResponse.success || !custodyResponse.transaction) {
                console.warn('Custory aborted/failed!')
                return;
            }

            const result = await createPredictionWithCustody({
                // Signet signature details
                signature: custodyResponse.transaction.data.signature,
                nonce: signetResponse.transaction.nonce,
                signer: signetResponse.transaction.signer,
                subnetId: signetResponse.transaction.subnetId,

                // Prediction details
                marketId: market.id,
                outcomeId: selectedOutcome,
                amount,
                userId
            });

            if (result.success && result.transaction) {
                // Set the NFT receipt to show in the dialog
                setNftReceipt(result.nftReceipt || result.transaction.nftReceipt);

                // Open the receipt dialog
                setReceiptDialogOpen(true);

                // Reset form
                setSelectedOutcome(null);
                setAmount(0);

                // Refresh the page data
                router.refresh();
            } else {
                console.error('FAILED')
            }
        } catch (error) {
            console.error("Error making prediction:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Explanation of how predictions work */}
            <div className="lex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground uppercase tracking-wider mb-4">
                    Make a Prediction
                </h2>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="inline-flex items-center text-xs text-muted-foreground cursor-help">
                            <InfoIcon className="h-3 w-3 mr-1" />
                            <span className="">How do predictions work?</span>
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
                                "w-full justify-between min-h-[60px] py-3 px-4 transition-all duration-300 border-2 group crystal-highlight",
                                {
                                    "border-muted hover:border-primary/60 hover:bg-primary/10": !isSelected,
                                    "bg-secondary border-secondary text-secondary-foreground": isSelected,
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
                                    <Tooltip delayDuration={0}>
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
                                    "font-medium h-9 border-2 transition-all duration-300 items-center justify-center",
                                    {
                                        "border-muted hover:border-primary/60 hover:bg-primary/10": !isSelected,
                                        "bg-secondary border-secondary text-secondary-foreground": isSelected,
                                    }
                                )}
                                onClick={() => handleAmountSelect(predefinedAmount)}
                            >
                                <span>${predefinedAmount}</span>
                            </Button>
                        );
                    })}
                </div>


                <div className="pt-2">
                    <Button
                        className={cn(
                            "w-full h-12 items-center justify-center themed-button",
                            {
                                "opacity-70": !selectedOutcome || amount <= 0 || isSubmitting
                            }
                        )}
                        disabled={!selectedOutcome || amount <= 0 || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white loading-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                                <span>
                                    {signet.isAvailable
                                        ? `Place $${amount} Prediction via Signet`
                                        : `Place $${amount} Prediction`}
                                </span>
                            </>
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