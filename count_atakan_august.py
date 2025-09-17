#!/usr/bin/env python3
"""
Count all screenshots for atakankahraman35_at_outlook.com in August 2025
"""

import boto3
import os
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

def get_s3_client():
    """Get configured S3 client"""
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
    )

def extract_date_from_webp_filename(filename):
    """Extract date from webp filename like 2025-08-30_12-06-12_2025-08-30_12-06-12.webp"""
    try:
        if '.webp' in filename:
            # Extract the first date part before underscore
            date_part = filename.split('_')[0]
            return datetime.strptime(date_part, '%Y-%m-%d').date()
    except:
        pass
    return None

def extract_project_from_path(s3_key):
    """Extract project folder from S3 path"""
    try:
        # Format: screenshots/email/project_folder/filename
        parts = s3_key.split('/')
        if len(parts) >= 3:
            return parts[2]  # The project folder is the third part
    except:
        pass
    return "unknown"

def count_atakan_screenshots():
    """Count all screenshots for atakankahraman35_at_outlook.com in August 2025"""
    
    email = "atakankahraman35_at_outlook.com"
    target_month = 8  # August
    target_year = 2025
    
    print(f"📸 COUNTING SCREENSHOTS FOR {email}")
    print(f"📅 Target: August {target_year}")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = "ddsfocustime"
    
    # This user's screenshots are in the main screenshots folder
    prefix = f"screenshots/{email}/"
    
    total_august_files = 0
    total_all_files = 0
    project_stats = defaultdict(int)
    date_stats = defaultdict(int)
    month_stats = defaultdict(int)
    
    print(f"🔍 Scanning: {prefix}")
    
    paginator = s3_client.get_paginator('list_objects_v2')
    page_iterator = paginator.paginate(Bucket=bucket_name, Prefix=prefix)
    
    for page in page_iterator:
        if 'Contents' in page:
            for obj in page['Contents']:
                key = obj['Key']
                filename = key.split('/')[-1]
                
                # Skip directory entries
                if not filename or filename.endswith('/'):
                    continue
                
                total_all_files += 1
                
                # Extract date from filename
                file_date = extract_date_from_webp_filename(filename)
                
                if file_date:
                    month_key = f"{file_date.year}-{file_date.month:02d}"
                    month_stats[month_key] += 1
                    
                    # Check if it's August 2025
                    if file_date.year == target_year and file_date.month == target_month:
                        total_august_files += 1
                        project_folder = extract_project_from_path(key)
                        project_stats[project_folder] += 1
                        date_stats[str(file_date)] += 1
                        
                        # Show first few examples
                        if total_august_files <= 5:
                            print(f"  📸 {filename} | 📂 {project_folder} | 📅 {file_date}")
    
    print(f"\n📊 RESULTS SUMMARY")
    print("=" * 40)
    print(f"✅ Total screenshots in August 2025: {total_august_files}")
    print(f"📋 Total screenshots (all time): {total_all_files}")
    
    if project_stats:
        print(f"\n📂 August 2025 Project breakdown:")
        for project, count in sorted(project_stats.items()):
            print(f"  • {project}: {count} files")
    
    if date_stats:
        print(f"\n📅 August 2025 Date breakdown:")
        for date, count in sorted(date_stats.items()):
            print(f"  • {date}: {count} files")
    
    if month_stats:
        print(f"\n📆 All-time Monthly breakdown:")
        for month, count in sorted(month_stats.items()):
            try:
                month_name = datetime.strptime(month + "-01", '%Y-%m-%d').strftime('%B %Y')
                print(f"  • {month_name}: {count} files")
            except:
                print(f"  • {month}: {count} files")

if __name__ == "__main__":
    try:
        count_atakan_screenshots()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()