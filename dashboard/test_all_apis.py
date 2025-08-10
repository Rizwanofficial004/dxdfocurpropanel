#!/usr/bin/env python3
"""
Comprehensive API Test Script for DDS Focus Time Application
Tests all API endpoints and provides detailed feedback
"""

import requests
import json
from datetime import datetime
import sys

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

# Test credentials - UPDATE THESE
TEST_EMAIL = "admin@example.com"  # UPDATE THIS
TEST_PASSWORD = "admin123"        # UPDATE THIS

# Session to maintain cookies
session = requests.Session()

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"🔧 {title}")
    print(f"{'='*60}")

def print_test_result(test_name, url, response, expected_status=200):
    """Print test results in a formatted way"""
    print(f"\n🧪 Testing: {test_name}")
    print(f"📍 URL: {url}")
    print(f"📊 Status Code: {response.status_code}")
    
    if response.status_code == expected_status:
        print("✅ Status: PASS")
    else:
        print("❌ Status: FAIL")
    
    print("📋 Response:")
    try:
        response_data = response.json()
        print(json.dumps(response_data, indent=2))
    except:
        print(response.text[:500])  # Show first 500 chars if not JSON
    
    print("-" * 60)

def test_api_connection():
    """Test basic API connectivity"""
    print_header("API Connectivity Tests")
    
    # Test 1: API Test Endpoint
    try:
        response = session.get(f"{API_BASE}/test/")
        print_test_result("API Test Endpoint", f"{API_BASE}/test/", response)
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
        return False

def test_authentication():
    """Test authentication endpoints"""
    print_header("Authentication Tests")
    
    # Test 1: Valid Login
    login_data = {
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = session.post(
            f"{API_BASE}/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        print_test_result("Valid Login", f"{API_BASE}/auth/login/", response)
        
        if response.status_code == 200:
            return True
        else:
            print("⚠️  Login failed. Please check your credentials in the script.")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Login Error: {e}")
        return False

def test_screenshots_api():
    """Test screenshots API endpoints"""
    print_header("Screenshots API Tests")
    
    # Test 1: GET Screenshots (basic)
    try:
        response = session.get(f"{API_BASE}/screenshots/")
        print_test_result("GET Screenshots (Basic)", f"{API_BASE}/screenshots/", response)
    except requests.exceptions.RequestException as e:
        print(f"❌ Screenshots GET Error: {e}")
    
    # Test 2: GET Screenshots with parameters
    try:
        params = "?limit=5&page=1"
        response = session.get(f"{API_BASE}/screenshots/{params}")
        print_test_result("GET Screenshots (With Params)", f"{API_BASE}/screenshots/{params}", response)
    except requests.exceptions.RequestException as e:
        print(f"❌ Screenshots GET with params Error: {e}")
    
    # Test 3: POST Screenshots with filters
    try:
        screenshots_data = {
            "email": TEST_EMAIL,
            "date": "2025-01-15",
            "limit": 10,
            "page": 1
        }
        
        response = session.post(
            f"{API_BASE}/screenshots/",
            json=screenshots_data,
            headers={"Content-Type": "application/json"}
        )
        print_test_result("POST Screenshots (With Filters)", f"{API_BASE}/screenshots/", response)
    except requests.exceptions.RequestException as e:
        print(f"❌ Screenshots POST Error: {e}")

def test_logs_api():
    """Test logs API endpoints"""
    print_header("Logs API Tests")
    
    # Test 1: GET Logs (basic)
    try:
        response = session.get(f"{API_BASE}/logs/")
        print_test_result("GET Logs (Basic)", f"{API_BASE}/logs/", response)
    except requests.exceptions.RequestException as e:
        print(f"❌ Logs GET Error: {e}")
    
    # Test 2: GET Logs with parameters
    try:
        params = "?limit=5&page=1"
        response = session.get(f"{API_BASE}/logs/{params}")
        print_test_result("GET Logs (With Params)", f"{API_BASE}/logs/{params}", response)
    except requests.exceptions.RequestException as e:
        print(f"❌ Logs GET with params Error: {e}")
    
    # Test 3: POST Create Log
    try:
        log_data = {
            "staffid": 123,
            "email": TEST_EMAIL,
            "jsonlog": {
                "activity": "api_test",
                "timestamp": datetime.now().isoformat(),
                "details": "Testing the logs API",
                "duration": 300
            },
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        
        response = session.post(
            f"{API_BASE}/logs/",
            json=log_data,
            headers={"Content-Type": "application/json"}
        )
        print_test_result("POST Create Log", f"{API_BASE}/logs/", response, 201)
    except requests.exceptions.RequestException as e:
        print(f"❌ Logs POST Error: {e}")

def test_legacy_api():
    """Test legacy API endpoints"""
    print_header("Legacy API Tests")
    
    # Test 1: Legacy Update Logs
    try:
        legacy_data = {
            "staffid": 123,
            "email": TEST_EMAIL,
            "activity": "legacy_test",
            "timestamp": datetime.now().isoformat()
        }
        
        response = session.post(
            f"{API_BASE}/update-log-info/",
            json=legacy_data,
            headers={"Content-Type": "application/json"}
        )
        print_test_result("Legacy Update Logs", f"{API_BASE}/update-log-info/", response)
    except requests.exceptions.RequestException as e:
        print(f"❌ Legacy API Error: {e}")

def test_user_specific_apis():
    """Test user-specific API endpoints"""
    print_header("User-Specific API Tests")
    
    # Test 1: User Screenshots
    try:
        url = f"{API_BASE}/users/{TEST_EMAIL}/screenshots/?limit=5&page=1"
        response = session.get(url)
        print_test_result("User Screenshots", url, response)
    except requests.exceptions.RequestException as e:
        print(f"❌ User Screenshots Error: {e}")
    
    # Test 2: User Screenshots with date filter
    try:
        url = f"{API_BASE}/users/{TEST_EMAIL}/screenshots/?date=2025-01-15&limit=10"
        response = session.get(url)
        print_test_result("User Screenshots (with date)", url, response)
    except requests.exceptions.RequestException as e:
        print(f"❌ User Screenshots with date Error: {e}")
    
    # Test 3: User Logs
    try:
        url = f"{API_BASE}/users/{TEST_EMAIL}/logs/?limit=5&page=1"
        response = session.get(url)
        print_test_result("User Logs", url, response)
    except requests.exceptions.RequestException as e:
        print(f"❌ User Logs Error: {e}")
    
    # Test 4: User Logs with search
    try:
        url = f"{API_BASE}/users/{TEST_EMAIL}/logs/?search=activity&limit=10"
        response = session.get(url)
        print_test_result("User Logs (with search)", url, response)
    except requests.exceptions.RequestException as e:
        print(f"❌ User Logs with search Error: {e}")

def test_error_handling():
    """Test API error handling"""
    print_header("Error Handling Tests")
    
    # Test 1: Invalid Login
    try:
        invalid_login = {
            "username": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        response = session.post(
            f"{API_BASE}/auth/login/",
            json=invalid_login,
            headers={"Content-Type": "application/json"}
        )
        print_test_result("Invalid Login (Should Fail)", f"{API_BASE}/auth/login/", response, 401)
    except requests.exceptions.RequestException as e:
        print(f"❌ Invalid Login Test Error: {e}")
    
    # Test 2: Missing Required Fields
    try:
        incomplete_log = {
            "email": TEST_EMAIL,
            # Missing required fields
        }
        
        response = session.post(
            f"{API_BASE}/logs/",
            json=incomplete_log,
            headers={"Content-Type": "application/json"}
        )
        print_test_result("Incomplete Log Data (Should Fail)", f"{API_BASE}/logs/", response, 400)
    except requests.exceptions.RequestException as e:
        print(f"❌ Incomplete Log Test Error: {e}")

def print_summary():
    """Print test summary and next steps"""
    print_header("Test Summary & Next Steps")
    
    print("🎯 All API endpoints have been tested!")
    print("\n📋 Available API Endpoints:")
    print(f"   • {API_BASE}/test/")
    print(f"   • {API_BASE}/auth/login/")
    print(f"   • {API_BASE}/screenshots/")
    print(f"   • {API_BASE}/logs/")
    print(f"   • {API_BASE}/update-log-info/")
    
    print("\n🔧 Direct Test URLs (for browser):")
    print(f"   • {API_BASE}/test/")
    print(f"   • {API_BASE}/screenshots/?limit=5")
    print(f"   • {API_BASE}/logs/?limit=5")
    
    print("\n📝 Next Steps:")
    print("   1. Update TEST_EMAIL and TEST_PASSWORD with valid credentials")
    print("   2. Test the URLs directly in your browser")
    print("   3. Use the Postman collection for advanced testing")
    print("   4. Check the HTML demo page for interactive testing")

def main():
    """Run all tests"""
    print("🚀 Starting Comprehensive API Tests for DDS Focus Time")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"🔗 API Base: {API_BASE}")
    print(f"📧 Test Email: {TEST_EMAIL}")
    
    # Test API connectivity first
    if not test_api_connection():
        print("\n❌ Cannot connect to API. Please ensure:")
        print("   1. Django server is running: python manage.py runserver")
        print("   2. The server is accessible at http://localhost:8000")
        print("   3. The API URLs are properly configured")
        sys.exit(1)
    
    # Test authentication
    auth_success = test_authentication()
    
    if auth_success:
        print("\n✅ Authentication successful, running all tests...")
        test_screenshots_api()
        test_logs_api()
        test_legacy_api()
        test_user_specific_apis()
    else:
        print("\n⚠️  Authentication failed, running non-authenticated tests only...")
    
    # Test error handling (doesn't require authentication)
    test_error_handling()
    
    # Print summary
    print_summary()

if __name__ == "__main__":
    main()
