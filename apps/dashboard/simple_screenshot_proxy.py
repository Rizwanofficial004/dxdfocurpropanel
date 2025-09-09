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
    Uses AWS credentials to access private S3 bucket
    """
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self.bucket_name = 'ddsfocustime'
        self._initialize_s3()
    
    def _initialize_s3(self):
        """Initialize S3 client with credentials"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                aws_secret_access_key='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',
                region_name='eu-north-1'
            )
            logger.info("S3 client initialized successfully for screenshot proxy")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
    
    def _extract_s3_key_from_url(self, s3_url):
        """Extract S3 key from S3 URL"""
        try:
            if 'ddsfocustime.s3.' in s3_url and 'amazonaws.com/' in s3_url:
                # Extract key from URL like: https://ddsfocustime.s3.eu-north-1.amazonaws.com/users_screenshots/...
                key = s3_url.split('amazonaws.com/')[-1]
                return key
            return None
        except Exception as e:
            logger.error(f"Error extracting S3 key from URL {s3_url}: {str(e)}")
            return None
    
    def _get_object_from_s3(self, key):
        """Get object directly from S3 using credentials"""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
            return response['Body'].read(), response.get('ContentType', 'image/webp')
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NoSuchKey':
                logger.error(f"S3 object not found: {key}")
                return None, None
            else:
                logger.error(f"S3 access error for {key}: {str(e)}")
                return None, None
        except Exception as e:
            logger.error(f"Unexpected error accessing S3 object {key}: {str(e)}")
            return None, None
    
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
        Uses AWS credentials to access private S3 bucket
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
            
            # Extract S3 key from the URL
            s3_key = self._extract_s3_key_from_url(original_url)
            if not s3_key:
                return JsonResponse({
                    'error': 'Invalid S3 URL',
                    'message': 'Unable to extract S3 key from provided URL'
                }, status=400)
            
            logger.info(f"Extracted S3 key: {s3_key}")
            
            # Check if S3 client is initialized
            if not self.s3_client:
                logger.error("S3 client not initialized")
                return JsonResponse({
                    'error': 'S3 service unavailable',
                    'message': 'Unable to connect to S3 service'
                }, status=503)
            
            # Get object from S3 using credentials
            image_data, content_type = self._get_object_from_s3(s3_key)
            
            if image_data is None:
                return JsonResponse({
                    'error': 'Screenshot not found',
                    'message': 'The requested screenshot could not be found or accessed',
                    's3_key': s3_key
                }, status=404)
            
            # Create HTTP response with the image data
            http_response = HttpResponse(
                image_data,
                content_type=content_type or 'image/webp'
            )
            
            # Add CORS headers
            for key, value in self.get_cors_headers().items():
                http_response[key] = value
            
            # Add caching headers
            http_response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
            http_response['Content-Length'] = len(image_data)
            
            logger.info(f"Successfully served screenshot from S3 key: {s3_key}")
            return http_response
        
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
        
        # Check S3 connection status
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                aws_secret_access_key='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',
                region_name='eu-north-1'
            )
            # Test S3 connection by listing bucket
            s3_client.head_bucket(Bucket='ddsfocustime')
            s3_status = 'connected'
            s3_message = 'S3 bucket accessible'
        except Exception as e:
            s3_status = 'error'
            s3_message = f'S3 connection failed: {str(e)}'
        
        status_data = {
            'status': 'operational',
            'proxy_service': 'active',
            'cors_enabled': True,
            's3_integration': {
                'status': s3_status,
                'bucket': 'ddsfocustime',
                'region': 'eu-north-1',
                'message': s3_message
            },
            'description': 'S3 screenshot proxy with AWS credentials for private bucket access',
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
