"""
Django API Integration - Instant Screenshot Data
Add this to your Django views.py for instant responses
"""

import json
import os
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

class InstantScreenshotReader:
    """Read cached screenshot data for instant API responses"""
    
    def __init__(self):
        # Update this path to your screenshot counter directory
        self.base_path = r"c:\Users\DDS\Desktop\New folder"
        self.data_file = os.path.join(self.base_path, "daily_screenshot_counts.json")
        self.status_file = os.path.join(self.base_path, "service_status.json")
    
    def get_cached_data(self):
        """Get screenshot data instantly from cache"""
        try:
            if not os.path.exists(self.data_file):
                return {
                    'error': 'Screenshot data not available yet',
                    'message': 'Background service is updating data...',
                    'status': 'waiting'
                }
            
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Add freshness info
            file_time = os.path.getmtime(self.data_file)
            hours_old = (datetime.now().timestamp() - file_time) / 3600
            data['data_age_hours'] = round(hours_old, 2)
            data['is_fresh'] = hours_old < 25
            
            return data
            
        except Exception as e:
            return {
                'error': f'Error reading screenshot data: {str(e)}',
                'status': 'error'
            }

# Create global reader instance
screenshot_reader = InstantScreenshotReader()

# Django API Views
@require_http_methods(["GET"])
def get_all_screenshot_counts(request):
    """
    GET /api/screenshots/all
    Returns all user screenshot counts instantly
    """
    data = screenshot_reader.get_cached_data()
    return JsonResponse(data)

@require_http_methods(["GET"])
def get_user_screenshot_count(request, email):
    """
    GET /api/screenshots/user/<email>
    Returns specific user's screenshot count instantly
    """
    data = screenshot_reader.get_cached_data()
    
    if 'error' in data:
        return JsonResponse(data)
    
    try:
        user_counts = data['data']['user_counts']
        
        # Find user (case insensitive search)
        found_user = None
        for user_email, count in user_counts.items():
            if email.lower() in user_email.lower() or user_email.lower() in email.lower():
                found_user = {
                    'user_email': user_email,
                    'screenshot_count': count,
                    'last_updated': data['last_updated'],
                    'status': 'success'
                }
                break
        
        if found_user:
            return JsonResponse(found_user)
        else:
            return JsonResponse({
                'error': f'User "{email}" not found',
                'total_users_available': len(user_counts),
                'status': 'not_found'
            })
            
    except Exception as e:
        return JsonResponse({
            'error': f'Error processing request: {str(e)}',
            'status': 'error'
        })

@require_http_methods(["GET"])
def get_top_screenshot_users(request, limit=10):
    """
    GET /api/screenshots/top/<limit>
    Returns top N users by screenshot count
    """
    data = screenshot_reader.get_cached_data()
    
    if 'error' in data:
        return JsonResponse(data)
    
    try:
        user_counts = data['data']['user_counts']
        
        # Sort and limit
        sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
        top_users = sorted_users[:limit]
        
        return JsonResponse({
            'top_users': [
                {
                    'rank': i + 1,
                    'email': email,
                    'screenshot_count': count
                }
                for i, (email, count) in enumerate(top_users)
            ],
            'total_users': len(user_counts),
            'showing_top': len(top_users),
            'last_updated': data['last_updated'],
            'status': 'success'
        })
        
    except Exception as e:
        return JsonResponse({
            'error': f'Error getting top users: {str(e)}',
            'status': 'error'
        })

@require_http_methods(["GET"])
def get_screenshot_service_status(request):
    """
    GET /api/screenshots/status
    Returns background service status
    """
    try:
        if os.path.exists(screenshot_reader.status_file):
            with open(screenshot_reader.status_file, 'r') as f:
                status_data = json.load(f)
        else:
            status_data = {
                'status': 'unknown',
                'message': 'Service status not available'
            }
        
        # Add data file info
        if os.path.exists(screenshot_reader.data_file):
            file_time = os.path.getmtime(screenshot_reader.data_file)
            status_data['data_file_last_modified'] = datetime.fromtimestamp(file_time).isoformat()
            status_data['data_available'] = True
        else:
            status_data['data_available'] = False
        
        return JsonResponse(status_data)
        
    except Exception as e:
        return JsonResponse({
            'error': f'Error getting service status: {str(e)}',
            'status': 'error'
        })

# URL patterns to add to your Django urls.py:
"""
from django.urls import path
from . import views

urlpatterns = [
    # Instant Screenshot APIs
    path('api/screenshots/all/', views.get_all_screenshot_counts, name='all_screenshots'),
    path('api/screenshots/user/<str:email>/', views.get_user_screenshot_count, name='user_screenshots'),
    path('api/screenshots/top/<int:limit>/', views.get_top_screenshot_users, name='top_screenshots'),
    path('api/screenshots/status/', views.get_screenshot_service_status, name='screenshot_status'),
]
"""
