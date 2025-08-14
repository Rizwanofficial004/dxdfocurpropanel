#!/bin/bash

# CORS Proxy Server Startup Script
# This script starts the proxy server to bypass CORS restrictions

echo "🚀 Starting CRM CORS Proxy Server..."
echo "📡 This will allow frontend to access CRM API without CORS errors"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the proxy file exists
if [ ! -f "src/api/crmProxy.js" ]; then
    echo "❌ Proxy file not found: src/api/crmProxy.js"
    exit 1
fi

# Install dependencies if package.json exists
if [ -f "proxy-package.json" ]; then
    echo "📦 Installing proxy dependencies..."
    npm install --package-lock=false express cors node-fetch
    echo ""
fi

# Start the proxy server
echo "🌐 Starting proxy server on http://localhost:8080"
echo "🔗 CRM API endpoint: http://localhost:8080/api/crm/staffs"
echo "❌ Press Ctrl+C to stop the server"
echo ""

node src/api/crmProxy.js
