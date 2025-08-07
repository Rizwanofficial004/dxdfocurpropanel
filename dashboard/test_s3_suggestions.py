#!/usr/bin/env python3
"""
S3 User Suggestions API Test
===========================

This script tests the new S3-based user suggestions API that provides
autocomplete/dropdown suggestions for the screenshot search feature.

Usage:
    python test_s3_suggestions.py
    python test_s3_suggestions.py search Haseeb
    python test_s3_suggestions.py all
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
S3_SUGGESTIONS_URL = f"{BASE_URL}/api/users/s3-suggestions/"

def test_no_search():
    """Test getting all S3 users (no search term)"""
    print("🔍 TEST 1: Get All S3 Users (No Search)")
    print("=" * 50)
    
    params = {
        'limit': 10
    }
    
    print(f"URL: {S3_SUGGESTIONS_URL}")
    print(f"Parameters: {params}")
    print()
    
    try:
        response = requests.get(S3_SUGGESTIONS_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                suggestions = data.get('data', {}).get('suggestions', [])
                metadata = data.get('data', {}).get('metadata', {})
                
                print(f"✅ Success!")
                print(f"   Total S3 Users: {metadata.get('total_s3_users', 0)}")
                print(f"   Suggestions Returned: {len(suggestions)}")
                print()
                
                print("📋 Top Users:")
                for i, user in enumerate(suggestions[:5], 1):
                    print(f"   {i}. {user['display_name']}")
                    print(f"      Email: {user['email']}")
                    print(f"      Screenshots: {user['screenshot_count']:,}")
                    print(f"      Staff ID: {user['staff_id']}")
                    print()
                    
            else:
                print(f"❌ API Error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print()

def test_search_suggestions(search_term):
    """Test searching for specific users"""
    print(f"🔍 TEST 2: Search for '{search_term}'")
    print("=" * 50)
    
    params = {
        'q': search_term,
        'limit': 8
    }
    
    print(f"URL: {S3_SUGGESTIONS_URL}")
    print(f"Parameters: {params}")
    print()
    
    try:
        response = requests.get(S3_SUGGESTIONS_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                suggestions = data.get('data', {}).get('suggestions', [])
                metadata = data.get('data', {}).get('metadata', {})
                
                print(f"✅ Success!")
                print(f"   Search Term: {metadata.get('search_term')}")
                print(f"   Matches Found: {len(suggestions)}")
                print()
                
                if suggestions:
                    print("🎯 Search Results:")
                    for i, user in enumerate(suggestions, 1):
                        print(f"   {i}. {user['display_name']}")
                        print(f"      Email: {user['email']}")
                        print(f"      Screenshots: {user['screenshot_count']:,}")
                        print(f"      Relevance: {user['relevance_score']}")
                        print(f"      Search Value: {user['search_value']}")
                        print()
                else:
                    print("❌ No matches found")
                    
            else:
                print(f"❌ API Error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print()

def test_integration_example():
    """Test how this would be used with screenshot search API"""
    print("🔗 TEST 3: Integration with Screenshot Search")
    print("=" * 50)
    
    # First get suggestions
    params = {'q': 'Has', 'limit': 3}
    
    try:
        response = requests.get(S3_SUGGESTIONS_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                suggestions = data.get('data', {}).get('suggestions', [])
                
                if suggestions:
                    # Use first suggestion in screenshot search
                    selected_user = suggestions[0]
                    search_value = selected_user['search_value']
                    
                    print(f"✅ Step 1: Got suggestions for 'Has'")
                    print(f"   Selected: {selected_user['display_name']}")
                    print(f"   Email: {search_value}")
                    print()
                    
                    # Now use this in screenshot search API
                    screenshot_url = f"{BASE_URL}/api/screenshots/search/"
                    screenshot_params = {
                        'search': search_value,
                        'limit': 10
                    }
                    
                    print(f"✅ Step 2: Using in screenshot search")
                    print(f"   URL: {screenshot_url}")
                    print(f"   Parameters: {screenshot_params}")
                    
                    screenshot_response = requests.get(screenshot_url, params=screenshot_params)
                    
                    if screenshot_response.status_code == 200:
                        screenshot_data = screenshot_response.json()
                        if screenshot_data.get('success'):
                            employees = screenshot_data.get('data', {}).get('employees', [])
                            summary = screenshot_data.get('data', {}).get('summary', {})
                            
                            print(f"   ✅ Found screenshots!")
                            print(f"   Employees: {summary.get('total_employees_found', 0)}")
                            print(f"   Screenshots: {summary.get('total_screenshots', 0)}")
                        else:
                            print(f"   ❌ Screenshot API Error: {screenshot_data.get('message')}")
                    else:
                        print(f"   ❌ Screenshot HTTP Error: {screenshot_response.status_code}")
                else:
                    print("❌ No suggestions found for integration test")
                    
    except Exception as e:
        print(f"❌ Integration Error: {str(e)}")
    
    print()

def main():
    print("🎯 S3 User Suggestions API - Complete Test Suite")
    print("================================================")
    print(f"Testing API: {S3_SUGGESTIONS_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "search" and len(sys.argv) > 2:
            search_term = sys.argv[2]
            test_search_suggestions(search_term)
        elif sys.argv[1] == "all":
            test_no_search()
        else:
            print("Usage: python test_s3_suggestions.py [search <term> | all]")
    else:
        # Run all tests
        test_no_search()
        test_search_suggestions("Haseeb")
        test_integration_example()
    
    print("🏁 Test completed!")
    print()
    print("💡 Frontend Usage:")
    print("   1. User types in search box")
    print("   2. Call /api/users/s3-suggestions/?q=<search_term>")
    print("   3. Show suggestions in dropdown")
    print("   4. User selects suggestion")
    print("   5. Use search_value in /api/screenshots/search/ API")

if __name__ == "__main__":
    main()
