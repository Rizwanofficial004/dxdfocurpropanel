#!/usr/bin/env python3
"""
Detailed User Analysis Script
Check what users exist in the S3 bucket and analyze naming patterns
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

def find_all_users_in_date_range(s3_client, bucket_name, start_date, end_date):
    """Find all users who have screenshots in the date range"""
    print(f"\n=== FINDING ALL USERS IN DATE RANGE: {start_date} to {end_date} ===")
    
    all_users = set()
    user_date_map = defaultdict(set)
    
    # Check users_screenshots folder
    current_date = datetime.strptime(start_date, '%Y-%m-%d')
    end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')
    
    while current_date <= end_date_dt:
        date_str = current_date.strftime('%Y-%m-%d')
        prefix = f'users_screenshots/{date_str}/'
        
        try:
            paginator = s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=bucket_name,
                Prefix=prefix,
                PaginationConfig={'PageSize': 1000}
            )
            
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        key = obj['Key']
                        key_parts = key.split('/')
                        
                        if len(key_parts) >= 4 and key.endswith('.webp'):
                            user_email = key_parts[2]
                            all_users.add(user_email)
                            user_date_map[user_email].add(date_str)
        
        except Exception as e:
            print(f"Error checking date {date_str}: {str(e)}")
        
        current_date += timedelta(days=1)
    
    print(f"Found {len(all_users)} unique users in date range:")
    for user in sorted(all_users):
        dates = sorted(user_date_map[user])
        print(f"  - {user} ({len(dates)} days): {dates[0]} to {dates[-1]}")
        
        # Check if this user could match our target
        target = "mohsinabbass688630"
        if (target.lower() in user.lower() or 
            user.lower() in target.lower() or
            "mohsin" in user.lower() or
            "abbas" in user.lower()):
            print(f"    *** POTENTIAL MATCH for {target} ***")
    
    return all_users, user_date_map

def find_users_in_screenshots_folder(s3_client, bucket_name):
    """Find all users in the screenshots folder"""
    print(f"\n=== FINDING ALL USERS IN screenshots FOLDER ===")
    
    try:
        # List all user folders in screenshots
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Prefix='screenshots/',
            Delimiter='/',
            PaginationConfig={'PageSize': 100}
        )
        
        user_folders = []
        for page in page_iterator:
            if 'CommonPrefixes' in page:
                for prefix in page['CommonPrefixes']:
                    folder_path = prefix['Prefix']
                    # Extract user part: screenshots/user_email/
                    user_part = folder_path.replace('screenshots/', '').rstrip('/')
                    if user_part:  # Avoid empty strings
                        user_folders.append(user_part)
        
        print(f"Found {len(user_folders)} user folders in screenshots:")
        for user in sorted(user_folders):
            print(f"  - {user}")
            
            # Check if this user could match our target
            target = "mohsinabbass688630"
            if (target.lower() in user.lower() or 
                user.lower() in target.lower() or
                "mohsin" in user.lower() or
                "abbas" in user.lower()):
                print(f"    *** POTENTIAL MATCH for {target} ***")
        
        return user_folders
        
    except Exception as e:
        print(f"Error finding users in screenshots folder: {str(e)}")
        return []

def search_for_partial_matches(s3_client, bucket_name, search_term):
    """Search for partial matches of the user across all folders"""
    print(f"\n=== SEARCHING FOR PARTIAL MATCHES of '{search_term}' ===")
    
    search_patterns = [
        search_term.lower(),
        "mohsin",
        "abbas", 
        "688630"
    ]
    
    matches = []
    
    # Search in users_screenshots
    print("\nSearching in users_screenshots...")
    try:
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Prefix='users_screenshots/',
            PaginationConfig={'PageSize': 1000, 'MaxItems': 5000}
        )
        
        for page in page_iterator:
            if 'Contents' in page:
                for obj in page['Contents']:
                    key = obj['Key']
                    key_lower = key.lower()
                    
                    for pattern in search_patterns:
                        if pattern in key_lower:
                            matches.append({
                                'location': 'users_screenshots',
                                'key': key,
                                'pattern': pattern,
                                'size': obj['Size'],
                                'last_modified': obj['LastModified']
                            })
                            break
        
    except Exception as e:
        print(f"Error searching users_screenshots: {str(e)}")
    
    # Search in screenshots
    print("Searching in screenshots...")
    try:
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Prefix='screenshots/',
            PaginationConfig={'PageSize': 1000, 'MaxItems': 5000}
        )
        
        for page in page_iterator:
            if 'Contents' in page:
                for obj in page['Contents']:
                    key = obj['Key']
                    key_lower = key.lower()
                    
                    for pattern in search_patterns:
                        if pattern in key_lower:
                            matches.append({
                                'location': 'screenshots',
                                'key': key,
                                'pattern': pattern,
                                'size': obj['Size'],
                                'last_modified': obj['LastModified']
                            })
                            break
        
    except Exception as e:
        print(f"Error searching screenshots: {str(e)}")
    
    print(f"Found {len(matches)} potential matches:")
    for match in matches[:20]:  # Show first 20 matches
        print(f"  - {match['location']}: {match['key']} (pattern: {match['pattern']})")
    
    if len(matches) > 20:
        print(f"  ... and {len(matches) - 20} more matches")
    
    return matches

def analyze_recent_activity(s3_client, bucket_name):
    """Analyze recent activity to understand data patterns"""
    print(f"\n=== ANALYZING RECENT ACTIVITY (Last 7 days) ===")
    
    # Get last 7 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    recent_users = defaultdict(int)
    recent_dates = defaultdict(int)
    
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        prefix = f'users_screenshots/{date_str}/'
        
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=prefix,
                MaxKeys=1000
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    key_parts = key.split('/')
                    
                    if len(key_parts) >= 4 and key.endswith('.webp'):
                        user_email = key_parts[2]
                        recent_users[user_email] += 1
                        recent_dates[date_str] += 1
        
        except Exception as e:
            pass  # Silent fail for missing dates
        
        current_date += timedelta(days=1)
    
    print("Recent active users:")
    for user, count in sorted(recent_users.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  - {user}: {count} screenshots")
    
    print("Recent daily activity:")
    for date, count in sorted(recent_dates.items()):
        print(f"  - {date}: {count} screenshots")

def main():
    """Main analysis function"""
    print("Starting Detailed User Analysis...")
    
    # Initialize S3 client
    s3_client = initialize_s3()
    if not s3_client:
        return
    
    bucket_name = AWS_STORAGE_BUCKET_NAME
    target_user = "mohsinabbass688630"
    start_date = "2025-09-01"
    end_date = "2025-10-04"
    
    # 1. Find all users in date range
    users_in_range, user_date_map = find_all_users_in_date_range(s3_client, bucket_name, start_date, end_date)
    
    # 2. Find users in screenshots folder
    screenshot_users = find_users_in_screenshots_folder(s3_client, bucket_name)
    
    # 3. Search for partial matches
    matches = search_for_partial_matches(s3_client, bucket_name, target_user)
    
    # 4. Analyze recent activity
    analyze_recent_activity(s3_client, bucket_name)
    
    # Summary
    print(f"\n=== FINAL SUMMARY ===")
    print(f"Target user: {target_user}")
    print(f"Users found in users_screenshots: {len(users_in_range)}")
    print(f"Users found in screenshots: {len(screenshot_users)}")
    print(f"Partial matches found: {len(matches)}")
    
    if not matches:
        print(f"\n*** NO MATCHES FOUND for {target_user} ***")
        print("This user either:")
        print("1. Has a different email format")
        print("2. Has no screenshots in the specified date range")
        print("3. The user data is stored under a different naming convention")
        
        print(f"\nTry checking with these variations:")
        print(f"- mohsinabbass688630@gmail.com")
        print(f"- mohsinabbass688630@outlook.com")
        print(f"- mohsinabbass688630_at_gmail.com")
        print(f"- Different number combinations")

if __name__ == "__main__":
    main()