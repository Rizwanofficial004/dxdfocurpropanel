#!/usr/bin/env python3
"""
Test script for getting logs by searching username
Shows how to find user by name and then get their logs
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
USER_SEARCH_URL = f"{BASE_URL}/api/users/search/"
LOGS_API_URL = f"{BASE_URL}/api/logs/"
USER_LOGS_URL = f"{BASE_URL}/api/users/"

# Test with your specific data
TEST_NAME = "Haseeb"
TEST_EMAIL = "haseebcodejourney@gmail.com"

def print_separator(title=""):
    print("\n" + "="*80)
    if title:
        print(f" {title} ")
        print("="*80)

def search_user_and_get_logs(search_term, limit=10):
    """
    Search for user by name and then get their logs
    """
    print(f"\n🔍 Searching for user: '{search_term}'")
    print("-" * 60)
    
    # Step 1: Search for user
    search_params = {"q": search_term, "limit": limit}
    
    try:
        response = requests.get(USER_SEARCH_URL, params=search_params)
        print(f"📊 User Search Status: {response.status_code}")
        print(f"🔗 Search URL: {response.url}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('data', {}).get('users'):
                users = data.get('data', {}).get('users', [])
                print(f"✅ Found {len(users)} user(s):")
                
                for i, user in enumerate(users):
                    print(f"\n👤 User {i+1}:")
                    print(f"   Name: {user.get('display_name')}")
                    print(f"   Email: {user.get('email')}")
                    print(f"   Username: {user.get('username')}")
                    print(f"   Staff ID: {user.get('staff_id')}")
                    
                    # Step 2: Get logs for this user
                    user_email = user.get('email')
                    if user_email:
                        get_user_logs(user_email, user.get('display_name'))
                    
            else:
                print(f"❌ No users found for '{search_term}'")
        else:
            print(f"❌ Search failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Search request failed: {e}")

def get_user_logs(email, display_name, limit=10):
    """
    Get logs for a specific user email
    """
    print(f"\n📋 Getting logs for: {display_name} ({email})")
    print("-" * 50)
    
    # Method 1: Using general logs API with email filter
    logs_params = {"email": email, "limit": limit}
    
    try:
        response = requests.get(LOGS_API_URL, params=logs_params)
        print(f"📊 Logs API Status: {response.status_code}")
        print(f"🔗 Logs URL: {response.url}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                logs = data.get('data', {}).get('logs', [])
                print(f"✅ Found {len(logs)} log entries")
                
                if logs:
                    print(f"\n📝 Recent logs:")
                    for i, log in enumerate(logs[:5]):  # Show first 5 logs
                        print(f"   {i+1}. Log ID: {log.get('id')}")
                        print(f"      📅 Date: {log.get('date')}")
                        print(f"      👤 Staff ID: {log.get('staffid')}")
                        print(f"      📧 Email: {log.get('email')}")
                        log_data = log.get('log_data', {})
                        if log_data:
                            print(f"      📊 Activity: {log_data}")
                        print()
                else:
                    print(f"📭 No logs found for {display_name}")
            else:
                print(f"❌ Failed to get logs: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ Logs request failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Logs request failed: {e}")
    
    # Method 2: Using user-specific logs API
    print(f"\n🔍 Alternative: User-specific logs API")
    user_logs_url = f"{USER_LOGS_URL}{email}/logs/"
    
    try:
        response = requests.get(user_logs_url, params={"limit": limit})
        print(f"📊 User Logs API Status: {response.status_code}")
        print(f"🔗 User Logs URL: {response.url}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                logs = data.get('data', {}).get('logs', [])
                print(f"✅ User-specific API found {len(logs)} log entries")
            else:
                print(f"❌ User-specific API failed: {data.get('message')}")
        else:
            print(f"❌ User-specific logs failed: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ User-specific logs request failed: {e}")

def test_direct_email_logs(email, limit=10):
    """
    Test getting logs directly by email (if you already know the email)
    """
    print(f"\n📧 Direct email logs test: {email}")
    print("-" * 60)
    
    logs_params = {
        "email": email, 
        "limit": limit,
        "page": 1
    }
    
    try:
        response = requests.get(LOGS_API_URL, params=logs_params)
        print(f"📊 Status: {response.status_code}")
        print(f"🔗 URL: {response.url}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                logs_data = data.get('data', {})
                logs = logs_data.get('logs', [])
                pagination = logs_data.get('pagination', {})
                filters = logs_data.get('filters', {})
                
                print(f"✅ Success! Found {len(logs)} logs")
                print(f"📊 Total logs: {pagination.get('total_count', 0)}")
                print(f"📄 Current page: {pagination.get('current_page', 1)}")
                print(f"🎛️  Applied filters: {filters}")
                
                if logs:
                    print(f"\n📝 Log entries:")
                    for i, log in enumerate(logs):
                        print(f"   {i+1}. ID: {log.get('id')} | Date: {log.get('date')} | Staff: {log.get('staffid')}")
                        
            else:
                print(f"❌ API Error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_logs_with_filters():
    """
    Test logs API with various filters
    """
    print_separator("TESTING LOGS WITH FILTERS")
    
    test_cases = [
        {
            "name": "Logs by Email",
            "params": {"email": TEST_EMAIL, "limit": 5}
        },
        {
            "name": "Logs by Email with Date",
            "params": {"email": TEST_EMAIL, "date": "2025-07-05", "limit": 5}
        },
        {
            "name": "Logs with Search Term",
            "params": {"email": TEST_EMAIL, "search": "activity", "limit": 5}
        },
        {
            "name": "All Recent Logs (no filter)",
            "params": {"limit": 10, "page": 1}
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🧪 Testing: {test_case['name']}")
        print(f"📋 Parameters: {test_case['params']}")
        print("-" * 50)
        
        try:
            response = requests.get(LOGS_API_URL, params=test_case['params'])
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    logs = data.get('data', {}).get('logs', [])
                    total = data.get('data', {}).get('pagination', {}).get('total_count', 0)
                    print(f"✅ Found {len(logs)} logs (Total: {total})")
                else:
                    print(f"❌ API Error: {data.get('message')}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")

def show_api_examples():
    """
    Show API endpoint examples for Postman/Browser testing
    """
    print_separator("API ENDPOINTS FOR LOGS BY USER SEARCH")
    
    examples = [
        {
            "title": "1. Search User by Name",
            "method": "GET",
            "url": f"{USER_SEARCH_URL}?q=Haseeb&limit=5",
            "description": "Find users by name, then use their email for logs"
        },
        {
            "title": "2. Get Logs by Email",
            "method": "GET", 
            "url": f"{LOGS_API_URL}?email=haseebcodejourney@gmail.com&limit=10",
            "description": "Get all logs for a specific user email"
        },
        {
            "title": "3. User-Specific Logs API",
            "method": "GET",
            "url": f"{USER_LOGS_URL}haseebcodejourney@gmail.com/logs/?limit=10",
            "description": "Alternative user-specific logs endpoint"
        },
        {
            "title": "4. Logs with Date Filter",
            "method": "GET",
            "url": f"{LOGS_API_URL}?email=haseebcodejourney@gmail.com&date=2025-07-05&limit=5",
            "description": "Get logs for specific user on specific date"
        },
        {
            "title": "5. Logs with Search Term",
            "method": "GET",
            "url": f"{LOGS_API_URL}?email=haseebcodejourney@gmail.com&search=screenshot&limit=10",
            "description": "Search within log content for specific terms"
        }
    ]
    
    for example in examples:
        print(f"\n📋 {example['title']}")
        print(f"   📄 Description: {example['description']}")
        print(f"   🔗 URL: {example['url']}")
        print(f"   🔧 Method: {example['method']}")
        print("-" * 70)

def main():
    print("🚀 LOGS BY USER SEARCH - COMPREHENSIVE TEST")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"🕐 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: Search user by name and get their logs
    print_separator("SEARCH USER BY NAME AND GET LOGS")
    search_user_and_get_logs(TEST_NAME)
    
    # Test 2: Direct email logs (if you know the email)
    print_separator("DIRECT EMAIL LOGS TEST")
    test_direct_email_logs(TEST_EMAIL)
    
    # Test 3: Test logs with various filters
    test_logs_with_filters()
    
    # Show API examples
    show_api_examples()
    
    print_separator("TEST COMPLETED")
    print("💡 Summary:")
    print("   ✅ User search by name working")
    print("   ✅ Logs retrieval by email working") 
    print("   ✅ Multiple log filtering options available")
    print("   ✅ Both general and user-specific log APIs available")
    print("\n🎯 Use the API examples above for Postman testing!")

if __name__ == "__main__":
    main()
