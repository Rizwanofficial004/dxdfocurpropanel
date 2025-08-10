# S3 User Analytics API Server Launcher
# PowerShell script to start the S3 analytics API server

# Set execution policy for current session
try {
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
} catch {
    Write-Warning "Could not set execution policy. You may need to run: Set-ExecutionPolicy RemoteSigned"
}

Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🚀 S3 USER ANALYTICS API SERVER LAUNCHER" -ForegroundColor Yellow
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.7+ first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if required packages are installed
Write-Host "🔍 Checking required packages..." -ForegroundColor Cyan

$requiredPackages = @("boto3", "requests")
$missingPackages = @()

foreach ($package in $requiredPackages) {
    try {
        python -c "import $package" 2>$null
        Write-Host "✅ $package is installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ $package is missing" -ForegroundColor Red
        $missingPackages += $package
    }
}

# Install missing packages
if ($missingPackages.Count -gt 0) {
    Write-Host "📦 Installing missing packages..." -ForegroundColor Yellow
    foreach ($package in $missingPackages) {
        Write-Host "   Installing $package..." -ForegroundColor Cyan
        pip install $package
    }
}

# Display server information
Write-Host ""
Write-Host "📋 SERVER INFORMATION:" -ForegroundColor Yellow
Write-Host "   🌐 Server URL: http://localhost:9000" -ForegroundColor White
Write-Host "   📚 API Docs: http://localhost:9000/" -ForegroundColor White
Write-Host "   🎨 Demo Page: file:///$PWD/s3_analytics_demo.html" -ForegroundColor White
Write-Host "   🔍 Main API: http://localhost:9000/api/s3/user-analytics/" -ForegroundColor White
Write-Host "   📊 Bucket Overview: http://localhost:9000/api/s3/bucket-overview/" -ForegroundColor White
Write-Host ""

# Check if files exist
$serverFile = "s3_user_analytics_api.py"
$testFile = "test_s3_analytics_api.py"
$demoFile = "s3_analytics_demo.html"

if (!(Test-Path $serverFile)) {
    Write-Host "❌ Server file not found: $serverFile" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ All files found:" -ForegroundColor Green
Write-Host "   📄 $serverFile" -ForegroundColor White
if (Test-Path $testFile) { Write-Host "   🧪 $testFile" -ForegroundColor White }
if (Test-Path $demoFile) { Write-Host "   🎨 $demoFile" -ForegroundColor White }

Write-Host ""
Write-Host "🎯 Choose an option:" -ForegroundColor Yellow
Write-Host "   1. Start API Server (Port 9000)" -ForegroundColor White
Write-Host "   2. Start API Server with Custom Port" -ForegroundColor White
Write-Host "   3. Run API Tests" -ForegroundColor White
Write-Host "   4. Open Demo Page in Browser" -ForegroundColor White
Write-Host "   5. View Server Logs" -ForegroundColor White
Write-Host "   Q. Quit" -ForegroundColor Gray

$choice = Read-Host "Enter your choice (1-5, Q)"

switch ($choice.ToUpper()) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Starting S3 Analytics API Server on port 9000..." -ForegroundColor Green
        Write-Host "🔄 Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        python $serverFile
    }
    
    "2" {
        $customPort = Read-Host "Enter custom port number (default: 9000)"
        if ([string]::IsNullOrWhiteSpace($customPort)) { $customPort = "9000" }
        
        Write-Host ""
        Write-Host "🚀 Starting S3 Analytics API Server on port $customPort..." -ForegroundColor Green
        Write-Host "🔄 Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        python $serverFile $customPort
    }
    
    "3" {
        if (Test-Path $testFile) {
            Write-Host ""
            Write-Host "🧪 Running API Tests..." -ForegroundColor Green
            Write-Host "⚠️ Make sure the API server is running on port 9000 first!" -ForegroundColor Yellow
            Write-Host ""
            python $testFile
        } else {
            Write-Host "❌ Test file not found: $testFile" -ForegroundColor Red
        }
    }
    
    "4" {
        if (Test-Path $demoFile) {
            Write-Host ""
            Write-Host "🎨 Opening demo page in default browser..." -ForegroundColor Green
            Write-Host "⚠️ Make sure the API server is running on port 9000 first!" -ForegroundColor Yellow
            Start-Process "file:///$PWD/$demoFile"
        } else {
            Write-Host "❌ Demo file not found: $demoFile" -ForegroundColor Red
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "📋 S3 Analytics API Server Logs:" -ForegroundColor Green
        Write-Host "   When the server is running, logs will appear in the console." -ForegroundColor White
        Write-Host "   Look for:" -ForegroundColor White
        Write-Host "   ✅ S3 scan completed messages" -ForegroundColor Green
        Write-Host "   📊 User/screenshot counts" -ForegroundColor Cyan
        Write-Host "   ❌ Error messages (if any)" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 To see real-time logs, start the server with option 1 or 2" -ForegroundColor Yellow
    }
    
    "Q" {
        Write-Host "👋 Goodbye!" -ForegroundColor Green
        exit 0
    }
    
    default {
        Write-Host "❌ Invalid choice. Please select 1-5 or Q." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Quick Reference:" -ForegroundColor Yellow
Write-Host "   🌐 Server: python $serverFile" -ForegroundColor White
Write-Host "   🧪 Tests: python $testFile" -ForegroundColor White
Write-Host "   📚 Docs: http://localhost:9000/" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
