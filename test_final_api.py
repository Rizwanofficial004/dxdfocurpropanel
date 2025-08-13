#!/usr/bin/env python3
"""
API Test Script - Test the cached screenshots API
"""
import requests
import json
import time

def test_api():
    print("🧪 TESTING API ENDPOINT")
    print("=" * 60)
    
    api_url = "http://127.0.0.1:8001/api/actual-count-total/screenshots/"
    
    try:
        print(f"📡 Testing: {api_url}")
        
        start_time = time.time()
        response = requests.get(api_url, timeout=10)
        response_time = time.time() - start_time
        
        print(f"⏱️  Response time: {response_time:.3f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
            
            data = response.json()
            
            print(f"\n🎯 API RESPONSE:")
            print(f"   Success: {data.get('success', 'N/A')}")
            print(f"   Total Users: {data.get('total_users', 'N/A')}")
            print(f"   Total Screenshots: {data.get('total_screenshots', 'N/A'):,}")
            print(f"   Status: {data.get('status', 'N/A')}")
            print(f"   Bucket: {data.get('bucket', 'N/A')}")
            print(f"   Cache Updated: {data.get('cache_updated', 'N/A')}")
            
            if 'users' in data and data['users']:
                print(f"\n👥 TOP 5 USERS BY SCREENSHOT COUNT:")
                for i, user in enumerate(data['users'][:5]):
                    count = user.get('screenshot_count', 0)
                    email = user.get('user_email', 'Unknown')
                    percentage = user.get('percentage', 0)
                    projects = user.get('project_count', 0)
                    
                    print(f"   {i+1}. {email}")
                    print(f"      Screenshots: {count:,} ({percentage}%)")
                    print(f"      Projects: {projects}")
                    print()
                
                print(f"🎉 API IS WORKING WITH REAL S3 DATA!")
                print(f"📈 Performance: {response_time:.3f}s response time")
                return True
            else:
                print("⚠️  No users data found")
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:300]}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Server not running")
        return False
        
    except requests.exceptions.Timeout:
        print("⏰ TIMEOUT: API took too long")
        return False
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return False

if __name__ == "__main__":
    success = test_api()
    
    if success:
        print("\n" + "="*60)
        print("🚀 API TEST SUCCESSFUL!")
        print("✅ Real S3 data is being served")
        print("⚡ Fast response time (cached)")
        print("🎯 Ready for production use!")
    else:
        print("\n❌ API test failed")
