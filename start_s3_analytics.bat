@echo off
REM S3 User Analytics API Server Launcher - Batch Version
REM Simple batch file to start the S3 analytics API server

echo ============================================================
echo 🚀 S3 USER ANALYTICS API SERVER LAUNCHER
echo ============================================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.7+ first.
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if required packages are installed
echo 🔍 Checking required packages...

python -c "import boto3" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ boto3 is missing. Installing...
    pip install boto3
) else (
    echo ✅ boto3 is installed
)

python -c "import requests" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ requests is missing. Installing...
    pip install requests
) else (
    echo ✅ requests is installed
)

echo.
echo 📋 SERVER INFORMATION:
echo    🌐 Server URL: http://localhost:9000
echo    📚 API Docs: http://localhost:9000/
echo    🎨 Demo Page: file:///%CD%/s3_analytics_demo.html
echo    🔍 Main API: http://localhost:9000/api/s3/user-analytics/
echo    📊 Bucket Overview: http://localhost:9000/api/s3/bucket-overview/
echo.

REM Check if files exist
if not exist "s3_user_analytics_api.py" (
    echo ❌ Server file not found: s3_user_analytics_api.py
    pause
    exit /b 1
)

echo ✅ All files found:
echo    📄 s3_user_analytics_api.py
if exist "test_s3_analytics_api.py" echo    🧪 test_s3_analytics_api.py
if exist "s3_analytics_demo.html" echo    🎨 s3_analytics_demo.html

echo.
echo 🎯 Choose an option:
echo    1. Start API Server (Port 9000)
echo    2. Start API Server with Custom Port
echo    3. Run API Tests
echo    4. Open Demo Page in Browser
echo    Q. Quit

set /p choice="Enter your choice (1-4, Q): "

if /i "%choice%"=="1" (
    echo.
    echo 🚀 Starting S3 Analytics API Server on port 9000...
    echo 🔄 Press Ctrl+C to stop the server
    echo.
    python s3_user_analytics_api.py
) else if /i "%choice%"=="2" (
    set /p customPort="Enter custom port number (default: 9000): "
    if "%customPort%"=="" set customPort=9000
    echo.
    echo 🚀 Starting S3 Analytics API Server on port %customPort%...
    echo 🔄 Press Ctrl+C to stop the server
    echo.
    python s3_user_analytics_api.py %customPort%
) else if /i "%choice%"=="3" (
    if exist "test_s3_analytics_api.py" (
        echo.
        echo 🧪 Running API Tests...
        echo ⚠️ Make sure the API server is running on port 9000 first!
        echo.
        python test_s3_analytics_api.py
    ) else (
        echo ❌ Test file not found: test_s3_analytics_api.py
    )
) else if /i "%choice%"=="4" (
    if exist "s3_analytics_demo.html" (
        echo.
        echo 🎨 Opening demo page in default browser...
        echo ⚠️ Make sure the API server is running on port 9000 first!
        start "" "file:///%CD%/s3_analytics_demo.html"
    ) else (
        echo ❌ Demo file not found: s3_analytics_demo.html
    )
) else if /i "%choice%"=="Q" (
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo ❌ Invalid choice. Please select 1-4 or Q.
)

echo.
echo 📋 Quick Reference:
echo    🌐 Server: python s3_user_analytics_api.py
echo    🧪 Tests: python test_s3_analytics_api.py
echo    📚 Docs: http://localhost:9000/
echo.

pause
