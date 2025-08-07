#!/usr/bin/env python3
"""
Test script for S3 User Suggestions API
Tests the new /api/users/s3-suggestions/ endpoint
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"  # Change this to your Django server URL
API_ENDPOINT = "/api/users/s3-suggestions/"

def test_s3_suggestions_api():
    """Test the S3 User Suggestions API with various scenarios"""
    
    print("🚀 Testing S3 User Suggestions API")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Search for 'haseeb'",
            "query": "haseeb",
            "limit": 10
        },
        {
            "name": "Search for email domain",
            "query": "gmail",
            "limit": 5
        },
        {
            "name": "Search by partial name",
            "query": "dev",
            "limit": 10
        },
        {
            "name": "Search by staff ID",
            "query": "HA5",
            "limit": 10
        },
        {
            "name": "Empty search",
            "query": "",
            "limit": 10
        },
        {
            "name": "Single character search",
            "query": "h",
            "limit": 10
        }
    ]
    
    total_tests = len(test_cases)
    passed_tests = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}/{total_tests}: {test_case['name']}")
        print("-" * 30)
        
        try:
            # Prepare request
            url = f"{BASE_URL}{API_ENDPOINT}"
            params = {
                "q": test_case["query"],
                "limit": test_case["limit"]
            }
            
            print(f"🔗 URL: {url}")
            print(f"📊 Params: {params}")
            
            # Make request
            start_time = time.time()
            response = requests.get(url, params=params)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            print(f"⏱️ Response Time: {response_time:.2f}ms")
            print(f"🌐 Status Code: {response.status_code}")
            
            # Parse response
            if response.status_code == 200:
                data = response.json()
                
                print(f"✅ Success: {data.get('success', False)}")
                print(f"💬 Message: {data.get('message', 'No message')}")
                
                # Check data structure
                if 'data' in data and 'suggestions' in data['data']:
                    suggestions = data['data']['suggestions']
                    print(f"👥 Found {len(suggestions)} suggestions")
                    
                    # Display suggestions
                    for j, suggestion in enumerate(suggestions[:3], 1):  # Show first 3
                        print(f"\n   👤 Suggestion {j}:")
                        print(f"      📧 Email: {suggestion.get('email', 'N/A')}")
                        print(f"      👤 Display Name: {suggestion.get('display_name', 'N/A')}")
                        print(f"      🆔 Staff ID: {suggestion.get('staff_id', 'N/A')}")
                        print(f"      📸 Screenshots: {suggestion.get('screenshot_count', 0)}")
                        print(f"      🟢 Recent Activity: {suggestion.get('has_recent_activity', False)}")
                        print(f"      💭 Suggestion Text: {suggestion.get('suggestion_text', 'N/A')}")
                    
                    if len(suggestions) > 3:
                        print(f"   ... and {len(suggestions) - 3} more suggestions")
                    
                    passed_tests += 1
                    print("\n✅ Test PASSED")
                else:
                    print("❌ Invalid response structure")
                    print(f"Response: {json.dumps(data, indent=2)}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Could not connect to Django server")
            print("💡 Make sure your Django server is running on the specified URL")
        except Exception as e:
            print(f"❌ Unexpected Error: {str(e)}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed! API is working correctly.")
    else:
        print(f"\n⚠️ {total_tests - passed_tests} test(s) failed. Check the errors above.")
    
    return passed_tests == total_tests


def test_response_format():
    """Test that the API returns the exact format specified in the requirements"""
    
    print("\n🔍 Testing Response Format Compliance")
    print("=" * 50)
    
    try:
        url = f"{BASE_URL}{API_ENDPOINT}"
        params = {"q": "test", "limit": 1}
        
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check top-level structure
            required_fields = ["success", "data"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing top-level fields: {missing_fields}")
                return False
            
            # Check data structure
            if "suggestions" not in data["data"]:
                print("❌ Missing 'suggestions' in data")
                return False
            
            suggestions = data["data"]["suggestions"]
            
            if suggestions:
                # Check suggestion structure
                suggestion = suggestions[0]
                required_suggestion_fields = [
                    "display_name", "email", "username", "staff_id", 
                    "screenshot_count", "suggestion_text", "search_value", 
                    "has_recent_activity"
                ]
                
                missing_suggestion_fields = [
                    field for field in required_suggestion_fields 
                    if field not in suggestion
                ]
                
                if missing_suggestion_fields:
                    print(f"❌ Missing suggestion fields: {missing_suggestion_fields}")
                    return False
                
                print("✅ Response format matches requirements")
                print("\n📋 Sample Response Structure:")
                print(json.dumps({
                    "success": data["success"],
                    "data": {
                        "suggestions": [suggestions[0]] if suggestions else []
                    }
                }, indent=2))
                
                return True
            else:
                print("ℹ️ No suggestions returned, but format is correct")
                return True
                
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing response format: {str(e)}")
        return False


if __name__ == "__main__":
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Testing API at: {BASE_URL}{API_ENDPOINT}")
    
    # Run main tests
    api_tests_passed = test_s3_suggestions_api()
    
    # Test response format
    format_tests_passed = test_response_format()
    
    # Final result
    print("\n" + "=" * 50)
    print("🏁 FINAL RESULTS")
    print("=" * 50)
    
    if api_tests_passed and format_tests_passed:
        print("🎉 ALL TESTS PASSED!")
        print("✅ API is working correctly and returns the expected format")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED!")
        if not api_tests_passed:
            print("- API functionality tests failed")
        if not format_tests_passed:
            print("- Response format tests failed")
        sys.exit(1)
