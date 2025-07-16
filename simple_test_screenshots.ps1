# Simple Live Tracking Screenshots API Test
Write-Host "🔴 Testing Live Tracking Screenshots API" -ForegroundColor Green

$baseUrl = "http://localhost:8000"

# Simple test
$url = "$baseUrl/api/live-tracking/screenshots/"
Write-Host "Testing: $url" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method GET
    
    if ($response.success) {
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "Users: $($response.data.summary.total_users)" -ForegroundColor Green
        Write-Host "Screenshots: $($response.data.summary.total_screenshots)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: $($response.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
