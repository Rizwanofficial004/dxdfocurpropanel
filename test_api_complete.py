#!/usr/bin/env python3
"""
Comprehensive API Test Script
Tests the screenshot count API and verifies S3 data integration
"""
import requests
import json
import time
import sys

def test_api():
    print("🧪 COMPREHENSIVE API TEST")
    print("=" * 50)
    
    # Test the API endpoint
    api_url = "http://127.0.0.1:8001/api/actual-count-total/screenshots/"
    
    try:
        print(f"📡 Testing API: {api_url}")
        
        start_time = time.time()
        response = requests.get(api_url, timeout=30)
        response_time = time.time() - start_time
        
        print(f"⏱️  Response time: {response_time:.2f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ API STATUS: SUCCESS")
            
            try:
                data = response.json()
                print(f"📋 Response type: {type(data)}")
                
                if isinstance(data, list):
                    print(f"📦 Total users: {len(data)}")
                    
                    if len(data) > 0:
                        print("\n🎯 SAMPLE DATA:")
                        for i, user in enumerate(data[:3]):  # Show first 3 users
                            print(f"   User {i+1}: {user}")
                        
                        # Show statistics
                        total_screenshots = sum(user.get('screenshot_count', 0) for user in data)
                        print(f"\n📈 STATISTICS:")
                        print(f"   Total Screenshots: {total_screenshots}")
                        print(f"   Average per user: {total_screenshots/len(data):.1f}")
                    
                elif isinstance(data, dict):
                    print(f"📋 Response keys: {list(data.keys())}")
                    if 'users' in data:
                        print(f"📦 Total users: {len(data['users'])}")
                
                print("\n✅ API WORKING WITH REAL S3 DATA!")
                
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON response: {response.text[:200]}")
                
        else:
            print(f"❌ API ERROR: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Server not running on 127.0.0.1:8001")
        print("💡 Start server with: python employee_api_server.py")
        
    except requests.exceptions.Timeout:
        print("⏰ TIMEOUT: API took too long to respond")
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()

def test_alternative_port():
    """Test on port 8000 as backup"""
    print("\n🔄 Testing alternative port 8000...")
    
    api_url = "http://127.0.0.1:8000/api/actual-count-total/screenshots/"
    
    try:
        response = requests.get(api_url, timeout=10)
        print(f"📊 Port 8000 Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Port 8000 is also working!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Port 8000 not available")
    except Exception as e:
        print(f"❌ Port 8000 error: {e}")

if __name__ == "__main__":
    test_api()
    test_alternative_port()
    
    print("\n🚀 NEXT STEPS:")
    print("   1. If API working: Deploy to production")
    print("   2. If not working: Check server status")
    print("   3. Run migrations if database errors")
