#!/usr/bin/env python3
"""
Three Screenshot Search Patterns - Quick Demo
============================================

This script demonstrates the three search patterns you requested:
1. Search by Name (Quick)
2. Search by Name + Date Filter (Specific Day)
3. Search by Name + All Screenshots (Complete History)

Usage:
    python demo_three_patterns.py
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_ENDPOINT = f"{BASE_URL}/api/screenshots/search/"

def test_pattern_1():
    """Pattern 1: Search by Name (Quick)"""
    print("🔍 PATTERN 1: Search by Name (Quick)")
    print("=" * 50)
    
    params = {
        'search': 'Haseeb',
        'limit': 100
    }
    
    print(f"URL: {API_ENDPOINT}")
    print(f"Parameters: {params}")
    print()
    
    try:
        response = requests.get(API_ENDPOINT, params=params)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                summary = data.get('data', {}).get('summary', {})
                print(f"✅ Success!")
                print(f"   Employees found: {summary.get('total_employees_found', 0)}")
                print(f"   Total screenshots: {summary.get('total_screenshots', 0)}")
                print(f"   Search query: {summary.get('search_query', 'N/A')}")
                print(f"   Source: Quick database search")
            else:
                print(f"❌ API returned error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print()

def test_pattern_2():
    """Pattern 2: Search by Name + Date Filter (Specific Day)"""
    print("🗓️ PATTERN 2: Search by Name + Date Filter (Specific Day)")
    print("=" * 60)
    
    params = {
        'search': 'Haseeb',
        'date': '2025-01-15',
        'limit': 100
    }
    
    print(f"URL: {API_ENDPOINT}")
    print(f"Parameters: {params}")
    print()
    
    try:
        response = requests.get(API_ENDPOINT, params=params)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                summary = data.get('data', {}).get('summary', {})
                print(f"✅ Success!")
                print(f"   Employees found: {summary.get('total_employees_found', 0)}")
                print(f"   Total screenshots: {summary.get('total_screenshots', 0)}")
                print(f"   Search query: {summary.get('search_query', 'N/A')}")
                print(f"   Date filter: {summary.get('date_filter', 'N/A')}")
                print(f"   Source: Database + S3 with date filter")
            else:
                print(f"❌ API returned error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print()

def test_pattern_3():
    """Pattern 3: Search by Name + All Screenshots (Complete History)"""
    print("📂 PATTERN 3: Search by Name + All Screenshots (Complete History)")
    print("=" * 70)
    
    params = {
        'search': 'Haseeb',
        'scan_s3': 'true',
        'limit': 5000
    }
    
    print(f"URL: {API_ENDPOINT}")
    print(f"Parameters: {params}")
    print()
    
    try:
        response = requests.get(API_ENDPOINT, params=params)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                summary = data.get('data', {}).get('summary', {})
                print(f"✅ Success!")
                print(f"   Employees found: {summary.get('total_employees_found', 0)}")
                print(f"   Total screenshots: {summary.get('total_screenshots', 0)}")
                print(f"   Search query: {summary.get('search_query', 'N/A')}")
                print(f"   S3 scan mode: {summary.get('scan_s3_mode', False)}")
                print(f"   Max limit: {summary.get('max_limit_available', 0)}")
                print(f"   Source: Direct S3 scan (complete history)")
            else:
                print(f"❌ API returned error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print()

def main():
    print("🎯 Three Screenshot Search Patterns Demo")
    print("=========================================")
    print(f"Testing API endpoint: {API_ENDPOINT}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test all three patterns
    test_pattern_1()
    test_pattern_2()
    test_pattern_3()
    
    print("🏁 Demo completed!")
    print()
    print("💡 Integration Examples:")
    print("   Frontend: Use these patterns in your React components")
    print("   Mobile App: Call these APIs from your mobile application")
    print("   Scripts: Automate with curl, Python, or any HTTP client")
    print("   Postman: Import and test these endpoints directly")

if __name__ == "__main__":
    main()
