# PowerShell script to test Live Tracking Screenshots API
# Shows latest screenshot for each user (29+ users)

Write-Host "📸 Testing Live Tracking Screenshots API" -ForegroundColor Cyan
Write-Host "=" -Repeat 60 -ForegroundColor Gray

# API Configuration
$baseUrl = "http://127.0.0.1:8000"  # Change this to your Django server URL
$endpoint = "/api/live-tracking/screenshots/"
$url = "$baseUrl$endpoint"

Write-Host "🌐 URL: $url" -ForegroundColor Green
Write-Host ""

# Test Parameters
$params = @{
    limit = 50            # Get up to 50 users
    status = "all"        # Get all users regardless of status
    latest_only = "true"  # Only get latest screenshot per user
    sort_by = "name"      # Sort by name
}

try {
    Write-Host "📡 Making API request..." -ForegroundColor Yellow
    
    # Build query string
    $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
    $fullUrl = "$url?$queryString"
    
    Write-Host "🔗 Full URL: $fullUrl" -ForegroundColor Gray
    
    # Make the request
    $response = Invoke-RestMethod -Uri $fullUrl -Method Get -TimeoutSec 30
    
    Write-Host "✅ API Response Successful!" -ForegroundColor Green
    Write-Host "=" -Repeat 60 -ForegroundColor Gray
    
    # Parse response
    $success = $response.success
    $message = $response.message
    $data = $response.data
    
    Write-Host "🎯 Success: $success" -ForegroundColor $(if($success) { "Green" } else { "Red" })
    Write-Host "💬 Message: $message" -ForegroundColor Cyan
    Write-Host ""
    
    # Summary information
    $summary = $data.summary
    Write-Host "📊 SUMMARY:" -ForegroundColor Yellow
    Write-Host "   Total Users: $($summary.total_users)" -ForegroundColor White
    Write-Host "   Users with Screenshots: $($summary.users_with_screenshots)" -ForegroundColor Green
    Write-Host "   Users without Screenshots: $($summary.users_without_screenshots)" -ForegroundColor Red
    Write-Host "   Total Screenshots Found: $($summary.total_screenshots_found)" -ForegroundColor Cyan
    Write-Host "   Date Scanned: $($summary.date_scanned)" -ForegroundColor Gray
    Write-Host ""
    
    # Status breakdown
    $statusBreakdown = $data.status_breakdown
    Write-Host "📈 STATUS BREAKDOWN:" -ForegroundColor Yellow
    foreach ($status in $statusBreakdown.PSObject.Properties) {
        $statusName = (Get-Culture).TextInfo.ToTitleCase($status.Name)
        Write-Host "   $statusName`: $($status.Value)" -ForegroundColor White
    }
    Write-Host ""
    
    # Users data
    $users = $data.users
    Write-Host "👥 USERS ($($users.Count)):" -ForegroundColor Yellow
    Write-Host "-" -Repeat 60 -ForegroundColor Gray
    
    # Show first 10 users
    $displayUsers = $users | Select-Object -First 10
    for ($i = 0; $i -lt $displayUsers.Count; $i++) {
        $user = $displayUsers[$i]
        $num = $i + 1
        
        Write-Host "$($num.ToString("00")). $($user.display_name) ($($user.email))" -ForegroundColor Cyan
        Write-Host "    Status: $($user.status) | Staff ID: $($user.staff_id)" -ForegroundColor Gray
        Write-Host "    Current Task: $($user.current_task)" -ForegroundColor Gray
        Write-Host "    Current Project: $($user.current_project)" -ForegroundColor Gray
        
        $screenshot = $user.latest_screenshot
        if ($screenshot.has_screenshot) {
            Write-Host "    📸 Latest Screenshot: ✅ Available" -ForegroundColor Green
            Write-Host "    🕒 Screenshot Time: $($screenshot.timestamp)" -ForegroundColor Gray
            $truncatedUrl = if ($screenshot.url.Length -gt 50) { $screenshot.url.Substring(0, 50) + "..." } else { $screenshot.url }
            Write-Host "    🔗 URL: $truncatedUrl" -ForegroundColor Blue
        } else {
            Write-Host "    📸 Latest Screenshot: ❌ Not Available" -ForegroundColor Red
        }
        
        $stats = $user.screenshot_stats
        Write-Host "    📊 Total Screenshots: $($stats.total_screenshots)" -ForegroundColor Gray
        Write-Host ""
    }
    
    if ($users.Count -gt 10) {
        $remaining = $users.Count - 10
        Write-Host "   ... and $remaining more users" -ForegroundColor Gray
        Write-Host ""
    }
    
    # API info
    $apiInfo = $data.api_info
    Write-Host "🔧 API INFO:" -ForegroundColor Yellow
    Write-Host "   Endpoint: $($apiInfo.endpoint)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($apiInfo.timestamp)" -ForegroundColor Gray
    Write-Host "   Refresh Interval: $($apiInfo.refresh_interval) seconds" -ForegroundColor Gray
    Write-Host "   S3 Bucket: $($apiInfo.s3_bucket_scanned)" -ForegroundColor Gray
    Write-Host ""
    
    # Filters applied
    $filters = $data.filters_applied
    Write-Host "🔍 FILTERS APPLIED:" -ForegroundColor Yellow
    foreach ($filter in $filters.PSObject.Properties) {
        Write-Host "   $($filter.Name): $($filter.Value)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "=" -Repeat 60 -ForegroundColor Gray
    Write-Host "✅ Test completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure:" -ForegroundColor Yellow
    Write-Host "   1. Django server is running on http://127.0.0.1:8000" -ForegroundColor Gray
    Write-Host "   2. API endpoint is correctly configured" -ForegroundColor Gray
    Write-Host "   3. S3 credentials are properly set up" -ForegroundColor Gray
    Write-Host "   4. Database has user data" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 You can also test with different parameters:" -ForegroundColor Cyan
Write-Host "   # Get only active users:" -ForegroundColor Gray
Write-Host "   $url" + "?status=active&limit=20" -ForegroundColor Blue
Write-Host ""
Write-Host "   # Sort by screenshot time:" -ForegroundColor Gray
Write-Host "   $url" + "?sort_by=screenshot_time&limit=15" -ForegroundColor Blue
Write-Host ""
Write-Host "   # Get specific user:" -ForegroundColor Gray
Write-Host "   $url" + "?email=user@example.com" -ForegroundColor Blue
