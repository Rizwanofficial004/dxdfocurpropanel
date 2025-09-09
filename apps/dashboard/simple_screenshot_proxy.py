"""
Simple Screenshot Proxy View - Handle S3 CORS issues
This module provides a simple proxy endpoint to serve S3 screenshots with proper CORS headers
"""

import os
import boto3
import requests
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_control
from botocore.exceptions import ClientError, NoCredentialsError
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class SimpleScreenshotProxyView(View):
    """
    Simple proxy view to serve S3 screenshots with proper CORS headers
    """
    
    def get_cors_headers(self):
        """Return CORS headers for cross-origin requests"""
        return {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With',
            'Access-Control-Max-Age': '86400',
        }
    
    def options(self, request, *args, **kwargs):
        """Handle preflight CORS requests"""
        response = HttpResponse()
        for key, value in self.get_cors_headers().items():
            response[key] = value
        return response
    
    def get(self, request, *args, **kwargs):
        """
        Proxy GET request to serve S3 screenshot with CORS headers
        """
        try:
            # Get the original S3 URL from query parameter
            original_url = request.GET.get('url')
            if not original_url:
                return JsonResponse({
                    'error': 'Missing url parameter',
                    'message': 'Please provide the S3 URL as a query parameter'
                }, status=400)
            
            logger.info(f"Proxying S3 URL: {original_url}")
            
            # Try to fetch the image using the original signed URL
            try:
                response = requests.get(original_url, timeout=30)
                response.raise_for_status()
                
                # Create HTTP response with the image data
                http_response = HttpResponse(
                    response.content,
                    content_type=response.headers.get('Content-Type', 'image/webp')
                )
                
                # Add CORS headers
                for key, value in self.get_cors_headers().items():
                    http_response[key] = value
                
                # Add caching headers
                http_response['Cache-Control'] = 'public, max-age=300'
                http_response['Content-Length'] = len(response.content)
                
                logger.info(f"Successfully proxied screenshot from URL")
                return http_response
                
            except requests.RequestException as e:
                logger.error(f"Network error fetching screenshot: {str(e)}")
                return JsonResponse({
                    'error': 'Screenshot unavailable',
                    'message': 'Unable to fetch screenshot - URL may be expired or inaccessible'
                }, status=404)
        
        except Exception as e:
            logger.error(f"Unexpected error in screenshot proxy: {str(e)}")
            return JsonResponse({
                'error': 'Internal server error',
                'message': 'An unexpected error occurred while processing the screenshot'
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class SimpleScreenshotProxyStatusView(View):
    """
    Status endpoint to check if the screenshot proxy is working
    """
    
    def get(self, request, *args, **kwargs):
        """Return the status of the screenshot proxy service"""
        
        status_data = {
            'status': 'operational',
            'proxy_service': 'active',
            'cors_enabled': True,
            'description': 'Simple screenshot proxy for handling S3 CORS issues',
            'endpoint_usage': {
                'proxy_url': '/api/simple-screenshot-proxy/?url={S3_URL}',
                'status_url': '/api/simple-screenshot-proxy/status/',
                'example': '/api/simple-screenshot-proxy/?url=https://ddsfocustime.s3.amazonaws.com/users_screenshots/...'
            }
        }
        
        response = JsonResponse(status_data)
        
        # Add CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept',
        }
        
        for key, value in cors_headers.items():
            response[key] = value
        
        return response
