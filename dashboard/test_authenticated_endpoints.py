#!/usr/bin/env python3
"""
Test script for authenticated endpoints in the Django Employee Monitoring API
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
LOGIN_URL = f"{BASE_URL}/auth/login/"

# Test credentials (from the existing data)
test_credentials = [
    {"username": "amirishaque67@gmail.com", "password": "test123"},
    {"username": "haseeb.developer@gmail.com", "password": "test123"},
    {"username": "deniz@gmail.com", "password": "test123"},
    {"username": "admin", "password": "admin"},
]

def print_header(title):
    print("=" * 60)
    print(f"🔐 {title.upper()}")
    print("=" * 60)

def print_test(endpoint, description=""):
    print(f"📡 Testing: {endpoint}")
    if description:
        print(f"   Description: {description}")
    print("-" * 60)

def print_result(response, start_time):
    end_time = time.time()
    duration = (end_time - start_time) * 1000
    
    if response.status_code == 200:
        print(f"✅ Status: {response.status_code} | Time: {duration:.2f}ms")
        try:
            data = response.json()
            if 'message' in data:
                print(f"   Message: {data['message']}")
            if 'data' in data and isinstance(data['data'], dict):
                if 'count' in data['data']:
                    print(f"   📊 Count: {data['data']['count']}")
                if 'results' in data['data'] and isinstance(data['data']['results'], list):
                    print(f"   📄 Results: {len(data['data']['results'])} items")
        except:
            print(f"   📄 Response length: {len(response.text)} chars")
    else:
        print(f"❌ Status: {response.status_code} | Time: {duration:.2f}ms")
        try:
            error_data = response.json()
            print(f"   ❌ Error: {error_data}")
        except:
            print(f"   ❌ Error: {response.text[:200]}...")

def attempt_login():
    """Try to log in with test credentials"""
    print_header("Authentication Test")
    
    session = requests.Session()
    
    for creds in test_credentials:
        print_test(LOGIN_URL, f"Login attempt: {creds['username']}")
        start_time = time.time()
        
        try:
            response = session.post(LOGIN_URL, json=creds)
            print_result(response, start_time)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success', False):
                    print(f"🎉 Successfully logged in as: {creds['username']}")
                    # Get token if available
                    if 'data' in data and 'token' in data['data']:
                        token = data['data']['token']
                        session.headers.update({'Authorization': f'Bearer {token}'})
                    return session, creds['username']
        except Exception as e:
            print(f"   ❌ Connection error: {e}")
        
        print()
    
    print("❌ All login attempts failed. Testing without authentication...")
    return session, None

def test_authenticated_endpoints(session, username):
    """Test endpoints that require authentication"""
    print_header("Authenticated Endpoints Test")
    
    endpoints = [
        ("/screenshots/?limit=5", "General screenshots API"),
        ("/logs/?limit=5", "General logs API"),
        (f"/users/{username}/screenshots/", "User-specific screenshots"),
        (f"/users/{username}/logs/", "User-specific logs"),
        (f"/dashboard/data/?user={username}", "Dashboard analytics data"),
    ]
    
    for endpoint, description in endpoints:
        print_test(endpoint, description)
        start_time = time.time()
        
        try:
            response = session.get(f"{BASE_URL}{endpoint}")
            print_result(response, start_time)
        except Exception as e:
            print(f"   ❌ Connection error: {e}")
        
        print()

def test_public_endpoints():
    """Test public endpoints that don't require authentication"""
    print_header("Public Endpoints Test")
    
    endpoints = [
        ("/test/", "API health check"),
        ("/employee-cards/?limit=3", "Employee cards (limited)"),
        ("/users/search/?q=amir", "User search"),
        ("/users/suggestions/?q=dev", "User suggestions"),
    ]
    
    for endpoint, description in endpoints:
        print_test(endpoint, description)
        start_time = time.time()
        
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print_result(response, start_time)
        except Exception as e:
            print(f"   ❌ Connection error: {e}")
        
        print()

def main():
    print_header("Django Employee Monitoring API - Authentication Test")
    print(f"🌐 Testing API Base: {BASE_URL}")
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test public endpoints first
    test_public_endpoints()
    
    # Attempt login and test authenticated endpoints
    session, username = attempt_login()
    
    if username:
        test_authenticated_endpoints(session, username)
    else:
        print("⚠️  Skipping authenticated endpoint tests due to login failure")
    
    print_header("Test Complete")
    print(f"🕒 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
