'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { returnPrediction } from '@/app/actions/prediction-actions';
import { useRouter } from 'next/navigation';

interface ReturnPredictionButtonProps {
  predictionId: string;
  predictionNonce?: number; // Add this for on-chain operations
  tooltip?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function ReturnPredictionButton({
  predictionId,
  predictionNonce,
  tooltip = 'Return this prediction',
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen
}: ReturnPredictionButtonProps) {
  // Use internal state if external state is not provided
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Use either external or internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  const handleReturn = async () => {
    setIsReturning(true);
    setError(null);

    try {
      const result = await returnPrediction({ transactionId: predictionId });

      if (result.success) {
        // Close dialog and redirect to markets page or refresh
        setIsOpen(false);
        router.refresh();

        // If returned successfully, redirect to the market page if we have it
        if (result.transaction?.marketId) {
          router.push(`/markets/${result.transaction.marketId}`);
        } else {
          router.push('/markets');
        }
      } else {
        setError(result.error || 'Failed to return prediction');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error returning prediction:', error);
    } finally {
      setIsReturning(false);
    }
  };

  // If used standalone (outside the badge pattern)
  if (externalIsOpen === undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Return
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5" />
              Return Prediction
            </DialogTitle>
            <DialogDescription>
              This will cancel your prediction and return the full amount to your balance.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <div className="bg-muted rounded-md p-3 text-sm mb-4">
              <p className="font-medium mb-1">Important information:</p>
              <ul className="ml-2 space-y-1 text-xs">
                <li>• Your prediction will be immediately deleted</li>
                <li>• The full amount will be returned to your balance</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isReturning}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleReturn}
              disabled={isReturning}
              className="flex-1 sm:flex-none"
            >
              {isReturning ? 'Processing...' : 'Confirm Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // When used as a dialog from the badge
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5" />
          Return Prediction
        </DialogTitle>
        <DialogDescription>
          This will cancel your prediction and return the full amount to your balance.
        </DialogDescription>
      </DialogHeader>

      <div className="py-3">
        <div className="bg-muted rounded-md p-3 text-sm mb-4">
          <p className="font-medium mb-1">Important information:</p>
          <ul className="ml-2 space-y-1 text-xs">
            <li>• Your prediction will be immediately deleted</li>
            <li>• The full amount will be returned to your balance</li>
            <li>• This action cannot be undone</li>
          </ul>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          disabled={isReturning}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={handleReturn}
          disabled={isReturning}
          className="flex-1 sm:flex-none"
        >
          {isReturning ? 'Processing...' : 'Confirm Return'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}