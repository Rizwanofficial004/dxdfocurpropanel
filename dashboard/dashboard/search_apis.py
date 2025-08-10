"""
Search and User Suggestion APIs
APIs for getting screenshots by user and providing search suggestions
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import datetime, timedelta
import json
import logging

from .models import *  # Import your models
from .get_employee_screenshots import scan_and_download_screenshots, generate_presigned_url, BUCKET_NAME
from .api_views import api_response

logger = logging.getLogger(__name__)

@csrf_exempt
def user_suggestions_api(request):
    """
    Auto-suggestion API like Google search
    Returns user suggestions as user types
    """
    if request.method == 'GET':
        try:
            query = request.GET.get('q', '').strip()
            limit = int(request.GET.get('limit', 10))
            
            if not query:
                return api_response(
                    success=True,
                    message="No query provided",
                    data={"suggestions": []}
                )
            
            # Search in users table
            users_query = User.objects.filter(
                Q(username__icontains=query) |
                Q(email__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query)
            ).filter(is_active=True)
            
            suggestions = []
            
            for user in users_query[:limit]:
                # Get last activity
                last_activity = "Never"
                if user.last_login:
                    diff = timezone.now() - user.last_login
                    if diff.days == 0:
                        if diff.seconds < 3600:
                            last_activity = f"{diff.seconds // 60} minutes ago"
                        else:
                            last_activity = f"{diff.seconds // 3600} hours ago"
                    else:
                        last_activity = f"{diff.days} days ago"
                
                # Count screenshots and logs for this user
                screenshot_count = 0
                log_count = 0
                
                # Try to get counts from your models (adjust field names as needed)
                try:
                    # Assuming you have models like Screenshot, EmployeeLog, etc.
                    # screenshot_count = Screenshot.objects.filter(email=user.email).count()
                    # log_count = EmployeeLog.objects.filter(email=user.email).count()
                    pass
                except:
                    pass
                
                suggestion = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "display_name": f"{user.first_name} {user.last_name}".strip() or user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_staff": user.is_staff,
                    "last_activity": last_activity,
                    "screenshot_count": screenshot_count,
                    "log_count": log_count,
                    "suggestion_text": f"{user.username} ({user.email})",
                    "match_type": "username" if query.lower() in user.username.lower() else "email",
                    "profile_url": f"/admin/auth/user/{user.id}/change/" if user.is_staff else ""
                }
                
                suggestions.append(suggestion)
            
            # Sort by relevance (exact matches first)
            suggestions.sort(key=lambda x: (
                not x['username'].lower().startswith(query.lower()),
                not query.lower() in x['username'].lower(),
                not query.lower() in x['email'].lower(),
                x['username'].lower()
            ))
            
            return api_response(
                success=True,
                message=f"Found {len(suggestions)} user suggestions",
                data={
                    "suggestions": suggestions,
                    "query": query,
                    "total_found": len(suggestions),
                    "search_types": ["username", "email", "first_name", "last_name"]
                }
            )
            
        except Exception as e:
            logger.error(f"Error in user_suggestions_api: {str(e)}")
            return api_response(
                success=False,
                message="Error getting user suggestions",
                status_code=500
            )
    
    return api_response(
        success=False,
        message="Method not allowed",
        status_code=405
    )


@csrf_exempt
def screenshots_by_user_api(request):
    """
    Get screenshots for a specific user (by username or email)
    """
    if request.method == 'GET':
        try:
            user_input = request.GET.get('user', '').strip()
            date = request.GET.get('date', '')
            status = request.GET.get('status', '')  # Online, Idle, Offline
            limit = int(request.GET.get('limit', 20))
            page = int(request.GET.get('page', 1))
            
            if not user_input:
                return api_response(
                    success=False,
                    message="User parameter is required",
                    status_code=400
                )
            
            # Find user by username or email
            user = None
            try:
                if '@' in user_input:
                    user = User.objects.get(email=user_input)
                else:
                    user = User.objects.get(username=user_input)
            except User.DoesNotExist:
                return api_response(
                    success=False,
                    message=f"User not found: {user_input}",
                    status_code=404
                )
            
            # Get screenshots from S3
            s3_screenshots = scan_and_download_screenshots(user.email, date, bool_flag=True)
            s3_images = s3_screenshots.get('image_urls', [])
            
            # Filter by status if provided
            if status:
                # You might want to add status filtering logic here
                pass
            
            # Apply pagination
            paginator = Paginator(s3_images, limit)
            try:
                screenshots_page = paginator.page(page)
            except:
                screenshots_page = paginator.page(1)
            
            # Format screenshots for response
            formatted_screenshots = []
            for i, screenshot in enumerate(screenshots_page):
                # Determine status based on filename or time (customize this logic)
                screenshot_status = "Online"  # Default
                if i % 3 == 1:
                    screenshot_status = "Idle"
                elif i % 3 == 2:
                    screenshot_status = "Offline"
                
                # Extract task name from filename or use default
                task_name = screenshot.get('filename', f'Development Task {i+1}')
                if 'task' not in task_name.lower():
                    task_name = f"Development Task {i+1}"
                
                formatted_screenshot = {
                    "id": i + 1,
                    "task_name": task_name,
                    "status": screenshot_status,
                    "timestamp": screenshot.get('last_modified', ''),
                    "time_display": format_time_display(screenshot.get('last_modified', '')),
                    "screenshot_url": screenshot.get('url', ''),
                    "thumbnail_url": screenshot.get('url', ''),
                    "filename": screenshot.get('filename', ''),
                    "size": screenshot.get('size', 0),
                    "date_folder": screenshot.get('date_folder', ''),
                    "has_preview": bool(screenshot.get('url', '')),
                    "s3_key": screenshot.get('key', ''),
                }
                
                formatted_screenshots.append(formatted_screenshot)
            
            # Calculate pagination info
            pagination = {
                "current_page": screenshots_page.number,
                "total_pages": paginator.num_pages,
                "total_count": paginator.count,
                "limit": limit,
                "has_next": screenshots_page.has_next(),
                "has_previous": screenshots_page.has_previous(),
                "start_index": screenshots_page.start_index(),
                "end_index": screenshots_page.end_index()
            }
            
            return api_response(
                success=True,
                message=f"Screenshots retrieved for {user.username}",
                data={
                    "user_info": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "display_name": f"{user.first_name} {user.last_name}".strip() or user.username
                    },
                    "screenshots": formatted_screenshots,
                    "pagination": pagination,
                    "filters": {
                        "user": user_input,
                        "date": date,
                        "status": status,
                        "limit": limit,
                        "page": page
                    },
                    "summary": {
                        "total_screenshots": paginator.count,
                        "current_page_count": len(formatted_screenshots),
                        "s3_prefix_used": s3_screenshots.get('prefix_used', '')
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Error in screenshots_by_user_api: {str(e)}")
            return api_response(
                success=False,
                message="Error retrieving user screenshots",
                status_code=500
            )
    
    return api_response(
        success=False,
        message="Method not allowed",
        status_code=405
    )


@csrf_exempt
def user_dashboard_data_api(request):
    """
    Combined API - Get complete dashboard data for a user
    Includes user info, screenshots, and activity summary
    """
    if request.method == 'GET':
        try:
            user_input = request.GET.get('user', '').strip()
            include_screenshots = request.GET.get('include_screenshots', 'true').lower() == 'true'
            include_summary = request.GET.get('include_summary', 'true').lower() == 'true'
            limit = int(request.GET.get('limit', 6))  # Match your dashboard showing 6 items
            page = int(request.GET.get('page', 1))
            
            if not user_input:
                return api_response(
                    success=False,
                    message="User parameter is required",
                    status_code=400
                )
            
            # Find user
            user = None
            try:
                if '@' in user_input:
                    user = User.objects.get(email=user_input)
                else:
                    user = User.objects.get(username=user_input)
            except User.DoesNotExist:
                return api_response(
                    success=False,
                    message=f"User not found: {user_input}",
                    status_code=404
                )
            
            response_data = {
                "user_info": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "display_name": f"{user.first_name} {user.last_name}".strip() or user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_staff": user.is_staff,
                    "is_active": user.is_active,
                    "last_login": user.last_login.isoformat() if user.last_login else None
                }
            }
            
            # Get screenshots if requested
            if include_screenshots:
                # Use the screenshots API internally
                request.GET = request.GET.copy()
                request.GET['user'] = user_input
                request.GET['limit'] = str(limit)
                request.GET['page'] = str(page)
                
                # Get screenshots data
                screenshots_response = screenshots_by_user_api(request)
                if screenshots_response.status_code == 200:
                    screenshots_data = json.loads(screenshots_response.content)
                    response_data["screenshots"] = screenshots_data.get('data', {})
                else:
                    response_data["screenshots"] = {"screenshots": [], "pagination": {}}
            
            # Add summary data if requested
            if include_summary:
                try:
                    # Get S3 summary
                    s3_data = scan_and_download_screenshots(user.email, '', bool_flag=True)
                    total_s3_screenshots = len(s3_data.get('image_urls', []))
                    
                    # Calculate today's screenshots
                    today = timezone.now().date()
                    today_s3_data = scan_and_download_screenshots(user.email, today.strftime('%Y-%m-%d'), bool_flag=True)
                    today_screenshots = len(today_s3_data.get('image_urls', []))
                    
                    response_data["summary"] = {
                        "total_screenshots": total_s3_screenshots,
                        "screenshots_today": today_screenshots,
                        "last_activity": user.last_login.isoformat() if user.last_login else None,
                        "account_status": "Active" if user.is_active else "Inactive",
                        "user_role": "Staff" if user.is_staff else "User"
                    }
                except Exception as e:
                    logger.warning(f"Could not get summary for {user.username}: {str(e)}")
                    response_data["summary"] = {
                        "total_screenshots": 0,
                        "screenshots_today": 0,
                        "last_activity": None,
                        "account_status": "Active" if user.is_active else "Inactive",
                        "user_role": "Staff" if user.is_staff else "User"
                    }
            
            return api_response(
                success=True,
                message=f"Dashboard data retrieved for {user.username}",
                data=response_data
            )
            
        except Exception as e:
            logger.error(f"Error in user_dashboard_data_api: {str(e)}")
            return api_response(
                success=False,
                message="Error retrieving dashboard data",
                status_code=500
            )
    
    return api_response(
        success=False,
        message="Method not allowed",
        status_code=405
    )


def format_time_display(timestamp_str):
    """Format timestamp for display like '9:33 AM'"""
    if not timestamp_str:
        return "Unknown"
    
    try:
        # Parse ISO format timestamp
        if 'T' in timestamp_str:
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        else:
            dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
        
        return dt.strftime('%I:%M %p')
    except:
        return "Unknown"
