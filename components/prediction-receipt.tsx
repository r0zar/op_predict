"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, Wallet } from "lucide-react";
import { } from "@/lib/utils";
import PredictionShare from "@/components/prediction-share";

interface PredictionReceiptProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: any;
    onViewPortfolio?: () => void;
}

export function PredictionReceipt({
    open,
    onOpenChange,
    receipt,
    onViewPortfolio
}: PredictionReceiptProps) {
    const [copied, setCopied] = useState(false);

    // Format date to a readable string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Copy receipt ID to clipboard
    const copyReceiptId = () => {
        navigator.clipboard.writeText(receipt.tokenId);
        setCopied(true);

        // Reset the copied state after a delay
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-4">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        Prediction Confirmed!
                    </DialogTitle>
                    <DialogDescription>
                        Your prediction has been recorded as a unique collectible ticket.
                    </DialogDescription>
                </DialogHeader>

                <Card className="border-2 border-primary/20 overflow-hidden">
                    <div className="relative w-full bg-muted overflow-hidden rounded-lg border border-primary/10">
                        {/* Use Next.js Image component with SVG - aspect ratio for ticket layout */}
                        <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
                            <Image
                                src={`/api/og/receipt/${receipt.predictionId || receipt.tokenId}`}
                                alt="Prediction ticket"
                                fill
                                priority
                                className="object-contain hover:scale-105 transition-transform duration-500"
                                style={{ objectFit: "contain" }}
                                unoptimized={true} // Important for SVGs to render properly
                            />

                            {/* Subtle holographic shimmer overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>

                        {/* Floating "Open Full Size" button with enhanced styling */}
                        <Button
                            size="sm"
                            variant="secondary"
                            className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm shadow-sm z-10 hover:bg-background hover:shadow-md transition-all duration-300"
                            onClick={() => {
                                window.open(`/api/og/receipt/${receipt.predictionId || receipt.tokenId}`, '_blank');
                            }}
                        >
                            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <polyline points="9 21 3 21 3 15"></polyline>
                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                            Full Size
                        </Button>

                        {/* Ticket badge */}
                        <Badge className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary border border-primary/20 shadow-sm flex items-center gap-1.5">
                            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
                                <path d="M9 12h6"></path>
                            </svg>
                            Prediction Ticket
                        </Badge>
                    </div>

                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-medium text-sm text-muted-foreground">MARKET</h3>
                            <p className="font-semibold">{receipt.marketName}</p>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h3 className="font-medium text-sm text-muted-foreground tracking-wide">PREDICTION</h3>
                                <Badge
                                    variant={receipt.outcomeName === 'Yes' ? 'default' : receipt.outcomeName === 'No' ? 'destructive' : 'secondary'}
                                    className="font-medium shadow-sm"
                                >
                                    {receipt.outcomeName}
                                </Badge>
                            </div>

                            <div className="text-right">
                                <h3 className="font-medium text-sm text-muted-foreground tracking-wide">AMOUNT</h3>
                                <p className="font-semibold">${receipt.amount.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-medium text-sm text-muted-foreground tracking-wide">DATE</h3>
                            <p className="text-sm">{formatDate(receipt.createdAt)}</p>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-medium text-sm text-muted-foreground tracking-wide">TICKET ID</h3>
                            <div className="flex items-center justify-between bg-muted/50 rounded-md p-2 border border-primary/10 hover:border-primary/20 transition-colors">
                                <code className="text-xs truncate font-mono">{receipt.tokenId}</code>
                                <Button variant="ghost" size="icon" onClick={copyReceiptId} className="h-6 w-6 hover:bg-primary/10">
                                    {copied ?
                                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> :
                                        <Copy className="h-3.5 w-3.5 text-primary/70" />
                                    }
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col space-y-2 justify-center items-center">
                    <div className="flex sm:flex-row flex-col sm:space-x-2 space-y-2 sm:space-y-0">
                        <Button
                            className="flex-1 group relative overflow-hidden"
                            variant="default"
                            onClick={() => {
                                onOpenChange(false);
                                if (onViewPortfolio) onViewPortfolio();
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out" style={{ transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }}></div>
                            <Wallet className="h-4 w-4 mr-2" />
                            View in Portfolio
                        </Button>

                        <div className="flex-1">
                            <PredictionShare
                                predictionId={receipt.predictionId || receipt.tokenId}
                                marketName={receipt.marketName}
                                isResolved={false}
                                outcomeSelected={receipt.outcomeName}
                                amount={receipt.amount}
                                isNftTokenId={!receipt.predictionId}
                            />
                        </div>
                    </div>

                    {/* Artistic footnote */}
                    <div className="text-center text-xs text-muted-foreground mt-2 italic">
                        This prediction ticket will remain in your portfolio as a unique collectible
                    </div>
                </div>

                {/* Add shimmer animation */}
                <style jsx global>{`
                    @keyframes shimmer {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(100%);
                        }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
} 