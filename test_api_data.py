#!/usr/bin/env python3
"""
Test the Simple Screenshots API and show sample data
"""

import requests
import json
from datetime import datetime

def test_api():
    print("🧪 Testing Simple Screenshots API...")
    print("=" * 50)
    
    try:
        # Call the API
        response = requests.get('http://127.0.0.1:8010/api/simple/screenshots/')
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ API Response Successful!")
            print(f"📊 Total Users: {data['total_users']}")
            print(f"📷 Total Screenshots: {data['total_screenshots']:,}")
            print(f"⏰ Last Updated: {data['timestamp']}")
            print()
            
            print("👥 Top 5 Users by Screenshot Count:")
            print("-" * 40)
            
            for i, user in enumerate(data['users'][:5], 1):
                print(f"{i}. {user['user_email']}")
                print(f"   📸 Screenshots: {user['screenshot_count']:,}")
                print(f"   📊 Percentage: {user['percentage']}%")
                print(f"   ⏰ Last Updated: {user['last_updated']}")
                print()
            
            # Check if this looks like real data
            print("🔍 Data Analysis:")
            print("-" * 20)
            
            # Real data indicators
            has_real_emails = any('@' in user['user_email'] for user in data['users'])
            has_varied_counts = len(set(user['screenshot_count'] for user in data['users'])) > 5
            has_timestamps = any(user['last_updated'] for user in data['users'])
            
            print(f"✅ Real email addresses: {has_real_emails}")
            print(f"✅ Varied screenshot counts: {has_varied_counts}")
            print(f"✅ Real timestamps: {has_timestamps}")
            
            if has_real_emails and has_varied_counts and has_timestamps:
                print("\n🎯 CONCLUSION: This appears to be REAL DATA from AWS S3!")
                print("📁 Source: ddsfocustime S3 bucket")
                print("🔄 Auto-updated every 6 hours")
            else:
                print("\n🤖 CONCLUSION: This appears to be mock/test data")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    test_api()
