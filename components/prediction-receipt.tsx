"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PredictionNFTReceipt } from "@op-predict/lib";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, Wallet } from "lucide-react";
import { toast } from "sonner";
import PredictionShare from "@/components/prediction-share";

interface PredictionReceiptProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: PredictionNFTReceipt;
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
        toast.success("Receipt ID copied to clipboard");

        // Reset the copied state after a delay
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                        Prediction Confirmed!
                    </DialogTitle>
                    <DialogDescription>
                        Your prediction has been recorded and you've received a Prediction Receipt NFT.
                    </DialogDescription>
                </DialogHeader>

                <Card className="border-2 border-primary/20 overflow-hidden">
                    <div className="relative w-full h-40 bg-muted">
                        {receipt.image.startsWith('data:') ? (
                            <img
                                src={receipt.image}
                                alt={`Receipt for prediction on ${receipt.marketName}`}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <Image
                                src={receipt.image}
                                alt={`Receipt for prediction on ${receipt.marketName}`}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>

                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-medium text-sm text-muted-foreground">MARKET</h3>
                            <p className="font-semibold">{receipt.marketName}</p>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h3 className="font-medium text-sm text-muted-foreground">PREDICTION</h3>
                                <Badge variant={receipt.outcomeName === 'Yes' ? 'default' : receipt.outcomeName === 'No' ? 'destructive' : 'secondary'}>
                                    {receipt.outcomeName}
                                </Badge>
                            </div>

                            <div className="text-right">
                                <h3 className="font-medium text-sm text-muted-foreground">AMOUNT</h3>
                                <p className="font-semibold">${receipt.amount.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-medium text-sm text-muted-foreground">DATE</h3>
                            <p>{formatDate(receipt.createdAt)}</p>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-medium text-sm text-muted-foreground">RECEIPT ID</h3>
                            <div className="flex items-center justify-between bg-muted/50 rounded p-2">
                                <code className="text-xs truncate max-w-[200px]">{receipt.tokenId}</code>
                                <Button variant="ghost" size="icon" onClick={copyReceiptId} className="h-6 w-6">
                                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-4">
                    <Button
                        className="flex-1"
                        variant="default"
                        onClick={() => {
                            onOpenChange(false);
                            if (onViewPortfolio) onViewPortfolio();
                        }}
                    >
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
            </DialogContent>
        </Dialog>
    );
} 