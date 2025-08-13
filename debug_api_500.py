#!/usr/bin/env python3
"""
Debug API 500 Error - Detailed error checking
"""

from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
import json
import traceback
from datetime import datetime

@never_cache
@csrf_exempt  
@require_http_methods(["GET"])
def debug_screenshots_api(request):
    """
    Debug version of the screenshots API with detailed error reporting
    """
    debug_info = {
        'timestamp': datetime.now().isoformat(),
        'request_path': request.path,
        'request_method': request.method,
        'debug_steps': []
    }
    
    try:
        debug_info['debug_steps'].append("Step 1: Starting API call")
        
        # Try to import the model
        debug_info['debug_steps'].append("Step 2: Importing model")
        try:
            from dashboard.models import ScreenshotTracker
            debug_info['debug_steps'].append("Step 2: ✅ Model imported successfully")
        except ImportError as e:
            debug_info['debug_steps'].append(f"Step 2: ❌ Model import failed: {str(e)}")
            raise e
            
        # Try to check if the table exists
        debug_info['debug_steps'].append("Step 3: Checking if table exists")
        try:
            from django.db import connection
            tables = connection.introspection.table_names()
            table_name = ScreenshotTracker._meta.db_table
            debug_info['table_name'] = table_name
            debug_info['available_tables'] = tables[:10]  # First 10 tables
            
            if table_name in tables:
                debug_info['debug_steps'].append(f"Step 3: ✅ Table '{table_name}' exists")
            else:
                debug_info['debug_steps'].append(f"Step 3: ❌ Table '{table_name}' does not exist")
                debug_info['error'] = f"Table {table_name} does not exist. Run migrations."
                return HttpResponse(json.dumps(debug_info, indent=2), content_type='application/json', status=500)
                
        except Exception as e:
            debug_info['debug_steps'].append(f"Step 3: ❌ Table check failed: {str(e)}")
            debug_info['error'] = str(e)
            return HttpResponse(json.dumps(debug_info, indent=2), content_type='application/json', status=500)
        
        # Try to query the model
        debug_info['debug_steps'].append("Step 4: Querying database")
        try:
            users = ScreenshotTracker.objects.all()
            user_count = users.count()
            debug_info['debug_steps'].append(f"Step 4: ✅ Found {user_count} users in database")
            debug_info['user_count'] = user_count
        except Exception as e:
            debug_info['debug_steps'].append(f"Step 4: ❌ Database query failed: {str(e)}")
            debug_info['error'] = str(e)
            return HttpResponse(json.dumps(debug_info, indent=2), content_type='application/json', status=500)
        
        # Try to build the response
        debug_info['debug_steps'].append("Step 5: Building response data")
        try:
            users_data = []
            total_screenshots = 0
            
            for user in users[:5]:  # Limit to first 5 for debugging
                count = user.screenshot_count
                total_screenshots += count
                
                users_data.append({
                    'user_email': user.user_email,
                    'screenshot_count': count,
                    'last_updated': user.last_updated.isoformat() if user.last_updated else None
                })
            
            debug_info['debug_steps'].append(f"Step 5: ✅ Built data for {len(users_data)} users")
            debug_info['sample_data'] = users_data
            debug_info['total_screenshots'] = total_screenshots
            
        except Exception as e:
            debug_info['debug_steps'].append(f"Step 5: ❌ Data building failed: {str(e)}")
            debug_info['error'] = str(e)
            return HttpResponse(json.dumps(debug_info, indent=2), content_type='application/json', status=500)
        
        # Success!
        debug_info['debug_steps'].append("Step 6: ✅ API call completed successfully")
        debug_info['success'] = True
        
        response = HttpResponse(
            json.dumps(debug_info, indent=2),
            content_type='application/json'
        )
        
        response['Access-Control-Allow-Origin'] = '*'
        return response
        
    except Exception as e:
        debug_info['debug_steps'].append(f"❌ Unexpected error: {str(e)}")
        debug_info['error'] = str(e)
        debug_info['traceback'] = traceback.format_exc()
        debug_info['success'] = False
        
        response = HttpResponse(
            json.dumps(debug_info, indent=2),
            content_type='application/json',
            status=500
        )
        
        response['Access-Control-Allow-Origin'] = '*'
        return response
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

def test_simple_api():
    """Test the simple API directly"""
    print("🔍 Testing Simple API Directly")
    print("=" * 40)
    
    try:
        # Import after Django setup
        from simple_api import simple_screenshots_api
        from dashboard.models import ScreenshotTracker
        
        print("✅ Imports successful")
        
        # Check if there's data in the database
        user_count = ScreenshotTracker.objects.count()
        print(f"📊 Users in database: {user_count}")
        
        if user_count == 0:
            print("⚠️ No users found in database!")
            print("🔧 Let's check if the ScreenshotTracker table exists...")
            
            # Try to create a test user
            try:
                test_user = ScreenshotTracker.objects.create(
                    user_email="test@example.com",
                    screenshot_count=100
                )
                print("✅ Test user created successfully")
                test_user.delete()  # Clean up
            except Exception as e:
                print(f"❌ Error creating test user: {e}")
                return
        
        # Test the API function
        factory = RequestFactory()
        request = factory.get('/api/actual-count-total/screenshots/')
        
        print("🧪 Testing API function...")
        response = simple_screenshots_api(request)
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📄 Response content type: {response.get('Content-Type', 'N/A')}")
        
        if response.status_code == 200:
            print("✅ API test successful!")
            content = response.content.decode('utf-8')
            print(f"📄 Response (first 500 chars): {content[:500]}")
        else:
            print("❌ API test failed!")
            content = response.content.decode('utf-8')
            print(f"🔍 Error response: {content}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_api()
