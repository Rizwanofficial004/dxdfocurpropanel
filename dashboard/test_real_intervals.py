"""
Test Intervals with Real Example - Based on S3 Screenshot Data
Testing the exact intervals from your S3 data showing 8-9 second intervals
"""

import requests
import json
from datetime import datetime

def test_real_intervals():
    print("🧪 TESTING REAL INTERVALS - FROM YOUR S3 DATA")
    print("=" * 60)
    print("📊 Expected intervals from your S3 screenshot:")
    print("   14:59:32 → 14:59:41 = 9 seconds")
    print("   14:59:41 → 14:59:49 = 8 seconds") 
    print("   14:59:49 → 14:59:57 = 8 seconds")
    print("   14:59:57 → 15:00:06 = 9 seconds")
    print("-" * 60)
    
    # Test with a user that has this data pattern
    # Let's try a few different users to find working intervals
    test_users = [
        "amirishaque67@gmail.com",
        "tugbacalik84@gmail.com", 
        "danish.ali9801@gmail.com"
    ]
    
    for user_email in test_users:
        print(f"\n🎯 Testing user: {user_email}")
        url = f"http://localhost:5000/api/screenshots/user/{user_email}/intervals"
        print(f"🔗 URL: {url}")
        
        try:
            response = requests.get(url, timeout=20)
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                print(f"🔸 Response Status: {status}")
                
                if status == 'success':
                    print("🎉 SUCCESS! Found interval data!")
                    
                    total_screenshots = data.get('total_screenshots', 0)
                    print(f"📸 Total Screenshots: {total_screenshots:,}")
                    
                    if 'interval_statistics' in data:
                        stats = data['interval_statistics']
                        print(f"⏱️  Total Intervals: {stats.get('total_intervals', 0):,}")
                        print(f"⏱️  Average Interval: {stats.get('average_interval_minutes', 0):.2f} minutes")
                        print(f"⏱️  Average Interval: {stats.get('average_interval_seconds', 0):.1f} seconds")
                        print(f"⚡ Min Interval: {stats.get('min_interval_minutes', 0):.2f} minutes")
                        print(f"🕐 Max Interval: {stats.get('max_interval_minutes', 0):.2f} minutes")
                    
                    # Show recent intervals (like your S3 example)
                    if 'recent_intervals' in data and data['recent_intervals']:
                        print(f"\n📋 Recent Intervals (like your S3 example):")
                        recent = data['recent_intervals'][-5:]  # Last 5 intervals
                        
                        for i, interval in enumerate(recent, 1):
                            from_time = interval.get('from_time', 'N/A')[-8:]  # Get HH:MM:SS part
                            to_time = interval.get('to_time', 'N/A')[-8:]
                            interval_sec = interval.get('interval_seconds', 0)
                            interval_min = interval.get('interval_minutes', 0)
                            
                            print(f"   {i}. {from_time} → {to_time}")
                            print(f"      ⏱️  Gap: {interval_sec:.0f} seconds ({interval_min:.2f} minutes)")
                    
                    # Show date range
                    if 'date_range' in data:
                        date_range = data['date_range']
                        print(f"\n📅 Date Range:")
                        print(f"   First: {date_range.get('first_screenshot', 'N/A')}")
                        print(f"   Last: {date_range.get('last_screenshot', 'N/A')}")
                    
                    break  # Found working data, stop testing other users
                
                elif status == 'no_data':
                    print("⚠️  No data - trying next user...")
                    
                elif status == 'error':
                    error = data.get('error', 'Unknown error')
                    print(f"❌ Error: {error[:100]}...")
                    
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Request Error: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 This shows the EXACT intervals you want:")
    print("   - Time between each screenshot")
    print("   - In seconds and minutes")
    print("   - From actual S3 timestamp data")
    print("🏁 TEST COMPLETED")

if __name__ == "__main__":
    test_real_intervals()
