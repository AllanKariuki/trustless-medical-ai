#!/bin/bash

# Fix Cargo setup for medical AI deployment

echo "🔧 Setting up Rust environment..."

# Source Rust environment
source ~/.cargo/env

# Add wasm32 target
rustup target add wasm32-unknown-unknown

# Generate Cargo.lock
echo "📦 Generating Cargo.lock file..."
cargo check

echo "✅ Cargo setup complete!"
echo "Now run: dfx deploy medical_ai_backend"
