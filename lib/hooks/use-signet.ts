import { useEffect, useState, useCallback } from 'react';
import { signetClient, WalletUpdate, NotificationResponse, ShowNotificationOptions } from '../signet-client';

interface UseSignetOptions {
  debug?: boolean;
  initOnMount?: boolean;
}

export function useSignet(options: UseSignetOptions = {}) {
  const { debug = false, initOnMount = true } = options;
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<WalletUpdate | null>(null);

  // Initialize the client on mount if enabled
  useEffect(() => {
    if (initOnMount) {
      signetClient.init();
      
      // Check if extension is available
      const available = signetClient.isExtensionAvailable();
      setIsAvailable(available);
      
      // Clean up on unmount
      return () => {
        signetClient.destroy();
      };
    }
  }, [initOnMount]);

  // Set up wallet update handler
  useEffect(() => {
    const unsubscribe = signetClient.onWalletUpdate((update) => {
      setWalletInfo(update);
    });
    
    return unsubscribe;
  }, []);

  // Wrapper for showing notifications
  const showNotification = useCallback((options: ShowNotificationOptions): Promise<NotificationResponse> | void => {
    return signetClient.showNotification(options);
  }, []);

  // Wrapper for OP_PREDICT operations
  const createPrediction = useCallback((options: {
    id?: string,
    title: string,
    message: string,
    details: string
  }): Promise<NotificationResponse> => {
    return signetClient.createPrediction(options);
  }, []);

  // Other utility methods
  const hideNotification = useCallback(() => signetClient.hideNotification(), []);
  const toggleExtension = useCallback(() => signetClient.toggleExtension(), []);
  const show3D = useCallback((color?: string, duration?: number) => signetClient.show3D(color, duration), []);
  const hide3D = useCallback(() => signetClient.hide3D(), []);
  const changeColor = useCallback((color: string) => signetClient.changeColor(color), []);

  return {
    isAvailable,
    walletInfo,
    showNotification,
    hideNotification,
    toggleExtension,
    show3D,
    hide3D,
    changeColor,
    createPrediction,
    // For advanced use cases
    client: signetClient
  };
}