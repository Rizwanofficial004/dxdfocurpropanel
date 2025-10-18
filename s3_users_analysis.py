#!/usr/bin/env python3
"""
S3 Users Analysis Script
This script directly queries the S3 bucket to get all users from September to today
"""

import boto3
from datetime import datetime, timedelta
import re
from collections import defaultdict

# AWS Configuration
AWS_ACCESS_KEY_ID = "AKIARSU6EUUWMQ5I2JWC"
AWS_SECRET_ACCESS_KEY = "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"
AWS_REGION = "eu-north-1"
BUCKET_NAME = "ddsfocustime"

def create_s3_client():
    """Create S3 client with AWS credentials"""
    return boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

def extract_user_from_folder_name(user_folder):
    """Extract user info from folder name"""
    try:
        if '_at_' in user_folder:
            email = user_folder.replace('_at_', '@')
            username = email.split('@')[0]
            display_name = username.replace('_', ' ').replace('.', ' ').title()
            return {
                'email': email,
                'display_name': display_name,
                'original_name': user_folder
            }
        return None
    except Exception as e:
        print(f"Error extracting user from folder '{user_folder}': {e}")
        return None

def get_date_folders_since_september():
    """Generate date folders from September 1, 2025 to today"""
    start_date = datetime(2025, 9, 1)
    end_date = datetime.now()
    
    date_folders = []
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        date_folders.append(f"users_screenshots/{date_str}/")
        current_date += timedelta(days=1)
    
    return date_folders

def get_user_folders_for_date(s3_client, date_prefix):
    """Get list of user folders for a specific date prefix"""
    try:
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=date_prefix,
            Delimiter='/',
            MaxKeys=1000
        )
        
        user_folders = []
        if 'CommonPrefixes' in response:
            for prefix in response['CommonPrefixes']:
                folder_path = prefix['Prefix']
                user_folder = folder_path.split('/')[-2]
                if user_folder:
                    user_folders.append(user_folder)
        
        return user_folders
    except Exception as e:
        print(f"Error getting user folders for {date_prefix}: {e}")
        return []

def count_screenshots_for_user_date(s3_client, date, user_folder):
    """Count screenshots for a specific user on a specific date"""
    try:
        prefix = f"users_screenshots/{date}/{user_folder}/"
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=prefix,
            MaxKeys=1000
        )
        
        screenshot_count = 0
        if 'Contents' in response:
            for obj in response['Contents']:
                if obj['Key'].endswith('.webp'):
                    screenshot_count += 1
        
        return screenshot_count
    except Exception as e:
        print(f"Error counting screenshots for {user_folder} on {date}: {e}")
        return 0

def main():
    """Main function to analyze S3 users"""
    print("🔍 Analyzing S3 bucket for all users from September 2025 to today...")
    print(f"📅 Bucket: {BUCKET_NAME}")
    print(f"🌍 Region: {AWS_REGION}")
    print("=" * 80)
    
    # Create S3 client
    s3_client = create_s3_client()
    
    # Get date folders from September to today
    date_folders = get_date_folders_since_september()
    print(f"📂 Scanning {len(date_folders)} date folders...")
    
    # Dictionary to store user information
    users_data = defaultdict(lambda: {
        'email': '',
        'display_name': '',
        'original_name': '',
        'dates_active': [],
        'total_screenshots': 0,
        'first_seen': None,
        'last_seen': None
    })
    
    # Process each date folder
    for i, date_prefix in enumerate(date_folders, 1):
        date = date_prefix.split('/')[1]  # Extract date from prefix
        print(f"📅 Processing {date} ({i}/{len(date_folders)})...")
        
        # Get user folders for this date
        user_folders = get_user_folders_for_date(s3_client, date_prefix)
        
        if user_folders:
            print(f"   👥 Found {len(user_folders)} users: {', '.join(user_folders[:5])}{'...' if len(user_folders) > 5 else ''}")
            
            for user_folder in user_folders:
                # Extract user info
                user_info = extract_user_from_folder_name(user_folder)
                if user_info:
                    email = user_info['email']
                    
                    # Count screenshots for this user on this date
                    screenshot_count = count_screenshots_for_user_date(s3_client, date, user_folder)
                    
                    # Update user data
                    if not users_data[email]['email']:  # First time seeing this user
                        users_data[email]['email'] = user_info['email']
                        users_data[email]['display_name'] = user_info['display_name']
                        users_data[email]['original_name'] = user_info['original_name']
                        users_data[email]['first_seen'] = date
                    
                    users_data[email]['dates_active'].append(date)
                    users_data[email]['total_screenshots'] += screenshot_count
                    users_data[email]['last_seen'] = date
    
    # Display results
    print("\n" + "=" * 80)
    print("📊 COMPLETE USER ANALYSIS RESULTS")
    print("=" * 80)
    
    if users_data:
        print(f"👥 Total Unique Users Found: {len(users_data)}")
        print("\n📋 USER LIST:")
        print("-" * 80)
        
        # Sort users by email
        sorted_users = sorted(users_data.items(), key=lambda x: x[1]['email'])
        
        for i, (email, data) in enumerate(sorted_users, 1):
            active_days = len(data['dates_active'])
            date_range = f"{data['first_seen']} to {data['last_seen']}" if data['first_seen'] != data['last_seen'] else data['first_seen']
            
            print(f"{i:2d}. 📧 {data['email']}")
            print(f"    👤 Name: {data['display_name']}")
            print(f"    📁 Folder: {data['original_name']}")
            print(f"    📅 Active: {active_days} days ({date_range})")
            print(f"    📸 Screenshots: {data['total_screenshots']}")
            print()
        
        # Summary statistics
        total_screenshots = sum(user['total_screenshots'] for user in users_data.values())
        avg_screenshots = total_screenshots / len(users_data) if users_data else 0
        
        print("-" * 80)
        print("📈 SUMMARY STATISTICS:")
        print(f"   Total Users: {len(users_data)}")
        print(f"   Total Screenshots: {total_screenshots:,}")
        print(f"   Average Screenshots per User: {avg_screenshots:.1f}")
        print(f"   Date Range: September 1, 2025 to {datetime.now().strftime('%Y-%m-%d')}")
        
        # Check for ilahe specifically
        ilahe_found = False
        for email, data in users_data.items():
            if 'ilahe' in email.lower():
                ilahe_found = True
                print(f"\n🎯 ILAHE USER FOUND:")
                print(f"   📧 Email: {data['email']}")
                print(f"   👤 Name: {data['display_name']}")
                print(f"   📅 Active: {len(data['dates_active'])} days")
                print(f"   📸 Screenshots: {data['total_screenshots']}")
                print(f"   🗓️ Dates: {', '.join(data['dates_active'][:10])}{'...' if len(data['dates_active']) > 10 else ''}")
                break
        
        if not ilahe_found:
            print("\n❌ ILAHE USER NOT FOUND in S3 bucket")
    
    else:
        print("❌ No users found in the specified date range!")
    
    print("\n✅ Analysis completed!")

if __name__ == "__main__":
    main()