"""
Get Interval Times for All Users
Shows average interval time for each user (like Haseeb: 9 seconds, Amir: 10 seconds)
"""

import requests
import json
from datetime import datetime

def get_all_users_intervals():
    print("🧪 GETTING INTERVAL TIMES FOR ALL USERS")
    print("=" * 60)
    print("🎯 Goal: Show average interval time for each user")
    print("   Example: Haseeb = 9 sec, Amir = 10 sec, etc.")
    print("-" * 60)
    
    # Step 1: Get all users first
    print("1️⃣ Getting all users...")
    try:
        response = requests.get("http://localhost:5000/api/screenshots/all")
        if response.status_code != 200:
            print(f"❌ Failed to get users: {response.status_code}")
            return
        
        all_data = response.json()
        if 'data' not in all_data or 'user_counts' not in all_data['data']:
            print("❌ Invalid response structure")
            return
        
        user_counts = all_data['data']['user_counts']
        print(f"✅ Found {len(user_counts)} users")
        
        # Step 2: Test intervals for each user
        print(f"\n2️⃣ Getting interval times for each user...")
        print("-" * 40)
        
        user_intervals = []
        tested_count = 0
        max_tests = 10  # Test first 10 users to avoid long wait
        
        for email, screenshot_count in user_counts.items():
            if tested_count >= max_tests:
                break
                
            tested_count += 1
            print(f"\n🔍 Testing user {tested_count}/{max_tests}: {email}")
            print(f"   📸 Screenshots: {screenshot_count:,}")
            
            # Get intervals for this user
            url = f"http://localhost:5000/api/screenshots/user/{email}/intervals"
            
            try:
                response = requests.get(url, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    status = data.get('status', 'unknown')
                    
                    if status == 'success':
                        stats = data.get('interval_statistics', {})
                        avg_seconds = stats.get('average_interval_seconds', 0)
                        avg_minutes = stats.get('average_interval_minutes', 0)
                        total_intervals = stats.get('total_intervals', 0)
                        
                        user_intervals.append({
                            'email': email,
                            'screenshot_count': screenshot_count,
                            'avg_interval_seconds': round(avg_seconds, 1),
                            'avg_interval_minutes': round(avg_minutes, 2),
                            'total_intervals': total_intervals
                        })
                        
                        print(f"   ✅ Average Interval: {avg_seconds:.1f} seconds ({avg_minutes:.2f} minutes)")
                        print(f"   📊 Total Intervals: {total_intervals:,}")
                        
                    elif status == 'no_data':
                        print(f"   ⚠️  No timestamp data found")
                        
                    elif status == 'error':
                        error_msg = data.get('error', 'Unknown error')
                        if 'No screenshots' in error_msg:
                            print(f"   ⚠️  No valid screenshots")
                        else:
                            print(f"   ❌ Error: {error_msg[:50]}...")
                else:
                    print(f"   ❌ HTTP {response.status_code}")
                    
            except requests.exceptions.Timeout:
                print(f"   ⏱️  Timeout (processing large dataset)")
            except Exception as e:
                print(f"   ❌ Error: {str(e)[:50]}...")
        
        # Step 3: Show results summary
        print(f"\n3️⃣ INTERVAL TIMES SUMMARY")
        print("=" * 60)
        
        if user_intervals:
            print(f"📊 Successfully got interval data for {len(user_intervals)} users:")
            print()
            
            # Sort by average interval time
            user_intervals.sort(key=lambda x: x['avg_interval_seconds'])
            
            print("👤 USER INTERVAL TIMES (sorted by average interval):")
            print("-" * 50)
            
            for i, user in enumerate(user_intervals, 1):
                email = user['email']
                name = email.split('@')[0]  # Get name part before @
                avg_sec = user['avg_interval_seconds']
                avg_min = user['avg_interval_minutes']
                screenshots = user['screenshot_count']
                intervals = user['total_intervals']
                
                print(f"{i:2d}. {name:<20} = {avg_sec:>6.1f} seconds ({avg_min:>5.2f} min)")
                print(f"    📸 {screenshots:,} screenshots, {intervals:,} intervals")
            
            # Show examples like you wanted
            print(f"\n🎯 EXAMPLES (as you requested):")
            print("-" * 30)
            for user in user_intervals[:5]:  # Show first 5 examples
                name = user['email'].split('@')[0]
                avg_sec = user['avg_interval_seconds']
                print(f"   {name} has {avg_sec:.0f} seconds interval time")
        
        else:
            print("❌ No interval data found for any users")
            print("   This might be due to:")
            print("   - Timestamp parsing issues")
            print("   - S3 folder structure issues")
            print("   - No valid screenshot files")
        
    except Exception as e:
        print(f"❌ Error getting users: {e}")
    
    print(f"\n" + "=" * 60)
    print("🏁 INTERVAL ANALYSIS COMPLETED")
    print()
    print("🧪 For Postman testing, use these endpoints:")
    print("   GET /api/screenshots/all  (get all users)")
    print("   GET /api/screenshots/user/{email}/intervals  (get specific user intervals)")

if __name__ == "__main__":
    get_all_users_intervals()
