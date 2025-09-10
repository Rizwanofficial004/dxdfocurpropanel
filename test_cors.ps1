# Test CORS configuration using PowerShell
Write-Host "Testing CORS configuration..." -ForegroundColor Green
Write-Host ("-" * 50)

try {
    # Test simple GET request to health endpoint
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health/" -Method GET -Headers @{
        "Origin" = "http://localhost:3000"
    } -UseBasicParsing
    
    Write-Host "GET /api/health/ - Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Check CORS headers
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "✓ CORS Header Present: $corsHeader" -ForegroundColor Green
    } else {
        Write-Host "✗ CORS Header Missing" -ForegroundColor Red
    }
}
catch {
    Write-Host "Error connecting to server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure Django server is running on localhost:8000" -ForegroundColor Yellow
}

try {
    # Test preflight OPTIONS request
    Write-Host "`nTesting preflight OPTIONS request..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/dashboard/employees/" -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type,Authorization"
    } -UseBasicParsing
    
    Write-Host "OPTIONS preflight - Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Check CORS preflight headers
    $allowOrigin = $response.Headers["Access-Control-Allow-Origin"]
    $allowMethods = $response.Headers["Access-Control-Allow-Methods"]
    $allowHeaders = $response.Headers["Access-Control-Allow-Headers"]
    
    Write-Host "Access-Control-Allow-Origin: $allowOrigin" -ForegroundColor Cyan
    Write-Host "Access-Control-Allow-Methods: $allowMethods" -ForegroundColor Cyan
    Write-Host "Access-Control-Allow-Headers: $allowHeaders" -ForegroundColor Cyan
}
catch {
    Write-Host "Error with OPTIONS request: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "CORS Configuration Tips:" -ForegroundColor Yellow
Write-Host "1. Ensure your frontend is running on one of the allowed origins" -ForegroundColor White
Write-Host "2. Check browser developer tools for specific CORS error messages" -ForegroundColor White
Write-Host "3. Verify Django server is accessible from your frontend origin" -ForegroundColor White
