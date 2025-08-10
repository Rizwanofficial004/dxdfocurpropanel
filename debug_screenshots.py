#!/usr/bin/env python3
"""
Debug script to test screenshot URLs and proxy endpoints
"""
import requests
import json

def test_backend_connection():
    """Test if Django backend is running"""
    try:
        response = requests.get('http://localhost:8000/api/users/s3-suggestions/?q=tugba', timeout=10)
        print(f"✅ Backend is accessible: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Found {len(data)} suggestions")
            if data:
                print(f"📝 First suggestion: {data[0]}")
        return True
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def test_screenshot_api():
    """Test the screenshots API for tugbacalik84_at_gmail.com"""
    email = "tugbacalik84_at_gmail.com"
    folder = "PODOKTOR_2025_AĞUSTOS_Genel_Grafik_Tasarımı_&_İçerik_Üretimi"
    
    url = f"http://localhost:8000/api/screenshots/employee/{email}/folders/{folder}/?page=1&per_page=20"
    print(f"🔍 Testing screenshots API: {url}")
    
    try:
        response = requests.get(url, timeout=15)
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📸 Found {len(data.get('results', []))} screenshots")
            
            for i, screenshot in enumerate(data.get('results', [])[:3]):
                print(f"\n📷 Screenshot {i+1}:")
                print(f"  📄 Filename: {screenshot.get('filename', 'N/A')}")
                print(f"  🔑 S3 Key: {screenshot.get('s3_key', 'N/A')}")
                print(f"  🔗 Presigned URL: {screenshot.get('presigned_url', 'N/A')[:100]}...")
                
                # Test proxy URL if s3_key exists
                if screenshot.get('s3_key'):
                    proxy_url = f"http://localhost:8000/api/proxy/screenshot/{screenshot['s3_key']}"
                    print(f"  🔄 Proxy URL: {proxy_url}")
                    
                    try:
                        proxy_response = requests.head(proxy_url, timeout=10)
                        print(f"  ✅ Proxy accessible: {proxy_response.status_code}")
                        print(f"  📏 Content-Length: {proxy_response.headers.get('Content-Length', 'Unknown')}")
                        print(f"  📋 Content-Type: {proxy_response.headers.get('Content-Type', 'Unknown')}")
                    except Exception as e:
                        print(f"  ❌ Proxy failed: {e}")
        else:
            print(f"❌ API Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_specific_proxy_url():
    """Test the specific screenshot mentioned by user"""
    s3_key = "screenshots/tugbacalik84_at_gmail.com/PODOKTOR_2025_AĞUSTOS_Genel_Grafik_Tasarımı_&_İçerik_Üretimi/2025-08-05_11-32-22_2025-08-05_11-32-22.webp"
    proxy_url = f"http://localhost:8000/api/proxy/screenshot/{s3_key}"
    
    print(f"🎯 Testing specific screenshot proxy URL:")
    print(f"🔗 URL: {proxy_url}")
    
    try:
        response = requests.head(proxy_url, timeout=10)
        print(f"✅ Response: {response.status_code}")
        print(f"📏 Content-Length: {response.headers.get('Content-Length', 'Unknown')}")
        print(f"📋 Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
        
        if response.status_code == 200:
            print("🎉 Proxy URL works! The issue might be in the frontend.")
        else:
            print(f"❌ Proxy returned error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Proxy request failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting screenshot debugging...")
    print("=" * 50)
    
    # Test 1: Backend connection
    print("\n1️⃣ Testing backend connection...")
    backend_ok = test_backend_connection()
    
    if backend_ok:
        # Test 2: Screenshot API
        print("\n2️⃣ Testing screenshot API...")
        test_screenshot_api()
        
        # Test 3: Specific proxy URL
        print("\n3️⃣ Testing specific proxy URL...")
        test_specific_proxy_url()
    else:
        print("\n❌ Cannot proceed without backend connection")
        print("💡 Make sure Django server is running on localhost:8000")
    
    print("\n" + "=" * 50)
    print("🏁 Debug complete!")
