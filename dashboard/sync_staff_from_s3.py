#!/usr/bin/env python3
"""
Fetch real staff data from S3 bucket dynamically
"""
import os
import sys
import django
import boto3
from datetime import datetime, timedelta
import re

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import Staff

def get_s3_client():
    """Initialize S3 client with credentials"""
    return boto3.client(
        's3',
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="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",
        region_name="eu-north-1"
    )

def extract_email_from_s3_path(s3_prefix):
    """Extract email from S3 path format"""
    # Handle formats like:
    # - screenshots/user_at_domain.com/
    # - screenshots/user@domain.com/
    # - screenshots/user.name_at_company.com/
    
    if '_at_' in s3_prefix:
        # Format: user_at_domain.com -> user@domain.com
        email = s3_prefix.replace('_at_', '@')
    else:
        # Already in email format
        email = s3_prefix
    
    return email

def extract_name_from_email(email):
    """Extract first/last name from email"""
    username = email.split('@')[0]
    
    # Handle common email patterns
    if '.' in username:
        parts = username.split('.')
        firstname = parts[0].title()
        lastname = parts[1].title() if len(parts) > 1 else ''
    elif '_' in username:
        parts = username.split('_')
        firstname = parts[0].title()
        lastname = parts[1].title() if len(parts) > 1 else ''
    else:
        firstname = username.title()
        lastname = ''
    
    return firstname, lastname

def fetch_staff_from_s3():
    """Fetch real staff data from S3 bucket"""
    print("🔍 Fetching real staff data from S3 bucket...")
    
    try:
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        print(f"📡 Connecting to S3 bucket: {bucket_name}")
        
        # List all objects in screenshots/ folder to find employees
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            Delimiter="/"
        )
        
        if 'CommonPrefixes' not in response:
            print("❌ No employee folders found in S3")
            return []
        
        employees = []
        print(f"📁 Found {len(response['CommonPrefixes'])} employee folders")
        
        for prefix_info in response['CommonPrefixes']:
            prefix = prefix_info['Prefix']
            # Extract email from path: screenshots/email/ -> email
            email_part = prefix.replace('screenshots/', '').rstrip('/')
            
            if not email_part:
                continue
                
            # Convert S3 path format to email
            email = extract_email_from_s3_path(email_part)
            
            # Skip if not a valid email format
            if '@' not in email or '.' not in email:
                print(f"⚠️ Skipping invalid email format: {email}")
                continue
            
            # Extract names from email
            firstname, lastname = extract_name_from_email(email)
            
            # Count screenshots for this employee
            screenshot_count = 0
            last_activity = None
            
            try:
                screenshots_response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=f"screenshots/{email_part}/",
                    MaxKeys=1000
                )
                
                if 'Contents' in screenshots_response:
                    # Count actual files (not folders)
                    files = [obj for obj in screenshots_response['Contents'] 
                            if not obj['Key'].endswith('/') and 
                            obj['Key'].lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif'))]
                    
                    screenshot_count = len(files)
                    
                    if files:
                        # Get latest file modification time
                        latest_file = max(files, key=lambda x: x['LastModified'])
                        last_activity = latest_file['LastModified']
                
            except Exception as e:
                print(f"⚠️ Could not count screenshots for {email}: {str(e)}")
            
            # Generate staff ID
            staff_id = f"EMP_{email.split('@')[0].upper()}"
            
            employee_data = {
                'staffid': staff_id,
                'firstname': firstname,
                'lastname': lastname,
                'email': email,
                'screenshot_count': screenshot_count,
                'last_activity': last_activity,
                's3_path': email_part
            }
            
            employees.append(employee_data)
            print(f"✅ Found: {firstname} {lastname} ({email}) - {screenshot_count} screenshots")
        
        print(f"\n📊 Total employees found in S3: {len(employees)}")
        return employees
        
    except Exception as e:
        print(f"❌ Error fetching data from S3: {str(e)}")
        return []

def sync_staff_with_s3():
    """Sync database staff with real S3 data"""
    print("🔄 Syncing staff database with S3 data...")
    
    # Fetch real data from S3
    s3_employees = fetch_staff_from_s3()
    
    if not s3_employees:
        print("❌ No employees found in S3, keeping existing data")
        return
    
    # Clear existing static data
    print("🗑️ Clearing existing static staff data...")
    Staff.objects.all().delete()
    
    # Add real employees from S3
    created_count = 0
    updated_count = 0
    
    for emp_data in s3_employees:
        try:
            staff, created = Staff.objects.get_or_create(
                email=emp_data['email'],
                defaults={
                    'staffid': emp_data['staffid'],
                    'firstname': emp_data['firstname'],
                    'lastname': emp_data['lastname']
                }
            )
            
            if created:
                created_count += 1
                status = "✅ Created"
            else:
                # Update existing record
                staff.firstname = emp_data['firstname']
                staff.lastname = emp_data['lastname']
                staff.staffid = emp_data['staffid']
                staff.save()
                updated_count += 1
                status = "🔄 Updated"
            
            activity_info = ""
            if emp_data['last_activity']:
                days_ago = (datetime.now().replace(tzinfo=None) - emp_data['last_activity'].replace(tzinfo=None)).days
                activity_info = f" (last activity: {days_ago} days ago)"
            
            print(f"{status}: {emp_data['firstname']} {emp_data['lastname']} ({emp_data['email']}) - {emp_data['screenshot_count']} screenshots{activity_info}")
            
        except Exception as e:
            print(f"❌ Error creating {emp_data['email']}: {str(e)}")
    
    print(f"\n🎉 Sync complete!")
    print(f"✅ Created: {created_count} new staff members")
    print(f"🔄 Updated: {updated_count} existing staff members")
    print(f"📊 Total staff in database: {Staff.objects.count()}")
    
    # Show summary
    print(f"\n👥 Real Staff Members from S3:")
    for staff in Staff.objects.all().order_by('firstname'):
        print(f"   - {staff.firstname} {staff.lastname} ({staff.email}) [ID: {staff.staffid}]")

def test_s3_connection():
    """Test S3 connection and bucket access"""
    print("🧪 Testing S3 connection...")
    
    try:
        s3_client = get_s3_client()
        
        # Test bucket access
        response = s3_client.head_bucket(Bucket="ddsfocustime")
        print("✅ S3 connection successful")
        
        # Test listing objects
        response = s3_client.list_objects_v2(
            Bucket="ddsfocustime",
            Prefix="screenshots/",
            MaxKeys=5
        )
        
        if 'Contents' in response:
            print(f"✅ Found {len(response['Contents'])} objects in screenshots/")
            for obj in response['Contents'][:3]:
                print(f"   - {obj['Key']}")
        else:
            print("⚠️ No objects found in screenshots/ folder")
            
        return True
        
    except Exception as e:
        print(f"❌ S3 connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 S3 Dynamic Staff Data Sync")
    print("=" * 50)
    
    # Test connection first
    if test_s3_connection():
        print("\n" + "=" * 50)
        sync_staff_with_s3()
    else:
        print("❌ Cannot proceed without S3 connection")
