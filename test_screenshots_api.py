#!/usr/bin/env python3
"""
Test the specific screenshots API endpoint
"""

import requests
import json

def test_screenshots_api():
    print("🔍 Testing Screenshots API")
    print("=" * 50)
    
    # Test the specific URL you provided
    url = "https://dxdtime.ddsolutions.io/api/screenshots/user/?user=Haseeb&date=2025-06-10&limit=5"
    
    print(f"Testing URL: {url}")
    print("-" * 50)
    
    try:
        response = requests.get(url, timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
            data = response.json()
            
            # Display the response structure
            print(f"📊 Response Keys: {list(data.keys())}")
            
            if 'data' in data:
                response_data = data['data']
                print(f"📈 Data Keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}")
                
                if 'screenshots' in response_data:
                    screenshots = response_data['screenshots']
                    print(f"📸 Found {len(screenshots)} screenshots")
                    
                    for i, screenshot in enumerate(screenshots[:3]):
                        print(f"\n📷 Screenshot {i+1}:")
                        print(f"   File: {screenshot.get('filename', 'N/A')}")
                        print(f"   Date: {screenshot.get('date_folder', 'N/A')}")
                        print(f"   URL: {'✅ Available' if screenshot.get('url') else '❌ Missing'}")
                        print(f"   Size: {screenshot.get('size', 'N/A')} bytes")
                
                if 'pagination' in response_data:
                    pagination = response_data['pagination']
                    print(f"\n📄 Pagination: Page {pagination.get('current_page', '?')} of {pagination.get('total_pages', '?')}")
            
            print(f"\n🕐 Response Time: ~{response.elapsed.total_seconds():.2f}s")
            
        elif response.status_code == 404:
            print("❌ 404 - Endpoint not found")
            print("Available endpoints might be different")
            
        elif response.status_code == 401:
            print("❌ 401 - Authentication required")
            print("This endpoint requires login")
            
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error = response.json()
                print(f"Error Details: {error}")
            except:
                print(f"Raw Error: {response.text[:200]}")
                
    except requests.exceptions.Timeout:
        print("❌ Request timed out (15 seconds)")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - server might not be running")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def test_alternative_endpoints():
    """Test similar endpoints that might exist"""
    print("\n🔍 Testing Alternative Endpoints")
    print("=" * 50)
    
    # Test some alternative endpoints
    endpoints = [
        "https://dxdtime.ddsolutions.io/api/test/",
        "https://dxdtime.ddsolutions.io/api/employee-cards/?limit=3",
        "https://dxdtime.ddsolutions.io/api/screenshots/?limit=5",
        "https://dxdtime.ddsolutions.io/api/users/haseebcodejourney@gmail.com/screenshots/",
    ]
    
    for url in endpoints:
        print(f"\n🔍 Testing: {url}")
        try:
            response = requests.get(url, timeout=10)
            print(f"Status: {response.status_code} ({'✅' if response.status_code == 200 else '❌'})")
            
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', 'Success')
                print(f"Message: {message}")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_screenshots_api()
    test_alternative_endpoints()
