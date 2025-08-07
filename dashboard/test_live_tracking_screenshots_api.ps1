# Live Tracking Screenshots API Test Script
# Test the new Live Tracking Screenshots API endpoints

Write-Host "🔴 Testing Live Tracking Screenshots API" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$baseUrl = "http://localhost:8000"  # Adjust this to your Django server URL

# Test cases
$testCases = @(
    @{
        name = "Get all users with screenshots (fast mode)"
        url = "$baseUrl/api/live-tracking/screenshots/?fast_mode=true`&limit=10"
        description = "Fast mode for quick overview"
    },
    @{
        name = "Get active users only"
        url = "$baseUrl/api/live-tracking/screenshots/?status=active`&limit=10"
        description = "Filter by active status"
    },
    @{
        name = "Get specific user screenshots"
        url = "$baseUrl/api/live-tracking/screenshots/?email=haseebcodejourney@gmail.com`&screenshots_per_user=5"
        description = "Specific user with 5 screenshots"
    },
    @{
        name = "Get users with more screenshots"
        url = "$baseUrl/api/live-tracking/screenshots/?screenshots_per_user=5`&limit=5"
        description = "5 users with 5 screenshots each"
    },
    @{
        name = "Full mode with all details"
        url = "$baseUrl/api/live-tracking/screenshots/?fast_mode=false`&limit=5`&screenshots_per_user=3"
        description = "Full mode for complete data"
    }
)

foreach ($test in $testCases) {
    Write-Host "`n🧪 Test: $($test.name)" -ForegroundColor Cyan
    Write-Host "📝 Description: $($test.description)" -ForegroundColor Gray
    Write-Host "🔗 URL: $($test.url)" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $test.url -Method GET -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ SUCCESS" -ForegroundColor Green
            Write-Host "📊 Users found: $($response.data.summary.total_users)" -ForegroundColor Green
            Write-Host "📸 Total screenshots: $($response.data.summary.total_screenshots)" -ForegroundColor Green
            Write-Host "🟢 Active: $($response.data.summary.active_users)" -ForegroundColor Green
            Write-Host "🟡 Idle: $($response.data.summary.idle_users)" -ForegroundColor Yellow
            Write-Host "🔴 Offline: $($response.data.summary.offline_users)" -ForegroundColor Red
            
            # Show first user example
            if ($response.data.users.Count -gt 0) {
                $firstUser = $response.data.users[0]
                Write-Host "👤 Example user: $($firstUser.user_name) ($($firstUser.user_email))" -ForegroundColor Magenta
                Write-Host "   Status: $($firstUser.status)" -ForegroundColor Gray
                Write-Host "   Screenshots: $($firstUser.screenshot_count)" -ForegroundColor Gray
                Write-Host "   Last Activity: $($firstUser.last_activity)" -ForegroundColor Gray
                
                if ($firstUser.screenshots -and $firstUser.screenshots.Count -gt 0) {
                    Write-Host "   Latest screenshot: $($firstUser.screenshots[0].filename)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "❌ FAILED: $($response.message)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "─────────────────────────────────────" -ForegroundColor DarkGray
}

Write-Host "`n🎯 API Testing Complete!" -ForegroundColor Green

# Display usage examples
Write-Host "`n📚 API Usage Examples:" -ForegroundColor Blue
Write-Host "=====================" -ForegroundColor Blue

$examples = @(
    "# Get all users with screenshots (fast mode)",
    "GET /api/live-tracking/screenshots/?fast_mode=true&limit=10",
    "",
    "# Get specific user's screenshots",
    "GET /api/live-tracking/screenshots/?email=user@example.com&screenshots_per_user=5",
    "",
    "# Filter by status",
    "GET /api/live-tracking/screenshots/?status=active&limit=20",
    "",
    "# Get users sorted by activity",
    "GET /api/live-tracking/screenshots/?sort_by=activity&limit=15",
    "",
    "# Full mode with complete data",
    "GET /api/live-tracking/screenshots/?fast_mode=false&screenshots_per_user=10"
)

foreach ($example in $examples) {
    Write-Host $example -ForegroundColor Gray
}

Write-Host "`n📋 Query Parameters:" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue

$params = @(
    "email              - User email (optional)",
    "limit              - Number of users (default: 10, max: 50)",
    "fast_mode          - Quick scan mode (default: true)",
    "status             - Filter by status (all, active, idle, offline)",
    "include_screenshots - Include screenshot URLs (default: true)",
    "screenshots_per_user - Screenshots per user (default: 3, max: 10)",
    "sort_by            - Sort by (status, name, activity)"
)

foreach ($param in $params) {
    Write-Host "  $param" -ForegroundColor Gray
}

Write-Host "`n🚀 Integration with Live Tracking Dashboard:" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "1. Open: live_tracking_screenshots_demo.html" -ForegroundColor Gray
Write-Host "2. The API provides real-time user status with screenshot previews" -ForegroundColor Gray
Write-Host "3. Data format matches your live tracking UI requirements" -ForegroundColor Gray
Write-Host "4. Auto-refresh every 30 seconds for live updates" -ForegroundColor Gray
