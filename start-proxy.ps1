# CORS Proxy Server Startup Script (PowerShell)
# This script starts the proxy server to bypass CORS restrictions

Write-Host "🚀 Starting CRM CORS Proxy Server..." -ForegroundColor Green
Write-Host "📡 This will allow frontend to access CRM API without CORS errors" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if the proxy file exists
if (!(Test-Path "src/api/crmProxy.js")) {
    Write-Host "❌ Proxy file not found: src/api/crmProxy.js" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing proxy dependencies..." -ForegroundColor Yellow
try {
    npm install express cors node-fetch --no-package-lock
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not install some dependencies, continuing anyway..." -ForegroundColor Yellow
}

Write-Host ""

# Start the proxy server
Write-Host "🌐 Starting proxy server on http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔗 CRM API endpoint: http://localhost:8080/api/crm/staffs" -ForegroundColor Cyan
Write-Host "❌ Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node src/api/crmProxy.js
