'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Share, Twitter, Copy, Image, ExternalLink } from 'lucide-react';

interface PredictionShareProps {
    predictionId: string;
    marketName: string;
    isResolved: boolean;
    outcomeSelected: string;
    amount: number;
    pnl?: number;
}

export default function PredictionShare({
    predictionId,
    marketName,
    isResolved,
    outcomeSelected,
    amount,
    pnl,
}: PredictionShareProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    // Create share URLs
    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://oppredict.com'}`;
    const predictionUrl = `${baseUrl}/prediction/${predictionId}`;

    // Create social share links
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        isResolved
            ? `I just ${pnl && pnl > 0 ? 'won' : 'lost'} ${Math.abs(pnl || 0).toFixed(2)} USD on "${marketName}" with Charisma!`
            : `I predicted "${outcomeSelected}" for "${marketName}" on Charisma!`
    )}&url=${encodeURIComponent(predictionUrl)}`;

    // Preview image URL
    const previewImageUrl = `${baseUrl}/api/og/prediction/${predictionId}`;

    // Handle copy link to clipboard
    const handleCopyLink = () => {
        navigator.clipboard.writeText(predictionUrl);
        toast.success('Link copied to clipboard');
    };

    // Handle X (Twitter) share
    const handleTwitterShare = () => {
        window.open(twitterShareUrl, '_blank');
    };

    // Handle direct share using Web Share API if available
    const handleDirectShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: isResolved
                        ? `Charisma Prediction Result: ${marketName}`
                        : `Charisma Prediction: ${marketName}`,
                    text: isResolved
                        ? `I just ${pnl && pnl > 0 ? 'won' : 'lost'} ${Math.abs(pnl || 0).toFixed(2)} USD on "${marketName}" with Charisma!`
                        : `I predicted "${outcomeSelected}" for "${marketName}" on Charisma!`,
                    url: predictionUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
                // Fallback to opening dialog
                setIsOpen(true);
            }
        } else {
            // Web Share API not available, show dialog
            setIsOpen(true);
        }
    };

    // Preview the image
    const handlePreviewImage = () => {
        setIsImageLoading(true);
        window.open(previewImageUrl, '_blank');
        setIsImageLoading(false);
    };

    return (
        <>
            <Button
                onClick={handleDirectShare}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
                <Share className="h-4 w-4" />
                Share Prediction
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-slate-100">Share Your Prediction</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="rounded-lg overflow-hidden border border-slate-700 aspect-[1200/630]">
                            <img
                                src={previewImageUrl}
                                alt="Prediction preview"
                                className="w-full h-full object-cover"
                                onError={() => toast.error('Error loading preview image')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={handleTwitterShare} variant="outline" className="gap-2 bg-transparent border-slate-700 hover:bg-slate-700">
                                <Twitter className="h-4 w-4" />
                                Share on X
                            </Button>

                            <Button onClick={handleCopyLink} variant="outline" className="gap-2 bg-transparent border-slate-700 hover:bg-slate-700">
                                <Copy className="h-4 w-4" />
                                Copy Link
                            </Button>

                            <Button onClick={handlePreviewImage} variant="outline" className="gap-2 bg-transparent border-slate-700 hover:bg-slate-700">
                                <Image className="h-4 w-4" />
                                {isImageLoading ? 'Loading...' : 'View Image'}
                            </Button>

                            <Button
                                onClick={() => window.open(predictionUrl, '_blank')}
                                variant="outline"
                                className="gap-2 bg-transparent border-slate-700 hover:bg-slate-700"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View Prediction
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
} 