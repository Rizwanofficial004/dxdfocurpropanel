#!/usr/bin/env python3
"""
S3 Folder Discovery Debug Script
Debug why Level 2 API returns 0 folders despite S3 containing data
"""

import sys
import os
import django
from pathlib import Path

# Add the project directory to Python path
project_dir = Path(__file__).parent
sys.path.insert(0, str(project_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard.settings')
django.setup()

from dashboard.aws_utils import get_s3_client

def debug_s3_folder_discovery():
    """Debug S3 folder discovery for haseebcodejourney@gmail.com"""
    
    try:
        # Initialize S3 client
        s3_client = get_s3_client()
        bucket_name = 'ddsfocustime'
        
        # Test employee email
        employee_email = 'haseebcodejourney@gmail.com'
        email_prefix = employee_email.replace('@', '_at_')
        s3_prefix = f'screenshots/{email_prefix}/'
        
        print("="*60)
        print("S3 FOLDER DISCOVERY DEBUG")
        print("="*60)
        print(f"Employee email: {employee_email}")
        print(f"Email prefix: {email_prefix}")
        print(f"S3 prefix: {s3_prefix}")
        print(f"Bucket: {bucket_name}")
        print()
        
        # Test 1: List with Delimiter (API method)
        print("TEST 1: list_objects_v2 with Delimiter='/' (API method)")
        print("-" * 50)
        
        try:
            response1 = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=s3_prefix,
                Delimiter='/'
            )
            
            print(f"Response keys: {list(response1.keys())}")
            print(f"CommonPrefixes: {response1.get('CommonPrefixes', [])}")
            print(f"Contents count: {len(response1.get('Contents', []))}")
            
            if 'Contents' in response1:
                print("First 5 Contents:")
                for i, obj in enumerate(response1['Contents'][:5]):
                    print(f"  {i+1}. {obj['Key']}")
            
            if 'CommonPrefixes' in response1:
                print("CommonPrefixes found:")
                for prefix in response1['CommonPrefixes']:
                    print(f"  - {prefix['Prefix']}")
            else:
                print("No CommonPrefixes found!")
                
        except Exception as e:
            print(f"Error in Test 1: {str(e)}")
        
        print()
        
        # Test 2: List without Delimiter
        print("TEST 2: list_objects_v2 without Delimiter")
        print("-" * 50)
        
        try:
            response2 = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=s3_prefix,
                MaxKeys=20
            )
            
            if 'Contents' in response2:
                print(f"Found {len(response2['Contents'])} objects:")
                for i, obj in enumerate(response2['Contents'][:10]):
                    key = obj['Key']
                    print(f"  {i+1}. {key}")
                    
                # Analyze folder structure
                folders = set()
                for obj in response2['Contents']:
                    key = obj['Key']
                    # Remove the prefix to get relative path
                    relative_path = key.replace(s3_prefix, '')
                    # Get folder part (everything before the last /)
                    if '/' in relative_path:
                        folder = relative_path.split('/')[0]
                        if folder:  # Not empty
                            folders.add(folder)
                
                print(f"\nExtracted folders from object keys:")
                for folder in sorted(folders):
                    print(f"  - {folder}")
                    
            else:
                print("No Contents found!")
                
        except Exception as e:
            print(f"Error in Test 2: {str(e)}")
        
        print()
        
        # Test 3: Try different email formats
        print("TEST 3: Try different email formatting")
        print("-" * 50)
        
        email_formats = [
            employee_email.replace('@', '_at_'),  # Current: haseebcodejourney_at_gmail.com
            employee_email.replace('@', '_at_').replace('.', '_'),  # haseebcodejourney_at_gmail_com
            employee_email.replace('@', '_').replace('.', '_'),  # haseebcodejourney_gmail_com
            employee_email.replace('@', '-at-').replace('.', '-'),  # haseebcodejourney-at-gmail-com
        ]
        
        for fmt in email_formats:
            test_prefix = f'screenshots/{fmt}/'
            print(f"Testing prefix: {test_prefix}")
            
            try:
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=test_prefix,
                    MaxKeys=1
                )
                
                count = len(response.get('Contents', []))
                print(f"  Objects found: {count}")
                
                if count > 0:
                    print(f"  ✓ MATCH FOUND! Correct format: {fmt}")
                    print(f"  First object: {response['Contents'][0]['Key']}")
                
            except Exception as e:
                print(f"  Error: {str(e)}")
        
        print()
        
        # Test 4: List all screenshot folders to see pattern
        print("TEST 4: List all employee folders in screenshots/")
        print("-" * 50)
        
        try:
            response4 = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix='screenshots/',
                Delimiter='/',
                MaxKeys=50
            )
            
            if 'CommonPrefixes' in response4:
                print("All employee folders found:")
                for prefix in response4['CommonPrefixes']:
                    folder_name = prefix['Prefix'].replace('screenshots/', '').rstrip('/')
                    print(f"  - {folder_name}")
                    
                    # Check if this matches our employee
                    if 'haseeb' in folder_name.lower():
                        print(f"    ✓ POTENTIAL MATCH: {folder_name}")
            else:
                print("No employee folders found!")
                
        except Exception as e:
            print(f"Error in Test 4: {str(e)}")
        
        print()
        print("="*60)
        print("DEBUG COMPLETE")
        print("="*60)
        
    except Exception as e:
        print(f"Overall error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_s3_folder_discovery()
