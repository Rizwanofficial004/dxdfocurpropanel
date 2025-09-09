#!/usr/bin/env python3
"""
Test script to verify screenshot proxy endpoint is working
This script tests if the proxy endpoint can actually serve the images.
"""

import requests
import sys

def test_proxy_endpoint():
    """Test the screenshot proxy endpoint"""
    
    # Generated proxy URL from previous test
    proxy_url = "https://dxdtime.ddsolutions.io/api/proxy/screenshot/users_screenshots/2025-09-01/nawaz_at_dxdglobal.com/2025-09-01_17-21-51.webp"
    
    print("🧪 Testing Screenshot Proxy Endpoint")
    print("=" * 60)
    print(f"📡 Proxy URL: {proxy_url}")
    print("-" * 60)
    
    try:
        # Make the request to the proxy endpoint
        print("⏳ Making request to proxy endpoint...")
        response = requests.get(proxy_url, timeout=15)
        
        print(f"✅ Response Status: {response.status_code}")
        print(f"📦 Content Type: {response.headers.get('content-type', 'Unknown')}")
        print(f"📏 Content Length: {response.headers.get('content-length', 'Unknown')} bytes")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'image' in content_type:
                print("✅ SUCCESS: Proxy endpoint is serving images correctly!")
                print(f"🖼️  Image format: {content_type}")
                return True
            else:
                print(f"⚠️  WARNING: Endpoint returned data but not an image")
                print(f"📄 Response preview: {response.text[:100]}...")
                return False
        elif response.status_code == 404:
            print("❌ ERROR: Proxy endpoint not found (404)")
            print("   The backend might not have the screenshot proxy implemented")
            return False
        elif response.status_code == 403:
            print("❌ ERROR: Access forbidden (403)")
            print("   The proxy might not have permission to access S3")
            return False
        else:
            print(f"❌ ERROR: Unexpected status code {response.status_code}")
            print(f"📄 Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ ERROR: Request timeout")
        print("   The proxy endpoint might be slow or unresponsive")
        return False
    except requests.exceptions.ConnectionError:
        print("🌐 ERROR: Connection error")
        print("   Check if the API server is accessible")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: Request failed - {e}")
        return False
    except Exception as e:
        print(f"❌ ERROR: Unexpected error - {e}")
        return False

def test_fallback_solution():
    """Test if we can access the original S3 URL directly"""
    
    original_url = "https://ddsfocustime.s3.amazonaws.com/users_screenshots/2025-09-01/nawaz_at_dxdglobal.com/2025-09-01_17-21-51.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARSU6EUUWMQ5I2JWC%2F20250909%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250909T162735Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=348c41538b4158d3d7817f4936f9a8faabb588a6924aae4426fe8e7fd8daa347"
    
    print("\n🔄 Testing Direct S3 Access (Fallback)")
    print("=" * 60)
    
    try:
        response = requests.get(original_url, timeout=10)
        if response.status_code == 200:
            print("✅ Direct S3 access works!")
            print("💡 Suggestion: Use original URLs as fallback if proxy fails")
            return True
        else:
            print(f"❌ Direct S3 access failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Direct S3 access error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Screenshot Access Testing")
    print("=" * 60)
    
    proxy_works = test_proxy_endpoint()
    
    if not proxy_works:
        print("\n🔄 Trying fallback solution...")
        fallback_works = test_fallback_solution()
        
        if fallback_works:
            print("\n💡 RECOMMENDATION:")
            print("   • Use original S3 URLs as fallback in the frontend")
            print("   • Implement CORS headers or use img crossOrigin='anonymous'")
            print("   • Consider implementing the proxy endpoint in the backend")
        else:
            print("\n❌ ISSUE SUMMARY:")
            print("   • Proxy endpoint not working")
            print("   • Direct S3 access also failing")
            print("   • Need to investigate backend proxy implementation")
    else:
        print("\n✅ SOLUTION CONFIRMED:")
        print("   • Proxy endpoint is working correctly")
        print("   • Images should load properly in the frontend")
        
    print("\n" + "=" * 60)
