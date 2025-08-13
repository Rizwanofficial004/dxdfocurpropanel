#!/usr/bin/env python3
"""
Screenshot Data Cache Updater
Scans S3 bucket and updates the cached JSON file
Run this every 6 hours via cron job
"""
import boto3
import json
import os
from datetime import datetime, timedelta
from collections import defaultdict
import traceback

def update_screenshot_cache():
    """
    Scan S3 bucket and update the cached JSON file with real data
    """
    print("🔄 UPDATING SCREENSHOT DATA CACHE")
    print("=" * 50)
    print(f"⏰ Started at: {datetime.now()}")
    
    try:
        # S3 Configuration
        s3_client = boto3.client(
            's3',
            aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
            aws_secret_access_key='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',
            region_name='eu-north-1'
        )
        
        bucket_name = 'ddsfocustime'
        print(f"📦 Scanning bucket: {bucket_name}")
        
        # Get all user folders
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='screenshots/',
            Delimiter='/',
            MaxKeys=1000
        )
        
        if 'CommonPrefixes' not in response:
            print("❌ No user folders found")
            return False
        
        users_data = []
        total_screenshots = 0
        
        print(f"👥 Found {len(response['CommonPrefixes'])} user folders")
        
        # Process each user folder
        for i, prefix in enumerate(response['CommonPrefixes']):
            folder = prefix['Prefix'].replace('screenshots/', '').replace('/', '')
            if not folder or folder == 'screenshots':
                continue
            
            user_email = folder.replace('_at_', '@')
            print(f"📊 Processing user {i+1}: {user_email}")
            
            # Count screenshots for this user
            user_count = 0
            projects = defaultdict(int)
            latest_date = None
            total_size = 0
            
            # Use pagination to handle large folders
            continuation_token = None
            max_objects_per_user = 5000  # Limit per user for performance
            
            while True:
                kwargs = {
                    'Bucket': bucket_name,
                    'Prefix': f'screenshots/{folder}/',
                    'MaxKeys': min(1000, max_objects_per_user - user_count)
                }
                
                if continuation_token:
                    kwargs['ContinuationToken'] = continuation_token
                
                user_response = s3_client.list_objects_v2(**kwargs)
                
                if 'Contents' in user_response:
                    for obj in user_response['Contents']:
                        key = obj['Key']
                        
                        # Check if it's an image file
                        if (key.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp')) 
                            and not key.endswith('/')):
                            
                            user_count += 1
                            total_size += obj['Size']
                            
                            # Extract project name
                            path_parts = key.split('/')
                            if len(path_parts) >= 3:
                                project_name = path_parts[2]
                                projects[project_name] += 1
                            
                            # Track latest date
                            if not latest_date or obj['LastModified'] > latest_date:
                                latest_date = obj['LastModified']
                
                # Check if there are more objects and we haven't hit our limit
                if (user_response.get('IsTruncated', False) and 
                    user_count < max_objects_per_user):
                    continuation_token = user_response['NextContinuationToken']
                else:
                    break
            
            if user_count > 0:
                total_screenshots += user_count
                
                users_data.append({
                    'user_email': user_email,
                    'screenshot_count': user_count,
                    'last_updated': datetime.now().isoformat(),
                    'latest_screenshot_date': latest_date.isoformat() if latest_date else None,
                    'total_size_bytes': total_size,
                    'project_count': len(projects),
                    'projects': dict(projects)
                })
                
                print(f"   ✅ {user_count} screenshots, {len(projects)} projects")
            else:
                print(f"   📭 No screenshots found")
        
        # Calculate percentages
        for user in users_data:
            if total_screenshots > 0:
                user['percentage'] = round((user['screenshot_count'] / total_screenshots) * 100, 2)
            else:
                user['percentage'] = 0
        
        # Sort by screenshot count
        users_data.sort(key=lambda x: x['screenshot_count'], reverse=True)
        
        # Create cached data structure
        cached_data = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'total_users': len(users_data),
            'total_screenshots': total_screenshots,
            'status': 'Data from cached JSON file (updated every 6 hours)',
            'bucket': bucket_name,
            'last_updated': datetime.now().isoformat(),
            'next_update': (datetime.now() + timedelta(hours=6)).isoformat(),
            'cache_info': {
                'cache_file': 'screenshot_data_cache.json',
                'update_frequency': 'Every 6 hours',
                'last_scan_duration': '5-10 minutes',
                'total_folders_scanned': len(response['CommonPrefixes'])
            },
            'users': users_data
        }
        
        # Save to cache file
        cache_dir = os.path.join(os.path.dirname(__file__), 'dashboard', 'data')
        os.makedirs(cache_dir, exist_ok=True)
        
        cache_file_path = os.path.join(cache_dir, 'screenshot_data_cache.json')
        
        with open(cache_file_path, 'w', encoding='utf-8') as f:
            json.dump(cached_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ CACHE UPDATE COMPLETED!")
        print(f"📄 Cache file: {cache_file_path}")
        print(f"👥 Total users: {len(users_data)}")
        print(f"📸 Total screenshots: {total_screenshots}")
        print(f"⏰ Completed at: {datetime.now()}")
        print(f"🔄 Next update: {cached_data['next_update']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error updating cache: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = update_screenshot_cache()
    
    if success:
        print("\n🎉 SUCCESS! Cache updated with real S3 data")
    else:
        print("\n⚠️ FAILED! Cache update encountered errors")
    
    print("\n📋 USAGE:")
    print("  - Manual update: python update_screenshot_cache.py")
    print("  - Cron job: Add to crontab for automatic updates")
    print("  - API endpoint: /api/actual-count-total/screenshots/")
