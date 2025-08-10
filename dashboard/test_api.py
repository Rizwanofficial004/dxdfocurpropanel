#!/usr/bin/env python3
"""
API Test Script for DDS Focus Time Application

This script demonstrates how to use the professional APIs.
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"  # Change this to your server URL
TEST_EMAIL = "admin@example.com"  # UPDATE THIS with a real user email
TEST_PASSWORD = "admin123"        # UPDATE THIS with the real password

# Session to maintain cookies
session = requests.Session()

def print_response(response, title):
    """Pretty print API response"""
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    print(f"Status Code: {response.status_code}")
    print("Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)

def test_login():
    """Test the login API"""
    print("\n🔐 Testing Login API...")
    
    login_data = {
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    response = session.post(
        f"{BASE_URL}/auth/login/",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print_response(response, "LOGIN API TEST")
    return response.status_code == 200

def test_screenshots():
    """Test the screenshots API"""
    print("\n📸 Testing Screenshots API...")
    
    # Test GET request
    response = session.get(f"{BASE_URL}/screenshots/?limit=5&page=1")
    print_response(response, "SCREENSHOTS API - GET TEST")
    
    # Test POST request with filters
    screenshots_data = {
        "email": TEST_EMAIL,
        "date": "2025-01-15",
        "limit": 10,
        "page": 1
    }
    
    response = session.post(
        f"{BASE_URL}/screenshots/",
        json=screenshots_data,
        headers={"Content-Type": "application/json"}
    )
    print_response(response, "SCREENSHOTS API - POST TEST")

def test_logs():
    """Test the logs API"""
    print("\n📝 Testing Logs API...")
    
    # Test GET request
    response = session.get(f"{BASE_URL}/logs/?limit=5&page=1")
    print_response(response, "LOGS API - GET TEST")
    
    # Test POST request - Create a log
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
        f"{BASE_URL}/logs/",
        json=log_data,
        headers={"Content-Type": "application/json"}
    )
    print_response(response, "LOGS API - POST TEST")

def test_error_handling():
    """Test error handling"""
    print("\n❌ Testing Error Handling...")
    
    # Test invalid login
    invalid_login = {
        "username": "invalid@example.com",
        "password": "wrongpassword"
    }
    
    response = session.post(
        f"{BASE_URL}/auth/login/",
        json=invalid_login,
        headers={"Content-Type": "application/json"}
    )
    print_response(response, "INVALID LOGIN TEST")
    
    # Test missing required fields
    incomplete_log = {
        "email": TEST_EMAIL,
        # Missing staffid, jsonlog, date
    }
    
    response = session.post(
        f"{BASE_URL}/logs/",
        json=incomplete_log,
        headers={"Content-Type": "application/json"}
    )
    print_response(response, "INCOMPLETE LOG DATA TEST")

def test_validation():
    """Test input validation"""
    print("\n✅ Testing Input Validation...")
    
    # Test invalid email format
    invalid_email_login = {
        "username": "invalid-email",
        "password": "password123"
    }
    
    response = session.post(
        f"{BASE_URL}/auth/login/",
        json=invalid_email_login,
        headers={"Content-Type": "application/json"}
    )
    print_response(response, "INVALID EMAIL FORMAT TEST")
    
    # Test invalid date format
    invalid_date_screenshots = {
        "email": TEST_EMAIL,
        "date": "invalid-date",
        "limit": 10,
        "page": 1
    }
    
    response = session.post(
        f"{BASE_URL}/screenshots/",
        json=invalid_date_screenshots,
        headers={"Content-Type": "application/json"}
    )
    print_response(response, "INVALID DATE FORMAT TEST")

def main():
    """Run all API tests"""
    print("🚀 Starting API Tests for DDS Focus Time Application")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Email: {TEST_EMAIL}")
    
    # Test login first
    login_success = test_login()
    
    if login_success:
        print("✅ Login successful, proceeding with authenticated tests...")
        test_screenshots()
        test_logs()
    else:
        print("❌ Login failed, skipping authenticated tests...")
    
    # Test error handling (doesn't require authentication)
    test_error_handling()
    test_validation()
    
    print("\n🎉 API Testing Complete!")
    print("\nNext Steps:")
    print("1. Update TEST_EMAIL and TEST_PASSWORD with valid credentials")
    print("2. Ensure your Django server is running on the specified BASE_URL")
    print("3. Check that you have proper user accounts set up")
    print("4. Review the API responses to understand the data structure")

if __name__ == "__main__":
    main()
