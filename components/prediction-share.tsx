'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share, Twitter, Copy, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBaseUrl } from "@/lib/utils";

interface PredictionShareProps {
    predictionId: string;
    predictionNonce: number;
    marketName: string;
    isResolved: boolean;
    outcomeSelected: string;
    amount: number;
    pnl?: number;
    isNftTokenId?: boolean;
}

// Safe way to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export default function PredictionShare({
    predictionId,
    predictionNonce,
    marketName,
    isResolved,
    outcomeSelected,
    amount,
    pnl,
    isNftTokenId = true,
}: PredictionShareProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [fallbackImageUrl, setFallbackImageUrl] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState('https://oppredict.com');
    const [isClient, setIsClient] = useState(false);
    const [isDev, setIsDev] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Only access window and environment on client side
    useEffect(() => {
        setIsClient(true);
        const devMode = process.env.NODE_ENV === 'development';
        setIsDev(devMode);

        // Set base URL safely without direct window access
        const url = getBaseUrl();
        setBaseUrl(url);

        // Set preview image URL
        const imageUrl = `${url}/api/og/prediction/${predictionId}`;
        setPreviewImageUrl(imageUrl);

        // Create a fallback image URL with query parameters for both dev and prod
        const fallbackUrl = new URL(`${url}/api/og/debug`);
        fallbackUrl.searchParams.set('market', marketName);
        fallbackUrl.searchParams.set('outcome', outcomeSelected);
        fallbackUrl.searchParams.set('amount', amount.toString());
        if (isResolved && typeof pnl !== 'undefined') {
            fallbackUrl.searchParams.set('pnl', pnl.toString());
        }
        setFallbackImageUrl(fallbackUrl.toString());

        // Test if the OG image endpoint is available
        const testImage = new Image();
        testImage.onload = () => {
            setImageLoaded(true);
            console.log("OG image loaded successfully:", imageUrl);
        };
        testImage.onerror = () => {
            console.warn("OG image failed to load:", imageUrl);
            setPreviewError("OG image failed to load. Using fallback.");
        };
        testImage.src = imageUrl;

    }, [predictionId, marketName, outcomeSelected, amount, isResolved, pnl]);

    // Create share URLs based on the state
    const predictionUrl = `${baseUrl}/prediction/${predictionId}`;

    // Create social share links
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        isResolved
            ? `I just ${pnl && pnl > 0 ? 'won' : 'lost'} ${Math.abs(pnl || 0).toFixed(2)} USD on "${marketName}" with Charisma!`
            : `I predicted "${outcomeSelected}" for "${marketName}" on Charisma!`
    )}&url=${encodeURIComponent(predictionUrl)}`;

    // Handle copy link to clipboard
    const handleCopyLink = () => {
        navigator.clipboard.writeText(predictionUrl);
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

        // Determine which URL to use
        const imageUrlToOpen = previewError || !imageLoaded
            ? (fallbackImageUrl || `${baseUrl}/api/og/debug?market=${encodeURIComponent(marketName)}`)
            : previewImageUrl;

        // Log which URL we're using for debugging
        console.log("Opening preview image:", {
            using: previewError || !imageLoaded ? "fallback" : "OG image",
            url: imageUrlToOpen
        });

        window.open(imageUrlToOpen, '_blank');
        setIsImageLoading(false);
    };

    // Handle image load error
    const handleImageError = () => {
        setPreviewError('Error loading preview image');
        console.error('Error loading preview image. Using fallback:', fallbackImageUrl);
    };

    // Handle image load success
    const handleImageLoad = () => {
        setImageLoaded(true);
        setPreviewError(null);
    };

    return (
        <>
            <Button
                onClick={handleDirectShare}
                className="gap-2 bg-blue-600 hover:bg-blue-700 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <Share className="h-4 w-4" />
                Share Your Prediction
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-slate-100">Share Your Prediction</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="rounded-lg overflow-hidden border border-slate-700 aspect-[1200/630]">
                            {previewError || !imageLoaded ? (
                                <img
                                    src={fallbackImageUrl || '/placeholder-og-image.png'}
                                    alt="Prediction preview (fallback)"
                                    className="w-full h-full object-cover"
                                    onLoad={() => console.log("Fallback image loaded")}
                                    onError={() => {
                                        console.error("Even fallback image failed to load");
                                    }}
                                />
                            ) : (
                                <img
                                    src={previewImageUrl}
                                    alt="Prediction preview"
                                    className="w-full h-full object-cover"
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            )}
                        </div>

                        {previewError && (
                            <div className="text-amber-400 text-sm">
                                Using fallback preview image. The actual share image will be generated on view.
                            </div>
                        )}

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
                                <ImageIcon className="h-4 w-4" />
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