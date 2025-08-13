#!/usr/bin/env python3
"""
Fast Cached Screenshots API - Reads from JSON cache
Super fast response time by reading pre-cached data
"""

from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
import json
import os
from datetime import datetime

@never_cache
@csrf_exempt
@require_http_methods(["GET"])
def cached_screenshots_api(request):
    """
    Fast API that returns cached screenshot data from JSON file
    Updates every 6 hours via cron job
    """
    try:
        # Read from cache file - fix path calculation
        import django
        from django.conf import settings
        
        # Get the base directory (where manage.py is located)
        base_dir = settings.BASE_DIR
        cache_file = os.path.join(base_dir, 'cache', 'screenshots_data.json')
        
        print(f"Looking for cache file at: {cache_file}")
        print(f"Cache file exists: {os.path.exists(cache_file)}")
        
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            # Update timestamp to show when API was called
            cache_data['api_call_time'] = datetime.now().isoformat()
            cache_data['status'] = "Real data from S3 cache (fast response)"
            
            # Create response
            response = HttpResponse(
                json.dumps(cache_data, indent=2, ensure_ascii=False),
                content_type='application/json; charset=utf-8'
            )
            
        else:
            # Fallback if cache file doesn't exist
            fallback_data = {
                "success": False,
                "error": "Cache file not found",
                "message": "Run update_s3_cache.py to generate cache",
                "timestamp": datetime.now().isoformat(),
                "status": "Cache file missing"
            }
            
            response = HttpResponse(
                json.dumps(fallback_data, indent=2),
                content_type='application/json',
                status=503
            )
        
        # Add CORS headers
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
        
    except Exception as e:
        # Error response
        error_data = {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
            "status": "API error"
        }
        
        response = HttpResponse(
            json.dumps(error_data, indent=2),
            content_type='application/json',
            status=500
        )
        
        response['Access-Control-Allow-Origin'] = '*'
        return response
