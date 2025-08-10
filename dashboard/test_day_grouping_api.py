#!/usr/bin/env python3
"""
Test script for the enhanced Live Tracking Screenshots API with day-based grouping
"""

import requests
import json
from datetime import datetime

def test_day_grouping_api():
    """Test the Live Tracking API with day-based grouping"""
    
    # API endpoint
    base_url = "http://127.0.0.1:8000"
    endpoint = "/api/live-tracking/screenshots/"
    
    # Test parameters
    params = {
        'limit_users': 20,
        'limit_screenshots': 2,
        'sort_by': 'last_activity'
    }
    
    print("🚀 Testing Enhanced Live Tracking Screenshots API")
    print("=" * 60)
    print(f"📡 Endpoint: {base_url}{endpoint}")
    print(f"🔧 Parameters: {params}")
    print()
    
    try:
        # Make API request
        response = requests.get(f"{base_url}{endpoint}", params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ API Response Successful!")
            print(f"📊 Status: {data['success']}")
            print(f"💬 Message: {data['message']}")
            print()
            
            # Display grouping information
            if 'user_groups' in data['data']:
                print("📅 USER GROUPS BY DAYS SINCE ACTIVITY:")
                print("-" * 50)
                
                groups = data['data']['user_groups']
                for group_key, group_info in groups.items():
                    print(f"🗓️  {group_info['group_label']}")
                    print(f"   📈 Users: {group_info['user_count']}")
                    print(f"   👥 Users in this group:")
                    
                    for user in group_info['users']:
                        status_emoji = {
                            'active': '🟢',
                            'idle': '🟡', 
                            'offline': '⚫'
                        }.get(user['status'], '❓')
                        
                        print(f"      {status_emoji} {user['display_name']} ({user['user_email']})")
                        print(f"         📸 {user['screenshot_count']} screenshots")
                        print(f"         ⏰ Last activity: {user['last_activity']}")
                        print(f"         📂 {user['task_folder_count']} task folders")
                        print()
                    print()
            
            # Display summary statistics
            if 'summary' in data['data']:
                summary = data['data']['summary']
                print("📈 SUMMARY STATISTICS:")
                print("-" * 30)
                print(f"👥 Total Users: {summary['total_users']}")
                print(f"📸 Total Screenshots: {summary['total_screenshots']}")
                print(f"🟢 Active Users: {summary['active_users']}")
                print(f"🟡 Idle Users: {summary['idle_users']}")
                print(f"⚫ Offline Users: {summary['offline_users']}")
                print(f"📅 Total Groups: {summary['groups_count']}")
                print()
            
            # Display group statistics
            if 'group_statistics' in data['data']:
                group_stats = data['data']['group_statistics']
                print("📊 GROUP BREAKDOWN:")
                print("-" * 25)
                for group_key, stats in group_stats.items():
                    print(f"📅 {stats['label']}: {stats['count']} users")
                print()
            
            print("✨ API test completed successfully!")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"💬 Response: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")

if __name__ == "__main__":
    test_day_grouping_api()
