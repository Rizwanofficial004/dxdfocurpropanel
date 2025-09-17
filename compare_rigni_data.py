#!/usr/bin/env python3
"""
Comprehensive comparison between API results and direct S3 scan for rignimeyikur02_at_gmail.com
"""

import boto3
import os
import requests
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_s3_client():
    """Get configured S3 client"""
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
    )

def extract_date_from_filename(filename):
    """Extract date from screenshot filename - handles multiple formats"""
    try:
        # Handle .webp files with format: 2025-08-30_12-06-12_2025-08-30_12-06-12.webp
        if filename.endswith('.webp'):
            if filename.startswith('202'):  # Starts with year
                date_part = filename.split('_')[0]
                return datetime.strptime(date_part, '%Y-%m-%d').date()
        
        # Handle screenshot files: screenshot_2025-08-30_14-45-23.png
        if 'screenshot_' in filename and '.png' in filename:
            date_part = filename.split('screenshot_')[1].split('.png')[0]
            date_str = date_part.split('_')[0]  # Get the date part before time
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Handle other date patterns in filename
        import re
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
        if date_match:
            return datetime.strptime(date_match.group(1), '%Y-%m-%d').date()
            
    except:
        pass
    return None

def extract_project_folder(s3_key):
    """Extract project folder from S3 key path"""
    try:
        if s3_key.startswith('screenshots/'):
            # Format: screenshots/email/project_folder/filename
            parts = s3_key.split('/')
            if len(parts) >= 3:
                return parts[2]
    except:
        pass
    return "unknown"

def scan_s3_directly():
    """Direct S3 scan to get the ground truth"""
    print("🔍 DIRECT S3 SCAN")
    print("=" * 40)
    
    email = "rignimeyikur02_at_gmail.com"
    target_month = 8
    target_year = 2025
    
    s3_client = get_s3_client()
    bucket_name = "ddsfocustime"
    prefix = f"screenshots/{email}/"
    
    total_august_files = 0
    project_stats = defaultdict(int)
    date_stats = defaultdict(int)
    all_files = []
    
    print(f"📂 Scanning: {prefix}")
    
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
                
                # Check if it's an image file
                if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    continue
                
                # Extract date from filename
                file_date = extract_date_from_filename(filename)
                
                if file_date and file_date.year == target_year and file_date.month == target_month:
                    total_august_files += 1
                    project_folder = extract_project_folder(key)
                    project_stats[project_folder] += 1
                    date_stats[str(file_date)] += 1
                    
                    all_files.append({
                        'filename': filename,
                        'date': str(file_date),
                        'project_folder': project_folder,
                        'key': key,
                        'size': obj['Size']
                    })
    
    print(f"📊 S3 Direct Results:")
    print(f"  • Total August 2025 files: {total_august_files:,}")
    
    for project, count in sorted(project_stats.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / total_august_files * 100) if total_august_files > 0 else 0
        print(f"  • {project}: {count:,} files ({percentage:.1f}%)")
    
    return total_august_files, project_stats, all_files

def test_api():
    """Test the API and get all results"""
    print("\n🚀 API TEST")
    print("=" * 40)
    
    base_url = "http://127.0.0.1:8001/api/users/screenshots/"
    params = {
        'q': 'rignimeyikur02_at_gmail.com',
        'start_date': '2025-08-01',
        'end_date': '2025-08-31',
        'page_size': 1000  # Get more per page
    }
    
    all_api_files = []
    total_screenshots = 0
    page = 1
    
    print(f"📡 Testing: {base_url}")
    
    while True:
        params['page'] = page
        
        try:
            response = requests.get(base_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                if page == 1:
                    pagination = data['data']['pagination']
                    total_screenshots = pagination['total_screenshots']
                    total_pages = pagination['total_pages']
                    
                    print(f"📊 API Results:")
                    print(f"  • Total screenshots: {total_screenshots:,}")
                    print(f"  • Total pages: {total_pages:,}")
                    
                    # Show project stats from API
                    project_folders = data['data'].get('project_folders', {})
                    if 'projects' in project_folders:
                        print(f"  📂 API Project breakdown:")
                        for project in project_folders['projects']:
                            name = project.get('name', 'Unknown')
                            count = project.get('total_screenshots', 0)
                            print(f"    • {name}: {count:,} files")
                
                # Collect screenshots from this page
                screenshots = data['data'].get('screenshots', [])
                for screenshot in screenshots:
                    all_api_files.append({
                        'filename': screenshot.get('filename', ''),
                        'date': screenshot.get('date', ''),
                        'project_folder': screenshot.get('project_folder', ''),
                        'key': screenshot.get('file_key', ''),
                        'size': screenshot.get('file_size_mb', 0) * 1024 * 1024  # Convert to bytes
                    })
                
                print(f"  📄 Page {page}/{total_pages} - Got {len(screenshots)} screenshots")
                
                # Check if we have more pages
                if not data['data']['pagination'].get('has_next', False):
                    break
                    
                page += 1
                
                # Safety limit
                if page > 100:
                    print("⚠️  Stopping at page 100 to prevent infinite loop")
                    break
                    
            else:
                print(f"❌ API Error on page {page}: {response.status_code}")
                print(f"Response: {response.text}")
                break
                
        except Exception as e:
            print(f"❌ Request Error on page {page}: {e}")
            break
    
    return len(all_api_files), all_api_files

def compare_results():
    """Compare S3 direct scan vs API results"""
    
    # Get S3 direct results
    s3_count, s3_projects, s3_files = scan_s3_directly()
    
    # Get API results
    api_count, api_files = test_api()
    
    print(f"\n🔍 COMPARISON ANALYSIS")
    print("=" * 50)
    
    print(f"📊 Total Files:")
    print(f"  • S3 Direct:  {s3_count:,}")
    print(f"  • API Result: {api_count:,}")
    
    if s3_count != api_count:
        difference = s3_count - api_count
        percentage = (difference / s3_count * 100) if s3_count > 0 else 0
        print(f"  • Missing:    {difference:,} files ({percentage:.1f}%)")
        
        print(f"\n🔍 DETAILED ANALYSIS:")
        
        # Create sets for comparison
        s3_file_keys = {f['key'] for f in s3_files}
        api_file_keys = {f['key'] for f in api_files}
        
        missing_from_api = s3_file_keys - api_file_keys
        extra_in_api = api_file_keys - s3_file_keys
        
        print(f"  • Files in S3 but missing from API: {len(missing_from_api):,}")
        print(f"  • Files in API but not in S3: {len(extra_in_api):,}")
        
        if missing_from_api:
            print(f"\n📝 Sample missing files (first 10):")
            for i, key in enumerate(sorted(missing_from_api)[:10]):
                filename = key.split('/')[-1]
                project = extract_project_folder(key)
                date = extract_date_from_filename(filename)
                print(f"    {i+1}. {filename} | {project} | {date}")
        
        # Project-level comparison
        print(f"\n📂 Project-level missing files:")
        missing_by_project = defaultdict(int)
        for key in missing_from_api:
            project = extract_project_folder(key)
            missing_by_project[project] += 1
        
        for project, count in sorted(missing_by_project.items(), key=lambda x: x[1], reverse=True):
            total_in_s3 = s3_projects.get(project, 0)
            percentage = (count / total_in_s3 * 100) if total_in_s3 > 0 else 0
            print(f"    • {project}: {count:,} missing of {total_in_s3:,} ({percentage:.1f}%)")
    
    else:
        print(f"  ✅ PERFECT MATCH!")

if __name__ == "__main__":
    try:
        compare_results()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()