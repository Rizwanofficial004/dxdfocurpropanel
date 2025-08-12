#!/usr/bin/env python3
"""
Debug specific user - Test amirishaque67@gmail.com
"""
import os
import sys
import django

# Add the project directory to the Python path
project_path = r"c:\Users\deniz\OneDrive\Email attachments\Masaüstü\Git-Projects\dxdfocurpropanel"
sys.path.append(project_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
os.chdir(project_path)
django.setup()

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from dashboard.aws_utils import get_s3_client

def test_specific_user():
    """Test the specific user we know has screenshots"""
    print("🔍 Testing specific user: amirishaque67@gmail.com")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = 'ddsfocustime'
    
    # Test different key formats
    email = "amirishaque67@gmail.com"
    
    key_formats = [
        email.replace('@', '_at_').replace('.', '_'),    # amirishaque67_at_gmail_com
        email,                                           # amirishaque67@gmail.com  
        email.replace('@', '_at_'),                      # amirishaque67_at_gmail.com
        email.replace('.', '_'),                         # amirishaque67@gmail_com
    ]
    
    for i, key_format in enumerate(key_formats, 1):
        prefix = f"screenshots/{key_format}/"
        print(f"\n📋 Test {i}: Checking prefix '{prefix}'")
        print("-" * 40)
        
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=prefix,
                MaxKeys=10
            )
            
            if 'Contents' in response:
                screenshot_objects = [
                    obj for obj in response['Contents'] 
                    if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
                    and not obj['Key'].endswith('/')
                ]
                
                print(f"   ✅ Found {len(screenshot_objects)} screenshots!")
                if screenshot_objects:
                    print(f"   📸 Sample screenshots:")
                    for j, obj in enumerate(screenshot_objects[:3], 1):
                        print(f"      {j}. {obj['Key']}")
                        
                    return key_format  # Return the working format
            else:
                print(f"   ❌ No objects found")
                
        except Exception as e:
            print(f"   💥 Error: {e}")
    
    print(f"\n🤔 None of the key formats worked. Let me check what's actually in S3...")
    
    # Check what's actually in the screenshots folder
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            Delimiter="/",
            MaxKeys=50
        )
        
        if 'CommonPrefixes' in response:
            print(f"\n📁 Found these user folders in screenshots/:")
            for prefix in response['CommonPrefixes'][:10]:
                folder_name = prefix['Prefix'].replace('screenshots/', '').replace('/', '')
                print(f"   - {folder_name}")
                if 'amirishaque' in folder_name.lower():
                    print(f"     👆 This looks like our user!")
                    return folder_name
    except Exception as e:
        print(f"💥 Error listing folders: {e}")
    
    return None

def test_working_format(user_key):
    """Test with the working format"""
    if not user_key:
        print("❌ No working format found")
        return
        
    print(f"\n🎯 Testing with working format: '{user_key}'")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = 'ddsfocustime'
    
    prefix = f"screenshots/{user_key}/"
    
    try:
        # Count all screenshots
        total_count = 0
        continuation_token = None
        
        while True:
            list_params = {
                'Bucket': bucket_name,
                'Prefix': prefix,
                'MaxKeys': 1000
            }
            if continuation_token:
                list_params['ContinuationToken'] = continuation_token
            
            response = s3_client.list_objects_v2(**list_params)
            
            if 'Contents' in response:
                screenshot_objects = [
                    obj for obj in response['Contents'] 
                    if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
                    and not obj['Key'].endswith('/')
                ]
                
                total_count += len(screenshot_objects)
                
                if total_count <= 10:  # Show first few
                    for obj in screenshot_objects:
                        parts = obj['Key'].split('/')
                        project = parts[2] if len(parts) > 2 else "unknown"
                        print(f"   📸 {obj['Key']}")
                        print(f"      Project: {project}")
                        print(f"      Size: {obj['Size']} bytes")
                        print(f"      Date: {obj['LastModified']}")
                        print()
            
            # Check if there are more objects to retrieve
            if response.get('IsTruncated'):
                continuation_token = response.get('NextContinuationToken')
            else:
                break
        
        print(f"🎉 Total screenshots found: {total_count}")
        
    except Exception as e:
        print(f"💥 Error: {e}")

if __name__ == "__main__":
    working_format = test_specific_user()
    test_working_format(working_format)
