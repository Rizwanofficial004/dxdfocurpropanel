#!/usr/bin/env python3
"""
Test Screenshot Count API
"""
import requests
import json
from datetime import datetime

# API endpoint
API_URL = "http://127.0.0.1:8000/api/actual-count-total/screenshots/"

def test_screenshot_api():
    """Test the screenshot count API"""
    print("🧪 Testing Screenshot Count API")
    print("=" * 50)
    print(f"📡 URL: {API_URL}")
    
    try:
        # Make the API request
        print("📤 Making API request...")
        response = requests.get(API_URL, headers={
            'Accept': 'application/json',
            'User-Agent': 'Screenshot-API-Tester/1.0'
        })
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ API request successful!")
            
            # Parse JSON response
            data = response.json()
            print("\n📄 API Response:")
            print(json.dumps(data, indent=2))
            
            # Analyze the data
            if isinstance(data, list):
                print(f"\n📊 Analysis:")
                print(f"   🧑‍💼 Total users: {len(data)}")
                
                if data:
                    total_screenshots = sum(user.get('screenshot_count', 0) for user in data)
                    print(f"   📸 Total screenshots: {total_screenshots:,}")
                    
                    # Show a few examples
                    print(f"\n📋 Sample entries:")
                    for i, user in enumerate(data[:3]):
                        email = user.get('user_email', 'N/A')
                        count = user.get('screenshot_count', 0)
                        last_updated = user.get('last_updated', 'N/A')
                        print(f"   {i+1}. {email}: {count:,} screenshots (updated: {last_updated})")
                        
                    if len(data) > 3:
                        print(f"   ... and {len(data) - 3} more users")
                        
        else:
            print(f"❌ API request failed!")
            print(f"🔍 Response text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed! Is the Django server running?")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        print(f"🔍 Raw response: {response.text}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_screenshot_api()
