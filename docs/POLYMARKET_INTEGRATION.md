# Polymarket Integration for op_predict

This document explains how to configure and use the Polymarket integration for op_predict, which automatically imports Bitcoin and Stacks-related markets from Polymarket.

## Overview

The Polymarket integration is a cron job that:

1. Fetches markets from the Polymarket API using pagination
2. Filters for Bitcoin and Stacks-related markets based on configured keywords and categories
3. Creates corresponding markets in op_predict
4. Tracks progress using Vercel KV for resumable operations
5. Runs on a configurable schedule

## Configuration

The integration is configured using environment variables. Here are the available settings:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `POLYMARKET_SYNC_ENABLED` | Enable/disable the sync feature | `false` |
| `POLYMARKET_API_URL` | Polymarket API endpoint | `https://clob.polymarket.com` |
| `POLYMARKET_MAX_MARKETS_PER_RUN` | Maximum markets to create per run | `5` |
| `POLYMARKET_MAX_PAGES_PER_RUN` | Maximum API pages to fetch per run | `5` |
| `POLYMARKET_MIN_END_DATE_DAYS` | Minimum market end date (days from now) | `1` |
| `POLYMARKET_MAX_END_DATE_DAYS` | Maximum market end date (days from now) | `90` |
| `POLYMARKET_DEFAULT_CATEGORY` | Default category for created markets | `crypto` |
| `POLYMARKET_DEFAULT_CREATOR_ID` | Default user ID for market creator | `system` |
| `POLYMARKET_DUPLICATE_HANDLING` | How to handle duplicates (`skip` or `update`) | `skip` |
| `CRON_SECRET` | Secret key for authenticating cron requests | Required for production |

### Keywords and Categories

The integration filters markets based on a predefined list of keywords and categories. You can modify these in the `POLYMARKET_CONFIG` object in the code:

```typescript
// Categories to filter markets by
categories: ['crypto', 'bitcoin', 'blockchain', 'stacks'],

// Keywords to match in market descriptions/questions
keywords: ['bitcoin', 'btc', 'stacks', 'stx', 'crypto', 'blockchain'],
```

## Setting Up the Cron Job

### Vercel Deployment

If you're deploying on Vercel, you can set up a cron job by adding the following to your `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-polymarket",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This will run the job every day at midnight UTC.

### Other Deployments

For other deployments, you can use a service like cron-job.org to call the endpoint on a schedule:

1. Set up a cron job to call `https://your-domain.com/api/cron/sync-polymarket`
2. Add an Authorization header with the value `Bearer YOUR_CRON_SECRET`
3. Configure the schedule (e.g., daily at midnight)

## Vercel KV Integration

The integration uses Vercel KV for tracking progress and state:

| KV Key | Purpose |
|--------|---------|
| `POLYMARKET_LAST_CURSOR` | Stores the pagination cursor for resuming API fetches |
| `POLYMARKET_LAST_UPDATED` | Timestamp of the last update |
| `POLYMARKET_SYNC_STATUS` | Stores comprehensive sync status and statistics |
| `POLYMARKET_PROCESSED_MARKETS` | Array of Polymarket market IDs that have been processed |

This KV-based approach ensures that:
1. The sync operation can resume from where it left off, even if interrupted
2. We avoid duplicate market creation across multiple runs
3. We can track detailed statistics about the sync process

## Monitoring

The integration logs its activity to the console and uses Vercel KV to maintain state. You can:

1. Check your hosting platform's logs for details
2. The endpoint returns a JSON response with stats about the sync operation
3. Review the `syncStatus` property in the response for detailed progress information

Sample response:
```json
{
  "success": true,
  "total": 5,
  "created": 3,
  "skipped": 2,
  "updated": 0,
  "errors": 0,
  "hasMorePages": true,
  "nextCursor": "c2FtcGxlLWN1cnNvcg==",
  "details": [
    {
      "externalId": "0x1234...",
      "internalId": "abc-123",
      "name": "Will Bitcoin close above $60,000 on April 30th, 2025?",
      "status": "created"
    },
    ...
  ],
  "syncStatus": {
    "lastRun": "2025-03-20T12:00:00.000Z",
    "inProgress": true,
    "currentPage": 3,
    "totalPages": 0,
    "marketsProcessed": 150,
    "marketsCreated": 35,
    "marketsSkipped": 115,
    "marketsUpdated": 0,
    "errors": 0
  },
  "timestamp": "2025-03-20T12:00:00.000Z"
}
```

## Extending the Integration

To modify the behavior or add more functionality:

1. Edit `/app/api/cron/sync-polymarket/route.ts`
2. Modify the filtering logic in `containsKeywords()` and `isEndDateValid()`
3. Adjust market conversion in `convertToOpPredictMarket()`

## Troubleshooting

If the integration isn't working as expected:

1. Ensure the `POLYMARKET_SYNC_ENABLED` environment variable is set to `true`
2. Check that the `CRON_SECRET` matches the one used in the request
3. Verify the Polymarket API is accessible
4. Look for errors in the logs or response from the endpoint

### Handling Stuck Sync Jobs

If a sync job gets stuck in the "in progress" state (for example, due to an error or timeout), you can reset it:

1. Through the admin UI:
   - Go to the Admin Dashboard → Polymarket Integration tab
   - If a sync is marked as "in progress", you'll see "Reset Sync" and "Force Reset" buttons
   - Click "Reset Sync" to clear the in-progress flag but maintain the cursor position
   - Click "Force Reset" to completely reset the sync state and start from the beginning

2. Using the API:
   - Send a POST request to `/api/cron/reset-polymarket-sync`
   - Include your admin user ID in the request body: `{ "userId": "your-user-id" }`
   - To force reset the cursor position, add `"force": true` to the request body

3. Using the CLI test script:
   - Run `npx tsx scripts/test-polymarket-sync.ts --force` to reset a stuck sync
   - This will clear the "in progress" flag and allow new syncs to run

A sync is automatically considered stale after 15 minutes of inactivity.

## Security Considerations

- The endpoint is protected by the `CRON_SECRET` environment variable
- Ensure this secret is kept secure and not exposed in client-side code
- Consider adding rate limiting if needed