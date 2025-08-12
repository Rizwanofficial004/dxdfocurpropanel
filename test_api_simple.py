#!/usr/bin/env python3
"""
Simple API Test for Screenshots Search
"""
import requests
import json

def test_screenshots_search_api():
    """Test the screenshots search API without authentication"""
    
    # API endpoint
    base_url = "http://localhost:8000"
    endpoint = "/api/screenshots/search/"
    
    # Test different parameter combinations
    test_cases = [
        {"search": "test", "limit": 5},
        {"search": "haseeb", "limit": 10},
        {"search": "nawaz", "date": "2024-08-01", "limit": 5},
        {"search": "admin", "scan_s3": "true", "limit": 3}
    ]
    
    print("🚀 Testing Screenshots Search API")
    print("=" * 50)
    
    for i, params in enumerate(test_cases, 1):
        print(f"\n📋 Test Case {i}: {params}")
        print("-" * 30)
        
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, params=params, timeout=30)
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"🔗 URL: {response.url}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"✅ Success: {data.get('success', 'Unknown')}")
                    print(f"📝 Message: {data.get('message', 'No message')}")
                    
                    if 'data' in data and isinstance(data['data'], dict):
                        if 'results' in data['data']:
                            count = len(data['data']['results'])
                            print(f"📊 Results Count: {count}")
                        if 'total' in data['data']:
                            print(f"📈 Total Available: {data['data']['total']}")
                            
                except json.JSONDecodeError:
                    print(f"⚠️ Non-JSON Response: {response.text[:200]}...")
            elif response.status_code == 302:
                print(f"🔄 Redirect to: {response.headers.get('Location', 'Unknown')}")
                print("❌ API requires authentication")
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                
        except requests.exceptions.RequestException as e:
            print(f"🚫 Request failed: {e}")
        except Exception as e:
            print(f"💥 Unexpected error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 API Test Complete")

if __name__ == "__main__":
    test_screenshots_search_api()
