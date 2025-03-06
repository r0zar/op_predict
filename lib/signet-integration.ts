'use client';

import { initializeSignetSDK, type SignetSDK } from 'signet-sdk';
import { toast } from 'sonner';

// Global SDK instance
let signetSDK: SignetSDK | null = null;

// Initializes the Signet SDK
export function initializeSignet(): SignetSDK | null {
  if (signetSDK) {
    return signetSDK;
  }

  try {
    // Initialize the SDK
    signetSDK = initializeSignetSDK();

    // Register listeners
    signetSDK.on('ready', () => {
      console.log('Signet SDK ready');
    });

    signetSDK.on('connected', () => {
      console.log('Connected to Signet extension');
    });

    signetSDK.on('disconnected', () => {
      console.log('Disconnected from Signet extension');
    });

    return signetSDK;
  } catch (error) {
    console.error('Failed to initialize Signet SDK:', error);
    return null;
  }
}

// Checks if the Signet extension is installed
export function checkSignetExtension(): boolean {
  const sdk = initializeSignet();
  return sdk ? sdk.isExtensionInstalled() : false;
}

// Triggers a prediction event in Signet
export async function triggerPredictionEvent(data: {
  marketId: string;
  marketName: string;
  outcomeId: number;
  outcomeName: string;
  amount: number;
}): Promise<boolean> {
  const sdk = initializeSignet();
  
  if (!sdk) {
    console.error('Signet SDK not initialized');
    return false;
  }
  
  if (!sdk.isExtensionInstalled()) {
    console.log('Signet extension not installed');
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
      return true;
    } else {
      console.error('Failed to sign prediction data');
      return false;
    }
  } catch (error) {
    console.error('Error triggering prediction event:', error);
    
    // Show error notification
    if (sdk) {
      sdk.showNotification(
        'error',
        'Prediction Signature Failed',
        'Failed to sign your prediction'
      );
    }
    
    return false;
  }
}

// Utility to show toast notifications based on Signet integration status
export function handleSignetNotifications(success: boolean, extensionInstalled: boolean) {
  if (!extensionInstalled) {
    toast.info('Signet Extension Not Detected', {
      description: 'Install the Signet extension for enhanced security.',
      duration: 5000,
    });
    return;
  }
  
  if (success) {
    toast.success('Prediction Signed with Signet', {
      description: 'Your prediction was cryptographically signed.',
      duration: 3000,
    });
  } else {
    toast.error('Signature Failed', {
      description: 'Unable to sign your prediction with Signet.',
      duration: 3000,
    });
  }
}