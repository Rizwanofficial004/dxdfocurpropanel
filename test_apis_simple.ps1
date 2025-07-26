# Simple Dashboard Analytics API Testing Script
# PowerShell version for Windows testing

Write-Host "Dashboard Analytics API Testing" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Configuration
$BaseURL = "http://localhost:8000/api/dashboard/analytics"

# Function to test an API endpoint
function Test-Endpoint {
    param([string]$Name, [string]$URL)
    
    Write-Host ""
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $URL" -ForegroundColor Gray
    
    try {
        $Response = Invoke-RestMethod -Uri $URL -Method GET -TimeoutSec 30
        
        if ($Response.success) {
            Write-Host "✅ SUCCESS" -ForegroundColor Green
            Write-Host "Response:" -ForegroundColor Gray
            $Response | ConvertTo-Json -Depth 3
            return $true
        } else {
            Write-Host "❌ FAILED" -ForegroundColor Red
            Write-Host "Message: $($Response.message)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ ERROR" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test endpoints
$Results = @{}

Write-Host "Starting API tests..." -ForegroundColor White

$Results["Employees"] = Test-Endpoint "Total Employees" "$BaseURL/employees/"
$Results["Projects"] = Test-Endpoint "Total Projects" "$BaseURL/projects/"
$Results["Completed"] = Test-Endpoint "Completed Projects" "$BaseURL/completed-projects/"
$Results["Tasks"] = Test-Endpoint "Total Tasks" "$BaseURL/tasks/"
$Results["Summary"] = Test-Endpoint "Dashboard Summary" "$BaseURL/summary/"

# Display summary
Write-Host ""
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan

$Passed = 0
foreach ($Key in $Results.Keys) {
    $Status = if ($Results[$Key]) { "PASS" } else { "FAIL" }
    $Color = if ($Results[$Key]) { "Green" } else { "Red" }
    
    Write-Host "$Key : $Status" -ForegroundColor $Color
    if ($Results[$Key]) { $Passed++ }
}

Write-Host ""
Write-Host "Results: $Passed/$($Results.Count) tests passed" -ForegroundColor White

if ($Passed -eq $Results.Count) {
    Write-Host "All tests passed!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Make sure Django server is running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
