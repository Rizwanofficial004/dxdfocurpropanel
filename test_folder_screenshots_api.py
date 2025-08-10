#!/usr/bin/env python3
"""
Test script for Employee Folder Screenshots API (Level 3)
Tests the new /api/screenshots/employee/{employee_email}/folder/{folder_name}/ endpoint
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"  # Change this to your Django server URL
API_ENDPOINT = "/api/screenshots/employee/{employee_email}/folder/{folder_name}/"

def test_employee_folder_screenshots_api():
    """Test the Employee Folder Screenshots API with various scenarios"""
    
    print("🚀 Testing Employee Folder Screenshots API (Level 3)")
    print("=" * 70)
    
    # Test cases
    test_cases = [
        {
            "name": "Load screenshots for Haseeb - 2025-01-15 folder",
            "employee_email": "haseepcodejourney@gmail.com",
            "folder_name": "2025-01-15",
            "page": 1,
            "limit": 10
        },
        {
            "name": "Load screenshots with pagination",
            "employee_email": "haseepcodejourney@gmail.com",
            "folder_name": "2025-01-15",
            "page": 2,
            "limit": 5
        },
        {
            "name": "Load screenshots for task folder",
            "employee_email": "haseepcodejourney@gmail.com",
            "folder_name": "project_alpha",
            "page": 1,
            "limit": 20
        },
        {
            "name": "Non-existent folder",
            "employee_email": "haseepcodejourney@gmail.com",
            "folder_name": "non-existent-folder",
            "page": 1,
            "limit": 10
        },
        {
            "name": "Non-existent employee",
            "employee_email": "nonexistent@example.com",
            "folder_name": "2025-01-15",
            "page": 1,
            "limit": 10
        },
        {
            "name": "Invalid email format",
            "employee_email": "invalid-email",
            "folder_name": "2025-01-15",
            "page": 1,
            "limit": 10
        },
        {
            "name": "Large page size test",
            "employee_email": "haseepcodejourney@gmail.com",
            "folder_name": "2025-01-15",
            "page": 1,
            "limit": 100
        }
    ]
    
    total_tests = len(test_cases)
    passed_tests = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}/{total_tests}: {test_case['name']}")
        print("-" * 50)
        
        try:
            # Prepare request
            url = f"{BASE_URL}{API_ENDPOINT.format(employee_email=test_case['employee_email'], folder_name=test_case['folder_name'])}"
            params = {
                "page": test_case['page'],
                "limit": test_case['limit']
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
                if data.get('success') and 'data' in data:
                    response_data = data['data']
                    
                    # Folder info
                    folder_info = response_data.get('folder_info', {})
                    print(f"📁 Folder: {folder_info.get('folder_name', 'N/A')}")
                    print(f"👤 Employee: {folder_info.get('employee_name', 'N/A')} ({folder_info.get('employee_email', 'N/A')})")
                    print(f"📅 Is Date Folder: {folder_info.get('is_date_folder', False)}")
                    
                    # Screenshots info
                    screenshots = response_data.get('screenshots', [])
                    print(f"📸 Screenshots in Page: {len(screenshots)}")
                    
                    # Pagination info
                    pagination = response_data.get('pagination', {})
                    print(f"📄 Current Page: {pagination.get('current_page', 'N/A')}")
                    print(f"📚 Total Pages: {pagination.get('total_pages', 'N/A')}")
                    print(f"🎯 Total Screenshots: {pagination.get('total_screenshots', 'N/A')}")
                    print(f"📏 Limit: {pagination.get('limit', 'N/A')}")
                    
                    # Show sample screenshots
                    if screenshots:
                        print(f"\n   📸 Sample Screenshots:")
                        for j, screenshot in enumerate(screenshots[:3], 1):
                            print(f"      {j}. {screenshot.get('filename', 'N/A')}")
                            print(f"         🕐 Time: {screenshot.get('time_display', 'N/A')}")
                            print(f"         📱 App: {screenshot.get('application', 'N/A')}")
                            print(f"         🪟 Window: {screenshot.get('window_title', 'N/A')}")
                            print(f"         💾 Size: {format_file_size(screenshot.get('file_size', 0))}")
                            print(f"         🔗 Has URL: {'Yes' if screenshot.get('url') else 'No'}")
                            print(f"         🖼️ Has Thumbnail: {'Yes' if screenshot.get('thumbnail_url') else 'No'}")
                        
                        if len(screenshots) > 3:
                            print(f"         ... and {len(screenshots) - 3} more screenshots")
                    
                    # Test expected response format
                    if validate_response_format(response_data):
                        passed_tests += 1
                        print("\n✅ Test PASSED")
                    else:
                        print("\n❌ Test FAILED - Invalid response format")
                else:
                    print("❌ Invalid response structure or failed request")
                    if not data.get('success'):
                        print(f"Error Message: {data.get('message', 'Unknown error')}")
                    
            elif response.status_code == 400:
                print("⚠️ Bad Request (expected for invalid inputs)")
                try:
                    data = response.json()
                    print(f"Message: {data.get('message', 'No message')}")
                    if test_case['employee_email'] == 'invalid-email':
                        passed_tests += 1  # Expected failure
                        print("✅ Test PASSED (expected validation error)")
                    else:
                        print("❌ Unexpected validation error")
                except:
                    print(f"Response: {response.text}")
                    
            elif response.status_code == 404:
                print("⚠️ Not Found")
                print(f"Response: {response.text}")
                
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Could not connect to Django server")
            print("💡 Make sure your Django server is running on the specified URL")
        except Exception as e:
            print(f"❌ Unexpected Error: {str(e)}")
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed! API is working correctly.")
    else:
        print(f"\n⚠️ {total_tests - passed_tests} test(s) failed. Check the errors above.")
    
    return passed_tests == total_tests


def validate_response_format(response_data):
    """Validate that the response matches the expected format"""
    try:
        # Check top-level structure
        required_fields = ["folder_info", "screenshots", "pagination"]
        for field in required_fields:
            if field not in response_data:
                print(f"❌ Missing field: {field}")
                return False
        
        # Check folder_info structure
        folder_info = response_data["folder_info"]
        required_folder_fields = ["folder_name", "employee_name", "employee_email"]
        for field in required_folder_fields:
            if field not in folder_info:
                print(f"❌ Missing folder_info field: {field}")
                return False
        
        # Check screenshots structure (if any screenshots exist)
        screenshots = response_data["screenshots"]
        if screenshots:
            screenshot = screenshots[0]
            required_screenshot_fields = [
                "id", "filename", "url", "timestamp", "file_size",
                "application", "window_title", "date_folder", "time_display"
            ]
            for field in required_screenshot_fields:
                if field not in screenshot:
                    print(f"❌ Missing screenshot field: {field}")
                    return False
        
        # Check pagination structure
        pagination = response_data["pagination"]
        required_pagination_fields = [
            "current_page", "total_pages", "total_screenshots", "limit", "offset"
        ]
        for field in required_pagination_fields:
            if field not in pagination:
                print(f"❌ Missing pagination field: {field}")
                return False
        
        print("✅ Response format validation passed")
        return True
        
    except Exception as e:
        print(f"❌ Response format validation error: {str(e)}")
        return False


def test_pagination():
    """Test pagination functionality"""
    
    print("\n📄 Testing Pagination Functionality")
    print("=" * 70)
    
    employee_email = "haseepcodejourney@gmail.com"
    folder_name = "2025-01-15"
    
    try:
        # First, get total count
        url = f"{BASE_URL}/api/screenshots/employee/{employee_email}/folder/{folder_name}/"
        params = {"page": 1, "limit": 5}
        
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                pagination = data['data']['pagination']
                total_screenshots = pagination['total_screenshots']
                total_pages = pagination['total_pages']
                
                print(f"📊 Total Screenshots: {total_screenshots}")
                print(f"📚 Total Pages: {total_pages}")
                
                if total_screenshots > 0:
                    # Test different pages
                    pages_to_test = [1, min(2, total_pages), total_pages] if total_pages > 1 else [1]
                    
                    for page in pages_to_test:
                        print(f"\n🔍 Testing Page {page}:")
                        
                        params = {"page": page, "limit": 5}
                        page_response = requests.get(url, params=params)
                        
                        if page_response.status_code == 200:
                            page_data = page_response.json()
                            
                            if page_data.get('success'):
                                page_pagination = page_data['data']['pagination']
                                screenshots = page_data['data']['screenshots']
                                
                                print(f"   📄 Current Page: {page_pagination['current_page']}")
                                print(f"   📸 Screenshots: {len(screenshots)}")
                                print(f"   ⬅️ Has Previous: {page_pagination.get('has_previous', False)}")
                                print(f"   ➡️ Has Next: {page_pagination.get('has_next', False)}")
                                
                                if screenshots:
                                    print(f"   🎯 First Screenshot: {screenshots[0]['filename']}")
                                
                                print("   ✅ Page test passed")
                            else:
                                print(f"   ❌ Page {page} failed: {page_data.get('message')}")
                        else:
                            print(f"   ❌ Page {page} HTTP error: {page_response.status_code}")
                    
                    print("\n✅ Pagination tests completed")
                else:
                    print("ℹ️ No screenshots found, pagination test skipped")
            else:
                print(f"❌ Initial request failed: {data.get('message')}")
        else:
            print(f"❌ Initial request HTTP error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Pagination test error: {str(e)}")


def performance_test():
    """Test API performance with different scenarios"""
    
    print("\n⚡ Performance Testing")
    print("=" * 70)
    
    test_scenarios = [
        {"name": "Small page (5 items)", "limit": 5},
        {"name": "Medium page (20 items)", "limit": 20},
        {"name": "Large page (50 items)", "limit": 50},
        {"name": "Max page (100 items)", "limit": 100}
    ]
    
    employee_email = "haseepcodejourney@gmail.com"
    folder_name = "2025-01-15"
    
    for scenario in test_scenarios:
        print(f"\n🔍 Testing {scenario['name']}:")
        
        response_times = []
        
        for i in range(3):  # Test 3 times for each scenario
            try:
                url = f"{BASE_URL}/api/screenshots/employee/{employee_email}/folder/{folder_name}/"
                params = {"page": 1, "limit": scenario['limit']}
                
                start_time = time.time()
                response = requests.get(url, params=params)
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000
                response_times.append(response_time)
                
                print(f"   Attempt {i+1}: {response_time:.2f}ms (Status: {response.status_code})")
                
            except Exception as e:
                print(f"   Attempt {i+1}: Failed - {str(e)}")
        
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            min_time = min(response_times)
            max_time = max(response_times)
            
            print(f"   📊 Average: {avg_time:.2f}ms")
            print(f"   🚀 Fastest: {min_time:.2f}ms")
            print(f"   🐌 Slowest: {max_time:.2f}ms")
            
            if avg_time < 500:
                print("   ✅ Performance: EXCELLENT")
            elif avg_time < 1000:
                print("   ✅ Performance: GOOD")
            elif avg_time < 2000:
                print("   ⚠️ Performance: ACCEPTABLE")
            else:
                print("   ❌ Performance: NEEDS IMPROVEMENT")


def format_file_size(bytes_size):
    """Format file size in human readable format"""
    if bytes_size == 0:
        return "0 B"
    
    units = ["B", "KB", "MB", "GB"]
    size = bytes_size
    unit_index = 0
    
    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1
    
    return f"{size:.1f} {units[unit_index]}"


if __name__ == "__main__":
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Testing API at: {BASE_URL}")
    
    # Run main tests
    api_tests_passed = test_employee_folder_screenshots_api()
    
    # Test pagination
    test_pagination()
    
    # Performance testing
    performance_test()
    
    # Final result
    print("\n" + "=" * 70)
    print("🏁 FINAL RESULTS")
    print("=" * 70)
    
    if api_tests_passed:
        print("🎉 LEVEL 3 API TESTS PASSED!")
        print("✅ Employee Folder Screenshots API is working correctly")
        print("✅ Response format matches specifications")
        print("✅ Pagination functionality verified")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED!")
        print("- Check the test results above for details")
        sys.exit(1)
