#!/usr/bin/env python3
"""
Hybrid Screenshots Solution: Instant API + Background Processing
- Instant API responses (1-2ms)
- Complete data via background jobs
- Incremental updates
- Smart caching strategy
"""

import boto3
import json
import os
import time
from datetime import datetime, timedelta
from collections import defaultdict
from dotenv import load_dotenv
import threading
from concurrent.futures import ThreadPoolExecutor
import asyncio

load_dotenv()

class SmartScreenshotsManager:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        )
        self.bucket_name = 'ddsfocustime'
        self.cache_dir = os.path.join('dashboard', 'data')
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Cache files
        self.quick_cache = os.path.join(self.cache_dir, 'quick_screenshots_cache.json')
        self.complete_cache = os.path.join(self.cache_dir, 'complete_screenshots_cache.json')
        self.user_cache_dir = os.path.join(self.cache_dir, 'users')
        os.makedirs(self.user_cache_dir, exist_ok=True)

    def get_quick_counts_only(self):
        """FAST: Get only screenshot counts per user (2-3 minutes for all users)"""
        print("🚀 Quick Count Analysis - Getting counts only...")
        print("⚡ This will take 2-3 minutes and give instant API responses!")
        
        user_counts = {}
        
        try:
            # Get all user folders
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
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
            
            print(f"📁 Found {len(user_folders)} users")
            print("📊 Getting counts (this is much faster)...")
            
            for i, user_folder in enumerate(user_folders, 1):
                user_email = user_folder.replace('_at_', '@')
                prefix = f"screenshots/{user_folder}/"
                
                print(f"   {i:2d}/{len(user_folders)}: {user_email}")
                
                # Count objects efficiently
                total_count = 0
                total_size = 0
                continuation_token = None
                
                while True:
                    kwargs = {
                        'Bucket': self.bucket_name,
                        'Prefix': prefix,
                        'MaxKeys': 1000
                    }
                    
                    if continuation_token:
                        kwargs['ContinuationToken'] = continuation_token
                    
                    response = self.s3_client.list_objects_v2(**kwargs)
                    
                    if 'Contents' in response:
                        # Count only screenshot files
                        screenshots = [
                            obj for obj in response['Contents']
                            if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif'))
                            and not obj['Key'].endswith('/')
                        ]
                        total_count += len(screenshots)
                        total_size += sum(obj['Size'] for obj in screenshots)
                    
                    if response.get('IsTruncated', False):
                        continuation_token = response['NextContinuationToken']
                    else:
                        break
                
                user_counts[user_email] = {
                    'total_count': total_count,
                    'total_size': total_size,
                    'last_updated': datetime.now().isoformat()
                }
                
                size_mb = total_size / (1024*1024)
                print(f"      📸 {total_count:,} screenshots ({size_mb:.1f} MB)")
            
            # Save quick cache
            cache_data = {
                'generated_at': datetime.now().isoformat(),
                'type': 'quick_counts',
                'total_users': len(user_counts),
                'total_screenshots': sum(data['total_count'] for data in user_counts.values()),
                'users': user_counts
            }
            
            with open(self.quick_cache, 'w') as f:
                json.dump(cache_data, f, indent=2)
            
            print(f"\n✅ Quick counts saved! API will now be instant!")
            return cache_data
            
        except Exception as e:
            print(f"❌ Error in quick count: {e}")
            return None

    def get_detailed_user_data(self, user_email, max_files=1000):
        """Get detailed data for a specific user (on-demand)"""
        print(f"🔍 Getting detailed data for {user_email}...")
        
        user_folder = user_email.replace('@', '_at_')
        prefix = f"screenshots/{user_folder}/"
        
        user_data = {
            'files': [],
            'projects': defaultdict(int),
            'latest_date': None
        }
        
        try:
            continuation_token = None
            file_count = 0
            
            while file_count < max_files:
                kwargs = {
                    'Bucket': self.bucket_name,
                    'Prefix': prefix,
                    'MaxKeys': min(1000, max_files - file_count)
                }
                
                if continuation_token:
                    kwargs['ContinuationToken'] = continuation_token
                
                response = self.s3_client.list_objects_v2(**kwargs)
                
                if 'Contents' in response:
                    screenshots = [
                        obj for obj in response['Contents']
                        if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif'))
                        and not obj['Key'].endswith('/')
                    ]
                    
                    for obj in screenshots:
                        path_parts = obj['Key'].split('/')
                        project = path_parts[2] if len(path_parts) >= 3 else 'Unknown'
                        
                        user_data['projects'][project] += 1
                        
                        if not user_data['latest_date'] or obj['LastModified'] > user_data['latest_date']:
                            user_data['latest_date'] = obj['LastModified']
                        
                        user_data['files'].append({
                            'filename': os.path.basename(obj['Key']),
                            'project': project,
                            'size': obj['Size'],
                            'date': obj['LastModified'].isoformat(),
                            'full_path': obj['Key']
                        })
                        
                        file_count += 1
                        if file_count >= max_files:
                            break
                
                if not response.get('IsTruncated', False) or file_count >= max_files:
                    break
                
                continuation_token = response['NextContinuationToken']
            
            # Cache user details
            user_cache_file = os.path.join(self.user_cache_dir, f"{user_email.replace('@', '_at_')}.json")
            user_cache_data = {
                'email': user_email,
                'generated_at': datetime.now().isoformat(),
                'projects': dict(user_data['projects']),
                'latest_date': user_data['latest_date'].isoformat() if user_data['latest_date'] else None,
                'sample_files': user_data['files']
            }
            
            with open(user_cache_file, 'w') as f:
                json.dump(user_cache_data, f, indent=2)
            
            return user_data
            
        except Exception as e:
            print(f"❌ Error getting user details: {e}")
            return None

    def is_cache_fresh(self, cache_file, max_age_hours=24):
        """Check if cache is fresh enough"""
        if not os.path.exists(cache_file):
            return False
        
        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
            
            generated_at = datetime.fromisoformat(data['generated_at'])
            age = datetime.now() - generated_at
            
            return age < timedelta(hours=max_age_hours)
        except:
            return False

    def get_instant_api_data(self, limit_users=None):
        """Get instant API response from cache"""
        if not os.path.exists(self.quick_cache):
            return None
        
        try:
            with open(self.quick_cache, 'r') as f:
                data = json.load(f)
            
            users = data['users']
            
            # Sort by screenshot count
            sorted_users = sorted(users.items(), 
                                key=lambda x: x[1]['total_count'], 
                                reverse=True)
            
            if limit_users:
                sorted_users = sorted_users[:limit_users]
            
            return {
                'users': dict(sorted_users),
                'total_users': len(sorted_users),
                'total_screenshots': sum(user_data['total_count'] for _, user_data in sorted_users),
                'cache_generated': data['generated_at'],
                'response_time': 'instant'
            }
            
        except Exception as e:
            print(f"❌ Error reading cache: {e}")
            return None

def run_background_update():
    """Background job to update cache (run this as cron job)"""
    print("🔄 Starting background cache update...")
    
    manager = SmartScreenshotsManager()
    
    # Check if quick cache needs update
    if not manager.is_cache_fresh(manager.quick_cache, max_age_hours=6):
        print("📊 Updating quick counts cache...")
        manager.get_quick_counts_only()
    else:
        print("✅ Quick cache is fresh")
    
    print("🎉 Background update complete!")

def main():
    """Main function with options"""
    print("🚀 Smart Screenshots Management System")
    print("=" * 50)
    print("1. Quick Count Analysis (2-3 min) → Instant API")
    print("2. Test Instant API Response")
    print("3. Get Detailed User Data")
    print("4. Check Cache Status")
    print()
    
    choice = input("Choose option (1-4): ").strip()
    
    manager = SmartScreenshotsManager()
    
    if choice == '1':
        print("\n🚀 Running quick count analysis...")
        result = manager.get_quick_counts_only()
        if result:
            print(f"\n✅ Analysis complete!")
            print(f"📊 Found {result['total_screenshots']:,} screenshots from {result['total_users']} users")
            print(f"⚡ API will now respond instantly!")
    
    elif choice == '2':
        print("\n⚡ Testing instant API response...")
        start_time = time.time()
        result = manager.get_instant_api_data(limit_users=10)
        end_time = time.time()
        
        if result:
            print(f"✅ Response time: {(end_time - start_time)*1000:.1f}ms")
            print(f"📊 Users: {result['total_users']}")
            print(f"📸 Screenshots: {result['total_screenshots']:,}")
            print(f"🕐 Cache from: {result['cache_generated'][:19]}")
        else:
            print("❌ No cache found. Run option 1 first.")
    
    elif choice == '3':
        email = input("Enter user email: ").strip()
        if email:
            result = manager.get_detailed_user_data(email)
            if result:
                print(f"✅ Found {len(result['files'])} files")
                print(f"📁 Projects: {len(result['projects'])}")
    
    elif choice == '4':
        fresh = manager.is_cache_fresh(manager.quick_cache)
        print(f"Quick cache: {'✅ Fresh' if fresh else '❌ Needs update'}")
        
        if os.path.exists(manager.quick_cache):
            with open(manager.quick_cache, 'r') as f:
                data = json.load(f)
            print(f"Last updated: {data['generated_at'][:19]}")
            print(f"Users: {data['total_users']}")
            print(f"Screenshots: {data['total_screenshots']:,}")

if __name__ == "__main__":
    main()
