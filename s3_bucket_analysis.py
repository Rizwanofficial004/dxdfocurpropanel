#!/usr/bin/env python3
"""
S3 Bucket Analysis Script
Analyze the ddsfocustime bucket structure and find missing screenshot data
"""

import boto3
import os
from datetime import datetime, timedelta
from collections import defaultdict
import re

# AWS Configuration
AWS_ACCESS_KEY_ID = "AKIARSU6EUUWMQ5I2JWC"
AWS_SECRET_ACCESS_KEY = "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"
AWS_REGION = "eu-north-1"
AWS_STORAGE_BUCKET_NAME = "ddsfocustime"

def initialize_s3():
    """Initialize S3 client"""
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        return s3_client
    except Exception as e:
        print(f"Failed to initialize S3 client: {str(e)}")
        return None

def analyze_bucket_structure(s3_client, bucket_name):
    """Analyze the overall bucket structure"""
    print(f"\n=== ANALYZING BUCKET: {bucket_name} ===")
    
    try:
        # Get top-level folders
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Delimiter='/',
            PaginationConfig={'PageSize': 100}
        )
        
        top_level_folders = []
        for page in page_iterator:
            if 'CommonPrefixes' in page:
                for prefix in page['CommonPrefixes']:
                    folder_name = prefix['Prefix'].rstrip('/')
                    top_level_folders.append(folder_name)
        
        print(f"Top-level folders found: {len(top_level_folders)}")
        for folder in sorted(top_level_folders):
            print(f"  - {folder}")
        
        return top_level_folders
        
    except Exception as e:
        print(f"Error analyzing bucket structure: {str(e)}")
        return []

def analyze_users_screenshots_folder(s3_client, bucket_name, start_date, end_date):
    """Analyze users_screenshots folder for date range"""
    print(f"\n=== ANALYZING users_screenshots FOLDER ===")
    print(f"Date range: {start_date} to {end_date}")
    
    date_stats = defaultdict(lambda: {"total_files": 0, "users": set(), "example_files": []})
    
    try:
        # Generate date range
        current_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        while current_date <= end_date_dt:
            date_str = current_date.strftime('%Y-%m-%d')
            prefix = f'users_screenshots/{date_str}/'
            
            print(f"\nChecking date: {date_str}")
            
            # List objects for this date
            paginator = s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=bucket_name,
                Prefix=prefix,
                PaginationConfig={'PageSize': 1000}
            )
            
            file_count = 0
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        file_count += 1
                        key = obj['Key']
                        key_parts = key.split('/')
                        
                        if len(key_parts) >= 4 and key.endswith('.webp'):
                            user_email = key_parts[2]
                            date_stats[date_str]["users"].add(user_email)
                            date_stats[date_str]["total_files"] += 1
                            
                            # Store example files (first 3)
                            if len(date_stats[date_str]["example_files"]) < 3:
                                date_stats[date_str]["example_files"].append(key)
            
            print(f"  Files found: {file_count}")
            if file_count > 0:
                print(f"  Unique users: {len(date_stats[date_str]['users'])}")
                print(f"  Screenshot files: {date_stats[date_str]['total_files']}")
            
            current_date += timedelta(days=1)
    
    except Exception as e:
        print(f"Error analyzing users_screenshots folder: {str(e)}")
    
    return date_stats

def analyze_screenshots_folder(s3_client, bucket_name, target_user):
    """Analyze screenshots folder for specific user"""
    print(f"\n=== ANALYZING screenshots FOLDER for user: {target_user} ===")
    
    # Try different user formats
    user_formats = [
        target_user,
        target_user.replace('@', '_at_'),
        target_user.replace('_at_', '@')
    ]
    
    found_data = {}
    
    for user_format in user_formats:
        print(f"\nChecking user format: {user_format}")
        user_prefix = f'screenshots/{user_format}/'
        
        try:
            paginator = s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=bucket_name,
                Prefix=user_prefix,
                PaginationConfig={'PageSize': 100}
            )
            
            file_count = 0
            project_folders = set()
            date_files = defaultdict(int)
            
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        file_count += 1
                        key = obj['Key']
                        key_parts = key.split('/')
                        
                        if len(key_parts) >= 3:
                            # Extract project folder
                            if len(key_parts) >= 4:
                                project_folder = key_parts[2]
                                project_folders.add(project_folder)
                            
                            # Try to extract date from filename
                            filename = key_parts[-1]
                            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
                            if date_match:
                                file_date = date_match.group(1)
                                date_files[file_date] += 1
            
            if file_count > 0:
                found_data[user_format] = {
                    "total_files": file_count,
                    "project_folders": list(project_folders),
                    "date_distribution": dict(date_files)
                }
                
                print(f"  Total files: {file_count}")
                print(f"  Project folders: {len(project_folders)}")
                for folder in sorted(project_folders):
                    print(f"    - {folder}")
                print(f"  Date distribution: {len(date_files)} dates")
                for date, count in sorted(date_files.items())[-5:]:  # Last 5 dates
                    print(f"    - {date}: {count} files")
            else:
                print(f"  No files found")
        
        except Exception as e:
            print(f"Error checking user format {user_format}: {str(e)}")
    
    return found_data

def check_specific_user_in_users_screenshots(s3_client, bucket_name, target_user, start_date, end_date):
    """Check for specific user in users_screenshots folder"""
    print(f"\n=== CHECKING SPECIFIC USER: {target_user} in users_screenshots ===")
    
    user_formats = [
        target_user,
        target_user.replace('@', '_at_'),
        target_user.replace('_at_', '@')
    ]
    
    found_files = []
    
    # Generate date range
    current_date = datetime.strptime(start_date, '%Y-%m-%d')
    end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')
    
    while current_date <= end_date_dt:
        date_str = current_date.strftime('%Y-%m-%d')
        
        for user_format in user_formats:
            prefix = f'users_screenshots/{date_str}/{user_format}/'
            
            try:
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=prefix,
                    MaxKeys=100
                )
                
                if 'Contents' in response:
                    for obj in response['Contents']:
                        if obj['Key'].endswith('.webp'):
                            found_files.append({
                                'date': date_str,
                                'user_format': user_format,
                                'key': obj['Key'],
                                'size': obj['Size'],
                                'last_modified': obj['LastModified']
                            })
            
            except Exception as e:
                # Silent failure for non-existent prefixes
                pass
        
        current_date += timedelta(days=1)
    
    print(f"Found {len(found_files)} files for user {target_user}")
    
    if found_files:
        # Group by date
        by_date = defaultdict(list)
        for file in found_files:
            by_date[file['date']].append(file)
        
        for date in sorted(by_date.keys()):
            files = by_date[date]
            print(f"  {date}: {len(files)} files")
            for file in files[:3]:  # Show first 3 files
                print(f"    - {file['key']}")
    
    return found_files

def main():
    """Main analysis function"""
    print("Starting S3 Bucket Analysis...")
    
    # Initialize S3 client
    s3_client = initialize_s3()
    if not s3_client:
        return
    
    bucket_name = AWS_STORAGE_BUCKET_NAME
    target_user = "mohsinabbass688630"  # From the URL
    start_date = "2025-09-01"
    end_date = "2025-10-04"
    
    # 1. Analyze overall bucket structure
    top_level_folders = analyze_bucket_structure(s3_client, bucket_name)
    
    # 2. Analyze users_screenshots folder for date range
    users_screenshots_stats = analyze_users_screenshots_folder(s3_client, bucket_name, start_date, end_date)
    
    # 3. Analyze screenshots folder for specific user
    screenshots_data = analyze_screenshots_folder(s3_client, bucket_name, target_user)
    
    # 4. Check specific user in users_screenshots
    user_files = check_specific_user_in_users_screenshots(s3_client, bucket_name, target_user, start_date, end_date)
    
    # Summary
    print(f"\n=== SUMMARY ===")
    print(f"Target user: {target_user}")
    print(f"Date range: {start_date} to {end_date}")
    print(f"Total files found for user: {len(user_files)}")
    
    # Date-wise summary
    dates_with_data = []
    dates_without_data = []
    
    current_date = datetime.strptime(start_date, '%Y-%m-%d')
    end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')
    
    while current_date <= end_date_dt:
        date_str = current_date.strftime('%Y-%m-%d')
        has_data = any(f['date'] == date_str for f in user_files)
        
        if has_data:
            dates_with_data.append(date_str)
        else:
            dates_without_data.append(date_str)
        
        current_date += timedelta(days=1)
    
    print(f"\nDates WITH data ({len(dates_with_data)}): {dates_with_data}")
    print(f"Dates WITHOUT data ({len(dates_without_data)}): {dates_without_data}")
    
    if users_screenshots_stats:
        print(f"\nusers_screenshots folder analysis:")
        for date, stats in sorted(users_screenshots_stats.items()):
            if stats['total_files'] > 0:
                print(f"  {date}: {stats['total_files']} files, {len(stats['users'])} users")

if __name__ == "__main__":
    main()