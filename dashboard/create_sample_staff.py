#!/usr/bin/env python3
"""
Fetch dynamic staff data from S3 bucket instead of static data
"""
import os
import sys
import django
import boto3
from datetime import datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import Staff

def get_s3_client():
    """Get S3 client with credentials"""
    return boto3.client(
        's3',
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="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",
        region_name="eu-north-1"
    )

def create_dynamic_staff_from_s3():
    """Create staff data dynamically from S3 bucket structure"""
    print("🔧 Creating dynamic staff data from S3...")
    
    try:
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        # Get all employee folders from S3
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            Delimiter="/"
        )
        
        if 'CommonPrefixes' not in response:
            print("❌ No employee folders found in S3")
            return
        
        # Clear existing data
        Staff.objects.all().delete()
        print("🗑️ Cleared existing staff data")
        
        created_count = 0
        print(f"📁 Found {len(response['CommonPrefixes'])} employee folders in S3")
        
        for prefix_info in response['CommonPrefixes']:
            folder_path = prefix_info['Prefix']  # e.g., "screenshots/user@domain.com/"
            
            # Extract email from folder path
            email_part = folder_path.replace('screenshots/', '').rstrip('/')
            
            # Convert S3 folder format to email if needed
            if '_at_' in email_part:
                email = email_part.replace('_at_', '@')
            else:
                email = email_part
            
            # Skip if not valid email
            if '@' not in email:
                continue
            
            # Extract name from email
            username = email.split('@')[0]
            if '.' in username:
                name_parts = username.split('.')
                firstname = name_parts[0].title()
                lastname = name_parts[1].title() if len(name_parts) > 1 else 'User'
            else:
                firstname = username.title()
                lastname = 'User'
            
            # Generate staff ID
            staff_id = f"S3_{username.upper()}"
            
            # Create staff record
            staff_data = {
                'staffid': staff_id,
                'firstname': firstname,
                'lastname': lastname,
                'email': email
            }
            
            try:
                staff, created = Staff.objects.get_or_create(
                    email=email,
                    defaults=staff_data
                )
                
                if created:
                    created_count += 1
                    print(f"✅ Created: {firstname} {lastname} ({email})")
                else:
                    print(f"ℹ️ Already exists: {firstname} {lastname} ({email})")
                    
            except Exception as e:
                print(f"❌ Error creating {email}: {str(e)}")
        
        print(f"\n🎉 Created {created_count} staff members from S3 data")
        print(f"📊 Total staff in database: {Staff.objects.count()}")
        
        # List all staff
        print("\n👥 All Staff Members (from S3):")
        for staff in Staff.objects.all():
            print(f"   - {staff.firstname} {staff.lastname} ({staff.email}) [ID: {staff.staffid}]")
            
    except Exception as e:
        print(f"❌ Error connecting to S3: {str(e)}")
        print("🔄 Falling back to sample data...")
        create_sample_staff_fallback()

def create_sample_staff_fallback():
    """Fallback to sample data if S3 is not accessible"""
    
    # Clear existing staff data
    Staff.objects.all().delete()
    print("🗑️ Cleared existing staff data")
    
    # Create sample staff members
    staff_data = [
        {
            'staffid': 'EMP001',
            'firstname': 'Haseeb', 
            'lastname': 'Ahmed',
            'email': 'haseeb@deluxebilisim.com'
        },
        {
            'staffid': 'EMP002',
            'firstname': 'Admin',
            'lastname': 'User', 
            'email': 'admin@example.com'
        },
        {
            'staffid': 'EMP003',
            'firstname': 'Test',
            'lastname': 'User',
            'email': 'test@example.com'
        },
        {
            'staffid': 'EMP004',
            'firstname': 'John',
            'lastname': 'Doe',
            'email': 'john.doe@company.com'
        },
        {
            'staffid': 'EMP005',
            'firstname': 'Jane',
            'lastname': 'Smith',
            'email': 'jane.smith@company.com'
        }
    ]
    
    created_count = 0
    for staff_info in staff_data:
        try:
            staff, created = Staff.objects.get_or_create(
                email=staff_info['email'],
                defaults=staff_info
            )
            if created:
                created_count += 1
                print(f"✅ Created: {staff_info['firstname']} {staff_info['lastname']} ({staff_info['email']})")
            else:
                print(f"ℹ️ Already exists: {staff_info['firstname']} {staff_info['lastname']} ({staff_info['email']})")
        except Exception as e:
            print(f"❌ Error creating {staff_info['email']}: {str(e)}")
    
    print(f"\n🎉 Created {created_count} new staff members")
    print(f"📊 Total staff in database: {Staff.objects.count()}")
    
    # List all staff
    print("\n👥 All Staff Members:")
    for staff in Staff.objects.all():
        print(f"   - {staff.firstname} {staff.lastname} ({staff.email}) [ID: {staff.staffid}]")

if __name__ == "__main__":
    create_dynamic_staff_from_s3()
