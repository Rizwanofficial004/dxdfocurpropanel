#!/usr/bin/env python3
"""
Test the ultra-fast screenshots API
"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8005/api"

def test_api_endpoint(endpoint, description):
    """Test an API endpoint and measure response time"""
    print(f"\n🧪 Testing: {description}")
    print(f"📡 URL: {BASE_URL}{endpoint}")
    
    start_time = time.time()
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Response time: {response_time:.2f}ms")
            
            if 'data' in data:
                result_data = data['data']
                if 'total_users_returned' in result_data:
                    print(f"👥 Users returned: {result_data['total_users_returned']}")
                if 'total_screenshots' in result_data:
                    print(f"📸 Total screenshots: {result_data['total_screenshots']:,}")
                if 'cache_type' in result_data:
                    print(f"💾 Cache type: {result_data['cache_type']}")
                    
            print(f"📋 Message: {data.get('message', 'No message')}")
            
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

def main():
    """Test all the screenshot APIs"""
    print("🚀 Testing Ultra-Fast Screenshots API System")
    print("=" * 60)
    
    # Test ultra-fast API with different parameters
    test_api_endpoint("/screenshots/ultra-fast/", "Ultra-Fast API (default)")
    test_api_endpoint("/screenshots/ultra-fast/?limit=5", "Ultra-Fast API (top 5 users)")
    test_api_endpoint("/screenshots/ultra-fast/?user=amirishaque67@gmail.com", "Ultra-Fast API (specific user)")
    test_api_endpoint("/screenshots/ultra-fast/?sort_by=size", "Ultra-Fast API (sorted by size)")
    
    # Test cache status
    test_api_endpoint("/screenshots/cache-status/", "Cache Status API")
    
    # Test other fast APIs for comparison
    test_api_endpoint("/screenshots/fast-all/?limit_users=5", "Fast API (for comparison)")
    
    print(f"\n🎉 Testing completed!")
    print(f"🏆 The Ultra-Fast API should respond in under 50ms!")

if __name__ == "__main__":
    main()
