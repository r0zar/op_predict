# Server Actions Refactoring Analysis

This document analyzes the server actions in the OP Predict application and identifies which business logic should be refactored into the library to ensure consistent behavior between server actions and MCP tools.

## Market Actions (`market-actions.ts`)

### `createMarket`
- **Current Business Logic**: 
  - Input validation with Zod
  - Market creation with user ID from auth
  - Cache revalidation

- **Refactoring Recommendation**:
  - Add input validation to `marketStore.createMarket`
  - Keep `revalidatePath` in server action

### `resolveMarket` (High Priority)
- **Current Business Logic**:
  - Input validation
  - Admin authorization
  - Market resolution with winning outcome logic
  - Payout calculation and admin fee (5%)
  - Balance updates for winners
  - User stats updates
  - Cache revalidation

- **Refactoring Recommendation**:
  - Create `marketStore.resolveMarketWithPayouts(marketId, winningOutcomeId, adminId)` that handles:
    - Payout calculation logic
    - Admin fee calculation
    - Balance updates
    - User stats updates
  - Keep authorization and cache revalidation in server action

## Prediction Actions (`prediction-actions.ts`)

### `createPrediction` (High Priority)
- **Current Business Logic**:
  - Input validation
  - Market and outcome verification
  - Balance deduction
  - Prediction creation
  - Market stats update
  - User stats update
  - Cache revalidation

- **Refactoring Recommendation**:
  - Create `predictionStore.createPredictionWithBalanceUpdate(predictionData)` that handles:
    - Balance verification and deduction
    - Prediction creation
    - Market stats update
    - User stats update
  - Keep validation and cache revalidation in server action

### `redeemPredictionReceipt` (High Priority)
- **Current Business Logic**:
  - Authorization check (prediction owner)
  - Redemption eligibility check
  - Payout processing
  - Balance update
  - Cache revalidation

- **Refactoring Recommendation**:
  - Extend `predictionStore.redeemPrediction` to include balance updates
  - Create `predictionStore.validateRedemptionEligibility(predictionId, userId)` for authorization and status checks
  - Keep cache revalidation in server action

## Balance Actions (`balance-actions.ts`)

### `depositFunds` and `withdrawFunds`
- **Current Business Logic**:
  - Input validation
  - User authentication
  - Balance updates
  - Cache revalidation

- **Refactoring Recommendation**:
  - Keep these simple operations as they are
  - Ensure `userBalanceStore` functions properly validate input amounts

## Bug Report Actions (`bug-report-actions.ts`)

### `createBugReport` and `updateBugReportStatus` (Medium Priority)
- **Current Business Logic**:
  - User authentication
  - Bug report creation/updates
  - Reward payment processing
  - Status transitions

- **Refactoring Recommendation**:
  - Move `processRewardPayment` to the library as `bugReportStore.processRewardPayment(userId, amount, reportId)`
  - Create helper in the library for handling status transitions and validation

## Leaderboard Actions (`leaderboard-actions.ts`)
- **Current Business Logic**:
  - Simple data retrieval with username enrichment from Clerk
  - User ranking calculation

- **Refactoring Recommendation**:
  - These are relatively simple and don't need major refactoring
  - Consider moving score calculation logic entirely to the library

## Implementation Plan

1. **Phase 1** (High Priority):
   - Refactor market resolution logic
   - Refactor prediction creation with balance logic
   - Refactor prediction redemption logic

2. **Phase 2** (Medium Priority):
   - Refactor bug report reward handling
   - Add input validation to library functions

3. **Phase 3** (Nice to have):
   - Create unified error handling approach
   - Add logging/monitoring at library level
   - Add more comprehensive unit tests

## Considerations

- **Auth Context**: The library should not depend on Next.js auth, but accept user IDs as parameters
- **Input Validation**: Consider using Zod at the library level for consistent validation
- **Error Handling**: Standardize error types and responses
- **Testing**: Add unit tests for the refactored business logic