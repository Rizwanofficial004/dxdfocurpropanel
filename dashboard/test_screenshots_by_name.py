#!/usr/bin/env python3
"""
Test script for enhanced Screenshots by User API with name-based search
Tests email, username, and name (first/last/full) searches
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
SCREENSHOTS_USER_URL = f"{BASE_URL}/api/screenshots/user/"

# Test credentials
TEST_EMAIL = "admin@example.com"
TEST_PASSWORD = "admin123"

def print_separator(title=""):
    print("\n" + "="*80)
    if title:
        print(f" {title} ")
        print("="*80)

def print_response(response, title=""):
    """Pretty print API response"""
    if title:
        print(f"\n--- {title} ---")
    
    print(f"Status Code: {response.status_code}")
    print(f"URL: {response.url}")
    
    try:
        data = response.json()
        print("Response:")
        print(json.dumps(data, indent=2))
        return data
    except:
        print(f"Raw Response: {response.text}")
        return None

def get_auth_headers():
    """Login and get authentication headers"""
    print_separator("AUTHENTICATION")
    
    login_data = {
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    response = requests.post(LOGIN_URL, json=login_data)
    data = print_response(response, "Login Response")
    
    if response.status_code == 200 and data and data.get('success'):
        token = data.get('data', {}).get('token')
        if token:
            print(f"✅ Login successful! Token: {token[:20]}...")
            return {"Authorization": f"Bearer {token}"}
    
    print("❌ Login failed!")
    return None

def test_screenshots_search(headers, search_term, expected_description=""):
    """Test screenshots search with different user identifiers"""
    print(f"\n🔍 Testing search: '{search_term}' {expected_description}")
    
    params = {
        "user": search_term,
        "limit": 5,
        "page": 1
    }
    
    response = requests.get(SCREENSHOTS_USER_URL, params=params, headers=headers)
    data = print_response(response, f"Search: {search_term}")
    
    if response.status_code == 200 and data and data.get('success'):
        user_info = data.get('data', {}).get('user_info', {})
        search_info = data.get('data', {}).get('search_info', {})
        screenshots = data.get('data', {}).get('screenshots', [])
        
        print(f"✅ Found user: {user_info.get('display_name')} ({user_info.get('email')})")
        print(f"   Search method: {search_info.get('search_method')}")
        print(f"   Screenshots found: {len(screenshots)}")
        
        return True
    else:
        print(f"❌ Search failed for '{search_term}'")
        return False

def test_all_search_methods():
    """Test all different search methods"""
    headers = get_auth_headers()
    if not headers:
        print("Cannot proceed without authentication")
        return
    
    print_separator("TESTING ENHANCED SCREENSHOTS SEARCH")
    
    # Test cases - modify these based on your actual data
    test_cases = [
        # Email searches
        ("admin@example.com", "(by email)"),
        ("test@example.com", "(by email - may not exist)"),
        
        # Username searches  
        ("admin", "(by username)"),
        ("testuser", "(by username - may not exist)"),
        
        # Name searches - First Name
        ("John", "(by first name)"),
        ("Admin", "(by first name)"),
        ("Test", "(by first name)"),
        
        # Name searches - Last Name
        ("Doe", "(by last name)"),
        ("User", "(by last name)"),
        ("Smith", "(by last name)"),
        
        # Name searches - Full Name
        ("John Doe", "(by full name)"),
        ("Admin User", "(by full name)"),
        ("Test User", "(by full name)"),
        
        # Partial name searches
        ("Joh", "(by partial first name)"),
        ("Do", "(by partial last name)"),
        
        # Case insensitive searches
        ("john", "(by lowercase first name)"),
        ("ADMIN", "(by uppercase name)"),
        
        # Non-existent searches
        ("NonExistentUser", "(should not exist)"),
        ("fake@email.com", "(fake email)"),
    ]
    
    successful_searches = 0
    total_searches = len(test_cases)
    
    for search_term, description in test_cases:
        success = test_screenshots_search(headers, search_term, description)
        if success:
            successful_searches += 1
    
    print_separator("TEST SUMMARY")
    print(f"Successful searches: {successful_searches}/{total_searches}")
    print(f"Success rate: {(successful_searches/total_searches)*100:.1f}%")
    
    # Test with additional parameters
    print_separator("TESTING WITH FILTERS")
    
    # Test with filters (using a known working search term)
    test_with_filters(headers, "admin", {
        "status": "Online",
        "limit": 3,
        "page": 1
    })

def test_with_filters(headers, search_term, filters):
    """Test search with additional filters"""
    print(f"\n🔍 Testing '{search_term}' with filters: {filters}")
    
    params = {"user": search_term}
    params.update(filters)
    
    response = requests.get(SCREENSHOTS_USER_URL, params=params, headers=headers)
    data = print_response(response, f"Filtered Search: {search_term}")
    
    if response.status_code == 200 and data and data.get('success'):
        filters_applied = data.get('data', {}).get('filters_applied', {})
        summary = data.get('data', {}).get('summary', {})
        print(f"✅ Filters applied: {filters_applied}")
        print(f"   Summary: {summary}")
    else:
        print(f"❌ Filtered search failed")

def get_sample_users():
    """Get sample users from the users API to test with real data"""
    headers = get_auth_headers()
    if not headers:
        return []
    
    try:
        # Try to get users from the suggestions API
        suggestions_url = f"{BASE_URL}/api/users/suggestions/"
        params = {"q": "a", "limit": 5}  # Get users starting with 'a'
        
        response = requests.get(suggestions_url, params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                users = data.get('data', {}).get('suggestions', [])
                print(f"\n📋 Found {len(users)} sample users for testing:")
                for user in users:
                    print(f"   - {user.get('display_name')} ({user.get('email')})")
                return users
    except:
        pass
    
    return []

def main():
    print_separator("ENHANCED SCREENSHOTS API TEST")
    print(f"Testing enhanced name-based search functionality")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Get sample users first
    sample_users = get_sample_users()
    
    # Run all tests
    test_all_search_methods()
    
    # Test with real users if available
    if sample_users:
        print_separator("TESTING WITH REAL USERS")
        headers = get_auth_headers()
        if headers:
            for user in sample_users[:3]:  # Test first 3 users
                email = user.get('email', '')
                name = user.get('display_name', '')
                
                if email:
                    test_screenshots_search(headers, email, "(real user - by email)")
                if name and name != email:
                    test_screenshots_search(headers, name, "(real user - by name)")
    
    print_separator("TEST COMPLETED")

if __name__ == "__main__":
    main()
