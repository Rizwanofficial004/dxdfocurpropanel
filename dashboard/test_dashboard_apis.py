#!/usr/bin/env python3
"""
Test script for Dashboard Data APIs
Test retrieving dashboard data by username or email
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://127.0.0.1:8000"
DASHBOARD_API_URL = f"{BASE_URL}/api/dashboard/data/"
USER_SEARCH_URL = f"{BASE_URL}/api/users/search/"

# New APIs for user suggestions and screenshots
USER_SUGGESTIONS_URL = f"{BASE_URL}/api/users/suggestions/"
SCREENSHOTS_BY_USER_URL = f"{BASE_URL}/api/screenshots/user/"
USER_DASHBOARD_DATA_URL = f"{BASE_URL}/api/dashboard/user-data/"

# Test users (update these with your actual usernames/emails)
TEST_USERS = [
    "admin",  # Username
    "haseebcodejourney@gmail.com",  # Email
    "Admin"   # Another username
]

def test_user_search(search_term):
    """Test user search API"""
    print(f"\n🔍 Searching for users: '{search_term}'")
    
    params = {"q": search_term}
    response = requests.get(USER_SEARCH_URL, params=params)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        users = data.get('data', {}).get('users', [])
        print(f"✅ Found {len(users)} users:")
        
        for user in users[:3]:  # Show first 3
            print(f"  - {user.get('display_name', '')} ({user.get('username', '')}) - {user.get('email', '')}")
        
        return users
    else:
        print(f"❌ Search failed: {response.text}")
        return []

def test_dashboard_data(user_identifier):
    """Test dashboard data API"""
    print(f"\n📊 Getting dashboard data for: {user_identifier}")
    
    # Test GET request
    params = {
        "user": user_identifier,
        "limit": 10,
        "page": 1,
        "include_screenshots": "true",
        "include_logs": "true"
    }
    
    response = requests.get(DASHBOARD_API_URL, params=params)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        if data.get('success'):
            user_info = data.get('data', {}).get('user_info', {})
            dashboard_data = data.get('data', {}).get('dashboard_data', {})
            
            print(f"✅ Dashboard data retrieved successfully!")
            print(f"User: {user_info.get('username', '')} ({user_info.get('email', '')})")
            
            # Screenshots info
            screenshots = dashboard_data.get('screenshots', [])
            print(f"📸 Screenshots: {len(screenshots)} found")
            
            if screenshots:
                print("   Sample screenshots:")
                for i, screenshot in enumerate(screenshots[:3]):
                    print(f"   {i+1}. {screenshot.get('task_name', '')} - {screenshot.get('status', '')} - {screenshot.get('time_display', '')}")
            
            # Logs info
            logs = dashboard_data.get('activity_logs', [])
            print(f"📝 Activity Logs: {len(logs)} found")
            
            if logs:
                print("   Recent logs:")
                for i, log in enumerate(logs[:2]):
                    print(f"   {i+1}. Staff ID: {log.get('staff_id', '')} - Date: {log.get('date', '')}")
            
            # Summary
            summary = dashboard_data.get('summary', {})
            print(f"📊 Summary:")
            print(f"   Total Screenshots: {summary.get('total_screenshots', 0)}")
            print(f"   Total Logs: {summary.get('total_logs', 0)}")
            print(f"   Screenshots Today: {summary.get('screenshots_today', 0)}")
            
            return True
        else:
            print(f"❌ API returned error: {data.get('message', '')}")
            return False
    else:
        print(f"❌ Request failed: {response.text}")
        return False

def test_dashboard_data_post(user_identifier):
    """Test dashboard data API with POST method"""
    print(f"\n📋 Testing POST request for: {user_identifier}")
    
    payload = {
        "user": user_identifier,
        "limit": 5,
        "page": 1,
        "include_screenshots": True,
        "include_logs": True,
        "date": "2025-07-05"  # Today's date
    }
    
    headers = {"Content-Type": "application/json"}
    response = requests.post(DASHBOARD_API_URL, json=payload, headers=headers)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print("✅ POST request successful!")
            dashboard_data = data.get('data', {}).get('dashboard_data', {})
            print(f"Screenshots: {len(dashboard_data.get('screenshots', []))}")
            print(f"Logs: {len(dashboard_data.get('activity_logs', []))}")
            return True
    
    print(f"❌ POST request failed: {response.text}")
    return False

def test_user_suggestions(search_term):
    """Test user suggestions API (like Google autocomplete)"""
    print(f"\n💡 Getting user suggestions for: '{search_term}'")
    
    params = {"q": search_term, "limit": 5}
    response = requests.get(USER_SUGGESTIONS_URL, params=params)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        suggestions = data.get('data', {}).get('suggestions', [])
        print(f"✅ Found {len(suggestions)} suggestions:")
        
        for suggestion in suggestions:
            print(f"  📝 {suggestion.get('suggestion_text', '')} - {suggestion.get('last_activity', '')}")
        
        return suggestions
    else:
        print(f"❌ Suggestions failed: {response.text}")
        return []

def test_screenshots_by_user(user_identifier):
    """Test screenshots by user API"""
    print(f"\n📸 Getting screenshots for user: {user_identifier}")
    
    params = {
        "user": user_identifier,
        "limit": 6,  # Match your dashboard showing 6 items
        "page": 1
    }
    
    response = requests.get(SCREENSHOTS_BY_USER_URL, params=params)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        if data.get('success'):
            user_info = data.get('data', {}).get('user_info', {})
            screenshots = data.get('data', {}).get('screenshots', [])
            pagination = data.get('data', {}).get('pagination', {})
            
            print(f"✅ Screenshots retrieved successfully!")
            print(f"User: {user_info.get('display_name', '')} ({user_info.get('email', '')})")
            print(f"📸 Found {len(screenshots)} screenshots (Page {pagination.get('current_page', 1)} of {pagination.get('total_pages', 1)})")
            
            if screenshots:
                print("   Screenshots:")
                for i, screenshot in enumerate(screenshots):
                    print(f"   {i+1}. {screenshot.get('task_name', '')} - Status: {screenshot.get('status', '')} - Time: {screenshot.get('time_display', '')}")
            
            return True
        else:
            print(f"❌ API returned error: {data.get('message', '')}")
            return False
    else:
        print(f"❌ Request failed: {response.text}")
        return False

def test_user_dashboard_complete(user_identifier):
    """Test complete user dashboard API"""
    print(f"\n🎯 Getting complete dashboard data for: {user_identifier}")
    
    params = {
        "user": user_identifier,
        "include_screenshots": "true",
        "include_summary": "true",
        "limit": 6,
        "page": 1
    }
    
    response = requests.get(USER_DASHBOARD_DATA_URL, params=params)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        if data.get('success'):
            user_info = data.get('data', {}).get('user_info', {})
            screenshots_data = data.get('data', {}).get('screenshots', {})
            summary = data.get('data', {}).get('summary', {})
            
            print(f"✅ Complete dashboard data retrieved!")
            print(f"👤 User: {user_info.get('display_name', '')} ({user_info.get('username', '')})")
            print(f"📧 Email: {user_info.get('email', '')}")
            print(f"🔧 Role: {'Staff' if user_info.get('is_staff') else 'User'}")
            
            # Screenshots summary
            screenshots = screenshots_data.get('screenshots', [])
            pagination = screenshots_data.get('pagination', {})
            print(f"📸 Screenshots: {len(screenshots)} shown, {pagination.get('total_count', 0)} total")
            
            # Overall summary
            print(f"📊 Summary:")
            print(f"   Total Screenshots: {summary.get('total_screenshots', 0)}")
            print(f"   Today's Screenshots: {summary.get('screenshots_today', 0)}")
            print(f"   Account Status: {summary.get('account_status', 'Unknown')}")
            
            return True
        else:
            print(f"❌ API returned error: {data.get('message', '')}")
            return False
    else:
        print(f"❌ Request failed: {response.text}")
        return False

def main():
    print("🧪 Testing Dashboard Data APIs")
    print("=" * 50)
    
    # Test 1: User Search
    print("\n" + "="*20 + " USER SEARCH TESTS " + "="*20)
    all_users = []
    for search_term in ["admin", "haseeb", "@gmail.com"]:
        users = test_user_search(search_term)
        all_users.extend(users)
    
    # Test 2: Dashboard Data with different users
    print("\n" + "="*20 + " DASHBOARD DATA TESTS " + "="*20)
    test_users = TEST_USERS.copy()
    
    # Add users found from search
    if all_users:
        test_users.extend([user.get('username') for user in all_users[:2]])
        test_users.extend([user.get('email') for user in all_users[:2]])
    
    # Remove duplicates
    test_users = list(set([user for user in test_users if user]))
    
    success_count = 0
    for user in test_users[:4]:  # Test first 4 users
        if test_dashboard_data(user):
            success_count += 1
    
    # Test 3: POST request
    print("\n" + "="*20 + " POST REQUEST TESTS " + "="*20)
    if test_users:
        test_dashboard_data_post(test_users[0])
    
    # Test 4: User Suggestions
    print("\n" + "="*20 + " USER SUGGESTIONS TESTS " + "="*20)
    for search_term in ["admin", "aseeb", "john"]:
        test_user_suggestions(search_term)
    
    # Test 5: Screenshots by User
    print("\n" + "="*20 + " SCREENSHOTS BY USER TESTS " + "="*20)
    for user in test_users[:3]:  # Test first 3 users
        test_screenshots_by_user(user)
    
    # Test 6: Complete User Dashboard
    print("\n" + "="*20 + " COMPLETE USER DASHBOARD TESTS " + "="*20)
    for user in test_users[:3]:  # Test first 3 users
        test_user_dashboard_complete(user)
    
    print(f"\n✅ Tests completed! {success_count}/{len(test_users[:4])} dashboard requests successful")
    
    if success_count == 0:
        print("\n⚠️  No successful requests. Check if:")
        print("   1. Django server is running")
        print("   2. Users exist in database")
        print("   3. API endpoints are correctly configured")

if __name__ == "__main__":
    main()
