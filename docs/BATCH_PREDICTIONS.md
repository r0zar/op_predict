# Batch Predictions Processing

This document describes the batch predictions feature that sends signed transactions to the blockchain.

## Overview

The Batch Predictions feature automatically processes pending prediction transactions and submits them to the blockchain in batches. This ensures that user predictions are properly recorded on-chain, enabling them to collect winnings if their predictions are correct.

## Why This Feature Is Critical

Without processing transactions on-chain:

1. Users would not receive their winnings even if they made correct predictions
2. From the blockchain's perspective, the predictions "never happened"
3. Users might change their minds and back out of predictions

Processing transactions in batches is efficient and reduces blockchain fees compared to processing each transaction individually.

## Key Features

- **Time-Delayed Processing**: Only processes transactions that are at least 15 minutes old, giving users time to cancel predictions if desired
- **FIFO Processing**: Oldest transactions are processed first
- **Batch Size Limit**: Processes up to 200 transactions per batch (contract maximum)
- **Automatic Status Updates**: Updates transaction status from "pending" to "submitted" when included in a batch
- **Detailed Logging**: Provides comprehensive logs for monitoring
- **Configurable**: Multiple configuration options via environment variables

## Configuration

The batch predictions feature can be configured through the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_BATCH_PROCESSING` | Enable/disable the batch processing functionality | `false` |
| `BATCH_MAX_SIZE` | Maximum number of transactions to include in a batch | `200` |
| `BATCH_MIN_AGE_MINUTES` | Minimum age (in minutes) of transactions to process | `15` |
| `MARKET_CREATOR_PRIVATE_KEY` | Private key used to sign the batch transaction | Required |
| `PREDICTION_CONTRACT_ADDRESS` | Address of the prediction contract | `'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'` |
| `PREDICTION_CONTRACT_NAME` | Name of the prediction contract | `'blaze-welsh-predictions-v1'` |
| `CRON_API_KEY` | Secret key for authenticating cron API requests | Required in production |

## Integration with the Blockchain

When batch processing is enabled, the system:

1. Retrieves eligible pending prediction transactions (at least 15 minutes old)
2. Formats them for the blockchain contract
3. Makes a contract call to the `batch-predict` function of the prediction contract
4. Updates the status of each processed transaction
5. Records success or failure in detailed logs

## Cron Job Implementation

The batch processing functionality is implemented as a cron job that runs every hour:

```json
{
  "crons": [
    {
      "path": "/api/cron/batch-predictions",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Transaction Lifecycle

1. User makes a prediction through the Signet extension
2. Backend takes custody of the signed transaction and stores it with status "pending" 
3. After at least 15 minutes, the hourly cron job includes the transaction in a batch
4. Upon successful batch submission, status changes to "submitted"
5. When the blockchain confirms the transaction, the status becomes "confirmed"

## Security

The batch predictions API endpoint is secured with an API key that must be provided in the Authorization header:

```
Authorization: Bearer <CRON_API_KEY>
```

## Monitoring

The system provides detailed statistics in its response:

- `processed`: Number of eligible transactions processed
- `batched`: Number of transactions included in the batch
- `errors`: Number of errors encountered
- `txid`: The transaction ID on the blockchain
- `timestamp`: When the batch was processed

## Possible Future Enhancements

1. **Undo Feature**: Allow users to return prediction receipts for a refund within the 15-minute window
2. **Retry Mechanism**: Automatically retry failed transaction batches
3. **Transaction Confirmation**: Add a background process to update transaction status from "submitted" to "confirmed"
4. **Monitoring Dashboard**: Create a dashboard for monitoring batch transactions
5. **Multiple Batches**: Process multiple batches in a single cron run for very high volume periods