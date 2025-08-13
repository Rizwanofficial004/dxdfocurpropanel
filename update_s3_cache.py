#!/usr/bin/env python3
"""
S3 Data Scanner and Cache Updater
Scans the real S3 bucket and creates/updates the JSON cache file
"""
import boto3
import json
import os
from datetime import datetime
from collections import defaultdict

def scan_s3_and_update_cache():
    """
    Scan S3 bucket for real data and update cache JSON file
    """
    print("🔍 SCANNING S3 BUCKET FOR REAL DATA")
    print("=" * 50)
    
    try:
        # S3 Configuration
        s3_client = boto3.client(
            's3',
            aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
            aws_secret_access_key='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',
            region_name='eu-north-1'
        )
        
        bucket_name = 'ddsfocustime'
        print(f"📦 Bucket: {bucket_name}")
        print(f"⏰ Scan started: {datetime.now()}")
        
        # Get all user folders
        print("📁 Getting user folders...")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='screenshots/',
            Delimiter='/',
            MaxKeys=1000
        )
        
        if 'CommonPrefixes' not in response:
            print("❌ No user folders found")
            return None
        
        user_folders = [prefix['Prefix'].replace('screenshots/', '').replace('/', '') 
                       for prefix in response['CommonPrefixes'] 
                       if prefix['Prefix'].replace('screenshots/', '').replace('/', '')]
        
        print(f"👥 Found {len(user_folders)} users")
        
        users_data = []
        total_screenshots = 0
        
        # Scan each user
        for i, folder in enumerate(user_folders):
            user_email = folder.replace('_at_', '@')
            print(f"📊 Scanning {i+1}/{len(user_folders)}: {user_email}")
            
            user_stats = count_user_screenshots(s3_client, bucket_name, folder)
            
            if user_stats['count'] > 0:
                total_screenshots += user_stats['count']
                
                users_data.append({
                    'user_email': user_email,
                    'screenshot_count': user_stats['count'],
                    'last_updated': datetime.now().isoformat(),
                    'latest_screenshot_date': user_stats['latest_date'],
                    'total_size_bytes': user_stats['size'],
                    'project_count': len(user_stats['projects']),
                    'projects': user_stats['projects'],
                    'percentage': 0  # Will calculate after total is known
                })
                
                print(f"   ✅ {user_stats['count']} screenshots, {len(user_stats['projects'])} projects")
            else:
                print(f"   📭 No screenshots")
        
        # Calculate percentages
        for user in users_data:
            if total_screenshots > 0:
                user['percentage'] = round((user['screenshot_count'] / total_screenshots) * 100, 2)
        
        # Sort by screenshot count
        users_data.sort(key=lambda x: x['screenshot_count'], reverse=True)
        
        # Create cache data
        cache_data = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "total_users": len(users_data),
            "total_screenshots": total_screenshots,
            "status": "Real data from S3 scan (cached)",
            "bucket": bucket_name,
            "cache_updated": datetime.now().isoformat(),
            "users": users_data
        }
        
        # Save to cache file
        cache_file = "cache/screenshots_data.json"
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n🎯 SCAN COMPLETE!")
        print(f"📊 Total users: {len(users_data)}")
        print(f"📸 Total screenshots: {total_screenshots}")
        print(f"💾 Cache saved to: {cache_file}")
        
        # Show top users
        print(f"\n🏆 TOP 5 USERS:")
        for i, user in enumerate(users_data[:5]):
            print(f"   {i+1}. {user['user_email']}: {user['screenshot_count']} ({user['percentage']}%)")
        
        return cache_data
        
    except Exception as e:
        print(f"❌ Error scanning S3: {e}")
        import traceback
        traceback.print_exc()
        return None

def count_user_screenshots(s3_client, bucket_name, user_folder):
    """
    Count screenshots for a specific user with pagination
    """
    try:
        prefix = f"screenshots/{user_folder}/"
        total_count = 0
        total_size = 0
        projects = defaultdict(int)
        latest_date = None
        
        continuation_token = None
        
        # Use pagination to handle large folders
        while True:
            kwargs = {
                'Bucket': bucket_name,
                'Prefix': prefix,
                'MaxKeys': 1000
            }
            
            if continuation_token:
                kwargs['ContinuationToken'] = continuation_token
            
            response = s3_client.list_objects_v2(**kwargs)
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    
                    # Check if it's an image file
                    if (key.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'))
                        and not key.endswith('/')):
                        
                        total_count += 1
                        total_size += obj['Size']
                        
                        # Extract project from path
                        path_parts = key.split('/')
                        if len(path_parts) >= 3:
                            project_name = path_parts[2]
                            projects[project_name] += 1
                        
                        # Track latest date
                        if not latest_date or obj['LastModified'] > latest_date:
                            latest_date = obj['LastModified']
            
            # Check if there are more objects
            if response.get('IsTruncated', False):
                continuation_token = response['NextContinuationToken']
            else:
                break
        
        return {
            'count': total_count,
            'size': total_size,
            'projects': dict(projects),
            'latest_date': latest_date.isoformat() if latest_date else None
        }
        
    except Exception as e:
        print(f"   ❌ Error scanning {user_folder}: {e}")
        return {
            'count': 0,
            'size': 0,
            'projects': {},
            'latest_date': None
        }

if __name__ == "__main__":
    print("🚀 STARTING S3 REAL DATA SCAN")
    cache_data = scan_s3_and_update_cache()
    
    if cache_data:
        print("\n✅ SUCCESS! Real data cached and ready for fast API access!")
        print("🔗 Test API: http://127.0.0.1:8001/api/actual-count-total/screenshots/")
    else:
        print("\n❌ Failed to scan S3 data")
