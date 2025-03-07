'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  signetClient,
  WalletUpdate,
  NotificationResponse,
  ShowNotificationOptions,
  NotificationType,
  Action
} from './signet-client';

interface SignetContextType {
  isAvailable: boolean;
  walletInfo: WalletUpdate | null;
  showNotification: (options: ShowNotificationOptions) => Promise<NotificationResponse> | void;
  hideNotification: () => void;
  toggleExtension: () => void;
  show3D: (color?: string, duration?: number) => void;
  hide3D: () => void;
  changeColor: (color: string) => void;
  createPrediction: (options: {
    id?: string;
    title: string;
    message: string;
    details: string;
    imageUrl?: string;
    htmlContent?: string;
    actions?: Action[];
  }) => Promise<NotificationResponse>;
  createRichNotification: (options: {
    id?: string;
    title: string;
    message: string;
    details?: string;
    notificationType?: NotificationType;
    duration?: number;
    imageUrl?: string;
    htmlContent?: string;
    actions?: Action[];
  }) => Promise<NotificationResponse> | void;
  createMarketPrediction: (data: PredictionEventData) => Promise<NotificationResponse>;
}

interface PredictionEventData {
  marketId: string;
  marketName: string;
  outcomeId: number;
  outcomeName: string;
  amount: number;
}

const defaultContext: SignetContextType = {
  isAvailable: false,
  walletInfo: null,
  showNotification: () => { },
  hideNotification: () => { },
  toggleExtension: () => { },
  show3D: () => { },
  hide3D: () => { },
  changeColor: () => { },
  createPrediction: () => Promise.reject('Signet not initialized'),
  createRichNotification: () => { },
  createMarketPrediction: () => Promise.reject('Signet not initialized')
};

const SignetContext = createContext<SignetContextType>(defaultContext);

interface SignetProviderProps {
  children: ReactNode;
  debug?: boolean;
}

export function SignetProvider({ children, debug = false }: SignetProviderProps) {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<WalletUpdate | null>(null);

  // Initialize client on mount
  useEffect(() => {
    signetClient.init();

    // Check if extension is available
    const available = signetClient.isExtensionAvailable();
    setIsAvailable(available);

    return () => {
      signetClient.destroy();
    };
  }, []);

  // Set up wallet update handler
  useEffect(() => {
    const unsubscribe = signetClient.onWalletUpdate((update) => {
      setWalletInfo(update);
    });

    return unsubscribe;
  }, []);

  // Helper methods
  const showNotification = useCallback((options: ShowNotificationOptions) => {
    return signetClient.showNotification(options);
  }, []);

  const createPrediction = useCallback((options: {
    id?: string;
    title: string;
    message: string;
    details: string;
  }) => {
    return signetClient.createPrediction(options);
  }, []);

  // Specialized method for market predictions
  const createMarketPrediction = useCallback((data: PredictionEventData): Promise<NotificationResponse> => {
    const { marketId, marketName, outcomeId, outcomeName, amount } = data;

    // Create a rich notification with enhanced features
    return signetClient.createPrediction({
      title: 'PREDICTION CONFIRMATION',
      message: 'Blaze Protocol signature request',
      details: `Market: ${marketName}\nOutcome: ${outcomeName}\nAmount: ${amount}`,
      // Example of using rich HTML content (optional)
      htmlContent: `
        <div style="text-align: center;">
          <h3 style="color: #50fa7b; margin-bottom: 10px;">${marketName}</h3>
          <div style="margin: 8px 0; font-weight: bold;">
            You are predicting: <span style="color: #bd93f9;">${outcomeName}</span>
          </div>
          <div style="margin: 8px 0;">
            Amount: <span style="color: #f1fa8c;">${amount}</span>
          </div>
        </div>
      `,
      // Example of custom actions (optional)
      actions: [
        {
          id: 'confirm',
          label: 'CONFIRM PREDICTION',
          action: 'approve',
          color: 'rgb(125, 249, 255)'
        },
        {
          id: 'reject',
          label: 'CANCEL',
          action: 'reject'
        }
      ]
    });
  }, []);

  // Other utility methods
  const hideNotification = useCallback(() => signetClient.hideNotification(), []);
  const toggleExtension = useCallback(() => signetClient.toggleExtension(), []);
  const show3D = useCallback((color?: string, duration?: number) => signetClient.show3D(color, duration), []);
  const hide3D = useCallback(() => signetClient.hide3D(), []);
  const changeColor = useCallback((color: string) => signetClient.changeColor(color), []);

  // Add createRichNotification method
  const createRichNotification = useCallback((options: {
    id?: string;
    title: string;
    message: string;
    details?: string;
    notificationType?: NotificationType;
    duration?: number;
    imageUrl?: string;
    htmlContent?: string;
    actions?: Action[];
  }) => {
    return signetClient.createRichNotification(options);
  }, []);

  const contextValue: SignetContextType = {
    isAvailable,
    walletInfo,
    showNotification,
    hideNotification,
    toggleExtension,
    show3D,
    hide3D,
    changeColor,
    createPrediction,
    createRichNotification,
    createMarketPrediction
  };

  useEffect(() => {
    if (debug) {
      console.log('Signet context initialized:', { isAvailable, walletInfo });
    }
  }, [debug, isAvailable, walletInfo]);

  return (
    <SignetContext.Provider value={contextValue}>
      {children}
    </SignetContext.Provider>
  );
}

export function useSignet() {
  return useContext(SignetContext);
}