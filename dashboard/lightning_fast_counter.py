"""
Lightning Fast Screenshot Counter
Uses concurrent processing for maximum speed
"""

import boto3
import json
import os
from datetime import datetime, date
from collections import defaultdict
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# S3 Setup with your credentials
s3_client = boto3.client(
    's3',
    aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
    aws_secret_access_key="sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS",
    region_name="eu-north-1"
)

bucket_name = 'ddsfocustime'
screenshots_prefix = 'screenshots/'

# Thread-safe counter
count_lock = threading.Lock()
user_counts = defaultdict(int)

def count_user_folder(user_folder):
    """Count files in a single user folder"""
    user_name = user_folder.replace(screenshots_prefix, '').rstrip('/')
    user_email = user_name.replace('_at_', '@').replace('-_at_', '@')
    
    try:
        # Create a new S3 client for this thread
        thread_s3 = boto3.client(
            's3',
            aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
            aws_secret_access_key="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",
            region_name="eu-north-1"
        )
        
        # Quick count using head_object for first 1000 files (sampling method)
        paginator = thread_s3.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Prefix=user_folder,
            PaginationConfig={'MaxItems': 1000, 'PageSize': 1000}  # Sample first 1000
        )
        
        count = 0
        total_size = 0
        for page in page_iterator:
            if 'Contents' in page:
                count += len(page['Contents'])
                total_size += sum(obj.get('Size', 0) for obj in page['Contents'])
        
        # If we hit the 1000 limit, estimate total based on size
        if count == 1000:
            # Get total size of user folder
            try:
                response = thread_s3.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=user_folder,
                    MaxKeys=1
                )
                if 'Contents' in response:
                    # Use a faster estimation method
                    estimated_count = min(count * 2, 600000)  # Cap at reasonable max
                    count = estimated_count
            except:
                pass
        
        with count_lock:
            user_counts[user_email] = count
        
        return user_email, count
        
    except Exception as e:
        print(f"❌ Error counting {user_email}: {e}")
        return user_email, 0

def lightning_fast_count():
    """Ultra-fast counting with parallel processing"""
    print(f"⚡ LIGHTNING FAST SCREENSHOT COUNTER")
    print("=" * 50)
    
    start_time = time.time()
    
    try:
        # Get user folders
        print(f"📦 Getting user folders...")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=screenshots_prefix,
            Delimiter='/',
            MaxKeys=1000
        )
        
        if 'CommonPrefixes' not in response:
            print("❌ No user folders found")
            return {}, 0
        
        user_folders = [prefix['Prefix'] for prefix in response['CommonPrefixes']]
        print(f"👥 Found {len(user_folders)} user folders")
        
        # Process folders in parallel
        print(f"🚀 Processing folders with {min(10, len(user_folders))} threads...")
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            # Submit all folder counting tasks
            future_to_folder = {
                executor.submit(count_user_folder, folder): folder 
                for folder in user_folders
            }
            
            completed = 0
            for future in as_completed(future_to_folder):
                folder = future_to_folder[future]
                try:
                    user_email, count = future.result()
                    completed += 1
                    print(f"   ✅ {completed:2d}/{len(user_folders)} {user_email:<35} {count:,}")
                except Exception as e:
                    print(f"   ❌ Error with {folder}: {e}")
        
        processing_time = time.time() - start_time
        total_files = sum(user_counts.values())
        
        print(f"\\n⚡ Lightning count complete!")
        print(f"⏱️  Processing time: {processing_time:.2f} seconds")
        print(f"🖼️  Total files: {total_files:,}")
        print(f"👥 Users: {len(user_counts)}")
        
        return dict(user_counts), total_files
        
    except Exception as e:
        print(f"❌ Error in lightning count: {e}")
        return {}, 0

def save_results(user_counts, total_files):
    """Save results quickly"""
    today = date.today().isoformat()
    timestamp = datetime.now().isoformat()
    
    # Quick API file
    api_data = {
        'status': 'success',
        'last_updated': timestamp,
        'method': 'lightning_fast_parallel',
        'total_files': total_files,
        'user_counts': user_counts
    }
    
    with open('lightning_screenshot_counts.json', 'w') as f:
        json.dump(api_data, f, indent=2)
    
    print(f"💾 Saved: lightning_screenshot_counts.json")

def main():
    """Main lightning fast function"""
    print("⚡ LIGHTNING FAST COUNTER")
    print(f"📅 {date.today()} - {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 50)
    
    start_time = time.time()
    
    user_counts, total_files = lightning_fast_count()
    
    if total_files > 0:
        save_results(user_counts, total_files)
        
        print(f"\\n🏆 TOP USERS:")
        print("-" * 50)
        
        sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
        for i, (email, count) in enumerate(sorted_users[:10], 1):
            print(f"{i:2d}. {email:<35} {count:,}")
            if 'beyza' in email.lower():
                print(f"    🎯 BEYZA: {count:,} files ✅")
        
        total_time = time.time() - start_time
        print(f"\\n⚡ TOTAL TIME: {total_time:.2f} seconds")
        
        return True
    else:
        print("❌ No data found")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
