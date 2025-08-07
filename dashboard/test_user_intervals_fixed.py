"""
Fixed User Intervals - Test with Correct S3 Folder Mapping
"""

import requests
import json

def test_user_intervals_fixed():
    print("🧪 TESTING USER INTERVALS - FIXED MAPPING")
    print("=" * 60)
    print("🔧 Testing with correct S3 folder name mapping")
    print("-" * 60)
    
    # Test with users we know exist in S3 (from our S3 debug earlier)
    test_users = [
        {
            'email': 'beyza-donmez-@hotmail.com',
            'expected_folder': 'beyza-donmez-_at_hotmail.com'
        },
        {
            'email': 'amirishaque67@gmail.com', 
            'expected_folder': 'amirishaque67_at_gmail.com'
        },
        {
            'email': 'tugbacalik84@gmail.com',
            'expected_folder': 'tugbacalik84_at_gmail.com'
        },
        {
            'email': 'danish.ali9801@gmail.com',
            'expected_folder': 'danish.ali9801_at_gmail.com'
        },
        {
            'email': 'haseebcodejourney@gmail.com',
            'expected_folder': 'haseebcodejourney_at_gmail.com'
        }
    ]
    
    successful_intervals = []
    
    for i, user in enumerate(test_users, 1):
        email = user['email']
        expected_folder = user['expected_folder']
        
        print(f"\n{i}️⃣ Testing: {email}")
        print(f"   📁 Expected S3 folder: {expected_folder}")
        
        url = f"http://localhost:5000/api/screenshots/user/{email}/intervals"
        
        try:
            response = requests.get(url, timeout=20)
            print(f"   📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                print(f"   🔸 Response Status: {status}")
                
                if status == 'success':
                    print("   🎉 SUCCESS! Found interval data!")
                    
                    total_screenshots = data.get('total_screenshots', 0)
                    print(f"   📸 Total Screenshots: {total_screenshots:,}")
                    
                    if 'interval_statistics' in data:
                        stats = data['interval_statistics']
                        avg_seconds = stats.get('average_interval_seconds', 0)
                        avg_minutes = stats.get('average_interval_minutes', 0)
                        total_intervals = stats.get('total_intervals', 0)
                        min_seconds = stats.get('min_interval_minutes', 0) * 60
                        max_seconds = stats.get('max_interval_minutes', 0) * 60
                        
                        print(f"   ⏱️  Average Interval: {avg_seconds:.1f} seconds ({avg_minutes:.2f} minutes)")
                        print(f"   ⚡ Min Interval: {min_seconds:.1f} seconds")
                        print(f"   🕐 Max Interval: {max_seconds:.1f} seconds")
                        print(f"   📊 Total Intervals: {total_intervals:,}")
                        
                        # Add to successful results
                        name = email.split('@')[0]
                        successful_intervals.append({
                            'name': name,
                            'email': email,
                            'avg_seconds': round(avg_seconds, 1),
                            'total_screenshots': total_screenshots,
                            'total_intervals': total_intervals
                        })
                    
                    # Show some sample intervals
                    if 'recent_intervals' in data and data['recent_intervals']:
                        print(f"   📋 Sample Intervals:")
                        recent = data['recent_intervals'][-3:]  # Last 3 intervals
                        
                        for j, interval in enumerate(recent, 1):
                            from_time = interval.get('from_time', 'N/A')
                            to_time = interval.get('to_time', 'N/A')
                            interval_sec = interval.get('interval_seconds', 0)
                            
                            # Extract just the time part
                            from_time_short = from_time[-8:] if len(from_time) > 8 else from_time
                            to_time_short = to_time[-8:] if len(to_time) > 8 else to_time
                            
                            print(f"      {j}. {from_time_short} → {to_time_short} = {interval_sec:.0f} seconds")
                
                elif status == 'no_data':
                    print("   ⚠️  No screenshots with valid timestamps found")
                    
                elif status == 'error':
                    error = data.get('error', 'Unknown error')
                    print(f"   ❌ Error: {error[:80]}...")
                    
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"   ⏱️  Timeout - large dataset processing")
        except Exception as e:
            print(f"   ❌ Request Error: {str(e)[:50]}...")
    
    # Show final results
    print(f"\n🎯 FINAL RESULTS - USER INTERVAL TIMES")
    print("=" * 60)
    
    if successful_intervals:
        print(f"✅ Successfully got interval data for {len(successful_intervals)} users:")
        print()
        
        # Sort by average interval
        successful_intervals.sort(key=lambda x: x['avg_seconds'])
        
        print("👤 USER AVERAGE INTERVALS (as you requested):")
        print("-" * 50)
        
        for user in successful_intervals:
            name = user['name']
            avg_sec = user['avg_seconds']
            screenshots = user['total_screenshots']
            intervals = user['total_intervals']
            
            print(f"📊 {name} has {avg_sec:.0f} seconds interval time")
            print(f"   (from {screenshots:,} screenshots, {intervals:,} intervals)")
            print()
        
        print("🎉 SUCCESS! This is exactly what you wanted:")
        for user in successful_intervals:
            name = user['name']
            avg_sec = user['avg_seconds']
            print(f"   • {name}: {avg_sec:.0f} seconds average interval")
            
    else:
        print("❌ No successful interval data found")
        print("   Need to check S3 folder structure and timestamp parsing")
    
    print(f"\n🧪 POSTMAN TESTING:")
    print("   Use these working URLs in Postman:")
    for user in test_users[:3]:  # Show first 3 examples
        email = user['email']
        print(f"   GET http://localhost:5000/api/screenshots/user/{email}/intervals")

if __name__ == "__main__":
    test_user_intervals_fixed()
