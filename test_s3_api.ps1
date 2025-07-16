# Test Fast Live Tracking Screenshots API - S3 Scanning Version
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Testing Fast Live Tracking Screenshots API" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://127.0.0.1:8000"
$timeout = 60

# Test New S3 Scanning API
Write-Host "🚀 Testing New S3 Scanning API:" -ForegroundColor Green
Write-Host "-----------------------------" -ForegroundColor Green

try {
    $newApiUrl = "$baseUrl/api/live-tracking/fast-screenshots/?limit=100&sort_by=name"
    Write-Host "URL: $newApiUrl" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $newApiUrl -Method GET -TimeoutSec $timeout
    
    if ($response.success) {
        $summary = $response.data.summary
        $users = $response.data.users
        $debugInfo = $response.data.debug_info
        
        Write-Host "✅ SUCCESS: $($response.message)" -ForegroundColor Green
        Write-Host "📊 Total S3 Users Found: $($summary.total_s3_users_found)" -ForegroundColor Cyan
        Write-Host "👥 Users Processed: $($summary.total_users_processed)" -ForegroundColor Cyan
        Write-Host "📸 Users with Screenshots: $($summary.users_with_screenshots)" -ForegroundColor Cyan
        Write-Host "❌ Users without Screenshots: $($summary.users_without_screenshots)" -ForegroundColor Cyan
        Write-Host "🏢 Staff Table Users: $($summary.users_from_staff_table)" -ForegroundColor Cyan
        Write-Host "💾 S3 Only Users: $($summary.users_from_s3_only)" -ForegroundColor Cyan
        Write-Host "🖼️ Total Screenshots: $($summary.total_screenshots_found)" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "🔍 Debug Info:" -ForegroundColor Yellow
        Write-Host "   S3 Scan Successful: $($debugInfo.s3_scan_successful)" -ForegroundColor White
        Write-Host "   Staff Enrichment Available: $($debugInfo.staff_enrichment_available)" -ForegroundColor White
        Write-Host "   Processed Limit: $($debugInfo.processed_limit)" -ForegroundColor White
        Write-Host ""
        
        Write-Host "👤 First 10 Users:" -ForegroundColor Yellow
        for ($i = 0; $i -lt [Math]::Min(10, $users.Count); $i++) {
            $user = $users[$i]
            $hasScreenshot = if ($user.latest_screenshot.has_screenshot) { "📸" } else { "❌" }
            Write-Host "   $($i+1). $($user.display_name) ($($user.email)) - $($user.data_source) $hasScreenshot" -ForegroundColor White
        }
        
        if ($users.Count -gt 10) {
            Write-Host "   ... and $($users.Count - 10) more users" -ForegroundColor Gray
        }
        
        # Check if we got the expected 29+ users
        if ($summary.total_s3_users_found -ge 29) {
            Write-Host ""
            Write-Host "🎉 SUCCESS: Found $($summary.total_s3_users_found) S3 user folders (expected 29+)" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "⚠️ WARNING: Only found $($summary.total_s3_users_found) S3 user folders (expected 29+)" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ API Error: $($response.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Request Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

# Test Old Staff API for comparison
Write-Host "📊 Testing Old Staff Table API:" -ForegroundColor Green
Write-Host "-----------------------------" -ForegroundColor Green

try {
    $oldApiUrl = "$baseUrl/api/live-tracking/screenshots/?limit=100"
    Write-Host "URL: $oldApiUrl" -ForegroundColor Yellow
    
    $oldResponse = Invoke-RestMethod -Uri $oldApiUrl -Method GET -TimeoutSec $timeout
    
    if ($oldResponse.success) {
        $oldSummary = $oldResponse.data.summary
        $oldUsers = $oldResponse.data.users
        
        Write-Host "✅ Old API Users Found: $($oldUsers.Count)" -ForegroundColor Green
        Write-Host "📸 Users with Screenshots: $($oldSummary.users_with_screenshots)" -ForegroundColor Cyan
        
        # Compare results
        Write-Host ""
        Write-Host "📈 Comparison Results:" -ForegroundColor Yellow
        Write-Host "   Old API Users: $($oldUsers.Count)" -ForegroundColor White
        Write-Host "   New API Users: $($users.Count)" -ForegroundColor White
        Write-Host "   Difference: +$($users.Count - $oldUsers.Count) users" -ForegroundColor White
        
    } else {
        Write-Host "❌ Old API Error: $($oldResponse.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Old API Request Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🏁 Test Complete!" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Keep window open
Read-Host "Press Enter to exit..."
