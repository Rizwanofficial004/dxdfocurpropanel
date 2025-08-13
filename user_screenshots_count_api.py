#!/usr/bin/env python3
"""
User Screenshots Count API
=========================

API endpoint to get updated screenshot counts for each user.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

# Add Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

from dashboard.models import ScreenshotTracker, UpdateLog

@csrf_exempt
@require_http_methods(["GET"])
def user_screenshots_count_api(request):
    """
    API endpoint to get screenshot counts for each user
    
    Parameters:
    - limit: Maximum number of users to return (default: all)
    - sort_by: Sort by 'count' or 'email' (default: count)
    - order: 'asc' or 'desc' (default: desc)
    - min_count: Minimum screenshot count to include (default: 0)
    """
    
    try:
        # Get query parameters
        limit = request.GET.get('limit', None)
        sort_by = request.GET.get('sort_by', 'count')
        order = request.GET.get('order', 'desc')
        min_count = int(request.GET.get('min_count', 0))
        
        # Get user screenshot counts from database - use the actual screenshot_count field
        queryset = ScreenshotTracker.objects.filter(screenshot_count__gte=min_count)
        
        # Apply sorting
        if sort_by == 'email':
            order_field = 'user_email' if order == 'asc' else '-user_email'
        else:  # sort by count
            order_field = 'screenshot_count' if order == 'asc' else '-screenshot_count'
        
        queryset = queryset.order_by(order_field)
        
        # Apply limit if specified
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        
        # Convert to list and calculate totals
        users_data = []
        total_screenshots = 0
        
        for user in queryset:
            count = user.screenshot_count
            total_screenshots += count
            
            # Calculate percentage
            percentage = 0
            if total_screenshots > 0:
                percentage = round((count / total_screenshots) * 100, 2)
            
            user_info = {
                'user_email': user.user_email,
                'screenshot_count': count,
                'percentage': percentage,
                'last_updated': user.last_updated.isoformat() if user.last_updated else None
            }
            users_data.append(user_info)
        
        # Recalculate percentages based on total
        total_screenshots = sum(user['screenshot_count'] for user in users_data)
        for user in users_data:
            if total_screenshots > 0:
                user['percentage'] = round((user['screenshot_count'] / total_screenshots) * 100, 2)
        
        # Get last update info
        try:
            last_update = UpdateLog.objects.filter(update_type='scheduled_update').order_by('-timestamp').first()
            last_update_time = last_update.timestamp.isoformat() if last_update else None
        except:
            last_update_time = None
        
        response_data = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'total_users': len(users_data),
            'total_screenshots': total_screenshots,
            'last_update': last_update_time,
            'users': users_data,
            'query_params': {
                'limit': limit,
                'sort_by': sort_by,
                'order': order,
                'min_count': min_count
            }
        }
        
        return JsonResponse(response_data, json_dumps_params={'indent': 2})
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def user_screenshots_summary_api(request):
    """
    API endpoint for quick summary statistics
    """
    
    try:
        # Get basic stats
        total_users = ScreenshotTracker.objects.values('user_email').distinct().count()
        total_screenshots = ScreenshotTracker.objects.count()
        
        # Get top 10 users
        top_users = ScreenshotTracker.objects.values('user_email') \
                      .annotate(count=django.db.models.Count('id')) \
                      .order_by('-count')[:10]
        
        # Get recent activity (last 24 hours)
        yesterday = datetime.now() - timedelta(days=1)
        recent_screenshots = ScreenshotTracker.objects.filter(created_at__gte=yesterday).count()
        
        # Get last update info
        last_update = UpdateLog.objects.filter(status='completed').order_by('-completed_at').first()
        
        response_data = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_users': total_users,
                'total_screenshots': total_screenshots,
                'recent_screenshots_24h': recent_screenshots,
                'last_update': last_update.completed_at.isoformat() if last_update else None,
                'top_users': [
                    {
                        'email': user['user_email'],
                        'screenshot_count': user['count']
                    }
                    for user in top_users
                ]
            }
        }
        
        return JsonResponse(response_data, json_dumps_params={'indent': 2})
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

# For direct testing
if __name__ == "__main__":
    import django
    from django.conf import settings
    from django.test import RequestFactory
    
    # Create a test request
    factory = RequestFactory()
    request = factory.get('/api/users/counts/')
    
    # Test the API
    response = user_screenshots_count_api(request)
    print("API Response:")
    print(response.content.decode('utf-8'))
