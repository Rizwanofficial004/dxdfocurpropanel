#!/bin/bash
# Quick API Test Script for Windows PowerShell/Command Prompt

echo "🚀 Testing DDS Focus Time APIs"
echo "================================"

# Set your credentials here
$BASE_URL = "http://localhost:8000/api"
$EMAIL = "admin@example.com"  # UPDATE THIS
$PASSWORD = "admin123"        # UPDATE THIS

echo "🔐 Testing Login API..."
curl -X POST "$BASE_URL/auth/login/" `
  -H "Content-Type: application/json" `
  -d "{\"username\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" `
  -c cookies.txt

echo "`n📸 Testing Screenshots API (General)..."
curl -X GET "$BASE_URL/screenshots/?limit=5" `
  -b cookies.txt

echo "`n📸 Testing User Screenshots API (Specific Email)..."
curl -X GET "$BASE_URL/users/$EMAIL/screenshots/?limit=5" `
  -b cookies.txt

echo "`n📝 Testing Logs API (General)..."
curl -X GET "$BASE_URL/logs/?limit=5" `
  -b cookies.txt

echo "`n📝 Testing User Logs API (Specific Email)..."
curl -X GET "$BASE_URL/users/$EMAIL/logs/?limit=5" `
  -b cookies.txt

echo "`n✅ API Testing Complete!"
