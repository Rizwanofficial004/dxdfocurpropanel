# Quick Setup and Test Script for S3 Employee Search API
# PowerShell script to setup and test the new API

param(
    [switch]$StartServer,
    [switch]$TestAPI,
    [switch]$OpenDemo,
    [string]$Port = "8000"
)

Write-Host "🚀 S3 Employee Search API - Quick Setup & Test" -ForegroundColor Cyan
Write-Host "=" * 60

# Function to check if Django server is running
function Test-DjangoServer {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Function to start Django server
function Start-DjangoServer {
    param([string]$Port)
    
    Write-Host "🔧 Starting Django Development Server..." -ForegroundColor Yellow
    
    # Check if manage.py exists
    if (-not (Test-Path "manage.py")) {
        Write-Host "❌ manage.py not found. Make sure you're in the Django project root directory." -ForegroundColor Red
        return $false
    }
    
    # Check if Python/Django is available
    try {
        $pythonVersion = python --version 2>$null
        Write-Host "🐍 Python Version: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Python not found. Please install Python and Django." -ForegroundColor Red
        return $false
    }
    
    Write-Host "🌐 Starting server on port $Port..." -ForegroundColor Yellow
    Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Magenta
    Write-Host ""
    
    # Start Django development server
    try {
        python manage.py runserver $Port
    } catch {
        Write-Host "❌ Failed to start Django server. Check for errors above." -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Function to test the API
function Test-S3API {
    $baseUrl = "http://localhost:$Port"
    $testUrl = "$baseUrl/api/users/s3-suggestions/?q=test&limit=5"
    
    Write-Host "🧪 Testing S3 Employee Search API..." -ForegroundColor Yellow
    Write-Host "🔗 Test URL: $testUrl" -ForegroundColor Gray
    
    # Check if server is running
    if (-not (Test-DjangoServer "$baseUrl/api/test/")) {
        Write-Host "❌ Django server is not running at $baseUrl" -ForegroundColor Red
        Write-Host "💡 Start the server first with: .\quick_setup.ps1 -StartServer" -ForegroundColor Yellow
        return $false
    }
    
    try {
        Write-Host "⏳ Making API request..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $testUrl -Method Get -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ API is working correctly!" -ForegroundColor Green
            Write-Host "📊 Found $($response.data.suggestions.Count) suggestions" -ForegroundColor Green
            
            if ($response.data.suggestions.Count -gt 0) {
                Write-Host ""
                Write-Host "📋 Sample Results:" -ForegroundColor Cyan
                foreach ($suggestion in $response.data.suggestions[0..2]) {
                    Write-Host "  👤 $($suggestion.display_name)" -ForegroundColor White
                    Write-Host "  📧 $($suggestion.email)" -ForegroundColor Gray
                    Write-Host "  📸 $($suggestion.screenshot_count) screenshots" -ForegroundColor Gray
                    Write-Host ""
                }
            }
        } else {
            Write-Host "❌ API returned error: $($response.message)" -ForegroundColor Red
        }
        
        return $true
        
    } catch {
        Write-Host "❌ API test failed: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*404*") {
            Write-Host "💡 The API endpoint might not be configured correctly." -ForegroundColor Yellow
            Write-Host "💡 Check that the URL patterns are set up in api_urls.py" -ForegroundColor Yellow
        }
        
        return $false
    }
}

# Function to open demo page
function Open-DemoPage {
    $demoFiles = @(
        @{ File = "s3_employee_search_demo.html"; Name = "Level 1: Employee Search" },
        @{ File = "employee_task_folders_demo.html"; Name = "Level 2: Task Folders" }
    )
    
    $foundFiles = @()
    
    foreach ($demo in $demoFiles) {
        if (Test-Path $demo.File) {
            $foundFiles += $demo
        }
    }
    
    if ($foundFiles.Count -eq 0) {
        Write-Host "❌ No demo files found" -ForegroundColor Red
        Write-Host "💡 Make sure you're in the correct directory" -ForegroundColor Yellow
        return
    }
    
    if ($foundFiles.Count -eq 1) {
        # Only one demo file, open it directly
        $demo = $foundFiles[0]
        Write-Host "🌐 Opening $($demo.Name)..." -ForegroundColor Yellow
        Start-Process $demo.File
        Write-Host "✅ Demo page opened in your default browser" -ForegroundColor Green
    } else {
        # Multiple demo files, let user choose
        Write-Host "📋 Multiple demo pages available:" -ForegroundColor Yellow
        Write-Host ""
        
        for ($i = 0; $i -lt $foundFiles.Count; $i++) {
            Write-Host "  $($i + 1). $($foundFiles[$i].Name)" -ForegroundColor White
        }
        
        Write-Host ""
        $choice = Read-Host "Enter your choice (1-$($foundFiles.Count)) or 'all' to open all"
        
        if ($choice -eq 'all') {
            foreach ($demo in $foundFiles) {
                Write-Host "🌐 Opening $($demo.Name)..." -ForegroundColor Yellow
                Start-Process $demo.File
                Start-Sleep -Milliseconds 500  # Small delay between opens
            }
            Write-Host "✅ All demo pages opened" -ForegroundColor Green
        } elseif ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $foundFiles.Count) {
            $selectedDemo = $foundFiles[[int]$choice - 1]
            Write-Host "🌐 Opening $($selectedDemo.Name)..." -ForegroundColor Yellow
            Start-Process $selectedDemo.File
            Write-Host "✅ Demo page opened in your default browser" -ForegroundColor Green
        } else {
            Write-Host "❌ Invalid choice. Please run the command again." -ForegroundColor Red
        }
    }
}

# Main script logic
if ($StartServer) {
    Start-DjangoServer -Port $Port
}
elseif ($TestAPI) {
    # Run comprehensive tests
    Write-Host "🔬 Running comprehensive API tests..." -ForegroundColor Cyan
    
    # Test 1: Basic API functionality
    if (Test-S3API) {
        Write-Host ""
        Write-Host "🧪 Running detailed test suite..." -ForegroundColor Cyan
        
        # Run the PowerShell test script
        if (Test-Path "test_s3_suggestions_api.ps1") {
            .\test_s3_suggestions_api.ps1 -BaseUrl "http://localhost:$Port"
        } else {
            Write-Host "⚠️ Detailed test script not found: test_s3_suggestions_api.ps1" -ForegroundColor Yellow
        }
        
        # Run Python test script if available
        if (Test-Path "test_s3_suggestions_api.py") {
            Write-Host ""
            Write-Host "🐍 Running Level 1 Python test suite..." -ForegroundColor Cyan
            python test_s3_suggestions_api.py
        }
        
        # Run Level 2 test script if available
        if (Test-Path "test_employee_folders_api.py") {
            Write-Host ""
            Write-Host "🐍 Running Level 2 Python test suite..." -ForegroundColor Cyan
            python test_employee_folders_api.py
        }
    }
}
elseif ($OpenDemo) {
    Open-DemoPage
}
else {
    # Show usage instructions
    Write-Host "📋 Available Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Start Django Server:" -ForegroundColor White
    Write-Host "   .\quick_setup.ps1 -StartServer [-Port 8000]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Test API:" -ForegroundColor White
    Write-Host "   .\quick_setup.ps1 -TestAPI [-Port 8000]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Open Demo Page:" -ForegroundColor White
    Write-Host "   .\quick_setup.ps1 -OpenDemo" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📁 Files Created:" -ForegroundColor Yellow
    Write-Host "  ✅ s3_employee_search_demo.html - Level 1: Employee search demo" -ForegroundColor Green
    Write-Host "  ✅ employee_task_folders_demo.html - Level 2: Task folders demo" -ForegroundColor Green
    Write-Host "  ✅ test_s3_suggestions_api.py - Level 1 Python test script" -ForegroundColor Green
    Write-Host "  ✅ test_employee_folders_api.py - Level 2 Python test script" -ForegroundColor Green
    Write-Host "  ✅ test_s3_suggestions_api.ps1 - PowerShell test script" -ForegroundColor Green
    Write-Host "  ✅ S3_EMPLOYEE_SEARCH_API_DOCS.md - Complete documentation" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Quick Start:" -ForegroundColor Cyan
    Write-Host "  1. .\quick_setup.ps1 -StartServer" -ForegroundColor White
    Write-Host "  2. Open new terminal: .\quick_setup.ps1 -TestAPI" -ForegroundColor White
    Write-Host "  3. .\quick_setup.ps1 -OpenDemo" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 API Endpoints:" -ForegroundColor Magenta
    Write-Host "  Level 1: http://localhost:$Port/api/users/s3-suggestions/" -ForegroundColor Gray
    Write-Host "  Level 2: http://localhost:$Port/api/screenshots/employee/{email}/folders/" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🕐 Completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
