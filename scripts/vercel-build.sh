#!/bin/bash
set -e

echo "Preparing package.json for Vercel build..."

# Replace linked signet-sdk with published version
sed -i 's|"signet-sdk": "link:../signet/packages/signet-sdk"|"signet-sdk": "latest"|g' package.json

# Replace linked wisdom-sdk with published version
sed -i 's|"wisdom-sdk": "link:../wisdom"|"wisdom-sdk": "latest"|g' package.json

# Remove pnpm overrides section
sed -i '/\"pnpm\": {/,/},/d' package.json

echo "Modified package.json:"
cat package.json

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build the application
echo "Building the application..."
pnpm build