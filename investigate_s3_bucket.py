#!/usr/bin/env python
"""
Detailed S3 Bucket Investigation
"""
import os
import django
import sys
import boto3
from botocore.exceptions import ClientError

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

def investigate_s3_bucket():
    """Investigate what's actually in the S3 bucket"""
    print("🔍 DETAILED S3 BUCKET INVESTIGATION")
    print("=" * 60)
    
    # S3 Configuration
    s3_client = boto3.client(
        "s3",
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="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",
        region_name="eu-north-1"
    )
    
    bucket_name = "ddsfocustime"
    
    try:
        print(f"📁 Investigating bucket: {bucket_name}")
        print()
        
        # Method 1: List with delimiter to see folder structure
        print("🔍 METHOD 1: Folder Structure (with delimiter)")
        print("-" * 50)
        
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Delimiter='/',
            Prefix=''
        )
        
        folders = []
        files = []
        
        for page in page_iterator:
            # Common prefixes (folders)
            if 'CommonPrefixes' in page:
                for prefix in page['CommonPrefixes']:
                    folder_name = prefix['Prefix'].rstrip('/')
                    folders.append(folder_name)
                    print(f"📁 FOLDER: {folder_name}")
            
            # Files in root
            if 'Contents' in page:
                for obj in page['Contents']:
                    if not obj['Key'].endswith('/'):
                        files.append(obj['Key'])
                        print(f"📄 FILE: {obj['Key']} (Size: {obj['Size']} bytes)")
        
        print(f"\n📊 SUMMARY:")
        print(f"   - Folders found: {len(folders)}")
        print(f"   - Files in root: {len(files)}")
        
        # Method 2: Look deeper into each folder
        print(f"\n🔍 METHOD 2: Deep Dive into Each Folder")
        print("-" * 50)
        
        for folder in folders:
            print(f"\n📁 Exploring folder: {folder}")
            
            # List contents of this folder
            folder_paginator = s3_client.get_paginator('list_objects_v2')
            folder_page_iterator = folder_paginator.paginate(
                Bucket=bucket_name,
                Prefix=f"{folder}/",
                Delimiter='/'
            )
            
            subfolders = []
            folder_files = []
            
            for page in folder_page_iterator:
                # Subfolders
                if 'CommonPrefixes' in page:
                    for prefix in page['CommonPrefixes']:
                        subfolder_name = prefix['Prefix'].replace(f"{folder}/", "").rstrip('/')
                        if subfolder_name:  # Don't include empty strings
                            subfolders.append(subfolder_name)
                            print(f"   📁 Subfolder: {subfolder_name}")
                
                # Files in this folder
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if obj['Key'] != f"{folder}/" and not obj['Key'].endswith('/'):
                            file_name = obj['Key'].replace(f"{folder}/", "")
                            folder_files.append(file_name)
                            print(f"   📄 File: {file_name}")
            
            print(f"   📊 Folder '{folder}' contains: {len(subfolders)} subfolders, {len(folder_files)} files")
            
            # If this looks like it might contain employee data, explore deeper
            if len(subfolders) > 0:
                print(f"   🔍 First 10 subfolders in '{folder}':")
                for i, subfolder in enumerate(subfolders[:10]):
                    print(f"      {i+1}. {subfolder}")
                    
                    # Check if subfolder looks like an email
                    if '@' in subfolder:
                        print(f"         ✅ This looks like an employee email!")
        
        # Method 3: Search for all objects with email-like patterns
        print(f"\n🔍 METHOD 3: Searching for Email Patterns")
        print("-" * 50)
        
        all_paginator = s3_client.get_paginator('list_objects_v2')
        all_page_iterator = all_paginator.paginate(Bucket=bucket_name)
        
        email_patterns = []
        total_objects = 0
        
        for page in all_page_iterator:
            if 'Contents' in page:
                for obj in page['Contents']:
                    total_objects += 1
                    key = obj['Key']
                    
                    # Look for email patterns in the key
                    if '@' in key:
                        email_patterns.append(key)
                        print(f"📧 Email pattern found: {key}")
        
        print(f"\n📊 FINAL SUMMARY:")
        print(f"   - Total objects in bucket: {total_objects}")
        print(f"   - Objects with email patterns: {len(email_patterns)}")
        print(f"   - Root folders: {folders}")
        
        if email_patterns:
            print(f"\n👥 POTENTIAL EMPLOYEE DATA:")
            # Extract unique email addresses from paths
            emails = set()
            for pattern in email_patterns:
                parts = pattern.split('/')
                for part in parts:
                    if '@' in part and '.' in part:
                        emails.add(part)
            
            email_list = sorted(list(emails))
            for i, email in enumerate(email_list, 1):
                print(f"   {i}. {email}")
            
            print(f"\n🎯 TOTAL UNIQUE EMPLOYEES FOUND: {len(email_list)}")
            return {
                'success': True,
                'total_employees': len(email_list),
                'employee_list': email_list,
                'bucket_structure': folders
            }
        else:
            print("\n⚠️ No email patterns found in bucket")
            return {
                'success': False,
                'total_employees': 0,
                'bucket_structure': folders
            }
        
    except Exception as e:
        print(f"💥 Error investigating bucket: {e}")
        return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    result = investigate_s3_bucket()
    
    if result['success']:
        print(f"\n🎉 Investigation complete! Found {result['total_employees']} employees.")
    else:
        print(f"\n❌ Investigation failed: {result.get('error', 'Unknown error')}")
