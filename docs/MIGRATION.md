# Migration from @op-predict/lib to wisdom-sdk

## Summary
We've successfully migrated from the local library package `@op-predict/lib` to the external npm package `wisdom-sdk`.

## Changes Made
1. **Imported Utils**: Created a `/lib/utils.ts` file to maintain utilities that aren't part of the SDK
2. **Fixed Type Imports**: 
   - Changed `import { type X }` to `import type { X }`
   - Removed `type` keyword from value imports
   - Cleaned up imports in components like prediction-form.tsx and prediction-receipt.tsx
3. **Updated Import Paths**:
   - Replaced all instances of `@/lib/src/...` with either `wisdom-sdk` or `@/lib/utils`
   - Wrote a script (fix-imports.sh) to update all imports across the codebase
4. **Fixed Script Imports**:
   - Updated scripts/associate-predictions.ts to use wisdom-sdk

## Status
- ✅ Build successful
- ✅ No more references to @op-predict/lib
- ✅ MCP server already using wisdom-sdk
- ✅ All components properly typed

## Next Steps
1. Start the application and test functionality
2. Fix any runtime errors that might occur
3. Consider addressing ESLint warnings about using Image components instead of img tags
4. Consider fixing metadataBase warnings
5. Consider removing the old lib/src directory if no longer needed