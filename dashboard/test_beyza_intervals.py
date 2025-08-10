"""
Test Beyza's Intervals - Verify Working Example
"""

import requests
import json
from datetime import datetime

def test_beyza_intervals():
    url = "http://localhost:5000/api/screenshots/user/beyza-donmez-@hotmail.com/intervals"
    
    print("🧪 TESTING BEYZA'S INTERVALS - WORKING EXAMPLE")
    print("=" * 60)
    print(f"🔗 URL: {url}")
    print(f"📅 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    try:
        print("📡 Making request...")
        start_time = datetime.now()
        
        response = requests.get(url, timeout=30)
        
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds()
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"⏱️  Response Time: {response_time:.2f} seconds")
        print(f"📏 Response Size: {len(response.text):,} bytes")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS! Processing response...")
            
            data = response.json()
            
            # Print response (truncated if too long)
            if len(response.text) > 1000:
                print("📄 RESPONSE (truncated):")
                print(json.dumps(data, indent=2)[:800] + "...")
            else:
                print("📄 FULL RESPONSE:")
                print(json.dumps(data, indent=2))
            
            print(f"\n🔸 Status: {data.get('status', 'unknown')}")
            
            if data.get('status') == 'success':
                print("🎉 INTERVALS DATA WORKING!")
                print(f"👤 User: {data.get('user_email', 'N/A')}")
                print(f"📸 Total Screenshots: {data.get('total_screenshots', 0):,}")
                
                if 'interval_statistics' in data:
                    stats = data['interval_statistics']
                    print(f"⏱️  Total Intervals: {stats.get('total_intervals', 0):,}")
                    print(f"⏱️  Average Interval: {stats.get('average_interval_minutes', 0):.2f} min")
            
            elif data.get('status') == 'no_data':
                print("⚠️  No data found for Beyza")
            
            elif data.get('status') == 'error':
                print(f"❌ Error: {data.get('error', 'Unknown')}")
        
        else:
            print(f"\n❌ Failed: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 TEST COMPLETED")

if __name__ == "__main__":
    test_beyza_intervals()
