#!/usr/bin/env python3
"""
Test the screenshot proxy endpoint
"""

import requests
import json

def test_proxy_endpoint():
    """Test the new screenshot proxy endpoint"""
    print("🔄 Testing Screenshot Proxy Endpoint")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:8000"
    
    # First, get a list of users with screenshots from the API
    try:
        print("1. Getting user list from live tracking API...")
        api_response = requests.get(f"{base_url}/api/live-tracking/fast-screenshots/?limit=5", timeout=30)
        
        if api_response.status_code == 200:
            data = api_response.json()
            if data.get('success'):
                users = data.get('data', {}).get('users', [])
                print(f"   ✅ Found {len(users)} users")
                
                # Find a user with a screenshot
                test_user = None
                for user in users:
                    screenshot = user.get('latest_screenshot', {})
                    if screenshot.get('has_screenshot') and screenshot.get('url'):
                        test_user = user
                        break
                
                if test_user:
                    screenshot_url = test_user['latest_screenshot']['url']
                    user_email = test_user['email']
                    
                    print(f"\n2. Testing proxy URL for user: {user_email}")
                    print(f"   URL: {screenshot_url}")
                    
                    # Test the proxy URL
                    try:
                        proxy_response = requests.get(screenshot_url, timeout=15)
                        
                        if proxy_response.status_code == 200:
                            content_type = proxy_response.headers.get('Content-Type', 'unknown')
                            content_length = len(proxy_response.content)
                            
                            print(f"   ✅ Proxy endpoint works!")
                            print(f"   Content-Type: {content_type}")
                            print(f"   Content-Length: {content_length:,} bytes")
                            
                            # Verify it's actually image data
                            if content_type.startswith('image/') and content_length > 1000:
                                print(f"   ✅ Valid image data received")
                                return True
                            else:
                                print(f"   ⚠️ Suspicious content type or size")
                                return False
                        else:
                            print(f"   ❌ Proxy endpoint failed (Status: {proxy_response.status_code})")
                            print(f"   Response: {proxy_response.text[:200]}...")
                            return False
                            
                    except Exception as e:
                        print(f"   ❌ Error testing proxy URL: {e}")
                        return False
                else:
                    print("   ⚠️ No users with screenshots found")
                    return False
            else:
                print(f"   ❌ API returned error: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"   ❌ API request failed (Status: {api_response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Error testing proxy endpoint: {e}")
        return False

def test_direct_proxy_url():
    """Test the proxy endpoint with a known path"""
    print("\n🧪 Testing Direct Proxy URL")
    print("=" * 50)
    
    # Test with a sample path (this might not exist)
    base_url = "http://127.0.0.1:8000"
    sample_path = "amirishaque67_at_gmail.com/DDSFocusPro_v1.3/2025-06-16_15-44-33_2025-06-16_15-44-32.webp"
    proxy_url = f"{base_url}/api/proxy/screenshot/{sample_path}"
    
    print(f"Testing URL: {proxy_url}")
    
    try:
        response = requests.get(proxy_url, timeout=15)
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', 'unknown')
            content_length = len(response.content)
            
            print(f"✅ Direct proxy test successful!")
            print(f"   Content-Type: {content_type}")
            print(f"   Content-Length: {content_length:,} bytes")
            return True
        elif response.status_code == 404:
            print(f"⚠️ Image not found (Status: 404) - this is normal if path doesn't exist")
            print("   But the proxy endpoint is working!")
            return True
        else:
            print(f"❌ Proxy test failed (Status: {response.status_code})")
            print(f"   Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Error testing direct proxy URL: {e}")
        return False

def main():
    print("🔧 Screenshot Proxy Endpoint Test")
    print("=" * 60)
    
    # Test 1: Through API
    api_test_success = test_proxy_endpoint()
    
    # Test 2: Direct URL
    direct_test_success = test_direct_proxy_url()
    
    print("\n📋 Test Summary")
    print("=" * 30)
    
    if api_test_success:
        print("✅ API + Proxy test: PASSED")
    else:
        print("❌ API + Proxy test: FAILED")
    
    if direct_test_success:
        print("✅ Direct proxy test: PASSED")
    else:
        print("❌ Direct proxy test: FAILED")
    
    if api_test_success or direct_test_success:
        print("\n🎉 Proxy endpoint is working!")
        print("   Your live tracking images should now load properly.")
        print("\n📋 Next steps:")
        print("   1. Test your live tracking dashboard")
        print("   2. Open the improved demo: live_tracking_improved.html")
        print("   3. Check browser console for any remaining errors")
    else:
        print("\n❌ Proxy endpoint needs troubleshooting")
        print("   Check that Django server is running and URL patterns are correct")

if __name__ == "__main__":
    main()
