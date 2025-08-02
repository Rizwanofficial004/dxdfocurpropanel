import logging
import json
import boto3
import os
import json
import logging
import re
import calendar
from datetime import datetime, timedelta
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from django.views import View
from django.core.paginator import Paginator
from django.db.models import Q
from .models import User_Logs, Staff, ConfigurationSettings
from .get_employee_screenshots import scan_and_download_screenshots
from .aws_utils import generate_presigned_url
from .aws_utils import get_s3_client
from .serializers import (
    LoginSerializer, 
    ScreenshotsSerializer, 
    LogsSerializer, 
    PaginationSerializer,
    validate_email_format,
    validate_date_format
)
from django.contrib.auth.models import User
from django.db.models import Q, Count
import json
import re
from .s3_pagination_utils import list_s3_screenshots_paginated

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

# Simple test endpoint to verify API routing
@csrf_exempt
def api_test(request):
    """Test endpoint to verify API is working"""
    return api_response(
        success=True,
        message="API is working correctly!",
        data={
            "method": request.method,
            "path": request.path,
            "user_authenticated": request.user.is_authenticated,
            "available_endpoints": [
                "/api/test/",
                "/api/auth/login/",
                "/api/screenshots/",
                "/api/logs/",
                "/api/update-log-info/"
            ]
        }
    )

# Authentication decorator for API views
def api_login_required(view_func):
    """
    Custom decorator for API authentication
    """
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return api_response(
                success=False, 
                message="Authentication required", 
                status_code=401
            )
        return view_func(request, *args, **kwargs)
    return wrapper

# ==================== LOGIN API ====================
@csrf_exempt
@require_http_methods(["POST"])
def login_api(request):
    """
    Enhanced Professional Login API
    
    Expected JSON payload:
    {
        "username": "Admin",
        "password": "admin123",
        "remember_me": true
    }
    
    Response format:
    {
        "success": true,
        "message": "Login successful",
        "data": {
            "user": {...},
            "staff_info": {...},
            "session_info": {...}
        }
    }
    """
    try:
        # Debug logging
        logger.info(f"Login API called from IP: {request.META.get('REMOTE_ADDR', 'Unknown')}")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"Request method: {request.method}")
        
        # Parse JSON data
        if request.content_type != 'application/json':
            return api_response(
                success=False,
                message="Content-Type must be application/json",
                status_code=400
            )
        
        data = json.loads(request.body)
        logger.info(f"Login attempt for username: {data.get('username', 'N/A')}")
        
        # Validate input using serializer
        validation_errors = LoginSerializer.validate(data)
        if validation_errors:
            logger.warning(f"Validation errors: {validation_errors}")
            return api_response(
                success=False,
                message="Validation failed",
                data={"errors": validation_errors},
                status_code=400
            )
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        remember_me = data.get('remember_me', False)
        
        # Try to authenticate user by username first, then by email
        user = authenticate(request, username=username, password=password)
        
        # If username authentication fails, try email authentication
        if user is None and '@' in username:
            try:
                django_user = User.objects.get(email=username)
                user = authenticate(request, username=django_user.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user is not None:
            if user.is_active:
                login(request, user)
                
                # Set session expiry based on remember_me
                if remember_me:
                    request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days
                else:
                    request.session.set_expiry(0)  # Browser session
                
                # Get staff information
                staff_info = None
                try:
                    staff = Staff.objects.get(email=user.email)
                    staff_info = {
                        "staff_id": staff.staffid,
                        "first_name": staff.firstname,
                        "last_name": staff.lastname,
                        "full_name": f"{staff.firstname} {staff.lastname}",
                        "email": staff.email,
                        "profile_image": staff.profile_image.url if hasattr(staff, 'profile_image') and staff.profile_image else None
                    }
                except Staff.DoesNotExist:
                    staff_info = {
                        "staff_id": "N/A",
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "full_name": f"{user.first_name} {user.last_name}".strip() or user.username,
                        "email": user.email,
                        "profile_image": None
                    }
                
                # Serialize user data
                user_data = LoginSerializer.serialize_user(user)
                
                # Session information
                session_info = {
                    "session_key": request.session.session_key,
                    "remember_me": remember_me,
                    "expires_at": request.session.get_expiry_date().isoformat() if request.session.get_expiry_date() else None
                }
                
                logger.info(f"Successful login for user: {username} (ID: {user.id})")
                
                return api_response(
                    success=True,
                    message="Login successful",
                    data={
                        "user": user_data,
                        "staff_info": staff_info,
                        "session_info": session_info,
                        "login_timestamp": datetime.now().isoformat()
                    }
                )
            else:
                logger.warning(f"Login attempt for deactivated account: {username}")
                return api_response(
                    success=False,
                    message="Account is deactivated. Please contact administrator.",
                    status_code=401
                )
        else:
            logger.warning(f"Failed login attempt for username: {username}")
            
            # Check if user exists but password is wrong
            user_exists = False
            try:
                User.objects.get(username=username)
                user_exists = True
            except User.DoesNotExist:
                try:
                    User.objects.get(email=username)
                    user_exists = True
                except User.DoesNotExist:
                    pass
            
            if user_exists:
                message = "Invalid password. Please check your password and try again."
            else:
                message = "User not found. Please check your username/email and try again."
            
            return api_response(
                success=False,
                message=message,
                data={
                    "error_code": "AUTHENTICATION_FAILED",
                    "username_provided": username,
                    "user_exists": user_exists
                },
                status_code=401
            )
            
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return api_response(
            success=False,
            message="Invalid JSON format. Please check your request body.",
            data={"error_details": str(e)},
            status_code=400
        )
    except Exception as e:
        logger.error(f"Login API error: {str(e)}")
        return api_response(
            success=False,
            message="Internal server error. Please try again later.",
            data={"error_type": type(e).__name__},
            status_code=500
        )

# ==================== LOGOUT API ====================
@csrf_exempt
@require_http_methods(["POST"])
def logout_api(request):
    """
    Professional Logout API
    
    Logs out the current user and invalidates their session.
    """
    try:
        if request.user.is_authenticated:
            username = request.user.username
            logger.info(f"Logout requested for user: {username}")
            
            # Import logout function
            from django.contrib.auth import logout
            logout(request)
            
            return api_response(
                success=True,
                message="Logout successful",
                data={
                    "logged_out_user": username,
                    "logout_timestamp": datetime.now().isoformat()
                }
            )
        else:
            return api_response(
                success=False,
                message="No active session found",
                status_code=401
            )
            
    except Exception as e:
        logger.error(f"Logout API error: {str(e)}")
        return api_response(
            success=False,
            message="Internal server error",
            status_code=500
        )

# ==================== SESSION STATUS API ====================
@csrf_exempt
@require_http_methods(["GET"])
def session_status_api(request):
    """
    Check current session status
    
    Returns information about the current authenticated session.
    """
    try:
        if request.user.is_authenticated:
            # Get staff information
            staff_info = None
            try:
                staff = Staff.objects.get(email=request.user.email)
                staff_info = {
                    "staff_id": staff.staffid,
                    "first_name": staff.firstname,
                    "last_name": staff.lastname,
                    "full_name": f"{staff.firstname} {staff.lastname}",
                }
            except Staff.DoesNotExist:
                staff_info = {
                    "staff_id": "N/A",
                    "first_name": request.user.first_name,
                    "last_name": request.user.last_name,
                    "full_name": f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                }
            
            return api_response(
                success=True,
                message="Session is active",
                data={
                    "authenticated": True,
                    "user": LoginSerializer.serialize_user(request.user),
                    "staff_info": staff_info,
                    "session_key": request.session.session_key,
                    "session_expires": request.session.get_expiry_date().isoformat() if request.session.get_expiry_date() else None
                }
            )
        else:
            return api_response(
                success=False,
                message="No active session",
                data={"authenticated": False},
                status_code=401
            )
            
    except Exception as e:
        logger.error(f"Session status API error: {str(e)}")
        return api_response(
            success=False,
            message="Internal server error",
            status_code=500
        )

# ==================== SCREENSHOTS API ====================
@csrf_exempt
@api_login_required
@require_http_methods(["GET", "POST"])
def screenshots_api(request):
    """
    Professional Screenshots API
    
    GET: Retrieve screenshots for authenticated user or specific email
    POST: Retrieve screenshots with filters
    
    Query parameters for GET:
    - email: Employee email (optional, defaults to authenticated user's email)
    - date: Specific date (YYYY-MM-DD format)
    - limit: Number of screenshots to return (default: 50)
    - page: Page number for pagination (default: 1)
    
    POST JSON payload:
    {
        "email": "employee@example.com",
        "date": "2025-01-15",
        "date_range": {
            "start": "2025-01-01",
            "end": "2025-01-31"
        },
        "task_filter": "specific_task",
        "limit": 100,
        "page": 1
    }
    """
    try:
        if request.method == "GET":
            # Handle GET request
            params = {
                'email': request.GET.get('email', request.user.email),
                'date': request.GET.get('date', ''),
                'limit': request.GET.get('limit', '50'),
                'page': request.GET.get('page', '1')
            }
            
            # Validate parameters using serializer
            validation_errors = ScreenshotsSerializer.validate_get_params(params)
            if validation_errors:
                return api_response(
                    success=False,
                    message="Validation failed",
                    data={"errors": validation_errors},
                    status_code=400
                )
            
            email = params['email']
            date = params['date']
            limit = int(params['limit'])
            page = int(params['page'])
            
        else:  # POST request
            data = json.loads(request.body)
            
            # Validate data using serializer
            validation_errors = ScreenshotsSerializer.validate_post_data(data)
            if validation_errors:
                return api_response(
                    success=False,
                    message="Validation failed",
                    data={"errors": validation_errors},
                    status_code=400
                )
            
            email = data.get('email', request.user.email)
            date = data.get('date', '')
            limit = data.get('limit', 50)
            page = data.get('page', 1)
            date_range = data.get('date_range', {})
            task_filter = data.get('task_filter', '')
        
        # Validate email permission (users can only access their own screenshots unless they're staff)
        if email != request.user.email and not request.user.is_staff:
            return api_response(
                success=False,
                message="Permission denied: You can only access your own screenshots",
                status_code=403
            )
        
        # Get screenshots using existing function
        screenshots_data = scan_and_download_screenshots(email, date, bool_flag=True)
        
        if not screenshots_data or not screenshots_data.get('image_urls'):
            return api_response(
                success=True,
                message="No screenshots found",
                data={
                    "screenshots": [],
                    "pagination": {
                        "current_page": page,
                        "total_pages": 0,
                        "total_count": 0,
                        "limit": limit,
                        "has_next": False,
                        "has_previous": False
                    },
                    "email": email,
                    "date_filter": date
                }
            )
        
        # Process screenshots from the new format
        image_urls = screenshots_data.get('image_urls', [])
        total_count = screenshots_data.get('total_count', len(image_urls))
        
        # Apply pagination to the screenshots list
        paginator = Paginator(image_urls, limit)
        try:
            screenshots_page = paginator.page(page)
        except:
            screenshots_page = paginator.page(1)
        
        # Serialize screenshots for API response
        serialized_screenshots = []
        for screenshot in screenshots_page:
            serialized_screenshots.append(ScreenshotsSerializer.serialize_screenshot(screenshot))
        
        response_data = {
            "screenshots": serialized_screenshots,
            "pagination": PaginationSerializer.serialize_pagination(screenshots_page),
            "email": email,
            "date_filter": date,
            "total_found": total_count,
            "prefix_searched": screenshots_data.get('prefix_used', '')
        }
        
        logger.info(f"Screenshots retrieved for email: {email}, page: {page}")
        
        return api_response(
            success=True,
            message="Screenshots retrieved successfully",
            data=response_data
        )
        
    except json.JSONDecodeError:
        return api_response(
            success=False,
            message="Invalid JSON format",
            status_code=400
        )
    except Exception as e:
        logger.error(f"Screenshots API error: {str(e)}")
        return api_response(
            success=False,
            message="Internal server error",
            status_code=500
        )

# ==================== LOGS API ====================
@csrf_exempt
@api_login_required
@require_http_methods(["GET", "POST"])
def logs_api(request):
    """
    Professional Logs API
    
    GET: Retrieve logs with filtering and pagination
    POST: Create/Update logs
    
    Query parameters for GET:
    - email: Filter by email (optional)
    - staffid: Filter by staff ID (optional)
    - date: Filter by specific date (YYYY-MM-DD)
    - date_range: Filter by date range
    - limit: Number of logs per page (default: 20)
    - page: Page number (default: 1)
    - search: Search term for log content
    
    POST JSON payload for creating logs:
    {
        "staffid": 123,
        "email": "user@example.com",
        "jsonlog": {...},
        "date": "2025-01-15"
    }
    """
    try:
        if request.method == "GET":
            # Handle GET request - Retrieve logs
            params = {
                'email': request.GET.get('email', ''),
                'staffid': request.GET.get('staffid', ''),
                'date': request.GET.get('date', ''),
                'limit': request.GET.get('limit', '20'),
                'page': request.GET.get('page', '1'),
                'search': request.GET.get('search', '')
            }
            
            # Validate parameters using serializer
            validation_errors = LogsSerializer.validate_get_params(params)
            if validation_errors:
                return api_response(
                    success=False,
                    message="Validation failed",
                    data={"errors": validation_errors},
                    status_code=400
                )
            
            email = params['email']
            staffid = params['staffid']
            date = params['date']
            limit = int(params['limit'])
            page = int(params['page'])
            search = params['search']
            
            # Build query
            query = Q()
            
            # Apply filters
            if email:
                query &= Q(email__icontains=email)
            if staffid:
                query &= Q(staffid=int(staffid))
            if date:
                query &= Q(date=date)
            if search:
                query &= Q(jsonlog__icontains=search)
            
            # Permission check - regular users can only see their own logs
            if not request.user.is_staff:
                query &= Q(email=request.user.email)
            
            # Get logs
            logs = User_Logs.objects.filter(query).order_by('-id')
            
            # Apply pagination
            paginator = Paginator(logs, limit)
            try:
                logs_page = paginator.page(page)
            except:
                logs_page = paginator.page(1)
            
            # Serialize logs
            logs_data = [LogsSerializer.serialize_log(log) for log in logs_page]
            
            response_data = {
                "logs": logs_data,
                "pagination": PaginationSerializer.serialize_pagination(logs_page),
                "filters": {
                    "email": email,
                    "staffid": staffid,
                    "date": date,
                    "search": search
                }
            }
            
            logger.info(f"Logs retrieved - Count: {paginator.count}, Page: {page}")
            
            return api_response(
                success=True,
                message="Logs retrieved successfully",
                data=response_data
            )
            
        else:  # POST request - Create/Update logs
            data = json.loads(request.body)
            
            # Validate data using serializer
            validation_errors = LogsSerializer.validate_post_data(data)
            if validation_errors:
                return api_response(
                    success=False,
                    message="Validation failed",
                    data={"errors": validation_errors},
                    status_code=400
                )
            
            # Permission check - users can only create logs for themselves
            if data['email'] != request.user.email and not request.user.is_staff:
                return api_response(
                    success=False,
                    message="Permission denied: You can only create logs for yourself",
                    status_code=403
                )
            
            # Create log entry
            log_entry = User_Logs.objects.create(
                staffid=data['staffid'],
                email=data['email'],
                jsonlog=json.dumps(data['jsonlog']) if isinstance(data['jsonlog'], dict) else data['jsonlog'],
                date=data['date']
            )
            
            logger.info(f"Log created for email: {data['email']}, staffid: {data['staffid']}")
            
            return api_response(
                success=True,
                message="Log created successfully",
                data={
                    "log_id": log_entry.id,
                    "staffid": log_entry.staffid,
                    "email": log_entry.email,
                    "date": log_entry.date
                },
                status_code=201
            )
            
    except json.JSONDecodeError:
        return api_response(
            success=False,
            message="Invalid JSON format",
            status_code=400
        )
    except Exception as e:
        logger.error(f"Logs API error: {str(e)}")
        return api_response(
            success=False,
            message="Internal server error",
            status_code=500
        )

# ==================== USER-SPECIFIC APIs ====================
@csrf_exempt
@require_http_methods(["GET"])
def user_screenshots_api(request, email):
    """
    Get screenshots for a specific user email
    
    URL: /api/users/{email}/screenshots/
    Query parameters:
    - date: Specific date (YYYY-MM-DD format)
    - limit: Number of screenshots (default: 20)
    - page: Page number (default: 1)
    """
    try:
        # Remove authentication requirement for testing
        # if email != request.user.email and not request.user.is_staff:
        #     return api_response(
        #         success=False,
        #         message="Permission denied: You can only access your own screenshots",
        #         status_code=403
        #     )
        
        # Get query parameters
        date = request.GET.get('date', '')
        limit = int(request.GET.get('limit', 20))
        page = int(request.GET.get('page', 1))
        
        # Validate parameters
        if limit > 100:
            limit = 100
        if page < 1:
            page = 1
        
        # Validate date format if provided
        if date:
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                return api_response(
                    success=False,
                    message="Date must be in YYYY-MM-DD format",
                    status_code=400
                )
        
        # Get screenshots using existing function
        screenshots_data = scan_and_download_screenshots(email, date, bool_flag=True)
        
        if not screenshots_data:
            return api_response(
                success=True,
                message=f"No screenshots found for {email}",
                data={
                    "screenshots": [],
                    "pagination": {
                        "current_page": page,
                        "total_pages": 0,
                        "total_count": 0,
                        "limit": limit,
                        "has_next": False,
                        "has_previous": False
                    },
                    "user_email": email,
                    "date_filter": date
                }
            )
        
        # Process screenshots
        folder_map = screenshots_data.get('folder_map', {})
        all_screenshots = []
        
        for folder, urls in folder_map.items():
            if isinstance(urls, list):
                for url in urls:
                    screenshot_data = {
                        "url": url,
                        "folder": folder,
                        "timestamp": datetime.now().isoformat(),
                        "presigned_url": generate_presigned_url("ddsfocustime", url.replace('/media/', '') if url.startswith('/media/') else url)
                    }
                    all_screenshots.append(screenshot_data)
        
        # Apply pagination
        paginator = Paginator(all_screenshots, limit)
        try:
            screenshots_page = paginator.page(page)
        except:
            screenshots_page = paginator.page(1)
        
        response_data = {
            "screenshots": list(screenshots_page),
            "pagination": PaginationSerializer.serialize_pagination(screenshots_page),
            "user_email": email,
            "date_filter": date,
            "filters_applied": {
                "email": email,
                "date": date,
                "limit": limit,
                "page": page
            }
        }
        
        logger.info(f"Screenshots retrieved for user: {email}, count: {len(all_screenshots)}")
        
        return api_response(
            success=True,
            message=f"Screenshots retrieved successfully for {email}",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"User Screenshots API error: {str(e)}")
        return api_response(
            success=False,
            message="Internal server error",
            status_code=500
        )

@csrf_exempt
@require_http_methods(["GET"])
def user_logs_api(request, email):
    """
    Get logs for a specific user email
    
    URL: /api/users/{email}/logs/
    Query parameters:
    - date: Specific date (YYYY-MM-DD format)
    - search: Search term for log content
    - limit: Number of logs (default: 20)
    - page: Page number (default: 1)
    """
    try:
        # Validate email permission
        if email != request.user.email and not request.user.is_staff:
            return api_response(
                success=False,
                message="Permission denied: You can only access your own logs",
                status_code=403
            )
        
        # Get query parameters
        date = request.GET.get('date', '')
        search = request.GET.get('search', '')
        limit = int(request.GET.get('limit', 20))
        page = int(request.GET.get('page', 1))
        
        # Validate parameters
        if limit > 100:
            limit = 100
        if page < 1:
            page = 1
        
        # Validate date format if provided
        if date:
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                return api_response(
                    success=False,
                    message="Date must be in YYYY-MM-DD format",
                    status_code=400
                )
        
        # Build query
        query = Q(email=email)
        
        if date:
            query &= Q(date=date)
        if search:
            query &= Q(jsonlog__icontains=search)
        
        # Get logs
        logs = User_Logs.objects.filter(query).order_by('-id')
        
        # Apply pagination
        paginator = Paginator(logs, limit)
        try:
            logs_page = paginator.page(page)
        except:
            logs_page = paginator.page(1)
        
        # Serialize logs
        logs_data = [LogsSerializer.serialize_log(log) for log in logs_page]
        
        response_data = {
            "logs": logs_data,
            "pagination": PaginationSerializer.serialize_pagination(logs_page),
            "user_email": email,
            "filters_applied": {
                "email": email,
                "date": date,
                "search": search,
                "limit": limit,
                "page": page
            }
        }
        
        logger.info(f"Logs retrieved for user: {email}, count: {paginator.count}")
        
        return api_response(
            success=True,
            message=f"Logs retrieved successfully for {email}",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"User Logs API error: {str(e)}")
        return api_response(
            success=False,
            message="Internal server error",
            status_code=500
        )

# ==================== DASHBOARD DATA API ====================
@csrf_exempt
@require_http_methods(["GET", "POST"])
def dashboard_data_api(request):
    """
    Professional Dashboard Data API
    
    Get comprehensive dashboard data by username or email including:
    - User information
    - Screenshots data
    - Task information 
    - Activity logs
    - Status information
    
    GET: /api/dashboard/data/?user=username_or_email
    POST: /api/dashboard/data/ with {"user": "username_or_email"}
    
    Query parameters:
    - user: Username or email (required)
    - date: Filter by specific date (YYYY-MM-DD)
    - limit: Number of items per page (default: 20)
    - page: Page number (default: 1)
    - include_screenshots: Include screenshot URLs (default: true)
    - include_logs: Include activity logs (default: true)
    """
    try:
        if request.method == "GET":
            user_identifier = request.GET.get('user', '').strip()
            date_filter = request.GET.get('date', '')
            limit = int(request.GET.get('limit', 20))
            page = int(request.GET.get('page', 1))
            include_screenshots = request.GET.get('include_screenshots', 'true').lower() == 'true'
            include_logs = request.GET.get('include_logs', 'true').lower() == 'true'
            
        else:  # POST request
            data = json.loads(request.body)
            user_identifier = data.get('user', '').strip()
            date_filter = data.get('date', '')
            limit = data.get('limit', 20)
            page = data.get('page', 1)
            include_screenshots = data.get('include_screenshots', True)
            include_logs = data.get('include_logs', True)
        
        # Validate required parameter
        if not user_identifier:
            return api_response(
                success=False,
                message="User parameter is required (username or email)",
                status_code=400
            )
        
        # Find user by username or email
        user = None
        try:
            if '@' in user_identifier:
                # Email provided
                user = User.objects.get(email=user_identifier)
            else:
                # Username provided
                user = User.objects.get(username=user_identifier)
        except User.DoesNotExist:
            return api_response(
                success=False,
                message=f"User not found: {user_identifier}",
                status_code=404
            )
        
        # Get staff information
        staff_info = None
        try:
            staff = Staff.objects.get(email=user.email)
            staff_info = {
                "staff_id": staff.staffid,
                "first_name": staff.firstname,
                "last_name": staff.lastname,
                "full_name": f"{staff.firstname} {staff.lastname}",
                "email": staff.email,
                "profile_image": staff.profile_image.url if staff.profile_image else None
            }
        except Staff.DoesNotExist:
            staff_info = {
                "staff_id": "N/A",
                "first_name": user.first_name,
                "last_name": user.last_name, 
                "full_name": f"{user.first_name} {user.last_name}".strip(),
                "email": user.email,
                "profile_image": None
            }
        
        # Get user's activity logs
        logs_data = []
        total_logs = 0
        if include_logs:
            logs_query = User_Logs.objects.filter(email=user.email)
            
            if date_filter:
                logs_query = logs_query.filter(date=date_filter)
            
            total_logs = logs_query.count()
            
            # Paginate logs
            start_idx = (page - 1) * limit
            paginated_logs = logs_query.order_by('-id')[start_idx:start_idx + limit]
            
            for log in paginated_logs:
                try:
                    json_data = json.loads(log.jsonlog) if log.jsonlog else {}
                except json.JSONDecodeError:
                    json_data = {"raw_data": log.jsonlog}
                
                logs_data.append({
                    "id": log.id,
                    "staff_id": log.staffid,
                    "email": log.email,
                    "date": log.date,
                    "log_data": json_data,
                    "timestamp": log.date  # You might want to add actual timestamp field
                })
        
        # Get screenshots data from S3
        screenshots_data = []
        total_screenshots = 0
        if include_screenshots:
            try:
                # Use your existing S3 function
                s3_data = scan_and_download_screenshots(user.email, date_filter, bool_flag=True)
                
                if s3_data and s3_data.get('image_urls'):
                    screenshots_list = s3_data.get('image_urls', [])
                    total_screenshots = len(screenshots_list);
                    
                    # Paginate screenshots
                    start_idx = (page - 1) * limit
                    paginated_screenshots = screenshots_list[start_idx:start_idx + limit]
                    
                    for i, screenshot in enumerate(paginated_screenshots):
                        # Create task-like data structure matching your UI
                        task_number = start_idx + i + 1;
                        
                        # Determine status based on time or other logic
                        status = "Online" if i % 3 == 0 else ("Idle" if i % 3 == 1 else "Offline");
                        status_color = {"Online": "success", "Idle": "warning", "Offline": "danger"}[status];
                        
                        screenshot_data = {
                            "task_id": f"task_{task_number}",
                            "task_name": f"Development Task {task_number}",
                            "status": status,
                            "status_color": status_color[status],
                            "screenshot_url": screenshot.get('url', ''),
                            "thumbnail_url": screenshot.get('url', ''),
                            "filename": screenshot.get('filename', ''),
                            "timestamp": screenshot.get('last_modified', ''),
                            "time_display": format_time_display(screenshot.get('last_modified', '')),
                            "file_size": screenshot.get('size', 0),
                            "date_folder": screenshot.get('date_folder', ''),
                            "s3_key": screenshot.get('key', ''),
                            "has_preview": bool(screenshot.get('url'))
                        }
                        screenshots_data.append(screenshot_data)
                        
            except Exception as e:
                logger.error(f"Error getting screenshots: {str(e)}")
        
        # Calculate pagination for combined data
        total_items = max(total_logs, total_screenshots)
        total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1;
        
        # Build response
        response_data = {
            "user_info": {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_staff": user.is_staff,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "date_joined": user.date_joined.isoformat(),
                "staff_details": staff_info
            },
            "dashboard_data": {
                "screenshots": screenshots_data if include_screenshots else [],
                "activity_logs": logs_data if include_logs else [],
                "summary": {
                    "total_screenshots": total_screenshots,
                    "total_logs": total_logs,
                    "screenshots_today": len([s for s in screenshots_data if s.get('date_folder') == datetime.now().strftime('%Y-%m-%d')]),
                    "status_breakdown": calculate_status_breakdown(screenshots_data)
                }
            },
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_items": total_items,
                "limit": limit,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "user": user_identifier,
                "date": date_filter,
                "include_screenshots": include_screenshots,
                "include_logs": include_logs
            },
            "ui_layout": generate_ui_layout_data(screenshots_data)
        }
        
        return api_response(
            success=True,
            message=f"Dashboard data retrieved successfully for {user.username}",
            data=response_data
        )
        
    except json.JSONDecodeError:
        return api_response(
            success=False,
            message="Invalid JSON format",
            status_code=400
        )
    except ValueError as e:
        return api_response(
            success=False,
            message=f"Invalid parameter: {str(e)}",
            status_code=400
        )
    except Exception as e:
        logger.error(f"Dashboard data API error: {str(e)}")
        return api_response(
            success=False,
            message="Internal server error",
            status_code=500
        )


def format_time_display(timestamp_str):
    """Format timestamp for display like '9:33 AM'"""
    try:
        if timestamp_str:
            # Parse the ISO timestamp
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            return dt.strftime('%I:%M %p')
    except:
        pass
    return datetime.now().strftime('%I:%M %p')


def calculate_status_breakdown(screenshots_data):
    """Calculate status breakdown for dashboard summary"""
    breakdown = {"online": 0, "idle": 0, "offline": 0}
    
    for screenshot in screenshots_data:
        status = screenshot.get('status', 'offline').lower()
        if status in breakdown:
            breakdown[status] += 1
    
    return breakdown


def generate_ui_layout_data(screenshots_data):
    """Generate UI layout data that matches your dashboard interface"""
    return {
        "grid_layout": "3_columns",
        "items_per_row": 3,
        "total_rows": (len(screenshots_data) + 2) // 3,
        "pagination_style": "numbered",
        "card_style": "dark_theme",
        "status_indicators": True,
        "preview_enabled": True
    }


# ==================== QUICK USER SEARCH API ====================
@csrf_exempt
@require_http_methods(["GET"])
def user_search_api(request):
    """
    Enhanced user search API for username/email lookup
    Searches in both User and Staff models
    
    GET: /api/users/search/?q=search_term
    """
    try:
        search_term = request.GET.get('q', '').strip()
        limit = int(request.GET.get('limit', 10))
        
        if not search_term:
            return api_response(
                success=False,
                message="Search term is required",
                status_code=400
            )
        
        all_users_data = []
        
        # Search in Django User model
        django_users = User.objects.filter(
            Q(username__icontains=search_term) | 
            Q(email__icontains=search_term) |
            Q(first_name__icontains=search_term) |
            Q(last_name__icontains=search_term)
        )[:limit]
        
        for user in django_users:
            all_users_data.append({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "display_name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "staff_id": "N/A",
                "is_active": user.is_active,
                "source": "django_user",
                "last_login": user.last_login.isoformat() if user.last_login else None
            })
        
        # Search in Staff model
        staff_members = Staff.objects.filter(
            Q(firstname__icontains=search_term) |
            Q(lastname__icontains=search_term) |
            Q(email__icontains=search_term) |
            Q(staffid__icontains=search_term)
        )[:limit]
        
        for staff in staff_members:
            # Check if this staff member is already in django users
            existing_user = next((u for u in all_users_data if u["email"] == staff.email), None)
            
            if not existing_user:
                all_users_data.append({
                    "user_id": f"staff_{staff.id}",
                    "username": staff.email.split('@')[0],  # Use email prefix as username
                    "email": staff.email,
                    "display_name": f"{staff.firstname} {staff.lastname}",
                    "first_name": staff.firstname,
                    "last_name": staff.lastname,
                    "staff_id": staff.staffid,
                    "is_active": True,
                    "source": "staff",
                    "last_login": None
                })
            else:
                # Update existing user with staff info
                existing_user["staff_id"] = staff.staffid
                existing_user["display_name"] = f"{staff.firstname} {staff.lastname}"
        
        # Sort by relevance (exact matches first, then partial matches)
        def sort_relevance(user):
            search_lower = search_term.lower()
            email_lower = user["email"].lower()
            name_lower = user["display_name"].lower();
            
            # Exact email match gets highest priority
            if email_lower == search_lower:
                return 0
            # Email starts with search term
            elif email_lower.startswith(search_lower):
                return 1
            # Name exact match
            elif name_lower == search_lower:
                return 2
            # Name starts with search term
            elif name_lower.startswith(search_lower):
                return 3
            # Email contains search term
            elif search_lower in email_lower:
                return 4
            # Name contains search term
            elif search_lower in name_lower:
                return 5
            # Fallback
            else:
                return 6
        
        all_users_data.sort(key=sort_relevance)
        
        # Limit final results
        final_results = all_users_data[:limit]
        
        return api_response(
            success=True,
            message=f"Found {len(final_results)} users matching '{search_term}'",
            data={
                "users": final_results,
                "search_term": search_term,
                "total_found": len(final_results),
                "searched_in": ["django_users", "staff_members"]
            }
        )
        
    except Exception as e:
        logger.error(f"User search API error: {str(e)}")
        return api_response(
            success=False,
            message="Error searching users",
            status_code=500
        )

# ==================== GOOGLE-LIKE USER SUGGESTIONS API ====================
@csrf_exempt
@require_http_methods(["GET"])
def user_suggestions_api(request):
    """
    Google-like user suggestions API for real-time search
    Provides instant suggestions as user types
    
    GET: /api/users/suggestions/?q=search_term&limit=5
    
    Features:
    - Real-time suggestions
    - Fuzzy matching
    - Relevance scoring
    - Highlighting of matched terms
    - Recent activity indicators
    """
    try:
        search_term = request.GET.get('q', '').strip()
        limit = int(request.GET.get('limit', 8))
        include_activity = request.GET.get('include_activity', 'true').lower() == 'true'
        
        if len(search_term) < 1:
            return api_response(
                success=True,
                message="Enter at least 1 character to search",
                data={
                    "suggestions": [],
                    "search_term": search_term,
                    "total_found": 0,
                    "search_tips": [
                        "Type a name, email, or username",
                        "Use partial words for broader results",
                        "Search by first name, last name, or email"
                    ]
                }
            )
        
        all_suggestions = []
        
        # Search in Django User model with advanced matching
        django_users = User.objects.filter(
            Q(username__icontains=search_term) | 
            Q(email__icontains=search_term) |
            Q(first_name__icontains=search_term) |
            Q(last_name__icontains=search_term)
        )[:limit * 2]  # Get more to filter better
        
        for user in django_users:
            # Calculate relevance score
            score = calculate_search_relevance(search_term, user.username, user.email, 
                                             user.first_name, user.last_name)
            
            # Get recent activity if requested
            recent_activity = None
            if include_activity:
                recent_activity = get_user_recent_activity(user.email)
            
            suggestion = {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "display_name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "staff_id": "N/A",
                "is_active": user.is_active,
                "source": "django_user",
                "relevance_score": score,
                "highlighted_text": highlight_search_match(search_term, f"{user.first_name} {user.last_name}".strip() or user.username),
                "suggestion_text": format_suggestion_text(user.username, user.email, f"{user.first_name} {user.last_name}".strip()),
                "last_activity": recent_activity,
                "profile_image": None,
                "user_type": "Staff" if user.is_staff else "User"
            }
            all_suggestions.append(suggestion)
        
        # Search in Staff model with advanced matching
        staff_members = Staff.objects.filter(
            Q(firstname__icontains=search_term) |
            Q(lastname__icontains=search_term) |
            Q(email__icontains=search_term) |
            Q(staffid__icontains=search_term)
        )[:limit * 2]
        
        for staff in staff_members:
            # Check if already exists from Django users
            existing = next((s for s in all_suggestions if s["email"] == staff.email), None)
            
            if not existing:
                # Calculate relevance score
                score = calculate_search_relevance(search_term, staff.email.split('@')[0], 
                                                 staff.email, staff.firstname, staff.lastname)
                
                # Get recent activity
                recent_activity = None
                if include_activity:
                    recent_activity = get_user_recent_activity(staff.email)
                
                suggestion = {
                    "user_id": f"staff_{staff.id}",
                    "username": staff.email.split('@')[0],
                    "email": staff.email,
                    "display_name": f"{staff.firstname} {staff.lastname}",
                    "first_name": staff.firstname,
                    "last_name": staff.lastname,
                    "staff_id": staff.staffid,
                    "is_active": True,
                    "source": "staff",
                    "relevance_score": score,
                    "highlighted_text": highlight_search_match(search_term, f"{staff.firstname} {staff.lastname}"),
                    "suggestion_text": format_suggestion_text(staff.email.split('@')[0], staff.email, f"{staff.firstname} {staff.lastname}"),
                    "last_activity": recent_activity,
                    "profile_image": staff.profile_image.url if staff.profile_image else None,
                    "user_type": "Staff"
                }
                all_suggestions.append(suggestion)
            else:
                # Update existing with staff info
                existing["staff_id"] = staff.staffid
                existing["display_name"] = f"{staff.firstname} {staff.lastname}"
                existing["profile_image"] = staff.profile_image.url if staff.profile_image else None
        
        # Sort by relevance score (higher is better)
        all_suggestions.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Limit final results
        final_suggestions = all_suggestions[:limit]
        
        # Add search metadata
        search_metadata = {
            "search_term": search_term,
            "total_found": len(final_suggestions),
            "search_time": "instant",
            "suggestions_available": len(all_suggestions),
            "search_in": ["names", "emails", "usernames", "staff_ids"]
        }
        
        return api_response(
            success=True,
            message=f"Found {len(final_suggestions)} suggestions for '{search_term}'",
            data={
                "suggestions": final_suggestions,
                "metadata": search_metadata,
                "search_tips": generate_search_tips(search_term)
            }
        )
        
    except Exception as e:
        logger.error(f"User suggestions API error: {str(e)}")
        return api_response(
            success=False,
            message="Error getting suggestions",
            status_code=500
        )


# ==================== S3 USER SUGGESTIONS API ====================
@csrf_exempt
@require_http_methods(["GET"])
def s3_user_suggestions_api(request):
    """
    S3 User Suggestions API for Employee Search
    
    GET: /api/users/s3-suggestions/?q={query}&limit=10
    
    Features:
    - Employee search with S3 screenshot count
    - Recent activity detection
    - Formatted suggestion text
    - Staff ID inclusion
    """
    try:
        search_query = request.GET.get('q', '').strip()
        limit = int(request.GET.get('limit', 10))
        
        if len(search_query) < 1:
            return api_response(
                success=True,
                message="Enter at least 1 character to search",
                data={
                    "suggestions": []
                }
            )
        
        suggestions = []
        
        # Search in Staff model first (primary source)
        staff_members = Staff.objects.filter(
            Q(firstname__icontains=search_query) |
            Q(lastname__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(staffid__icontains=search_query)
        )[:limit * 2]  # Get more to have better selection
        
        # Initialize S3 client for screenshot counting
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"  # Use correct bucket name
        except Exception as e:
            logger.warning(f"Could not initialize S3 client: {str(e)}")
            s3_client = None
            bucket_name = None
        
        for staff in staff_members:
            # Get screenshot count from S3
            screenshot_count = 0
            has_recent_activity = False
            
            if s3_client and bucket_name:
                try:
                    # Count screenshots for this user (use correct email format - only replace @)
                    email_prefix = staff.email.replace('@', '_at_')  # Don't replace dots
                    response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        Prefix=f"screenshots/{email_prefix}/",
                        MaxKeys=1000
                    )
                    
                    if 'Contents' in response:
                        screenshot_count = len([obj for obj in response['Contents'] 
                                              if not obj['Key'].endswith('/')])
                        
                        # Check for recent activity (last 7 days)
                        recent_cutoff = datetime.now() - timedelta(days=7)
                        for obj in response['Contents']:
                            if obj['LastModified'].replace(tzinfo=None) > recent_cutoff:
                                has_recent_activity = True
                                break
                                
                except Exception as e:
                    logger.warning(f"Error counting screenshots for {staff.email}: {str(e)}")
            
            # Format display name
            display_name = f"{staff.firstname} {staff.lastname}".strip()
            if not display_name:
                display_name = staff.email.split('@')[0]
            
            # Create suggestion in the exact format requested
            suggestion = {
                "display_name": display_name,
                "email": staff.email,
                "username": staff.email.split('@')[0],
                "staff_id": staff.staffid,
                "screenshot_count": screenshot_count,
                "suggestion_text": f"{display_name} ({staff.email})",
                "search_value": staff.email,
                "has_recent_activity": has_recent_activity
            }
            
            suggestions.append(suggestion)
        
        # Search in Django User model for additional results
        django_users = User.objects.filter(
            Q(username__icontains=search_query) | 
            Q(email__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query)
        ).exclude(
            email__in=[s["email"] for s in suggestions]  # Exclude already found staff
        )[:limit]
        
        for user in django_users:
            # Get screenshot count from S3
            screenshot_count = 0
            has_recent_activity = False
            
            if s3_client and bucket_name and user.email:
                try:
                    email_prefix = user.email.replace('@', '_at_')  # Don't replace dots
                    response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        Prefix=f"screenshots/{email_prefix}/",
                        MaxKeys=1000
                    )
                    
                    if 'Contents' in response:
                        screenshot_count = len([obj for obj in response['Contents'] 
                                              if not obj['Key'].endswith('/')])
                        
                        # Check for recent activity
                        recent_cutoff = datetime.now() - timedelta(days=7)
                        for obj in response['Contents']:
                            if obj['LastModified'].replace(tzinfo=None) > recent_cutoff:
                                has_recent_activity = True
                                break
                                
                except Exception as e:
                    logger.warning(f"Error counting screenshots for {user.email}: {str(e)}")
            
            # Format display name
            display_name = f"{user.first_name} {user.last_name}".strip()
            if not display_name:
                display_name = user.username
            
            # Create suggestion
            suggestion = {
                "display_name": display_name,
                "email": user.email,
                "username": user.username,
                "staff_id": "N/A",
                "screenshot_count": screenshot_count,
                "suggestion_text": f"{display_name} ({user.email})",
                "search_value": user.email,
                "has_recent_activity": has_recent_activity
            }
            
            suggestions.append(suggestion)
        
        # Sort by screenshot count (descending) and recent activity
        suggestions.sort(key=lambda x: (x["has_recent_activity"], x["screenshot_count"]), reverse=True)
        
        # If no suggestions found in database OR all suggestions have 0 screenshots, search directly in S3
        has_screenshots = any(s["screenshot_count"] > 0 for s in suggestions)
        should_search_s3 = (not suggestions or (len(suggestions) < 3 and not has_screenshots))
        
        if should_search_s3 and s3_client and bucket_name:
            try:
                logger.info(f"🔍 S3 SEARCH TRIGGERED for '{search_query}' (found {len(suggestions)} DB results with screenshots: {has_screenshots})...")
                print(f"🔍 S3 SEARCH: Query='{search_query}', Bucket='{bucket_name}', DB_results={len(suggestions)}, Has_screenshots={has_screenshots}")
                
                # List all employee folders in S3
                s3_response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix='screenshots/',
                    Delimiter='/',
                    MaxKeys=1000
                )
                
                print(f"📁 S3 Response: CommonPrefixes={len(s3_response.get('CommonPrefixes', []))}, Contents={len(s3_response.get('Contents', []))}")
                
                if 'CommonPrefixes' in s3_response:
                    print(f"📂 Processing {len(s3_response['CommonPrefixes'])} S3 folders...")
                    for prefix_info in s3_response['CommonPrefixes']:
                        folder_name = prefix_info['Prefix'].replace('screenshots/', '').rstrip('/')
                        print(f"   📁 Checking folder: {folder_name}")
                        
                        # Convert S3 folder name back to email format
                        if '_at_' in folder_name:
                            email = folder_name.replace('_at_', '@')
                            print(f"      ➜ Converted to email: {email}")
                            
                            # Check if this email matches the search query
                            query_match = (search_query.lower() in email.lower() or 
                                         search_query.lower() in folder_name.lower())
                            print(f"      ➜ Query match for '{search_query}': {query_match}")
                            
                            if query_match:
                                
                                # Skip if we already have this email from database
                                existing_emails = [s["email"] for s in suggestions]
                                if email in existing_emails:
                                    continue
                                
                                # Get screenshot count for this S3 folder
                                screenshot_count = 0
                                try:
                                    folder_response = s3_client.list_objects_v2(
                                        Bucket=bucket_name,
                                        Prefix=f'screenshots/{folder_name}/',
                                        MaxKeys=1000
                                    )
                                    screenshot_count = len([obj for obj in folder_response.get('Contents', []) 
                                                         if not obj['Key'].endswith('/')])
                                except Exception as e:
                                    logger.warning(f"Error counting screenshots for S3 folder {folder_name}: {str(e)}")
                                
                                # Create suggestion from S3 data
                                username = email.split('@')[0]
                                display_name = username.replace('_', ' ').replace('.', ' ').title()
                                
                                suggestion = {
                                    "display_name": display_name,
                                    "email": email,
                                    "username": username,
                                    "staff_id": "S3-Only",
                                    "screenshot_count": screenshot_count,
                                    "suggestion_text": f"{display_name} ({email}) [S3]",
                                    "search_value": email,
                                    "has_recent_activity": False
                                }
                                
                                suggestions.append(suggestion)
                                
                                # Limit S3 results
                                if len(suggestions) >= limit:
                                    break
                                    
            except Exception as e:
                logger.warning(f"Error searching S3 directly: {str(e)}")
        
        # Sort final results
        suggestions.sort(key=lambda x: (x["has_recent_activity"], x["screenshot_count"]), reverse=True)
        
        # Limit final results
        final_suggestions = suggestions[:limit]
        
        return api_response(
            success=True,
            message=f"Found {len(final_suggestions)} suggestions",
            data={
                "suggestions": final_suggestions
            }
        )
        
    except Exception as e:
        logger.error(f"S3 User suggestions API error: {str(e)}")
        return api_response(
            success=False,
            message="Error getting suggestions",
            status_code=500
        )


# ==================== EMPLOYEE TASK FOLDERS API (Level 2) ====================
@csrf_exempt
@require_http_methods(["GET"])
def employee_task_folders_api(request, employee_email):
    """
    Employee Task Folders API for Level 2
    
    GET: /api/screenshots/employee/{employee_email}/folders/
    
    Features:
    - Get all task folders for a specific employee
    - Folder statistics (screenshot count, date range)
    - Recent activity indicators
    - Folder metadata and organization
    """
    try:
        # Validate email format
        if not validate_email_format(employee_email):
            return api_response(
                success=False,
                message="Invalid email format",
                status_code=400
            )
        
        # Initialize S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"  # Use correct bucket name
        except Exception as e:
            logger.error(f"Could not initialize S3 client: {str(e)}")
            return api_response(
                success=False,
                message="S3 configuration error",
                status_code=500
            )
        
        # Convert email to S3 folder format (matching existing working format)
        email_prefix = employee_email.replace('@', '_at_')  # Don't replace dots
        s3_prefix = f"screenshots/{email_prefix}/"
        
        logger.info(f"Fetching task folders for {employee_email} from S3 prefix: {s3_prefix}")
        
        # Get all objects under the employee's screenshot folder
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=s3_prefix,
                Delimiter='/'  # This helps us get folders
            )
        except Exception as e:
            logger.error(f"Error accessing S3 for {employee_email}: {str(e)}")
            return api_response(
                success=False,
                message="Error accessing screenshot data",
                status_code=500
            )
        
        # Parse folders from S3 response
        task_folders = []
        
        # Get date folders (CommonPrefixes)
        if 'CommonPrefixes' in response:
            for prefix_info in response['CommonPrefixes']:
                folder_path = prefix_info['Prefix']
                # Extract date folder name (e.g., "2025-01-15/")
                folder_name = folder_path.replace(s3_prefix, '').rstrip('/')
                
                if folder_name:  # Make sure it's not empty
                    # Get detailed folder information
                    folder_stats = get_folder_statistics(s3_client, bucket_name, folder_path)
                    
                    # Parse date if it's a date folder
                    folder_date = None
                    is_date_folder = False
                    try:
                        folder_date = datetime.strptime(folder_name, '%Y-%m-%d')
                        is_date_folder = True
                    except ValueError:
                        # Not a date folder, might be a task name
                        pass
                    
                    folder_info = {
                        "folder_name": folder_name,
                        "folder_path": folder_path,
                        "is_date_folder": is_date_folder,
                        "date": folder_date.isoformat() if folder_date else None,
                        "display_name": format_folder_display_name(folder_name, folder_date),
                        "screenshot_count": folder_stats["screenshot_count"],
                        "total_size_mb": folder_stats["total_size_mb"],
                        "last_modified": folder_stats["last_modified"],
                        "has_recent_activity": folder_stats["has_recent_activity"],
                        "file_types": folder_stats["file_types"],
                        "first_screenshot": folder_stats["first_screenshot"],
                        "last_screenshot": folder_stats["last_screenshot"]
                    }
                    
                    task_folders.append(folder_info)
        
        # Also check for files directly in the employee folder (not in subfolders)
        direct_files = []
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                # Check if it's a direct file (not in a subfolder)
                if key.count('/') == 2 and key != s3_prefix:  # screenshots/email/ + filename
                    direct_files.append({
                        "file_name": key.split('/')[-1],
                        "size_mb": round(obj.get('Size', 0) / (1024 * 1024), 2),
                        "last_modified": obj.get('LastModified', '').isoformat() if obj.get('LastModified') else None
                    })
        
        # Sort folders by date (newest first) and activity
        task_folders.sort(key=lambda x: (
            x["has_recent_activity"],
            x["date"] if x["date"] else "1900-01-01",
            x["screenshot_count"]
        ), reverse=True)
        
        # Calculate summary statistics
        total_screenshots = sum(folder["screenshot_count"] for folder in task_folders)
        total_size_mb = sum(folder["total_size_mb"] for folder in task_folders)
        active_folders = sum(1 for folder in task_folders if folder["has_recent_activity"])
        
        # Get date range
        date_folders = [f for f in task_folders if f["is_date_folder"]]
        date_range = {}
        if date_folders:
            dates = [f["date"] for f in date_folders if f["date"]]
            if dates:
                dates.sort()
                date_range = {
                    "start": dates[0],
                    "end": dates[-1]
                }
        
        # Prepare response data
        response_data = {
            "employee_email": employee_email,
            "task_folders": task_folders,
            "direct_files": direct_files,
            "summary": {
                "total_folders": len(task_folders),
                "total_screenshots": total_screenshots,
                "total_size_mb": round(total_size_mb, 2),
                "active_folders": active_folders,
                "date_range": date_range,
                "has_direct_files": len(direct_files) > 0
            },
            "folder_types": {
                "date_folders": len([f for f in task_folders if f["is_date_folder"]]),
                "task_folders": len([f for f in task_folders if not f["is_date_folder"]])
            }
        }
        
        return api_response(
            success=True,
            message=f"Found {len(task_folders)} task folders for {employee_email}",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Employee task folders API error: {str(e)}")
        return api_response(
            success=False,
            message="Error retrieving task folders",
            status_code=500
        )


def get_folder_statistics(s3_client, bucket_name, folder_path):
    """Get detailed statistics for a folder"""
    try:
        # List all files in the folder
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=folder_path,
            MaxKeys=1000
        )
        
        screenshot_count = 0
        total_size = 0
        file_types = set()
        last_modified = None
        first_screenshot = None
        last_screenshot = None
        
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                size = obj.get('Size', 0)
                modified = obj.get('LastModified')
                
                # Skip folder markers
                if key.endswith('/'):
                    continue
                
                screenshot_count += 1
                total_size += size
                
                # Track file types
                file_ext = key.split('.')[-1].lower() if '.' in key else 'unknown'
                file_types.add(file_ext)
                
                # Track modification times
                if modified:
                    if not last_modified or modified > last_modified:
                        last_modified = modified
                        last_screenshot = key.split('/')[-1]
                    
                    if not first_screenshot:
                        first_screenshot = key.split('/')[-1]
        
        # Check for recent activity (last 7 days)
        has_recent_activity = False
        if last_modified:
            recent_cutoff = datetime.now() - timedelta(days=7)
            has_recent_activity = last_modified.replace(tzinfo=None) > recent_cutoff
        
        return {
            "screenshot_count": screenshot_count,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "last_modified": last_modified.isoformat() if last_modified else None,
            "has_recent_activity": has_recent_activity,
            "file_types": list(file_types),
            "first_screenshot": first_screenshot,
            "last_screenshot": last_screenshot
        }
        
    except Exception as e:
        logger.error(f"Error getting folder statistics for {folder_path}: {str(e)}")
        return {
            "screenshot_count": 0,
            "total_size_mb": 0,
            "last_modified": None,
            "has_recent_activity": False,
            "file_types": [],
            "first_screenshot": None,
            "last_screenshot": None
        }


def format_folder_display_name(folder_name, folder_date):
    """Format folder name for display"""
    if folder_date:
        # Format date folders nicely
        weekday = folder_date.strftime('%A')
        formatted_date = folder_date.strftime('%B %d, %Y')
        return f"{weekday}, {formatted_date}"
    else:
        # For non-date folders, capitalize and format
        return folder_name.replace('_', ' ').replace('-', ' ').title()


# ==================== EMPLOYEE FOLDER SCREENSHOTS API (Level 3) ====================
@csrf_exempt
@require_http_methods(["GET"])
def employee_folder_screenshots_api(request, employee_email, folder_name):
    """
    Employee Folder Screenshots API for Level 3
    
    GET: /api/screenshots/employee/{employee_email}/folder/{folder_name}/
    
    Features:
    - Get all screenshots in a specific folder for an employee
    - Pagination support
    - Screenshot metadata and analysis
    - Presigned URLs for secure access
    - Application and window title detection
    """
    try:
        # Validate email format
        if not validate_email_format(employee_email):
            return api_response(
                success=False,
                message="Invalid email format",
                status_code=400
            )
        
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        offset = (page - 1) * limit
        
        # Validate pagination parameters
        if page < 1:
            page = 1
            offset = 0
        if limit < 1 or limit > 100:
            limit = 50
        
        # Initialize S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"  # Use correct bucket name
        except Exception as e:
            logger.error(f"Could not initialize S3 client: {str(e)}")
            return api_response(
                success=False,
                message="S3 configuration error",
                status_code=500
            )
        
        # Convert email to S3 folder format (matching existing working format)
        email_prefix = employee_email.replace('@', '_at_')  # Don't replace dots
        s3_folder_path = f"screenshots/{email_prefix}/{folder_name}/"
        
        logger.info(f"Fetching screenshots for {employee_email} from folder: {s3_folder_path}")
        
        # Use optimized S3 pagination approach
        screenshots = []
        total_count = 0
        continuation_token = None
        items_to_skip = (page - 1) * limit
        items_collected = 0
        
        logger.info(f"Using optimized pagination: page={page}, limit={limit}, skip={items_to_skip}")
        
        # Fetch screenshots using S3 pagination
        while True:
            list_params = {
                'Bucket': bucket_name,
                'Prefix': s3_folder_path,
                'MaxKeys': 1000  # Larger chunks for counting
            }
            
            if continuation_token:
                list_params['ContinuationToken'] = continuation_token
            
            try:
                response = s3_client.list_objects_v2(**list_params)
            except Exception as e:
                logger.error(f"S3 list_objects_v2 error: {str(e)}")
                break
            
            if 'Contents' not in response:
                break
            
            # Process this batch
            for obj in response['Contents']:
                key = obj['Key']
                
                # Skip folder markers and non-image files
                if key.endswith('/') or not is_image_file(key):
                    continue
                
                total_count += 1
                
                # Skip items until we reach the page we want
                if total_count <= items_to_skip:
                    continue
                
                # Collect items for current page
                if items_collected < limit:
                    # Extract filename
                    filename = key.split('/')[-1]
                    
                    # Parse screenshot metadata from filename
                    metadata = parse_screenshot_metadata(filename, key, obj)
                    
                    # Generate presigned URL for image access
                    try:
                        presigned_url = s3_client.generate_presigned_url(
                            'get_object',
                            Params={'Bucket': bucket_name, 'Key': key},
                            ExpiresIn=7200  # 2 hours
                        )
                    except Exception as e:
                        logger.warning(f"Could not generate presigned URL for {key}: {str(e)}")
                        # Fallback to direct URL
                        presigned_url = f"https://{bucket_name}.s3.eu-north-1.amazonaws.com/{key}"
                    
                    # Create screenshot object
                    screenshot_info = {
                        "id": generate_screenshot_id(key),
                        "filename": filename,
                        "s3_key": key,
                        "presigned_url": presigned_url,
                        "timestamp": metadata["timestamp"],
                        "time_display": metadata["time_display"],
                        "application": metadata["application"],
                        "window_title": metadata["window_title"],
                        "size_bytes": obj.get('Size', 0),
                        "size_mb": round(obj.get('Size', 0) / (1024 * 1024), 2),
                        "last_modified": obj.get('LastModified').isoformat() if obj.get('LastModified') else None,
                        "file_extension": os.path.splitext(filename)[1].lower(),
                        "thumbnail_url": generate_thumbnail_url(s3_client, bucket_name, key)
                    }
                    
                    screenshots.append(screenshot_info)
                    items_collected += 1
                
                # If we have enough items for this page, we can stop
                if items_collected >= limit:
                    break
            
            # Check if we need to continue
            if not response.get('IsTruncated', False) or items_collected >= limit:
                break
            
            continuation_token = response.get('NextContinuationToken')
            
            # Log progress
            if total_count % 1000 == 0:
                logger.info(f"Processed {total_count} items so far...")
        
        logger.info(f"Total screenshots found: {total_count}, Returned: {len(screenshots)}")
        
        # Note: screenshots are already in the order we want (we don't need to sort all of them)
        # The S3 listing is already chronological by key name
        
        # Calculate pagination
        total_pages = max(1, (total_count + limit - 1) // limit)  # Ceiling division
        
        # Get employee name from Staff model
        employee_name = get_employee_display_name(employee_email)
        
        # Parse folder date if it's a date folder
        folder_date = None
        try:
            folder_date = datetime.strptime(folder_name, '%Y-%m-%d')
        except ValueError:
            pass
        
        # Prepare response data
        response_data = {
            "folder_info": {
                "folder_name": folder_name,
                "employee_name": employee_name,
                "employee_email": employee_email,
                "folder_display_name": format_folder_display_name(folder_name, folder_date),
                "is_date_folder": folder_date is not None,
                "folder_date": folder_date.isoformat() if folder_date else None
            },
            "screenshots": screenshots,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_screenshots": total_count,
                "limit": limit,
                "offset": offset,
                "has_next": page < total_pages,
                "has_previous": page > 1,
                "next_page": page + 1 if page < total_pages else None,
                "previous_page": page - 1 if page > 1 else None
            }
        }
        
        return api_response(
            success=True,
            message=f"Found {total_count} screenshots in {folder_name} for {employee_email}",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Employee folder screenshots API error: {str(e)}")
        return api_response(
            success=False,
            message="Error retrieving folder screenshots",
            status_code=500
        )


def is_image_file(filename):
    """Check if the file is an image"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'}
    ext = os.path.splitext(filename.lower())[1]
    return ext in image_extensions


def parse_screenshot_metadata(filename, s3_key, s3_obj):
    """Parse screenshot metadata from filename and S3 object"""
    try:
        # Extract timestamp from filename (assumes format like: 2025-01-15_09-30-45.webp)
        timestamp_str = None
        application = "Unknown"
        window_title = "Unknown"
        
        # Try to parse timestamp from filename
        # Format examples: 2025-01-15_09-30-45.webp, screenshot_09-30-45.png
        import re
        
        # Pattern for date_time format
        date_time_pattern = r'(\d{4}-\d{2}-\d{2})[_-](\d{2})[_-](\d{2})[_-](\d{2})'
        match = re.search(date_time_pattern, filename)
        
        if match:
            date_part = match.group(1)
            hour = match.group(2)
            minute = match.group(3)
            second = match.group(4)
            timestamp_str = f"{date_part}T{hour}:{minute}:{second}Z"
        else:
            # Try time-only pattern: 09-30-45
            time_pattern = r'(\d{2})[_-](\d{2})[_-](\d{2})'
            time_match = re.search(time_pattern, filename)
            if time_match:
                hour = time_match.group(1)
                minute = time_match.group(2)
                second = time_match.group(3)
                
                # Get date from folder path
                folder_parts = s3_key.split('/')
                if len(folder_parts) >= 3:
                    folder_date = folder_parts[2]  # Assuming screenshots/email/date/file.png
                    try:
                        datetime.strptime(folder_date, '%Y-%m-%d')  # Validate date format
                        timestamp_str = f"{folder_date}T{hour}:{minute}:{second}Z"
                    except ValueError:
                        pass
        
        # If still no timestamp, use S3 last modified date
        if not timestamp_str:
            last_modified = s3_obj.get('LastModified')
            if last_modified:
                timestamp_str = last_modified.isoformat()
            else:
                timestamp_str = datetime.now().isoformat()
        
        # Generate time display (human readable)
        try:
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            time_display = dt.strftime('%I:%M %p')  # 09:30 AM format
        except:
            time_display = "Unknown"
        
        # Try to extract application/window info from filename or metadata
        # This would be enhanced based on your actual screenshot naming convention
        if 'vscode' in filename.lower() or 'code' in filename.lower():
            application = "Visual Studio Code"
            window_title = extract_window_title_from_filename(filename)
        elif 'chrome' in filename.lower() or 'browser' in filename.lower():
            application = "Google Chrome"
            window_title = extract_window_title_from_filename(filename)
        elif 'teams' in filename.lower():
            application = "Microsoft Teams"
        elif 'outlook' in filename.lower():
            application = "Microsoft Outlook"
        else:
            # Try to extract from filename patterns
            application = extract_application_from_filename(filename)
            window_title = extract_window_title_from_filename(filename)
        
        return {
            "timestamp": timestamp_str,
            "application": application,
            "window_title": window_title,
            "time_display": time_display
        }
        
    except Exception as e:
        logger.warning(f"Error parsing screenshot metadata for {filename}: {str(e)}")
        return {
            "timestamp": datetime.now().isoformat(),
            "application": "Unknown",
            "window_title": "Unknown", 
            "time_display": "Unknown"
        }


def generate_screenshot_id(s3_key):
    """Generate a unique ID for the screenshot"""
    import hashlib
    return f"screenshot_{hashlib.md5(s3_key.encode()).hexdigest()[:12]}"


def generate_thumbnail_url(s3_client, bucket_name, key):
    """Generate thumbnail URL (placeholder implementation)"""
    try:
        # Check if thumbnail exists
        thumb_key = key.replace('.webp', '_thumb.jpg').replace('.png', '_thumb.jpg')
        
        # Try to generate presigned URL for thumbnail
        try:
            s3_client.head_object(Bucket=bucket_name, Key=thumb_key)
            return generate_presigned_url(s3_client, bucket_name, thumb_key, expiration=3600)
        except:
            # Thumbnail doesn't exist, return None or generate on-the-fly URL
            return None
            
    except Exception as e:
        logger.warning(f"Error generating thumbnail URL for {key}: {str(e)}")
        return None


def extract_application_from_filename(filename):
    """Extract application name from filename patterns"""
    filename_lower = filename.lower()
    
    app_patterns = {
        'vscode': 'Visual Studio Code',
        'code': 'Visual Studio Code', 
        'chrome': 'Google Chrome',
        'firefox': 'Mozilla Firefox',
        'edge': 'Microsoft Edge',
        'teams': 'Microsoft Teams',
        'outlook': 'Microsoft Outlook',
        'word': 'Microsoft Word',
        'excel': 'Microsoft Excel',
        'powerpoint': 'Microsoft PowerPoint',
        'notepad': 'Notepad',
        'calculator': 'Calculator',
        'explorer': 'File Explorer'
    }
    
    for pattern, app_name in app_patterns.items():
        if pattern in filename_lower:
            return app_name
    
    return "Unknown Application"


def extract_window_title_from_filename(filename):
    """Extract window title from filename if encoded"""
    # This would be customized based on your screenshot naming convention
    # Example: if filename contains encoded window title
    
    # Remove extension and timestamp parts
    name_parts = filename.replace('.webp', '').replace('.png', '').replace('.jpg', '')
    
    # Look for patterns that might indicate window titles
    if 'ActivityStream.jsx' in filename:
        return "ActivityStream.jsx - MyProject"
    elif 'dashboard' in filename.lower():
        return "Dashboard - Admin Panel"
    elif 'api' in filename.lower():
        return "API Development"
    
    # Default extraction logic
    parts = name_parts.split('_')
    if len(parts) > 2:
        # Try to reconstruct title from parts
        title_parts = [part for part in parts if not re.match(r'\d{2}-\d{2}-\d{2}', part)]
        if title_parts:
            return ' '.join(title_parts).title()
    
    return "Unknown Window"


def get_employee_display_name(email):
    """Get employee display name from Staff model"""
    try:
        from .models import Staff
        staff = Staff.objects.filter(email=email).first()
        if staff:
            return f"{staff.firstname} {staff.lastname}"
        
        # Fallback to Django User model
        from django.contrib.auth.models import User
        user = User.objects.filter(email=email).first()
        if user:
            full_name = f"{user.first_name} {user.last_name}".strip()
            return full_name if full_name else user.username
        
        # Last fallback - extract from email
        return email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
        
    except Exception as e:
        logger.warning(f"Error getting employee name for {email}: {str(e)}")
        return email.split('@')[0].replace('.', ' ').replace('_', ' ').title()


def calculate_search_relevance(search_term, username, email, first_name, last_name):
    """Calculate relevance score for search results (higher = more relevant)"""
    score = 0
    search_lower = search_term.lower()
    
    # Full name match
    full_name = f"{first_name} {last_name}".strip().lower()
    
    # Exact matches get highest scores
    if search_lower == username.lower():
        score += 100
    elif search_lower == email.lower():
        score += 95
    elif search_lower == full_name:
        score += 90
    elif search_lower == first_name.lower():
        score += 85
    elif search_lower == last_name.lower():
        score += 85
    
    # Starts with matches
    elif username.lower().startswith(search_lower):
        score += 70
    elif email.lower().startswith(search_lower):
        score += 65
    elif full_name.startswith(search_lower):
        score += 75
    elif first_name.lower().startswith(search_lower):
        score += 80
    elif last_name.lower().startswith(search_lower):
        score += 80
    
    # Contains matches
    elif search_lower in username.lower():
        score += 40
    elif search_lower in email.lower():
        score += 35
    elif search_lower in full_name:
        score += 50
    elif search_lower in first_name.lower():
        score += 60
    elif search_lower in last_name.lower():
        score += 60
    
    # Bonus for shorter names (more specific)
    if len(full_name) < 20:
        score += 5
    
    # Bonus for recent activity
    # This could be enhanced with actual activity data
    score += 10  # Base activity bonus
    
    return score


def highlight_search_match(search_term, text):
    """Highlight the matching part of the text for display"""
    if not search_term or not text:
        return text
    
    import re
    # Create a case-insensitive pattern
    pattern = re.compile(re.escape(search_term), re.IGNORECASE)
    # Replace with highlighted version
    highlighted = pattern.sub(f"<mark>{search_term}</mark>", text)
    return highlighted


def format_suggestion_text(username, email, display_name):
    """Format the suggestion text for display"""
    if display_name and display_name != username:
        return f"{display_name} ({username}) - {email}"
    else:
        return f"{username} - {email}"


def get_user_recent_activity(email):
    """Get user's recent activity information"""
    try:
        # Get the most recent log entry
        recent_log = User_Logs.objects.filter(email=email).order_by('-id').first()
        
        if recent_log:
            # Calculate time ago
            try:
                # Assuming date is in string format, you might need to adjust this
                log_date = datetime.strptime(recent_log.date, '%Y-%m-%d')
                now = datetime.now()
                diff = now - log_date
                
                if diff.days == 0:
                    return "Active today"
                elif diff.days == 1:
                    return "Active yesterday"
                elif diff.days <= 7:
                    return f"Active {diff.days} days ago"
                else:
                    return f"Active {diff.days} days ago"
            except:
                return "Recent activity"
        
        return "No recent activity"
        
    except Exception as e:
        logger.error(f"Error getting user activity for {email}: {str(e)}")
        return "Activity unknown"


def generate_search_tips(search_term):
    """Generate helpful search tips based on current search"""
    tips = []
    
    if len(search_term) < 3:
        tips.append("Try typing more characters for better results")
    
    if '@' in search_term:
        tips.append("Searching by email - results will show exact matches")
    else:
        tips.append("Try searching by email for exact matches")
    
    if ' ' in search_term:
        tips.append("Searching full names - great for finding specific people")
    else:
        tips.append("Try typing first and last name for better results")
    
    tips.append("Results are sorted by relevance")
    
    return tips


# ==================== HELPER FUNCTIONS ====================
def get_user_log_statistics(s3_client, bucket_name, folder_name):
    """Get detailed statistics for a user's logs"""
    try:
        # Count files and folders in user's log directory
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f"logs/{folder_name}/",
            MaxKeys=1000
        )
        
        total_files = 0
        total_folders = set()
        program_summary_files = 0
        dates = []
        total_size = 0
        
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                total_files += 1
                total_size += obj.get('Size', 0)
                
                # Extract date folder
                parts = key.split('/')
                if len(parts) >= 3:
                    date_folder = parts[2]
                    total_folders.add(date_folder)
                    
                    # Try to parse date
                    try:
                        date_obj = datetime.strptime(date_folder, '%Y-%m-%d')
                        dates.append(date_obj)
                    except:
                        pass
                
                # Count program summary files
                if 'program_summary' in key.lower():
                    program_summary_files += 1
        
        # Calculate date range
        date_range = {}
        if dates:
            dates.sort()
            date_range = {
                "start": dates[0].isoformat(),
                "end": dates[-1].isoformat()
            }
        
        return {
            "total_files": total_files,
            "total_folders": len(total_folders),
            "program_summary_files": program_summary_files,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "last_activity": dates[-1].isoformat() if dates else None,
            "date_range": date_range,
            "date_folders": sorted(list(total_folders))
        }
        
    except Exception as e:
        logger.error(f"Error getting log statistics for {folder_name}: {str(e)}")
        return {
            "total_files": 0,
            "total_folders": 0,
            "program_summary_files": 0,
            "total_size_bytes": 0,
            "total_size_mb": 0,
            "last_activity": None,
            "date_range": {},
            "date_folders": [],
            "error": str(e)
        }


def get_mock_users_fallback(include_stats):
    """Fallback mock data if S3 access fails"""
    mock_stats = {
        "total_files": 45,
        "total_folders": 12,
        "program_summary_files": 8,
        "total_size_bytes": 1024000,
        "total_size_mb": 1.02,
        "last_activity": "2025-07-08T10:30:00",
        "date_range": {
            "start": "2025-01-01T08:00:00",
            "end": "2025-07-08T10:30:00"
        },
        "date_folders": ["2025-01-01", "2025-01-02", "2025-01-03"]
    } if include_stats else None
    
    return [
        {
            "email": "haseebcodejourney@gmail.com",
            "username": "haseebcodejourney",
            "display_name": "Haseeb Code Journey",
            "staff_id": "HAS001",
            "profile_image": None,
            "source": "S3_Logs_Fallback",
            "folder_name": "haseebcodejourney_at_gmail.com",
            "has_logs": True,
            "log_statistics": mock_stats
        },
        {
            "email": "amirishaque67@gmail.com",
            "username": "amirishaque67",
            "display_name": "Amir Developer",
            "staff_id": "AMI001",
            "profile_image": None,
            "source": "S3_Logs_Fallback",
            "folder_name": "amirishaque67_at_gmail.com",
            "has_logs": True,
            "log_statistics": mock_stats
        }
    ]


# ==================== LOGS USER SEARCH API ====================
@csrf_exempt
@require_http_methods(["GET"])
def logs_users_search_api(request):
    """
    Logs Users Search API - Search users available in S3 logs folder
    
    GET: /api/logs/search/?search=<name>&limit=<number>
    
    Query parameters:
    - search: Search term (partial name or email) - optional (if empty, shows all users)
    - limit: Number of users to return (default: 20, max: 100)
    - include_stats: Include log statistics (default: true)
    """
    try:
        search_term = request.GET.get('search', '').strip()
        limit = min(int(request.GET.get('limit', 20)), 100)
        include_stats = request.GET.get('include_stats', 'true').lower() == 'true'
        
        print(f"🔍 Logs Users Search API called:")
        print(f"   Search: '{search_term}'")
        print(f"   Limit: {limit}")
        print(f"   Include Stats: {include_stats}")
        
        # Get S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
        except Exception as e:
            logger.error(f"Failed to get S3 client: {str(e)}")
            # Use fallback data if S3 is not accessible
            return api_response(
                success=True,
                message="Using fallback data (S3 connection failed)",
                data={
                    "users": get_mock_users_fallback(include_stats),
                    "metadata": {
                        "search_term": search_term or "All users",
                        "total_found": 1,
                        "source": "Fallback_Data",
                        "note": "S3 connection failed, using mock data"
                    }
                }
            )
        
        # Get all users from S3 logs folder
        all_users = []
        
        try:
            print(f"📡 Connecting to S3 bucket: {bucket_name}")
            
            # List all folders in the logs/ directory
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix="logs/",
                Delimiter="/"
            )
            
            print(f"📂 S3 Response received, processing folders...")
            
            if 'CommonPrefixes' in response:
                print(f"📁 Found {len(response['CommonPrefixes'])} folders in logs/")
                
                for prefix in response['CommonPrefixes']:
                    folder_name = prefix['Prefix'].replace('logs/', '').rstrip('/')
                    
                    if folder_name and '_at_' in folder_name:
                        # Convert folder name back to email
                        email = folder_name.replace('_at_', '@')
                        print(f"   Processing user: {email}")
                        
                        # Get user display name from Staff model if available
                        try:
                            staff = Staff.objects.get(email=email)
                            display_name = f"{staff.firstname} {staff.lastname}"
                            staff_id = staff.staffid
                            profile_image = staff.profile_image.url if staff.profile_image else None
                        except Staff.DoesNotExist:
                            # Create display name from email
                            username = email.split('@')[0]
                            display_name = username.replace('_', ' ').replace('.', ' ').title()
                            staff_id = username.upper()[:6]
                            profile_image = None
                        
                        # Get log statistics if requested
                        log_stats = None;
                        if include_stats:
                            log_stats = get_user_log_statistics(s3_client, bucket_name, folder_name)
                        
                        user_data = {
                            "email": email,
                            "username": email.split('@')[0],
                            "display_name": display_name,
                            "staff_id": staff_id,
                            "profile_image": profile_image,
                            "source": "S3_Logs",
                            "folder_name": folder_name,
                            "has_logs": True,
                            "log_statistics": log_stats
                        }
                        
                        all_users.append(user_data)
                        
                print(f"✅ Processed {len(all_users)} users from S3")
            else:
                print("❌ No folders found in logs/ directory")
                        
        except Exception as e:
            logger.error(f"Error accessing S3: {str(e)}")
            print(f"❌ S3 Error: {str(e)}")
            # Fallback to mock data if S3 fails
            all_users = get_mock_users_fallback(include_stats)
            print("📋 Using fallback mock data")
        
        # Filter users based on search term
        filtered_users = []
        
        if search_term:
            search_lower = search_term.lower()
            print(f"🔍 Filtering users with search term: '{search_term}'")
            for user in all_users:
                if (search_lower in user['display_name'].lower() or
                    search_lower in user['email'].lower() or
                    search_lower in user['username'].lower() or
                    search_lower in user['staff_id'].lower()):
                    filtered_users.append(user)
                    print(f"   ✅ Match found: {user['display_name']} ({user['email']})")
        else:
            filtered_users = all_users
            print(f"📝 No search filter, showing all {len(all_users)} users")
        
        # Sort by email for consistent ordering
        filtered_users.sort(key=lambda x: x['email'])
        
        # Apply limit
        final_users = filtered_users[:limit]
        
        # Build response
        response_data = {
            "users": final_users,
            "metadata": {
                "search_term": search_term,
                "total_found": len(final_users),
                "source": "S3_Logs_Folder",
                "api_endpoint": "/api/logs/search/",
                "timestamp": datetime.now().isoformat(),
                "bucket_scanned": bucket_name
            },
            "search_info": {
                "search_applied": bool(search_term),
                "stats_included": include_stats,
                "results_limited_to": limit,
                "available_users": len(all_users),
                "showing_users": len(final_users)
            },
            "search_tips": [
                "Search by name: 'Haseeb', 'John', 'Sarah'",
                "Search by email: 'haseeb', 'amir', 'john.doe'",
                "Search by staff ID: 'HAS001', 'AMI002'",
                "Leave search empty to see all users"
            ]
        }
        
        # Determine message
        if search_term:
            if final_users:
                message = f"Found {len(final_users)} users matching '{search_term}'"
                print(f"🎯 {message}")
            else:
                message = f"No users found matching '{search_term}'"
                print(f"❌ {message}")
        else:
            message = f"Showing all {len(final_users)} users in logs folder"
            print(f"📋 {message}")
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Logs Users Search API error: {str(e)}")
        print(f"💥 API Error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error searching logs users: {str(e)}",
            data={
                "error_details": str(e),
                "search_term": request.GET.get('search', ''),
                "api_endpoint": "/api/logs/search/"
            },
            status_code=500
        )


# ==================== LOGS PROGRAM SUMMARY FILES API ====================
@csrf_exempt
@require_http_methods(["GET"])
def logs_program_summary_files_api(request):
    """
    Logs Program Summary Files API - Get all program_summary.json files from user folders
    
    GET: /api/logs/program-summary-files/?email=<email>&scan_folders=true
    
    Query parameters:
    - email: User email (required)
    - scan_folders: Whether to scan folders for files (default: true)
    - limit: Max files per folder (default: 100)
    """
    try:
        user_email = request.GET.get('email', '').strip()
        scan_folders = request.GET.get('scan_folders', 'true').lower() == 'true'
        limit_per_folder = min(int(request.GET.get('limit', 100)), 1000)
        
        if not user_email:
            return api_response(
                success=False,
                message="Email parameter is required",
                status_code=400
            )
        
        print(f"🔍 Program Summary Files API called:")
        print(f"   Email: '{user_email}'")
        print(f"   Scan Folders: {scan_folders}")
        print(f"   Limit per folder: {limit_per_folder}")
        
        # Get S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
        except Exception as e:
            logger.error(f"Failed to get S3 client: {str(e)}")
            return api_response(
                success=False,
                message=f"S3 connection failed: {str(e)}",
                status_code=500
            )
        
        # Convert email to folder format
        folder_name = user_email.replace('@', '_at_')
        
        print(f"📂 Scanning S3 folder: logs/{folder_name}/")
        
        # First, get all folders for this user
        try:
            folder_response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=f"logs/{folder_name}/",
                Delimiter="/"
            )
            
            date_folders = []
            if 'CommonPrefixes' in folder_response:
                for prefix_info in folder_response['CommonPrefixes']:
                    folder_path = prefix_info['Prefix'].replace(f'logs/{folder_name}/', '').rstrip('/')
                    if folder_path:  # Skip empty folder names
                        date_folders.append(folder_path)
            
            print(f"📁 Found {len(date_folders)} folders: {date_folders}")
            
        except Exception as e:
            logger.error(f"Error listing folders: {str(e)}")
            return api_response(
                success=False,
                message=f"Error accessing user folders: {str(e)}",
                status_code=500
            )
        
        # Now scan each folder for program_summary.json files
        all_program_summary_files = []
        folder_details = []
        
        if scan_folders and date_folders:
            print(f"🔍 Scanning {len(date_folders)} folders for program_summary.json files...")
            
            for folder in date_folders:
                folder_files = []
                folder_info = {
                    "folder_name": folder,
                    "folder_path": f"logs/{folder_name}/{folder}/",
                    "program_summary_files": [],
                    "total_files_in_folder": 0,
                    "program_summary_count": 0
                }
                
                try:
                    # List all files in this specific folder
                    files_response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        Prefix=f"logs/{folder_name}/{folder}/",
                        MaxKeys=limit_per_folder
                    )
                    
                    if 'Contents' in files_response:
                        folder_info["total_files_in_folder"] = len(files_response['Contents'])
                        
                        for obj in files_response['Contents']:
                            key = obj['Key']
                            filename = key.split('/')[-1]  # Get just the filename
                            
                            # Check if file ends with program_summary.json
                            if filename.endswith('program_summary.json'):
                                file_info = {
                                    "filename": filename,
                                    "full_path": key,
                                    "s3_key": key,
                                    "folder": folder,
                                    "size_bytes": obj.get('Size', 0),
                                    "size_mb": round(obj.get('Size', 0) / (1024 * 1024), 2),
                                    "last_modified": obj.get('LastModified').isoformat() if obj.get('LastModified') else None,
                                    "download_url": f"https://{bucket_name}.s3.amazonaws.com/{key}"
                                }
                                
                                folder_info["program_summary_files"].append(file_info)
                                all_program_summary_files.append(file_info)
                                folder_info["program_summary_count"] += 1
                                
                                print(f"   ✅ Found: {filename} in {folder}")
                    
                except Exception as e:
                    logger.error(f"Error scanning folder {folder}: {str(e)}")
                    folder_info["error"] = str(e)
                    print(f"   ❌ Error in folder {folder}: {str(e)}")
                
                folder_details.append(folder_info)
        
        # Build response
        response_data = {
            "user_info": {
                "email": user_email,
                "folder_name": folder_name,
                "s3_path": f"logs/{folder_name}/"
            },
            "summary": {
                "total_folders_scanned": len(date_folders),
                "total_program_summary_files": len(all_program_summary_files),
                "folders_with_files": len([f for f in folder_details if f["program_summary_count"] > 0]),
                "scan_performed": scan_folders
            },
            "date_folders": date_folders,
            "folder_details": folder_details,
            "all_program_summary_files": all_program_summary_files,
            "api_info": {
                "endpoint": "/api/logs/program-summary-files/",
                "timestamp": datetime.now().isoformat(),
                "bucket_scanned": bucket_name,
                "limit_per_folder": limit_per_folder
            }
        }
        
        # Build message
        if all_program_summary_files:
            message = f"Found {len(all_program_summary_files)} program_summary.json files across {len(date_folders)} folders for {user_email}"
        else:
            message = f"No program_summary.json files found in {len(date_folders)} folders for {user_email}"
        
        print(f"🎯 {message}")
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Program Summary Files API error: {str(e)}")
        print(f"💥 API Error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error getting program summary files: {str(e)}",
            data={
                "error_details": str(e),
                "email": request.GET.get('email', ''),
                "api_endpoint": "/api/logs/program-summary-files/"
            },
            status_code=500
        )

# ==================== LOGS FOLDER FILES API ====================
@csrf_exempt
@require_http_methods(["GET"])
def logs_folder_files_api(request):
    """
    Logs Folder Files API - List all files in a specific user's log folder or date folder
    
    GET: /api/logs/files/?email=<email>&date=<date>&file_type=<type>&limit=<number>
    
    Query parameters:
    - email: User email (required)
    - date: Specific date folder (optional, format: YYYY-MM-DD)
    - file_type: Filter by file type (optional: json, txt, log, csv, all)
    - limit: Max files to return (default: 100, max: 1000)
    - page: Page number for pagination (default: 1)
    - sort_by: Sort files by (name, size, date) (default: date)
    - sort_order: Sort order (asc, desc) (default: desc)
    """
    try:
        user_email = request.GET.get('email', '').strip()
        date_folder = request.GET.get('date', '').strip()
        file_type = request.GET.get('file_type', 'all').strip().lower()
        limit = min(int(request.GET.get('limit', 100)), 1000)
        page = max(int(request.GET.get('page', 1)), 1)
        sort_by = request.GET.get('sort_by', 'date').strip().lower()
        sort_order = request.GET.get('sort_order', 'desc').strip().lower()
        
        if not user_email:
            return api_response(
                success=False,
                message="Email parameter is required",
                status_code=400
            )
        
        # Validate date format if provided (allow both date format and project folder names)
        if date_folder:
            # Try to parse as date, but if it fails, allow it as a project folder name
            try:
                datetime.strptime(date_folder, '%Y-%m-%d')
            except ValueError:
                # Allow non-date folder names (like project names)
                if not date_folder.replace('_', '').replace('-', '').isalnum():
                    # Only reject if it contains special characters that might cause issues
                    return api_response(
                        success=False,
                        message="Date/folder name contains invalid characters",
                        status_code=400
                    )
        
        print(f"🔍 Logs Folder Files API called:")
        print(f"   Email: '{user_email}'")
        print(f"   Date Folder: '{date_folder}'")
        print(f"   File Type: '{file_type}'")
        print(f"   Limit: {limit}, Page: {page}")
        print(f"   Sort: {sort_by} {sort_order}")
        
        # Get S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
        except Exception as e:
            logger.error(f"Failed to get S3 client: {str(e)}")
            return api_response(
                success=False,
                message=f"S3 connection failed: {str(e)}",
                status_code=500
            )
        
        # Convert email to folder format
        folder_name = user_email.replace('@', '_at_')
        
        # Build S3 prefix based on whether date is specified
        if date_folder:
            s3_prefix = f"logs/{folder_name}/{date_folder}/"
            search_context = f"date folder '{date_folder}'"
        else:
            s3_prefix = f"logs/{folder_name}/"
            search_context = "all folders"
        
        print(f"📂 Scanning S3 prefix: {s3_prefix}")
        
        # Get all files from S3
        all_files = []
        continuation_token = None
        
        try:
            while True:
                # Build request parameters
                list_params = {
                    'Bucket': bucket_name,
                    'Prefix': s3_prefix,
                    'MaxKeys': 1000
                }
                
                if continuation_token:
                    list_params['ContinuationToken'] = continuation_token
                
                # List objects
                response = s3_client.list_objects_v2(**list_params)
                
                if 'Contents' in response:
                    for obj in response['Contents']:
                        file_key = obj['Key']
                        file_name = file_key.split('/')[-1]
                        
                        # Skip if it's just a folder (ends with /)
                        if file_name == '':
                            continue
                        
                        # Get file extension
                        file_ext = file_name.split('.')[-1].lower() if '.' in file_name else ''
                        
                        # Filter by file type if specified
                        if file_type != 'all':
                            if file_type == 'json' and file_ext != 'json':
                                continue
                            elif file_type == 'txt' and file_ext not in ['txt', 'log']:
                                continue
                            elif file_type == 'log' and file_ext not in ['log', 'txt']:
                                continue
                            elif file_type == 'csv' and file_ext != 'csv':
                                continue
                        
                        # Extract date folder from path
                        path_parts = file_key.split('/')
                        file_date_folder = path_parts[2] if len(path_parts) > 2 else 'unknown'
                        
                        # Build file info
                        file_info = {
                            "file_name": file_name,
                            "file_key": file_key,
                            "file_extension": file_ext,
                            "file_type": get_file_type_category(file_ext),
                            "size_bytes": obj.get('Size', 0),
                            "size_mb": round(obj.get('Size', 0) / (1024 * 1024), 3),
                            "last_modified": obj.get('LastModified').isoformat() if obj.get('LastModified') else None,
                            "date_folder": file_date_folder,
                            "folder_path": '/'.join(path_parts[:-1]),
                            "download_url": generate_presigned_url(bucket_name, file_key),
                            "is_program_summary": 'program_summary' in file_name.lower(),
                            "is_important": is_important_file(file_name),
                            "file_category": categorize_file(file_name)
                        }
                        
                        all_files.append(file_info)
                
                # Check if there are more files
                if response.get('IsTruncated'):
                    continuation_token = response.get('NextContinuationToken')
                else:
                    break
            
            print(f"📁 Found {len(all_files)} files in {search_context}")
            
        except Exception as e:
            logger.error(f"Error listing S3 files: {str(e)}")
            return api_response(
                success=False,
                message=f"Error accessing S3 files: {str(e)}",
                status_code=500
            )
        
        # Sort files
        sort_key_map = {
            'name': lambda x: x['file_name'].lower(),
            'size': lambda x: x['size_bytes'],
            'date': lambda x: x['last_modified'] or ''
        }
        
        if sort_by in sort_key_map:
            all_files.sort(key=sort_key_map[sort_by], reverse=(sort_order == 'desc'))
        
        # Apply pagination
        total_files = len(all_files)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_files = all_files[start_idx:end_idx]
        
        # Calculate pagination info
        total_pages = (total_files + limit - 1) // limit if total_files > 0 else 1
        
        # Group files by category for better organization
        files_by_category = {}
        for file_info in paginated_files:
            category = file_info['file_category']
            if category not in files_by_category:
                files_by_category[category] = []
            files_by_category[category].append(file_info)
        
        # Build response data
        response_data = {
            "files": paginated_files,
            "files_by_category": files_by_category,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_files": total_files,
                "files_per_page": limit,
                "showing_files": len(paginated_files),
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "filters_applied": {
                "email": user_email,
                "date_folder": date_folder,
                "file_type": file_type,
                "sort_by": sort_by,
                "sort_order": sort_order
            },
            "summary": {
                "total_files_found": total_files,
                "search_context": search_context,
                "file_types_available": list(set(f['file_extension'] for f in all_files)),
                "date_folders_available": list(set(f['date_folder'] for f in all_files)),
                "important_files_count": len([f for f in all_files if f['is_important']]),
                "program_summary_count": len([f for f in all_files if f['is_program_summary']])
            },
            "api_info": {
                "endpoint": "/api/logs/files/",
                "user_folder": folder_name,
                "s3_prefix_scanned": s3_prefix,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        # Determine message
        if paginated_files:
            message = f"Found {total_files} files in {search_context} for {user_email} (showing {len(paginated_files)})"
        else:
            message = f"No files found in {search_context} for {user_email}"
        
        print(f"🎯 {message}")
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Logs Folder Files API error: {str(e)}")
        print(f"💥 API Error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error listing folder files: {str(e)}",
            data={
                "error_details": str(e),
                "email": request.GET.get('email', ''),
                "date": request.GET.get('date', ''),
                "api_endpoint": "/api/logs/files/"
            },
            status_code=500
        )


def get_file_type_category(file_extension):
    """Categorize file by extension"""
    ext = file_extension.lower()
    
    if ext in ['json']:
        return 'JSON Data'
    elif ext in ['txt', 'log']:
        return 'Log Files'
    elif ext in ['csv']:
        return 'CSV Data'
    elif ext in ['png', 'jpg', 'jpeg', 'gif', 'bmp']:
        return 'Images'
    elif ext in ['pdf']:
        return 'Documents'
    elif ext in ['zip', 'rar', '7z']:
        return 'Archives'
    else:
        return 'Other'


def is_important_file(file_name):
    """Check if file is considered important"""
    important_keywords = [
        'program_summary', 'summary', 'report', 'analysis',
        'dashboard', 'statistics', 'metrics', 'performance',
        'error', 'exception', 'critical', 'important'
    ]
    
    file_lower = file_name.lower()
    return any(keyword in file_lower for keyword in important_keywords)


def categorize_file(file_name):
    """Categorize file based on name patterns"""
    file_lower = file_name.lower()
    
    if 'program_summary' in file_lower:
        return 'Program Summaries'
    elif 'screenshot' in file_lower or 'image' in file_lower:
        return 'Screenshots'
    elif 'log' in file_lower or 'activity' in file_lower:
        return 'Activity Logs'
    elif 'report' in file_lower or 'summary' in file_lower:
        return 'Reports'
    elif 'data' in file_lower or 'json' in file_lower:
        return 'Data Files'
    elif 'config' in file_lower or 'setting' in file_lower:
        return 'Configuration'
    else:
        return 'General Files'

# ==================== LIVE TRACKING API ====================
@csrf_exempt
@require_http_methods(["GET"])
def live_tracking_api(request):
    """
    Live Tracking API - Real-time user activity and status tracking
    
    GET: /api/live-tracking/?status=<status>&date=<date>&limit=<number>&page=<page>
    
    Query parameters:
    - status: Filter by status (all, active, meeting, break, idle, offline) (default: all)
    - date: Filter by specific date (YYYY-MM-DD) (default: today)
    - limit: Number of users per page (default: 20, max: 100)
    - page: Page number (default: 1)
    - search: Search by name or email (optional)
    - sort_by: Sort by (name, status, last_activity, time_tracked) (default: last_activity)
    - sort_order: Sort order (asc, desc) (default: desc)
    - include_offline: Include offline users (default: true)
    """
    try:
        # Get query parameters
        status_filter = request.GET.get('status', 'all').strip().lower()
        date_filter = request.GET.get('date', datetime.now().strftime('%Y-%m-%d')).strip()
        limit = min(int(request.GET.get('limit', 20)), 100)
        page = max(int(request.GET.get('page', 1)), 1)
        search_term = request.GET.get('search', '').strip()
        sort_by = request.GET.get('sort_by', 'last_activity').strip().lower()
        sort_order = request.GET.get('sort_order', 'desc').strip().lower()
        include_offline = request.GET.get('include_offline', 'true').lower() == 'true'
        
        print(f"🔴 Live Tracking API called:")
        print(f"   Status Filter: '{status_filter}'")
        print(f"   Date: '{date_filter}'")
        print(f"   Search: '{search_term}'")
        print(f"   Limit: {limit}, Page: {page}")
        print(f"   Sort: {sort_by} {sort_order}")
        print(f"   Include Offline: {include_offline}")
        
        # Validate date format
        try:
            date_obj = datetime.strptime(date_filter, '%Y-%m-%d')
        except ValueError:
            return api_response(
                success=False,
                message="Invalid date format. Use YYYY-MM-DD",
                status_code=400
            )
        
        # Validate status filter
        valid_statuses = ['all', 'active', 'meeting', 'break', 'idle', 'offline']
        if status_filter not in valid_statuses:
            return api_response(
                success=False,
                message=f"Invalid status. Valid options: {', '.join(valid_statuses)}",
                status_code=400
            )
        
        # Get all active users with recent activity
        live_users = []
        
        # Get users from Staff model
        staff_members = Staff.objects.all()
        
        for staff in staff_members:
            # Skip if search term doesn't match
            if search_term:
                search_lower = search_term.lower()
                if not any([
                    search_lower in staff.firstname.lower(),
                    search_lower in staff.lastname.lower(),
                    search_lower in staff.email.lower(),
                    search_lower in str(staff.staffid).lower()
                ]):
                    continue
            
            # Get user's latest activity and status
            user_status = get_user_live_status(staff.email, date_filter)
            
            # Skip offline users if not including them
            if not include_offline and user_status['status'] == 'offline':
                continue
            
            # Skip if status filter doesn't match
            if status_filter != 'all' and user_status['status'] != status_filter:
                continue
            
            # Build user data
            user_data = {
                "user_id": staff.id,
                "staff_id": staff.staffid,
                "username": staff.email.split('@')[0],
                "email": staff.email,
                "first_name": staff.firstname,
                "last_name": staff.lastname,
                "display_name": f"{staff.firstname} {staff.lastname}",
                "profile_image": staff.profile_image.url if hasattr(staff, 'profile_image') and staff.profile_image else None,
                "status": user_status['status'],
                "status_color": get_status_color(user_status['status']),
                "current_activity": user_status['current_activity'],
                "current_task": user_status['current_task'],
                "current_project": user_status['current_project'],
                "last_activity_time": user_status['last_activity_time'],
                "time_tracked_today": user_status['time_tracked_today'],
                "active_duration": user_status['active_duration'],
                "break_duration": user_status['break_duration'],
                "meeting_duration": user_status['meeting_duration'],
                "productivity_score": user_status['productivity_score'],
                "screenshot_count": user_status['screenshot_count'],
                "last_screenshot_time": user_status['last_screenshot_time'],
                "is_online": user_status['is_online'],
                "location": user_status.get('location', 'Unknown'),
                "device_info": user_status.get('device_info', {}),
                "activity_summary": user_status['activity_summary']
            }
            
            live_users.append(user_data)
        
        # Sort users
        sort_key_map = {
            'name': lambda x: x['display_name'].lower(),
            'status': lambda x: x['status'],
            'last_activity': lambda x: x['last_activity_time'] or '1900-01-01T00:00:00',
            'time_tracked': lambda x: x['time_tracked_today']
        }
        
        if sort_by in sort_key_map:
            live_users.sort(key=sort_key_map[sort_by], reverse=(sort_order == 'desc'))
        
        # Apply pagination
        total_users = len(live_users)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_users = live_users[start_idx:end_idx]
        
        # Calculate pagination info
        total_pages = (total_users + limit - 1) // limit if total_users > 0 else 1
        
        # Calculate status statistics
        status_stats = calculate_live_status_stats(live_users)
        
        # Build response data
        response_data = {
            "live_users": paginated_users,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_users": total_users,
                "users_per_page": limit,
                "showing_users": len(paginated_users),
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "status_statistics": status_stats,
            "filters_applied": {
                "status": status_filter,
                "date": date_filter,
                "search": search_term,
                "include_offline": include_offline,
                "sort_by": sort_by,
                "sort_order": sort_order
            },
            "summary": {
                "total_active_users": status_stats['active'],
                "total_online_users": status_stats['active'] + status_stats['meeting'] + status_stats['break'],
                "total_offline_users": status_stats['offline'],
                "average_productivity": calculate_average_productivity(live_users),
                "total_time_tracked": sum(user['time_tracked_today'] for user in live_users),
                "last_updated": datetime.now().isoformat()
            },
            "api_info": {
                "endpoint": "/api/live-tracking/",
                "timestamp": datetime.now().isoformat(),
                "refresh_interval": 30,  # Recommended refresh interval in seconds
                "real_time": True
            }
        }
        
        # Determine message
        if paginated_users:
            message = f"Live tracking data for {total_users} users (showing {len(paginated_users)})"
        else:
            message = f"No users found matching the filters"
        
        print(f"🎯 {message}")
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Live Tracking API error: {str(e)}")
        print(f"💥 API Error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error getting live tracking data: {str(e)}",
            data={
                "error_details": str(e),
                "api_endpoint": "/api/live-tracking/"
            },
            status_code=500
        )


def get_user_live_status(email, date_filter):
    """Get real-time status information for a user"""
    try:
        # Get user's logs for the specified date
        user_logs = User_Logs.objects.filter(
            email=email,
            date=date_filter
        ).order_by('-id')
        
        # Default status data
        status_data = {
            "status": "offline",
            "current_activity": "No activity",
            "current_task": "N/A",
            "current_project": "N/A",
            "last_activity_time": None,
            "time_tracked_today": 0,
            "active_duration": 0,
            "break_duration": 0,
            "meeting_duration": 0,
            "productivity_score": 0,
            "screenshot_count": 0,
            "last_screenshot_time": None,
            "is_online": False,
            "location": "Unknown",
            "device_info": {},
            "activity_summary": {}
        }
        
        if user_logs.exists():
            latest_log = user_logs.first()
            
            # Parse JSON log data
            try:
                if latest_log.jsonlog:
                    if isinstance(latest_log.jsonlog, str):
                        log_data = json.loads(latest_log.jsonlog)
                    else:
                        log_data = latest_log.jsonlog
                    
                    # Extract status information
                    status_data.update({
                        "current_activity": log_data.get('current_activity', 'Working'),
                        "current_task": log_data.get('current_task', 'General Tasks'),
                        "current_project": log_data.get('current_project', 'Default Project'),
                        "last_activity_time": log_data.get('last_activity_time', datetime.now().isoformat()),
                        "time_tracked_today": log_data.get('time_tracked_today', 0),
                        "active_duration": log_data.get('active_duration', 0),
                        "break_duration": log_data.get('break_duration', 0),
                        "meeting_duration": log_data.get('meeting_duration', 0),
                        "screenshot_count": log_data.get('screenshot_count', 0),
                        "last_screenshot_time": log_data.get('last_screenshot_time'),
                        "location": log_data.get('location', 'Office'),
                        "device_info": log_data.get('device_info', {}),
                        "activity_summary": log_data.get('activity_summary', {})
                    })
                    
                    # Determine status based on activity
                    status_data["status"] = determine_user_status(log_data)
                    status_data["is_online"] = status_data["status"] != "offline"
                    status_data["productivity_score"] = calculate_productivity_score(log_data)
                    
            except json.JSONDecodeError:
                logger.error(f"Error parsing JSON log for user {email}")
        
        # Get S3 screenshot data for additional context
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
            folder_name = email.replace('@', '_at_')
            
            # Check for recent screenshots
            today_prefix = f"screenshots/{folder_name}/{date_filter}/"
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=today_prefix,
                MaxKeys=10
            )
            
            if 'Contents' in response:
                status_data["screenshot_count"] = len(response['Contents'])
                if response['Contents']:
                    latest_screenshot = max(response['Contents'], key=lambda x: x['LastModified'])
                    status_data["last_screenshot_time"] = latest_screenshot['LastModified'].isoformat()
                    
                    # If screenshot is very recent (within 5 minutes), user is likely active
                    if latest_screenshot['LastModified'] > datetime.now().replace(tzinfo=latest_screenshot['LastModified'].tzinfo) - timedelta(minutes=5):
                        if status_data["status"] == "offline":
                            status_data["status"] = "active"
                            status_data["is_online"] = True
        
        except Exception as e:
            logger.error(f"Error getting S3 data for {email}: {str(e)}")
        
        return status_data
        
    except Exception as e:
        logger.error(f"Error getting live status for {email}: {str(e)}")
        return {
            "status": "offline",
            "current_activity": "Error retrieving status",
            "current_task": "N/A",
            "current_project": "N/A",
            "last_activity_time": None,
            "time_tracked_today": 0,
            "active_duration": 0,
            "break_duration": 0,
            "meeting_duration": 0,
            "productivity_score": 0,
            "screenshot_count": 0,
            "last_screenshot_time": None,
            "is_online": False,
            "location": "Unknown",
            "device_info": {},
            "activity_summary": {}
        }


def determine_user_status(log_data):
    """Determine user status based on log data"""
    current_activity = log_data.get('current_activity', '').lower()
    last_activity_time = log_data.get('last_activity_time')
    
    # Check if user was recently active (within 10 minutes)
    try:
        if last_activity_time:
            last_time = datetime.fromisoformat(last_activity_time.replace('Z', '+00:00'))
            time_diff = datetime.now(last_time.tzinfo) - last_time
            
            if time_diff > timedelta(minutes=10):
                return "offline"
    except:
        pass
    
    # Determine status based on activity keywords
    if any(keyword in current_activity for keyword in ['meeting', 'call', 'conference']):
        return "meeting"
    elif any(keyword in current_activity for keyword in ['break', 'lunch', 'away', 'pause']):
        return "break"
    elif any(keyword in current_activity for keyword in ['idle', 'inactive', 'away']):
        return "idle"
    elif any(keyword in current_activity for keyword in ['working', 'coding', 'active', 'task']):
        return "active"
    else:
        return "active"  # Default to active if user has recent logs


def get_status_color(status):
    """Get color code for status"""
    status_colors = {
        "active": "#10B981",      # Green
        "meeting": "#F59E0B",     # Yellow/Orange
        "break": "#EF4444",       # Red
        "idle": "#6B7280",        # Gray
        "offline": "#374151"      # Dark Gray
    }
    return status_colors.get(status, "#6B7280")


def calculate_productivity_score(log_data):
    """Calculate productivity score based on activity data"""
    try:
        active_time = log_data.get('active_duration', 0)
        total_time = log_data.get('time_tracked_today', 0)
        
        if total_time == 0:
            return 0
        
        # Basic productivity calculation
        productivity = (active_time / total_time) * 100
        
        # Bonus for screenshot frequency
        screenshot_count = log_data.get('screenshot_count', 0)
        if screenshot_count > 10:
            productivity += 5
        
        # Cap at 100
        return min(100, round(productivity))
        
    except:
        return 0


def calculate_live_status_stats(users):
    """Calculate statistics for live tracking dashboard"""
    stats = {
        "active": 0,
        "meeting": 0,
        "break": 0,
        "idle": 0,
        "offline": 0,
        "total": len(users)
    }
    
    for user in users:
        status = user.get('status', 'offline')
        if status in stats:
            stats[status] += 1
    
    return stats


def calculate_average_productivity(users):
    """Calculate average productivity score"""
    if not users:
        return 0
    
    total_productivity = sum(user.get('productivity_score', 0) for user in users)
    return round(total_productivity / len(users), 1)

# ==================== LIVE TRACKING SCREENSHOTS API ====================
@csrf_exempt
@require_http_methods(["GET"])
def live_tracking_screenshots_api(request):
    """
    Live Tracking Screenshots API - Get latest screenshot for each user
    
    GET: /api/live-tracking/screenshots/?limit=50&status=all&latest_only=true
    
    Query parameters:
    - limit: Number of users to return (default: 50, max: 100)
    - status: Filter by status (all, active, meeting, break, idle, offline)
    - latest_only: Get only the latest screenshot per user (default: true)
    - date: Filter by date (YYYY-MM-DD) (default: today)
    - sort_by: Sort by (name, email, last_activity, screenshot_time)
    """
    try:
        # Get query parameters
        limit = min(int(request.GET.get('limit', 50)), 100)
        status_filter = request.GET.get('status', 'all').strip().lower()
        latest_only = request.GET.get('latest_only', 'true').lower() == 'true'
        date_filter = request.GET.get('date', datetime.now().strftime('%Y-%m-%d')).strip()
        sort_by = request.GET.get('sort_by', 'last_activity').strip().lower()
        
        print(f"📸 Live Tracking Screenshots API called:")
        print(f"   Limit: {limit}")
        print(f"   Status Filter: {status_filter}")
        print(f"   Latest Only: {latest_only}")
        print(f"   Date: {date_filter}")
        
        # Get S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
        except Exception as e:
            return api_response(False, f"S3 connection failed: {e}", status_code=500)
        
        # Get all Staff users
        staff_members = Staff.objects.all()[:limit]
        print(f"📊 Found {len(staff_members)} staff users in database")
        
        users_with_screenshots = []
        total_screenshots = 0
        
        for staff in staff_members:
            try:
                # Get user's live status quickly
                user_status = get_user_live_status(staff.email, datetime.now().strftime('%Y-%m-%d'))
                
                # Skip if status filter doesn't match
                if status_filter != 'all' and user_status['status'] != status_filter:
                    continue
                
                # Quick S3 check for latest screenshot
                latest_screenshot = None
                screenshot_time = None
                
                # Scan for screenshots in S3
                try:
                    print(f"🔍 Scanning screenshots for {staff.email}...")
                    
                    # First, try to get task folders
                    task_folders_response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        Prefix=f"screenshots/{staff.email.replace('@', '_at_')}/",
                        Delimiter="/",
                        MaxKeys=10  # Check more task folders
                    )
                    
                    latest_screenshot_obj = None
                    latest_time = None
                    
                    if 'CommonPrefixes' in task_folders_response:
                        print(f"   Found {len(task_folders_response['CommonPrefixes'])} task folders")
                        
                        for task_prefix_info in task_folders_response['CommonPrefixes']:
                            task_prefix = task_prefix_info['Prefix']
                            
                            # Get screenshots from this task folder
                            screenshots_response = s3_client.list_objects_v2(
                                Bucket=bucket_name,
                                Prefix=task_prefix,
                                MaxKeys=10  # Check more files per folder
                            )
                            
                            if 'Contents' in screenshots_response:
                                for obj in screenshots_response['Contents']:
                                    if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg')):
                                        if latest_time is None or obj['LastModified'] > latest_time:
                                            latest_screenshot_obj = obj
                                            latest_time = obj['LastModified']
                    else:
                        # No task folders, try direct screenshot folder
                        print(f"   No task folders, checking direct screenshots...")
                        direct_screenshots_response = s3_client.list_objects_v2(
                            Bucket=bucket_name,
                            Prefix=f"screenshots/{staff.email.replace('@', '_at_')}/",
                            MaxKeys=20
                        )
                        
                        if 'Contents' in direct_screenshots_response:
                            for obj in direct_screenshots_response['Contents']:
                                if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg')):
                                    if latest_time is None or obj['LastModified'] > latest_time:
                                        latest_screenshot_obj = obj
                                        latest_time = obj['LastModified']
                    
                    if latest_screenshot_obj:
                        latest_screenshot = generate_presigned_url(bucket_name, latest_screenshot_obj['Key'])
                        screenshot_time = latest_screenshot_obj['LastModified'].isoformat()
                        total_screenshots += 1
                        print(f"   ✅ Found screenshot: {latest_screenshot_obj['Key']}")
                    else:
                        print(f"   ❌ No screenshots found")
                
                except Exception as e:
                    print(f"   ❌ S3 error for {staff.email}: {e}")
                    # Continue with other users even if one fails
                
                # Build user data
                user_data = {
                    "email": staff.email,
                    "display_name": f"{staff.firstname} {staff.lastname}",
                    "staff_id": staff.staffid,
                    "username": staff.email.split('@')[0],
                    "profile_image": staff.profile_image.url if hasattr(staff, 'profile_image') and staff.profile_image else None,
                    "status": user_status['status'],
                    "status_color": get_status_color(user_status['status']),
                    "current_activity": user_status['current_activity'],
                    "current_task": user_status['current_task'],
                    "current_project": user_status['current_project'],
                    "last_activity_time": user_status['last_activity_time'],
                    "time_tracked_today": user_status['time_tracked_today'],
                    "active_duration": user_status['active_duration'],
                    "break_duration": user_status['break_duration'],
                    "meeting_duration": user_status['meeting_duration'],
                    "productivity_score": user_status['productivity_score'],
                    "screenshot_count": user_status['screenshot_count'],
                    "last_screenshot_time": user_status['last_screenshot_time'],
                    "is_online": user_status['is_online'],
                    "location": user_status.get('location', 'Unknown'),
                    "device_info": user_status.get('device_info', {}),
                    "activity_summary": user_status['activity_summary'],
                    "latest_screenshot": {
                        "url": latest_screenshot,
                        "timestamp": screenshot_time,
                        "has_screenshot": latest_screenshot is not None
                    }
                }
                
                users_with_screenshots.append(user_data)
                
            except Exception as e:
                print(f"Error processing staff {staff.email}: {e}")
                continue
        
        # Sort by name
        users_with_screenshots.sort(key=lambda x: x['display_name'].lower())
        
        # Calculate stats
        users_with_ss = len([u for u in users_with_screenshots if u['latest_screenshot']['has_screenshot']])
        users_without_ss = len(users_with_screenshots) - users_with_ss
        
        # Build response
        response_data = {
            "users": users_with_screenshots,
            "summary": {
                "total_users": len(users_with_screenshots),
                "users_with_screenshots": users_with_ss,
                "users_without_screenshots": users_without_ss,
                "total_screenshots_found": total_screenshots,
                "api_version": "live_tracking",
                "last_updated": datetime.now().isoformat()
            },
            "api_info": {
                "endpoint": "/api/live-tracking/screenshots/",
                "timestamp": datetime.now().isoformat(),
                "optimization": "Staff table based with S3 screenshot lookup"
            }
        }
        
        message = f"Live tracking: {len(users_with_screenshots)} users processed with {total_screenshots} latest screenshots"
        print(f"📸 {message}")
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Fast Live Tracking Screenshots API error: {e}")
        return api_response(
            success=False,
            message=f"Error: {str(e)}",
            status_code=500
        )

# ==================== SCREENSHOT PROXY API ====================
@csrf_exempt
@require_http_methods(["GET"])
def screenshot_proxy(request, screenshot_path):
    """
    Proxy endpoint to serve S3 images through Django
    This solves CORS and authentication issues by serving images through Django
    
    GET: /api/proxy/screenshot/<path:screenshot_path>
    
    Example: /api/proxy/screenshot/user@example.com/Task_Name/2025-07-13_12-30-45.webp
    """
    try:
        # Get S3 client with proper configuration
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        # Construct full S3 key
        s3_key = f"screenshots/{screenshot_path}"
        
        print(f"[🔄] Proxying image: {s3_key}")
        
        # Get object from S3
        response = s3_client.get_object(Bucket=bucket_name, Key=s3_key)
        
        # Determine content type
        content_type = response.get('ContentType', 'image/webp')
        if not content_type.startswith('image/'):
            # Guess content type from file extension
            if s3_key.lower().endswith('.png'):
                content_type = 'image/png'
            elif s3_key.lower().endswith('.jpg') or s3_key.lower().endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif s3_key.lower().endswith('.webp'):
                content_type = 'image/webp'
            else:
                content_type = 'image/webp'  # default
        
        # Read image data
        image_data = response['Body'].read()
        
        # Create HTTP response with image data
        http_response = HttpResponse(image_data, content_type=content_type)
        
        # Add CORS headers for web browser compatibility
        http_response['Access-Control-Allow-Origin'] = '*'
        http_response['Access-Control-Allow-Methods'] = 'GET, HEAD'
        http_response['Access-Control-Allow-Headers'] = '*'
        
        # Add caching headers
        http_response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        
        print(f"[✅] Successfully served image: {s3_key} ({len(image_data)} bytes)")
        return http_response
        
    except s3_client.exceptions.NoSuchKey:
        print(f"[❌] Image not found: {s3_key}")
        return HttpResponse(f"Image not found: {screenshot_path}", status=404)
    except Exception as e:
        print(f"[❌] Error serving image {screenshot_path}: {e}")
        return HttpResponse(f"Error loading image: {str(e)}", status=500)


# ==================== IMAGE PROXY API (CORS Fix) ====================
@csrf_exempt
@require_http_methods(["GET"])
def proxy_image_api(request, s3_key):
    """
    Proxy S3 images to fix CORS issues
    
    GET: /api/proxy-image/{s3_key}/
    
    This endpoint fetches images from S3 and serves them with proper CORS headers
    to fix frontend CORS issues with direct S3 access.
    """
    try:
        # Log the request
        logger.info(f"Proxying image: {s3_key}")
        
        # Initialize S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
        except Exception as e:
            logger.error(f"Could not initialize S3 client: {str(e)}")
            return HttpResponse("S3 configuration error", status=500)
        
        # Generate presigned URL
        try:
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket_name, 'Key': s3_key},
                ExpiresIn=3600  # 1 hour
            )
        except Exception as e:
            logger.error(f"Could not generate presigned URL for {s3_key}: {str(e)}")
            return HttpResponse("Could not generate presigned URL", status=500)
        
        # Fetch image from S3
        try:
            import requests
            response = requests.get(presigned_url, timeout=30)
            
            if response.status_code == 200:
                # Determine content type
                content_type = response.headers.get('content-type', 'image/webp')
                if s3_key.lower().endswith('.webp'):
                    content_type = 'image/webp'
                elif s3_key.lower().endswith('.png'):
                    content_type = 'image/png'
                elif s3_key.lower().endswith('.jpg') or s3_key.lower().endswith('.jpeg'):
                    content_type = 'image/jpeg'
                
                # Create HTTP response with proper headers
                http_response = HttpResponse(
                    response.content,
                    content_type=content_type
                )
                
                # Add CORS headers
                http_response['Access-Control-Allow-Origin'] = '*'
                http_response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
                http_response['Access-Control-Allow-Headers'] = '*'
                http_response['Access-Control-Expose-Headers'] = 'Content-Type, Content-Length'
                
                # Add caching headers
                http_response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
                
                logger.info(f"Successfully proxied image: {s3_key} ({len(response.content)} bytes)")
                return http_response
            else:
                logger.error(f"S3 request failed for {s3_key}: {response.status_code}")
                return HttpResponse(f"Image not found: {response.status_code}", status=404)
                
        except Exception as e:
            logger.error(f"Error fetching image from S3: {str(e)}")
            return HttpResponse(f"Error fetching image: {str(e)}", status=500)
            
    except Exception as e:
        logger.error(f"Image proxy API error: {str(e)}")
        return HttpResponse(f"Proxy error: {str(e)}", status=500)


# ==================== CONFIGURATION SETTINGS APIs ====================

@never_cache
@csrf_exempt
@require_http_methods(["GET", "POST", "PUT", "DELETE"])
def configuration_settings_api(request, config_id=None):
    """
    API for managing configuration settings
    GET /api/configurations/ - Get all configurations
    GET /api/configurations/{id}/ - Get specific configuration
    POST /api/configurations/ - Create new configuration
    PUT /api/configurations/{id}/ - Update configuration
    DELETE /api/configurations/{id}/ - Delete configuration
    """
    try:
        if request.method == 'GET':
            if config_id:
                # Get specific configuration
                try:
                    config = ConfigurationSettings.objects.get(id=config_id)
                    return JsonResponse({
                        "success": True,
                        "data": {
                            "id": config.id,
                            "name": config.name,
                            "type": config.type,
                            "description": config.description,
                            "config_data": config.config_data,
                            "created_at": config.created_at.isoformat(),
                            "updated_at": config.updated_at.isoformat()
                        }
                    })
                except ConfigurationSettings.DoesNotExist:
                    return JsonResponse({"success": False, "message": "Configuration not found"}, status=404)
            else:
                # Get all configurations
                configs = ConfigurationSettings.objects.all()
                return JsonResponse({
                    "success": True,
                    "data": [{
                        "id": config.id,
                        "name": config.name,
                        "type": config.type,
                        "description": config.description,
                        "config_data": config.config_data,
                        "created_at": config.created_at.isoformat(),
                        "updated_at": config.updated_at.isoformat()
                    } for config in configs]
                })

        elif request.method == 'POST':
            # Create new configuration
            data = json.loads(request.body)
            config = ConfigurationSettings.objects.create(
                name=data.get('name'),
                type=data.get('type'),
                description=data.get('description', ''),
                config_data=data.get('config_data', {})
            )
            return JsonResponse({
                "success": True,
                "message": "Configuration created successfully",
                "data": {
                    "id": config.id,
                    "name": config.name,
                    "type": config.type,
                    "description": config.description,
                    "config_data": config.config_data
                }
            })

        elif request.method == 'PUT':
            # Update configuration
            if not config_id:
                return JsonResponse({"success": False, "message": "Configuration ID required"}, status=400)
            
            try:
                config = ConfigurationSettings.objects.get(id=config_id)
                data = json.loads(request.body)
                
                if 'name' in data:
                    config.name = data['name']
                if 'type' in data:
                    config.type = data['type']
                if 'description' in data:
                    config.description = data['description']
                if 'config_data' in data:
                    config.config_data = data['config_data']
                
                config.save()
                return JsonResponse({
                    "success": True,
                    "message": "Configuration updated successfully",
                    "data": {
                        "id": config.id,
                        "name": config.name,
                        "type": config.type,
                        "description": config.description,
                        "config_data": config.config_data
                    }
                })
            except ConfigurationSettings.DoesNotExist:
                return JsonResponse({"success": False, "message": "Configuration not found"}, status=404)

        elif request.method == 'DELETE':
            # Delete configuration
            if not config_id:
                return JsonResponse({"success": False, "message": "Configuration ID required"}, status=400)
            
            try:
                config = ConfigurationSettings.objects.get(id=config_id)
                config.delete()
                return JsonResponse({"success": True, "message": "Configuration deleted successfully"})
            except ConfigurationSettings.DoesNotExist:
                return JsonResponse({"success": False, "message": "Configuration not found"}, status=404)

    except Exception as e:
        return JsonResponse({"success": False, "message": f"Error: {str(e)}"}, status=500)


@never_cache
@csrf_exempt
@require_http_methods(["GET"])
def configuration_by_type_api(request, config_type):
    """
    Get configurations by type
    GET /api/configurations/type/{config_type}/ - Get configurations by type (upload, database, aws)
    """
    try:
        valid_types = ['upload', 'database', 'aws']
        if config_type not in valid_types:
            return JsonResponse({
                "success": False, 
                "message": f"Invalid type. Must be one of: {', '.join(valid_types)}"
            }, status=400)
        
        configs = ConfigurationSettings.objects.filter(type=config_type)
        return JsonResponse({
            "success": True,
            "data": [{
                "id": config.id,
                "name": config.name,
                "type": config.type,
                "description": config.description,
                "config_data": config.config_data,
                "created_at": config.created_at.isoformat(),
                "updated_at": config.updated_at.isoformat()
            } for config in configs]
        })
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Error: {str(e)}"}, status=500)


@never_cache
@csrf_exempt
@require_http_methods(["GET"])
def configuration_by_name_api(request, config_name):
    """
    Get configuration by name
    GET /api/configurations/name/{config_name}/ - Get configuration by name
    """
    try:
        config = ConfigurationSettings.objects.get(name=config_name)
        return JsonResponse({
            "success": True,
            "data": {
                "id": config.id,
                "name": config.name,
                "type": config.type,
                "description": config.description,
                "config_data": config.config_data,
                "created_at": config.created_at.isoformat(),
                "updated_at": config.updated_at.isoformat()
            }
        })
    except ConfigurationSettings.DoesNotExist:
        return JsonResponse({"success": False, "message": "Configuration not found"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "message": f"Error: {str(e)}"}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def presigned_url_api(request, s3_path):
    """
    Generate presigned URL for S3 object access
    
    Args:
        s3_path (str): S3 object path
        
    Returns:
        JsonResponse: Presigned URL with expiration details
    """
    try:
        logger.info(f"🔗 Generating presigned URL for S3 path: {s3_path}")
        
        # Validate s3_path
        if not s3_path or s3_path.strip() == "":
            return JsonResponse({
                "success": False,
                "message": "S3 path is required"
            }, status=400)
        
        # Clean the s3_path (remove leading slashes if present)
        clean_s3_path = s3_path.lstrip('/')
        
        # Generate presigned URL using the existing function
        presigned_url = generate_presigned_url(clean_s3_path, bucket_name="ddsfocustime", expiration=3600)
        
        if presigned_url:
            logger.info(f"✅ Successfully generated presigned URL for: {clean_s3_path}")
            return JsonResponse({
                "success": True,
                "message": f"Presigned URL generated successfully for {clean_s3_path}",
                "data": {
                    "s3_path": clean_s3_path,
                    "presigned_url": presigned_url,
                    "expires_in": 3600,
                    "bucket": "ddsfocustime"
                },
                "timestamp": datetime.now().isoformat()
            })
        else:
            logger.error(f"❌ Failed to generate presigned URL for: {clean_s3_path}")
            return JsonResponse({
                "success": False,
                "message": f"Failed to generate presigned URL for {clean_s3_path}",
                "data": {},
                "timestamp": datetime.now().isoformat()
            }, status=500)
            
    except Exception as e:
        logger.error(f"❌ Error generating presigned URL for {s3_path}: {str(e)}")
        return JsonResponse({
            "success": False,
            "message": f"Error generating presigned URL: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def employee_screenshots_search_api(request):
    """
    Search all screenshots for employees from S3 with advanced filtering and pagination
    
    Query Parameters:
    - email: Employee email (optional, if not provided returns all employees)
    - task_folder: Specific task folder (optional)
    - page: Page number (default: 1)
    - limit: Items per page (default: 50, max: 200)
    - date_from: Filter screenshots from date (YYYY-MM-DD)
    - date_to: Filter screenshots to date (YYYY-MM-DD)
    - continuation_token: S3 continuation token for true pagination
    
    Returns:
        JsonResponse: Employee screenshots with pagination
    """
    try:
        # Get query parameters
        email = request.GET.get('email', '').strip()
        task_folder = request.GET.get('task_folder', '').strip()
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 50)), 200)  # Max 200 per page
        date_from = request.GET.get('date_from', '').strip()
        date_to = request.GET.get('date_to', '').strip()
        continuation_token = request.GET.get('continuation_token', '').strip()
        fast_mode = request.GET.get('fast_mode', 'false').lower() == 'true'  # Skip accurate counting
        
        logger.info(f"🔍 Screenshot search - Email: {email}, Task: {task_folder}, Page: {page}")
        
        # Validate date format if provided
        if date_from and not validate_date_format(date_from):
            return JsonResponse({
                "success": False,
                "message": "Invalid date_from format. Use YYYY-MM-DD"
            }, status=400)
            
        if date_to and not validate_date_format(date_to):
            return JsonResponse({
                "success": False,
                "message": "Invalid date_to format. Use YYYY-MM-DD"
            }, status=400)
        
        # Get S3 client
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        if email:
            # Search for specific employee
            if not validate_email_format(email):
                return JsonResponse({
                    "success": False,
                    "message": "Invalid email format"
                }, status=400)
            
            # Check if employee exists in database
            try:
                staff = Staff.objects.get(email=email)
            except Staff.DoesNotExist:
                return JsonResponse({
                    "success": False,
                    "message": f"Employee with email {email} not found"
                }, status=404)
            
            # Get screenshots for specific employee
            result = get_employee_screenshots_paginated(
                s3_client, bucket_name, email, task_folder, 
                limit, continuation_token, date_from, date_to
            )
            
            return JsonResponse({
                "success": True,
                "message": f"Screenshots retrieved for {email}",
                "data": {
                    "employee": {
                        "email": staff.email,
                        "name": f"{staff.firstname} {staff.lastname}",
                        "staff_id": staff.staffid
                    },
                    "screenshots": result["screenshots"],
                    "pagination": {
                        "current_page": page,
                        "total_screenshots": result["total_count"],
                        "screenshots_per_page": limit,
                        "has_next": result["has_next"],
                        "continuation_token": result["next_token"],
                        "task_folder": task_folder or "all_tasks"
                    },
                    "filters": {
                        "date_from": date_from,
                        "date_to": date_to,
                        "task_folder": task_folder
                    }
                },
                "timestamp": datetime.now().isoformat()
            })
        else:
            # Get all employees and their screenshots
            all_staff = Staff.objects.all().order_by('firstname')
            employees_data = []
            
            for staff in all_staff:
                try:
                    if fast_mode:
                        # Fast mode: just check if folder exists (no counting)
                        s3_email_folder = staff.email.replace('@', '_at_')
                        prefix = f"screenshots/{s3_email_folder}/"
                        
                        # Quick check if any screenshots exist
                        response = s3_client.list_objects_v2(
                            Bucket=bucket_name,
                            Prefix=prefix,
                            MaxKeys=1
                        )
                        
                        has_screenshots = response.get('KeyCount', 0) > 0
                        screenshot_count = 1 if has_screenshots else 0  # Placeholder count
                    else:
                        # Accurate mode: get real screenshot count (slower)
                        screenshot_count = get_employee_total_screenshot_count(
                            s3_client, bucket_name, staff.email, task_folder, date_from, date_to
                        )
                        has_screenshots = screenshot_count > 0
                    
                    employees_data.append({
                        "employee": {
                            "email": staff.email,
                            "name": f"{staff.firstname} {staff.lastname}",
                            "staff_id": staff.staffid
                        },
                        "screenshot_count": screenshot_count,
                        "has_screenshots": has_screenshots,
                        "fast_mode": fast_mode
                    })
                except Exception as e:
                    logger.warning(f"Error getting screenshots for {staff.email}: {str(e)}")
                    employees_data.append({
                        "employee": {
                            "email": staff.email,
                            "name": f"{staff.firstname} {staff.lastname}",
                            "staff_id": staff.staffid
                        },
                        "screenshot_count": 0,
                        "has_screenshots": False,
                        "error": str(e),
                        "fast_mode": fast_mode
                    })
            
            # Apply pagination to employees list
            paginator = Paginator(employees_data, limit)
            try:
                page_obj = paginator.page(page)
            except:
                page_obj = paginator.page(1)
            
            return JsonResponse({
                "success": True,
                "message": f"All employees screenshots overview retrieved",
                "data": {
                    "employees": list(page_obj),
                    "pagination": {
                        "current_page": page_obj.number,
                        "total_pages": paginator.num_pages,
                        "total_employees": paginator.count,
                        "employees_per_page": limit,
                        "has_next": page_obj.has_next(),
                        "has_previous": page_obj.has_previous()
                    },
                    "filters": {
                        "date_from": date_from,
                        "date_to": date_to,
                        "task_folder": task_folder
                    }
                },
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"❌ Error in employee screenshots search: {str(e)}")
        return JsonResponse({
            "success": False,
            "message": f"Error searching screenshots: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)


def get_employee_total_screenshot_count(s3_client, bucket_name, email, task_folder=None, date_from=None, date_to=None):
    """
    Get accurate total screenshot count for an employee (optimized for count only)
    
    Args:
        s3_client: Boto3 S3 client
        bucket_name: S3 bucket name
        email: Employee email
        task_folder: Optional specific task folder
        date_from: Filter from date
        date_to: Filter to date
    
    Returns:
        int: Total screenshot count
    """
    try:
        # Convert email to S3 folder format (@ becomes _at_)
        s3_email_folder = email.replace('@', '_at_')
        
        # Build S3 prefix
        prefix = f"screenshots/{s3_email_folder}/"
        if task_folder:
            prefix += f"{task_folder}/"
        
        # Use paginator to get all objects efficiently
        total_count = 0
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Prefix=prefix
        )
        
        allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')
        
        # Count all matching screenshots
        for page in page_iterator:
            for obj in page.get("Contents", []):
                key = obj["Key"]
                
                # Filter by file extension
                if not key.lower().endswith(allowed_extensions):
                    continue
                
                # Apply date filters if provided
                if date_from or date_to:
                    file_date = obj["LastModified"]
                    
                    if date_from:
                        try:
                            from_date = datetime.strptime(date_from, "%Y-%m-%d").date()
                            if file_date.date() < from_date:
                                continue
                        except:
                            pass
                    
                    if date_to:
                        try:
                            to_date = datetime.strptime(date_to, "%Y-%m-%d").date()
                            if file_date.date() > to_date:
                                continue
                        except:
                            pass
                
                total_count += 1
        
        return total_count
        
    except Exception as e:
        logger.error(f"Error counting screenshots for {email}: {str(e)}")
        return 0


def get_employee_screenshots_paginated(s3_client, bucket_name, email, task_folder=None, 
                                     limit=50, continuation_token=None, date_from=None, date_to=None):
    """
    Get paginated screenshots for an employee from S3
    
    Args:
        s3_client: Boto3 S3 client
        bucket_name: S3 bucket name
        email: Employee email
        task_folder: Optional specific task folder
        limit: Number of screenshots per page
        continuation_token: S3 continuation token
        date_from: Filter from date
        date_to: Filter to date
    
    Returns:
        dict: Screenshots data with pagination info
    """
    try:
        # Convert email to S3 folder format (@ becomes _at_)
        s3_email_folder = email.replace('@', '_at_')
        
        # Build S3 prefix
        prefix = f"screenshots/{s3_email_folder}/"
        if task_folder:
            prefix += f"{task_folder}/"
        
        logger.info(f"🔍 Searching S3 with prefix: {prefix}")
        
        # First, get the total count by listing all objects (for accurate count)
        total_count = 0
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Prefix=prefix
        )
        
        allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')
        all_screenshots = []
        
        # Collect all screenshots for accurate count and filtering
        for page in page_iterator:
            for obj in page.get("Contents", []):
                key = obj["Key"]
                
                # Filter by file extension
                if not key.lower().endswith(allowed_extensions):
                    continue
                
                # Extract file info
                file_date = obj["LastModified"]
                
                # Apply date filters
                if date_from:
                    try:
                        from_date = datetime.strptime(date_from, "%Y-%m-%d").date()
                        if file_date.date() < from_date:
                            continue
                    except:
                        pass
                
                if date_to:
                    try:
                        to_date = datetime.strptime(date_to, "%Y-%m-%d").date()
                        if file_date.date() > to_date:
                            continue
                    except:
                        pass
                
                # Add to all screenshots list
                all_screenshots.append({
                    "key": key,
                    "obj": obj,
                    "file_date": file_date
                })
        
        # Get total count after filtering
        total_count = len(all_screenshots)
        
        # Sort by last modified (newest first)
        all_screenshots.sort(key=lambda x: x["file_date"], reverse=True)
        
        # Apply pagination to the sorted list
        start_idx = 0
        if continuation_token:
            try:
                start_idx = int(continuation_token)
            except:
                start_idx = 0
        
        end_idx = start_idx + limit
        paginated_screenshots = all_screenshots[start_idx:end_idx]
        
        # Process paginated screenshots
        screenshots = []
        for item in paginated_screenshots:
            key = item["key"]
            obj = item["obj"]
            
            # Generate presigned URL
            try:
                presigned_url = generate_presigned_url(key, bucket_name, 3600)
            except:
                presigned_url = None
            
            # Extract task name from path
            path_parts = key.replace(f"screenshots/{s3_email_folder}/", "").split("/")
            task_name = path_parts[0] if len(path_parts) > 1 else "root"
            filename = path_parts[-1]
            
            screenshots.append({
                "key": key,
                "filename": filename,
                "task_folder": task_name,
                "url": presigned_url,
                "last_modified": item["file_date"].isoformat(),
                "size": obj["Size"],
                "size_mb": round(obj["Size"] / (1024 * 1024), 2)
            })
        
        # Calculate next token
        next_token = None
        has_next = end_idx < total_count
        if has_next:
            next_token = str(end_idx)
        
        return {
            "screenshots": screenshots,
            "total_count": total_count,
            "has_next": has_next,
            "next_token": next_token,
            "prefix_searched": prefix
        }
        
    except Exception as e:
        logger.error(f"Error getting screenshots for {email}: {str(e)}")
        return {
            "screenshots": [],
            "total_count": 0,
            "has_next": False,
            "next_token": None,
            "error": str(e)
        }


@csrf_exempt
@require_http_methods(["GET"])
def employee_task_folders_api(request):
    """
    Get all task folders for all employees or specific employee
    
    Query Parameters:
    - email: Employee email (optional)
    
    Returns:
        JsonResponse: Employee task folders structure
    """
    try:
        email = request.GET.get('email', '').strip()
        
        # Get S3 client
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        if email:
            # Get task folders for specific employee
            if not validate_email_format(email):
                return JsonResponse({
                    "success": False,
                    "message": "Invalid email format"
                }, status=400)
            
            # Check if employee exists
            try:
                staff = Staff.objects.get(email=email)
            except Staff.DoesNotExist:
                return JsonResponse({
                    "success": False,
                    "message": f"Employee with email {email} not found"
                }, status=404)
            
            task_folders = get_employee_task_folders(s3_client, bucket_name, email)
            
            return JsonResponse({
                "success": True,
                "message": f"Task folders retrieved for {email}",
                "data": {
                    "employee": {
                        "email": staff.email,
                        "name": f"{staff.firstname} {staff.lastname}",
                        "staff_id": staff.staffid
                    },
                    "task_folders": task_folders,
                    "total_folders": len(task_folders)
                },
                "timestamp": datetime.now().isoformat()
            })
        else:
            # Get all employees and their task folders
            all_staff = Staff.objects.all().order_by('firstname')
            employees_folders = []
            
            for staff in all_staff:
                try:
                    task_folders = get_employee_task_folders(s3_client, bucket_name, staff.email)
                    employees_folders.append({
                        "employee": {
                            "email": staff.email,
                            "name": f"{staff.firstname} {staff.lastname}",
                            "staff_id": staff.staffid
                        },
                        "task_folders": task_folders,
                        "total_folders": len(task_folders)
                    })
                except Exception as e:
                    logger.warning(f"Error getting task folders for {staff.email}: {str(e)}")
                    employees_folders.append({
                        "employee": {
                            "email": staff.email,
                            "name": f"{staff.firstname} {staff.lastname}",
                            "staff_id": staff.staffid
                        },
                        "task_folders": [],
                        "total_folders": 0,
                        "error": str(e)
                    })
            
            return JsonResponse({
                "success": True,
                "message": "All employees task folders retrieved",
                "data": {
                    "employees": employees_folders,
                    "total_employees": len(employees_folders)
                },
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"❌ Error getting employee task folders: {str(e)}")
        return JsonResponse({
            "success": False,
            "message": f"Error getting task folders: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)


def get_employee_task_folders(s3_client, bucket_name, email):
    """
    Get all task folders for a specific employee
    
    Args:
        s3_client: Boto3 S3 client
        bucket_name: S3 bucket name
        email: Employee email
    
    Returns:
        list: Task folders with screenshot counts
    """
    try:
        # Convert email to S3 folder format (@ becomes _at_)
        s3_email_folder = email.replace('@', '_at_')
        prefix = f"screenshots/{s3_email_folder}/"
        
        logger.info(f"🔍 Getting task folders with prefix: {prefix}")
        
        # List all objects with the employee prefix
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix,
            Delimiter="/"
        )
        
        task_folders = []
        
        # Get folder prefixes (task folders)
        for folder_info in response.get("CommonPrefixes", []):
            folder_path = folder_info["Prefix"]
            folder_name = folder_path.replace(prefix, "").rstrip("/")
            
            # Get screenshot count for this folder
            folder_response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=folder_path
            )
            
            screenshot_count = 0
            total_size = 0
            allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')
            
            for obj in folder_response.get("Contents", []):
                if obj["Key"].lower().endswith(allowed_extensions):
                    screenshot_count += 1
                    total_size += obj["Size"]
            
            task_folders.append({
                "folder_name": folder_name,
                "folder_path": folder_path,
                "screenshot_count": screenshot_count,
                "total_size_mb": round(total_size / (1024 * 1024), 2)
            })
        
        # Also check for screenshots directly in the root employee folder
        root_response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix,
            Delimiter="/"
        )
        
        root_screenshots = 0
        root_size = 0
        allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')
        
        for obj in root_response.get("Contents", []):
            key = obj["Key"]
            # Only count files directly in the employee folder (not in subfolders)
            if key.count("/") == 2 and key.lower().endswith(allowed_extensions):
                root_screenshots += 1
                root_size += obj["Size"]
        
        if root_screenshots > 0:
            task_folders.append({
                "folder_name": "root",
                "folder_path": prefix,
                "screenshot_count": root_screenshots,
                "total_size_mb": round(root_size / (1024 * 1024), 2)
            })
        
        # Sort by screenshot count (descending)
        task_folders.sort(key=lambda x: x["screenshot_count"], reverse=True)
        
        return task_folders
        
    except Exception as e:
        logger.error(f"Error getting task folders for {email}: {str(e)}")
        return []
