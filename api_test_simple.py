import requests
import json
import time

def test_api():
    """Test the APIs"""
    base_url = "http://127.0.0.1:8010/api"
    
    print("🚀 API Testing Started")
    print("=" * 50)
    
    # Test endpoints
    endpoints = [
        "/test/",
        "/screenshots/ultra-fast/",
        "/screenshots/ultra-fast/?limit=3",
        "/screenshots/tracking-status/",
        "/screenshots/fast-all/?limit_users=3",
        "/screenshots/users/",
    ]
    
    for endpoint in endpoints:
        url = base_url + endpoint
        print(f"\n🧪 Testing: {endpoint}")
        print(f"URL: {url}")
        
        try:
            start_time = time.time()
            response = requests.get(url, timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000
            
            print(f"⏱️  Response Time: {response_time:.2f}ms")
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"✅ SUCCESS!")
                    
                    # Print key information
                    if 'success' in data:
                        print(f"   Success: {data['success']}")
                    if 'message' in data:
                        print(f"   Message: {data['message']}")
                    if 'data' in data and isinstance(data['data'], dict):
                        data_info = data['data']
                        if 'total_users_returned' in data_info:
                            print(f"   Users: {data_info['total_users_returned']}")
                        if 'total_screenshots' in data_info:
                            print(f"   Screenshots: {data_info['total_screenshots']:,}")
                        if 'users' in data_info and isinstance(data_info['users'], list):
                            print(f"   Sample Users: {len(data_info['users'])}")
                            for user in data_info['users'][:2]:
                                if isinstance(user, dict) and 'employee_email' in user:
                                    print(f"     - {user['employee_email']}: {user.get('screenshot_count', 0):,} screenshots")
                    
                except json.JSONDecodeError as e:
                    print(f"⚠️  JSON Error: {e}")
                    print(f"   Raw response: {response.text[:200]}")
                    
            else:
                print(f"❌ FAILED!")
                print(f"   Error: {response.text[:200]}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ CONNECTION ERROR - Server not running?")
        except requests.exceptions.Timeout:
            print(f"❌ TIMEOUT ERROR")
        except Exception as e:
            print(f"❌ UNEXPECTED ERROR: {e}")
    
    print(f"\n🎉 Testing Complete!")

if __name__ == "__main__":
    test_api()
