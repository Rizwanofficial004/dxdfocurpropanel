# PowerShell script to test Credentials API
# Test all credential-related endpoints

Write-Host "=== Testing Credentials API ===" -ForegroundColor Green

$baseUrl = "http://127.0.0.1:8000/api"

Write-Host "`n1. Testing credentials list..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/credentials/?action=list" -Method GET
    Write-Host "✅ Credentials List:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Credentials List Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing credentials validation..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/credentials/?action=validate" -Method GET
    Write-Host "✅ Credentials Validation:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Credentials Validation Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing AWS connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/credentials/?action=test&service=aws" -Method GET
    Write-Host "✅ AWS Connection Test:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ AWS Connection Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Testing OpenAI connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/credentials/?action=test&service=openai" -Method GET
    Write-Host "✅ OpenAI Connection Test:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ OpenAI Connection Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. Testing CRM connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/credentials/?action=test&service=crm" -Method GET
    Write-Host "✅ CRM Connection Test:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ CRM Connection Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6. Testing MySQL connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/credentials/?action=test&service=mysql" -Method GET
    Write-Host "✅ MySQL Connection Test:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ MySQL Connection Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n7. Testing all services at once..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/credentials/?action=test" -Method GET
    Write-Host "✅ All Services Test:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ All Services Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n8. Testing credentials status (legacy endpoint)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/credentials/status/" -Method GET
    Write-Host "✅ Credentials Status:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Credentials Status Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Green
