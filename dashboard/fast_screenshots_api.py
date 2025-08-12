
"""
Fast All Screenshots API using S3 Inventory data
This is much faster than direct S3 listing for large buckets
"""
import json
import os
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Cache file paths (prioritize complete cache)
COMPLETE_CACHE_FILE = os.path.join(os.path.dirname(__file__), 'data', 'complete_screenshots_cache.json')
SAMPLE_CACHE_FILE = os.path.join(os.path.dirname(__file__), 'data', 'screenshots_inventory_cache.json')

def get_cache_file():
    """Get the best available cache file"""
    if os.path.exists(COMPLETE_CACHE_FILE):
        return COMPLETE_CACHE_FILE, 'complete'
    elif os.path.exists(SAMPLE_CACHE_FILE):
        return SAMPLE_CACHE_FILE, 'sample'
    else:
        return None, None

@csrf_exempt
@require_http_methods(["GET"])
def fast_all_screenshots_api(request):
    """
    Fast API using cached inventory data
    
    GET: /api/screenshots/fast-all/
    Parameters:
    - limit_users=N : Limit number of users returned
    - limit_per_user=N : Limit screenshots per user  
    - sort_by=count|size|date|name : Sort users by different criteria
    """
    try:
        # Get parameters
        limit_users = request.GET.get('limit_users', 50)
        limit_per_user = request.GET.get('limit_per_user', 100)
        sort_by = request.GET.get('sort_by', 'count')
        
        if isinstance(limit_users, str):
            limit_users = int(limit_users) if limit_users.isdigit() else 50
        if isinstance(limit_per_user, str):
            limit_per_user = int(limit_per_user) if limit_per_user.isdigit() else 100
        
        # Load cached data (prioritize complete cache)
        cache_file, cache_type = get_cache_file()
        
        if not cache_file:
            return JsonResponse({
                "success": False,
                "message": "No inventory cache found. Run inventory analysis first.",
                "data": {}
            }, status=404)
        
        with open(cache_file, 'r') as f:
            cache_data = json.load(f)
        
        user_data = cache_data.get('users', {})
        
        # Sort users
        if sort_by == 'size':
            sorted_users = sorted(user_data.items(), 
                                key=lambda x: x[1]['total_size'], reverse=True)
        elif sort_by == 'date':
            sorted_users = sorted(user_data.items(), 
                                key=lambda x: x[1]['latest_date'] or '', reverse=True)
        elif sort_by == 'name':
            sorted_users = sorted(user_data.items())
        else:  # count
            sorted_users = sorted(user_data.items(), 
                                key=lambda x: x[1]['total_count'], reverse=True)
        
        # Limit users
        sorted_users = sorted_users[:limit_users]
        
        # Format response
        users_response = []
        total_screenshots = 0
        
        for email, data in sorted_users:
            # Limit files per user
            files = data.get('files', [])[:limit_per_user]
            
            user_info = {
                "employee_email": email,
                "employee_name": email.split('@')[0].replace('.', ' ').title(),
                "screenshot_count": data['total_count'],
                "total_size_mb": round(data['total_size'] / (1024*1024), 2),
                "project_count": len(data.get('projects', {})),
                "latest_activity": data.get('latest_date', ''),
                "top_projects": sorted(data.get('projects', {}).items(), 
                                     key=lambda x: x[1], reverse=True)[:5],
                "sample_screenshots": files
            }
            
            users_response.append(user_info)
            total_screenshots += data['total_count']
        
        response_data = {
            "users": users_response,
            "total_users_returned": len(users_response),
            "total_users_available": len(user_data),
            "total_screenshots": total_screenshots,
            "cache_type": cache_type,
            "cache_file": os.path.basename(cache_file),
            "cache_generated": cache_data.get('generated_at', ''),
            "parameters": {
                "limit_users": limit_users,
                "limit_per_user": limit_per_user,
                "sort_by": sort_by
            }
        }
        
        cache_msg = "complete analysis" if cache_type == 'complete' else "sample analysis"
        
        return JsonResponse({
            "success": True,
            "message": f"Found {len(users_response)} users with {total_screenshots:,} screenshots ({cache_msg})",
            "data": response_data,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Error retrieving cached screenshots: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)
