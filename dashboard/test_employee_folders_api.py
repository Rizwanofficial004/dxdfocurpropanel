#!/usr/bin/env python3
"""
Test script for Employee Task Folders API (Level 2)
Tests the new /api/screenshots/employee/{employee_email}/folders/ endpoint
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"  # Change this to your Django server URL
API_ENDPOINT = "/api/screenshots/employee/{employee_email}/folders/"

def test_employee_task_folders_api():
    """Test the Employee Task Folders API with various scenarios"""
    
    print("🚀 Testing Employee Task Folders API (Level 2)")
    print("=" * 60)
    
    # Test cases
    test_cases = [
        {
            "name": "Load folders for Haseeb Developer",
            "employee_email": "haseepcodejourney@gmail.com"
        },
        {
            "name": "Load folders for Admin user",
            "employee_email": "admin@company.com"
        },
        {
            "name": "Load folders for Test user",
            "employee_email": "test@example.com"
        },
        {
            "name": "Non-existent employee",
            "employee_email": "nonexistent@example.com"
        },
        {
            "name": "Invalid email format",
            "employee_email": "invalid-email"
        },
        {
            "name": "Empty email",
            "employee_email": ""
        }
    ]
    
    total_tests = len(test_cases)
    passed_tests = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}/{total_tests}: {test_case['name']}")
        print("-" * 40)
        
        try:
            # Prepare request
            if test_case['employee_email']:
                url = f"{BASE_URL}{API_ENDPOINT.format(employee_email=test_case['employee_email'])}"
            else:
                url = f"{BASE_URL}/api/screenshots/employee//folders/"  # Empty email test
            
            print(f"🔗 URL: {url}")
            
            # Make request
            start_time = time.time()
            response = requests.get(url)
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
                    
                    print(f"📧 Employee: {response_data.get('employee_email', 'N/A')}")
                    
                    # Task folders info
                    task_folders = response_data.get('task_folders', [])
                    print(f"📁 Task Folders: {len(task_folders)}")
                    
                    # Direct files info
                    direct_files = response_data.get('direct_files', [])
                    print(f"📄 Direct Files: {len(direct_files)}")
                    
                    # Summary info
                    summary = response_data.get('summary', {})
                    print(f"📊 Total Screenshots: {summary.get('total_screenshots', 0)}")
                    print(f"💾 Total Size: {summary.get('total_size_mb', 0)} MB")
                    print(f"🟢 Active Folders: {summary.get('active_folders', 0)}")
                    
                    # Show sample folders
                    if task_folders:
                        print(f"\n   📁 Sample Folders:")
                        for j, folder in enumerate(task_folders[:3], 1):
                            print(f"      {j}. {folder.get('display_name', 'N/A')}")
                            print(f"         📸 Screenshots: {folder.get('screenshot_count', 0)}")
                            print(f"         📅 Date: {folder.get('date', 'N/A')}")
                            print(f"         🟢 Active: {folder.get('has_recent_activity', False)}")
                            print(f"         📋 Type: {'Date' if folder.get('is_date_folder') else 'Task'} Folder")
                        
                        if len(task_folders) > 3:
                            print(f"         ... and {len(task_folders) - 3} more folders")
                    
                    # Show sample direct files
                    if direct_files:
                        print(f"\n   📄 Sample Direct Files:")
                        for j, file in enumerate(direct_files[:3], 1):
                            print(f"      {j}. {file.get('file_name', 'N/A')}")
                            print(f"         💾 Size: {file.get('size_mb', 0)} MB")
                    
                    passed_tests += 1
                    print("\n✅ Test PASSED")
                else:
                    print("❌ Invalid response structure or failed request")
                    print(f"Response: {json.dumps(data, indent=2)}")
                    
            elif response.status_code == 400:
                print("⚠️ Bad Request (expected for invalid inputs)")
                try:
                    data = response.json()
                    print(f"Message: {data.get('message', 'No message')}")
                    if test_case['employee_email'] in ['invalid-email', '']:
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
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
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
    """Test that the API returns the expected response format"""
    
    print("\n🔍 Testing Response Format Compliance")
    print("=" * 60)
    
    try:
        url = f"{BASE_URL}/api/screenshots/employee/haseepcodejourney@gmail.com/folders/"
        
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check top-level structure
            required_fields = ["success", "data", "message", "timestamp"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing top-level fields: {missing_fields}")
                return False
            
            # Check data structure
            if not data.get('success'):
                print("ℹ️ Request was not successful, but format may still be correct")
                return True
            
            response_data = data["data"]
            required_data_fields = [
                "employee_email", "task_folders", "direct_files", 
                "summary", "folder_types"
            ]
            
            missing_data_fields = [
                field for field in required_data_fields 
                if field not in response_data
            ]
            
            if missing_data_fields:
                print(f"❌ Missing data fields: {missing_data_fields}")
                return False
            
            # Check task folder structure (if any folders exist)
            task_folders = response_data.get("task_folders", [])
            if task_folders:
                folder = task_folders[0]
                required_folder_fields = [
                    "folder_name", "folder_path", "is_date_folder", 
                    "display_name", "screenshot_count", "total_size_mb",
                    "has_recent_activity"
                ]
                
                missing_folder_fields = [
                    field for field in required_folder_fields 
                    if field not in folder
                ]
                
                if missing_folder_fields:
                    print(f"❌ Missing folder fields: {missing_folder_fields}")
                    return False
            
            # Check summary structure
            summary = response_data.get("summary", {})
            required_summary_fields = [
                "total_folders", "total_screenshots", "total_size_mb",
                "active_folders"
            ]
            
            missing_summary_fields = [
                field for field in required_summary_fields 
                if field not in summary
            ]
            
            if missing_summary_fields:
                print(f"❌ Missing summary fields: {missing_summary_fields}")
                return False
            
            print("✅ Response format matches requirements")
            print("\n📋 Sample Response Structure:")
            
            # Show a simplified sample
            sample_response = {
                "success": data["success"],
                "message": data["message"],
                "data": {
                    "employee_email": response_data["employee_email"],
                    "task_folders": task_folders[:1] if task_folders else [],
                    "summary": summary
                }
            }
            
            print(json.dumps(sample_response, indent=2))
            
            return True
                
        else:
            print(f"❌ API returned status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing response format: {str(e)}")
        return False


def performance_test():
    """Test API performance with multiple requests"""
    
    print("\n⚡ Performance Testing")
    print("=" * 60)
    
    test_email = "haseepcodejourney@gmail.com"
    num_requests = 5
    
    print(f"Making {num_requests} requests to test performance...")
    
    response_times = []
    
    for i in range(num_requests):
        try:
            url = f"{BASE_URL}/api/screenshots/employee/{test_email}/folders/"
            
            start_time = time.time()
            response = requests.get(url)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000
            response_times.append(response_time)
            
            print(f"Request {i+1}: {response_time:.2f}ms (Status: {response.status_code})")
            
        except Exception as e:
            print(f"Request {i+1}: Failed - {str(e)}")
    
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        min_time = min(response_times)
        max_time = max(response_times)
        
        print(f"\n📊 Performance Results:")
        print(f"Average Response Time: {avg_time:.2f}ms")
        print(f"Fastest Response: {min_time:.2f}ms")
        print(f"Slowest Response: {max_time:.2f}ms")
        
        if avg_time < 1000:  # Less than 1 second
            print("✅ Performance: GOOD")
        elif avg_time < 3000:  # Less than 3 seconds
            print("⚠️ Performance: ACCEPTABLE")
        else:
            print("❌ Performance: NEEDS IMPROVEMENT")


if __name__ == "__main__":
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Testing API at: {BASE_URL}")
    
    # Run main tests
    api_tests_passed = test_employee_task_folders_api()
    
    # Test response format
    format_tests_passed = test_response_format()
    
    # Performance testing
    performance_test()
    
    # Final result
    print("\n" + "=" * 60)
    print("🏁 FINAL RESULTS")
    print("=" * 60)
    
    if api_tests_passed and format_tests_passed:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Level 2 API is working correctly and returns the expected format")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED!")
        if not api_tests_passed:
            print("- API functionality tests failed")
        if not format_tests_passed:
            print("- Response format tests failed")
        sys.exit(1)
