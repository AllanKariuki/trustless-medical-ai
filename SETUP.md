# 🛠️ Local Development Setup Guide

## Prerequisites Installation

### 1. Install Rust (Required for Backend)
```powershell
# Download and install Rust from https://rustup.rs/
# Or use winget on Windows 11:
winget install Rustlang.Rustup

# Restart your terminal after installation
# Verify installation:
cargo --version
rustc --version
```

### 2. Install DFX (Internet Computer SDK)
```powershell
# Install DFX using PowerShell
# Method 1: Direct download
Invoke-WebRequest -Uri "https://github.com/dfinity/sdk/releases/latest/download/dfx-0.15.3-x86_64-pc-windows-msvc.zip" -OutFile "dfx.zip"
Expand-Archive -Path "dfx.zip" -DestinationPath "C:\dfx"
# Add C:\dfx to your PATH environment variable

# Method 2: Use WSL (Windows Subsystem for Linux) - Recommended
wsl --install
# Then inside WSL:
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

### 3. Verify Node.js (Already Installed ✅)
```bash
node --version  # Should be v18 or higher
npm --version
```

## 🚀 Quick Start (After Prerequisites)

### Step 1: Start Local ICP Network
```bash
# Navigate to project directory
cd medical_ai_proof

# Start local ICP replica (this creates a local blockchain)
dfx start --background

# Alternative: Start with console output (for debugging)
dfx start --clean
```

### Step 2: Deploy Backend Canister
```bash
# Build and deploy the Rust backend
dfx deploy medical_ai_backend

# Check deployment status
dfx canister status medical_ai_backend
```

### Step 3: Setup Frontend
```bash
# Navigate to frontend directory
cd src/medical_ai_frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 4: Access the Application
- **Frontend**: http://localhost:3000
- **Backend Candid UI**: http://localhost:4943/?canisterId=$(dfx canister id medical_ai_backend)

## 🧪 Testing the System

### Test 1: Backend API Testing (Using Candid UI)

1. **Open Candid Interface**
   ```bash
   # Get backend canister ID
   dfx canister id medical_ai_backend
   
   # Open in browser
   # http://localhost:4943/?canisterId=<canister-id>
   ```

2. **Test System Health**
   - Click on `get_system_health`
   - Click "Call" - should return system status

3. **Test Medical Image Analysis**
   - Click on `analyze_medical_image`
   - Use sample data:
     ```
     (
       vec {72; 101; 108; 108; 111},  // "Hello" as bytes (sample image data)
       record {
         anonymized_id = "PAT_TEST_001";
         age_range = "31-50";
         study_type = "Chest X-ray";
         acquisition_date = "2024-01-15";
       }
     )
     ```
   - Click "Call" - should return diagnosis result

### Test 2: Frontend Testing

1. **Image Upload Test**
   - Create a test image (any JPEG/PNG)
   - Drag and drop into upload area
   - Fill patient metadata
   - Click "Analyze Medical Image"

2. **Authentication Test**
   - Click "Login with Internet Identity"
   - Should redirect to Internet Identity
   - Create test identity if needed

3. **Compliance Features Test**
   - Navigate to "Compliance" tab
   - Generate compliance report
   - Check audit trail

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Issue: DFX Not Found
```bash
# Check if DFX is in PATH
echo $PATH | grep dfx

# If not found, add to PATH (Linux/WSL):
export PATH="$HOME/.local/share/dfx/bin:$PATH"

# For Windows, add to system PATH manually
```

#### Issue: Rust/Cargo Not Found
```bash
# Restart terminal after Rust installation
# Or manually source Rust environment:
source $HOME/.cargo/env
```

#### Issue: Cannot Connect to Local Replica
```bash
# Stop and restart DFX
dfx stop
dfx start --clean --background

# Check if replica is running
dfx ping
```

#### Issue: Frontend Build Errors
```bash
cd src/medical_ai_frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### Issue: Canister Deployment Fails
```bash
# Clean and redeploy
dfx stop
dfx start --clean --background
dfx deploy --reinstall-all
```

### Windows-Specific Setup

If you're on Windows, I recommend using WSL for the best experience:

```powershell
# Install WSL
wsl --install Ubuntu

# Open WSL terminal and install prerequisites
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Clone project in WSL
git clone <repo-url>
cd medical_ai_proof
```

## 📊 Test Scenarios

### Scenario 1: Basic Medical Analysis
1. Upload chest X-ray image
2. Verify AI diagnosis appears
3. Check confidence scoring
4. Verify cryptographic signature

### Scenario 2: Compliance Workflow
1. Generate compliance report
2. Export audit trail
3. Verify signature validation
4. Check FDA/HIPAA status

### Scenario 3: Multi-User Testing
1. Create multiple Internet Identity accounts
2. Test concurrent image analysis
3. Verify audit trail shows all users
4. Test permission handling

## 🎯 Performance Testing

### Load Testing
```bash
# Test multiple image uploads
for i in {1..10}; do
  echo "Testing upload $i"
  # Upload via frontend or API
done

# Monitor canister performance
dfx canister call medical_ai_backend get_system_health
```

### Memory Testing
```bash
# Check canister memory usage
dfx canister status medical_ai_backend
```

## 🚀 Production Deployment (Optional)

### Deploy to ICP Mainnet
```bash
# Deploy to mainnet (requires cycles)
dfx deploy --network ic

# Check mainnet status
dfx canister --network ic status medical_ai_backend
```

### Get Cycles for Mainnet
1. Get free cycles from [DFINITY Faucet](https://faucet.dfinity.org/)
2. Or buy cycles from exchanges
3. Top up canisters: `dfx wallet --network ic balance`

## 📱 Mobile Testing

The frontend is mobile-responsive. Test on:
- Chrome DevTools mobile emulation
- Actual tablet devices
- Different screen sizes

## 🎬 Demo Preparation

### Quick Demo Setup
```bash
# Single command deployment
./deploy.sh

# Open demo URLs
echo "Frontend: http://localhost:4943/?canisterId=$(dfx canister id medical_ai_frontend)"
echo "Backend: http://localhost:4943/?canisterId=$(dfx canister id medical_ai_backend)"
```

### Demo Data Preparation
- Prepare sample medical images
- Create test patient metadata
- Practice the demo flow
- Have backup data ready

Ready to start? Run this command to begin:
```bash
cd medical_ai_proof && ./deploy.sh
```
