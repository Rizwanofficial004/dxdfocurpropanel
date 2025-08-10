# PowerShell test script for Employee Folder Screenshots API (Level 3)
# Tests the /api/screenshots/employee/{employee_email}/folder/{folder_name}/ endpoint

param(
    [string]$BaseUrl = "http://localhost:8000",
    [string]$EmployeeEmail = "haseepcodejourney@gmail.com",
    [string]$FolderName = "2025-01-15"
)

Write-Host "🚀 Testing Employee Folder Screenshots API (Level 3)" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green

$ApiEndpoint = "/api/screenshots/employee/$EmployeeEmail/folder/$FolderName/"
$FullUrl = "$BaseUrl$ApiEndpoint"

Write-Host "🔗 Testing URL: $FullUrl" -ForegroundColor Cyan
Write-Host "👤 Employee: $EmployeeEmail" -ForegroundColor Yellow
Write-Host "📁 Folder: $FolderName" -ForegroundColor Yellow

# Test cases
$TestCases = @(
    @{
        Name = "Basic request (page 1, limit 10)"
        Params = @{
            page = 1
            limit = 10
        }
    },
    @{
        Name = "Pagination test (page 2, limit 5)"
        Params = @{
            page = 2
            limit = 5
        }
    },
    @{
        Name = "Large page size (limit 50)"
        Params = @{
            page = 1
            limit = 50
        }
    },
    @{
        Name = "Max page size (limit 100)"
        Params = @{
            page = 1
            limit = 100
        }
    }
)

$TestsPassed = 0
$TotalTests = $TestCases.Count

foreach ($i in 0..($TestCases.Count - 1)) {
    $TestCase = $TestCases[$i]
    $TestNumber = $i + 1
    
    Write-Host ""
    Write-Host "📝 Test $TestNumber/$TotalTests`: $($TestCase.Name)" -ForegroundColor Cyan
    Write-Host "-" * 50 -ForegroundColor Gray
    
    try {
        # Build query parameters
        $QueryParams = @()
        foreach ($param in $TestCase.Params.GetEnumerator()) {
            $QueryParams += "$($param.Key)=$($param.Value)"
        }
        $QueryString = $QueryParams -join "&"
        $TestUrl = "$FullUrl`?$QueryString"
        
        Write-Host "🔗 URL: $TestUrl" -ForegroundColor Gray
        
        # Make the request
        $StartTime = Get-Date
        $Response = Invoke-RestMethod -Uri $TestUrl -Method GET -ContentType "application/json"
        $EndTime = Get-Date
        
        $ResponseTime = ($EndTime - $StartTime).TotalMilliseconds
        
        Write-Host "⏱️ Response Time: $([math]::Round($ResponseTime, 2))ms" -ForegroundColor Gray
        Write-Host "✅ Status: SUCCESS" -ForegroundColor Green
        
        # Check response structure
        if ($Response.success) {
            Write-Host "💬 Message: $($Response.message)" -ForegroundColor Green
            
            $Data = $Response.data
            $FolderInfo = $Data.folder_info
            $Screenshots = $Data.screenshots
            $Pagination = $Data.pagination
            
            # Display folder info
            Write-Host "📁 Folder: $($FolderInfo.folder_name)" -ForegroundColor Yellow
            Write-Host "👤 Employee: $($FolderInfo.employee_name) ($($FolderInfo.employee_email))" -ForegroundColor Yellow
            Write-Host "📅 Is Date Folder: $($FolderInfo.is_date_folder)" -ForegroundColor Yellow
            
            # Display screenshots info
            Write-Host "📸 Screenshots in Page: $($Screenshots.Count)" -ForegroundColor Cyan
            
            # Display pagination info
            Write-Host "📄 Current Page: $($Pagination.current_page)" -ForegroundColor Cyan
            Write-Host "📚 Total Pages: $($Pagination.total_pages)" -ForegroundColor Cyan
            Write-Host "🎯 Total Screenshots: $($Pagination.total_screenshots)" -ForegroundColor Cyan
            Write-Host "📏 Limit: $($Pagination.limit)" -ForegroundColor Cyan
            
            # Show sample screenshots
            if ($Screenshots.Count -gt 0) {
                Write-Host "" -ForegroundColor Gray
                Write-Host "   📸 Sample Screenshots:" -ForegroundColor Magenta
                
                $SampleCount = [Math]::Min(3, $Screenshots.Count)
                for ($j = 0; $j -lt $SampleCount; $j++) {
                    $Screenshot = $Screenshots[$j]
                    $SampleNum = $j + 1
                    
                    Write-Host "      $SampleNum. $($Screenshot.filename)" -ForegroundColor White
                    Write-Host "         🕐 Time: $($Screenshot.time_display)" -ForegroundColor Gray
                    Write-Host "         📱 App: $($Screenshot.application)" -ForegroundColor Gray
                    Write-Host "         🪟 Window: $($Screenshot.window_title)" -ForegroundColor Gray
                    Write-Host "         💾 Size: $(Format-FileSize $Screenshot.file_size)" -ForegroundColor Gray
                    
                    $HasUrl = if ($Screenshot.url) { "Yes" } else { "No" }
                    $HasThumb = if ($Screenshot.thumbnail_url) { "Yes" } else { "No" }
                    
                    Write-Host "         🔗 Has URL: $HasUrl" -ForegroundColor Gray
                    Write-Host "         🖼️ Has Thumbnail: $HasThumb" -ForegroundColor Gray
                }
                
                if ($Screenshots.Count -gt 3) {
                    $Remaining = $Screenshots.Count - 3
                    Write-Host "         ... and $Remaining more screenshots" -ForegroundColor Gray
                }
            }
            
            # Validate response format
            $IsValidFormat = Test-ResponseFormat -ResponseData $Data
            
            if ($IsValidFormat) {
                $TestsPassed++
                Write-Host ""
                Write-Host "✅ Test PASSED" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "❌ Test FAILED - Invalid response format" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ API returned error: $($Response.message)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $StatusCode = $_.Exception.Response.StatusCode
            Write-Host "🌐 Status Code: $StatusCode" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "📊 TEST SUMMARY" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green

Write-Host "Total Tests: $TotalTests" -ForegroundColor White
Write-Host "Passed: $TestsPassed" -ForegroundColor Green
Write-Host "Failed: $($TotalTests - $TestsPassed)" -ForegroundColor Red

$SuccessRate = ($TestsPassed / $TotalTests) * 100
Write-Host "Success Rate: $([math]::Round($SuccessRate, 1))%" -ForegroundColor Cyan

if ($TestsPassed -eq $TotalTests) {
    Write-Host ""
    Write-Host "🎉 All tests passed! API is working correctly." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ $($TotalTests - $TestsPassed) test(s) failed. Check the errors above." -ForegroundColor Yellow
}

# Function to validate response format
function Test-ResponseFormat {
    param($ResponseData)
    
    try {
        # Check top-level structure
        $RequiredFields = @("folder_info", "screenshots", "pagination")
        foreach ($Field in $RequiredFields) {
            if (-not $ResponseData.PSObject.Properties.Name.Contains($Field)) {
                Write-Host "❌ Missing field: $Field" -ForegroundColor Red
                return $false
            }
        }
        
        # Check folder_info structure
        $FolderInfo = $ResponseData.folder_info
        $RequiredFolderFields = @("folder_name", "employee_name", "employee_email")
        foreach ($Field in $RequiredFolderFields) {
            if (-not $FolderInfo.PSObject.Properties.Name.Contains($Field)) {
                Write-Host "❌ Missing folder_info field: $Field" -ForegroundColor Red
                return $false
            }
        }
        
        # Check screenshots structure (if any screenshots exist)
        $Screenshots = $ResponseData.screenshots
        if ($Screenshots.Count -gt 0) {
            $Screenshot = $Screenshots[0]
            $RequiredScreenshotFields = @(
                "id", "filename", "url", "timestamp", "file_size",
                "application", "window_title", "date_folder", "time_display"
            )
            foreach ($Field in $RequiredScreenshotFields) {
                if (-not $Screenshot.PSObject.Properties.Name.Contains($Field)) {
                    Write-Host "❌ Missing screenshot field: $Field" -ForegroundColor Red
                    return $false
                }
            }
        }
        
        # Check pagination structure
        $Pagination = $ResponseData.pagination
        $RequiredPaginationFields = @(
            "current_page", "total_pages", "total_screenshots", "limit", "offset"
        )
        foreach ($Field in $RequiredPaginationFields) {
            if (-not $Pagination.PSObject.Properties.Name.Contains($Field)) {
                Write-Host "❌ Missing pagination field: $Field" -ForegroundColor Red
                return $false
            }
        }
        
        Write-Host "✅ Response format validation passed" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Host "❌ Response format validation error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to format file size
function Format-FileSize {
    param([int64]$BytesSize)
    
    if ($BytesSize -eq 0) {
        return "0 B"
    }
    
    $Units = @("B", "KB", "MB", "GB")
    $Size = $BytesSize
    $UnitIndex = 0
    
    while ($Size -ge 1024 -and $UnitIndex -lt ($Units.Count - 1)) {
        $Size = $Size / 1024
        $UnitIndex++
    }
    
    return "$([math]::Round($Size, 1)) $($Units[$UnitIndex])"
}

# Performance test function
function Test-Performance {
    Write-Host ""
    Write-Host "⚡ Performance Testing" -ForegroundColor Green
    Write-Host "=" * 70 -ForegroundColor Green
    
    $PerformanceTests = @(
        @{ Name = "Small page (5 items)"; Limit = 5 },
        @{ Name = "Medium page (20 items)"; Limit = 20 },
        @{ Name = "Large page (50 items)"; Limit = 50 },
        @{ Name = "Max page (100 items)"; Limit = 100 }
    )
    
    foreach ($Test in $PerformanceTests) {
        Write-Host ""
        Write-Host "🔍 Testing $($Test.Name):" -ForegroundColor Cyan
        
        $ResponseTimes = @()
        
        for ($i = 1; $i -le 3; $i++) {
            try {
                $TestUrl = "$FullUrl`?page=1&limit=$($Test.Limit)"
                
                $StartTime = Get-Date
                $Response = Invoke-RestMethod -Uri $TestUrl -Method GET -ContentType "application/json"
                $EndTime = Get-Date
                
                $ResponseTime = ($EndTime - $StartTime).TotalMilliseconds
                $ResponseTimes += $ResponseTime
                
                Write-Host "   Attempt $i`: $([math]::Round($ResponseTime, 2))ms" -ForegroundColor Gray
                
            } catch {
                Write-Host "   Attempt $i`: Failed - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        if ($ResponseTimes.Count -gt 0) {
            $AvgTime = ($ResponseTimes | Measure-Object -Average).Average
            $MinTime = ($ResponseTimes | Measure-Object -Minimum).Minimum
            $MaxTime = ($ResponseTimes | Measure-Object -Maximum).Maximum
            
            Write-Host "   📊 Average: $([math]::Round($AvgTime, 2))ms" -ForegroundColor White
            Write-Host "   🚀 Fastest: $([math]::Round($MinTime, 2))ms" -ForegroundColor White
            Write-Host "   🐌 Slowest: $([math]::Round($MaxTime, 2))ms" -ForegroundColor White
            
            if ($AvgTime -lt 500) {
                Write-Host "   ✅ Performance: EXCELLENT" -ForegroundColor Green
            } elseif ($AvgTime -lt 1000) {
                Write-Host "   ✅ Performance: GOOD" -ForegroundColor Green
            } elseif ($AvgTime -lt 2000) {
                Write-Host "   ⚠️ Performance: ACCEPTABLE" -ForegroundColor Yellow
            } else {
                Write-Host "   ❌ Performance: NEEDS IMPROVEMENT" -ForegroundColor Red
            }
        }
    }
}

# Run performance tests
Test-Performance

Write-Host ""
Write-Host "🏁 Level 3 API Test Completed!" -ForegroundColor Green
Write-Host "🕐 Finished at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
