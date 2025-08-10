"""
Quick API Test - Test Amir's Screenshot Intervals
"""

import requests
import json

def test_amir_intervals():
    url = "http://localhost:5000/api/screenshots/user/amir/intervals"
    
    print("🧪 TESTING AMIR'S SCREENSHOT INTERVALS")
    print("=" * 50)
    print(f"🔗 URL: {url}")
    print("📡 Making request...")
    
    try:
        response = requests.get(url, timeout=30)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"⏱️  Response Time: {response.elapsed.total_seconds():.2f} seconds")
        print(f"📏 Response Size: {len(response.text)} bytes")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ SUCCESS! Response received:")
            print("-" * 30)
            
            # Pretty print the response
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Extract key information
            if 'status' in data:
                print(f"\n🎯 Status: {data['status']}")
                
                if data['status'] == 'success':
                    print(f"👤 User: {data.get('user_email', 'N/A')}")
                    print(f"📸 Total Screenshots: {data.get('total_screenshots', 0)}")
                    
                    if 'interval_statistics' in data:
                        stats = data['interval_statistics']
                        print(f"⏱️  Average Interval: {stats.get('average_interval_minutes', 0):.2f} minutes")
                        print(f"⚡ Min Interval: {stats.get('min_interval_minutes', 0):.2f} minutes")
                        print(f"🕐 Max Interval: {stats.get('max_interval_minutes', 0):.2f} minutes")
                    
                    if 'date_range' in data:
                        date_range = data['date_range']
                        print(f"📅 First Screenshot: {date_range.get('first_screenshot', 'N/A')}")
                        print(f"📅 Last Screenshot: {date_range.get('last_screenshot', 'N/A')}")
                        print(f"📊 Total Days: {date_range.get('total_days', 0)}")
                    
                    if 'recent_intervals' in data:
                        recent = data['recent_intervals']
                        print(f"🔄 Recent Intervals Available: {len(recent)}")
                        
                        if recent:
                            print("\n📋 Sample Recent Intervals:")
                            for i, interval in enumerate(recent[:3]):  # Show first 3
                                print(f"  {i+1}. {interval.get('from_time', 'N/A')} → {interval.get('to_time', 'N/A')}")
                                print(f"     ⏱️  Interval: {interval.get('interval_minutes', 0):.2f} minutes")
                
                elif data['status'] == 'no_data':
                    print("⚠️  No screenshot data found for Amir")
                elif data['status'] == 'error':
                    print(f"❌ Error: {data.get('error', 'Unknown error')}")
            
        else:
            print(f"\n❌ FAILED! HTTP {response.status_code}")
            print(f"📝 Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR! Server not running or not accessible")
        print("💡 Make sure Flask server is running on localhost:5000")
    except requests.exceptions.Timeout:
        print("⏱️  TIMEOUT ERROR! Request took too long (>30 seconds)")
        print("💡 Server might be processing large amount of data")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    test_amir_intervals()
