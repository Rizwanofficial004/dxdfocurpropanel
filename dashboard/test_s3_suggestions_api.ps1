# S3 Employee Search API Test Script
# PowerShell script to test the new /api/users/s3-suggestions/ endpoint

param(
    [string]$BaseUrl = "http://localhost:8000",
    [string]$Query = "haseeb",
    [int]$Limit = 10
)

Write-Host "🚀 Testing S3 User Suggestions API" -ForegroundColor Cyan
Write-Host "=" * 50

# API endpoint
$apiEndpoint = "/api/users/s3-suggestions/"
$fullUrl = "$BaseUrl$apiEndpoint"

Write-Host "🎯 Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "🔗 Endpoint: $apiEndpoint" -ForegroundColor Yellow
Write-Host "🔍 Query: '$Query'" -ForegroundColor Yellow
Write-Host "📊 Limit: $Limit" -ForegroundColor Yellow
Write-Host ""

# Test cases
$testCases = @(
    @{ Name = "Search for 'haseeb'"; Query = "haseeb"; Limit = 10 },
    @{ Name = "Search for email"; Query = "gmail"; Limit = 5 },
    @{ Name = "Search by partial name"; Query = "dev"; Limit = 10 },
    @{ Name = "Empty search"; Query = ""; Limit = 10 },
    @{ Name = "Single character"; Query = "h"; Limit = 10 }
)

$totalTests = $testCases.Count
$passedTests = 0

foreach ($i in 0..($testCases.Count - 1)) {
    $testCase = $testCases[$i]
    $testNumber = $i + 1
    
    Write-Host "📝 Test $testNumber/$totalTests`: $($testCase.Name)" -ForegroundColor Green
    Write-Host "-" * 30
    
    try {
        # Prepare URL with parameters
        $params = @{
            q = $testCase.Query
            limit = $testCase.Limit
        }
        
        $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$([System.Uri]::EscapeDataString($_.Value))" }) -join "&"
        $requestUrl = "$fullUrl?$queryString"
        
        Write-Host "🌐 URL: $requestUrl" -ForegroundColor Gray
        
        # Make the request
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri $requestUrl -Method Get -ContentType "application/json" -ErrorAction Stop
        $endTime = Get-Date
        
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "⏱️ Response Time: $([math]::Round($responseTime, 2))ms" -ForegroundColor Magenta
        
        # Check response structure
        if ($response.success) {
            Write-Host "✅ Success: $($response.success)" -ForegroundColor Green
            Write-Host "💬 Message: $($response.message)" -ForegroundColor Green
            
            if ($response.data -and $response.data.suggestions) {
                $suggestions = $response.data.suggestions
                Write-Host "👥 Found $($suggestions.Count) suggestions" -ForegroundColor Yellow
                
                # Display first few suggestions
                $displayCount = [Math]::Min(3, $suggestions.Count)
                for ($j = 0; $j -lt $displayCount; $j++) {
                    $suggestion = $suggestions[$j]
                    Write-Host ""
                    Write-Host "   👤 Suggestion $($j + 1):" -ForegroundColor Cyan
                    Write-Host "      📧 Email: $($suggestion.email)" -ForegroundColor White
                    Write-Host "      👤 Display Name: $($suggestion.display_name)" -ForegroundColor White
                    Write-Host "      🆔 Staff ID: $($suggestion.staff_id)" -ForegroundColor White
                    Write-Host "      📸 Screenshots: $($suggestion.screenshot_count)" -ForegroundColor White
                    Write-Host "      🟢 Recent Activity: $($suggestion.has_recent_activity)" -ForegroundColor White
                    Write-Host "      💭 Suggestion Text: $($suggestion.suggestion_text)" -ForegroundColor White
                }
                
                if ($suggestions.Count -gt 3) {
                    Write-Host "   ... and $($suggestions.Count - 3) more suggestions" -ForegroundColor Gray
                }
                
                $passedTests++
                Write-Host ""
                Write-Host "✅ Test PASSED" -ForegroundColor Green
            } else {
                Write-Host "❌ Invalid response structure - missing suggestions" -ForegroundColor Red
                Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ API returned success: false" -ForegroundColor Red
            Write-Host "Message: $($response.message)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Message -like "*ConnectFailure*" -or $_.Exception.Message -like "*connection*") {
            Write-Host "💡 Make sure your Django server is running at $BaseUrl" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

# Summary
Write-Host "=" * 50
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
$successRate = [Math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow

if ($passedTests -eq $totalTests) {
    Write-Host ""
    Write-Host "🎉 All tests passed! API is working correctly." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ $($totalTests - $passedTests) test(s) failed. Check the errors above." -ForegroundColor Yellow
}

# Test specific response format
Write-Host ""
Write-Host "🔍 Testing Response Format Compliance" -ForegroundColor Cyan
Write-Host "=" * 50

try {
    $testUrl = "$fullUrl?q=test&limit=1"
    $formatResponse = Invoke-RestMethod -Uri $testUrl -Method Get -ContentType "application/json"
    
    # Check required fields
    $requiredFields = @("success", "data")
    $missingFields = @()
    
    foreach ($field in $requiredFields) {
        if (-not $formatResponse.PSObject.Properties.Name -contains $field) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -gt 0) {
        Write-Host "❌ Missing top-level fields: $($missingFields -join ', ')" -ForegroundColor Red
    } elseif (-not $formatResponse.data.PSObject.Properties.Name -contains "suggestions") {
        Write-Host "❌ Missing 'suggestions' in data" -ForegroundColor Red
    } else {
        Write-Host "✅ Response format matches requirements" -ForegroundColor Green
        
        if ($formatResponse.data.suggestions.Count -gt 0) {
            $sampleSuggestion = $formatResponse.data.suggestions[0]
            $requiredSuggestionFields = @("display_name", "email", "username", "staff_id", "screenshot_count", "suggestion_text", "search_value", "has_recent_activity")
            
            $missingSuggestionFields = @()
            foreach ($field in $requiredSuggestionFields) {
                if (-not $sampleSuggestion.PSObject.Properties.Name -contains $field) {
                    $missingSuggestionFields += $field
                }
            }
            
            if ($missingSuggestionFields.Count -gt 0) {
                Write-Host "❌ Missing suggestion fields: $($missingSuggestionFields -join ', ')" -ForegroundColor Red
            } else {
                Write-Host "✅ Suggestion structure is correct" -ForegroundColor Green
                Write-Host ""
                Write-Host "📋 Sample Response Structure:" -ForegroundColor Cyan
                $sampleResponse = @{
                    success = $formatResponse.success
                    data = @{
                        suggestions = @($sampleSuggestion)
                    }
                }
                Write-Host ($sampleResponse | ConvertTo-Json -Depth 3) -ForegroundColor White
            }
        } else {
            Write-Host "ℹ️ No suggestions returned, but format is correct" -ForegroundColor Blue
        }
    }
    
} catch {
    Write-Host "❌ Error testing response format: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🏁 Testing completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Magenta
