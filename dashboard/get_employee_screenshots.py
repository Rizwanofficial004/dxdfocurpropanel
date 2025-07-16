import boto3
import os
from urllib.parse import quote
from pathlib import Path
import hashlib
from datetime import datetime

ALLOWED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
AWS_REGION = "eu-north-1"
BUCKET_NAME = "ddsfocustime"
S3_BASE_PREFIX = "screenshots/"
LOCAL_SAVE_DIR = Path(__file__).resolve().parent / "media" / "screenshots"
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_FILE = BASE_DIR / "media" / "data" / "latest_screenshots.json"

s3 = boto3.client(
    "s3",  
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=AWS_REGION
)

def file_hash(path):
    with open(path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def generate_presigned_url(bucket_name, key_param):
    """Generate presigned URL for S3 object"""
    try:
        return s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": bucket_name,
                "Key": key_param
            },
            ExpiresIn=3600  # Link expires in 1 hour
        )
    except Exception as e:
        print(f"⚠️ Failed to generate presigned URL: {str(e)}")
        return ""
    
def scan_and_download_screenshots(email, date='', bool_flag=False):
    """
    Get screenshots for a specific email from S3 bucket.
    Returns list of screenshots with presigned URLs for API consumption.
    """
    screenshots = []
    modified_email = email.replace("@", "_at_")
    
    print(f"🔍 Scanning S3 bucket '{BUCKET_NAME}' for email: {email}")
   
    try:
        # Build S3 prefix for this user
        if date:
            prefix = f"{S3_BASE_PREFIX}{modified_email}/{date}/"
        else:
            prefix = f"{S3_BASE_PREFIX}{modified_email}/"
        
        # List objects in S3
        max_keys = 1000 if bool_flag else 50  # Limit results for performance
        response = s3.list_objects_v2(
            Bucket=BUCKET_NAME, 
            Prefix=prefix,
            MaxKeys=max_keys
        )
        
        contents = response.get("Contents", [])
        print(f"📸 Found {len(contents)} objects in S3 with prefix: {prefix}")
        
        # Process each object
        for obj in contents:
            key = obj["Key"]
            
            # Skip non-image files
            if not key.lower().endswith(ALLOWED_EXTENSIONS):
                continue
                
            # Parse the S3 key to extract metadata
            parts = key.replace(S3_BASE_PREFIX, "").split('/')
            if len(parts) < 2:
                print(f"⚠️ Skipping malformed path: {key}")
                continue
            
            email_folder = parts[0]
            date_or_task = parts[1] if len(parts) > 1 else ""
            filename = "/".join(parts[2:]) if len(parts) > 2 else parts[1]
            
            # Generate presigned URL
            presigned_url = generate_presigned_url(BUCKET_NAME, key)
            if not presigned_url:
                continue
                
            # Create screenshot object
            screenshot = {
                "key": key,
                "filename": filename,
                "date_folder": date_or_task,
                "url": presigned_url,
                "last_modified": obj.get("LastModified", "").isoformat() if obj.get("LastModified") else "",
                "size": obj.get("Size", 0)
            }
            
            screenshots.append(screenshot)
        
        print(f"✅ Successfully processed {len(screenshots)} screenshots for {email}")
        
        # Sort by last modified (newest first)
        screenshots.sort(key=lambda x: x["last_modified"], reverse=True)
        
        return {
            "image_urls": screenshots,
            "folder_map": {},  # Keep for backward compatibility
            "total_count": len(screenshots),
            "email": email,
            "prefix_used": prefix
        }

    except Exception as e:
        print(f"❌ Error scanning S3 screenshots: {e}")
        return {
            "image_urls": [], 
            "folder_map": {},
            "total_count": 0,
            "error": str(e)
        }

def get_all_employees_from_s3():
    """
    Dynamically discover all employees from S3 bucket by scanning the screenshots folder.
    Returns a list of all employee emails found in S3.
    """
    try:
        print(f"🔍 Scanning S3 bucket '{BUCKET_NAME}' for all employees...")
        
        # List all objects in the screenshots folder
        response = s3.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=S3_BASE_PREFIX,
            Delimiter='/'  # This helps us get only the top-level folders (employee emails)
        )
        
        employees = []
        
        # Get employee folders from CommonPrefixes
        for prefix_info in response.get('CommonPrefixes', []):
            prefix = prefix_info['Prefix']
            # Extract email from prefix: screenshots/email_folder/ -> email_folder
            email_folder = prefix.replace(S3_BASE_PREFIX, '').rstrip('/')
            
            # Convert back to email format: amirishaque67_at_gmail.com -> amirishaque67@gmail.com
            if '_at_' in email_folder:
                email = email_folder.replace('_at_', '@')
                employees.append({
                    'email': email,
                    'folder': email_folder,
                    'prefix': prefix
                })
        
        print(f"✅ Found {len(employees)} employees in S3")
        return employees
        
    except Exception as e:
        print(f"❌ Error getting employees from S3: {e}")
        return []

def get_all_employees_with_screenshots(limit_per_employee=10):
    """
    Get all employees from S3 with their latest screenshots.
    This is the main function for the live tracking API.
    """
    try:
        # Get all employees from S3
        employees = get_all_employees_from_s3()
        
        if not employees:
            return {
                "success": False,
                "message": "No employees found in S3",
                "data": []
            }
        
        employees_data = []
        
        for employee in employees:
            email = employee['email']
            
            try:
                # Get screenshots for this employee
                screenshots_data = scan_and_download_screenshots(
                    email, 
                    date='', 
                    bool_flag=True
                )
                
                screenshots_list = screenshots_data.get('image_urls', [])
                total_screenshots = len(screenshots_list)
                
                # Get latest screenshots for display
                latest_screenshots = screenshots_list[:limit_per_employee]
                
                # Calculate status based on latest screenshot
                status = "Offline"
                last_activity_time = None
                
                if latest_screenshots:
                    latest_screenshot = latest_screenshots[0]
                    last_modified = latest_screenshot.get('last_modified', '')
                    
                    if last_modified:
                        try:
                            from datetime import datetime
                            last_time = datetime.fromisoformat(last_modified.replace('Z', '+00:00'))
                            current_time = datetime.now()
                            
                            # Remove timezone for comparison
                            last_time = last_time.replace(tzinfo=None)
                            time_diff = current_time - last_time
                            minutes_ago = int(time_diff.total_seconds() / 60)
                            
                            last_activity_time = f"{minutes_ago} minutes ago" if minutes_ago > 0 else "Just now"
                            
                            # Determine status
                            if minutes_ago <= 10:
                                status = "Online"
                            elif minutes_ago <= 60:
                                status = "Idle"
                            else:
                                status = "Offline"
                                
                        except Exception as e:
                            print(f"Error parsing time for {email}: {e}")
                
                # Extract name from email (simple approach)
                name_part = email.split('@')[0]
                display_name = name_part.replace('.', ' ').replace('_', ' ').title()
                
                employee_data = {
                    "email": email,
                    "name": display_name,
                    "status": status,
                    "status_color": {
                        "Online": "#28a745",
                        "Idle": "#ffc107", 
                        "Offline": "#dc3545"
                    }.get(status, "#6c757d"),
                    "total_screenshots": total_screenshots,
                    "latest_screenshots": latest_screenshots,
                    "last_activity": last_activity_time,
                    "current_screenshot": latest_screenshots[0] if latest_screenshots else None,
                    "s3_folder": employee['folder'],
                    "s3_prefix": employee['prefix']
                }
                
                employees_data.append(employee_data)
                
            except Exception as e:
                print(f"Error processing employee {email}: {e}")
                continue
        
        # Sort by status priority (Online -> Idle -> Offline) and then by name
        status_priority = {"Online": 1, "Idle": 2, "Offline": 3}
        employees_data.sort(key=lambda x: (status_priority.get(x['status'], 4), x['name']))
        
        return {
            "success": True,
            "message": f"Found {len(employees_data)} employees with screenshots",
            "data": employees_data,
            "total_employees": len(employees_data),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error getting all employees with screenshots: {e}")
        return {
            "success": False,
            "message": f"Error: {str(e)}",
            "data": []
        }
def get_employee_basic_info_from_s3(limit_employees=10):
    """
    Fast version: Get basic employee info from S3 without processing all screenshots.
    Just gets the latest screenshot for status and basic info.
    """
    try:
        print(f"🔍 Fast scanning S3 bucket '{BUCKET_NAME}' for {limit_employees} employees...")
        
        # Get all employees first
        employees = get_all_employees_from_s3()
        
        if not employees:
            return {
                "success": False,
                "message": "No employees found in S3",
                "data": []
            }
        
        # Limit the number of employees to process
        limited_employees = employees[:limit_employees]
        employees_data = []
        
        for employee in limited_employees:
            email = employee['email']
            
            try:
                # Get only the LATEST screenshot for this employee (fast)
                prefix = f"{S3_BASE_PREFIX}{employee['folder']}/"
                
                response = s3.list_objects_v2(
                    Bucket=BUCKET_NAME, 
                    Prefix=prefix,
                    MaxKeys=20  # Only get 20 latest objects for speed
                )
                
                contents = response.get("Contents", [])
                
                # Filter for image files and sort by last modified
                screenshots = []
                for obj in contents:
                    key = obj["Key"]
                    if key.lower().endswith(ALLOWED_EXTENSIONS):
                        screenshots.append({
                            "key": key,
                            "filename": key.split('/')[-1],
                            "last_modified": obj.get("LastModified", "").isoformat() if obj.get("LastModified") else "",
                            "size": obj.get("Size", 0),
                            "url": generate_presigned_url(BUCKET_NAME, key)
                        })
                
                # Sort by last modified (newest first) and take only the latest
                screenshots.sort(key=lambda x: x["last_modified"], reverse=True)
                latest_screenshot = screenshots[0] if screenshots else None
                
                # Calculate status based on latest screenshot
                status = "Offline"
                last_activity_time = "Unknown"
                
                if latest_screenshot:
                    last_modified = latest_screenshot.get('last_modified', '')
                    if last_modified:
                        try:
                            last_time = datetime.fromisoformat(last_modified.replace('Z', '+00:00'))
                            current_time = datetime.now()
                            last_time = last_time.replace(tzinfo=None)
                            time_diff = current_time - last_time
                            minutes_ago = int(time_diff.total_seconds() / 60)
                            
                            if minutes_ago <= 10:
                                status = "Online"
                            elif minutes_ago <= 60:
                                status = "Idle"
                            else:
                                status = "Offline"
                            
                            last_activity_time = f"{minutes_ago} minutes ago" if minutes_ago > 0 else "Just now"
                        except:
                            pass
                
                # Extract name from email
                name_part = email.split('@')[0]
                display_name = name_part.replace('.', ' ').replace('_', ' ').title()
                
                employee_data = {
                    "email": email,
                    "name": display_name,
                    "status": status,
                    "status_color": {
                        "Online": "#28a745",
                        "Idle": "#ffc107", 
                        "Offline": "#dc3545"
                    }.get(status, "#6c757d"),
                    "total_screenshots": len(screenshots),  # Count from this batch
                    "latest_screenshot": latest_screenshot,
                    "last_activity": last_activity_time,
                    "s3_folder": employee['folder']
                }
                
                employees_data.append(employee_data)
                print(f"✅ Processed {email} - Status: {status}")
                
            except Exception as e:
                print(f"⚠️ Error processing {email}: {e}")
                continue
        
        # Sort by status priority
        status_priority = {"Online": 1, "Idle": 2, "Offline": 3}
        employees_data.sort(key=lambda x: (status_priority.get(x['status'], 4), x['name']))
        
        return {
            "success": True,
            "message": f"Found {len(employees_data)} employees (fast mode)",
            "data": employees_data,
            "total_employees": len(employees_data),
            "total_available": len(employees),
            "mode": "fast_scan"
        }
        
    except Exception as e:
        print(f"❌ Error in fast employee scan: {e}")
        return {
            "success": False,
            "message": f"Error: {str(e)}",
            "data": []
        }
def quick_screenshot_count(email):
    """
    Quick function to get approximate screenshot count without loading all URLs
    This is much faster than loading all screenshot URLs
    """
    try:
        # List objects with email prefix to count folders/files
        response = s3.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=f"{email}/",
            MaxKeys=1000  # Limit for quick count
        )
        
        # Count image files (approximate)
        count = 0
        if 'Contents' in response:
            for obj in response['Contents']:
                if obj['Key'].lower().endswith(ALLOWED_EXTENSIONS):
                    count += 1
        
        # If we hit the limit, estimate higher
        if response.get('IsTruncated', False):
            count = max(count, 1000)  # Assume at least 1000 if truncated
            
        return count
        
    except Exception as e:
        print(f"Error getting quick screenshot count for {email}: {str(e)}")
        return 0


