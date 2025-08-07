#!/usr/bin/env python3
"""
Screenshots Search API - Complete Test Suite
===========================================

This script demonstrates all three search patterns you requested:
1. Search by Name
2. Search by Name + Date Filter  
3. Search by Name + All Screenshots

Usage examples:
- python test_search_patterns.py name Haseeb
- python test_search_patterns.py name-date Haseeb 2025-01-15
- python test_search_patterns.py name-all Haseeb
"""

import requests
import json
import sys
from datetime import datetime

# API Configuration
BASE_URL = "http://127.0.0.1:8000"
SCREENSHOTS_SEARCH_URL = f"{BASE_URL}/api/screenshots/search/"

def search_by_name(name, limit=100):
    """
    Pattern 1: Search by Name Only
    Returns limited screenshots for quick viewing
    """
    params = {
        'search': name,
        'limit': limit
    }
    
    print(f"🔍 PATTERN 1: Search by Name Only")
    print(f"   Name: {name}")
    print(f"   Limit: {limit}")
    print(f"   URL: {SCREENSHOTS_SEARCH_URL}")
    print(f"   Parameters: {params}")
    print("-" * 50)
    
    try:
        response = requests.get(SCREENSHOTS_SEARCH_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                employees = data.get('data', {}).get('employees', [])
                summary = data.get('data', {}).get('summary', {})
                
                print(f"✅ {data.get('message')}")
                print(f"📊 Found: {summary.get('total_employees_found')} employees")
                print(f"📸 Screenshots: {summary.get('total_screenshots')} total")
                print()
                
                for emp in employees:
                    print(f"👤 {emp.get('name')} ({emp.get('email')})")
                    print(f"   📸 Showing: {emp.get('screenshots_shown')} of {emp.get('total_screenshots')} screenshots")
                    
                    # Show sample screenshots
                    screenshots = emp.get('screenshots', [])[:3]
                    for i, screenshot in enumerate(screenshots, 1):
                        date = screenshot.get('date_folder', 'No date')
                        print(f"      {i}. {date}")
                    print()
                
                return data
            else:
                print(f"❌ API Error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    return None

def search_by_name_and_date(name, date, limit=100):
    """
    Pattern 2: Search by Name + Date Filter
    Returns screenshots from specific date only
    """
    params = {
        'search': name,
        'date': date,
        'limit': limit
    }
    
    print(f"🗓️ PATTERN 2: Search by Name + Date Filter")
    print(f"   Name: {name}")
    print(f"   Date: {date}")
    print(f"   Limit: {limit}")
    print(f"   URL: {SCREENSHOTS_SEARCH_URL}")
    print(f"   Parameters: {params}")
    print("-" * 50)
    
    try:
        response = requests.get(SCREENSHOTS_SEARCH_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                employees = data.get('data', {}).get('employees', [])
                summary = data.get('data', {}).get('summary', {})
                
                print(f"✅ {data.get('message')}")
                print(f"📅 Date Filter: {summary.get('date_filter')}")
                print(f"📊 Found: {summary.get('total_employees_found')} employees")
                print(f"📸 Screenshots: {summary.get('total_screenshots')} from {date}")
                print()
                
                if not employees:
                    print(f"❌ No screenshots found for {name} on {date}")
                    print("💡 Try a different date or use 'name-all' to see all available dates")
                    return None
                
                for emp in employees:
                    print(f"👤 {emp.get('name')} ({emp.get('email')})")
                    print(f"   📅 Screenshots from {date}: {emp.get('total_screenshots')}")
                    
                    # Show screenshots from this date
                    screenshots = emp.get('screenshots', [])
                    for i, screenshot in enumerate(screenshots[:5], 1):
                        date_folder = screenshot.get('date_folder', 'No date')
                        time_folder = screenshot.get('time_folder', 'No time')
                        print(f"      {i}. Date: {date_folder} | Time: {time_folder}")
                    
                    if len(screenshots) > 5:
                        print(f"      ... and {len(screenshots) - 5} more from {date}")
                    print()
                
                return data
            else:
                print(f"❌ API Error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    return None

def search_by_name_all_screenshots(name, limit=5000):
    """
    Pattern 3: Search by Name + All Screenshots
    Returns ALL screenshots for the user (up to 5000)
    """
    params = {
        'search': name,
        'limit': limit,
        'scan_s3': 'true'  # Ensure we get complete coverage
    }
    
    print(f"📸 PATTERN 3: Search by Name + ALL Screenshots")
    print(f"   Name: {name}")
    print(f"   Limit: {limit} (ALL)")
    print(f"   S3 Scan: Enabled (complete coverage)")
    print(f"   URL: {SCREENSHOTS_SEARCH_URL}")
    print(f"   Parameters: {params}")
    print("-" * 50)
    
    try:
        response = requests.get(SCREENSHOTS_SEARCH_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                employees = data.get('data', {}).get('employees', [])
                summary = data.get('data', {}).get('summary', {})
                metadata = data.get('data', {}).get('metadata', {})
                
                print(f"✅ {data.get('message')}")
                print(f"📊 Found: {summary.get('total_employees_found')} employees")
                print(f"📸 Total Screenshots: {summary.get('total_screenshots'):,}")
                print(f"🌐 Source: {metadata.get('source_info', 'Unknown')}")
                print(f"📈 Max Limit: {summary.get('max_limit_available', 'N/A')}")
                print()
                
                for emp in employees:
                    print(f"👤 {emp.get('name')} ({emp.get('email')})")
                    print(f"   📸 Total Screenshots: {emp.get('total_screenshots'):,}")
                    print(f"   👁️  Showing: {emp.get('screenshots_shown'):,}")
                    print(f"   🆔 Source: {emp.get('source', 'Unknown')}")
                    
                    # Analyze screenshot dates
                    screenshots = emp.get('screenshots', [])
                    dates = {}
                    for screenshot in screenshots:
                        date_folder = screenshot.get('date_folder', 'Unknown')
                        dates[date_folder] = dates.get(date_folder, 0) + 1
                    
                    print(f"   📅 Date Distribution:")
                    for date, count in sorted(dates.items())[:5]:
                        print(f"      - {date}: {count:,} screenshots")
                    
                    if len(dates) > 5:
                        print(f"      ... and {len(dates) - 5} more date folders")
                    
                    print(f"   🔗 Sample URLs:")
                    for i, screenshot in enumerate(screenshots[:3], 1):
                        url = screenshot.get('url', '')
                        print(f"      {i}. {url[:80]}{'...' if len(url) > 80 else ''}")
                    print()
                
                return data
            else:
                print(f"❌ API Error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    return None

def show_usage():
    """Show usage examples"""
    print("=" * 60)
    print("📸 SCREENSHOTS SEARCH API - 3 SEARCH PATTERNS")
    print("=" * 60)
    print()
    print("🎯 USAGE:")
    print("   python test_search_patterns.py <pattern> <name> [date]")
    print()
    print("📋 PATTERNS:")
    print("   1. name <user>           - Basic search (100 screenshots)")
    print("   2. name-date <user> <date> - Search with date filter")
    print("   3. name-all <user>       - ALL screenshots (up to 5000)")
    print()
    print("📊 EXAMPLES:")
    print("   python test_search_patterns.py name Haseeb")
    print("   python test_search_patterns.py name-date Haseeb 2025-01-15")
    print("   python test_search_patterns.py name-all Haseeb")
    print("   python test_search_patterns.py name-all Amir")
    print("   python test_search_patterns.py name Danish")
    print()
    print("✨ FEATURES:")
    print("   ✅ Search by name or email")
    print("   ✅ Date filtering (YYYY-MM-DD)")
    print("   ✅ High limits (up to 5,000 screenshots)")
    print("   ✅ S3 direct scanning (finds all users)")
    print("   ✅ Enhanced response format")

def main():
    """Main function"""
    print("🚀 SCREENSHOTS SEARCH API TEST")
    print()
    
    if len(sys.argv) < 3:
        show_usage()
        return
    
    pattern = sys.argv[1].lower()
    name = sys.argv[2]
    
    if pattern == "name":
        # Pattern 1: Search by Name
        result = search_by_name(name, limit=100)
        
    elif pattern == "name-date":
        # Pattern 2: Search by Name + Date
        if len(sys.argv) < 4:
            print("❌ Date required for name-date pattern")
            print("   Usage: python test_search_patterns.py name-date <name> <YYYY-MM-DD>")
            return
        
        date = sys.argv[3]
        result = search_by_name_and_date(name, date, limit=100)
        
    elif pattern == "name-all":
        # Pattern 3: Search by Name + ALL Screenshots
        result = search_by_name_all_screenshots(name, limit=5000)
        
    else:
        print(f"❌ Unknown pattern: {pattern}")
        show_usage()
        return
    
    if result:
        print("=" * 50)
        print("🎯 FRONTEND INTEGRATION GUIDE")
        print("=" * 50)
        
        if pattern == "name":
            print("📱 Pattern 1 - Basic Name Search:")
            print(f"   GET {SCREENSHOTS_SEARCH_URL}?search={name}&limit=100")
            
        elif pattern == "name-date":
            date = sys.argv[3]
            print("📅 Pattern 2 - Name + Date Filter:")
            print(f"   GET {SCREENSHOTS_SEARCH_URL}?search={name}&date={date}&limit=100")
            
        elif pattern == "name-all":
            print("🔥 Pattern 3 - Name + ALL Screenshots:")
            print(f"   GET {SCREENSHOTS_SEARCH_URL}?search={name}&scan_s3=true&limit=5000")
        
        print()
        print("💻 JavaScript Example:")
        print("```javascript")
        if pattern == "name":
            print(f"fetch('{SCREENSHOTS_SEARCH_URL}?search={name}&limit=100')")
        elif pattern == "name-date":
            date = sys.argv[3]
            print(f"fetch('{SCREENSHOTS_SEARCH_URL}?search={name}&date={date}&limit=100')")
        elif pattern == "name-all":
            print(f"fetch('{SCREENSHOTS_SEARCH_URL}?search={name}&scan_s3=true&limit=5000')")
        
        print("  .then(res => res.json())")
        print("  .then(data => {")
        print("    const employees = data.data.employees;")
        print("    employees.forEach(emp => {")
        print("      console.log(`${emp.name}: ${emp.total_screenshots} screenshots`);")
        print("    });")
        print("  });")
        print("```")

if __name__ == "__main__":
    main()
