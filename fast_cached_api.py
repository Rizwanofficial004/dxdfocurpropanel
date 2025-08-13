#!/usr/bin/env python3
"""
Fast Screenshot Count API - Cached JSON Version
Reads from cached JSON file for super fast response
"""

from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import never_cache
import json
import os
from datetime import datetime
import traceback

@never_cache
@csrf_exempt
@require_http_methods(["GET"])
def fast_cached_screenshots_api(request):
    """
    Super fast API that returns screenshot counts from cached JSON file
    """
    try:
        # Path to cached JSON file
        cache_file_path = os.path.join(
            os.path.dirname(__file__), 
            'dashboard', 'data', 'screenshot_data_cache.json'
        )
        
        # Alternative path if above doesn't work
        if not os.path.exists(cache_file_path):
            cache_file_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), 
                'dashboard', 'data', 'screenshot_data_cache.json'
            )
        
        # Read cached data
        if os.path.exists(cache_file_path):
            with open(cache_file_path, 'r', encoding='utf-8') as f:
                cached_data = json.load(f)
            
            # Update timestamp and status
            cached_data['api_response_time'] = datetime.now().isoformat()
            cached_data['data_source'] = 'Cached JSON file'
            cached_data['response_speed'] = 'Super Fast (<50ms)'
            
            # Create HTTP response with CORS headers
            response = HttpResponse(
                json.dumps(cached_data, indent=2),
                content_type='application/json'
            )
            
            # Add CORS headers
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type'
            
            return response
        
        else:
            # Fallback if cache file doesn't exist
            fallback_data = {
                'success': False,
                'error': 'Cache file not found',
                'timestamp': datetime.now().isoformat(),
                'cache_file_path': cache_file_path,
                'message': 'Please run the cache update script to generate data'
            }
            
            response = HttpResponse(
                json.dumps(fallback_data, indent=2),
                content_type='application/json',
                status=404
            )
            
            response['Access-Control-Allow-Origin'] = '*'
            return response
            
    except Exception as e:
        # Error response
        error_response = {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat(),
            'traceback': traceback.format_exc(),
            'message': 'Error reading cached data'
        }
        
        response = HttpResponse(
            json.dumps(error_response, indent=2),
            content_type='application/json',
            status=500
        )
        
        response['Access-Control-Allow-Origin'] = '*'
        return response
