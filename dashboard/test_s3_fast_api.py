#!/usr/bin/env python3
"""
Test S3 Fast Live Tracking Screenshots API
This script tests the new API that scans all S3 user folders
"""

import requests
import json
from datetime import datetime

# API Configuration
BASE_URL = "http://127.0.0.1:8000"
API_ENDPOINT = f"{BASE_URL}/api/live-tracking/fast-screenshots/"

def test_s3_fast_api():
    """Test the S3 scanning fast API"""
    print("🚀 Testing S3 Fast Live Tracking Screenshots API")
    print(f"📡 Endpoint: {API_ENDPOINT}")
    print("=" * 60)
    
    # Test parameters
    test_params = [
        {"limit": 100, "description": "Get all users (up to 100)"},
        {"limit": 29, "description": "Get exactly 29 users (should match S3 folders)"},
        {"limit": 50, "sort_by": "name", "description": "Sort by name"},
        {"limit": 50, "sort_by": "email", "description": "Sort by email"},
        {"status": "all", "limit": 100, "description": "All statuses"},
    ]
    
    for i, params in enumerate(test_params, 1):
        description = params.pop("description")
        print(f"\n🧪 Test {i}: {description}")
        print(f"   Parameters: {params}")
        
        try:
            response = requests.get(API_ENDPOINT, params=params, timeout=30)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    users = data.get('data', {}).get('users', [])
                    summary = data.get('data', {}).get('summary', {})
                    debug_info = data.get('data', {}).get('debug_info', {})
                    
                    print(f"   ✅ Success: {data.get('message', 'No message')}")
                    print(f"   📊 Users returned: {len(users)}")
                    print(f"   📁 Total S3 folders found: {summary.get('total_s3_users_found', 'N/A')}")
                    print(f"   📸 Users with screenshots: {summary.get('users_with_screenshots', 'N/A')}")
                    print(f"   👥 Staff table users: {summary.get('users_from_staff_table', 'N/A')}")
                    print(f"   🗂️ S3-only users: {summary.get('users_from_s3_only', 'N/A')}")
                    print(f"   🔄 API version: {summary.get('api_version', 'N/A')}")
                    
                    # Show first few users
                    print(f"\n   👤 First 5 users:")
                    for j, user in enumerate(users[:5], 1):
                        source = user.get('data_source', 'unknown')
                        has_screenshot = user.get('latest_screenshot', {}).get('has_screenshot', False)
                        screenshot_icon = "📸" if has_screenshot else "❌"
                        print(f"      {j}. {user.get('display_name', 'Unknown')} ({user.get('email', 'No email')}) - {source} {screenshot_icon}")
                    
                    if len(users) > 5:
                        print(f"      ... and {len(users) - 5} more users")
                        
                else:
                    print(f"   ❌ API Error: {data.get('message', 'Unknown error')}")
                    print(f"   Details: {json.dumps(data, indent=2)}")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request Error: {e}")
        except json.JSONDecodeError as e:
            print(f"   ❌ JSON Error: {e}")
        except Exception as e:
            print(f"   ❌ Unexpected Error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")

def detailed_s3_analysis():
    """Get detailed analysis of S3 scanning results"""
    print("\n🔍 DETAILED S3 ANALYSIS")
    print("=" * 60)
    
    params = {"limit": 100, "sort_by": "name"}
    
    try:
        response = requests.get(API_ENDPOINT, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                users = data.get('data', {}).get('users', [])
                summary = data.get('data', {}).get('summary', {})
                
                print(f"📁 Total S3 folders scanned: {summary.get('total_s3_users_found', 'N/A')}")
                print(f"👥 Users processed: {summary.get('total_users_processed', 'N/A')}")
                print(f"📸 Screenshots found: {summary.get('total_screenshots_found', 'N/A')}")
                
                # Analyze data sources
                staff_users = [u for u in users if u.get('data_source') == 'staff_table']
                s3_only_users = [u for u in users if u.get('data_source') == 's3_only']
                
                print(f"\n📊 DATA SOURCE BREAKDOWN:")
                print(f"   Staff table users: {len(staff_users)}")
                print(f"   S3-only users: {len(s3_only_users)}")
                
                print(f"\n👥 ALL USERS FOUND:")
                for i, user in enumerate(users, 1):
                    source = user.get('data_source', 'unknown')
                    source_icon = "👤" if source == 'staff_table' else "📁"
                    has_screenshot = user.get('latest_screenshot', {}).get('has_screenshot', False)
                    screenshot_icon = "📸" if has_screenshot else "❌"
                    
                    print(f"   {i:2d}. {source_icon} {user.get('display_name', 'Unknown'):25} | {user.get('email', 'No email'):30} | {screenshot_icon}")
                
                # Expected vs Actual
                expected_s3_users = 29  # From your screenshot
                actual_s3_users = summary.get('total_s3_users_found', 0)
                
                print(f"\n🎯 COMPARISON:")
                print(f"   Expected S3 users (from screenshot): {expected_s3_users}")
                print(f"   Actual S3 users found by API: {actual_s3_users}")
                
                if actual_s3_users == expected_s3_users:
                    print(f"   ✅ PERFECT MATCH! All {expected_s3_users} users found!")
                elif actual_s3_users < expected_s3_users:
                    print(f"   ⚠️ Missing {expected_s3_users - actual_s3_users} users")
                else:
                    print(f"   🤔 Found {actual_s3_users - expected_s3_users} more users than expected")
                    
            else:
                print(f"❌ API Error: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # Run tests
    test_s3_fast_api()
    
    # Run detailed analysis
    detailed_s3_analysis()
    
    print(f"\n⏰ Test completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
