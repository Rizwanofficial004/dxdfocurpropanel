#!/usr/bin/env python3
"""
Final API Test - Check if the screenshot count API is working
"""
import requests
import json
import time
import sys

def test_api():
    print("🧪 FINAL API TEST")
    print("=" * 60)
    
    api_url = "http://127.0.0.1:8001/api/actual-count-total/screenshots/"
    
    try:
        print(f"📡 Testing: {api_url}")
        print("⏳ Making request...")
        
        start_time = time.time()
        response = requests.get(api_url, timeout=60)
        response_time = time.time() - start_time
        
        print(f"⏱️  Response time: {response_time:.2f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! API is working!")
            
            try:
                data = response.json()
                
                print(f"\n🔍 RESPONSE ANALYSIS:")
                print(f"   Type: {type(data)}")
                
                if isinstance(data, dict):
                    print(f"   Keys: {list(data.keys())}")
                    
                    if 'success' in data and data['success']:
                        print(f"   ✅ Success: {data['success']}")
                        print(f"   📊 Total Users: {data.get('total_users', 'N/A')}")
                        print(f"   📸 Total Screenshots: {data.get('total_screenshots', 'N/A')}")
                        print(f"   🔗 Status: {data.get('status', 'N/A')}")
                        
                        if 'users' in data and len(data['users']) > 0:
                            print(f"\n📋 SAMPLE USER DATA (First 3):")
                            for i, user in enumerate(data['users'][:3]):
                                print(f"   User {i+1}: {user.get('user_email', 'Unknown')} - {user.get('screenshot_count', 0)} screenshots")
                            
                            print(f"\n📈 STATISTICS:")
                            total = data.get('total_screenshots', 0)
                            users_count = data.get('total_users', 0)
                            if users_count > 0:
                                print(f"   Average per user: {total/users_count:.1f}")
                            
                            print(f"\n🚀 API FULLY FUNCTIONAL WITH REAL DATA!")
                            return True
                        else:
                            print("⚠️  No users data found in response")
                    
                    elif 'error' in data:
                        print(f"   ❌ API Error: {data['error']}")
                        print(f"   📝 Message: {data.get('message', 'No message')}")
                
                # Show raw response preview
                print(f"\n📄 RESPONSE PREVIEW:")
                preview = json.dumps(data, indent=2)[:800]
                print(preview)
                if len(preview) >= 800:
                    print("... (truncated)")
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON Error: {e}")
                print(f"Raw response: {response.text[:300]}")
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Server not running")
        print("💡 Make sure: python manage.py runserver 8001 is running")
        return False
        
    except requests.exceptions.Timeout:
        print("⏰ TIMEOUT: API took too long")
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return False

def test_health_check():
    """Test health check endpoint"""
    print("\n🏥 TESTING HEALTH CHECK...")
    
    try:
        response = requests.get("http://127.0.0.1:8001/api/health/", timeout=10)
        print(f"   Health Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Health check passed")
        
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")

if __name__ == "__main__":
    # Test the main API
    success = test_api()
    
    # Test health check
    test_health_check()
    
    print("\n" + "="*60)
    if success:
        print("🎉 SUCCESS! The API is working correctly!")
        print("🚀 Ready for production deployment!")
    else:
        print("⚠️  API needs attention")
    
    print("\n📋 NEXT STEPS:")
    print("   1. ✅ API tested and working")
    print("   2. 🗄️  Run migrations: python manage.py migrate")
    print("   3. 🚀 Deploy to production server")
    print("   4. 🧪 Run production tests")
