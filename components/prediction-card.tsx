"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { toast } from "@/lib/utils";
import { Trash2, Trophy, User } from "lucide-react";
// Define Prediction type locally
type Prediction = any;
import { deletePrediction } from "@/app/actions/prediction-actions";
import { useRouter } from "next/navigation";
import { RedeemPredictionButton } from "./redeem-prediction-button";
import { truncateUserId } from "@/lib/user-utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PredictionCardProps {
    prediction: Prediction;
    compact?: boolean;
    isAdmin?: boolean;
    marketOdds?: { [key: number]: number }; // Map of outcomeId to percentage
    creatorName?: string;
}

export function PredictionCard({
    prediction,
    compact = false,
    isAdmin = false,
    marketOdds,
    creatorName
}: PredictionCardProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayCreator, setDisplayCreator] = useState<string>("");

    useEffect(() => {
        if (creatorName) {
            setDisplayCreator(truncateUserId(prediction.userId));
        } else {
            setDisplayCreator(truncateUserId(prediction.userId));
        }
    }, [creatorName, prediction.userId]);

    // Format date to display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Calculate dimensions proportional to bid amount (more precise)
    const getDimensions = () => {
        const amount = prediction.amount;
        // Base dimensions - minimum is 24x32px
        const baseWidth = 24;
        const baseHeight = 32;

        // Scale factor based on amount - grows faster for larger bets
        const scaleFactor = Math.sqrt(amount) / 3;

        // Add some randomness to aspect ratio for more visual variety
        // This creates a mix of horizontal and vertical rectangles
        const aspectRatio = prediction.id.charCodeAt(0) % 3 === 0 ?
            0.75 : // vertical rectangle
            (prediction.id.charCodeAt(0) % 3 === 1 ?
                1.33 : // horizontal rectangle
                1.0); // square

        // Calculate dimensions with aspect ratio
        let width = Math.max(baseWidth, Math.min(160, baseWidth * scaleFactor * Math.sqrt(aspectRatio)));
        let height = Math.max(baseHeight, Math.min(160, baseHeight * scaleFactor / Math.sqrt(aspectRatio)));

        // Round to nearest multiple of 4 for cleaner appearance
        width = Math.round(width / 4) * 4;
        height = Math.round(height / 4) * 4;

        return { width, height };
    };

    // Get the actual dimensions in pixels
    const { width, height } = getDimensions();

    // Status checks
    const isResolved = prediction.status === 'won' || prediction.status === 'lost';
    const isRedeemed = prediction.status === 'redeemed';
    const isWinner = prediction.status === 'won';
    const isActive = prediction.status === 'active';

    // Potential payout
    const potentialPayout = isResolved && prediction.potentialPayout !== undefined
        ? prediction.potentialPayout
        : 0;

    // Get color based on outcome and theme
    const getOutcomeColorClass = () => {
        if (prediction.outcomeName === 'Yes') {
            return 'bg-primary/10 hover:bg-primary/20';
        } else if (prediction.outcomeName === 'No') {
            return 'bg-destructive/10 hover:bg-destructive/20';
        } else {
            return 'bg-secondary/10 hover:bg-secondary/20';
        }
    };

    // Get status color
    const getStatusColorClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'border-blue-500/30';
            case 'won':
                return 'border-green-500/30';
            case 'lost':
                return 'border-red-500/30';
            case 'redeemed':
                return 'border-purple-500/30';
            default:
                return 'border-yellow-500/30';
        }
    };

    // Handle prediction deletion
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deletePrediction(prediction.id);
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
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

    // Wrapper to determine if card should be clickable
    const cardWrapper = (children: React.ReactNode) => {
        if (isResolved && !isRedeemed) {
            return (<div>{children}</div>);
        }
        return (<Link href={`/prediction/${prediction.id}`}>{children}</Link>);
    };

    return (
        <>
            {cardWrapper(
                <Card style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    padding: '1px',
                    margin: '0px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `${Math.min(width, height) / 4}px`,
                }}
                    className={`
                    ${getOutcomeColorClass()}
                    ${getStatusColorClass(prediction.status)}
                    border
                    transition-colors duration-150
                    ${isResolved && !isRedeemed ? 'cursor-default' : 'cursor-pointer'}
                    relative overflow-hidden
                    prediction-card
                `}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="w-full h-full flex items-center justify-center">
                                <div className="font-bold text-center" style={{ fontSize: 'inherit' }}>
                                    {prediction.outcomeName}
                                    {width >= 60 && <span className="block font-light opacity-80">${prediction.amount}</span>}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="p-2 max-w-[200px] text-xs">
                                <div className="space-y-1">
                                    <div className="font-semibold">${prediction.amount.toFixed(0)}</div>
                                    <div className="text-[10px] opacity-80">{prediction.nftReceipt.marketName}</div>
                                    <div className="flex justify-between items-center pt-1 text-[10px]">
                                        <span>{formatDate(prediction.createdAt)}</span>
                                        <Badge variant="outline" className="text-[8px] py-0 h-3">
                                            {prediction.status.charAt(0).toUpperCase() + prediction.status.slice(1)}
                                        </Badge>
                                    </div>
                                    {isWinner && (
                                        <div className="text-[10px] text-green-600 flex items-center">
                                            <Trophy className="h-3 w-3 mr-0.5" />
                                            +${potentialPayout.toFixed(0)}
                                        </div>
                                    )}
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-full mt-1 text-[10px] text-destructive"
                                            onClick={handleDeleteClick}
                                        >
                                            <Trash2 className="h-2.5 w-2.5 mr-1" /> Delete
                                        </Button>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Redeem button overlay for resolved predictions */}
                    {isResolved && !isRedeemed && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <RedeemPredictionButton
                                predictionId={prediction.id}
                                predictionStatus={prediction.status}
                                marketName={prediction.nftReceipt.marketName}
                                outcomeName={prediction.outcomeName}
                                potentialPayout={potentialPayout}
                            />
                        </div>
                    )}
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

