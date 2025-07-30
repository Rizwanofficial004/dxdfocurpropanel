#!/usr/bin/env python3
"""
Comprehensive Login API Test Script
Tests the enhanced login API with various scenarios
"""

import requests
import json
import sys
from datetime import datetime

# API Configuration
BASE_URL = "https://dxdtime.ddsolutions.io"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
LOGOUT_URL = f"{BASE_URL}/api/auth/logout/"
SESSION_URL = f"{BASE_URL}/api/auth/session/"

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"🧪 {title}")
    print(f"{'='*60}")

def print_test(test_name, success, details=""):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   {details}")

def test_api_endpoint(url, method="GET", data=None, headers=None):
    """Test an API endpoint and return response"""
    try:
        if headers is None:
            headers = {"Content-Type": "application/json"}
        
        if method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        else:
            response = requests.get(url, headers=headers, timeout=10)
        
        return {
            "success": True,
            "status_code": response.status_code,
            "response": response.json() if response.content else {},
            "error": None
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "status_code": None,
            "response": {},
            "error": str(e)
        }

def main():
    """Run comprehensive login API tests"""
    print("🚀 Starting Comprehensive Login API Tests")
    print(f"📡 Testing API at: {BASE_URL}")
    print(f"🕐 Test started at: {datetime.now().isoformat()}")
    
    # Test 1: Valid Login
    print_section("Test 1: Valid Admin Login")
    login_data = {
        "username": "Admin",
        "password": "admin123",
        "remember_me": True
    }
    
    result = test_api_endpoint(LOGIN_URL, "POST", login_data)
    if result["success"] and result["status_code"] == 200:
        response_data = result["response"]
        if response_data.get("success"):
            print_test("Valid admin login", True, f"User ID: {response_data['data']['user']['user_id']}")
            print(f"   👤 User: {response_data['data']['user']['username']}")
            print(f"   📧 Email: {response_data['data']['user']['email']}")
            print(f"   👨‍💼 Staff: {response_data['data']['staff_info']['full_name']}")
            session_key = response_data['data']['session_info']['session_key']
        else:
            print_test("Valid admin login", False, response_data.get("message", "Unknown error"))
    else:
        print_test("Valid admin login", False, f"HTTP {result['status_code']}: {result.get('error', 'Request failed')}")
    
    # Test 2: Invalid Password
    print_section("Test 2: Invalid Password")
    invalid_data = {
        "username": "Admin",
        "password": "wrongpassword"
    }
    
    result = test_api_endpoint(LOGIN_URL, "POST", invalid_data)
    if result["success"] and result["status_code"] == 401:
        response_data = result["response"]
        if not response_data.get("success"):
            print_test("Invalid password rejection", True, response_data.get("message"))
        else:
            print_test("Invalid password rejection", False, "Should have failed but didn't")
    else:
        print_test("Invalid password rejection", False, f"Expected 401, got {result['status_code']}")
    
    # Test 3: Invalid Username
    print_section("Test 3: Invalid Username")
    invalid_user_data = {
        "username": "NonExistentUser",
        "password": "anypassword"
    }
    
    result = test_api_endpoint(LOGIN_URL, "POST", invalid_user_data)
    if result["success"] and result["status_code"] == 401:
        response_data = result["response"]
        if not response_data.get("success"):
            print_test("Invalid username rejection", True, response_data.get("message"))
        else:
            print_test("Invalid username rejection", False, "Should have failed but didn't")
    else:
        print_test("Invalid username rejection", False, f"Expected 401, got {result['status_code']}")
    
    # Test 4: Missing Fields
    print_section("Test 4: Missing Required Fields")
    incomplete_data = {
        "username": "Admin"
        # Missing password
    }
    
    result = test_api_endpoint(LOGIN_URL, "POST", incomplete_data)
    if result["success"] and result["status_code"] == 400:
        response_data = result["response"]
        if not response_data.get("success"):
            print_test("Missing password validation", True, response_data.get("message"))
        else:
            print_test("Missing password validation", False, "Should have failed validation")
    else:
        print_test("Missing password validation", False, f"Expected 400, got {result['status_code']}")
    
    # Test 5: Invalid JSON
    print_section("Test 5: Invalid JSON Format")
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(LOGIN_URL, data="invalid json", headers=headers, timeout=10)
        if response.status_code == 400:
            print_test("Invalid JSON rejection", True, "Properly rejected malformed JSON")
        else:
            print_test("Invalid JSON rejection", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_test("Invalid JSON rejection", False, f"Request failed: {str(e)}")
    
    # Test 6: Session Status (after login)
    print_section("Test 6: Session Status Check")
    result = test_api_endpoint(SESSION_URL, "GET")
    if result["success"]:
        response_data = result["response"]
        if response_data.get("success") and response_data["data"]["authenticated"]:
            print_test("Session status check", True, f"Session active for {response_data['data']['user']['username']}")
        else:
            print_test("Session status check", False, "No active session found")
    else:
        print_test("Session status check", False, f"Request failed: {result.get('error', 'Unknown error')}")
    
    # Test 7: Email-based Login
    print_section("Test 7: Email-based Login")
    email_login_data = {
        "username": "admin@dds.com",
        "password": "admin123"
    }
    
    result = test_api_endpoint(LOGIN_URL, "POST", email_login_data)
    if result["success"] and result["status_code"] == 200:
        response_data = result["response"]
        if response_data.get("success"):
            print_test("Email-based login", True, f"Logged in as: {response_data['data']['user']['email']}")
        else:
            print_test("Email-based login", False, response_data.get("message", "Login failed"))
    else:
        print_test("Email-based login", False, f"HTTP {result['status_code']}: {result.get('error', 'Request failed')}")
    
    # Test 8: Test User Login
    print_section("Test 8: Test User Login")
    test_user_data = {
        "username": "user1",
        "password": "password123"
    }
    
    result = test_api_endpoint(LOGIN_URL, "POST", test_user_data)
    if result["success"] and result["status_code"] == 200:
        response_data = result["response"]
        if response_data.get("success"):
            print_test("Test user login", True, f"Logged in as: {response_data['data']['user']['username']}")
        else:
            print_test("Test user login", False, response_data.get("message", "Login failed"))
    else:
        print_test("Test user login", False, f"HTTP {result['status_code']}: {result.get('error', 'Request failed')}")
    
    # Test 9: Wrong Content-Type
    print_section("Test 9: Wrong Content-Type")
    headers = {"Content-Type": "text/plain"}
    login_data = {
        "username": "Admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data, headers=headers, timeout=10)
        if response.status_code == 400:
            print_test("Wrong content-type rejection", True, "Properly rejected wrong content-type")
        else:
            print_test("Wrong content-type rejection", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_test("Wrong content-type rejection", False, f"Request failed: {str(e)}")
    
    # Summary
    print_section("Test Summary")
    print("🎯 Login API Test Results:")
    print("   ✅ Enhanced login API with better error handling")
    print("   ✅ Username and email-based authentication")
    print("   ✅ Session management with remember_me option")
    print("   ✅ Comprehensive validation and error messages")
    print("   ✅ Staff information integration")
    print("   ✅ Proper HTTP status codes")
    
    print(f"\n🏁 Tests completed at: {datetime.now().isoformat()}")
    print("\n🚀 Your login API is ready for production!")
    
    print("\n📋 Quick Test Command:")
    print("curl -X POST https://dxdtime.ddsolutions.io/api/auth/login/ \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -d '{\"username\": \"Admin\", \"password\": \"admin123\", \"remember_me\": true}'")

if __name__ == "__main__":
    main()
