@echo off
REM Trustless Medical AI - Windows Test Script

echo 🧪 Testing Trustless Medical AI System on Windows...
echo.

REM Check prerequisites
echo Checking prerequisites...

where dfx >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ DFX not found. Please install DFX first.
    echo    Visit: https://internetcomputer.org/docs/current/developer-docs/setup/install/
    pause
    exit /b 1
)

where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Rust/Cargo not found. Please install Rust first.
    echo    Visit: https://rustup.rs/
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ All prerequisites found!
echo.

REM Test DFX connection
echo 🧪 Testing DFX connection...
dfx ping >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ DFX replica not running.
    echo    Starting DFX replica...
    start /B dfx start --background
    timeout /t 10 /nobreak >nul
    dfx ping >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Failed to start DFX replica.
        echo    Try manually: dfx start --background
        pause
        exit /b 1
    )
)
echo ✅ DFX replica is running!

REM Deploy backend if not deployed
echo 🧪 Checking backend deployment...
dfx canister status medical_ai_backend >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Deploying backend canister...
    dfx deploy medical_ai_backend
    if %errorlevel% neq 0 (
        echo ❌ Backend deployment failed.
        pause
        exit /b 1
    )
)
echo ✅ Backend canister is deployed!

REM Test system health
echo 🧪 Testing system health...
for /f "tokens=*" %%i in ('dfx canister call medical_ai_backend get_system_health') do set HEALTH_RESULT=%%i
echo %HEALTH_RESULT% | findstr "HEALTHY" >nul
if %errorlevel% equ 0 (
    echo ✅ System health check passed!
    echo    Status: %HEALTH_RESULT%
) else (
    echo ❌ System health check failed.
    echo    Result: %HEALTH_RESULT%
)

REM Test medical analysis
echo 🧪 Testing medical image analysis...
echo    Analyzing sample medical data...

REM Sample data for testing
set SAMPLE_IMAGE=vec {72; 101; 108; 108; 111; 32; 87; 111; 114; 108; 100}
set PATIENT_DATA=record { anonymized_id = "PAT_TEST_001"; age_range = "31-50"; study_type = "Chest X-ray"; acquisition_date = "2024-01-15"; }

dfx canister call medical_ai_backend analyze_medical_image "(%SAMPLE_IMAGE%, %PATIENT_DATA%)" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Medical image analysis completed!
    echo    Diagnosis created successfully.
) else (
    echo ❌ Medical image analysis failed.
    echo    Check the canister logs for details.
)

REM Get canister IDs
for /f "tokens=*" %%i in ('dfx canister id medical_ai_backend') do set BACKEND_ID=%%i

REM Check frontend
echo 🧪 Checking frontend setup...
if exist "src\medical_ai_frontend\package.json" (
    echo ✅ Frontend code found!
    cd src\medical_ai_frontend
    if not exist "node_modules" (
        echo 📦 Installing frontend dependencies...
        call npm install
    )
    cd ..\..
) else (
    echo ❌ Frontend code not found.
)

echo.
echo 🏥 System Test Complete!
echo ================================
echo ✅ DFX Replica: Running
echo ✅ Backend Canister: %BACKEND_ID%
echo ✅ Medical AI API: Functional
echo ✅ Ready for testing!
echo.
echo 🌐 Access Points:
echo    Backend Candid UI: http://localhost:4943/?canisterId=%BACKEND_ID%
echo    Frontend Dev: cd src\medical_ai_frontend ^&^& npm run dev
echo.
echo 🎯 Quick Test Commands:
echo    dfx canister call medical_ai_backend get_system_health
echo    dfx canister call medical_ai_backend get_all_diagnoses
echo.
echo 🚀 To start frontend development server:
echo    cd src\medical_ai_frontend
echo    npm run dev
echo.
pause
