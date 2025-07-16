"""
Fast Live Tracking Screenshots API - S3 Folder Scanning Version
This API scans all user folders in S3 screenshots directory instead of relying on Staff table
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from datetime import datetime, timedelta
import json
import logging
from botocore.exceptions import ClientError

from .models import Staff, User_Logs
from .aws_utils import get_s3_client, get_latest_screenshot_url, generate_presigned_url
from .proxy_utils import generate_proxy_url
from .api_views import api_response, get_user_live_status, get_status_color

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def fast_live_tracking_screenshots_api(request):
    """
    Fast Live Tracking Screenshots API - Optimized S3 scanning for all users
    Scans all user folders in S3 screenshots/ directory, not just Staff table users
    
    GET: /api/live-tracking/fast-screenshots/?limit=100
    
    Query parameters:
    - limit: Number of users to return (default: 100, max: 500)
    - status: Filter by status (all, active, meeting, break, idle, offline)
    - sort_by: Sort by (name, email, last_activity)
    """
    try:
        # Get query parameters
        limit = min(int(request.GET.get('limit', 100)), 500)  # Allow up to 500 users
        status_filter = request.GET.get('status', 'all').strip().lower()
        sort_by = request.GET.get('sort_by', 'name').strip().lower()
        
        print(f"⚡ Fast Live Tracking Screenshots API called (limit: {limit})")
        print(f"   Status Filter: {status_filter}")
        print(f"   Sort By: {sort_by}")
        
        # Get S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
        except Exception as e:
            return api_response(False, f"S3 connection failed: {e}", status_code=500)
        
        # Scan S3 for all user folders in screenshots/ directory
        try:
            print(f"🔍 Scanning S3 screenshots/ directory for all user folders...")
            screenshots_response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix="screenshots/",
                Delimiter="/",
                MaxKeys=1000  # Get all user folders
            )
            
            s3_user_folders = []
            if 'CommonPrefixes' in screenshots_response:
                for prefix_info in screenshots_response['CommonPrefixes']:
                    folder_path = prefix_info['Prefix']
                    # Extract username from screenshots/username_at_domain.com/
                    user_folder = folder_path.replace('screenshots/', '').rstrip('/')
                    if user_folder and '_at_' in user_folder:
                        # Convert back to email format
                        email = user_folder.replace('_at_', '@')
                        s3_user_folders.append({
                            'email': email,
                            'folder': user_folder,
                            'path': folder_path
                        })
            
            print(f"📊 Found {len(s3_user_folders)} user folders in S3 screenshots/ directory")
            
            # Get Staff data for enrichment (optional)
            staff_data = {}
            try:
                staff_users = Staff.objects.all()
                for staff in staff_users:
                    staff_data[staff.email] = staff
                print(f"👥 Found {len(staff_data)} users in Staff table for enrichment")
            except Exception as e:
                print(f"⚠️ Could not load Staff data: {e}")
            
        except Exception as e:
            return api_response(False, f"S3 scanning error: {e}", status_code=500)
        
        users_with_screenshots = []
        total_screenshots = 0
        processed_users = 0
        
        for s3_user in s3_user_folders:
            # Apply limit after scanning S3
            if processed_users >= limit:
                break
                
            try:
                user_email = s3_user['email']
                user_folder = s3_user['folder']
                
                print(f"🔍 Processing user: {user_email}")
                
                # Get user's live status quickly
                user_status = get_user_live_status(user_email, datetime.now().strftime('%Y-%m-%d'))
                
                # Skip if status filter doesn't match
                if status_filter != 'all' and user_status['status'] != status_filter:
                    print(f"   ⏭️ Skipping due to status filter: {user_status['status']} != {status_filter}")
                    continue
                
                processed_users += 1
                
                # Quick S3 check for latest screenshot
                latest_screenshot = None
                screenshot_time = None
                
                # Scan for screenshots in S3 with date-based priority
                try:
                    print(f"   📸 Scanning screenshots for {user_email}...")
                    
                    # Get current date and build date search pattern
                    today = datetime.now()
                    search_dates = []
                    
                    # Build search dates (today going backwards for 30 days)
                    for i in range(30):
                        search_date = today - timedelta(days=i)
                        date_str = search_date.strftime('%Y-%m-%d')
                        search_dates.append(date_str)
                    
                    print(f"      Searching for screenshots starting from {search_dates[0]}...")
                    
                    # First, get all task folders within user's directory
                    task_folders_response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        Prefix=f"screenshots/{user_folder}/",
                        Delimiter="/",
                        MaxKeys=50  # Get more task folders
                    )
                    
                    latest_screenshot_obj = None
                    latest_time = None
                    found_in_task = None
                    
                    if 'CommonPrefixes' in task_folders_response:
                        task_folders = [prefix['Prefix'] for prefix in task_folders_response['CommonPrefixes']]
                        print(f"      Found {len(task_folders)} task folders")
                        
                        # Search through task folders for screenshots
                        for task_prefix in task_folders:
                            try:
                                # Get all files in this task folder
                                task_screenshots_response = s3_client.list_objects_v2(
                                    Bucket=bucket_name,
                                    Prefix=task_prefix,
                                    MaxKeys=100  # Get more files to find recent ones
                                )
                                
                                if 'Contents' in task_screenshots_response:
                                    task_screenshots = []
                                    for obj in task_screenshots_response['Contents']:
                                        if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                                            task_screenshots.append(obj)
                                    
                                    # Sort by date preference (search by filename date pattern first)
                                    for search_date in search_dates:
                                        date_pattern = search_date  # 2025-07-09 format
                                        
                                        # Look for screenshots with this date in filename
                                        for obj in task_screenshots:
                                            if date_pattern in obj['Key']:
                                                if latest_time is None or obj['LastModified'] > latest_time:
                                                    latest_screenshot_obj = obj
                                                    latest_time = obj['LastModified']
                                                    found_in_task = task_prefix
                                                    print(f"        🎯 Found date-matched screenshot: {obj['Key']}")
                                        
                                        # If found screenshot for this date, break to prioritize recent dates
                                        if latest_screenshot_obj and date_pattern in latest_screenshot_obj['Key']:
                                            break
                                    
                                    # If no date-matched screenshot found, take the most recent by LastModified
                                    if not latest_screenshot_obj:
                                        for obj in task_screenshots:
                                            if latest_time is None or obj['LastModified'] > latest_time:
                                                latest_screenshot_obj = obj
                                                latest_time = obj['LastModified']
                                                found_in_task = task_prefix
                                                
                            except Exception as task_error:
                                print(f"        ⚠️ Error scanning task folder {task_prefix}: {task_error}")
                                continue
                    
                    # If no screenshots found in task folders, try direct user folder
                    if not latest_screenshot_obj:
                        print(f"      No screenshots in task folders, checking direct user folder...")
                        direct_screenshots_response = s3_client.list_objects_v2(
                            Bucket=bucket_name,
                            Prefix=f"screenshots/{user_folder}/",
                            MaxKeys=100
                        )
                        
                        if 'Contents' in direct_screenshots_response:
                            direct_screenshots = []
                            for obj in direct_screenshots_response['Contents']:
                                # Skip folders and only get image files
                                if (not obj['Key'].endswith('/') and 
                                    obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))):
                                    direct_screenshots.append(obj)
                            
                            # Apply same date-based search for direct screenshots
                            for search_date in search_dates:
                                date_pattern = search_date
                                for obj in direct_screenshots:
                                    if date_pattern in obj['Key']:
                                        if latest_time is None or obj['LastModified'] > latest_time:
                                            latest_screenshot_obj = obj
                                            latest_time = obj['LastModified']
                                            print(f"        🎯 Found direct screenshot: {obj['Key']}")
                                
                                if latest_screenshot_obj and date_pattern in latest_screenshot_obj['Key']:
                                    break
                            
                            # Fallback to most recent if no date match
                            if not latest_screenshot_obj and direct_screenshots:
                                latest_screenshot_obj = max(direct_screenshots, key=lambda x: x['LastModified'])
                                latest_time = latest_screenshot_obj['LastModified']
                    
                    if latest_screenshot_obj:
                        # Use proxy URL instead of direct S3 URL to avoid CORS and authentication issues
                        latest_screenshot = generate_proxy_url(latest_screenshot_obj['Key'])
                        screenshot_time = latest_screenshot_obj['LastModified'].isoformat()
                        total_screenshots += 1
                        
                        # Extract date from filename for display
                        screenshot_filename = latest_screenshot_obj['Key'].split('/')[-1]
                        task_info = found_in_task.split('/')[-2] if found_in_task else "direct_folder"
                        
                        print(f"      ✅ Found screenshot: {screenshot_filename}")
                        print(f"         📁 Task folder: {task_info}")
                        print(f"         📅 File date: {latest_time.strftime('%Y-%m-%d %H:%M:%S')}")
                    else:
                        print(f"      ❌ No screenshots found (searched {len(search_dates)} days back)")
                
                except Exception as e:
                    print(f"      ❌ S3 error for {user_email}: {e}")
                    # Continue with other users even if one fails
                
                # Get Staff data if available
                staff_info = staff_data.get(user_email)
                
                # Build user data
                if staff_info:
                    # User exists in Staff table - use staff data
                    display_name = f"{staff_info.firstname} {staff_info.lastname}"
                    staff_id = staff_info.staffid
                    profile_image = staff_info.profile_image.url if hasattr(staff_info, 'profile_image') and staff_info.profile_image else None
                else:
                    # User only exists in S3 - use email-based data
                    display_name = user_email.split('@')[0].replace('_', ' ').title()
                    staff_id = "N/A"
                    profile_image = None
                
                user_data = {
                    "email": user_email,
                    "display_name": display_name,
                    "staff_id": staff_id,
                    "username": user_email.split('@')[0],
                    "profile_image": profile_image,
                    "status": user_status['status'],
                    "status_color": get_status_color(user_status['status']),
                    "current_activity": user_status['current_activity'],
                    "current_task": user_status['current_task'],
                    "current_project": user_status['current_project'],
                    "last_activity_time": user_status['last_activity_time'],
                    "is_online": user_status['is_online'],
                    "data_source": "staff_table" if staff_info else "s3_only",
                    "s3_folder": user_folder,
                    "latest_screenshot": {
                        "url": latest_screenshot,
                        "timestamp": screenshot_time,
                        "has_screenshot": latest_screenshot is not None,
                        "filename": latest_screenshot_obj['Key'].split('/')[-1] if latest_screenshot_obj else None,
                        "task_folder": found_in_task.split('/')[-2] if found_in_task else None,
                        "file_size": latest_screenshot_obj.get('Size', 0) if latest_screenshot_obj else 0
                    }
                }
                
                users_with_screenshots.append(user_data)
                print(f"   ✅ Added user: {display_name} ({user_status['status']})")
                
            except Exception as e:
                print(f"❌ Error processing user {s3_user['email']}: {e}")
                continue
        
        # Sort users
        if sort_by == 'name':
            users_with_screenshots.sort(key=lambda x: x['display_name'].lower())
        elif sort_by == 'email':
            users_with_screenshots.sort(key=lambda x: x['email'].lower())
        elif sort_by == 'last_activity':
            users_with_screenshots.sort(key=lambda x: x['last_activity_time'] or '1900-01-01T00:00:00', reverse=True)
        
        # Calculate stats
        users_with_ss = len([u for u in users_with_screenshots if u['latest_screenshot']['has_screenshot']])
        users_without_ss = len(users_with_screenshots) - users_with_ss
        staff_users_count = len([u for u in users_with_screenshots if u['data_source'] == 'staff_table'])
        s3_only_users_count = len([u for u in users_with_screenshots if u['data_source'] == 's3_only'])
        
        # Build response
        response_data = {
            "users": users_with_screenshots,
            "summary": {
                "total_s3_users_found": len(s3_user_folders),
                "total_users_processed": len(users_with_screenshots),
                "users_with_screenshots": users_with_ss,
                "users_without_screenshots": users_without_ss,
                "users_from_staff_table": staff_users_count,
                "users_from_s3_only": s3_only_users_count,
                "total_screenshots_found": total_screenshots,
                "api_version": "fast_s3_scan_v2",
                "last_updated": datetime.now().isoformat()
            },
            "debug_info": {
                "s3_scan_successful": True,
                "staff_enrichment_available": len(staff_data) > 0,
                "processed_limit": limit,
                "status_filter": status_filter,
                "sort_by": sort_by
            },
            "api_info": {
                "endpoint": "/api/live-tracking/fast-screenshots/",
                "timestamp": datetime.now().isoformat(),
                "optimization": "Full S3 scan with date-based screenshot search",
                "max_task_folders_per_user": 50,
                "max_files_per_folder": 100,
                "search_days_back": 30,
                "supported_formats": [".png", ".jpg", ".jpeg", ".webp"]
            }
        }
        
        message = f"S3 scan: {len(s3_user_folders)} total folders found, {len(users_with_screenshots)} users processed with {total_screenshots} latest screenshots"
        print(f"⚡ {message}")
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Fast Live Tracking Screenshots API error: {e}")
        print(f"💥 Fast API Error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error: {str(e)}",
            status_code=500
        )
