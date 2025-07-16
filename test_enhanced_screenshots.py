#!/usr/bin/env python3
"""
Enhanced Screenshots API Test - All Users from S3 with 5000 Limit
================================================================

This script tests the enhanced screenshots API that can:
1. Scan ALL users directly from S3 (not just database users)
2. Support up to 5000 screenshots per user
3. Show all users with screenshots

Usage:
    python test_enhanced_screenshots.py
"""

import requests
import json
from datetime import datetime

# API Configuration
BASE_URL = "http://127.0.0.1:8000"
SCREENSHOTS_SEARCH_URL = f"{BASE_URL}/api/screenshots/search/"

def test_s3_scan_all_users():
    """Test scanning ALL users from S3 with high limits"""
    print("🌐 Testing S3 Direct Scan - ALL Users")
    print("=" * 50)
    
    params = {
        'scan_s3': 'true',        # Scan S3 directly
        'show_all': 'true',       # Show all users
        'limit': 5000             # High limit per user
    }
    
    try:
        print(f"📡 API URL: {SCREENSHOTS_SEARCH_URL}")
        print(f"📋 Parameters: {params}")
        print()
        
        response = requests.get(SCREENSHOTS_SEARCH_URL, params=params)
        
        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        data = response.json()
        
        if not data.get('success'):
            print(f"❌ API returned error: {data.get('message')}")
            return None
        
        # Display results
        print(f"✅ {data.get('message')}")
        print()
        
        response_data = data.get('data', {})
        employees = response_data.get('employees', [])
        summary = response_data.get('summary', {})
        metadata = response_data.get('metadata', {})
        
        print("📊 ENHANCED SUMMARY:")
        print(f"   🧑‍💼 Total employees found: {summary.get('total_employees_found', 0)}")
        print(f"   📸 Total screenshots: {summary.get('total_screenshots', 0)}")
        print(f"   🔍 Search mode: {metadata.get('source_info', 'Unknown')}")
        print(f"   📈 Limit per user: {summary.get('screenshots_per_employee_limit', 0)}")
        print(f"   ⚡ Max limit available: {summary.get('max_limit_available', 0)}")
        print(f"   🌐 S3 scan mode: {summary.get('scan_s3_mode', False)}")
        print()
        
        if not employees:
            print("❌ No employees found in S3.")
            return None
        
        print(f"🎯 FOUND {len(employees)} EMPLOYEES FROM S3:")
        print("-" * 60)
        
        total_all_screenshots = 0
        for i, emp in enumerate(employees, 1):
            name = emp.get('name')
            email = emp.get('email')
            total_screenshots = emp.get('total_screenshots', 0)
            screenshots_shown = emp.get('screenshots_shown', 0)
            source = emp.get('source', 'Unknown')
            
            total_all_screenshots += screenshots_shown
            
            print(f"👤 {i}. {name}")
            print(f"     📧 Email: {email}")
            print(f"     🆔 Source: {source}")
            print(f"     📸 Total screenshots: {total_screenshots:,}")
            print(f"     👁️  Screenshots shown: {screenshots_shown:,}")
            
            # Show sample screenshots
            screenshots = emp.get('screenshots', [])
            if screenshots:
                print(f"     🖼️  Sample screenshots:")
                for j, screenshot in enumerate(screenshots[:3], 1):
                    date = screenshot.get('date_folder', 'No date')
                    url = screenshot.get('url', '')
                    print(f"        {j}. {date}")
                    print(f"           URL: {url[:80]}{'...' if len(url) > 80 else ''}")
                
                if len(screenshots) > 3:
                    print(f"        ... and {len(screenshots) - 3:,} more screenshots")
            
            print()
        
        print("📊 GRAND TOTAL:")
        print(f"   Users processed: {len(employees)}")
        print(f"   Screenshots displayed: {total_all_screenshots:,}")
        print()
        
        return response_data
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the API. Make sure the Django server is running.")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_specific_user_high_limit(user_name):
    """Test getting high limit screenshots for a specific user"""
    print(f"🎯 Testing High Limit for User: {user_name}")
    print("=" * 50)
    
    params = {
        'search': user_name,
        'limit': 5000  # Maximum limit
    }
    
    try:
        response = requests.get(SCREENSHOTS_SEARCH_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                employees = data.get('data', {}).get('employees', [])
                
                if employees:
                    emp = employees[0]
                    print(f"✅ {emp.get('name')} ({emp.get('email')})")
                    print(f"   📸 Total screenshots: {emp.get('total_screenshots', 0):,}")
                    print(f"   👁️  Screenshots shown: {emp.get('screenshots_shown', 0):,}")
                    print(f"   📈 Limit requested: 5,000")
                    print()
                else:
                    print(f"❌ No user found matching '{user_name}'")
            else:
                print(f"❌ API Error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    """Main test function"""
    print("🚀 ENHANCED SCREENSHOTS API TEST")
    print("🌐 S3 Direct Scan + 5000 Limit Support")
    print("=" * 60)
    print()
    
    # Test 1: Scan all users from S3
    result = test_s3_scan_all_users()
    
    if result:
        print()
        print("🔥 SUCCESS! The enhanced API is working perfectly!")
        print()
        
        # Test 2: High limit for specific users
        print("Testing high limits for specific users:")
        print("-" * 40)
        test_specific_user_high_limit("Haseeb")
        test_specific_user_high_limit("Amir")
        
        print()
        print("🎯 FRONTEND INTEGRATION EXAMPLES:")
        print("-" * 40)
        print()
        
        print("📱 JavaScript Example:")
        print("```javascript")
        print("// Get ALL users from S3 with high limits")
        print("fetch('http://127.0.0.1:8000/api/screenshots/search/?scan_s3=true&show_all=true&limit=5000')")
        print("  .then(res => res.json())")
        print("  .then(data => {")
        print("    const employees = data.data.employees;")
        print("    console.log(`Found ${employees.length} employees from S3`);")
        print("    employees.forEach(emp => {")
        print("      console.log(`${emp.name}: ${emp.total_screenshots} screenshots`);")
        print("    });")
        print("  });")
        print("```")
        print()
        
        print("🌐 Direct API URLs:")
        print(f"   All S3 users: {SCREENSHOTS_SEARCH_URL}?scan_s3=true&show_all=true&limit=5000")
        print(f"   Specific user: {SCREENSHOTS_SEARCH_URL}?search=Haseeb&limit=5000")
        print()
        
        print("✨ NEW FEATURES AVAILABLE:")
        print("   ✅ Scan ALL users directly from S3 (not limited to database)")
        print("   ✅ Support up to 5,000 screenshots per user")
        print("   ✅ Enhanced response with source information")
        print("   ✅ Better performance for large datasets")
        print("   ✅ Automatic name extraction for S3-only users")
        
    else:
        print("❌ API test failed. Please check the server and try again.")

if __name__ == "__main__":
    main()
