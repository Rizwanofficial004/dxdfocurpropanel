#!/usr/bin/env python3
"""
Comprehensive test of S3 screenshot access issues
"""

import requests
import json
from datetime import datetime

def test_live_api_and_urls():
    """Test the live API and check URL accessibility"""
    
    print("🧪 Testing S3 Screenshot Access Issues")
    print("=" * 60)
    
    # 1. Test the API endpoint
    api_url = "https://dxdtime.ddsolutions.io/api/live-tracking/fast-screenshots/"
    
    try:
        print("📡 Testing API endpoint...")
        response = requests.get(api_url, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API is working")
            
            # Extract sample URLs
            if data.get('data', {}).get('s3_users_sample'):
                sample_users = data['data']['s3_users_sample']
                print(f"📊 Found {len(sample_users)} users with screenshots")
                
                # Test each URL
                for i, user in enumerate(sample_users, 1):
                    user_email = user.get('user_email', '').replace('_at_', '@')
                    url = user.get('latest_file_url', '')
                    
                    print(f"\n👤 User {i}: {user_email}")
                    print(f"🔗 URL: {url[:80]}...")
                    
                    # Test URL accessibility
                    try:
                        img_response = requests.head(url, timeout=10)
                        if img_response.status_code == 200:
                            print(f"✅ Image accessible: {img_response.headers.get('content-type', 'unknown type')}")
                        elif img_response.status_code == 403:
                            print("❌ Access forbidden (CORS/permissions issue)")
                        elif img_response.status_code == 404:
                            print("❌ Image not found (URL expired)")
                        else:
                            print(f"❌ HTTP {img_response.status_code}")
                            
                    except requests.exceptions.RequestException as e:
                        print(f"❌ Request failed: {str(e)[:50]}...")
                
                return data
            else:
                print("❌ No user samples found in API response")
                return None
        else:
            print(f"❌ API failed: HTTP {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return None

def suggest_solutions(api_data):
    """Suggest solutions based on test results"""
    
    print("\n" + "=" * 60)
    print("💡 RECOMMENDED SOLUTIONS")
    print("=" * 60)
    
    print("\n🔧 Option 1: Backend Proxy (RECOMMENDED)")
    print("   Implement /api/proxy/screenshot/ endpoint in your Django backend:")
    print("   • Handles CORS automatically")
    print("   • Can refresh S3 URLs server-side")
    print("   • Better security and caching")
    
    print("\n🔧 Option 2: CORS Configuration")
    print("   Configure S3 bucket CORS policy:")
    print("   • Allow Origins: https://dxdtime.ddsolutions.io")
    print("   • Allow Methods: GET")
    print("   • Allow Headers: *")
    
    print("\n🔧 Option 3: Refresh API Enhancement")
    print("   Modify your API to return fresh URLs:")
    print("   • Generate URLs with longer expiration (max 7 days)")
    print("   • Add refresh endpoint for expired URLs")
    print("   • Include URL expiration timestamp in response")
    
    print("\n🔧 Option 4: Frontend Fallback")
    print("   Implement graceful degradation in React:")
    print("   • Show placeholder when image fails")
    print("   • Auto-retry with fresh API call")
    print("   • Display file info even without image")

if __name__ == "__main__":
    api_data = test_live_api_and_urls()
    suggest_solutions(api_data)
