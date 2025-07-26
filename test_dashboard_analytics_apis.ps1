# Dashboard Analytics API Testing Script
# PowerShell version for Windows testing

Write-Host "🚀 Dashboard Analytics API Testing" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Configuration
$BaseURL = "http://localhost:8000/api/dashboard/analytics"
$TestResults = @()

# Function to test an API endpoint
function Test-APIEndpoint {
    param(
        [string]$Name,
        [string]$Endpoint
    )
    
    $FullURL = "$BaseURL$Endpoint"
    Write-Host ""
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $FullURL" -ForegroundColor Gray
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    try {
        $StartTime = Get-Date
        $Response = Invoke-RestMethod -Uri $FullURL -Method GET -TimeoutSec 30
        $EndTime = Get-Date
        $Duration = ($EndTime - $StartTime).TotalSeconds
        
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "Response Time: $($Duration.ToString('F2')) seconds" -ForegroundColor Gray
        
        # Display key metrics
        if ($Response.success -eq $true) {
            Write-Host "Status: Success" -ForegroundColor Green
            Write-Host "Message: $($Response.message)" -ForegroundColor Gray
            
            # Show specific metrics based on endpoint
            switch ($Name) {
                "Total Employees" {
                    if ($Response.data.total_employees) {
                        Write-Host "📊 Total Employees: $($Response.data.total_employees)" -ForegroundColor Cyan
                        Write-Host "📈 Growth: $($Response.data.growth_percentage)%" -ForegroundColor Cyan
                    }
                }
                "Total Projects" {
                    if ($Response.data.total_projects) {
                        Write-Host "📊 Total Projects: $($Response.data.total_projects)" -ForegroundColor Cyan
                        Write-Host "📈 Growth: $($Response.data.growth_percentage)%" -ForegroundColor Cyan
                    }
                }
                "Completed Projects" {
                    if ($Response.data.completed_projects) {
                        Write-Host "📊 Completed Projects: $($Response.data.completed_projects)" -ForegroundColor Cyan
                        Write-Host "📈 Growth: $($Response.data.growth_percentage)%" -ForegroundColor Cyan
                    }
                }
                "Total Tasks" {
                    if ($Response.data.total_tasks) {
                        Write-Host "📊 Total Tasks: $($Response.data.total_tasks)" -ForegroundColor Cyan
                        if ($Response.data.task_breakdown) {
                            Write-Host "📋 Task Breakdown:" -ForegroundColor Cyan
                            $Response.data.task_breakdown.PSObject.Properties | ForEach-Object {
                                Write-Host "   $($_.Name): $($_.Value)" -ForegroundColor Gray
                            }
                        }
                    }
                }
                "Dashboard Summary" {
                    if ($Response.data.summary) {
                        Write-Host "📊 Dashboard Summary:" -ForegroundColor Cyan
                        $Summary = $Response.data.summary
                        if ($Summary.total_employees) {
                            Write-Host "   Employees: $($Summary.total_employees.count)" -ForegroundColor Gray
                        }
                        if ($Summary.total_projects) {
                            Write-Host "   Projects: $($Summary.total_projects.count)" -ForegroundColor Gray
                        }
                        if ($Summary.completed_projects) {
                            Write-Host "   Completed: $($Summary.completed_projects.count)" -ForegroundColor Gray
                        }
                        if ($Summary.total_tasks) {
                            Write-Host "   Tasks: $($Summary.total_tasks.count)" -ForegroundColor Gray
                        }
                        if ($Response.data.errors -and $Response.data.errors.Count -gt 0) {
                            Write-Host "⚠️ Errors: $($Response.data.errors.Count)" -ForegroundColor Yellow
                        }
                    }
                }
            }
            }
        } else {
            Write-Host "❌ API returned success=false" -ForegroundColor Red
            Write-Host "Message: $($Response.message)" -ForegroundColor Red
        }
        
        # Store result
        $TestResults += [PSCustomObject]@{
            Name = $Name
            Endpoint = $Endpoint
            Success = $true
            Duration = $Duration
            Status = "PASS"
        }
        
        return $true
        
    } catch {
        Write-Host "❌ ERROR" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Store result
        $TestResults += [PSCustomObject]@{
            Name = $Name
            Endpoint = $Endpoint
            Success = $false
            Duration = 0
            Status = "FAIL"
            Error = $_.Exception.Message
        }
        
        return $false
    }
}

# Test all endpoints
Write-Host "Starting API tests..." -ForegroundColor White

$Endpoints = @(
    @{ Name = "Total Employees"; Endpoint = "/employees/" },
    @{ Name = "Total Projects"; Endpoint = "/projects/" },
    @{ Name = "Completed Projects"; Endpoint = "/completed-projects/" },
    @{ Name = "Total Tasks"; Endpoint = "/tasks/" },
    @{ Name = "Dashboard Summary"; Endpoint = "/summary/" }
)

foreach ($Endpoint in $Endpoints) {
    Test-APIEndpoint -Name $Endpoint.Name -Endpoint $Endpoint.Endpoint
    Start-Sleep -Seconds 1  # Brief pause between tests
}

# Display summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📋 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$PassedTests = ($TestResults | Where-Object { $_.Success -eq $true }).Count
$TotalTests = $TestResults.Count

Write-Host ""
foreach ($Result in $TestResults) {
    $StatusColor = if ($Result.Success) { "Green" } else { "Red" }
    $StatusIcon = if ($Result.Success) { "✅" } else { "❌" }
    
    Write-Host "$StatusIcon $($Result.Name.PadRight(20)) $($Result.Status)" -ForegroundColor $StatusColor
    if ($Result.Success) {
        Write-Host "   Response Time: $($Result.Duration.ToString('F2'))s" -ForegroundColor Gray
    } else {
        Write-Host "   Error: $($Result.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Results: $PassedTests/$TotalTests tests passed" -ForegroundColor White

if ($PassedTests -eq $TotalTests) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some tests failed. Check the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "   1. Make sure Django server is running: python manage.py runserver" -ForegroundColor Gray
    Write-Host "   2. Check if the URL is correct: $BaseURL" -ForegroundColor Gray
    Write-Host "   3. Verify database configuration and CRM API settings" -ForegroundColor Gray
    Write-Host "   4. Check Django logs for detailed error messages" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🌐 Open the demo page:" -ForegroundColor Cyan
Write-Host "   file:///$((Get-Location).Path)/dashboard_analytics_demo.html" -ForegroundColor Gray

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   See DASHBOARD_ANALYTICS_API_DOCUMENTATION.md for full details" -ForegroundColor Gray

# Pause at the end
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
