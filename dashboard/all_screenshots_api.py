"""
All Screenshots API - Get all users and their screenshots from S3
This API returns ALL users found in S3 with ALL their screenshots
"""

import logging
import json
import boto3
import os
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .aws_utils import get_s3_client
from .get_employee_screenshots import get_all_employees_from_s3, generate_presigned_url

logger = logging.getLogger(__name__)

def api_response(success=True, message="", data=None, status_code=200):
    """Standardized API response format"""
    response_data = {
        "success": success,
        "message": message,
        "data": data or {},
        "timestamp": datetime.now().isoformat()
    }
    return JsonResponse(response_data, status=status_code)

@csrf_exempt
@require_http_methods(["GET"])
def all_screenshots_api(request):
    """
    Get ALL users and ALL their screenshots from S3
    
    GET: /api/screenshots/all/
    Optional parameters:
    - include_urls=true : Include presigned URLs for screenshots (default: false)
    - limit=N : Limit screenshots per user (default: no limit)
    - sort_by=name|count|date : Sort users by name, screenshot count, or last activity
    """
    try:
        # Get parameters
        include_urls = request.GET.get('include_urls', 'false').lower() == 'true'
        limit_per_user = request.GET.get('limit')
        sort_by = request.GET.get('sort_by', 'name')  # name, count, date
        
        if limit_per_user:
            try:
                limit_per_user = int(limit_per_user)
            except ValueError:
                return api_response(
                    success=False,
                    message="Invalid limit parameter. Must be a number.",
                    status_code=400
                )
        
        print(f"🔍 Getting ALL users and screenshots from S3...")
        print(f"   - Include URLs: {include_urls}")
        print(f"   - Limit per user: {limit_per_user or 'No limit'}")
        print(f"   - Sort by: {sort_by}")
        
        # Get S3 client
        s3_client = get_s3_client()
        bucket_name = 'ddsfocustime'
        
        # Get all employees from S3
        all_employees = get_all_employees_from_s3()
        
        if not all_employees:
            return api_response(
                success=True,
                message="No employees found in S3 bucket",
                data={
                    "users": [],
                    "total_users": 0,
                    "total_screenshots": 0
                }
            )
        
        print(f"📊 Found {len(all_employees)} employees in S3")
        
        users_data = []
        total_screenshots = 0
        
        for employee_info in all_employees:
            # Extract email from the employee info dictionary
            employee_email = employee_info.get('email', '')
            employee_folder = employee_info.get('folder', '')
            
            if not employee_email:
                continue
                
            try:
                print(f"🔍 Processing: {employee_email}")
                
                # List all objects for this employee
                prefix = f"screenshots/{employee_folder}/"
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=prefix
                )
                
                screenshots = []
                if 'Contents' in response:
                    screenshot_objects = [
                        obj for obj in response['Contents'] 
                        if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg'))
                        and obj['Key'] != prefix  # Exclude folder itself
                    ]
                    
                    # Sort by last modified (newest first)
                    screenshot_objects.sort(key=lambda x: x['LastModified'], reverse=True)
                    
                    # Apply per-user limit if specified
                    if limit_per_user:
                        screenshot_objects = screenshot_objects[:limit_per_user]
                    
                    for obj in screenshot_objects:
                        screenshot_info = {
                            "filename": os.path.basename(obj['Key']),
                            "full_path": obj['Key'],
                            "size": obj['Size'],
                            "last_modified": obj['LastModified'].isoformat(),
                            "date": obj['LastModified'].strftime('%Y-%m-%d'),
                            "time": obj['LastModified'].strftime('%H:%M:%S')
                        }
                        
                        # Add presigned URL if requested
                        if include_urls:
                            try:
                                screenshot_info["url"] = generate_presigned_url(obj['Key'])
                            except Exception as e:
                                print(f"⚠️ Error generating URL for {obj['Key']}: {e}")
                                screenshot_info["url"] = None
                        
                        screenshots.append(screenshot_info)
                
                # Calculate user statistics
                last_activity = None
                if screenshots:
                    last_activity = screenshots[0]["last_modified"]  # Most recent
                
                user_data = {
                    "employee_email": employee_email,
                    "employee_name": employee_email.split('@')[0].replace('.', ' ').title(),
                    "screenshot_count": len(screenshots),
                    "last_activity": last_activity,
                    "screenshots": screenshots
                }
                
                users_data.append(user_data)
                total_screenshots += len(screenshots)
                
            except Exception as e:
                print(f"❌ Error processing {employee_email}: {e}")
                # Still add user with error info
                users_data.append({
                    "employee_email": employee_email,
                    "employee_name": employee_email.split('@')[0].replace('.', ' ').title(),
                    "screenshot_count": 0,
                    "last_activity": None,
                    "screenshots": [],
                    "error": str(e)
                })
        
        # Sort users based on sort_by parameter
        if sort_by == 'count':
            users_data.sort(key=lambda x: x['screenshot_count'], reverse=True)
        elif sort_by == 'date':
            users_data.sort(key=lambda x: x['last_activity'] or '', reverse=True)
        else:  # sort_by == 'name'
            users_data.sort(key=lambda x: x['employee_email'])
        
        # Prepare response
        response_data = {
            "users": users_data,
            "total_users": len(users_data),
            "total_screenshots": total_screenshots,
            "parameters": {
                "include_urls": include_urls,
                "limit_per_user": limit_per_user,
                "sort_by": sort_by
            }
        }
        
        message = f"Found {len(users_data)} users with {total_screenshots} total screenshots"
        
        print(f"✅ {message}")
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"All screenshots API error: {e}")
        print(f"💥 All screenshots API error: {e}")
        
        return api_response(
            success=False,
            message=f"Error retrieving all screenshots: {str(e)}",
            status_code=500
        )

@csrf_exempt
@require_http_methods(["GET"])
def user_screenshots_summary_api(request):
    """
    Get a summary of all users with just basic info (faster)
    
    GET: /api/screenshots/summary/
    """
    try:
        print("🔍 Getting user screenshots summary...")
        
        # Get all employees from S3
        all_employees = get_all_employees_from_s3()
        
        if not all_employees:
            return api_response(
                success=True,
                message="No employees found in S3 bucket",
                data={
                    "users": [],
                    "total_users": 0
                }
            )
        
        s3_client = get_s3_client()
        bucket_name = 'ddsfocustime'
        
        users_summary = []
        
        for employee_info in all_employees:
            # Extract email from the employee info dictionary
            employee_email = employee_info.get('email', '')
            employee_folder = employee_info.get('folder', '')
            
            if not employee_email:
                continue
                
            try:
                # Count screenshots for this user
                prefix = f"screenshots/{employee_folder}/"
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=prefix
                )
                
                screenshot_count = 0
                last_activity = None
                
                if 'Contents' in response:
                    screenshot_objects = [
                        obj for obj in response['Contents'] 
                        if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg'))
                        and obj['Key'] != prefix
                    ]
                    
                    screenshot_count = len(screenshot_objects)
                    
                    if screenshot_objects:
                        # Get most recent screenshot date
                        latest = max(screenshot_objects, key=lambda x: x['LastModified'])
                        last_activity = latest['LastModified'].isoformat()
                
                users_summary.append({
                    "employee_email": employee_email,
                    "employee_name": employee_email.split('@')[0].replace('.', ' ').title(),
                    "screenshot_count": screenshot_count,
                    "last_activity": last_activity
                })
                
            except Exception as e:
                print(f"❌ Error processing {employee_email}: {e}")
                users_summary.append({
                    "employee_email": employee_email,
                    "employee_name": employee_email.split('@')[0].replace('.', ' ').title(),
                    "screenshot_count": 0,
                    "last_activity": None,
                    "error": str(e)
                })
        
        # Sort by screenshot count (highest first)
        users_summary.sort(key=lambda x: x['screenshot_count'], reverse=True)
        
        total_screenshots = sum(user['screenshot_count'] for user in users_summary)
        
        response_data = {
            "users": users_summary,
            "total_users": len(users_summary),
            "total_screenshots": total_screenshots
        }
        
        message = f"Summary: {len(users_summary)} users with {total_screenshots} total screenshots"
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"User screenshots summary API error: {e}")
        print(f"💥 Summary API error: {e}")
        
        return api_response(
            success=False,
            message=f"Error retrieving screenshots summary: {str(e)}",
            status_code=500
        )
