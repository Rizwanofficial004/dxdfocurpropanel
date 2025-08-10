#!/usr/bin/env python3
"""
Enhanced Test Script: Get All Screenshots for Any User
=====================================================

This script demonstrates the ENHANCED screenshots search API with:
✅ S3 Direct Scanning (finds ALL 29+ users, not just database users)
✅ 5000 Screenshot Limit (increased from 10)
✅ Enhanced Search Capabilities

Usage examples:
- python test_user_screenshots.py Haseeb
- python test_user_screenshots.py --all (show all 29+ users from S3)
- python test_user_screenshots.py --s3 Danish (find S3-only users)
- python test_user_screenshots.py --limit 5000 Amir (high limit test)
"""

import requests
import json
import sys
from datetime import datetime

# API Configuration
BASE_URL = "http://127.0.0.1:8000"
SCREENSHOTS_SEARCH_URL = f"{BASE_URL}/api/screenshots/search/"

def get_all_screenshots_for_user(search_term, limit=5000, use_s3=False):
    """
    Get all screenshots for a specific user (ENHANCED VERSION)
    
    Args:
        search_term: User's name, email, or part of either
        limit: Maximum number of screenshots to return (up to 5000)
        use_s3: Use S3 direct scanning to find users not in database
    
    Returns:
        Dictionary with user info and screenshots
    """
    params = {
        'search': search_term,
        'limit': limit
    }
    
    if use_s3:
        params['scan_s3'] = 'true'
    
    try:
        print(f"🔍 Searching for user: '{search_term}'")
        print(f"📡 API URL: {SCREENSHOTS_SEARCH_URL}")
        print(f"📋 Parameters: {params}")
        print(f"🌐 S3 Direct Scan: {'YES' if use_s3 else 'NO (Database only)'}")
        print(f"📈 Limit: {limit:,} screenshots")
        print("-" * 50)
        
        response = requests.get(SCREENSHOTS_SEARCH_URL, params=params)
        
        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        data = response.json()
        
        if not data.get('success'):
            print(f"❌ API returned error: {data.get('message')}")
            return None
        
        response_data = data.get('data', {})
        employees = response_data.get('employees', [])
        summary = response_data.get('summary', {})
        
        # Display results
        print(f"✅ {data.get('message')}")
        print()
        
        print("📊 ENHANCED SUMMARY:")
        print(f"   Total employees found: {summary.get('total_employees_found', 0)}")
        print(f"   Total screenshots: {summary.get('total_screenshots', 0):,}")
        print(f"   Search query: {summary.get('search_query', 'N/A')}")
        print(f"   Max limit available: {summary.get('max_limit_available', 'N/A')}")
        print(f"   S3 scan mode: {summary.get('scan_s3_mode', False)}")
        
        # Show metadata if available
        metadata = response_data.get('metadata', {})
        if metadata.get('source_info'):
            print(f"   Data source: {metadata.get('source_info')}")
        print()
        
        if not employees:
            print("❌ No employees found matching your search.")
            return None
        
        # Show details for each employee found
        for i, emp in enumerate(employees, 1):
            print(f"👤 EMPLOYEE {i}:")
            print(f"   Name: {emp.get('name')}")
            print(f"   Email: {emp.get('email')}")
            print(f"   Staff ID: {emp.get('staff_id')}")
            print(f"   Source: {emp.get('source', 'Database')}")
            print(f"   Total screenshots: {emp.get('total_screenshots'):,}")
            print(f"   Screenshots shown: {emp.get('screenshots_shown'):,}")
            
            # Show sample screenshots
            screenshots = emp.get('screenshots', [])
            if screenshots:
                print(f"   📸 Sample screenshots:")
                for j, screenshot in enumerate(screenshots[:5], 1):
                    date = screenshot.get('date_folder', 'No date')
                    time = screenshot.get('time_folder', 'No time')
                    url = screenshot.get('url', '')
                    
                    print(f"      {j}. Date: {date}")
                    print(f"         Time: {time}")
                    print(f"         URL: {url[:100]}{'...' if len(url) > 100 else ''}")
                
                if len(screenshots) > 5:
                    print(f"      ... and {len(screenshots) - 5:,} more screenshots")
            
            print()
        
        return response_data
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the API. Make sure the Django server is running.")
        print("   Start server with: python manage.py runserver")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def show_all_users():
    """Show all users with screenshots using S3 direct scan"""
    params = {
        'scan_s3': 'true',   # Use S3 direct scan to find ALL users
        'show_all': 'true',
        'limit': 10  # Just a few screenshots per user for overview
    }
    
    try:
        print("🌐 Getting ALL users from S3 (Enhanced Mode)...")
        print(f"📡 API URL: {SCREENSHOTS_SEARCH_URL}")
        print(f"📋 Parameters: {params}")
        print("-" * 50)
        
        response = requests.get(SCREENSHOTS_SEARCH_URL, params=params)
        
        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code}")
            return
        
        data = response.json()
        response_data = data.get('data', {})
        employees = response_data.get('employees', [])
        summary = response_data.get('summary', {})
        
        print(f"✅ {data.get('message')}")
        print()
        
        print("📊 ALL USERS WITH SCREENSHOTS (S3 ENHANCED):")
        print(f"   Total employees: {summary.get('total_employees_found', 0)}")
        print(f"   Total screenshots: {summary.get('total_screenshots', 0):,}")
        print(f"   Source: {response_data.get('metadata', {}).get('source_info', 'Unknown')}")
        print(f"   Max limit: {summary.get('max_limit_available', 'N/A')}")
        print()
        
        if not employees:
            print("❌ No employees with screenshots found.")
            return
        
        for i, emp in enumerate(employees, 1):
            print(f"👤 {i}. {emp.get('name')} ({emp.get('email')})")
            print(f"      Staff ID: {emp.get('staff_id')}")
            print(f"      Source: {emp.get('source', 'Unknown')}")
            print(f"      Screenshots: {emp.get('total_screenshots'):,}")
            print()
        
        print("💡 Enhanced Commands Available:")
        print("   python test_user_screenshots.py <name_or_email>")
        print("   python test_user_screenshots.py --s3 <name> (S3 direct scan)")
        print("   python test_user_screenshots.py --limit 5000 <name> (high limit)")
        print("   python test_user_screenshots.py --all (all users)")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_s3_user(search_term):
    """Test S3 direct scanning for users not in database"""
    print(f"🌐 Testing S3 Direct Scan for: {search_term}")
    print("(This can find users that exist in S3 but not in database)")
    print()
    return get_all_screenshots_for_user(search_term, limit=5000, use_s3=True)

def test_high_limit(search_term, limit=5000):
    """Test high limit screenshots"""
    print(f"📈 Testing High Limit ({limit:,}) for: {search_term}")
    print()
    return get_all_screenshots_for_user(search_term, limit=limit, use_s3=False)

def main():
    """Enhanced main function with new features"""
    print("=" * 60)
    print("🔍 ENHANCED USER SCREENSHOTS SEARCH TEST")
    print("🌐 S3 Direct Scan + 5000 Limit Support")
    print("=" * 60)
    print()
    
    if len(sys.argv) < 2:
        print("❌ Please provide a command")
        print()
        print("🎯 ENHANCED USAGE:")
        print("   python test_user_screenshots.py <name_or_email>")
        print("   python test_user_screenshots.py --all")
        print("   python test_user_screenshots.py --s3 <name>")
        print("   python test_user_screenshots.py --limit 5000 <name>")
        print()
        print("📊 EXAMPLES:")
        print("   python test_user_screenshots.py Haseeb")
        print("   python test_user_screenshots.py --all (show all 29+ users)")
        print("   python test_user_screenshots.py --s3 Danish (S3-only user)")
        print("   python test_user_screenshots.py --limit 5000 Amir")
        print()
        print("✨ NEW FEATURES:")
        print("   ✅ Finds 29+ users (not just 4 from database)")
        print("   ✅ Up to 5,000 screenshots per user")
        print("   ✅ S3 direct scanning")
        return
    
    # Parse arguments
    if sys.argv[1] == "--all":
        show_all_users()
    elif sys.argv[1] == "--s3" and len(sys.argv) > 2:
        search_term = sys.argv[2]
        result = test_s3_user(search_term)
        if result:
            print("✅ SUCCESS! S3 Direct Scan found the user!")
    elif sys.argv[1] == "--limit" and len(sys.argv) > 3:
        limit = int(sys.argv[2])
        search_term = sys.argv[3]
        result = test_high_limit(search_term, limit)
        if result:
            print(f"✅ SUCCESS! Retrieved up to {limit:,} screenshots!")
    else:
        search_term = sys.argv[1]
        result = get_all_screenshots_for_user(search_term, limit=5000)
        
        if result:
            print("✅ SUCCESS! Enhanced API working perfectly!")
            print()
            print("🔧 FRONTEND INTEGRATION:")
            print(f"   Standard: GET {SCREENSHOTS_SEARCH_URL}?search={search_term}&limit=5000")
            print(f"   S3 Scan: GET {SCREENSHOTS_SEARCH_URL}?search={search_term}&scan_s3=true&limit=5000")
            print(f"   All Users: GET {SCREENSHOTS_SEARCH_URL}?scan_s3=true&show_all=true&limit=5000")
            print()
            print("✨ ENHANCED FEATURES:")
            print("   1. Search up to 29+ users (S3 + Database)")
            print("   2. Up to 5,000 screenshots per user")
            print("   3. S3 direct scanning for all users")
            print("   4. Enhanced response with source info")

if __name__ == "__main__":
    main()
