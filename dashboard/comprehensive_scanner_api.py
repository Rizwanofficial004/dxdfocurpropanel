"""
Comprehensive Employee Folder Scanner API
Scans all folders against each employee and gets ALL screenshots from S3 with pagination
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.cache import cache
import logging
import json
import boto3
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from .api_views import api_response, validate_email_format, get_s3_client
from .aws_utils import generate_presigned_url

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def comprehensive_employee_folder_scanner_api(request):
    """
    Comprehensive Employee Folder Scanner API
    
    Features:
    - Scans ALL folders for ALL employees
    - S3 pagination support for accurate results
    - Parallel processing for performance
    - Complete screenshot retrieval with metadata
    - Caching for improved performance
    
    Query Parameters:
    - limit: Max screenshots per folder per employee (default: 500000 for unlimited)
    - employees: Comma-separated list of specific employees (optional)
    - date_from: Filter from date (YYYY-MM-DD) (optional)
    - date_to: Filter to date (YYYY-MM-DD) (optional)
    - include_screenshots: Include actual screenshot URLs (default: true)
    - cache_duration: Cache duration in minutes (default: 30)
    - parallel_processing: Use parallel processing (default: true)
    """
    try:
        # Get query parameters
        limit = int(request.GET.get('limit', 500000))  # Default to unlimited
        specific_employees = request.GET.get('employees', '').split(',') if request.GET.get('employees') else None
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        include_screenshots = request.GET.get('include_screenshots', 'true').lower() == 'true'
        cache_duration = int(request.GET.get('cache_duration', 30))  # minutes
        use_parallel = request.GET.get('parallel_processing', 'true').lower() == 'true'
        
        logger.info(f"🚀 Comprehensive Employee Folder Scanner started - limit: {limit}, parallel: {use_parallel}")
        
        start_time = datetime.now()
        
        # Check cache first
        cache_key = f"comprehensive_scan_{hash(str(sorted(request.GET.items())))}"
        cached_result = cache.get(cache_key)
        if cached_result:
            logger.info("📋 Returning cached comprehensive scan results")
            cached_result['cache_info'] = {
                'cache_hit': True,
                'cache_key': cache_key,
                'cached_at': cached_result.get('scan_timestamp')
            }
            return api_response(
                success=True,
                message="Comprehensive scan results (cached)",
                data=cached_result
            )
        
        # Step 1: Get all employees
        employees = get_all_employees(specific_employees)
        logger.info(f"👥 Found {len(employees)} employees to scan")
        
        # Step 2: Initialize S3 client
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        # Step 3: Scan all employees and folders
        if use_parallel:
            scan_results = scan_employees_parallel(
                s3_client, bucket_name, employees, limit, 
                date_from, date_to, include_screenshots
            )
        else:
            scan_results = scan_employees_sequential(
                s3_client, bucket_name, employees, limit,
                date_from, date_to, include_screenshots
            )
        
        # Step 4: Aggregate results
        total_processing_time = (datetime.now() - start_time).total_seconds()
        
        aggregated_data = {
            "scan_summary": {
                "total_employees_scanned": len(scan_results),
                "total_folders_found": sum(len(emp.get('folders', [])) for emp in scan_results),
                "total_screenshots_found": sum(
                    sum(folder.get('screenshot_count', 0) for folder in emp.get('folders', []))
                    for emp in scan_results
                ),
                "scan_timestamp": datetime.now().isoformat(),
                "processing_time_seconds": round(total_processing_time, 2),
                "processing_method": "parallel" if use_parallel else "sequential",
                "limit_per_folder": limit,
                "date_filter": {
                    "from": date_from,
                    "to": date_to
                }
            },
            "employees": scan_results,
            "performance_metrics": {
                "avg_time_per_employee": round(total_processing_time / max(len(employees), 1), 2),
                "screenshots_per_second": round(
                    sum(sum(folder.get('screenshot_count', 0) for folder in emp.get('folders', [])) for emp in scan_results) / max(total_processing_time, 1),
                    2
                ),
                "cache_enabled": True,
                "cache_duration_minutes": cache_duration
            }
        }
        
        # Cache results
        cache.set(cache_key, aggregated_data, cache_duration * 60)
        
        logger.info(f"✅ Comprehensive scan completed in {total_processing_time:.2f}s")
        
        return api_response(
            success=True,
            message=f"Comprehensive scan completed - {aggregated_data['scan_summary']['total_employees_scanned']} employees, {aggregated_data['scan_summary']['total_folders_found']} folders, {aggregated_data['scan_summary']['total_screenshots_found']} screenshots",
            data=aggregated_data
        )
        
    except Exception as e:
        logger.error(f"❌ Comprehensive scanner error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error in comprehensive scan: {str(e)}",
            status_code=500
        )


def get_all_employees(specific_employees=None):
    """Get all employees from CRM or use specific list"""
    try:
        if specific_employees and specific_employees[0]:  # Check if not empty string
            # Filter out empty strings
            filtered_employees = [email.strip() for email in specific_employees if email.strip()]
            logger.info(f"Using specific employees: {filtered_employees}")
            return [{"email": email} for email in filtered_employees]
        
        # Fetch from CRM
        headers = {
            "authtoken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        response = requests.get(
            "https://crm.deluxebilisim.com/api/staffs",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            crm_data = response.json()
            employees = [
                {
                    "email": emp.get('email'),
                    "name": emp.get('full_name', f"{emp.get('firstname', '')} {emp.get('lastname', '')}").strip(),
                    "staff_id": emp.get('staffid'),
                    "is_active": emp.get('active') == '1'
                }
                for emp in crm_data
                if emp.get('email') and emp.get('active') == '1'  # Only active employees
            ]
            logger.info(f"📡 Fetched {len(employees)} active employees from CRM")
            return employees
        else:
            logger.warning(f"⚠️ CRM API returned status {response.status_code}, using fallback list")
            
    except Exception as e:
        logger.error(f"❌ Error fetching employees: {str(e)}")
    
    # Fallback to known S3 users
    fallback_employees = [
        "amirishaque67@gmail.com",
        "atakankahram35@outlook.com",
        "begumdamlasen@gmail.com",
        "beyza-donmez-@hotmail.com",
        "bilgeryilmaz@gmail.com",
        "cagla.shr@gmail.com",
        "danish.ali9801@gmail.com",
        "deniz@deluxebilisim.com",
        "deniz@dxdglobal.com",
        "elif.ugrl@gmail.com",
        "fatih.onk@deluxebilisim.com",
        "frknaydinsmi@gmail.com",
        "gulsosyalmedya@gmail.com",
        "gulsummelisa.23@gmail.com",
        "haseebcodejourney@gmail.com",
        "huseyinturutuerek@gmail.com",
        "ilshe.avd2004@gmail.com",
        "kevserhuseyiin18@gmail.com",
        "m.belkilic@deluxebilisim.com",
        "m.fidan.firat@gmail.com",
        "mahboub.sad@gmail.com",
        "merveguduu.0044@gmail.com",
        "mirzashadf123@gmail.com",
        "mohsinabbass6886300@gmail.com",
        "nawaz@dxdglobal.com",
        "omerfarukyelgin@gmail.com",
        "ozgunhulyakaraoglan@gmail.com",
        "selimyalcnts@gmail.com",
        "tugbacalik84@gmail.com",
        "yunusseremkatirci@gmail.com",
        "yurukelmehekse@gmail.com",
        "zeynepbaygin60@gmail.com"
    ]
    
    return [{"email": email} for email in fallback_employees]


def scan_employees_parallel(s3_client, bucket_name, employees, limit, date_from, date_to, include_screenshots):
    """Scan employees in parallel for better performance"""
    logger.info(f"🔄 Starting parallel scan of {len(employees)} employees")
    
    scan_results = []
    
    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor(max_workers=5) as executor:  # Limit to 5 concurrent workers
        # Submit all tasks
        future_to_employee = {
            executor.submit(
                scan_single_employee,
                s3_client, bucket_name, employee, limit, date_from, date_to, include_screenshots
            ): employee
            for employee in employees
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_employee):
            employee = future_to_employee[future]
            try:
                result = future.result()
                scan_results.append(result)
                logger.info(f"✅ Completed scan for {employee.get('email')} - {len(result.get('folders', []))} folders")
            except Exception as e:
                logger.error(f"❌ Error scanning {employee.get('email')}: {str(e)}")
                # Add error result
                scan_results.append({
                    "employee_email": employee.get('email'),
                    "employee_name": employee.get('name', ''),
                    "scan_status": "error",
                    "error_message": str(e),
                    "folders": []
                })
    
    return scan_results


def scan_employees_sequential(s3_client, bucket_name, employees, limit, date_from, date_to, include_screenshots):
    """Scan employees sequentially"""
    logger.info(f"🔄 Starting sequential scan of {len(employees)} employees")
    
    scan_results = []
    
    for i, employee in enumerate(employees, 1):
        try:
            logger.info(f"📱 Scanning employee {i}/{len(employees)}: {employee.get('email')}")
            result = scan_single_employee(
                s3_client, bucket_name, employee, limit, date_from, date_to, include_screenshots
            )
            scan_results.append(result)
            logger.info(f"✅ Completed {i}/{len(employees)} - {len(result.get('folders', []))} folders found")
        except Exception as e:
            logger.error(f"❌ Error scanning {employee.get('email')}: {str(e)}")
            scan_results.append({
                "employee_email": employee.get('email'),
                "employee_name": employee.get('name', ''),
                "scan_status": "error",
                "error_message": str(e),
                "folders": []
            })
    
    return scan_results


def scan_single_employee(s3_client, bucket_name, employee, limit, date_from, date_to, include_screenshots):
    """Scan a single employee's folders and screenshots"""
    employee_email = employee.get('email')
    employee_name = employee.get('name', '')
    
    # Convert email to S3 folder format
    email_prefix = employee_email.replace('@', '_at_')
    s3_employee_path = f"screenshots/{email_prefix}/"
    
    employee_result = {
        "employee_email": employee_email,
        "employee_name": employee_name,
        "scan_status": "success",
        "folders": [],
        "total_folders": 0,
        "total_screenshots": 0,
        "scan_timestamp": datetime.now().isoformat()
    }
    
    try:
        # List all folders for this employee
        folders = list_employee_folders(s3_client, bucket_name, s3_employee_path)
        
        for folder_name in folders:
            folder_path = f"{s3_employee_path}{folder_name}/"
            
            # Apply date filter if specified
            if date_from or date_to:
                if is_date_folder(folder_name):
                    try:
                        folder_date = datetime.strptime(folder_name, '%Y-%m-%d')
                        if date_from and folder_date < datetime.strptime(date_from, '%Y-%m-%d'):
                            continue
                        if date_to and folder_date > datetime.strptime(date_to, '%Y-%m-%d'):
                            continue
                    except ValueError:
                        pass  # Not a date folder, skip date filtering
            
            # Scan folder screenshots
            folder_result = scan_folder_screenshots(
                s3_client, bucket_name, folder_path, folder_name, limit, include_screenshots
            )
            
            employee_result["folders"].append(folder_result)
            employee_result["total_screenshots"] += folder_result["screenshot_count"]
        
        employee_result["total_folders"] = len(employee_result["folders"])
        
    except Exception as e:
        employee_result["scan_status"] = "error"
        employee_result["error_message"] = str(e)
        logger.error(f"❌ Error scanning employee {employee_email}: {str(e)}")
    
    return employee_result


def list_employee_folders(s3_client, bucket_name, employee_path):
    """List all folders for an employee"""
    folders = set()
    continuation_token = None
    
    while True:
        list_params = {
            'Bucket': bucket_name,
            'Prefix': employee_path,
            'Delimiter': '/',
            'MaxKeys': 1000
        }
        
        if continuation_token:
            list_params['ContinuationToken'] = continuation_token
        
        try:
            response = s3_client.list_objects_v2(**list_params)
        except Exception as e:
            logger.error(f"❌ Error listing folders for {employee_path}: {str(e)}")
            break
        
        # Extract folder names from common prefixes
        for prefix in response.get('CommonPrefixes', []):
            folder_prefix = prefix['Prefix']
            # Extract folder name (remove employee path and trailing slash)
            folder_name = folder_prefix[len(employee_path):].rstrip('/')
            if folder_name:  # Skip empty folder names
                folders.add(folder_name)
        
        if not response.get('IsTruncated', False):
            break
        
        continuation_token = response.get('NextContinuationToken')
    
    return list(folders)


def scan_folder_screenshots(s3_client, bucket_name, folder_path, folder_name, limit, include_screenshots):
    """Scan screenshots in a single folder with S3 pagination"""
    folder_result = {
        "folder_name": folder_name,
        "folder_path": folder_path,
        "screenshot_count": 0,
        "screenshots": [] if include_screenshots else None,
        "scan_timestamp": datetime.now().isoformat(),
        "is_date_folder": is_date_folder(folder_name)
    }
    
    screenshot_count = 0
    screenshots = []
    continuation_token = None
    
    while True:
        list_params = {
            'Bucket': bucket_name,
            'Prefix': folder_path,
            'MaxKeys': 1000
        }
        
        if continuation_token:
            list_params['ContinuationToken'] = continuation_token
        
        try:
            response = s3_client.list_objects_v2(**list_params)
        except Exception as e:
            logger.warning(f"⚠️ Error listing {folder_path}: {str(e)}")
            break
        
        if 'Contents' not in response:
            break
        
        # Process screenshots in this batch
        for obj in response['Contents']:
            key = obj['Key']
            
            # Skip folder markers and non-image files
            if key.endswith('/') or not is_image_file(key):
                continue
            
            screenshot_count += 1
            
            # If we need to include screenshot details and haven't hit limit
            if include_screenshots and len(screenshots) < limit:
                filename = key.split('/')[-1]
                
                # Generate presigned URL
                try:
                    presigned_url = s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': bucket_name, 'Key': key},
                        ExpiresIn=7200  # 2 hours
                    )
                except Exception:
                    presigned_url = f"https://{bucket_name}.s3.eu-north-1.amazonaws.com/{key}"
                
                screenshot_info = {
                    "filename": filename,
                    "s3_key": key,
                    "presigned_url": presigned_url,
                    "size_bytes": obj.get('Size', 0),
                    "last_modified": obj.get('LastModified').isoformat() if obj.get('LastModified') else None,
                    "timestamp": extract_timestamp_from_filename(filename)
                }
                
                screenshots.append(screenshot_info)
            
            # Stop if we've reached the limit for counting
            if screenshot_count >= limit:
                break
        
        # Check if we should continue
        if not response.get('IsTruncated', False) or screenshot_count >= limit:
            break
        
        continuation_token = response.get('NextContinuationToken')
    
    folder_result["screenshot_count"] = screenshot_count
    if include_screenshots:
        folder_result["screenshots"] = screenshots
    
    return folder_result


def is_image_file(filename):
    """Check if file is an image"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'}
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    return f'.{ext}' in image_extensions


def is_date_folder(folder_name):
    """Check if folder name is a date (YYYY-MM-DD)"""
    try:
        datetime.strptime(folder_name, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def extract_timestamp_from_filename(filename):
    """Extract timestamp from screenshot filename"""
    try:
        # Common patterns: 2025-01-22_14-07-58 or similar
        import re
        patterns = [
            r'(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})',
            r'(\d{4}-\d{2}-\d{2})',
            r'(\d{2}-\d{2}-\d{4})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, filename)
            if match:
                return match.group(1)
    except Exception:
        pass
    
    return None


# ==================== ENHANCED SINGLE EMPLOYEE COMPREHENSIVE SCANNER ====================

@csrf_exempt
@require_http_methods(["GET"])
def enhanced_single_employee_scanner_api(request, employee_email):
    """
    Enhanced Single Employee Comprehensive Scanner
    Similar to the user's example: /api/screenshots/employee/haseebcodejourney@gmail.com/comprehensive-scan/
    
    Features:
    - Scans ALL folders for a specific employee
    - S3 pagination with unlimited support (limit=500000)
    - Detailed folder and screenshot analysis
    - Performance optimized
    """
    try:
        # Validate email
        if not validate_email_format(employee_email):
            return api_response(
                success=False,
                message="Invalid email format",
                status_code=400
            )
        
        # Get query parameters
        limit = int(request.GET.get('limit', 500000))
        include_screenshots = request.GET.get('include_screenshots', 'true').lower() == 'true'
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        logger.info(f"🔍 Enhanced single employee scan: {employee_email} (limit: {limit})")
        
        start_time = datetime.now()
        
        # Initialize S3
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        # Create employee object
        employee = {"email": employee_email, "name": ""}
        
        # Scan the employee
        result = scan_single_employee(
            s3_client, bucket_name, employee, limit, date_from, date_to, include_screenshots
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Enhanced response
        enhanced_result = {
            "employee_info": {
                "email": employee_email,
                "name": result.get("employee_name", ""),
                "scan_timestamp": result["scan_timestamp"]
            },
            "folder_summary": {
                "total_folders": result["total_folders"],
                "total_screenshots": result["total_screenshots"],
                "date_folders": len([f for f in result["folders"] if f.get("is_date_folder", False)]),
                "task_folders": len([f for f in result["folders"] if not f.get("is_date_folder", False)])
            },
            "folders": result["folders"],
            "performance": {
                "processing_time_seconds": round(processing_time, 2),
                "screenshots_per_second": round(result["total_screenshots"] / max(processing_time, 1), 2),
                "limit_applied": limit,
                "include_screenshot_details": include_screenshots
            },
            "scan_status": result["scan_status"]
        }
        
        if result["scan_status"] == "error":
            enhanced_result["error_message"] = result.get("error_message")
        
        return api_response(
            success=result["scan_status"] == "success",
            message=f"Enhanced scan completed for {employee_email} - {result['total_folders']} folders, {result['total_screenshots']} screenshots",
            data=enhanced_result
        )
        
    except Exception as e:
        logger.error(f"❌ Enhanced single employee scanner error: {str(e)}")
        return api_response(
            success=False,
            message=f"Error in enhanced employee scan: {str(e)}",
            status_code=500
        )
