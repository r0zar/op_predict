# Signet Client Library

This document explains how to use the Signet client library to interact with the Signet Chrome extension.

## Overview

The Signet client library provides a simple and type-safe way to interact with the Signet Chrome extension for:

- Displaying notifications
- Requesting transaction approvals
- Creating prediction market operations
- Toggling UI elements
- Receiving responses

## Installation

No installation needed - the library is included in the codebase.

## Basic Usage

### Using the React Hook

```tsx
import { useSignet } from '@/lib/signet-context';

function MyComponent() {
  const signet = useSignet();
  
  const handleButtonClick = () => {
    signet.showNotification({
      title: 'SYSTEM MESSAGE',
      message: 'Action completed successfully',
      notificationType: 'SYSTEM',
      duration: 5000
    });
  };
  
  return (
    <div>
      <button onClick={handleButtonClick}>
        Show Notification
      </button>
      
      {signet.isAvailable ? (
        <p>Signet extension is available</p>
      ) : (
        <p>Signet extension not detected</p>
      )}
    </div>
  );
}
```

### Direct Client Usage (Non-React)

```typescript
import { signetClient } from '@/lib/signet-client';

// Initialize the client
signetClient.init();

// Show a notification
signetClient.showNotification({
  title: 'SYSTEM MESSAGE',
  message: 'Action completed successfully',
  notificationType: 'SYSTEM',
  duration: 5000
});

// Clean up when done
signetClient.destroy();
```

## Prediction Market Operations

For prediction market operations that require user approval:

```tsx
import { useSignet } from '@/lib/signet-context';

function PredictionButton({ market, outcome, amount }) {
  const signet = useSignet();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePredict = async () => {
    setIsProcessing(true);
    
    try {
      const response = await signet.createMarketPrediction({
        marketId: market.id,
        marketName: market.name,
        outcomeId: outcome.id,
        outcomeName: outcome.name,
        amount: amount
      });
      
      if (response.approved) {
        // User approved the prediction
        // Continue with creating the prediction
        console.log('Prediction approved:', response.result);
      } else {
        // User rejected the prediction
        console.log('Prediction rejected by user');
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <button 
      onClick={handlePredict}
      disabled={isProcessing || !signet.isAvailable}
    >
      {isProcessing ? 'Processing...' : 'Predict'}
    </button>
  );
}
```

## UI Control

The library provides methods to control the extension UI:

```tsx
// Toggle extension visibility
signet.toggleExtension();

// Show 3D cube notification
signet.show3D('rgb(125, 249, 255)', 5000);

// Hide 3D cube notification
signet.hide3D();

// Change UI color
signet.changeColor('rgb(125, 249, 255)');
```

## Wallet Updates

Listen for wallet updates:

```tsx
function WalletDisplay() {
  const signet = useSignet();
  
  return (
    <div>
      {signet.walletInfo ? (
        <div>
          <p>Address: {signet.walletInfo.address}</p>
          <p>Balance: {signet.walletInfo.balance}</p>
        </div>
      ) : (
        <p>Wallet not connected</p>
      )}
    </div>
  );
}
```

## Notification Types

The Signet client supports different notification types:

1. **SYSTEM** - For general system messages
2. **ERROR** - For error messages
3. **TRANSACTION** - For transaction approval requests
4. **OP_PREDICT** - For prediction market operations

Example:

```tsx
// System notification
signet.showNotification({
  title: 'SYSTEM',
  message: 'Operation completed',
  notificationType: 'SYSTEM',
  duration: 5000
});

// Error notification
signet.showNotification({
  title: 'ERROR',
  message: 'Failed to complete operation',
  notificationType: 'ERROR',
  duration: 8000
});

// Transaction notification (requires approval)
const response = await signet.showNotification({
  title: 'OP_TRANSFER',
  message: 'Please confirm this transaction',
  details: 'Send 0.1 sBTC to SP123456789',
  notificationType: 'OP_TRANSFER'
});

console.log('User approved:', response.approved);
```

## Provider Setup

To make the Signet client available throughout your application, use the provided context provider:

```tsx
// In your app layout or root component
import { SignetProvider } from '@/lib/signet-context';

export default function AppLayout({ children }) {
  return (
    <SignetProvider debug={process.env.NODE_ENV === 'development'}>
      {children}
    </SignetProvider>
  );
}
```

## API Reference

### SignetClient

The core client class that handles communication with the Signet extension.

```typescript
// Initialize
signetClient.init();

// Clean up
signetClient.destroy();

// Check extension availability
const isAvailable = signetClient.isExtensionAvailable();

// Show notification
signetClient.showNotification({
  title: string;
  message: string;
  details?: string;
  color?: string;
  duration?: number;
  notificationType?: 'OP_TRANSFER' | 'OP_PREDICT' | 'SYSTEM' | 'ERROR';
});

// Hide notification
signetClient.hideNotification();

// Toggle extension
signetClient.toggleExtension();

// Show 3D cube
signetClient.show3D(color?: string, duration?: number);

// Hide 3D cube
signetClient.hide3D();

// Change UI color
signetClient.changeColor(color: string);

// Create prediction
signetClient.createPrediction({
  id?: string;
  title: string;
  message: string;
  details: string;
});

// Listen for wallet updates
const unsubscribe = signetClient.onWalletUpdate((update) => {
  console.log('Wallet updated:', update);
});

// Remove listener when done
unsubscribe();
```

### useSignet Hook

React hook that provides access to the Signet client:

```typescript
const {
  isAvailable,            // Boolean indicating if extension is available
  walletInfo,             // Current wallet info (address, balance)
  showNotification,       // Function to show notification
  hideNotification,       // Function to hide notification
  toggleExtension,        // Function to toggle extension
  show3D,                 // Function to show 3D cube
  hide3D,                 // Function to hide 3D cube
  changeColor,            // Function to change UI color
  createPrediction,       // Function to create prediction
  createMarketPrediction  // Function to create market prediction
} = useSignet();
```

## Best Practices

1. **Always check extension availability** before attempting operations
2. **Handle responses gracefully** for operations that require user approval
3. **Set appropriate durations** based on notification importance
4. **Clean up event listeners** when components unmount
5. **Use specific notification types** for different scenarios
6. **Provide clear details** in notification messages
7. **Include unique IDs** for transactions and predictions

## Example Component

A complete example showing how to use the Signet client:

```tsx
import React, { useState } from 'react';
import { useSignet } from '@/lib/signet-context';

export function PredictionForm({ market, outcome }) {
  const signet = useSignet();
  const [amount, setAmount] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!signet.isAvailable) {
      alert('Signet extension not detected. Please install it first.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Request user approval
      const response = await signet.createMarketPrediction({
        marketId: market.id,
        marketName: market.name,
        outcomeId: outcome.id,
        outcomeName: outcome.name,
        amount
      });
      
      if (response.approved) {
        // User approved, continue with transaction
        setResult({ success: true, data: response.result });
        
        // Show success notification
        signet.showNotification({
          title: 'SUCCESS',
          message: 'Prediction created',
          details: `You predicted ${outcome.name} with ${amount} tokens`,
          notificationType: 'SYSTEM',
          duration: 5000
        });
      } else {
        // User rejected
        setResult({ success: false, error: 'User rejected the prediction' });
      }
    } catch (error) {
      console.error('Prediction failed:', error);
      setResult({ success: false, error: String(error) });
      
      // Show error notification
      signet.showNotification({
        title: 'ERROR',
        message: 'Prediction failed',
        details: String(error),
        notificationType: 'ERROR',
        duration: 8000
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Prediction</h3>
      <p>Market: {market.name}</p>
      <p>Outcome: {outcome.name}</p>
      
      <label>
        Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1"
          required
        />
      </label>
      
      <button
        type="submit"
        disabled={isProcessing || !signet.isAvailable}
      >
        {isProcessing ? 'Processing...' : 'Submit Prediction'}
      </button>
      
      {!signet.isAvailable && (
        <p>Signet extension not detected. Please install it to continue.</p>
      )}
      
      {result && (
        <div>
          <h4>{result.success ? 'Success!' : 'Error'}</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}
```