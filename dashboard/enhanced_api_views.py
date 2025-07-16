"""
Enhanced Level 3 API with Advanced S3 Pagination
High performance implementation for large folders
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import logging
from datetime import datetime
from .enhanced_s3_pagination import s3_pagination_manager
from .api_views import api_response, validate_email_format, get_employee_display_name, format_folder_display_name

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def employee_folder_screenshots_enhanced_api(request, employee_email, folder_name):
    """
    Enhanced Employee Folder Screenshots API with intelligent pagination
    
    Features:
    - Automatic pagination strategy selection
    - Caching for better performance
    - Performance monitoring
    - Support for large folders (1000+ screenshots)
    
    Query Parameters:
    - page: Page number (default: 1)
    - limit: Items per page (default: 50, max: 100)
    - cache: Use caching (default: true)
    - force_method: Force pagination method ('traditional' or 's3_native')
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
        limit = int(request.GET.get('limit', 300))  # Increased default to match S3 behavior
        use_cache = request.GET.get('cache', 'true').lower() == 'true'
        force_method = request.GET.get('force_method', None)
        
        # Validate parameters
        if page < 1:
            page = 1
        if limit < 1 or limit > 500:  # Increased max limit for large folders
            limit = 300
        
        logger.info(f"Enhanced API request: {employee_email}/{folder_name} page={page} limit={limit}")
        
        start_time = datetime.now()
        
        # Get screenshots using enhanced pagination
        result = s3_pagination_manager.get_screenshots_page(
            employee_email=employee_email,
            folder_name=folder_name,
            page=page,
            limit=limit,
            use_cache=use_cache
        )
        
        api_processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Get employee info
        employee_name = get_employee_display_name(employee_email)
        
        # Parse folder date if it's a date folder
        folder_date = None
        try:
            folder_date = datetime.strptime(folder_name, '%Y-%m-%d')
        except ValueError:
            pass
        
        # Enhance folder info
        folder_info = {
            "folder_name": folder_name,
            "employee_name": employee_name,
            "employee_email": employee_email,
            "folder_display_name": format_folder_display_name(folder_name, folder_date),
            "is_date_folder": folder_date is not None,
            "folder_date": folder_date.isoformat() if folder_date else None
        }
        
        # Enhanced response with performance data
        response_data = {
            "folder_info": folder_info,
            "screenshots": result['screenshots'],
            "pagination": result['pagination'],
            "performance": {
                **result['performance'],
                'api_processing_time_ms': api_processing_time,
                'cache_enabled': use_cache,
                'optimization_suggestions': _get_optimization_suggestions(result)
            }
        }
        
        total_screenshots = result['pagination']['total_screenshots']
        message = f"Found {total_screenshots} screenshots in {folder_name} for {employee_email} (using {result['pagination']['pagination_method']} method)"
        
        return api_response(
            success=True,
            message=message,
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Enhanced folder screenshots API error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error retrieving folder screenshots: {str(e)}",
            status_code=500
        )

def _get_optimization_suggestions(result):
    """Generate optimization suggestions based on performance data"""
    suggestions = []
    
    total_screenshots = result['pagination']['total_screenshots']
    method_used = result['pagination']['pagination_method']
    processing_time = result['performance']['total_processing_time_ms']
    
    if total_screenshots > 1000 and method_used == 'traditional':
        suggestions.append("Consider using s3_native method for better performance with large folders")
    
    if processing_time > 5000:  # 5 seconds
        suggestions.append("Response time is high - consider reducing page size or using caching")
    
    if total_screenshots > 500 and result['pagination']['limit'] > 50:
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
        
        # Get total count
        total_count = s3_pagination_manager._get_total_count(employee_email, folder_name, use_cache=True)
        
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
    Clear cache for a specific folder
    Useful when new screenshots are added
    """
    try:
        if not validate_email_format(employee_email):
            return api_response(
                success=False,
                message="Invalid email format",
                status_code=400
            )
        
        # Clear cache
        s3_pagination_manager.clear_cache(employee_email, folder_name)
        
        return api_response(
            success=True,
            message=f"Cache cleared for {folder_name}",
            data={
                "folder_name": folder_name,
                "employee_email": employee_email,
                "cache_cleared": True
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
    Test both pagination methods and compare performance
    Useful for optimization analysis
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
        
        results = {}
        
        # Test traditional method
        try:
            start_time = datetime.now()
            traditional_result = s3_pagination_manager._get_screenshots_traditional(
                employee_email, folder_name, page, limit
            )
            traditional_time = (datetime.now() - start_time).total_seconds() * 1000
            
            results['traditional'] = {
                'processing_time_ms': traditional_time,
                'screenshot_count': len(traditional_result),
                'success': True
            }
        except Exception as e:
            results['traditional'] = {
                'processing_time_ms': 0,
                'screenshot_count': 0,
                'success': False,
                'error': str(e)
            }
        
        # Test S3 native method
        try:
            start_time = datetime.now()
            s3_native_result = s3_pagination_manager._get_screenshots_s3_native(
                employee_email, folder_name, page, limit
            )
            s3_native_time = (datetime.now() - start_time).total_seconds() * 1000
            
            results['s3_native'] = {
                'processing_time_ms': s3_native_time,
                'screenshot_count': len(s3_native_result),
                'success': True
            }
        except Exception as e:
            results['s3_native'] = {
                'processing_time_ms': 0,
                'screenshot_count': 0,
                'success': False,
                'error': str(e)
            }
        
        # Calculate recommendation
        if results['traditional']['success'] and results['s3_native']['success']:
            traditional_time = results['traditional']['processing_time_ms']
            s3_native_time = results['s3_native']['processing_time_ms']
            
            if traditional_time < s3_native_time:
                recommendation = "traditional"
                performance_gain = f"{((s3_native_time - traditional_time) / traditional_time * 100):.1f}% faster"
            else:
                recommendation = "s3_native"
                performance_gain = f"{((traditional_time - s3_native_time) / s3_native_time * 100):.1f}% faster"
        else:
            recommendation = "traditional" if results['traditional']['success'] else "s3_native"
            performance_gain = "N/A"
        
        test_data = {
            "test_parameters": {
                "employee_email": employee_email,
                "folder_name": folder_name,
                "page": page,
                "limit": limit
            },
            "results": results,
            "recommendation": {
                "method": recommendation,
                "performance_gain": performance_gain,
                "reasoning": _get_recommendation_reasoning(results, page, limit)
            }
        }
        
        return api_response(
            success=True,
            message="Performance test completed",
            data=test_data
        )
        
    except Exception as e:
        logger.error(f"Performance test API error: {str(e)}")
        return api_response(
            success=False,
            message="Error running performance test",
            status_code=500
        )

def _get_recommendation_reasoning(results, page, limit):
    """Generate reasoning for method recommendation"""
    if not results['traditional']['success']:
        return "Traditional method failed - use S3 native"
    
    if not results['s3_native']['success']:
        return "S3 native method failed - use traditional"
    
    traditional_time = results['traditional']['processing_time_ms']
    s3_native_time = results['s3_native']['processing_time_ms']
    
    if page <= 3:
        return f"Early pages are typically faster with traditional method (Traditional: {traditional_time:.1f}ms vs S3 Native: {s3_native_time:.1f}ms)"
    else:
        return f"Later pages benefit from S3 native pagination (Traditional: {traditional_time:.1f}ms vs S3 Native: {s3_native_time:.1f}ms)"
