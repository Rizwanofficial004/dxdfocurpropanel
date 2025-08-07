#!/usr/bin/env python3
"""
Test Fast Live Tracking Screenshots API - S3 Folder Scanning Version
This script tests the new API that scans all user folders in S3 screenshots directory
"""

import requests
import json
from datetime import datetime

def test_fast_live_tracking_api():
    """Test the new fast live tracking API that scans S3"""
    
    print("🚀 Testing Fast Live Tracking Screenshots API - S3 Scanning Version")
    print("="*70)
    
    # API endpoint
    base_url = "http://127.0.0.1:8000"
    endpoint = f"{base_url}/api/live-tracking/fast-screenshots/"
    
    # Test parameters
    test_cases = [
        {
            "name": "All Users (Default)",
            "params": {"limit": 100}
        },
        {
            "name": "All Users (Max Limit)",
            "params": {"limit": 500}
        },
        {
            "name": "Sort by Email",
            "params": {"limit": 50, "sort_by": "email"}
        },
        {
            "name": "Sort by Name",
            "params": {"limit": 50, "sort_by": "name"}
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📋 Test Case: {test_case['name']}")
        print("-" * 50)
        
        try:
            # Make API request
            response = requests.get(endpoint, params=test_case['params'], timeout=60)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    users = data.get('data', {}).get('users', [])
                    summary = data.get('data', {}).get('summary', {})
                    debug_info = data.get('data', {}).get('debug_info', {})
                    
                    print(f"✅ Success: {data.get('message', 'No message')}")
                    print(f"📊 Total S3 Users Found: {summary.get('total_s3_users_found', 'N/A')}")
                    print(f"👥 Users Processed: {summary.get('total_users_processed', 'N/A')}")
                    print(f"📸 Users with Screenshots: {summary.get('users_with_screenshots', 'N/A')}")
                    print(f"❌ Users without Screenshots: {summary.get('users_without_screenshots', 'N/A')}")
                    print(f"🏢 Staff Table Users: {summary.get('users_from_staff_table', 'N/A')}")
                    print(f"💾 S3 Only Users: {summary.get('users_from_s3_only', 'N/A')}")
                    print(f"🖼️ Total Screenshots: {summary.get('total_screenshots_found', 'N/A')}")
                    
                    print(f"\n🔍 Debug Info:")
                    print(f"   S3 Scan Successful: {debug_info.get('s3_scan_successful', 'N/A')}")
                    print(f"   Staff Enrichment Available: {debug_info.get('staff_enrichment_available', 'N/A')}")
                    print(f"   Processed Limit: {debug_info.get('processed_limit', 'N/A')}")
                    
                    # Show first few users
                    print(f"\n👤 First 5 Users:")
                    for i, user in enumerate(users[:5]):
                        print(f"   {i+1}. {user.get('display_name', 'N/A')} ({user.get('email', 'N/A')}) - {user.get('data_source', 'N/A')}")
                        if user.get('latest_screenshot', {}).get('has_screenshot'):
                            print(f"      📸 Has Screenshot: {user['latest_screenshot']['timestamp']}")
                        else:
                            print(f"      ❌ No Screenshot")
                    
                    if len(users) > 5:
                        print(f"   ... and {len(users) - 5} more users")
                    
                else:
                    print(f"❌ API Error: {data.get('message', 'Unknown error')}")
                    
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error Details: {error_data}")
                except:
                    print(f"Error Text: {response.text[:200]}")
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ Request Error: {e}")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
    
    print("\n" + "="*70)
    print("🏁 Test Completed!")

def test_comparison_with_old_api():
    """Compare new S3 scanning API with old Staff table API"""
    
    print("\n🔄 Comparing New S3 API vs Old Staff API")
    print("="*70)
    
    base_url = "http://127.0.0.1:8000"
    
    # Test old API (Staff table based)
    old_endpoint = f"{base_url}/api/live-tracking/screenshots/"
    new_endpoint = f"{base_url}/api/live-tracking/fast-screenshots/"
    
    print("\n📊 Testing Old API (Staff Table Based):")
    try:
        old_response = requests.get(old_endpoint, params={"limit": 100}, timeout=30)
        if old_response.status_code == 200:
            old_data = old_response.json()
            old_users = old_data.get('data', {}).get('users', [])
            print(f"   Users Found: {len(old_users)}")
        else:
            print(f"   Error: {old_response.status_code}")
            old_users = []
    except Exception as e:
        print(f"   Error: {e}")
        old_users = []
    
    print("\n📊 Testing New API (S3 Scanning Based):")
    try:
        new_response = requests.get(new_endpoint, params={"limit": 100}, timeout=60)
        if new_response.status_code == 200:
            new_data = new_response.json()
            new_users = new_data.get('data', {}).get('users', [])
            summary = new_data.get('data', {}).get('summary', {})
            print(f"   S3 Users Found: {summary.get('total_s3_users_found', 'N/A')}")
            print(f"   Users Processed: {len(new_users)}")
        else:
            print(f"   Error: {new_response.status_code}")
            new_users = []
    except Exception as e:
        print(f"   Error: {e}")
        new_users = []
    
    print(f"\n📈 Comparison Results:")
    print(f"   Old API Users: {len(old_users)}")
    print(f"   New API Users: {len(new_users)}")
    print(f"   Difference: +{len(new_users) - len(old_users)} users")
    
    if len(new_users) >= 29:
        print(f"   ✅ SUCCESS: New API found {len(new_users)} users (expected 29+ from S3)")
    else:
        print(f"   ⚠️ WARNING: New API found {len(new_users)} users (expected 29+ from S3)")

if __name__ == "__main__":
    test_fast_live_tracking_api()
    test_comparison_with_old_api()
