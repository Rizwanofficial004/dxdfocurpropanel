"""
Enhanced Live Tracking Screenshots API - Date-based search
This API searches for users by actual screenshot dates in their filenames.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def live_tracking_screenshots_by_date_api(request):
    """
    Enhanced Live Tracking Screenshots API - Search by actual screenshot dates
    Groups users by their activity on specific dates (Today, 1 day ago, 2 days ago, etc.)
    
    GET: /api/live-tracking/screenshots-by-date/
    
    Query parameters:
    - days_back: Number of days to search back (default: 30, max: 90)
    - limit_users_per_day: Users per day group (default: 50, max: 100)
    - limit_screenshots: Screenshots per user (default: 5, max: 20)
    - include_screenshots: Include screenshot URLs (default: true)
    - sort_by: Sort users within groups (name, activity, screenshot_count) (default: activity)
    """
    try:
        # Import required modules
        import sys
        import os
        
        # Add the dashboard directory to Python path
        dashboard_dir = os.path.dirname(os.path.abspath(__file__))
        if dashboard_dir not in sys.path:
            sys.path.insert(0, dashboard_dir)
        
        from get_employee_screenshots import get_s3_client, generate_presigned_url
        from api_views import api_response  # Import from main api_views
        
        # Get query parameters
        days_back = min(int(request.GET.get('days_back', 30)), 90)  # Max 90 days
        limit_users_per_day = min(int(request.GET.get('limit_users_per_day', 50)), 100)
        limit_screenshots = min(int(request.GET.get('limit_screenshots', 5)), 20)
        include_screenshots = request.GET.get('include_screenshots', 'true').lower() == 'true'
        sort_by = request.GET.get('sort_by', 'activity').strip().lower()
        
        print(f"📅 Live Tracking Screenshots by Date API called:")
        print(f"   Days back: {days_back}")
        print(f"   Users per day: {limit_users_per_day}")
        print(f"   Screenshots per user: {limit_screenshots}")
        print(f"   Include screenshots: {include_screenshots}")
        
        # Initialize S3 client and bucket name
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
            print(f"📡 Connecting to S3 bucket: {bucket_name}")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            return api_response(
                success=False,
                message=f"S3 connection failed: {str(e)}",
                status_code=500
            )

        # Generate date range (today going backwards)
        current_date = datetime.now()
        date_groups = {}
        total_users_found = 0
        total_screenshots_found = 0
        
        print(f"🔍 Searching screenshots for {days_back} days back from {current_date.strftime('%Y-%m-%d')}")
        
        # Get all user folders first
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix="screenshots/",
                Delimiter="/"
            )
            
            user_folders = []
            if 'CommonPrefixes' in response:
                for prefix_info in response['CommonPrefixes']:
                    prefix = prefix_info['Prefix']
                    user_folder = prefix.replace("screenshots/", "").rstrip("/")
                    if user_folder and '_at_' in user_folder:
                        user_email_converted = user_folder.replace('_at_', '@')
                        user_folders.append({
                            'email': user_email_converted,
                            'folder': user_folder,
                            'prefix': prefix
                        })
            
            print(f"👥 Found {len(user_folders)} user folders in S3")
            
        except Exception as e:
            logger.error(f"Error getting user folders: {str(e)}")
            return api_response(
                success=False,
                message=f"Error accessing S3 user folders: {str(e)}",
                status_code=500
            )
        
        # Search each day from today backwards
        for days_ago in range(days_back):
            search_date = current_date - timedelta(days=days_ago)
            date_str = search_date.strftime('%Y-%m-%d')
            
            # Create group key and label
            if days_ago == 0:
                group_key = "today"
                group_label = "Today"
            elif days_ago == 1:
                group_key = "1_day_ago"
                group_label = "1 day ago"
            else:
                group_key = f"{days_ago}_days_ago"
                group_label = f"{days_ago} days ago"
            
            print(f"📅 Searching for {group_label} ({date_str})")
            
            users_for_this_date = []
            
            # Check each user for screenshots on this date
            for user_info in user_folders:
                if len(users_for_this_date) >= limit_users_per_day:
                    break
                    
                user_email = user_info['email']
                user_folder = user_info['folder']
                
                try:
                    # Get all task folders for this user
                    user_response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        Prefix=f"screenshots/{user_folder}/",
                        Delimiter="/"
                    )
                    
                    user_screenshots_for_date = []
                    task_folders = []
                    
                    # Get task folders
                    if 'CommonPrefixes' in user_response:
                        for task_prefix_info in user_response['CommonPrefixes']:
                            task_prefix = task_prefix_info['Prefix']
                            task_name = task_prefix.replace(f"screenshots/{user_folder}/", "").rstrip("/")
                            if task_name:
                                task_folders.append({
                                    'name': task_name,
                                    'prefix': task_prefix
                                })
                    
                    # Search for screenshots with today's date in filename
                    for task_folder in task_folders:
                        task_prefix = task_folder['prefix']
                        task_name = task_folder['name']
                        
                        # List files in this task folder that match the date
                        task_response = s3_client.list_objects_v2(
                            Bucket=bucket_name,
                            Prefix=f"{task_prefix}{date_str}",  # Look for files starting with the date
                            MaxKeys=50  # Limit per task for performance
                        )
                        
                        if 'Contents' in task_response:
                            for obj in task_response['Contents']:
                                key = obj["Key"]
                                filename = key.split('/')[-1]
                                
                                # Check if it's an image file and matches the date pattern
                                if (key.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')) and 
                                    filename.startswith(date_str)):
                                    
                                    try:
                                        if include_screenshots:
                                            presigned_url = generate_presigned_url(bucket_name, key)
                                        else:
                                            presigned_url = None
                                            
                                        screenshot_info = {
                                            "key": key,
                                            "filename": filename,
                                            "task_folder": task_name,
                                            "url": presigned_url,
                                            "last_modified": obj.get("LastModified", "").isoformat() if obj.get("LastModified") else "",
                                            "size": obj.get("Size", 0),
                                            "size_mb": round(obj.get("Size", 0) / (1024 * 1024), 2),
                                            "date": date_str
                                        }
                                        user_screenshots_for_date.append(screenshot_info)
                                        
                                    except Exception as url_error:
                                        print(f"    ⚠️ Error processing {key}: {url_error}")
                                        continue
                    
                    # If user has screenshots for this date, add them to the group
                    if user_screenshots_for_date:
                        # Sort screenshots by time (latest first)
                        user_screenshots_for_date.sort(key=lambda x: x['filename'], reverse=True)
                        
                        # Limit screenshots per user
                        limited_screenshots = user_screenshots_for_date[:limit_screenshots]
                        
                        # Extract display name from email
                        name_part = user_email.split('@')[0]
                        display_name = name_part.replace('.', ' ').replace('_', ' ').title()
                        
                        # Determine status (users with today's screenshots are more likely active)
                        if days_ago == 0:
                            status = "active"
                            status_color = "#10B981"
                            last_activity = "Today"
                        elif days_ago == 1:
                            status = "idle"
                            status_color = "#6B7280"
                            last_activity = "1 day ago"
                        else:
                            status = "offline"
                            status_color = "#374151"
                            last_activity = f"{days_ago} days ago"
                        
                        user_data = {
                            "user_email": user_email,
                            "user_name": display_name,
                            "display_name": display_name,
                            "status": status,
                            "status_color": status_color,
                            "last_activity": last_activity,
                            "screenshot_count": len(user_screenshots_for_date),
                            "screenshots": limited_screenshots,
                            "latest_screenshot": user_screenshots_for_date[0] if user_screenshots_for_date else None,
                            "total_size_mb": round(sum(s.get('size', 0) for s in user_screenshots_for_date) / (1024 * 1024), 2),
                            "is_online": status in ['active', 'idle'],
                            "last_screenshot_time": user_screenshots_for_date[0].get('last_modified') if user_screenshots_for_date else None,
                            "task_folders": list(set([s['task_folder'] for s in user_screenshots_for_date])),
                            "task_folder_count": len(set([s['task_folder'] for s in user_screenshots_for_date])),
                            "days_since_activity": days_ago,
                            "activity_date": date_str
                        }
                        
                        users_for_this_date.append(user_data)
                        total_screenshots_found += len(user_screenshots_for_date)
                        
                        print(f"  👤 {user_email}: {len(user_screenshots_for_date)} screenshots")
                        
                except Exception as user_error:
                    print(f"  ❌ Error processing {user_email}: {str(user_error)}")
                    continue
            
            # Sort users within this date group
            if sort_by == 'name':
                users_for_this_date.sort(key=lambda x: x['user_name'])
            elif sort_by == 'screenshot_count':
                users_for_this_date.sort(key=lambda x: x['screenshot_count'], reverse=True)
            elif sort_by == 'activity':
                users_for_this_date.sort(key=lambda x: x['last_screenshot_time'] or '1900-01-01T00:00:00', reverse=True)
            
            # Add to date groups if users found
            if users_for_this_date:
                date_groups[group_key] = {
                    'group_label': group_label,
                    'days_ago': days_ago,
                    'activity_date': date_str,
                    'user_count': len(users_for_this_date),
                    'users': users_for_this_date
                }
                total_users_found += len(users_for_this_date)
                
                print(f"  ✅ Found {len(users_for_this_date)} users for {group_label}")
            else:
                print(f"  📭 No users found for {group_label}")
        
        # Create flat list of all users (maintaining chronological order)
        all_users = []
        sorted_groups = sorted(date_groups.items(), key=lambda x: x[1]['days_ago'])
        for group_key, group_data in sorted_groups:
            all_users.extend(group_data['users'])
        
        # Calculate summary statistics
        status_stats = {
            'active': len([u for u in all_users if u['status'] == 'active']),
            'idle': len([u for u in all_users if u['status'] == 'idle']),
            'offline': len([u for u in all_users if u['status'] == 'offline']),
            'total': len(all_users)
        }
        
        # Build response data
        response_data = {
            "users": all_users,
            "date_groups": date_groups,
            "summary": {
                "total_users": total_users_found,
                "total_screenshots": total_screenshots_found,
                "online_users": status_stats['active'] + status_stats['idle'],
                "active_users": status_stats['active'],
                "idle_users": status_stats['idle'],
                "offline_users": status_stats['offline'],
                "groups_count": len(date_groups),
                "days_searched": days_back,
                "search_date_range": f"{(current_date - timedelta(days=days_back-1)).strftime('%Y-%m-%d')} to {current_date.strftime('%Y-%m-%d')}"
            },
            "status_statistics": status_stats,
            "group_statistics": {
                group_key: {
                    'label': group_data['group_label'],
                    'days_ago': group_data['days_ago'],
                    'activity_date': group_data['activity_date'],
                    'count': group_data['user_count']
                }
                for group_key, group_data in date_groups.items()
            },
            "filters_applied": {
                "days_back": days_back,
                "limit_users_per_day": limit_users_per_day,
                "limit_screenshots": limit_screenshots,
                "include_screenshots": include_screenshots,
                "sort_by": sort_by
            },
            "api_info": {
                "endpoint": "/api/live-tracking/screenshots-by-date/",
                "timestamp": datetime.now().isoformat(),
                "total_users_found": total_users_found,
                "search_method": "by_screenshot_filename_date",
                "grouping": "by_actual_activity_date"
            }
        }
        
        # Determine message
        if total_users_found > 0:
            message = f"Found {total_users_found} users with {total_screenshots_found} screenshots across {len(date_groups)} days"
        else:
            message = f"No user activity found in the last {days_back} days"
        
        print(f"🎯 {message}")
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Live Tracking Screenshots by Date API error: {str(e)}")
        print(f"💥 API Error: {str(e)}")
        return JsonResponse({
            "success": False,
            "message": f"Error getting live tracking screenshots by date: {str(e)}",
            "data": {
                "error_details": str(e),
                "api_endpoint": "/api/live-tracking/screenshots-by-date/"
            }
        }, status=500)
