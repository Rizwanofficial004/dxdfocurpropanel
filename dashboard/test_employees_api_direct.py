#!/usr/bin/env python
"""
Direct test of the Dashboard Analytics Employees API
"""
import os
import django
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

# Now import Django modules
from django.test import RequestFactory
from django.http import HttpRequest
from dashboard.dashboard_analytics_apis import total_employees_api

def test_employees_api():
    """Test the employees API directly"""
    print("🧪 Testing Dashboard Analytics - Total Employees API")
    print("=" * 60)
    
    # Create a mock request
    factory = RequestFactory()
    request = factory.get('/api/dashboard/analytics/employees/')
    
    try:
        # Call the API function directly
        response = total_employees_api(request)
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"📄 Content-Type: {response.get('Content-Type', 'application/json')}")
        print("📊 Response Data:")
        print("-" * 40)
        print(response.content.decode('utf-8'))
        print("-" * 40)
        
        if response.status_code == 200:
            print("🎉 API Test PASSED!")
        else:
            print("❌ API Test FAILED!")
            
    except Exception as e:
        print(f"💥 Error during API test: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_employees_api()
