#!/usr/bin/env python3
"""
Screenshot Search Comparison - Database vs S3 Scan
==================================================

This script demonstrates the difference between database search 
and S3 scan mode for finding users.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"
SEARCH_URL = f"{BASE_URL}/api/screenshots/search/"

def test_search_comparison(username):
    """Compare database search vs S3 scan for finding users"""
    print(f"🔍 Testing Search for: {username}")
    print("=" * 60)
    
    # Test 1: Database Search (Default)
    print("1️⃣ Database Search (Default Mode)")
    print("-" * 40)
    
    params_db = {
        'search': username,
        'limit': 100
    }
    
    try:
        response_db = requests.get(SEARCH_URL, params=params_db)
        if response_db.status_code == 200:
            data_db = response_db.json()
            employees_db = data_db.get('data', {}).get('employees', [])
            summary_db = data_db.get('data', {}).get('summary', {})
            
            print(f"✅ Response: {response_db.status_code}")
            print(f"   Employees Found: {summary_db.get('total_employees_found', 0)}")
            print(f"   Screenshots: {summary_db.get('total_screenshots', 0)}")
            print(f"   Source: {data_db.get('data', {}).get('metadata', {}).get('source_info', 'Unknown')}")
            print(f"   S3 Scan Mode: {summary_db.get('scan_s3_mode', False)}")
        else:
            print(f"❌ Error: {response_db.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print()
    
    # Test 2: S3 Scan Search
    print("2️⃣ S3 Scan Search (Enhanced Mode)")
    print("-" * 40)
    
    params_s3 = {
        'search': username,
        'scan_s3': 'true',
        'limit': 1000
    }
    
    try:
        response_s3 = requests.get(SEARCH_URL, params=params_s3)
        if response_s3.status_code == 200:
            data_s3 = response_s3.json()
            employees_s3 = data_s3.get('data', {}).get('employees', [])
            summary_s3 = data_s3.get('data', {}).get('summary', {})
            
            print(f"✅ Response: {response_s3.status_code}")
            print(f"   Employees Found: {summary_s3.get('total_employees_found', 0)}")
            print(f"   Screenshots: {summary_s3.get('total_screenshots', 0)}")
            print(f"   Source: {data_s3.get('data', {}).get('metadata', {}).get('source_info', 'Unknown')}")
            print(f"   S3 Scan Mode: {summary_s3.get('scan_s3_mode', False)}")
            
            if employees_s3:
                user = employees_s3[0]
                print(f"   User Details:")
                print(f"     Name: {user.get('name')}")
                print(f"     Email: {user.get('email')}")
                print(f"     Staff ID: {user.get('staff_id')}")
                print(f"     Total Screenshots: {user.get('total_screenshots'):,}")
        else:
            print(f"❌ Error: {response_s3.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print()

def main():
    print("🔍 Screenshot Search Comparison")
    print("Database vs S3 Scan Mode")
    print("=" * 60)
    print()
    
    # Test users that exist in S3 but may not be in database
    test_users = [
        "bilgeryilmaz",
        "haseeb",
        "amir",
        "danish"
    ]
    
    for username in test_users:
        test_search_comparison(username)
        print("🔄" + "="*58)
        print()
    
    print("💡 KEY INSIGHT:")
    print("=" * 60)
    print("✅ Database Search: Fast, but only finds users in Django database")
    print("✅ S3 Scan Search: Slower, but finds ALL users with screenshots in S3")
    print()
    print("🎯 RECOMMENDATION:")
    print("   Use scan_s3=true when you want to find all available users")
    print("   Use default mode for quick searches of known database users")

if __name__ == "__main__":
    main()
