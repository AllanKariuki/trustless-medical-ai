# 🪟 Windows Setup Guide for Trustless Medical AI

## Two Options for Windows Users

### Option 1: WSL (Recommended) ⭐

WSL provides the best experience for DFX development:

```powershell
# 1. Install WSL if not already installed
wsl --install Ubuntu

# 2. Open WSL terminal and install prerequisites
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install DFX
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Install Node.js (if not available)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone/copy your project to WSL
# Copy the medical_ai_proof folder to your WSL home directory
```

### Option 2: Native Windows (Advanced)

```powershell
# 1. Install Rust for Windows
# Download from: https://rustup.rs/
# Or use winget:
winget install Rustlang.Rustup

# 2. Install DFX for Windows (experimental)
# Download from: https://github.com/dfinity/sdk/releases
# Look for the latest Windows release

# 3. Node.js (already installed ✅)
```

## 🚀 Quick Start (WSL)

Once you have WSL setup:

```bash
# Navigate to your project
cd /path/to/medical_ai_proof

# Fix the dfx.json (already fixed above)
# Start DFX
dfx start --background

# Deploy backend
dfx deploy medical_ai_backend

# Setup frontend
cd src/medical_ai_frontend
npm install
npm run dev
```

## 🧪 Test the System

```bash
# Test system health
dfx canister call medical_ai_backend get_system_health

# Test medical analysis
dfx canister call medical_ai_backend analyze_medical_image '(vec {72; 101; 108; 108; 111}, record {anonymized_id = "PAT_001"; age_range = "31-50"; study_type = "Chest X-ray"; acquisition_date = "2024-01-15"})'
```

## 🔧 Troubleshooting

### Error: "missing field candid"
✅ **Fixed!** - Updated dfx.json with candid field

### Error: "dfx command not found"
```bash
# Add DFX to PATH
echo 'export PATH="$HOME/.local/share/dfx/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Error: "cannot connect to replica"
```bash
# Stop and restart DFX
dfx stop
dfx start --clean --background
```

### Error: Rust compilation issues
```bash
# Update Rust
rustup update

# Check Rust installation
cargo --version
rustc --version
```

## 📁 Project Structure Check

Make sure your files are organized like this:
```
medical_ai_proof/
├── dfx.json (✅ Fixed)
├── Cargo.toml
├── src/
│   ├── medical_ai_backend/
│   │   ├── Cargo.toml
│   │   ├── src/lib.rs
│   │   └── medical_ai_backend.did (✅ Required)
│   └── medical_ai_frontend/
│       ├── package.json
│       └── src/
```

## 🎯 Quick Validation

Run this command to check if everything is setup correctly:

```bash
# Check DFX
dfx --version

# Check Rust
cargo --version

# Check Node
node --version

# Check project structure
ls -la src/medical_ai_backend/
```

## 🚀 One-Command Setup (WSL)

Create this script and run it:

```bash
#!/bin/bash
# setup.sh

# Install prerequisites
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Start DFX
dfx start --background

# Deploy
dfx deploy medical_ai_backend

echo "🎉 Setup complete!"
echo "Backend: http://localhost:4943/?canisterId=$(dfx canister id medical_ai_backend)"
```

## 🌐 Access URLs

After successful deployment:

- **Candid UI**: `http://localhost:4943/?canisterId=<backend-canister-id>`
- **Frontend Dev**: `http://localhost:3000` (after npm run dev)

## ⚡ Quick Test Commands

```bash
# 1. Health check
dfx canister call medical_ai_backend get_system_health

# 2. Sample analysis
dfx canister call medical_ai_backend analyze_medical_image '(vec {72; 101; 108; 108; 111}, record {anonymized_id = "TEST_001"; age_range = "31-50"; study_type = "Chest X-ray"; acquisition_date = "2024-01-15"})'

# 3. Get results
dfx canister call medical_ai_backend get_all_diagnoses

# 4. Check audit trail
dfx canister call medical_ai_backend get_medical_audit_trail
```

Ready to start? Choose your method and follow the steps above! 🚀
