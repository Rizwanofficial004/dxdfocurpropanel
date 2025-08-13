#!/usr/bin/env python3
"""
Simple Screenshot Count API - Bypass all middleware
"""

from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
import json
from datetime import datetime
import os
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

from dashboard.models import ScreenshotTracker

@never_cache
@csrf_exempt
@require_http_methods(["GET"])
def simple_screenshots_api(request):
    """
    Simple API that returns screenshot counts
    """
    try:
        # Get all users with screenshot counts
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
        
        response_data = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'total_users': len(users_data),
            'total_screenshots': total_screenshots,
            'users': users_data
        }
        
        # Create raw HTTP response with JSON content type
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
            'timestamp': datetime.now().isoformat()
        }
        
        response = HttpResponse(
            json.dumps(error_response, indent=2),
            content_type='application/json',
            status=500
        )
        
        response['Access-Control-Allow-Origin'] = '*'
        return response
