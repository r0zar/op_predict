# Signet Client Updates

We've updated our Signet client library to support the new features introduced in the Signet extension update. This document provides an overview of the changes and how to use the new features.

## Updates Made

1. **Enhanced Type Definitions**
   - Added support for rich notification features
   - Updated response interfaces to include detailed transaction data
   - Added rejection reason typings
   - Enhanced wallet update interface

2. **New Methods**
   - Added `createRichNotification` for creating rich notifications with HTML and images
   - Updated `createPrediction` to support additional features

3. **Improved Message Handling**
   - Enhanced response processing with support for timestamp and rejection data
   - Updated wallet update handling with support for change tracking

## Using the New Features

### Rich Notifications with Images and HTML

```typescript
signet.createRichNotification({
  title: 'NFT PURCHASE',
  message: 'You have received an NFT receipt',
  notificationType: 'SYSTEM',
  duration: 10000,
  imageUrl: 'https://example.com/nft-image.jpg',
  htmlContent: `
    <div style="text-align: center; padding: 10px;">
      <h3 style="color: #50fa7b;">Prediction Receipt</h3>
      <p>Your prediction has been recorded on the blockchain.</p>
      <div style="font-family: monospace; font-size: 10px;">
        TxHash: 0x71c...9e3f
      </div>
    </div>
  `,
  actions: [
    {
      id: 'view',
      label: 'VIEW DETAILS',
      action: 'approve',
      color: 'rgb(80, 250, 123)'
    },
    {
      id: 'dismiss',
      label: 'DISMISS',
      action: 'dismiss'
    }
  ]
});
```

### Handling Enhanced Responses

```typescript
signet.createPrediction({
  title: 'PREDICTION CONFIRMATION',
  message: 'Please confirm this prediction',
  details: 'Market: Will BTC reach $100k?'
}).then(response => {
  if (response.approved) {
    // Access detailed transaction data
    const txHash = response.result?.transactionHash;
    const receiptId = response.result?.receiptId;
    const odds = response.result?.metadata?.odds;
    const potentialPayout = response.result?.metadata?.potentialPayout;
    
    console.log(`Prediction approved! Receipt ID: ${receiptId}`);
    console.log(`Transaction: ${txHash}`);
    console.log(`Odds: ${odds}x, Potential Payout: ${potentialPayout}`);
  } else {
    // Access rejection reason
    const code = response.rejectionReason?.code;
    const message = response.rejectionReason?.message;
    const details = response.rejectionReason?.details;
    
    console.log(`Prediction rejected: ${code} - ${message}`);
    console.log(`Details: ${details}`);
  }
});
```

### Working with Enhanced Wallet Updates

```typescript
// Register for wallet updates
useEffect(() => {
  const unsubscribe = signet.onWalletUpdate((update) => {
    // Access enhanced wallet update data
    const { 
      address, 
      balance, 
      previousBalance, 
      delta, 
      reason, 
      relatedTransaction 
    } = update;
    
    if (delta && delta.startsWith('+')) {
      console.log(`You gained ${delta} tokens!`);
      
      if (reason === 'PREDICTION_WIN') {
        console.log(`Congratulations! You won on market: ${relatedTransaction?.marketName}`);
      }
    }
  });
  
  return unsubscribe;
}, []);
```

## Demo Component

We've updated the SignetDemo component to showcase all the new features. To see it in action, visit the `/signet-demo` page of the application.

The demo includes:

- Basic notification examples (System, Error, Transaction)
- Enhanced features tab with:
  - Rich notifications with images and HTML
  - Wallet update simulation

## Implementation Notes

- All new features are backward compatible with the previous version of the Signet client
- The enhanced properties are optional, so existing code will continue to work
- For TypeScript users, the new type definitions provide better autocomplete and type checking

## Next Steps

The updated client library fully supports all features mentioned in the `updates-for-op-predict.md` document, including:

1. Enhanced Response Messages
2. Rich Notifications
3. Enhanced Wallet Updates

We recommend updating any custom integrations to take advantage of these new features.