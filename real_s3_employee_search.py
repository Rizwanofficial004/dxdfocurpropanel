#!/usr/bin/env python
"""
Real S3 Employee Search - Get Actual Employee Data
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

def get_real_employees_from_s3():
    """Get actual employee list from S3 bucket"""
    print("🔍 Searching S3 for Real Employee Data...")
    print("=" * 60)
    
    # S3 Configuration
    s3_client = boto3.client(
        "s3",
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="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",
        region_name="eu-north-1"
    )
    
    # Try different bucket names
    possible_buckets = [
        "ddsfocustime",
        "dds-focus-time", 
        "dxdfocustime",
        "dxd-focus-time"
    ]
    
    for bucket_name in possible_buckets:
        try:
            print(f"🔍 Checking bucket: {bucket_name}")
            
            # List all "folders" (prefixes) in the S3 bucket
            paginator = s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=bucket_name,
                Delimiter='/',
                Prefix=''
            )
            
            employee_folders = set()
            all_folders = []
            
            for page in page_iterator:
                # Get common prefixes (folders)
                if 'CommonPrefixes' in page:
                    for prefix in page['CommonPrefixes']:
                        folder_name = prefix['Prefix'].rstrip('/')
                        all_folders.append(folder_name)
                        
                        # Filter for employee folders (containing @ symbol)
                        if folder_name and not folder_name.startswith('.') and '@' in folder_name:
                            employee_folders.add(folder_name)
            
            print(f"✅ Successfully connected to bucket: {bucket_name}")
            print(f"📁 Total folders found: {len(all_folders)}")
            print(f"👥 Employee folders found: {len(employee_folders)}")
            print()
            
            # Display employee list
            if employee_folders:
                print("📋 ACTIVE EMPLOYEES LIST:")
                print("-" * 40)
                employee_list = sorted(list(employee_folders))
                for i, employee in enumerate(employee_list, 1):
                    print(f"{i:2d}. {employee}")
                print("-" * 40)
                print(f"🎯 TOTAL EMPLOYEES: {len(employee_list)}")
                
                # Also show first few non-employee folders for reference
                non_employee_folders = [f for f in all_folders if '@' not in f and not f.startswith('.')]
                if non_employee_folders:
                    print(f"\n📂 Other folders found: {len(non_employee_folders)}")
                    print("First 5 other folders:", non_employee_folders[:5])
                
                return {
                    'success': True,
                    'bucket_name': bucket_name,
                    'total_employees': len(employee_list),
                    'employee_list': employee_list,
                    'all_folders_count': len(all_folders)
                }
            else:
                print("⚠️ No employee folders found in this bucket")
                
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NoSuchBucket':
                print(f"❌ Bucket '{bucket_name}' does not exist")
            elif error_code == 'AccessDenied':
                print(f"🔒 Access denied to bucket '{bucket_name}'")
            else:
                print(f"💥 Error accessing bucket '{bucket_name}': {e}")
        except Exception as e:
            print(f"💥 Unexpected error with bucket '{bucket_name}': {e}")
        
        print()
    
    print("❌ Could not find any accessible bucket with employee data")
    return {
        'success': False,
        'error': 'No accessible bucket found'
    }

def test_s3_connection():
    """Test basic S3 connection"""
    print("🧪 Testing S3 Connection...")
    
    s3_client = boto3.client(
        "s3",
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="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",
        region_name="eu-north-1"
    )
    
    try:
        # List all buckets
        response = s3_client.list_buckets()
        print("✅ S3 Connection successful!")
        print("📁 Available buckets:")
        for bucket in response['Buckets']:
            print(f"   - {bucket['Name']} (created: {bucket['CreationDate']})")
        return True
    except Exception as e:
        print(f"❌ S3 Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 REAL S3 EMPLOYEE SEARCH")
    print("=" * 60)
    
    # Test connection first
    if test_s3_connection():
        print()
        # Get real employee data
        result = get_real_employees_from_s3()
        
        if result['success']:
            print(f"\n🎉 SUCCESS! Found {result['total_employees']} employees in bucket '{result['bucket_name']}'")
        else:
            print(f"\n❌ FAILED: {result.get('error', 'Unknown error')}")
    else:
        print("\n❌ Cannot proceed without S3 connection")
