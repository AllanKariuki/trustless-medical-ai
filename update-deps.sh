#!/bin/bash

echo "🔄 Updating IC CDK dependencies..."

# Remove old lock file
rm -f Cargo.lock

# Generate new lock file with updated dependencies
cargo check

echo "✅ Dependencies updated!"
echo "Now run: dfx deploy medical_ai_backend"
