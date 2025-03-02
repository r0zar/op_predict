"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronRight, Trash2, Trophy, Ticket, PercentIcon, CoinsIcon } from "lucide-react";
import { Prediction } from "@/lib/prediction-store";
import { deletePrediction } from "@/app/actions/prediction-actions";
import { useRouter } from "next/navigation";
import { RedeemPredictionButton } from "./redeem-prediction-button";

interface PredictionCardProps {
    prediction: Prediction;
    compact?: boolean;
    isAdmin?: boolean;
    marketOdds?: { [key: number]: number }; // Map of outcomeId to percentage
}

export function PredictionCard({
    prediction,
    compact = false,
    isAdmin = false,
    marketOdds
}: PredictionCardProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Format date to display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
        });
    };

    // Calculate potential profit based on status
    const isResolved = prediction.status === 'won' || prediction.status === 'lost';
    const isRedeemed = prediction.status === 'redeemed';
    const isWinner = prediction.status === 'won';

    // Use calculated potential payout for resolved predictions, otherwise estimate
    const potentialPayout = isResolved && prediction.potentialPayout !== undefined
        ? prediction.potentialPayout
        : 0;

    // For active predictions, show estimated potential profit based on odds
    const oddsPercentage = marketOdds?.[prediction.outcomeId] ||
        (prediction.outcomeName === 'Yes' ? 60 : prediction.outcomeName === 'No' ? 40 : 50); // Fallback

    const estimatedProfit = (prediction.amount / (oddsPercentage / 100)) - prediction.amount;

    // Get status badge styling
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'won':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'lost':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'redeemed':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    // Handle prediction deletion
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deletePrediction(prediction.id);

            if (result.success) {
                toast.success("Prediction deleted successfully");
                router.refresh();
            } else {
                toast.error("Failed to delete prediction", {
                    description: result.error || "An unexpected error occurred",
                });
            }
        } catch (error) {
            toast.error("Something went wrong", {
                description: "Failed to delete prediction. Please try again.",
            });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    // Prevent clicking the card when clicking the delete button
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteDialogOpen(true);
    };

    // Disable link if prediction is resolved
    const cardWrapper = (children: React.ReactNode) => {
        if (isResolved && !isRedeemed) {
            return (
                <div>{children}</div>
            );
        }
        return (
            <Link href={`/markets/${prediction.marketId}`}>
                {children}
            </Link>
        );
    };

    return (
        <>
            {cardWrapper(
                <Card className={`h-full hover:border-primary/50 transition-colors ${isResolved && !isRedeemed ? 'cursor-default' : 'cursor-pointer'} overflow-hidden ${compact ? 'shadow-sm' : 'shadow-md'} border-dashed relative`}>
                    {/* Ticket-style header */}
                    <div className="bg-muted/60 border-b px-3 pt-2 pb-1 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                            <Ticket className="h-3.5 w-3.5 opacity-70" />
                            <span className="text-xs font-medium truncate max-w-[150px]">
                                Receipt #{prediction.nftReceipt.id.substring(0, 4)}
                            </span>
                        </div>
                        <span className="text-xs opacity-70">{formatDate(prediction.createdAt)}</span>
                    </div>

                    <CardContent className={`${compact ? 'pt-3 pb-2 px-3' : 'p-3'} space-y-2`}>
                        {/* Market name - secondary info */}
                        <h3 className={`text-xs text-muted-foreground line-clamp-1 mb-1`}>
                            {prediction.nftReceipt.marketName}
                        </h3>

                        {/* Primary info - bold section with cost, outcome and odds */}
                        <div className="bg-muted/30 rounded-md p-2 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold flex items-center">
                                    <Badge
                                        variant={prediction.outcomeName === 'Yes' ? 'default' :
                                            prediction.outcomeName === 'No' ? 'destructive' : 'secondary'}
                                        className="text-[10px] py-0 h-4 items-center"
                                    >
                                        {prediction.outcomeName}
                                    </Badge>
                                </span>
                                <div className="flex items-center mt-1">
                                    <PercentIcon className="h-3 w-3 mr-1 opacity-70" />
                                    <span className="text-xs">{oddsPercentage}% chance</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold">${prediction.amount.toFixed(2)}</span>
                                {isResolved ? (
                                    <span className={`text-xs ${isWinner ? 'text-green-600' : 'text-red-500'} flex items-center mt-0.5`}>
                                        {isWinner ? (
                                            <>
                                                <Trophy className="h-3 w-3 mr-0.5" />
                                                +${potentialPayout.toFixed(2)}
                                            </>
                                        ) : (
                                            <>
                                                <Trophy className="h-3 w-3 mr-0.5" />
                                                +$0.00
                                            </>
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-xs text-green-600 flex items-center mt-0.5">
                                        <Trophy className="h-3 w-3 mr-0.5" />
                                        Est: +${estimatedProfit.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Redeem button for resolved predictions */}
                        {isResolved && !isRedeemed && (
                            <div className="pt-1">
                                <RedeemPredictionButton
                                    predictionId={prediction.id}
                                    predictionStatus={prediction.status}
                                    marketName={prediction.nftReceipt.marketName}
                                    outcomeName={prediction.outcomeName}
                                    potentialPayout={potentialPayout}
                                />
                            </div>
                        )}

                        {/* Faux ticket stub perforation */}
                        <div className="absolute -left-1 top-1/2 w-2 h-4 bg-background rounded-r-full border-t border-r border-b"></div>
                        <div className="absolute -right-1 top-1/2 w-2 h-4 bg-background rounded-l-full border-t border-l border-b"></div>
                        <div className="absolute -left-1 top-1/4 w-2 h-4 bg-background rounded-r-full border-t border-r border-b"></div>
                        <div className="absolute -right-1 top-1/4 w-2 h-4 bg-background rounded-l-full border-t border-l border-b"></div>
                    </CardContent>

                    <CardFooter className={`pt-1 ${compact ? 'pb-2 px-3' : 'pb-1 px-3'} flex justify-between items-center border-t bg-muted/30`}>
                        <Badge variant="outline" className={`${getStatusBadgeClass(prediction.status)} text-[10px] py-0 h-4`}>
                            {prediction.status.charAt(0).toUpperCase() + prediction.status.slice(1)}
                        </Badge>

                        {/* Admin Delete Button */}
                        {isAdmin ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 items-center"
                                onClick={handleDeleteClick}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </CardFooter>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Prediction Receipt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this prediction receipt? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

