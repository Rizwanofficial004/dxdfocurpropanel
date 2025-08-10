#!/usr/bin/env python3
"""
Test Project Management APIs - Complete Test Suite
This script tests our project management APIs by making direct function calls
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from dashboard.project_management_apis import get_all_projects_api, get_projects_summary_api, get_project_by_id_api
    print("✅ Successfully imported project management APIs")
except ImportError as e:
    print(f"❌ Failed to import APIs: {e}")
    print("Trying alternative import path...")
    try:
        sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dashboard'))
        from project_management_apis import get_all_projects_api, get_projects_summary_api, get_project_by_id_api
        print("✅ Successfully imported project management APIs (alternative path)")
    except ImportError as e2:
        print(f"❌ Alternative import also failed: {e2}")
        sys.exit(1)

def create_mock_request(method='GET', params=None):
    """Create a mock Django request object"""
    class MockRequest:
        def __init__(self, method='GET', params=None):
            self.method = method
            self.GET = params or {}
    
    return MockRequest(method, params)

def test_all_projects_basic():
    """Test getting all projects with basic info"""
    print("\n" + "="*60)
    print("🔍 TEST 1: Get All Projects (Basic)")
    print("="*60)
    
    try:
        request = create_mock_request('GET', {})
        response = get_all_projects_api(request)
        
        if hasattr(response, 'content'):
            content = json.loads(response.content.decode('utf-8'))
            print(f"✅ Status Code: {response.status_code}")
            print(f"✅ Response Type: {type(content)}")
            
            if content.get('success'):
                data = content.get('data', [])
                meta = content.get('meta', {})
                print(f"✅ Projects Count: {len(data)}")
                print(f"✅ Total Projects: {meta.get('total_projects', 'N/A')}")
                
                if data:
                    sample_project = data[0]
                    print(f"✅ Sample Project ID: {sample_project.get('id')}")
                    print(f"✅ Sample Project Name: {sample_project.get('name')}")
                    print(f"✅ Sample Project Status: {sample_project.get('status')}")
                
                return True, content
            else:
                print(f"❌ API returned error: {content.get('error')}")
                return False, content
        else:
            print(f"❌ Unexpected response type: {type(response)}")
            return False, None
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False, None

def test_all_projects_detailed():
    """Test getting all projects with detailed info"""
    print("\n" + "="*60)
    print("🔍 TEST 2: Get All Projects (Detailed)")
    print("="*60)
    
    try:
        request = create_mock_request('GET', {'detailed': 'true', 'limit': '10'})
        response = get_all_projects_api(request)
        
        if hasattr(response, 'content'):
            content = json.loads(response.content.decode('utf-8'))
            print(f"✅ Status Code: {response.status_code}")
            
            if content.get('success'):
                data = content.get('data', [])
                meta = content.get('meta', {})
                print(f"✅ Projects Count: {len(data)}")
                print(f"✅ Total Projects: {meta.get('total_projects', 'N/A')}")
                print(f"✅ Current Page: {meta.get('current_page', 'N/A')}")
                print(f"✅ Per Page: {meta.get('per_page', 'N/A')}")
                
                if data:
                    sample_project = data[0]
                    print(f"✅ Sample Project Keys: {list(sample_project.keys())[:10]}...")
                
                return True, content
            else:
                print(f"❌ API returned error: {content.get('error')}")
                return False, content
        else:
            print(f"❌ Unexpected response type: {type(response)}")
            return False, None
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False, None

def test_projects_summary():
    """Test getting projects summary"""
    print("\n" + "="*60)
    print("🔍 TEST 3: Get Projects Summary")
    print("="*60)
    
    try:
        request = create_mock_request('GET', {})
        response = get_projects_summary_api(request)
        
        if hasattr(response, 'content'):
            content = json.loads(response.content.decode('utf-8'))
            print(f"✅ Status Code: {response.status_code}")
            
            if content.get('success'):
                summary = content.get('summary', {})
                print(f"✅ Total Projects: {summary.get('total_projects', 'N/A')}")
                print(f"✅ Active Projects: {summary.get('active_projects', 'N/A')}")
                print(f"✅ Completed Projects: {summary.get('completed_projects', 'N/A')}")
                print(f"✅ Pending Projects: {summary.get('pending_projects', 'N/A')}")
                print(f"✅ Average Progress: {summary.get('average_progress', 'N/A')}%")
                
                progress_dist = summary.get('progress_distribution', {})
                print(f"✅ Not Started: {progress_dist.get('not_started', 'N/A')}")
                print(f"✅ In Progress: {progress_dist.get('in_progress', 'N/A')}")
                print(f"✅ Completed: {progress_dist.get('completed', 'N/A')}")
                
                return True, content
            else:
                print(f"❌ API returned error: {content.get('error')}")
                return False, content
        else:
            print(f"❌ Unexpected response type: {type(response)}")
            return False, None
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False, None

def test_project_by_id(project_id):
    """Test getting a specific project by ID"""
    print("\n" + "="*60)
    print(f"🔍 TEST 4: Get Project by ID ({project_id})")
    print("="*60)
    
    try:
        request = create_mock_request('GET', {})
        response = get_project_by_id_api(request, project_id)
        
        if hasattr(response, 'content'):
            content = json.loads(response.content.decode('utf-8'))
            print(f"✅ Status Code: {response.status_code}")
            
            if content.get('success'):
                data = content.get('data', {})
                print(f"✅ Project ID: {data.get('id')}")
                print(f"✅ Project Name: {data.get('name')}")
                print(f"✅ Project Status: {data.get('status')}")
                print(f"✅ Project Progress: {data.get('progress')}%")
                print(f"✅ Start Date: {data.get('start_date')}")
                print(f"✅ Client ID: {data.get('clientid')}")
                
                return True, content
            else:
                print(f"❌ API returned error: {content.get('error')}")
                return False, content
        else:
            print(f"❌ Unexpected response type: {type(response)}")
            return False, None
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False, None

def main():
    """Run all tests"""
    print("🚀 PROJECT MANAGEMENT APIs - DIRECT FUNCTION TEST")
    print("="*80)
    print(f"Test Time: {datetime.now().isoformat()}")
    print("Testing Mode: Direct Function Calls (No Server Required)")
    print("="*80)
    
    results = {}
    sample_project_id = None
    
    # Test 1: Basic projects
    success, data = test_all_projects_basic()
    results['basic_projects'] = success
    if success and data and data.get('data'):
        sample_project_id = data['data'][0].get('id')
    
    # Test 2: Detailed projects
    success, data = test_all_projects_detailed()
    results['detailed_projects'] = success
    
    # Test 3: Projects summary
    success, data = test_projects_summary()
    results['projects_summary'] = success
    
    # Test 4: Project by ID (if we have a sample ID)
    if sample_project_id:
        success, data = test_project_by_id(sample_project_id)
        results['project_by_id'] = success
    else:
        print("\n" + "="*60)
        print("⚠️  TEST 4: Skipped - No sample project ID available")
        print("="*60)
        results['project_by_id'] = None
    
    # Test 5: Error handling (non-existent ID)
    success, data = test_project_by_id("non-existent-id")
    results['error_handling'] = not success  # Should fail for error handling test
    
    # Print results summary
    print("\n" + "="*80)
    print("📊 TEST RESULTS SUMMARY")
    print("="*80)
    
    total_tests = len([r for r in results.values() if r is not None])
    passed_tests = len([r for r in results.values() if r is True])
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    print("\nDetailed Results:")
    for test_name, result in results.items():
        if result is True:
            print(f"  {test_name}: ✅ PASS")
        elif result is False:
            print(f"  {test_name}: ❌ FAIL")
        else:
            print(f"  {test_name}: ⚠️  SKIP")
    
    print("\n" + "="*80)
    print("🎯 API ENDPOINTS SUMMARY")
    print("="*80)
    print("1. GET /api/projects/")
    print("   - Basic project list with essential fields")
    print("   - Supports pagination: ?page=1&limit=10")
    print("   - Supports filtering: ?status=active")
    
    print("\n2. GET /api/projects/?detailed=true")
    print("   - Detailed project list with all CRM fields")
    print("   - Full project information including client data")
    
    print("\n3. GET /api/projects/summary/")
    print("   - Project statistics and metrics")
    print("   - Total counts by status and progress")
    print("   - Perfect for dashboard widgets")
    
    print("\n4. GET /api/projects/{id}/")
    print("   - Individual project details by ID")
    print("   - Complete project information")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! APIs are working correctly.")
        print("🔗 CRM integration successful - ready for production use!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed. Check the logs above.")
    
    print(f"\n✅ Testing completed at {datetime.now().isoformat()}")

if __name__ == '__main__':
    main()
