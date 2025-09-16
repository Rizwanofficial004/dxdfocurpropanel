#!/usr/bin/env python3
"""
Investigate what's in the specific user's folder
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append('c:\\Users\\Dell 5400\\dxdfocurpropanel')

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

# Setup Django
django.setup()

from apps.users.user_screenshots_api import UserScreenshotsAPI, get_aws_credentials
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

def investigate_user_folder():
    """Investigate what's actually in the user's folder"""
    
    print("=" * 60)
    print("INVESTIGATING USER FOLDER CONTENTS")
    print("=" * 60)
    
    # Create API instance
    api = UserScreenshotsAPI()
    
    if not api.s3_client:
        print("❌ S3 client not initialized")
        return
    
    aws_creds = get_aws_credentials()
    bucket_name = aws_creds['bucket_name']
    user_folder = 'ilahe_at_dxdglobal.com'
    
    print(f"🔍 Investigating user folder: {user_folder}")
    print(f"📦 Bucket: {bucket_name}")
    print("-" * 60)
    
    try:
        # List everything in the user's folder
        prefix = f'screenshots/{user_folder}/'
        print(f"📂 Listing contents of: {prefix}")
        
        paginator = api.s3_client.get_paginator('list_objects_v2')
        
        total_objects = 0
        image_files = 0
        folders = 0
        date_structure = {}
        
        for page_iterator in paginator.paginate(
            Bucket=bucket_name,
            Prefix=prefix,
            PaginationConfig={'PageSize': 1000}
        ):
            if 'Contents' not in page_iterator:
                print("❌ No contents found in this folder")
                break
            
            for obj in page_iterator['Contents']:
                total_objects += 1
                key = obj['Key']
                
                # Remove the prefix to see relative path
                relative_path = key.replace(prefix, '')
                
                if key.endswith('/'):
                    folders += 1
                    print(f"📁 Folder: {relative_path}")
                else:
                    # Check if it's an image
                    if any(key.lower().endswith(ext) for ext in ['.webp', '.jpg', '.jpeg', '.png']):
                        image_files += 1
                        
                        # Extract date info
                        import re
                        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', key)
                        if date_match:
                            date_str = date_match.group(1)
                            if date_str not in date_structure:
                                date_structure[date_str] = 0
                            date_structure[date_str] += 1
                        
                        # Show first few files
                        if image_files <= 10:
                            size_mb = round(obj.get('Size', 0) / (1024 * 1024), 3)
                            last_modified = obj['LastModified'].strftime('%Y-%m-%d %H:%M:%S')
                            print(f"🖼️  Image: {relative_path} ({size_mb} MB, {last_modified})")
                    else:
                        print(f"📄 File: {relative_path}")
                
                # Stop after showing first 20 items
                if total_objects >= 20:
                    print("   ... (showing first 20 items only)")
                    break
            
            # Break after first page if we have enough info
            if total_objects >= 20:
                break
        
        print("-" * 60)
        print(f"📊 SUMMARY:")
        print(f"   Total objects: {total_objects}")
        print(f"   Image files: {image_files}")
        print(f"   Folders: {folders}")
        
        if date_structure:
            print(f"📅 DATE DISTRIBUTION:")
            for date_str in sorted(date_structure.keys()):
                count = date_structure[date_str]
                print(f"   {date_str}: {count} images")
        else:
            print("❌ No date structure found in filenames")
        
        # Check if there are any files for August 2025
        august_2025_prefix = f'screenshots/{user_folder}/2025-08'
        print(f"\n🔍 Checking specifically for August 2025: {august_2025_prefix}")
        
        august_count = 0
        for page_iterator in paginator.paginate(
            Bucket=bucket_name,
            Prefix=august_2025_prefix,
            PaginationConfig={'PageSize': 100}
        ):
            if 'Contents' in page_iterator:
                for obj in page_iterator['Contents']:
                    key = obj['Key']
                    if any(key.lower().endswith(ext) for ext in ['.webp', '.jpg', '.jpeg', '.png']):
                        august_count += 1
                        if august_count <= 5:
                            print(f"   📷 {key}")
        
        if august_count > 0:
            print(f"✅ Found {august_count} images for August 2025")
        else:
            print("❌ No images found for August 2025")
            
            # Let's check what months ARE available
            print("\n🔍 Checking what months are available...")
            month_prefixes = [
                '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
                '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
                '2024-12', '2024-11', '2024-10'  # Check some recent months
            ]
            
            for month in month_prefixes:
                month_prefix = f'screenshots/{user_folder}/{month}'
                month_count = 0
                
                try:
                    for page_iterator in paginator.paginate(
                        Bucket=bucket_name,
                        Prefix=month_prefix,
                        PaginationConfig={'PageSize': 10}
                    ):
                        if 'Contents' in page_iterator:
                            for obj in page_iterator['Contents']:
                                key = obj['Key']
                                if any(key.lower().endswith(ext) for ext in ['.webp', '.jpg', '.jpeg', '.png']):
                                    month_count += 1
                                    break  # Just need to know if any exist
                        if month_count > 0:
                            break
                    
                    if month_count > 0:
                        print(f"   ✅ {month}: Has images")
                except:
                    pass
        
    except Exception as e:
        print(f"❌ Error investigating folder: {e}")
        import traceback
        traceback.print_exc()
    
    print("=" * 60)

if __name__ == "__main__":
    investigate_user_folder()