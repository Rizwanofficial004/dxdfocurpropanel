#!/usr/bin/env python3
"""
Complete S3 Screenshots Analyzer - Gets ALL screenshots for ALL users
Handles full S3 pagination to ensure no data is missed
"""

import boto3
import json
import os
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_s3_client():
    """Get S3 client with credentials"""
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
    )

def get_all_objects_with_pagination(s3_client, bucket_name, prefix):
    """Get ALL objects from S3 with proper pagination handling"""
    all_objects = []
    continuation_token = None
    
    while True:
        kwargs = {
            'Bucket': bucket_name,
            'Prefix': prefix,
            'MaxKeys': 1000  # Maximum allowed by S3
        }
        
        if continuation_token:
            kwargs['ContinuationToken'] = continuation_token
            
        response = s3_client.list_objects_v2(**kwargs)
        
        if 'Contents' in response:
            all_objects.extend(response['Contents'])
        
        # Check if there are more objects to fetch
        if response.get('IsTruncated', False):
            continuation_token = response['NextContinuationToken']
            print(f"      📄 Fetched {len(all_objects)} objects so far...")
        else:
            break
    
    return all_objects

def analyze_complete_s3_bucket():
    """Analyze the entire S3 bucket with full pagination"""
    print("🚀 Complete S3 Screenshots Analysis")
    print("=" * 60)
    print("This will get ALL screenshots for ALL users (may take several minutes)")
    print()
    
    s3_client = get_s3_client()
    bucket_name = 'ddsfocustime'
    
    user_screenshots = defaultdict(lambda: {
        'total_count': 0,
        'total_size': 0,
        'projects': defaultdict(int),
        'latest_date': None,
        'files': []
    })
    
    try:
        # Step 1: Get all user folders
        print("🔍 Finding ALL user folders...")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='screenshots/',
            Delimiter='/',
            MaxKeys=1000
        )
        
        user_folders = []
        if 'CommonPrefixes' in response:
            for prefix in response['CommonPrefixes']:
                folder = prefix['Prefix'].replace('screenshots/', '').replace('/', '')
                if folder and folder != 'screenshots':
                    user_folders.append(folder)
        
        print(f"📁 Found {len(user_folders)} user folders")
        
        # Step 2: Analyze ALL users (not just a sample)
        print(f"📊 Analyzing ALL {len(user_folders)} users...")
        print("⚠️  This may take several minutes for large buckets...")
        print()
        
        total_processed = 0
        
        for i, user_folder in enumerate(user_folders, 1):
            user_email = user_folder.replace('_at_', '@')
            prefix = f"screenshots/{user_folder}/"
            
            print(f"   {i:2d}/{len(user_folders)}: {user_email}")
            print(f"      🔍 Scanning folder: {prefix}")
            
            # Get ALL objects for this user with pagination
            all_objects = get_all_objects_with_pagination(s3_client, bucket_name, prefix)
            
            # Filter for screenshot files
            screenshot_files = [
                obj for obj in all_objects
                if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'))
                and not obj['Key'].endswith('/')
                and '/.' not in obj['Key']  # Skip hidden files
            ]
            
            if screenshot_files:
                user_screenshots[user_email]['total_count'] = len(screenshot_files)
                user_screenshots[user_email]['total_size'] = sum(obj['Size'] for obj in screenshot_files)
                
                print(f"      📸 Found {len(screenshot_files):,} screenshots")
                print(f"      💾 Total size: {user_screenshots[user_email]['total_size'] / (1024*1024):.1f} MB")
                
                # Process ALL files for projects and metadata
                projects_found = set()
                for obj in screenshot_files:
                    path_parts = obj['Key'].split('/')
                    if len(path_parts) >= 3:
                        project = path_parts[2]
                        user_screenshots[user_email]['projects'][project] += 1
                        projects_found.add(project)
                    
                    # Track latest date
                    if (not user_screenshots[user_email]['latest_date'] or 
                        obj['LastModified'] > user_screenshots[user_email]['latest_date']):
                        user_screenshots[user_email]['latest_date'] = obj['LastModified']
                
                print(f"      📁 Found {len(projects_found)} projects")
                
                # Store sample files (first 50 for API demo)
                for obj in screenshot_files[:50]:
                    path_parts = obj['Key'].split('/')
                    user_screenshots[user_email]['files'].append({
                        'filename': os.path.basename(obj['Key']),
                        'project': path_parts[2] if len(path_parts) >= 3 else 'Unknown',
                        'size': obj['Size'],
                        'date': obj['LastModified'].isoformat(),
                        'full_path': obj['Key']
                    })
                
                total_processed += len(screenshot_files)
                
            else:
                print(f"      📸 No screenshots found")
            
            print()
        
        print(f"✅ Complete analysis finished!")
        print(f"📊 Total screenshots processed: {total_processed:,}")
        
        # Display comprehensive results
        display_complete_results(user_screenshots)
        
        # Save complete cache
        save_complete_cache(dict(user_screenshots))
        
        return user_screenshots
        
    except Exception as e:
        print(f"❌ Error in complete analysis: {e}")
        return None

def display_complete_results(user_screenshots):
    """Display comprehensive analysis results"""
    print(f"\n📊 Complete Screenshot Analysis Results")
    print("=" * 60)
    
    # Sort users by screenshot count
    sorted_users = sorted(user_screenshots.items(), 
                         key=lambda x: x[1]['total_count'], 
                         reverse=True)
    
    total_screenshots = sum(data['total_count'] for data in user_screenshots.values())
    total_size = sum(data['total_size'] for data in user_screenshots.values())
    total_projects = sum(len(data['projects']) for data in user_screenshots.values())
    
    print(f"📈 Complete Summary:")
    print(f"   👥 Total Users: {len(user_screenshots)}")
    print(f"   📸 Total Screenshots: {total_screenshots:,}")
    print(f"   💾 Total Size: {total_size / (1024*1024*1024):.2f} GB")
    print(f"   📁 Total Projects: {total_projects}")
    
    print(f"\n🏆 ALL Users by Screenshot Count:")
    for i, (email, data) in enumerate(sorted_users, 1):
        size_mb = data['total_size'] / (1024*1024)
        projects = len(data['projects'])
        latest = data['latest_date'].strftime('%Y-%m-%d') if data['latest_date'] else 'Unknown'
        
        print(f"   {i:2d}. {email}")
        print(f"       📸 Screenshots: {data['total_count']:,}")
        print(f"       📁 Projects: {projects}")
        print(f"       💾 Size: {size_mb:.1f} MB")
        print(f"       📅 Latest: {latest}")
        
        # Show top projects for this user
        if data['projects']:
            top_projects = sorted(data['projects'].items(), 
                                key=lambda x: x[1], reverse=True)[:5]
            project_summary = ', '.join([f'{p}({c})' for p, c in top_projects])
            print(f"       🎯 Projects: {project_summary}")
        print()

def save_complete_cache(user_screenshots):
    """Save complete analysis results to cache file"""
    print(f"\n💾 Saving complete analysis to cache...")
    
    # Ensure dashboard/data directory exists
    cache_dir = os.path.join('dashboard', 'data')
    os.makedirs(cache_dir, exist_ok=True)
    
    cache_file = os.path.join(cache_dir, 'complete_screenshots_cache.json')
    
    # Convert datetime objects to strings for JSON serialization
    serializable_data = {}
    for email, data in user_screenshots.items():
        serializable_data[email] = {
            'total_count': data['total_count'],
            'total_size': data['total_size'],
            'projects': dict(data['projects']),
            'latest_date': data['latest_date'].isoformat() if data['latest_date'] else None,
            'files': data.get('files', [])
        }
    
    cache_data = {
        'generated_at': datetime.now().isoformat(),
        'analysis_type': 'complete_s3_scan',
        'total_users': len(user_screenshots),
        'total_screenshots': sum(data['total_count'] for data in user_screenshots.values()),
        'total_size_bytes': sum(data['total_size'] for data in user_screenshots.values()),
        'users': serializable_data
    }
    
    with open(cache_file, 'w') as f:
        json.dump(cache_data, f, indent=2)
    
    print(f"✅ Complete cache saved to: {cache_file}")
    print(f"📊 Cache contains {cache_data['total_screenshots']:,} screenshots from {cache_data['total_users']} users")

def main():
    """Main function"""
    print("🔄 Starting COMPLETE S3 analysis...")
    print("This will process ALL users and ALL screenshots")
    print("⚠️  For large buckets, this may take 10-30 minutes")
    print()
    
    proceed = input("Continue with complete analysis? (y/N): ").lower().strip()
    if proceed not in ['y', 'yes']:
        print("❌ Analysis cancelled")
        return
    
    start_time = datetime.now()
    user_data = analyze_complete_s3_bucket()
    end_time = datetime.now()
    
    if user_data:
        duration = (end_time - start_time).total_seconds()
        print(f"\n🎉 Complete analysis finished!")
        print(f"⏱️  Total time: {duration:.1f} seconds")
        print(f"📋 Next steps:")
        print(f"   1. Use the complete cache file for instant API responses")
        print(f"   2. Update your fast API to use complete_screenshots_cache.json")
        print(f"   3. All {sum(data['total_count'] for data in user_data.values()):,} screenshots are now counted!")
    else:
        print(f"❌ Analysis failed")

if __name__ == "__main__":
    main()
