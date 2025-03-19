# Prediction Return Feature

This document describes the prediction return feature that allows users to cancel their predictions within a time window.

## Overview

The Prediction Return feature enables users to "undo" their predictions under specific conditions:

1. The prediction hasn't been submitted to the blockchain yet (still has 'pending' status)
2. The prediction is less than 15 minutes old 
3. The user is the one who made the prediction

This feature gives users a grace period to change their minds and is part of the overall user experience improvement.

## Importance

The return feature is a critical safety mechanism that:

1. Provides a grace period for users who make mistakes
2. Allows users to reconsider their predictions
3. Works in harmony with the batch processing system, which only processes transactions after the return window has closed
4. Gives users confidence to make predictions, knowing they have a brief window to cancel if needed

## How It Works

1. When a user makes a prediction through Signet, it's initially stored with status "pending"
2. For 15 minutes after creation, the prediction can be returned
3. After 15 minutes, the prediction becomes eligible for batch processing and can no longer be returned
4. If a prediction has already been submitted to the blockchain, it cannot be returned regardless of age

## Technical Implementation

The prediction return functionality consists of two main components:

1. **Backend Functions in Custody Store**:
   - `canReturnPrediction`: Checks if a prediction can be returned
   - `returnPrediction`: Handles the actual return process

2. **Server Actions in Prediction Actions**:
   - `canReturnPrediction`: Checks if a prediction can be returned (including user validation)
   - `returnPrediction`: Processes the return request from the user

## Validation Checks

When a return is requested, the system performs the following checks:

1. **Authentication**: Verifies the user is logged in
2. **Ownership**: Confirms the prediction belongs to the requesting user
3. **Status Check**: Ensures the prediction has a 'pending' status
4. **Time Window**: Verifies the prediction is less than 15 minutes old
5. **Blockchain Check**: Calls the contract's `get-owner` function to verify the prediction hasn't been committed on-chain

If all checks pass, the prediction is deleted from the custody store, effectively canceling it.

## Configuration

The return window is configurable through the same environment variable used for batch processing:

```
BATCH_MIN_AGE_MINUTES=15
```

This ensures the return window and batch processing threshold are always synchronized.

## User Experience

For end users, this feature means:

1. A "Return" button is available on eligible predictions
2. Clear feedback is provided when a prediction is successfully returned
3. Detailed error messages explain why a prediction cannot be returned if applicable
4. The return is processed immediately, giving users instant feedback

## Integration with Batch Processing

The return feature works hand-in-hand with the batch processing system:

1. Batch processing only handles transactions that are at least 15 minutes old
2. This ensures that all processed transactions are outside the return window
3. The window prevents users from attempting to return predictions that might be in the process of being submitted to the blockchain

## Future Enhancements

Potential future improvements to the return feature:

1. Allow partial returns (returning only a portion of the prediction amount)
2. Add a small fee for returns to discourage abuse
3. Implement a limit on how many returns a user can perform within a time period
4. Add detailed analytics to track return behavior and identify potential patterns