#!/usr/bin/env python3
"""
Complete API Test Suite for Django Employee Monitoring System
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"

def print_header(title):
    print("=" * 80)
    print(f"🚀 {title.upper()}")
    print("=" * 80)

def print_test(endpoint, description=""):
    print(f"📡 Testing: {endpoint}")
    if description:
        print(f"   📝 {description}")
    print("-" * 80)

def print_result(response, start_time):
    end_time = time.time()
    duration = (end_time - start_time) * 1000
    
    if response.status_code == 200:
        print(f"✅ Status: {response.status_code} | Time: {duration:.2f}ms")
        try:
            data = response.json()
            if 'message' in data:
                print(f"   💬 Message: {data['message']}")
            
            if 'data' in data and isinstance(data['data'], dict):
                # Check for employee cards
                if 'employee_cards' in data['data']:
                    cards = data['data']['employee_cards']
                    print(f"   👥 Employee Cards: {len(cards)}")
                    if cards:
                        sample = cards[0]
                        print(f"   👤 Sample: {sample.get('name', 'N/A')} ({sample.get('email', 'N/A')})")
                        print(f"   📸 Has Screenshot: {sample.get('screenshot', {}).get('has_screenshot', False)}")
                        print(f"   📊 Screenshots Count: {sample.get('productivity', {}).get('screenshots_count', 0)}")
                
                # Check for pagination
                if 'pagination' in data['data']:
                    pagination = data['data']['pagination']
                    total = pagination.get('total_employees', pagination.get('total_count', 'N/A'))
                    print(f"   📄 Total Items: {total}")
                
                # Check for users/suggestions
                if 'users' in data['data']:
                    users = data['data']['users']
                    print(f"   👥 Users Found: {len(users)}")
                elif 'suggestions' in data['data']:
                    suggestions = data['data']['suggestions']
                    print(f"   💡 Suggestions: {len(suggestions)}")
                
        except Exception as e:
            print(f"   📄 Response length: {len(response.text)} chars")
    else:
        print(f"❌ Status: {response.status_code} | Time: {duration:.2f}ms")
        try:
            error_data = response.json()
            print(f"   ❌ Error: {error_data.get('message', 'Unknown error')}")
        except:
            print(f"   ❌ Raw Error: {response.text[:200]}...")

def test_employee_cards_endpoints():
    """Test all employee cards related endpoints"""
    print_header("Employee Cards API Tests")
    
    endpoints = [
        # Basic employee cards
        ("/employee-cards/", "Basic employee cards - should show ALL screenshots"),
        
        # Date range filters
        ("/employee-cards/?date_range=all", "All time filter - should show ALL screenshots"),
        ("/employee-cards/?date_range=today", "Today's screenshots only"),
        ("/employee-cards/?date_range=week", "This week's screenshots"),
        ("/employee-cards/?date_range=month", "This month's screenshots"),
        ("/employee-cards/?date_range=year", "This year's screenshots"),
        
        # Employee filters
        ("/employee-cards/?employee_filter=all", "All employees filter"),
        ("/employee-cards/?employee_filter=all&date_range=all", "All employees, all time"),
        
        # Your specific request
        ("/employee-cards/?employee_filter=all&date_range=month", "Your specific URL"),
        
        # Search functionality
        ("/employee-cards/?search_name=amir", "Search by name 'amir'"),
        ("/employee-cards/?search_name=developer", "Search by 'developer'"),
        
        # Pagination
        ("/employee-cards/?limit=2", "Limited to 2 results"),
        ("/employee-cards/?limit=50", "Show up to 50 employees"),
        
        # Combined filters
        ("/employee-cards/?employee_filter=all&date_range=all&limit=10", "Combined: all employees, all time, limit 10"),
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

def test_other_endpoints():
    """Test other important endpoints"""
    print_header("Other Important API Tests")
    
    endpoints = [
        ("/test/", "API Health Check"),
        ("/users/search/?q=amir", "User Search"),
        ("/users/suggestions/?q=dev", "User Suggestions"),
        ("/users/suggestions/?q=am", "User Suggestions for 'am'"),
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

def test_specific_user_data():
    """Test getting data for specific users"""
    print_header("Specific User Data Tests")
    
    # Get user emails from the database first
    user_emails = [
        "deniz@dxdglobal.com",
        "haseebcodejourney@gmail.com", 
        "atakankahraman35@outlook.com",
        "amirishaque67@gmail.com"
    ]
    
    for email in user_emails:
        print_test(f"/dashboard/data/?user={email}", f"Dashboard data for {email}")
        start_time = time.time()
        
        try:
            response = requests.get(f"{BASE_URL}/dashboard/data/?user={email}")
            print_result(response, start_time)
        except Exception as e:
            print(f"   ❌ Connection error: {e}")
        
        print()

def main():
    print_header(f"Complete API Test Suite - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Base URL: {BASE_URL}")
    print()
    
    # Wait a moment for server to be ready
    time.sleep(3)
    
    # Test employee cards (main focus)
    test_employee_cards_endpoints()
    
    # Test other endpoints
    test_other_endpoints()
    
    # Test specific user data
    test_specific_user_data()
    
    print_header("Test Summary")
    print("🎯 **KEY ENDPOINTS FOR YOUR FRONTEND:**")
    print()
    print("📋 **MAIN ENDPOINT (Shows ALL screenshots without filtering):**")
    print("   🔗 GET /api/employee-cards/")
    print("   🔗 GET /api/employee-cards/?date_range=all")
    print()
    print("📋 **YOUR SPECIFIC REQUEST:**")
    print("   🔗 GET /api/employee-cards/?employee_filter=all&date_range=month")
    print()
    print("📋 **SHOW ALL SCREENSHOTS (No Date Filter):**")
    print("   🔗 GET /api/employee-cards/?employee_filter=all&date_range=all")
    print("   🔗 GET /api/employee-cards/?limit=50")
    print()
    print("📋 **OTHER USEFUL ENDPOINTS:**")
    print("   🔗 GET /api/users/search/?q=search_term")
    print("   🔗 GET /api/users/suggestions/?q=search_term") 
    print("   🔗 GET /api/dashboard/data/?user=email@example.com")
    print()
    print(f"🕒 Tests completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
