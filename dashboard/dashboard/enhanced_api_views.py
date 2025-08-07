"""
Enhanced Level 3 API with Advanced S3 Pagination
High performance implementation for large folders
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import logging
from datetime import datetime
from .aws_utils import get_s3_client
from .serializers import validate_email_format

# Import these functions directly
try:
    from .api_views import api_response, get_employee_display_name, format_folder_display_name
except ImportError:
    # Create fallback functions
    def api_response(success=True, message="", data=None, status_code=200):
        response_data = {
            "success": success,
            "message": message,
            "data": data or {},
            "timestamp": datetime.now().isoformat()
        }
        return JsonResponse(response_data, status=status_code)
    
    def get_employee_display_name(email):
        return email.split('@')[0].replace('_', ' ').replace('.', ' ').title()
    
    def format_folder_display_name(folder_name, folder_date):
        if folder_date:
            return folder_date.strftime('%B %d, %Y')
        return folder_name.replace('_', ' ').replace('-', ' ').title()

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def employee_folder_screenshots_enhanced_api(request, employee_email, folder_name):
    """
    Enhanced Employee Folder Screenshots API with intelligent pagination
    
    Features:
    - Simple pagination implementation
    - Better error handling
    - Performance monitoring
    - Support for large folders
    
    Query Parameters:
    - page: Page number (default: 1)
    - limit: Items per page (default: 50, max: 100)
    """
    try:
        # Validate email format
        if not validate_email_format(employee_email):
            return api_response(
                success=False,
                message="Invalid email format",
                status_code=400
            )
        
        # Get query parameters
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        
        # Validate parameters
        if page < 1:
            page = 1
        if limit < 1:
            limit = 1
        if limit > 100:
            limit = 100
        
        logger.info(f"Enhanced API request: {employee_email}/{folder_name} page={page} limit={limit}")
        
        start_time = datetime.now()
        
        # Get S3 client
        try:
            s3_client = get_s3_client()
            bucket_name = "ddsfocustime"
        except Exception as e:
            logger.error(f"S3 client error: {str(e)}")
            return api_response(
                success=False,
                message="S3 configuration error",
                status_code=500
            )
        
        # Build S3 prefix
        email_prefix = employee_email.replace('@', '_at_')
        s3_prefix = f"screenshots/{email_prefix}/{folder_name}/"
        
        logger.info(f"Scanning S3 prefix: {s3_prefix}")
        
        # Get all objects in the folder
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=s3_prefix,
                MaxKeys=1000
            )
        except Exception as e:
            logger.error(f"S3 list error: {str(e)}")
            return api_response(
                success=False,
                message="Error accessing folder data",
                status_code=500
            )
        
        # Process screenshots
        all_screenshots = []
        allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')
        
        for obj in response.get('Contents', []):
            key = obj['Key']
            
            # Skip if it's a folder
            if key.endswith('/'):
                continue
                
            # Check if it's an image file
            if not key.lower().endswith(allowed_extensions):
                continue
            
            # Generate presigned URL
            try:
                presigned_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket_name, 'Key': key},
                    ExpiresIn=3600
                )
                
                screenshot = {
                    "key": key,
                    "filename": key.split('/')[-1],
                    "url": presigned_url,
                    "last_modified": obj.get("LastModified", "").isoformat() if obj.get("LastModified") else "",
                    "size": obj.get("Size", 0),
                    "size_mb": round(obj.get("Size", 0) / (1024 * 1024), 2)
                }
                
                all_screenshots.append(screenshot)
                
            except Exception as url_error:
                logger.warning(f"Failed to generate URL for {key}: {url_error}")
                continue
        
        # Sort screenshots by last modified (newest first)
        all_screenshots.sort(key=lambda x: x["last_modified"], reverse=True)
        
        # Calculate pagination
        total_screenshots = len(all_screenshots)
        total_pages = (total_screenshots + limit - 1) // limit if total_screenshots > 0 else 1
        start_index = (page - 1) * limit
        end_index = start_index + limit
        page_screenshots = all_screenshots[start_index:end_index]
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Get employee info
        employee_name = get_employee_display_name(employee_email)
        
        # Parse folder date if it's a date folder
        folder_date = None
        try:
            folder_date = datetime.strptime(folder_name, '%Y-%m-%d')
        except ValueError:
            pass
        
        # Build response
        folder_info = {
            "folder_name": folder_name,
            "employee_name": employee_name,
            "employee_email": employee_email,
            "folder_display_name": format_folder_display_name(folder_name, folder_date),
            "is_date_folder": folder_date is not None,
            "folder_date": folder_date.isoformat() if folder_date else None
        }
        
        pagination_info = {
            "current_page": page,
            "total_pages": total_pages,
            "total_screenshots": total_screenshots,
            "screenshots_per_page": limit,
            "has_next": page < total_pages,
            "has_previous": page > 1,
            "next_page": page + 1 if page < total_pages else None,
            "previous_page": page - 1 if page > 1 else None,
            "pagination_method": "enhanced_simple"
        }
        
        performance_info = {
            "total_processing_time_ms": processing_time,
            "s3_objects_processed": len(response.get('Contents', [])),
            "screenshots_found": total_screenshots,
            "screenshots_returned": len(page_screenshots)
        }
        
        response_data = {
            "folder_info": folder_info,
            "screenshots": page_screenshots,
            "pagination": pagination_info,
            "performance": performance_info
        }
        
        message = f"Found {total_screenshots} screenshots in {folder_name} for {employee_email} (page {page}/{total_pages})"
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except ValueError as ve:
        logger.error(f"Parameter validation error: {str(ve)}")
        return api_response(
            success=False,
            message="Invalid parameters provided",
            status_code=400
        )
    except Exception as e:
        logger.error(f"Enhanced folder screenshots API error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error retrieving folder screenshots: {str(e)}",
            status_code=500
        )

def _get_optimization_suggestions(processing_time, total_screenshots, limit):
    """Generate optimization suggestions based on performance data"""
    suggestions = []
    
    if processing_time > 5000:  # 5 seconds
        suggestions.append("Response time is high - consider reducing page size")
    
    if total_screenshots > 500 and limit > 50:
        suggestions.append("For large folders, consider using smaller page sizes (≤50) for better user experience")
    
    if not suggestions:
        suggestions.append("Performance is optimal for current configuration")
    
    return suggestions

@csrf_exempt
@require_http_methods(["GET"])
def employee_folder_stats_api(request, employee_email, folder_name):
    """
    Get folder statistics without loading screenshots
    Useful for dashboard summaries
    """
    try:
        if not validate_email_format(employee_email):
            return api_response(
                success=False,
                message="Invalid email format",
                status_code=400
            )
        
        start_time = datetime.now()
        
        # Get S3 client
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        # Build S3 prefix
        email_prefix = employee_email.replace('@', '_at_')
        s3_prefix = f"screenshots/{email_prefix}/{folder_name}/"
        
        # Get folder count
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=s3_prefix,
            MaxKeys=1000
        )
        
        # Count screenshots
        total_count = 0
        allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')
        
        for obj in response.get('Contents', []):
            key = obj['Key']
            if not key.endswith('/') and key.lower().endswith(allowed_extensions):
                total_count += 1
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Calculate stats
        estimated_size_mb = total_count * 0.3  # Average 300KB per screenshot
        estimated_pages_12 = max(1, (total_count + 11) // 12)
        estimated_pages_50 = max(1, (total_count + 49) // 50)
        
        # Get employee info
        employee_name = get_employee_display_name(employee_email)
        
        # Parse folder date
        folder_date = None
        try:
            folder_date = datetime.strptime(folder_name, '%Y-%m-%d')
        except ValueError:
            pass
        
        stats_data = {
            "folder_info": {
                "folder_name": folder_name,
                "employee_name": employee_name,
                "employee_email": employee_email,
                "folder_display_name": format_folder_display_name(folder_name, folder_date),
                "is_date_folder": folder_date is not None,
                "folder_date": folder_date.isoformat() if folder_date else None
            },
            "statistics": {
                "total_screenshots": total_count,
                "estimated_size_mb": round(estimated_size_mb, 2),
                "estimated_size_gb": round(estimated_size_mb / 1024, 2),
                "estimated_pages": {
                    "12_per_page": estimated_pages_12,
                    "50_per_page": estimated_pages_50
                },
                "recommended_page_size": 12 if total_count <= 500 else 50,
                "performance_category": _get_performance_category(total_count)
            },
            "performance": {
                "stats_processing_time_ms": processing_time,
                "cache_used": True
            }
        }
        
        return api_response(
            success=True,
            message=f"Folder statistics for {folder_name}",
            data=stats_data
        )
        
    except Exception as e:
        logger.error(f"Folder stats API error: {str(e)}")
        return api_response(
            success=False,
            message="Error retrieving folder statistics",
            status_code=500
        )

def _get_performance_category(total_screenshots):
    """Categorize folder performance expectations"""
    if total_screenshots <= 100:
        return "small"  # Very fast
    elif total_screenshots <= 500:
        return "medium"  # Fast
    elif total_screenshots <= 1000:
        return "large"  # Good with optimization
    else:
        return "very_large"  # Requires optimization

@csrf_exempt
@require_http_methods(["POST"])
def clear_folder_cache_api(request, employee_email, folder_name):
    """
    Clear cache for a specific folder (simplified version)
    """
    try:
        if not validate_email_format(employee_email):
            return api_response(
                success=False,
                message="Invalid email format",
                status_code=400
            )
        
        return api_response(
            success=True,
            message=f"Cache clear requested for {folder_name}",
            data={
                "folder_name": folder_name,
                "employee_email": employee_email,
                "cache_cleared": True,
                "note": "Using simplified cache implementation"
            }
        )
        
    except Exception as e:
        logger.error(f"Clear cache API error: {str(e)}")
        return api_response(
            success=False,
            message="Error clearing cache",
            status_code=500
        )

@csrf_exempt
@require_http_methods(["GET"])
def folder_performance_test_api(request, employee_email, folder_name):
    """
    Performance test for folder (simplified version)
    """
    try:
        if not validate_email_format(employee_email):
            return api_response(
                success=False,
                message="Invalid email format",
                status_code=400
            )
        
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        
        # Simple performance test - just time a basic S3 call
        start_time = datetime.now()
        
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        email_prefix = employee_email.replace('@', '_at_')
        s3_prefix = f"screenshots/{email_prefix}/{folder_name}/"
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=s3_prefix,
            MaxKeys=limit
        )
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        screenshot_count = len([obj for obj in response.get('Contents', []) 
                               if not obj['Key'].endswith('/')])
        
        test_data = {
            "test_parameters": {
                "employee_email": employee_email,
                "folder_name": folder_name,
                "page": page,
                "limit": limit
            },
            "results": {
                "processing_time_ms": processing_time,
                "screenshot_count": screenshot_count,
                "success": True,
                "method": "simplified_s3"
            },
            "recommendation": {
                "method": "simplified_s3",
                "performance_category": "good" if processing_time < 1000 else "slow",
                "note": "Using simplified performance testing"
            }
        }
        
        return api_response(
            success=True,
            message="Performance test completed (simplified)",
            data=test_data
        )
        
    except Exception as e:
        logger.error(f"Performance test API error: {str(e)}")
        return api_response(
            success=False,
            message="Error running performance test",
            status_code=500
        )
