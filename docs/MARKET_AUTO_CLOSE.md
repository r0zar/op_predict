# Market Auto-Close Functionality

This document describes the automated market closing functionality that handles expired prediction markets.

## Overview

The Market Auto-Close system automatically detects and closes markets that have passed their end date. This ensures that markets don't remain in an active state after their voting deadline, helping maintain data integrity and user experience.

## Features

- **Automatic Detection**: Scans for markets with an end date in the past
- **Batch Processing**: Processes markets in configurable batches for efficiency
- **On-Chain Integration**: Optionally closes markets on the blockchain
- **Detailed Logging**: Provides comprehensive logs for monitoring
- **Error Handling**: Gracefully handles errors to prevent cascading failures
- **Configurable**: Multiple configuration options via environment variables

## Configuration

The auto-close functionality can be configured through the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_AUTO_CLOSE_MARKETS` | Enable/disable the auto-close functionality | `true` |
| `AUTO_CLOSE_BATCH_SIZE` | Number of markets to process in each batch | `50` |
| `AUTO_CLOSE_ON_CHAIN` | Whether to close markets on-chain as well | `false` |
| `CRON_API_KEY` | Secret key for authenticating cron API requests | Required in production |

## Integration with Blockchain

When `AUTO_CLOSE_ON_CHAIN` is enabled, the system will:

1. Update the market's status in the database to "closed"
2. Make a contract call to the `close-market` function of the prediction contract
3. Record success or failure of the on-chain operation in logs

On-chain closing requires the same contract configuration as market creation:

```
ENABLE_ONCHAIN_MARKETS=true
MARKET_CREATOR_PRIVATE_KEY=<private key>
PREDICTION_CONTRACT_ADDRESS=<contract address>
PREDICTION_CONTRACT_NAME=<contract name>
```

## Cron Job Implementation

The auto-close functionality is implemented as a cron job that runs every 15 minutes. The cron job:

1. Calls the `marketStore.autoCloseExpiredMarkets()` function
2. Revalidates relevant pages if any markets were closed
3. Returns statistics about the operation

## Security

The cron job API endpoint is secured with an API key that must be provided in the Authorization header:

```
Authorization: Bearer <CRON_API_KEY>
```

## Monitoring

The cron job provides detailed statistics in its response:

- `processed`: Number of expired markets processed
- `closed`: Number of markets successfully closed
- `errors`: Number of errors encountered
- `onChainSucceeded`: Number of successful on-chain close operations
- `onChainFailed`: Number of failed on-chain close operations

## Deployment

The cron job is configured in `vercel.json` to run every 15 minutes:

```json
{
  "crons": [
    {
      "path": "/api/cron/close-expired-markets",
      "schedule": "*/15 * * * *"
    }
  ]
}
```