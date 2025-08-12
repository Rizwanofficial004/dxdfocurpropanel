#!/usr/bin/env python3
"""
Direct Django API Test - Import and test the function directly
"""
import os
import sys
import django

# Add the project directory to the Python path
project_path = r"c:\Users\deniz\OneDrive\Email attachments\Masaüstü\Git-Projects\dxdfocurpropanel"
sys.path.append(project_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
os.chdir(project_path)
django.setup()

# Now we can import Django modules
from django.test import RequestFactory
from django.http import HttpRequest
from dashboard.screenshots_search_api import screenshots_search_api

def test_api_directly():
    """Test the API function directly without HTTP server"""
    print("🚀 Testing screenshots_search_api function directly")
    print("=" * 50)
    
    # Create a mock request
    factory = RequestFactory()
    
    # Test Case 1: Simple search
    print("\n📋 Test Case 1: Simple search for 'haseeb'")
    print("-" * 30)
    
    request = factory.get('/api/screenshots/search/', {
        'search': 'haseeb',
        'limit': 5
    })
    
    try:
        response = screenshots_search_api(request)
        print(f"📊 Status Code: {response.status_code}")
        
        if hasattr(response, 'content'):
            import json
            data = json.loads(response.content.decode('utf-8'))
            
            print(f"✅ Success: {data.get('success')}")
            print(f"📝 Message: {data.get('message')}")
            
            if 'data' in data:
                results = data['data'].get('results', [])
                print(f"📊 Results Count: {len(results)}")
                print(f"📈 Total Available: {data['data'].get('total', 'N/A')}")
                
                if results:
                    print("\n🔍 Sample Results:")
                    for i, result in enumerate(results[:2]):  # Show first 2
                        print(f"   {i+1}. Employee: {result.get('employee_email', 'N/A')}")
                        print(f"      Screenshots: {result.get('screenshot_count', 'N/A')}")
                        print(f"      Last Activity: {result.get('last_activity', 'N/A')}")
                        
    except Exception as e:
        print(f"💥 Error: {e}")
        import traceback
        traceback.print_exc()
    
    # Test Case 2: Search with date filter
    print("\n📋 Test Case 2: Search with date filter")
    print("-" * 30)
    
    request = factory.get('/api/screenshots/search/', {
        'search': 'nawaz',
        'date': '2024-08-01',
        'limit': 3
    })
    
    try:
        response = screenshots_search_api(request)
        print(f"📊 Status Code: {response.status_code}")
        
        if hasattr(response, 'content'):
            data = json.loads(response.content.decode('utf-8'))
            print(f"✅ Success: {data.get('success')}")
            print(f"📝 Message: {data.get('message')}")
            
    except Exception as e:
        print(f"💥 Error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Direct API Test Complete")

if __name__ == "__main__":
    test_api_directly()
