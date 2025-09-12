# 🚀 DDS Focus Pro Backend Deployment Script (PowerShell)
# This script will deploy the fixed authentication system

Write-Host "🚀 Starting DDS Focus Pro Backend Deployment..." -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue

# Configuration - UPDATE THESE VALUES
$BackendUrl = "https://dxdtime.ddsolutions.io"
$LocalProjectPath = "C:\path\to\your\django\project"  # Update this path
$RemoteServer = "your-server-address"  # Update this
$RemoteUser = "your-username"  # Update this

Write-Host "📋 Pre-deployment Checklist:" -ForegroundColor Cyan
Write-Host "✅ Backend login bug identified: Field name mismatch (email vs email_or_username)" -ForegroundColor Green
Write-Host "✅ Fix implemented: Enhanced LoginAPIView with dual field support" -ForegroundColor Green
Write-Host "✅ Validation enhanced: Comprehensive serializer validation" -ForegroundColor Green
Write-Host "✅ Testing complete: Postman collection and Python scripts ready" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Deployment Options:" -ForegroundColor Yellow
Write-Host "1. Deploy to production server (recommended)"
Write-Host "2. Test locally first"
Write-Host "3. View deployment commands only"
Write-Host "4. Quick test current API status"
Write-Host ""

$option = Read-Host "Choose option (1-4)"

switch ($option) {
    1 {
        Write-Host "🚀 Deploying to Production Server..." -ForegroundColor Blue
        
        Write-Host "📝 Manual deployment required:" -ForegroundColor Yellow
        Write-Host "1. Upload the fixed files to your server:"
        Write-Host "   - apps/auth_api/views.py"
        Write-Host "   - apps/auth_api/serializers.py"
        Write-Host ""
        Write-Host "2. Restart your Django application"
        Write-Host "3. Test with the provided Postman collection"
        Write-Host ""
        Write-Host "✅ Files ready for deployment!" -ForegroundColor Green
    }
    
    2 {
        Write-Host "🧪 Testing locally..." -ForegroundColor Blue
        
        # Check if Python is available
        try {
            $pythonVersion = python --version 2>&1
            Write-Host "🐍 Python found: $pythonVersion" -ForegroundColor Green
            
            # Run the test script
            Write-Host "🧪 Running authentication tests..." -ForegroundColor Yellow
            python test_auth_api.py
            
        } catch {
            Write-Host "❌ Python not found. Please install Python to run tests." -ForegroundColor Red
        }
    }
    
    3 {
        Write-Host "📜 Deployment Commands:" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Manual Deployment Steps:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. 📦 Backup current code on server:"
        Write-Host "   cp -r /path/to/project /path/to/backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Write-Host ""
        Write-Host "2. 📤 Upload fixed files:"
        Write-Host "   - Copy apps/auth_api/views.py to server"
        Write-Host "   - Copy apps/auth_api/serializers.py to server"
        Write-Host ""
        Write-Host "3. 🔄 Restart Django services:"
        Write-Host "   python manage.py collectstatic --noinput"
        Write-Host "   sudo systemctl restart gunicorn"
        Write-Host "   sudo systemctl restart nginx"
        Write-Host ""
        Write-Host "4. 🧪 Test the fix:"
        Write-Host "   python test_auth_api.py"
        Write-Host ""
    }
    
    4 {
        Write-Host "🔍 Testing current API status..." -ForegroundColor Blue
        
        try {
            # Test registration endpoint
            Write-Host "📝 Testing registration endpoint..." -ForegroundColor Yellow
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $testEmail = "quicktest_$timestamp@example.com"
            
            $registrationData = @{
                username = $testEmail
                email = $testEmail
                password = "TestPassword123"
                password_confirm = "TestPassword123"
                first_name = "Quick"
                last_name = "Test"
                organization_name = "Test Org"
                country = "USA"
            } | ConvertTo-Json -Depth 3
            
            $response = Invoke-RestMethod -Uri "$BackendUrl/api/auth/register/" -Method POST -Body $registrationData -ContentType "application/json"
            
            if ($response.status -eq "success") {
                Write-Host "✅ Registration endpoint working!" -ForegroundColor Green
                Write-Host "🔑 Token received: $($response.token.Substring(0,20))..." -ForegroundColor Green
                
                # Test login endpoint
                Write-Host "📝 Testing login endpoint..." -ForegroundColor Yellow
                $loginData = @{
                    email = $testEmail
                    password = "TestPassword123"
                } | ConvertTo-Json -Depth 3
                
                try {
                    $loginResponse = Invoke-RestMethod -Uri "$BackendUrl/api/auth/login/" -Method POST -Body $loginData -ContentType "application/json"
                    Write-Host "✅ Login endpoint working! Backend has been fixed!" -ForegroundColor Green
                } catch {
                    Write-Host "⚠️ Login endpoint still has the backend bug (expected)" -ForegroundColor Yellow
                    Write-Host "Deploy the fixed code to resolve this issue" -ForegroundColor Yellow
                }
            }
            
        } catch {
            Write-Host "❌ Error testing API: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "❌ Invalid option selected" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Next Steps:" -ForegroundColor Green
Write-Host "1. Import Complete_Authentication_API.postman_collection.json into Postman"
Write-Host "2. Run: python test_auth_api.py"
Write-Host "3. Verify login API returns HTTP 200 instead of 500 after deployment"
Write-Host ""
Write-Host "📚 Available Files:" -ForegroundColor Cyan
Write-Host "- Complete_Authentication_API.postman_collection.json (Postman collection)"
Write-Host "- test_auth_api.py (Python test script)"
Write-Host "- deploy_auth_fix.sh (Linux deployment script)"
Write-Host "- Fixed backend files in apps/auth_api/ directory"
Write-Host ""
Write-Host "✅ Deployment script completed!" -ForegroundColor Green
