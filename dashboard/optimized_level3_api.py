#!/usr/bin/env python3
"""
Optimized Level 3 API Implementation with S3 Pagination
"""
import boto3
import os
import logging
from datetime import datetime
from django.http import JsonResponse

logger = logging.getLogger(__name__)

def get_s3_client():
    """Get S3 client with proper configuration"""
    return boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
        region_name="eu-north-1"
    )

def employee_folder_screenshots_optimized_api(request, employee_email, folder_name):
    """
    Optimized Level 3 API that uses S3 pagination instead of loading all objects
    """
    try:
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        
        # Validate pagination parameters
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:
            limit = 50
        
        # Initialize S3 client
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        # Convert email to S3 folder format
        email_prefix = employee_email.replace('@', '_at_')
        s3_folder_path = f"screenshots/{email_prefix}/{folder_name}/"
        
        logger.info(f"Fetching screenshots for {employee_email} from folder: {s3_folder_path}")
        
        # Use S3 pagination to get only what we need
        screenshots = []
        total_count = 0
        continuation_token = None
        items_to_skip = (page - 1) * limit
        items_collected = 0
        
        # First, get a rough count by fetching in chunks
        while True:
            list_params = {
                'Bucket': bucket_name,
                'Prefix': s3_folder_path,
                'MaxKeys': 1000
            }
            
            if continuation_token:
                list_params['ContinuationToken'] = continuation_token
            
            response = s3_client.list_objects_v2(**list_params)
            
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
                    screenshot_info = create_screenshot_info(s3_client, bucket_name, key, obj)
                    screenshots.append(screenshot_info)
                    items_collected += 1
                
                # If we have enough items for this page, we can stop
                if items_collected >= limit:
                    break
            
            # Check if we need to continue
            if not response.get('IsTruncated', False) or items_collected >= limit:
                break
            
            continuation_token = response.get('NextContinuationToken')
        
        # Calculate pagination info
        total_pages = max(1, (total_count + limit - 1) // limit)
        
        # Prepare response
        response_data = {
            "folder_info": {
                "folder_name": folder_name,
                "employee_email": employee_email,
                "folder_display_name": folder_name.replace('_', ' ').title(),
                "is_date_folder": is_date_folder(folder_name),
                "folder_date": get_folder_date(folder_name)
            },
            "screenshots": screenshots,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_screenshots": total_count,
                "limit": limit,
                "offset": items_to_skip,
                "has_next": page < total_pages,
                "has_previous": page > 1,
                "next_page": page + 1 if page < total_pages else None,
                "previous_page": page - 1 if page > 1 else None
            }
        }
        
        return JsonResponse({
            "success": True,
            "message": f"Found {total_count} screenshots in {folder_name} for {employee_email}",
            "data": response_data,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Optimized API error: {str(e)}")
        return JsonResponse({
            "success": False,
            "message": f"Error retrieving folder screenshots: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status=500)

def create_screenshot_info(s3_client, bucket_name, key, obj):
    """Create screenshot info object with presigned URL"""
    filename = key.split('/')[-1]
    
    # Generate presigned URL
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': key},
            ExpiresIn=7200  # 2 hours
        )
    except Exception as e:
        logger.warning(f"Could not generate presigned URL for {key}: {str(e)}")
        presigned_url = f"https://{bucket_name}.s3.eu-north-1.amazonaws.com/{key}"
    
    # Parse metadata from filename
    metadata = parse_simple_metadata(filename)
    
    return {
        "id": f"screenshot_{hash(key) % 1000000}",
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
        "thumbnail_url": None
    }

def parse_simple_metadata(filename):
    """Parse basic metadata from filename"""
    import re
    
    # Try to extract timestamp from filename
    date_time_pattern = r'(\d{4}-\d{2}-\d{2})[_-](\d{2})[_-](\d{2})[_-](\d{2})'
    match = re.search(date_time_pattern, filename)
    
    if match:
        date_part = match.group(1)
        hour = match.group(2)
        minute = match.group(3)
        second = match.group(4)
        timestamp_str = f"{date_part}T{hour}:{minute}:{second}Z"
    else:
        timestamp_str = datetime.now().isoformat()
    
    # Generate time display
    try:
        dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        time_display = dt.strftime('%I:%M %p')
    except:
        time_display = "Unknown"
    
    return {
        "timestamp": timestamp_str,
        "time_display": time_display,
        "application": "Unknown Application",
        "window_title": filename.replace('.webp', '').replace('.png', '').replace('.jpg', '')
    }

def is_image_file(filename):
    """Check if the file is an image"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'}
    ext = os.path.splitext(filename.lower())[1]
    return ext in image_extensions

def is_date_folder(folder_name):
    """Check if folder name is a date"""
    try:
        datetime.strptime(folder_name, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def get_folder_date(folder_name):
    """Get folder date if it's a date folder"""
    try:
        folder_date = datetime.strptime(folder_name, '%Y-%m-%d')
        return folder_date.isoformat()
    except ValueError:
        return None

if __name__ == "__main__":
    print("This is an optimized API implementation module.")
    print("To use this, replace the existing API function with the optimized version.")
