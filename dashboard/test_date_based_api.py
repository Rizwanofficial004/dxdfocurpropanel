#!/usr/bin/env python3
"""
Test script for the new Date-Based Live Tracking Screenshots API
This API searches for users based on actual screenshot dates in filenames.
"""

import requests
import json
from datetime import datetime, timedelta

def test_date_based_api():
    """Test the new Date-Based Live Tracking API"""
    
    # API endpoint
    base_url = "http://127.0.0.1:8000"
    endpoint = "/api/live-tracking/screenshots-by-date/"
    
    # Test parameters
    params = {
        'days_back': 10,  # Search last 10 days
        'limit_users_per_day': 20,
        'limit_screenshots': 3,
        'include_screenshots': 'true',
        'sort_by': 'activity'
    }
    
    print("🚀 Testing Date-Based Live Tracking Screenshots API")
    print("=" * 70)
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
            
            # Display date groups information
            if 'date_groups' in data['data']:
                print("📅 USER ACTIVITY BY ACTUAL DATES:")
                print("-" * 60)
                
                date_groups = data['data']['date_groups']
                for group_key in sorted(date_groups.keys(), key=lambda x: date_groups[x]['days_ago']):
                    group_info = date_groups[group_key]
                    print(f"📆 {group_info['group_label']} ({group_info['activity_date']})")
                    print(f"   👥 Users: {group_info['user_count']}")
                    
                    if group_info['users']:
                        print(f"   📋 Active users on this date:")
                        for user in group_info['users']:
                            status_emoji = {
                                'active': '🟢',
                                'idle': '🟡', 
                                'offline': '⚫'
                            }.get(user['status'], '❓')
                            
                            print(f"      {status_emoji} {user['display_name']}")
                            print(f"         📧 {user['user_email']}")
                            print(f"         📸 {user['screenshot_count']} screenshots")
                            print(f"         📂 {user['task_folder_count']} task folders")
                            if user['screenshots']:
                                print(f"         🔗 Latest: {user['screenshots'][0]['filename']}")
                            print()
                    print()
            
            # Display summary statistics
            if 'summary' in data['data']:
                summary = data['data']['summary']
                print("📈 SUMMARY STATISTICS:")
                print("-" * 30)
                print(f"👥 Total Users Found: {summary['total_users']}")
                print(f"📸 Total Screenshots: {summary['total_screenshots']}")
                print(f"🟢 Active Users: {summary['active_users']}")
                print(f"🟡 Idle Users: {summary['idle_users']}")
                print(f"⚫ Offline Users: {summary['offline_users']}")
                print(f"📅 Active Days: {summary['groups_count']}")
                print(f"🔍 Date Range: {summary['search_date_range']}")
                print()
            
            # Display group statistics
            if 'group_statistics' in data['data']:
                group_stats = data['data']['group_statistics']
                print("📊 DAILY ACTIVITY BREAKDOWN:")
                print("-" * 35)
                for group_key in sorted(group_stats.keys(), key=lambda x: group_stats[x]['days_ago']):
                    stats = group_stats[group_key]
                    print(f"📅 {stats['label']} ({stats['activity_date']}): {stats['count']} users")
                print()
            
            # Test specific date searches
            print("🔬 TESTING SPECIFIC DATES:")
            print("-" * 30)
            
            # Test today specifically
            today_params = {
                'days_back': 1,  # Just today
                'limit_users_per_day': 50,
                'limit_screenshots': 5
            }
            
            today_response = requests.get(f"{base_url}{endpoint}", params=today_params)
            if today_response.status_code == 200:
                today_data = today_response.json()
                today_users = today_data['data']['summary']['total_users']
                today_screenshots = today_data['data']['summary']['total_screenshots']
                print(f"📅 Today's Activity: {today_users} users, {today_screenshots} screenshots")
            
            print()
            print("✨ Date-based API test completed successfully!")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"💬 Response: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")

if __name__ == "__main__":
    test_date_based_api()
