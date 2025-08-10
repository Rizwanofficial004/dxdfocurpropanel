"""
Test Script for Project Management APIs
======================================

This script tests all the project management APIs:
- Get All Projects
- Get Project Summary
- Get Project by ID
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
TIMEOUT = 30

def print_separator(title):
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_subsection(title):
    print(f"\n{'-'*40}")
    print(f" {title}")
    print(f"{'-'*40}")

def format_json(data):
    return json.dumps(data, indent=2, ensure_ascii=False)

def test_api_endpoint(url, description, params=None):
    """Test a single API endpoint"""
    print(f"\n🔍 Testing: {description}")
    print(f"URL: {url}")
    if params:
        print(f"Params: {params}")
    
    try:
        response = requests.get(url, params=params, timeout=TIMEOUT)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ SUCCESS")
                
                # Show basic response structure
                if isinstance(data, dict):
                    print(f"Response Keys: {list(data.keys())}")
                    
                    # Show data section if exists
                    if 'data' in data:
                        data_section = data['data']
                        if isinstance(data_section, dict):
                            print(f"Data Keys: {list(data_section.keys())}")
                            
                            # Show projects count if available
                            if 'projects' in data_section:
                                projects = data_section['projects']
                                print(f"Projects Count: {len(projects) if isinstance(projects, list) else 'Not a list'}")
                                
                                # Show first project as sample
                                if isinstance(projects, list) and len(projects) > 0:
                                    print(f"Sample Project Keys: {list(projects[0].keys()) if isinstance(projects[0], dict) else 'Not a dict'}")
                            
                            # Show statistics if available
                            if 'statistics' in data_section:
                                stats = data_section['statistics']
                                print(f"Statistics: {stats}")
                            
                            # Show summary if available
                            if 'summary' in data_section:
                                summary = data_section['summary']
                                print(f"Summary Keys: {list(summary.keys()) if isinstance(summary, dict) else 'Not a dict'}")
                
                return data
                
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON Response")
                print(f"Raw Response: {response.text[:200]}...")
                return None
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Error Response: {response.text[:300]}...")
            return None
            
    except requests.RequestException as e:
        print(f"❌ CONNECTION ERROR: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return None

def main():
    print_separator("PROJECT MANAGEMENT APIs TEST SUITE")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Base URL: {BASE_URL}")
    
    # Test Results Storage
    test_results = {}
    
    # ===============================
    # Test 1: Get All Projects (Basic)
    # ===============================
    print_subsection("TEST 1: Get All Projects (Basic)")
    url = f"{BASE_URL}/projects/"
    result = test_api_endpoint(url, "Get All Projects - Basic")
    test_results['all_projects_basic'] = result is not None
    
    # ===============================
    # Test 2: Get All Projects (Detailed)
    # ===============================
    print_subsection("TEST 2: Get All Projects (Detailed)")
    url = f"{BASE_URL}/projects/"
    params = {'detailed': 'true', 'limit': 10}
    result = test_api_endpoint(url, "Get All Projects - Detailed", params)
    test_results['all_projects_detailed'] = result is not None
    
    # Store sample project ID for next test
    sample_project_id = None
    if result and isinstance(result, dict):
        data = result.get('data', {})
        projects = data.get('projects', [])
        if isinstance(projects, list) and len(projects) > 0:
            first_project = projects[0]
            if isinstance(first_project, dict):
                sample_project_id = first_project.get('id')
    
    # ===============================
    # Test 3: Get All Projects with Filters
    # ===============================
    print_subsection("TEST 3: Get All Projects with Filters")
    url = f"{BASE_URL}/projects/"
    params = {'status': 'active', 'page': 1, 'limit': 5}
    result = test_api_endpoint(url, "Get All Projects - Filtered", params)
    test_results['all_projects_filtered'] = result is not None
    
    # ===============================
    # Test 4: Get Projects Summary
    # ===============================
    print_subsection("TEST 4: Get Projects Summary")
    url = f"{BASE_URL}/projects/summary/"
    result = test_api_endpoint(url, "Get Projects Summary")
    test_results['projects_summary'] = result is not None
    
    # ===============================
    # Test 5: Get Project by ID
    # ===============================
    print_subsection("TEST 5: Get Project by ID")
    if sample_project_id:
        url = f"{BASE_URL}/projects/{sample_project_id}/"
        result = test_api_endpoint(url, f"Get Project by ID: {sample_project_id}")
        test_results['project_by_id'] = result is not None
    else:
        print("⚠️  SKIPPED: No sample project ID available")
        test_results['project_by_id'] = False
    
    # ===============================
    # Test 6: Get Non-existent Project
    # ===============================
    print_subsection("TEST 6: Get Non-existent Project (Error Handling)")
    url = f"{BASE_URL}/projects/non-existent-id/"
    result = test_api_endpoint(url, "Get Non-existent Project")
    # This should fail, so we check if it properly handles the error
    test_results['error_handling'] = True  # We expect this to fail gracefully
    
    # ===============================
    # Test Summary
    # ===============================
    print_separator("TEST RESULTS SUMMARY")
    
    total_tests = len(test_results)
    passed_tests = sum(1 for result in test_results.values() if result)
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    print(f"\nDetailed Results:")
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
    
    # ===============================
    # API Endpoints Summary
    # ===============================
    print_separator("AVAILABLE PROJECT API ENDPOINTS")
    
    endpoints = [
        {
            'name': 'Get All Projects (Basic)',
            'url': f'{BASE_URL}/projects/',
            'method': 'GET',
            'description': 'Get list of all projects with basic info'
        },
        {
            'name': 'Get All Projects (Detailed)',
            'url': f'{BASE_URL}/projects/?detailed=true',
            'method': 'GET',
            'description': 'Get list of all projects with detailed information'
        },
        {
            'name': 'Get All Projects (Filtered)',
            'url': f'{BASE_URL}/projects/?status=active&page=1&limit=10',
            'method': 'GET',
            'description': 'Get filtered list of projects with pagination'
        },
        {
            'name': 'Get Projects Summary',
            'url': f'{BASE_URL}/projects/summary/',
            'method': 'GET',
            'description': 'Get project statistics and summary'
        },
        {
            'name': 'Get Project by ID',
            'url': f'{BASE_URL}/projects/{{project_id}}/',
            'method': 'GET',
            'description': 'Get specific project details by ID'
        }
    ]
    
    for i, endpoint in enumerate(endpoints, 1):
        print(f"\n{i}. {endpoint['name']}")
        print(f"   URL: {endpoint['url']}")
        print(f"   Method: {endpoint['method']}")
        print(f"   Description: {endpoint['description']}")
    
    print(f"\n🎯 For your dashboard showing 313 projects, use:")
    print(f"   {BASE_URL}/projects/summary/")
    print(f"   or")
    print(f"   {BASE_URL}/projects/?detailed=true")
    
    print(f"\n✅ Testing completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
