#!/usr/bin/env python3
"""
Simple API Tester for Screenshots API
"""
import requests
import json
from datetime import datetime

def test_endpoint(url, description):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"📡 URL: {url}")
    print(f"{'='*60}")
    
    try:
        start_time = datetime.now()
        response = requests.get(url, timeout=10)
        end_time = datetime.now()
        
        response_time = (end_time - start_time).total_seconds() * 1000
        
        print(f"⏱️  Response Time: {response_time:.2f}ms")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ SUCCESS!")
                print(f"📋 Response Structure:")
                
                # Pretty print the response structure
                if isinstance(data, dict):
                    for key, value in data.items():
                        if key == 'data' and isinstance(value, dict):
                            print(f"   {key}:")
                            for sub_key, sub_value in value.items():
                                if isinstance(sub_value, list):
                                    print(f"     {sub_key}: [{len(sub_value)} items]")
                                else:
                                    print(f"     {sub_key}: {sub_value}")
                        else:
                            if isinstance(value, str) and len(value) > 100:
                                print(f"   {key}: {value[:100]}...")
                            else:
                                print(f"   {key}: {value}")
                
                return True, data
                
            except json.JSONDecodeError:
                print(f"⚠️  Response is not JSON: {response.text[:200]}")
                return False, response.text
                
        else:
            print(f"❌ FAILED!")
            print(f"📋 Error: {response.text[:300]}")
            return False, response.text
            
    except requests.exceptions.ConnectionError:
        print(f"❌ CONNECTION ERROR!")
        print(f"📋 Cannot connect to server. Is it running?")
        return False, "Connection Error"
        
    except requests.exceptions.Timeout:
        print(f"❌ TIMEOUT ERROR!")
        return False, "Timeout"
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR!")
        print(f"📋 {str(e)}")
        return False, str(e)

def main():
    """Test all important endpoints"""
    print("🚀 COMPREHENSIVE API TESTING")
    print("🎯 Testing Django Screenshots API System")
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    base_url = "http://127.0.0.1:8006/api"
    
    # List of endpoints to test
    endpoints = [
        (f"{base_url}/test/", "Basic API Test"),
        (f"{base_url}/screenshots/ultra-fast/", "Ultra-Fast Screenshots API"),
        (f"{base_url}/screenshots/ultra-fast/?limit=5", "Ultra-Fast API (Top 5 Users)"),
        (f"{base_url}/screenshots/tracking-status/", "Cache Status API"),
        (f"{base_url}/screenshots/fast-all/?limit_users=3", "Fast Screenshots API"),
        (f"{base_url}/screenshots/users/", "S3 Screenshots Users API"),
        (f"{base_url}/screenshots/search/?employee_name=amir", "Search API"),
        (f"{base_url}/users/suggestions/?q=amir", "User Suggestions API"),
    ]
    
    results = {}
    successful_tests = 0
    
    for url, description in endpoints:
        success, response = test_endpoint(url, description)
        results[description] = {
            'success': success,
            'url': url,
            'response': response
        }
        if success:
            successful_tests += 1
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 TEST SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Successful: {successful_tests}/{len(endpoints)}")
    print(f"❌ Failed: {len(endpoints) - successful_tests}/{len(endpoints)}")
    
    print(f"\n📋 DETAILED RESULTS:")
    for description, result in results.items():
        status = "✅" if result['success'] else "❌"
        print(f"{status} {description}")
    
    # Show working endpoints
    working_endpoints = [desc for desc, result in results.items() if result['success']]
    if working_endpoints:
        print(f"\n🎉 WORKING ENDPOINTS:")
        for desc in working_endpoints:
            url = results[desc]['url']
            print(f"   • {desc}")
            print(f"     {url}")
    
    print(f"\n🎯 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
