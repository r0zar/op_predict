#!/bin/bash

# Find all TypeScript files with imports from @/lib/src/utils
grep -l "from ['\"]@/lib/src/utils['\"]" $(find . -name "*.ts" -o -name "*.tsx") | while read file; do
  # Replace @/lib/src/utils with @/lib/utils
  sed -i 's|from ["'"'"']@/lib/src/utils["'"'"']|from "@/lib/utils"|g' "$file"
done

# Update other common import paths
grep -l "from ['\"]@/lib/src/" $(find . -name "*.ts" -o -name "*.tsx") | while read file; do
  # Check for market-store imports
  if grep -q "from ['\"]@/lib/src/market-store['\"]" "$file"; then
    # For imports with destructured named imports and types
    sed -i 's|import { \(.*\) } from ["'"'"']@/lib/src/market-store["'"'"']|import { \1 } from "wisdom-sdk"|g' "$file"
    # For imports with type imports
    sed -i 's|import type { \(.*\) } from ["'"'"']@/lib/src/market-store["'"'"']|import type { \1 } from "wisdom-sdk"|g' "$file"
  fi
  
  # Check for prediction-store imports
  if grep -q "from ['\"]@/lib/src/prediction-store['\"]" "$file"; then
    sed -i 's|import { \(.*\) } from ["'"'"']@/lib/src/prediction-store["'"'"']|import { \1 } from "wisdom-sdk"|g' "$file"
    sed -i 's|import type { \(.*\) } from ["'"'"']@/lib/src/prediction-store["'"'"']|import type { \1 } from "wisdom-sdk"|g' "$file"
  fi
  
  # Check for bug-report-store imports
  if grep -q "from ['\"]@/lib/src/bug-report-store['\"]" "$file"; then
    sed -i 's|import { \(.*\) } from ["'"'"']@/lib/src/bug-report-store["'"'"']|import { \1 } from "wisdom-sdk"|g' "$file"
    sed -i 's|import type { \(.*\) } from ["'"'"']@/lib/src/bug-report-store["'"'"']|import type { \1 } from "wisdom-sdk"|g' "$file"
  fi
  
  # Check for user-stats-store imports
  if grep -q "from ['\"]@/lib/src/user-stats-store['\"]" "$file"; then
    sed -i 's|import { \(.*\) } from ["'"'"']@/lib/src/user-stats-store["'"'"']|import { \1 } from "wisdom-sdk"|g' "$file"
    sed -i 's|import type { \(.*\) } from ["'"'"']@/lib/src/user-stats-store["'"'"']|import type { \1 } from "wisdom-sdk"|g' "$file"
  fi
  
  # Check for user-balance-store imports
  if grep -q "from ['\"]@/lib/src/user-balance-store['\"]" "$file"; then
    sed -i 's|import { \(.*\) } from ["'"'"']@/lib/src/user-balance-store["'"'"']|import { \1 } from "wisdom-sdk"|g' "$file"
    sed -i 's|import type { \(.*\) } from ["'"'"']@/lib/src/user-balance-store["'"'"']|import type { \1 } from "wisdom-sdk"|g' "$file"
  fi
done

echo "Import paths updated successfully!"