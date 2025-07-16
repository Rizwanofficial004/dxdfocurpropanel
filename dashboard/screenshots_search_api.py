"""
Screenshots Search API - Separate module for search functionality
Supports three main search patterns:
1. Quick Name Search
2. Name + Date Filter  
3. Name + ALL Screenshots from S3
"""

import logging
import json
import boto3
import os
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q
from .models import User_Logs, Staff
from .get_employee_screenshots import scan_and_download_screenshots, generate_presigned_url, get_all_employees_from_s3
from .aws_utils import get_s3_client
from .serializers import (
    ScreenshotsSerializer, 
    PaginationSerializer,
    validate_email_format,
    validate_date_format
)

logger = logging.getLogger(__name__)

# Custom response helper
def api_response(success=True, message="", data=None, status_code=200):
    """
    Standardized API response format
    """
    response_data = {
        "success": success,
        "message": message,
        "data": data or {},
        "timestamp": datetime.now().isoformat()
    }
    return JsonResponse(response_data, status=status_code)


# ==================== PATTERN 1: QUICK NAME SEARCH ====================
@csrf_exempt
@require_http_methods(["GET"])
def quick_name_search_api(request):
    """
    Pattern 1: Quick Name Search
    GET: /api/screenshots/search/?search=Haseeb&limit=100
    
    Fast search by name/email with basic filtering
    """
    try:
        search_query = request.GET.get('search', '').strip()
        limit = min(int(request.GET.get('limit', 100)), 1000)
        page = int(request.GET.get('page', 1))
        
        if not search_query:
            return api_response(
                success=False,
                message="Search parameter is required",
                status_code=400
            )
        
        print(f"🔍 Quick Name Search: '{search_query}' (limit: {limit})")
        
        # Find users in Staff table matching the search
        staff_query = Staff.objects.filter(
            Q(firstname__icontains=search_query) |
            Q(lastname__icontains=search_query) |
            Q(email__icontains=search_query)
        )
        
        employees_found = []
        total_screenshots = 0
        
        for staff in staff_query[:5]:  # Limit to first 5 staff members for performance
            try:
                print(f"📸 Getting screenshots for: {staff.email}")
                
                # Get screenshots without date filter for quick search
                screenshots_data = scan_and_download_screenshots(staff.email, '', bool_flag=True)
                
                if screenshots_data and screenshots_data.get('image_urls'):
                    screenshots_list = screenshots_data.get('image_urls', [])
                    limited_screenshots = screenshots_list[:limit]
                    
                    if limited_screenshots:
                        employee_info = {
                            "staff_id": staff.staffid,
                            "name": f"{staff.firstname} {staff.lastname}",
                            "email": staff.email,
                            "profile_image": staff.profile_image.url if staff.profile_image else None,
                            "total_screenshots": len(screenshots_list),
                            "screenshots_shown": len(limited_screenshots),
                            "screenshots": limited_screenshots,
                            "source": "Quick_Search"
                        }
                        
                        employees_found.append(employee_info)
                        total_screenshots += len(limited_screenshots)
                        
                        print(f"   ✅ Found {len(screenshots_list)} total, showing {len(limited_screenshots)}")
                
            except Exception as e:
                print(f"   ❌ Error for {staff.email}: {str(e)}")
                continue
        
        response_data = {
            "search_pattern": "quick_name_search",
            "employees": employees_found,
            "summary": {
                "total_employees_found": len(employees_found),
                "total_screenshots": total_screenshots,
                "search_query": search_query,
                "limit_per_employee": limit
            },
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "api_endpoint": "/api/screenshots/search/",
                "pattern": "Pattern 1: Quick Name Search"
            }
        }
        
        message = f"Found {len(employees_found)} employees with {total_screenshots} screenshots matching '{search_query}'"
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Quick name search API error: {str(e)}")
        return api_response(
            success=False,
            message="Error in quick name search",
            status_code=500
        )


# ==================== PATTERN 2: NAME + DATE FILTER ====================
@csrf_exempt
@require_http_methods(["GET"])
def name_date_filter_api(request):
    """
    Pattern 2: Name + Date Filter
    GET: /api/screenshots/search/?search=Haseeb&date=2025-06-10&limit=100
    
    Search by name with specific date filtering
    """
    try:
        search_query = request.GET.get('search', '').strip()
        date_filter = request.GET.get('date', '').strip()
        limit = min(int(request.GET.get('limit', 100)), 1000)
        
        if not search_query:
            return api_response(
                success=False,
                message="Search parameter is required",
                status_code=400
            )
        
        if not date_filter:
            return api_response(
                success=False,
                message="Date parameter is required for this search pattern",
                status_code=400
            )
        
        # Validate date format
        try:
            datetime.strptime(date_filter, '%Y-%m-%d')
        except ValueError:
            return api_response(
                success=False,
                message="Date must be in YYYY-MM-DD format",
                status_code=400
            )
        
        print(f"🔍 Name + Date Search: '{search_query}' on {date_filter} (limit: {limit})")
        
        # Find users in Staff table matching the search
        staff_query = Staff.objects.filter(
            Q(firstname__icontains=search_query) |
            Q(lastname__icontains=search_query) |
            Q(email__icontains=search_query)
        )
        
        employees_found = []
        total_screenshots = 0
        
        for staff in staff_query[:5]:  # Limit to first 5 staff members
            try:
                print(f"📸 Getting screenshots for: {staff.email} on {date_filter}")
                
                # Get screenshots with specific date filter
                screenshots_data = scan_and_download_screenshots(staff.email, date_filter, bool_flag=True)
                
                if screenshots_data and screenshots_data.get('image_urls'):
                    screenshots_list = screenshots_data.get('image_urls', [])
                    limited_screenshots = screenshots_list[:limit]
                    
                    if limited_screenshots:
                        employee_info = {
                            "staff_id": staff.staffid,
                            "name": f"{staff.firstname} {staff.lastname}",
                            "email": staff.email,
                            "profile_image": staff.profile_image.url if staff.profile_image else None,
                            "total_screenshots": len(screenshots_list),
                            "screenshots_shown": len(limited_screenshots),
                            "screenshots": limited_screenshots,
                            "date_filter": date_filter,
                            "source": "Date_Filtered_Search"
                        }
                        
                        employees_found.append(employee_info)
                        total_screenshots += len(limited_screenshots)
                        
                        print(f"   ✅ Found {len(screenshots_list)} screenshots on {date_filter}")
                    else:
                        print(f"   ❌ No screenshots found on {date_filter}")
                
            except Exception as e:
                print(f"   ❌ Error for {staff.email}: {str(e)}")
                continue
        
        response_data = {
            "search_pattern": "name_date_filter",
            "employees": employees_found,
            "summary": {
                "total_employees_found": len(employees_found),
                "total_screenshots": total_screenshots,
                "search_query": search_query,
                "date_filter": date_filter,
                "limit_per_employee": limit
            },
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "api_endpoint": "/api/screenshots/search/",
                "pattern": "Pattern 2: Name + Date Filter"
            }
        }
        
        message = f"Found {len(employees_found)} employees with {total_screenshots} screenshots matching '{search_query}' on {date_filter}"
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Name + date filter API error: {str(e)}")
        return api_response(
            success=False,
            message="Error in name + date filter search",
            status_code=500
        )


# ==================== PATTERN 3: NAME + ALL SCREENSHOTS ====================
@csrf_exempt
@require_http_methods(["GET"])
def name_all_screenshots_api(request):
    """
    Pattern 3: Name + ALL Screenshots from S3
    GET: /api/screenshots/search/?search=Haseeb&scan_s3=true&limit=5000
    
    Comprehensive search that scans all S3 data for a user
    """
    try:
        search_query = request.GET.get('search', '').strip()
        scan_s3 = request.GET.get('scan_s3', 'false').lower() == 'true'
        limit = min(int(request.GET.get('limit', 5000)), 10000)  # Higher limit for comprehensive search
        
        if not search_query:
            return api_response(
                success=False,
                message="Search parameter is required",
                status_code=400
            )
        
        if not scan_s3:
            return api_response(
                success=False,
                message="scan_s3=true parameter is required for this search pattern",
                status_code=400
            )
        
        print(f"🔍 Name + ALL Screenshots Search: '{search_query}' (S3 scan, limit: {limit})")
        
        # Get all employees from S3 directly
        try:
            s3_employees = get_all_employees_from_s3()
            print(f"📂 Found {len(s3_employees)} employees in S3")
        except Exception as e:
            print(f"❌ Error accessing S3: {str(e)}")
            return api_response(
                success=False,
                message="Error accessing S3 data",
                status_code=500
            )
        
        # Filter S3 employees based on search query
        filtered_s3_employees = []
        for emp in s3_employees:
            # Handle both dict and string types for S3 users
            if isinstance(emp, dict) and 'email' in emp:
                email = emp['email'].rstrip('/')
            elif isinstance(emp, str):
                email = emp.rstrip('/').replace('_at_', '@')
            else:
                continue
            
            # Skip if email is empty after conversion
            if not email or '@' not in email:
                continue
            
            # Check if search query matches email, username, or name
            username = email.split('@')[0]
            
            # Try to get staff info for better matching
            try:
                staff = Staff.objects.get(email=email)
                full_name = f"{staff.firstname} {staff.lastname}".lower()
            except Staff.DoesNotExist:
                full_name = username.replace('_', ' ').replace('.', ' ').lower()
            
            # Check if search query matches
            search_lower = search_query.lower()
            if (search_lower in email.lower() or 
                search_lower in username.lower() or
                search_lower in full_name):
                filtered_s3_employees.append({'email': email})
        
        print(f"🔍 Filtered to {len(filtered_s3_employees)} employees matching '{search_query}'")
        
        employees_found = []
        total_screenshots = 0
        
        # Process all matching employees from S3
        for s3_emp in filtered_s3_employees[:3]:  # Limit to first 3 for performance
            email = s3_emp['email']
            print(f"📸 Getting ALL screenshots for S3 user: {email}")
            
            try:
                # Get ALL screenshots (no date filter) with high limit
                screenshots_data = scan_and_download_screenshots(email, '', bool_flag=True)
                
                if screenshots_data and screenshots_data.get('image_urls'):
                    screenshots_list = screenshots_data.get('image_urls', [])
                    
                    # Apply high limit for comprehensive search
                    limited_screenshots = screenshots_list[:limit]
                    
                    if limited_screenshots:
                        # Get staff info
                        try:
                            staff = Staff.objects.get(email=email)
                            name = f"{staff.firstname} {staff.lastname}"
                            staff_id = staff.staffid
                            profile_image = staff.profile_image.url if staff.profile_image else None
                        except Staff.DoesNotExist:
                            name = email.split('@')[0].replace('_', ' ').title()
                            staff_id = email.split('@')[0].upper()[:6]
                            profile_image = None
                        
                        employee_info = {
                            "staff_id": staff_id,
                            "name": name,
                            "email": email,
                            "profile_image": profile_image,
                            "total_screenshots": len(screenshots_list),
                            "screenshots_shown": len(limited_screenshots),
                            "screenshots": limited_screenshots,
                            "source": "S3_Comprehensive_Scan",
                            "scan_mode": "ALL_SCREENSHOTS"
                        }
                        
                        employees_found.append(employee_info)
                        total_screenshots += len(limited_screenshots)
                        
                        print(f"   ✅ Found {len(screenshots_list)} total screenshots, showing {len(limited_screenshots)}")
                
            except Exception as e:
                print(f"   ❌ Error getting screenshots for {email}: {str(e)}")
                continue
        
        response_data = {
            "search_pattern": "name_all_screenshots",
            "employees": employees_found,
            "summary": {
                "total_employees_found": len(employees_found),
                "total_screenshots": total_screenshots,
                "search_query": search_query,
                "s3_scan_enabled": True,
                "limit_per_employee": limit,
                "max_limit_available": 10000
            },
            "s3_scan_info": {
                "total_s3_employees": len(s3_employees),
                "matching_employees": len(filtered_s3_employees),
                "processed_employees": len(employees_found)
            },
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "api_endpoint": "/api/screenshots/search/",
                "pattern": "Pattern 3: Name + ALL Screenshots (S3 Comprehensive)",
                "s3_bucket": "ddsfocustime"
            }
        }
        
        message = f"S3 Comprehensive Scan: Found {len(employees_found)} employees with {total_screenshots} screenshots matching '{search_query}'"
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Name + all screenshots API error: {str(e)}")
        return api_response(
            success=False,
            message="Error in comprehensive S3 search",
            status_code=500
        )


# ==================== UNIFIED SCREENSHOTS SEARCH API ====================
@csrf_exempt
@require_http_methods(["GET"])
def screenshots_search_api(request):
    """
    Unified Screenshots Search API that handles all three patterns
    
    Automatically detects which pattern to use based on parameters:
    - Pattern 1: search only
    - Pattern 2: search + date
    - Pattern 3: search + scan_s3=true
    
    GET: /api/screenshots/search/?search=<name>&date=<date>&scan_s3=<bool>&limit=<number>
    """
    try:
        search_query = request.GET.get('search', '').strip()
        date_filter = request.GET.get('date', '').strip()
        scan_s3 = request.GET.get('scan_s3', 'false').lower() == 'true'
        limit = int(request.GET.get('limit', 100))
        
        # Determine which pattern to use
        if scan_s3:
            # Pattern 3: Comprehensive S3 scan
            print("🎯 Detected Pattern 3: Name + ALL Screenshots (S3)")
            return name_all_screenshots_api(request)
        elif date_filter:
            # Pattern 2: Name + Date filter
            print("🎯 Detected Pattern 2: Name + Date Filter")
            return name_date_filter_api(request)
        elif search_query:
            # Pattern 1: Quick name search
            print("🎯 Detected Pattern 1: Quick Name Search")
            return quick_name_search_api(request)
        else:
            return api_response(
                success=False,
                message="Please provide a search parameter to begin",
                data={
                    "available_patterns": [
                        {
                            "pattern": 1,
                            "description": "Quick Name Search",
                            "example": "?search=Haseeb&limit=100"
                        },
                        {
                            "pattern": 2,
                            "description": "Name + Date Filter",
                            "example": "?search=Haseeb&date=2025-06-10&limit=100"
                        },
                        {
                            "pattern": 3,
                            "description": "Name + ALL Screenshots",
                            "example": "?search=Haseeb&scan_s3=true&limit=5000"
                        }
                    ]
                },
                status_code=400
            )
        
    except Exception as e:
        logger.error(f"Unified screenshots search API error: {str(e)}")
        return api_response(
            success=False,
            message="Error in screenshots search",
            status_code=500
        )


# ==================== HELPER FUNCTIONS ====================

def get_employee_by_search(search_query):
    """
    Helper function to find employees by search query
    """
    try:
        # Search in Staff table
        staff_query = Staff.objects.filter(
            Q(firstname__icontains=search_query) |
            Q(lastname__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(staffid__icontains=search_query)
        )
        
        employees = []
        for staff in staff_query:
            employees.append({
                "staff_id": staff.staffid,
                "name": f"{staff.firstname} {staff.lastname}",
                "email": staff.email,
                "profile_image": staff.profile_image.url if staff.profile_image else None
            })
        
        return employees
        
    except Exception as e:
        logger.error(f"Error finding employees: {str(e)}")
        return []


def format_screenshot_data(screenshot, email, source="API"):
    """
    Helper function to format screenshot data consistently
    """
    try:
        return {
            "url": screenshot.get('url', ''),
            "filename": screenshot.get('filename', ''),
            "last_modified": screenshot.get('last_modified', ''),
            "size": screenshot.get('size', 0),
            "date_folder": screenshot.get('date_folder', ''),
            "s3_key": screenshot.get('key', ''),
            "employee_email": email,
            "source": source,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error formatting screenshot data: {str(e)}")
        return {}


def validate_search_parameters(search_query, date_filter=None, limit=None):
    """
    Helper function to validate search parameters
    """
    errors = []
    
    if not search_query or len(search_query.strip()) < 2:
        errors.append("Search query must be at least 2 characters long")
    
    if date_filter:
        try:
            datetime.strptime(date_filter, '%Y-%m-%d')
        except ValueError:
            errors.append("Date must be in YYYY-MM-DD format")
    
    if limit and (limit < 1 or limit > 10000):
        errors.append("Limit must be between 1 and 10000")
    
    return errors
