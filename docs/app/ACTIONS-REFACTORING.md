# Server Actions Refactoring TODO

## Business Logic to Move to Library

### Market Actions
- [ ] Move 5% admin fee calculation logic to the lib store
- [ ] Move winner payout calculation based on proportional stake to lib
- [ ] Ensure `resolveMarketWithPayouts` method in lib contains all necessary logic

### Prediction Actions
- [ ] Move side effects for prediction creation to lib:
  - [ ] Market outcome votes update
  - [ ] Market amounts and pool amounts updates
  - [ ] User stats update for leaderboard tracking
- [ ] Enhance `createPredictionWithBalanceUpdate` to handle all market statistics

### Bug Report Actions
- [ ] Move reward processing logic to lib:
  - [ ] Business rules for determining when rewards should be paid
  - [ ] Custom messaging for different types of rewards
- [ ] Ensure `processRewardPayment` in bug-report-store contains all logic

### Admin Validation
- [ ] Add admin authorization checks to library methods
- [ ] Create admin permission middleware or wrapper function in lib

### Leaderboard Actions
- [ ] Move user enhancement logic (adding usernames from Clerk) to lib
- [ ] Create utility for user data enrichment that can be reused

### Data Validation
- [ ] Move Zod schemas and validation to lib store methods
- [ ] Ensure consistent validation across all entry points

### Error Handling
- [ ] Standardize error handling and messaging in lib
- [ ] Create error utility functions for consistent error formats

### Revalidation Strategy
- [ ] Design a pattern for handling revalidation that works both in server actions and direct lib calls
- [ ] Consider implementing an event system for triggering revalidations

## Implementation Guidelines
- Keep server actions thin, delegating all business logic to lib
- Server actions should primarily handle:
  - Request/response formatting
  - Next.js specific concerns (revalidation)
  - Authentication context extraction
- Lib should encapsulate all business rules, validation, and data operations