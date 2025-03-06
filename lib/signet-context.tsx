'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeSignetSDK, type SignetSDK } from 'signet-sdk';
import { toast } from 'sonner';

interface SignetContextType {
  sdk: SignetSDK | null;
  isExtensionInstalled: boolean;
  isInitialized: boolean;
  triggerPredictionEvent: (data: PredictionEventData) => Promise<boolean>;
}

interface PredictionEventData {
  marketId: string;
  marketName: string;
  outcomeId: number;
  outcomeName: string;
  amount: number;
}

const SignetContext = createContext<SignetContextType>({
  sdk: null,
  isExtensionInstalled: false,
  isInitialized: false,
  triggerPredictionEvent: async () => false,
});

interface SignetProviderProps {
  children: ReactNode;
}

export function SignetProvider({ children }: SignetProviderProps) {
  const [sdk, setSdk] = useState<SignetSDK | null>(null);
  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const initializeSdk = async () => {
      try {
        // Initialize the SDK
        const signetSDK = initializeSignetSDK();

        // Register event listeners
        signetSDK.on('ready', () => {
          console.log('Signet SDK ready');
          if (mounted) {
            setIsInitialized(true);
          }
        });

        signetSDK.on('connected', () => {
          console.log('Connected to Signet extension');
          if (mounted) {
            setIsExtensionInstalled(true);
          }
        });

        signetSDK.on('disconnected', () => {
          console.log('Disconnected from Signet extension');
          if (mounted) {
            setIsExtensionInstalled(false);
          }
        });

        // Check if extension is installed
        const installed = signetSDK.isExtensionInstalled();
        
        if (mounted) {
          setSdk(signetSDK);
          setIsExtensionInstalled(installed);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize Signet SDK:', error);
        if (mounted) {
          setIsInitialized(true); // Still mark as initialized, just with errors
        }
      }
    };

    initializeSdk();

    return () => {
      mounted = false;
    };
  }, []);

  // Trigger a prediction event in Signet
  const triggerPredictionEvent = async (data: PredictionEventData): Promise<boolean> => {
    if (!sdk || !isExtensionInstalled) {
      return false;
    }

    try {
      // Create prediction data to sign
      const predictionData = {
        type: 'predict',
        timestamp: Date.now(),
        ...data
      };
      
      // Sign the prediction data
      const result = await sdk.signStructuredData(predictionData);
      
      if (result && result.signature) {
        // Show success notification if signing was successful
        sdk.showNotification(
          'success',
          'Prediction Signature Confirmed',
          `You signed a prediction for ${data.marketName}`
        );
        
        toast.success('Prediction Signed with Signet', {
          description: 'Your prediction was cryptographically signed.',
          duration: 3000,
        });
        
        return true;
      } else {
        console.error('Failed to sign prediction data');
        
        toast.error('Signature Failed', {
          description: 'Unable to sign your prediction with Signet.',
          duration: 3000,
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error triggering prediction event:', error);
      
      // Show error notification
      sdk.showNotification(
        'error',
        'Prediction Signature Failed',
        'Failed to sign your prediction'
      );
      
      toast.error('Signature Failed', {
        description: 'Unable to sign your prediction with Signet.',
        duration: 3000,
      });
      
      return false;
    }
  };

  const value = {
    sdk,
    isExtensionInstalled,
    isInitialized,
    triggerPredictionEvent,
  };

  return (
    <SignetContext.Provider value={value}>
      {children}
    </SignetContext.Provider>
  );
}

export function useSignet() {
  return useContext(SignetContext);
}