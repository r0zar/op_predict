/**
 * Signet client for interacting with the Signet Chrome extension
 */

export type NotificationType = 'OP_TRANSFER' | 'OP_PREDICT' | 'SYSTEM' | 'ERROR';

export interface Action {
  id: string;
  label: string;
  action: 'approve' | 'reject' | 'dismiss' | 'custom';
  color?: string;
}

export interface ShowNotificationOptions {
  id?: string;
  title: string;
  message: string;
  details?: string;
  color?: string;
  duration?: number;
  notificationType?: NotificationType;
  // Rich notification features
  imageUrl?: string;
  htmlContent?: string;
  actions?: Action[];
}

export interface TransactionMetadata {
  marketId?: string;
  marketName?: string;
  outcomeId?: number;
  outcomeName?: string;
  amount?: number;
  odds?: number;
  potentialPayout?: number;
  feeAmount?: number;
  networkFee?: number;
}

export interface RejectionReason {
  code: string;
  message: string;
  details?: string;
}

export interface NotificationResponse {
  id: string;
  notificationType: NotificationType;
  approved: boolean;
  timestamp?: number;
  result?: {
    transactionHash?: string;
    signature?: string;
    receiptId?: string;
    metadata?: TransactionMetadata;
  };
  rejectionReason?: RejectionReason;
}

export interface RelatedTransaction {
  id: string;
  type: string;
  timestamp: number;
  marketId?: string;
  marketName?: string;
}

export interface WalletUpdate {
  address: string;
  balance: string;
  previousBalance?: string;
  delta?: string;
  reason?: string;
  relatedTransaction?: RelatedTransaction;
}

export interface SignetClientOptions {
  debug?: boolean;
}

export class SignetClient {
  private debug: boolean;
  private responseHandlers: Map<string, (response: NotificationResponse) => void>;
  private walletUpdateHandlers: Array<(update: WalletUpdate) => void>;
  private isInitialized: boolean = false;

  constructor(options: SignetClientOptions = {}) {
    this.debug = options.debug || false;
    this.responseHandlers = new Map();
    this.walletUpdateHandlers = [];
  }

  /**
   * Initialize the Signet client and set up message listeners
   */
  public init(): void {
    if (typeof window === 'undefined') return;
    if (this.isInitialized) return;

    window.addEventListener('message', this.handleMessage);
    this.isInitialized = true;

    if (this.debug) {
      console.log('SignetClient initialized');
    }
  }

  /**
   * Clean up event listeners when no longer needed
   */
  public destroy(): void {
    if (typeof window === 'undefined') return;
    if (!this.isInitialized) return;

    window.removeEventListener('message', this.handleMessage);
    this.isInitialized = false;

    if (this.debug) {
      console.log('SignetClient destroyed');
    }
  }

  /**
   * Check if the Signet extension is installed
   */
  public isExtensionAvailable(): boolean {
    // This is a basic check, might need to be improved
    return typeof window !== 'undefined' && window.postMessage !== undefined;
  }

  /**
   * Show a notification in the Signet extension
   */
  public showNotification(options: ShowNotificationOptions): Promise<NotificationResponse> | void {
    if (typeof window === 'undefined') return;

    // Auto-generate an ID if none provided
    const id = options.id || `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const message = {
      type: 'SHOW_NOTIFICATION',
      id,
      title: options.title,
      message: options.message,
      details: options.details,
      color: options.color,
      duration: options.duration,
      notificationType: options.notificationType || 'SYSTEM',
      // Rich notification features
      imageUrl: options.imageUrl,
      htmlContent: options.htmlContent,
      actions: options.actions
    };

    if (this.debug) {
      console.log('Sending notification to Signet:', message);
    }

    window.postMessage(message, '*');

    // For notifications that expect a response (like OP_PREDICT)
    if (options.notificationType === 'OP_PREDICT' || options.notificationType === 'OP_TRANSFER') {
      return new Promise((resolve) => {
        this.responseHandlers.set(id, (response) => {
          resolve(response);
        });
      });
    }
  }

  /**
   * Hide the current notification
   */
  public hideNotification(): void {
    if (typeof window === 'undefined') return;

    window.postMessage({ type: 'HIDE_NOTIFICATION' }, '*');

    if (this.debug) {
      console.log('Hiding notification');
    }
  }

  /**
   * Toggle the extension visibility
   */
  public toggleExtension(): void {
    if (typeof window === 'undefined') return;

    window.postMessage({ type: 'TOGGLE_EXTENSION' }, '*');

    if (this.debug) {
      console.log('Toggling extension visibility');
    }
  }

  /**
   * Show the 3D cube notification
   */
  public show3D(color?: string, duration?: number): void {
    if (typeof window === 'undefined') return;

    window.postMessage({
      type: 'SHOW_3D',
      color,
      duration
    }, '*');

    if (this.debug) {
      console.log('Showing 3D cube', { color, duration });
    }
  }

  /**
   * Hide the 3D cube notification
   */
  public hide3D(): void {
    if (typeof window === 'undefined') return;

    window.postMessage({ type: 'HIDE_3D' }, '*');

    if (this.debug) {
      console.log('Hiding 3D cube');
    }
  }

  /**
   * Change UI color of the extension
   */
  public changeColor(color: string): void {
    if (typeof window === 'undefined') return;

    window.postMessage({
      type: 'CHANGE_COLOR',
      color
    }, '*');

    if (this.debug) {
      console.log('Changing UI color to', color);
    }
  }

  /**
   * Create a prediction market operation and wait for user confirmation
   */
  public createPrediction(options: {
    id?: string,
    title: string,
    message: string,
    details: string,
    imageUrl?: string,
    htmlContent?: string,
    actions?: Action[]
  }): Promise<NotificationResponse> {
    return this.showNotification({
      id: options.id,
      title: options.title,
      message: options.message,
      details: options.details,
      notificationType: 'OP_PREDICT',
      imageUrl: options.imageUrl,
      htmlContent: options.htmlContent,
      actions: options.actions
    }) as Promise<NotificationResponse>;
  }

  /**
   * Create a rich notification with enhanced features
   */
  public createRichNotification(options: {
    id?: string,
    title: string,
    message: string,
    details?: string,
    notificationType?: NotificationType,
    duration?: number,
    imageUrl?: string,
    htmlContent?: string,
    actions?: Action[]
  }): Promise<NotificationResponse> | void {
    return this.showNotification({
      id: options.id,
      title: options.title,
      message: options.message,
      details: options.details,
      notificationType: options.notificationType || 'SYSTEM',
      duration: options.duration,
      imageUrl: options.imageUrl,
      htmlContent: options.htmlContent,
      actions: options.actions
    });
  }

  /**
   * Register a callback for wallet updates
   */
  public onWalletUpdate(callback: (update: WalletUpdate) => void): () => void {
    this.walletUpdateHandlers.push(callback);

    // Return a function to remove this handler
    return () => {
      this.walletUpdateHandlers = this.walletUpdateHandlers.filter(h => h !== callback);
    };
  }

  /**
   * Handle incoming messages from the Signet extension
   */
  private handleMessage = (event: MessageEvent): void => {
    if (!event.data || typeof event.data !== 'object') return;

    if (this.debug) {
      console.log('Received message from Signet:', event.data);
    }

    // Handle notification responses
    if (event.data.type === 'NOTIFICATION_RESPONSE') {
      const {
        id,
        notificationType,
        approved,
        timestamp,
        result,
        rejectionReason
      } = event.data;

      // Find and call the handler for this notification ID
      const handler = this.responseHandlers.get(id);
      if (handler) {
        handler({
          id,
          notificationType,
          approved,
          timestamp,
          result,
          rejectionReason
        });
        this.responseHandlers.delete(id);
      }
    }

    // Handle wallet balance updates
    if (event.data.type === 'WALLET_UPDATE') {
      const {
        address,
        balance,
        previousBalance,
        delta,
        reason,
        relatedTransaction
      } = event.data;

      this.walletUpdateHandlers.forEach(handler => {
        handler({
          address,
          balance,
          previousBalance,
          delta,
          reason,
          relatedTransaction
        });
      });
    }
  };
}

// Export a singleton instance for easy use
export const signetClient = new SignetClient();