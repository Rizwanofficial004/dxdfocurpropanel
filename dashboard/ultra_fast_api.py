"""
Ultra Fast Screenshots API using Auto-Tracking Database
This provides instant responses from pre-tracked data
"""

import json
import os
import sqlite3
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'screenshots_tracker.db')
CACHE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'screenshots_cache.json')

@csrf_exempt
@require_http_methods(["GET"])
def ultra_fast_screenshots_api(request):
    """
    Ultra fast API using auto-tracked database
    
    GET: /api/screenshots/ultra-fast/
    Parameters:
    - limit=N : Limit number of users returned (default: 50)
    - sort_by=count|size|date|name : Sort criteria (default: count)
    - user=email : Get specific user data
    - min_count=N : Minimum screenshot count filter
    """
    try:
        # Get parameters
        limit = int(request.GET.get('limit', 50))
        sort_by = request.GET.get('sort_by', 'count')
        user_filter = request.GET.get('user', '')
        min_count = int(request.GET.get('min_count', 0))
        
        # Try cache first (fastest)
        if os.path.exists(CACHE_PATH) and not user_filter:
            with open(CACHE_PATH, 'r') as f:
                cache_data = json.load(f)
            
            users_data = cache_data.get('users', {})
            
            # Apply filters
            filtered_users = {
                email: data for email, data in users_data.items()
                if data['total_count'] >= min_count
            }
            
            # Sort users
            if sort_by == 'size':
                sorted_users = sorted(filtered_users.items(), 
                                    key=lambda x: x[1]['total_size'], reverse=True)
            elif sort_by == 'date':
                sorted_users = sorted(filtered_users.items(), 
                                    key=lambda x: x[1]['latest_date'] or '', reverse=True)
            elif sort_by == 'name':
                sorted_users = sorted(filtered_users.items())
            else:  # count
                sorted_users = sorted(filtered_users.items(), 
                                    key=lambda x: x[1]['total_count'], reverse=True)
            
            # Limit results
            sorted_users = sorted_users[:limit]
            
            # Format response
            users_response = []
            total_screenshots = 0
            
            for email, data in sorted_users:
                user_info = {
                    "employee_email": email,
                    "employee_name": email.split('@')[0].replace('.', ' ').title(),
                    "screenshot_count": data['total_count'],
                    "total_size_mb": round(data['total_size'] / (1024*1024), 2),
                    "project_count": len(data.get('projects', {})),
                    "latest_activity": data.get('latest_date', ''),
                    "top_projects": sorted(data.get('projects', {}).items(), 
                                         key=lambda x: x[1], reverse=True)[:5],
                    "last_updated": data.get('last_updated', '')
                }
                
                users_response.append(user_info)
                total_screenshots += data['total_count']
            
            return JsonResponse({
                "success": True,
                "message": f"Found {len(users_response)} users with {total_screenshots:,} screenshots (cached)",
                "data": {
                    "users": users_response,
                    "total_users_returned": len(users_response),
                    "total_users_available": cache_data.get('total_users', 0),
                    "total_screenshots": cache_data.get('total_screenshots', 0),
                    "cache_type": "auto_tracked",
                    "cache_generated": cache_data.get('generated_at', ''),
                    "auto_updated": cache_data.get('auto_updated', False),
                    "filters_applied": {
                        "limit": limit,
                        "sort_by": sort_by,
                        "min_count": min_count
                    }
                },
                "timestamp": datetime.now().isoformat()
            })
        
        # Fallback to database query
        if not os.path.exists(DB_PATH):
            return JsonResponse({
                "success": False,
                "message": "Auto-tracking not initialized. Run: python manage.py track_screenshots --update-now",
                "data": {}
            }, status=404)
        
        with sqlite3.connect(DB_PATH) as conn:
            # Build SQL query based on parameters
            sql = '''
                SELECT user_email, screenshot_count, total_size_bytes, 
                       last_screenshot_date, projects_json, last_updated
                FROM user_screenshots 
                WHERE screenshot_count >= ?
            '''
            params = [min_count]
            
            if user_filter:
                sql += ' AND user_email LIKE ?'
                params.append(f'%{user_filter}%')
            
            # Add sorting
            if sort_by == 'size':
                sql += ' ORDER BY total_size_bytes DESC'
            elif sort_by == 'date':
                sql += ' ORDER BY last_screenshot_date DESC'
            elif sort_by == 'name':
                sql += ' ORDER BY user_email ASC'
            else:  # count
                sql += ' ORDER BY screenshot_count DESC'
            
            sql += f' LIMIT {limit}'
            
            cursor = conn.execute(sql, params)
            rows = cursor.fetchall()
            
            # Get total stats
            cursor = conn.execute('''
                SELECT COUNT(*) as total_users, 
                       SUM(screenshot_count) as total_screenshots,
                       MAX(last_updated) as last_update
                FROM user_screenshots
            ''')
            stats = cursor.fetchone()
            
            users_response = []
            total_returned_screenshots = 0
            
            for row in rows:
                email, count, size, last_date, projects_json, updated = row
                projects = json.loads(projects_json) if projects_json else {}
                
                user_info = {
                    "employee_email": email,
                    "employee_name": email.split('@')[0].replace('.', ' ').title(),
                    "screenshot_count": count,
                    "total_size_mb": round(size / (1024*1024), 2),
                    "project_count": len(projects),
                    "latest_activity": last_date or '',
                    "top_projects": sorted(projects.items(), 
                                         key=lambda x: x[1], reverse=True)[:5],
                    "last_updated": updated
                }
                
                users_response.append(user_info)
                total_returned_screenshots += count
            
            return JsonResponse({
                "success": True,
                "message": f"Found {len(users_response)} users with {total_returned_screenshots:,} screenshots (database)",
                "data": {
                    "users": users_response,
                    "total_users_returned": len(users_response),
                    "total_users_available": stats[0],
                    "total_screenshots": stats[1],
                    "last_database_update": stats[2],
                    "data_source": "auto_tracked_database",
                    "filters_applied": {
                        "limit": limit,
                        "sort_by": sort_by,
                        "min_count": min_count,
                        "user_filter": user_filter
                    }
                },
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Error retrieving tracked screenshots: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def tracking_status_api(request):
    """
    Get auto-tracking system status
    GET: /api/screenshots/tracking-status/
    """
    try:
        if not os.path.exists(DB_PATH):
            return JsonResponse({
                "success": False,
                "message": "Auto-tracking not initialized",
                "data": {"status": "not_initialized"}
            })
        
        with sqlite3.connect(DB_PATH) as conn:
            # Get system status
            cursor = conn.execute('''
                SELECT key, value, updated_at FROM system_status
            ''')
            system_status = {row[0]: {"value": row[1], "updated_at": row[2]} for row in cursor.fetchall()}
            
            # Get recent updates count
            cursor = conn.execute('''
                SELECT COUNT(*) FROM update_log 
                WHERE timestamp > datetime('now', '-1 hours')
            ''')
            recent_updates = cursor.fetchone()[0]
            
            # Get total stats
            cursor = conn.execute('''
                SELECT COUNT(*) as users, 
                       SUM(screenshot_count) as total_screenshots,
                       AVG(screenshot_count) as avg_screenshots,
                       MAX(last_updated) as last_update
                FROM user_screenshots
            ''')
            stats = cursor.fetchone()
            
            return JsonResponse({
                "success": True,
                "message": "Auto-tracking system status",
                "data": {
                    "status": "active",
                    "total_users": stats[0],
                    "total_screenshots": stats[1] or 0,
                    "avg_screenshots_per_user": round(stats[2] or 0, 1),
                    "last_update": stats[3],
                    "recent_updates_1h": recent_updates,
                    "system_status": system_status,
                    "auto_update_enabled": True
                },
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Error getting tracking status: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)
