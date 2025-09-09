# Add this to your Django backend to fix the screenshot CORS issue
# File: apps/dashboard/screenshot_proxy_views.py

import requests
import logging
from django.http import HttpResponse, JsonResponse
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
@cache_page(1800)  # Cache for 30 minutes
def screenshot_proxy(request, path):
    """
    Proxy S3 screenshots to avoid CORS issues
    
    URL format: /api/proxy/screenshot/users_screenshots/2025-09-01/user@example.com/file.webp
    """
    try:
        # Clean the path
        clean_path = path.strip('/')
        
        # Log the request
        logger.info(f"Screenshot proxy request for: {clean_path}")
        
        # Method 1: Try to generate fresh S3 URL (if you have S3 credentials)
        try:
            s3_client = boto3.client(
                's3',
                region_name='eu-north-1',  # Your S3 region
                # Add your AWS credentials here or use IAM roles
            )
            
            # Generate fresh signed URL
            fresh_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': 'ddsfocustime',
                    'Key': clean_path
                },
                ExpiresIn=3600  # 1 hour
            )
            
            # Fetch image using fresh URL
            response = requests.get(fresh_url, timeout=30)
            
        except (ClientError, Exception) as e:
            logger.warning(f"Failed to generate fresh S3 URL: {e}")
            # Method 2: Fallback - try to fetch using existing signed URL logic
            # You would need to integrate with your existing S3 URL generation
            return JsonResponse({
                'error': 'Unable to generate fresh URL',
                'message': 'S3 credentials not configured for proxy'
            }, status=500)
        
        if response.status_code == 200:
            # Determine content type
            content_type = response.headers.get('content-type', 'image/webp')
            
            # Create response
            http_response = HttpResponse(
                response.content, 
                content_type=content_type
            )
            
            # Add CORS headers
            http_response['Access-Control-Allow-Origin'] = '*'
            http_response['Access-Control-Allow-Methods'] = 'GET'
            http_response['Access-Control-Allow-Headers'] = '*'
            http_response['Cache-Control'] = 'public, max-age=1800'  # 30 minutes
            
            # Add security headers
            http_response['X-Content-Type-Options'] = 'nosniff'
            
            logger.info(f"Successfully proxied screenshot: {clean_path}")
            return http_response
            
        elif response.status_code == 403:
            logger.warning(f"S3 access forbidden for: {clean_path}")
            return JsonResponse({
                'error': 'Access forbidden',
                'message': 'S3 bucket permissions issue'
            }, status=403)
            
        elif response.status_code == 404:
            logger.warning(f"Screenshot not found: {clean_path}")
            return JsonResponse({
                'error': 'Screenshot not found',
                'message': 'File may have been deleted or URL expired'
            }, status=404)
            
        else:
            logger.error(f"S3 error {response.status_code} for: {clean_path}")
            return JsonResponse({
                'error': f'S3 error: {response.status_code}',
                'message': 'Unexpected error from S3'
            }, status=response.status_code)
            
    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching screenshot: {path}")
        return JsonResponse({
            'error': 'Request timeout',
            'message': 'S3 request took too long'
        }, status=504)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error for screenshot {path}: {e}")
        return JsonResponse({
            'error': 'Request failed',
            'message': str(e)
        }, status=500)
        
    except Exception as e:
        logger.error(f"Unexpected error in screenshot proxy {path}: {e}")
        return JsonResponse({
            'error': 'Internal server error',
            'message': 'Unexpected error occurred'
        }, status=500)


# Add this to your urls.py
# File: apps/dashboard/urls.py

from django.urls import path, re_path
from . import screenshot_proxy_views

urlpatterns = [
    # ... your existing URLs ...
    
    # Screenshot proxy endpoint
    re_path(
        r'^proxy/screenshot/(?P<path>.+)$', 
        screenshot_proxy_views.screenshot_proxy, 
        name='screenshot_proxy'
    ),
]

# Or in your main project urls.py, add:
urlpatterns = [
    # ... existing patterns ...
    path('api/', include('apps.dashboard.urls')),
]


# ALTERNATIVE: Simple proxy without AWS SDK
@csrf_exempt
@require_http_methods(["GET"])
def simple_screenshot_proxy(request, path):
    """
    Simple proxy that forwards requests to your existing S3 URL generation logic
    """
    try:
        # This assumes you have a function that generates fresh S3 URLs
        # You would integrate with your existing live-tracking logic here
        
        # For now, return a helpful error message
        return JsonResponse({
            'error': 'Proxy not fully implemented',
            'message': 'Integrate with your existing S3 URL generation logic',
            'requested_path': path,
            'next_steps': [
                'Add AWS credentials to Django settings',
                'Import your existing S3 URL generation function',
                'Update this proxy to use your S3 client'
            ]
        }, status=501)
        
    except Exception as e:
        return JsonResponse({
            'error': 'Proxy error',
            'message': str(e)
        }, status=500)
