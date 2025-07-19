#!/bin/bash

# Trustless Medical AI - Deployment Script
# For ICP Hackathon Demo

set -e

echo "🏥 Deploying Trustless Medical AI to Internet Computer..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if DFX is installed
if ! command -v dfx &> /dev/null; then
    print_error "DFX is not installed. Please install DFX first:"
    echo "sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or later."
    exit 1
fi

print_step "Starting local ICP replica..."
dfx start --background --clean

print_step "Building and deploying backend canister..."
dfx deploy medical_ai_backend

# Get canister ID for frontend configuration
BACKEND_CANISTER_ID=$(dfx canister id medical_ai_backend)
print_success "Backend canister deployed: $BACKEND_CANISTER_ID"

print_step "Installing frontend dependencies..."
cd src/medical_ai_frontend
npm install

print_step "Building frontend for production..."
export REACT_APP_MEDICAL_AI_BACKEND_CANISTER_ID=$BACKEND_CANISTER_ID
npm run build

cd ../..

print_step "Deploying frontend canister..."
dfx deploy medical_ai_frontend

# Get frontend canister ID
FRONTEND_CANISTER_ID=$(dfx canister id medical_ai_frontend)
print_success "Frontend canister deployed: $FRONTEND_CANISTER_ID"

print_step "Deployment complete! 🎉"
echo ""
echo "🌐 Access your Trustless Medical AI application:"
echo "   Frontend: http://localhost:4943/?canisterId=$FRONTEND_CANISTER_ID"
echo "   Backend Candid UI: http://localhost:4943/?canisterId=$BACKEND_CANISTER_ID"
echo ""
echo "🔧 Canister IDs:"
echo "   medical_ai_backend: $BACKEND_CANISTER_ID"
echo "   medical_ai_frontend: $FRONTEND_CANISTER_ID"
echo ""
echo "🚀 For development:"
echo "   cd src/medical_ai_frontend && npm run dev"
echo ""
print_success "Ready for hackathon demo! 🏆"
