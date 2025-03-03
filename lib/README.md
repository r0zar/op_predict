# OP Predict Library

This package contains the core functionality for the OP Predict application, including data models and storage interfaces.

## Architecture Note: Server Actions vs Library Functions

**IMPORTANT:** There is a critical architectural consideration when making changes to this library or implementing MCP tools:

The application currently has two ways of interacting with the backend:

1. **Server Actions in `/app/actions/*`** - These contain important business logic beyond the basic store operations
2. **Direct Library Functions in this package** - Basic CRUD operations without additional business logic

### Problem:

When using MCP tools to interact with the backend, they often bypass the server actions and call library functions directly. This means:

- Input validation may be skipped
- Authorization logic may be bypassed
- Business rules may not be applied 
- Side effects (like cache revalidation) may not happen

### Best Practices:

When implementing new MCP tools or modifying existing functionality:

1. **Review the server actions first** to understand what business logic needs to be maintained
2. **Consider refactoring business logic from server actions into this library** so both paths use the same rules
3. **Keep Next.js-specific functionality** (like `revalidatePath`) in server actions

## Critical Functions to Review

The following server actions contain important business logic that should be considered when implementing MCP tools:

- `resolveMarket` - Includes complex market resolution logic, admin fees and user balance updates
- `createPrediction` - Includes balance validation and multiple entity updates
- `redeemPredictionReceipt` - Complex redemption logic and balance management
- `createBugReport` and `updateBugReportStatus` - Includes reward handling

## Library Structure

- `src/` - Source files
  - `user-stats-store.ts` - User statistics for leaderboard
  - `market-store.ts` - Market operations
  - `prediction-store.ts` - Prediction operations
  - `bug-report-store.ts` - Bug reports
  - `user-balance-store.ts` - User balance management
  - `kv-store.ts` - KV storage interface
  - `utils.ts` - Utility functions
  - `index.ts` - Exports all library components