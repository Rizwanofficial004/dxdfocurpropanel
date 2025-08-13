#!/usr/bin/env python3
"""
API Testing Demo - How to Get Data from Your APIs
================================================

This script shows you exactly how to get data from all your APIs.
"""

import requests
import json
from datetime import datetime

def test_api_endpoint(url, description, params=None):
    """
    Test an API endpoint and display the results
    """
    print(f"\n{'='*60}")
    print(f"🔍 TESTING: {description}")
    print(f"📡 URL: {url}")
    if params:
        print(f"📋 Parameters: {params}")
    print("="*60)
    
    try:
        response = requests.get(url, params=params, timeout=10)
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Response Data:")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Error Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Request Failed: {str(e)}")

def main():
    """
    Test all available APIs
    """
    base_url = "http://127.0.0.1:8010/api"
    
    print("🚀 API DATA RETRIEVAL DEMO")
    print("=" * 80)
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    # 1. Basic Health Check
    test_api_endpoint(
        f"{base_url}/test/",
        "Basic API Health Check"
    )
    
    # 2. Scheduler Status
    test_api_endpoint(
        f"{base_url}/scheduler/status/",
        "Scheduler Status (Check if auto-updates are running)"
    )
    
    # 3. User Screenshot Counts - All Users
    test_api_endpoint(
        f"{base_url}/users/screenshots-count/",
        "All Users Screenshot Counts"
    )
    
    # 4. User Screenshot Counts - Top 5 Users
    test_api_endpoint(
        f"{base_url}/users/screenshots-count/",
        "Top 5 Users by Screenshot Count",
        {"limit": 5, "sort_by": "count", "order": "desc"}
    )
    
    # 5. User Screenshot Counts - Users with at least 1000 screenshots
    test_api_endpoint(
        f"{base_url}/users/screenshots-count/",
        "Users with 1000+ Screenshots",
        {"min_count": 1000, "sort_by": "count", "order": "desc"}
    )
    
    # 6. User Screenshot Summary
    test_api_endpoint(
        f"{base_url}/users/screenshots-summary/",
        "Quick Summary Statistics"
    )
    
    # 7. System Tracking Status
    test_api_endpoint(
        f"{base_url}/screenshots/tracking-status/",
        "System Tracking Status"
    )
    
    # 8. Ultra-Fast Screenshots (Limited)
    test_api_endpoint(
        f"{base_url}/screenshots/ultra-fast/",
        "Ultra-Fast Screenshots (Limited to 3 users)",
        {"limit": 3}
    )
    
    print(f"\n{'='*80}")
    print("🎉 API TESTING COMPLETE!")
    print("=" * 80)
    print("\n📋 HOW TO USE THESE APIs:")
    print("1. Copy any URL from above")
    print("2. Use in your browser, Postman, or code")
    print("3. Add parameters like ?limit=10&sort_by=count")
    print("4. Get JSON responses with screenshot data")
    
    print(f"\n🔗 QUICK ACCESS URLs:")
    print(f"• Health Check: {base_url}/test/")
    print(f"• Scheduler Status: {base_url}/scheduler/status/")
    print(f"• User Counts: {base_url}/users/screenshots-count/")
    print(f"• Summary: {base_url}/users/screenshots-summary/")

if __name__ == "__main__":
    main()
