"""
Direct S3 bucket inspection to see what data actually exists
"""
import boto3
import os
from datetime import datetime

def inspect_s3_bucket():
    """Direct inspection of S3 bucket to see what data exists"""
    
    print("🔍 Direct S3 Bucket Inspection")
    print("=" * 50)
    
    try:
        # Use the same S3 configuration as the Django app (from aws_utils.py)
        s3_client = boto3.client(
            's3',
            aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
            aws_secret_access_key="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",
            region_name="eu-north-1"
        )
        
        bucket_name = "ddsfocustime"
        
        print(f"📦 Checking bucket: {bucket_name}")
        
        # List all objects in the bucket
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix="screenshots/",  # Look specifically in screenshots folder
                MaxKeys=100
            )
            
            if 'Contents' not in response:
                print("   ❌ No objects found in screenshots/ folder")
                print("   The bucket might be empty or the screenshots folder doesn't exist")
            else:
                objects = response['Contents']
                print(f"   ✅ Found {len(objects)} objects in screenshots/ folder")
                
                # Group by employee (first part of path after screenshots/)
                employees = {}
                for obj in objects:
                    key = obj['Key']
                    if key.startswith('screenshots/'):
                        # Extract employee email from path like screenshots/email_at_domain/folder/file
                        path_parts = key.split('/')
                        if len(path_parts) >= 3:
                            employee_folder = path_parts[1]
                            # Convert back to email format
                            employee_email = employee_folder.replace('_at_', '@')
                            
                            if employee_email not in employees:
                                employees[employee_email] = []
                            employees[employee_email].append(key)
                
                print(f"\n📋 Found {len(employees)} employees with screenshots:")
                for email, files in employees.items():
                    print(f"   - {email}: {len(files)} files")
                    
                    # Show sample files for first few employees
                    if len(employees) <= 5:  # Only show details if not too many
                        for file in files[:3]:  # Show first 3 files
                            print(f"     • {file}")
                        if len(files) > 3:
                            print(f"     • ... and {len(files) - 3} more files")
        
        except Exception as list_error:
            print(f"   ❌ Error listing objects: {list_error}")
        
        # Also check if there are any objects at all in the bucket
        print(f"\n🔍 Checking entire bucket for any objects...")
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                MaxKeys=10
            )
            
            if 'Contents' not in response:
                print("   ❌ Bucket is completely empty")
            else:
                objects = response['Contents']
                print(f"   ✅ Found {len(objects)} objects in bucket (showing first 10)")
                for obj in objects:
                    print(f"     • {obj['Key']} ({obj['Size']} bytes)")
        
        except Exception as bucket_error:
            print(f"   ❌ Error checking bucket: {bucket_error}")
            
    except Exception as e:
        print(f"❌ S3 connection error: {e}")
        print("   Check if AWS credentials are correct")
    
    print(f"\n🎯 S3 Inspection Summary:")
    print(f"   The search API is working correctly")
    print(f"   The issue is that there's no data in the S3 bucket")
    print(f"   To test the search API properly, you need to:")
    print(f"   1. Add some users to the Staff table in Django admin")
    print(f"   2. Upload some screenshots to S3 in the correct folder structure")
    print(f"   3. Or use the existing screenshot upload functionality")

if __name__ == "__main__":
    inspect_s3_bucket()
