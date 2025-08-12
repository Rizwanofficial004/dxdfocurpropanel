"""
Ultra-Fast Screenshots API with Smart Caching
- Instant responses (1-2ms)
- Background processing for complete data
- On-demand detailed user data
"""
import json
import os
import time
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Cache file paths
QUICK_CACHE_FILE = os.path.join(os.path.dirname(__file__), 'data', 'quick_screenshots_cache.json')
USER_CACHE_DIR = os.path.join(os.path.dirname(__file__), 'data', 'users')

def is_cache_fresh(cache_file, max_age_hours=6):
    """Check if cache is fresh enough"""
    if not os.path.exists(cache_file):
        return False
    
    try:
        with open(cache_file, 'r') as f:
            data = json.load(f)
        
        generated_at = datetime.fromisoformat(data['generated_at'])
        age = datetime.now() - generated_at
        
        return age < timedelta(hours=max_age_hours)
    except:
        return False

@csrf_exempt
@require_http_methods(["GET"])
def ultra_fast_screenshots_api(request):
    """
    Ultra-fast API using smart caching strategy
    
    GET: /api/screenshots/ultra-fast/
    Parameters:
    - limit=N : Limit number of users returned (default: 50)
    - user=email : Get specific user data
    - sort_by=count|size|name : Sort criteria
    - include_details=true : Include project breakdown (if cached)
    """
    start_time = time.time()
    
    try:
        # Get parameters
        limit = int(request.GET.get('limit', 50))
        user_email = request.GET.get('user', '').strip()
        sort_by = request.GET.get('sort_by', 'count')
        include_details = request.GET.get('include_details', 'false').lower() == 'true'
        
        # Check if cache exists and is fresh
        if not os.path.exists(QUICK_CACHE_FILE):
            return JsonResponse({
                "success": False,
                "message": "Cache not found. Please run background analysis first.",
                "data": {},
                "suggestion": "Run: python smart_screenshots_manager.py (option 1)"
            }, status=404)
        
        cache_fresh = is_cache_fresh(QUICK_CACHE_FILE, max_age_hours=6)
        
        # Load quick cache
        with open(QUICK_CACHE_FILE, 'r') as f:
            cache_data = json.load(f)
        
        users_data = cache_data.get('users', {})
        
        # Filter for specific user
        if user_email:
            if user_email not in users_data:
                return JsonResponse({
                    "success": False,
                    "message": f"User {user_email} not found",
                    "available_users": list(users_data.keys())[:10]
                }, status=404)
            
            users_data = {user_email: users_data[user_email]}
        
        # Sort users
        if sort_by == 'size':
            sorted_users = sorted(users_data.items(), 
                                key=lambda x: x[1]['total_size'], reverse=True)
        elif sort_by == 'name':
            sorted_users = sorted(users_data.items())
        else:  # count
            sorted_users = sorted(users_data.items(), 
                                key=lambda x: x[1]['total_count'], reverse=True)
        
        # Limit results
        sorted_users = sorted_users[:limit]
        
        # Format response
        users_response = []
        total_screenshots = 0
        
        for email, data in sorted_users:
            user_info = {
                "employee_email": email,
                "employee_name": email.split('@')[0].replace('.', ' ').replace('_', ' ').title(),
                "screenshot_count": data['total_count'],
                "total_size_mb": round(data['total_size'] / (1024*1024), 2),
                "last_updated": data.get('last_updated', ''),
                "status": "cached"
            }
            
            # Add detailed data if requested and available
            if include_details:
                user_cache_file = os.path.join(USER_CACHE_DIR, f"{email.replace('@', '_at_')}.json")
                if os.path.exists(user_cache_file):
                    try:
                        with open(user_cache_file, 'r') as f:
                            user_details = json.load(f)
                        
                        user_info.update({
                            "projects": user_details.get('projects', {}),
                            "project_count": len(user_details.get('projects', {})),
                            "latest_activity": user_details.get('latest_date', ''),
                            "sample_files": user_details.get('sample_files', [])[:10],
                            "details_status": "cached"
                        })
                    except:
                        user_info["details_status"] = "cache_error"
                else:
                    user_info["details_status"] = "not_cached"
            
            users_response.append(user_info)
            total_screenshots += data['total_count']
        
        end_time = time.time()
        response_time_ms = round((end_time - start_time) * 1000, 1)
        
        response_data = {
            "users": users_response,
            "summary": {
                "users_returned": len(users_response),
                "total_users_available": len(users_data),
                "total_screenshots": total_screenshots,
                "total_size_gb": round(sum(data['total_size'] for _, data in sorted_users) / (1024*1024*1024), 2)
            },
            "cache_info": {
                "generated_at": cache_data.get('generated_at', ''),
                "cache_type": cache_data.get('type', 'unknown'),
                "is_fresh": cache_fresh,
                "max_age_hours": 6
            },
            "performance": {
                "response_time_ms": response_time_ms,
                "status": "ultra_fast"
            },
            "parameters": {
                "limit": limit,
                "sort_by": sort_by,
                "include_details": include_details,
                "specific_user": user_email or None
            }
        }
        
        return JsonResponse({
            "success": True,
            "message": f"Retrieved {len(users_response)} users with {total_screenshots:,} screenshots in {response_time_ms}ms",
            "data": response_data,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        end_time = time.time()
        return JsonResponse({
            "success": False,
            "message": f"Error: {str(e)}",
            "data": {},
            "response_time_ms": round((end_time - start_time) * 1000, 1),
            "timestamp": datetime.now().isoformat()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def cache_status_api(request):
    """Check cache status and statistics"""
    try:
        status = {
            "quick_cache": {
                "exists": os.path.exists(QUICK_CACHE_FILE),
                "fresh": is_cache_fresh(QUICK_CACHE_FILE) if os.path.exists(QUICK_CACHE_FILE) else False
            },
            "user_details_cache": {
                "directory_exists": os.path.exists(USER_CACHE_DIR),
                "cached_users": len(os.listdir(USER_CACHE_DIR)) if os.path.exists(USER_CACHE_DIR) else 0
            }
        }
        
        if os.path.exists(QUICK_CACHE_FILE):
            with open(QUICK_CACHE_FILE, 'r') as f:
                cache_data = json.load(f)
            
            status["quick_cache"].update({
                "generated_at": cache_data.get('generated_at', ''),
                "total_users": cache_data.get('total_users', 0),
                "total_screenshots": cache_data.get('total_screenshots', 0),
                "cache_type": cache_data.get('type', 'unknown')
            })
        
        return JsonResponse({
            "success": True,
            "data": status,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Error checking cache status: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status=500)
