#!/usr/bin/env python3
"""
S3 Structure Analysis - Understand the real S3 bucket structure
"""
import os
import sys
import django
import boto3
from collections import defaultdict

# Add the project directory to the Python path
project_path = r"c:\Users\deniz\OneDrive\Email attachments\Masaüstü\Git-Projects\dxdfocurpropanel"
sys.path.append(project_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
os.chdir(project_path)
django.setup()

from dashboard.aws_utils import get_s3_client

def analyze_s3_structure():
    """Analyze the complete S3 bucket structure"""
    print("🔍 Analyzing S3 Bucket Structure")
    print("=" * 60)
    
    try:
        s3_client = get_s3_client()
        bucket_name = 'ddsfocustime'
        
        print(f"📦 Bucket: {bucket_name}")
        print("🔍 Scanning entire bucket structure...")
        
        # Get all objects in the bucket
        all_objects = []
        continuation_token = None
        
        while True:
            list_params = {
                'Bucket': bucket_name,
                'MaxKeys': 1000
            }
            if continuation_token:
                list_params['ContinuationToken'] = continuation_token
            
            response = s3_client.list_objects_v2(**list_params)
            
            if 'Contents' in response:
                all_objects.extend(response['Contents'])
            
            if response.get('IsTruncated'):
                continuation_token = response.get('NextContinuationToken')
            else:
                break
        
        print(f"📊 Total objects found: {len(all_objects)}")
        
        # Analyze folder structure
        folder_structure = defaultdict(lambda: defaultdict(int))
        user_screenshots = defaultdict(list)
        
        print("\n🔍 Analyzing folder patterns...")
        
        for obj in all_objects:
            key = obj['Key']
            path_parts = key.split('/')
            
            # Categorize by top-level folder
            if len(path_parts) >= 1:
                top_folder = path_parts[0]
                folder_structure[top_folder]['total'] += 1
                
                # If it's a screenshot folder
                if top_folder == 'screenshots' and len(path_parts) >= 2:
                    user_folder = path_parts[1]
                    
                    # Check if it's an image file
                    if key.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        user_screenshots[user_folder].append({
                            'key': key,
                            'size': obj['Size'],
                            'last_modified': obj['LastModified'],
                            'path_parts': path_parts
                        })
                        folder_structure[top_folder]['images'] += 1
                    else:
                        folder_structure[top_folder]['other'] += 1
        
        # Print folder structure summary
        print("\n📁 Top-level folder structure:")
        print("-" * 40)
        for folder, stats in folder_structure.items():
            print(f"📂 {folder}/")
            for stat_type, count in stats.items():
                print(f"   {stat_type}: {count}")
        
        # Print user screenshot analysis
        print(f"\n👥 Users with screenshots: {len(user_screenshots)}")
        print("-" * 40)
        
        # Sort users by screenshot count
        user_stats = []
        for user_folder, screenshots in user_screenshots.items():
            # Try to extract email from folder name
            email = user_folder.replace('_at_', '@').replace('_', '.')
            
            # Count by project folders
            project_folders = defaultdict(int)
            for screenshot in screenshots:
                if len(screenshot['path_parts']) >= 3:
                    project = screenshot['path_parts'][2]
                    project_folders[project] += 1
            
            user_stats.append({
                'folder': user_folder,
                'email': email,
                'total_screenshots': len(screenshots),
                'project_folders': dict(project_folders),
                'latest_activity': max(s['last_modified'] for s in screenshots) if screenshots else None
            })
        
        # Sort by screenshot count
        user_stats.sort(key=lambda x: x['total_screenshots'], reverse=True)
        
        # Show top 10 users
        print("\n🏆 Top 10 users by screenshot count:")
        print("-" * 50)
        for i, user in enumerate(user_stats[:10], 1):
            print(f"{i:2d}. {user['email']}")
            print(f"    📸 Screenshots: {user['total_screenshots']:,}")
            print(f"    📁 Folder: {user['folder']}")
            print(f"    🏗️ Projects: {len(user['project_folders'])}")
            if user['latest_activity']:
                print(f"    📅 Latest: {user['latest_activity'].strftime('%Y-%m-%d %H:%M')}")
            
            # Show project breakdown for top 3 users
            if i <= 3 and user['project_folders']:
                print("    📋 Project breakdown:")
                sorted_projects = sorted(user['project_folders'].items(), key=lambda x: x[1], reverse=True)
                for proj, count in sorted_projects[:5]:  # Top 5 projects
                    print(f"       • {proj}: {count:,} screenshots")
            print()
        
        # Show sample file structure for top user
        if user_stats:
            top_user = user_stats[0]
            print(f"\n🔍 Sample file structure for top user: {top_user['email']}")
            print("-" * 50)
            
            sample_screenshots = user_screenshots[top_user['folder']][:10]  # First 10
            for screenshot in sample_screenshots:
                print(f"📄 {screenshot['key']}")
                print(f"   Size: {screenshot['size']:,} bytes")
                print(f"   Date: {screenshot['last_modified'].strftime('%Y-%m-%d %H:%M:%S')}")
        
        print("\n" + "=" * 60)
        print("✅ S3 Structure Analysis Complete")
        
        return user_stats
        
    except Exception as e:
        print(f"💥 Error analyzing S3 structure: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    analyze_s3_structure()
