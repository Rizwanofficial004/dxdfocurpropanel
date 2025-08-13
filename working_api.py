#!/usr/bin/env python3
"""
Simple Working API - No database dependencies
"""

from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
import json
from datetime import datetime

@never_cache
@csrf_exempt
@require_http_methods(["GET"])
def working_screenshots_api(request):
    """
    Simple API that works without database dependencies
    """
    try:
        # Try to get data from database, but have fallback
        try:
            from dashboard.models import ScreenshotTracker
            users = ScreenshotTracker.objects.all().order_by('-screenshot_count')
            
            users_data = []
            total_screenshots = 0
            
            for user in users:
                count = user.screenshot_count
                total_screenshots += count
                
                users_data.append({
                    'user_email': user.user_email,
                    'screenshot_count': count,
                    'last_updated': user.last_updated.isoformat() if user.last_updated else None
                })
            
            # Calculate percentages
            for user in users_data:
                if total_screenshots > 0:
                    user['percentage'] = round((user['screenshot_count'] / total_screenshots) * 100, 2)
                else:
                    user['percentage'] = 0
                    
            database_status = "connected"
            
        except Exception as db_error:
            # Fallback data if database is not available
            users_data = [
                {
                    'user_email': 'demo@example.com',
                    'screenshot_count': 1000,
                    'last_updated': datetime.now().isoformat(),
                    'percentage': 100.0
                }
            ]
            total_screenshots = 1000
            database_status = f"error: {str(db_error)}"
        
        response_data = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'total_users': len(users_data),
            'total_screenshots': total_screenshots,
            'database_status': database_status,
            'users': users_data
        }
        
        # Create JSON response
        response = HttpResponse(
            json.dumps(response_data, indent=2),
            content_type='application/json'
        )
        
        # Add CORS headers
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
        
    except Exception as e:
        error_response = {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat(),
            'message': 'API is working but encountered an error'
        }
        
        response = HttpResponse(
            json.dumps(error_response, indent=2),
            content_type='application/json',
            status=500
        )
        
        response['Access-Control-Allow-Origin'] = '*'
        return response
