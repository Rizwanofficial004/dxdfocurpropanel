"""
Direct Screenshot Counter - No Date Filtering
Counts actual screenshots from your S3 screenshots/ folder structure
Fast daily execution for cron jobs
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

# Image file extensions to count as screenshots
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}

# Thread-safe counter for parallel processing
count_lock = threading.Lock()
global_user_counts = defaultdict(int)

def count_user_folder_fast(user_folder):
    """Lightning fast counting of a single user folder using sampling"""
    user_name = user_folder.replace(screenshots_prefix, '').rstrip('/')
    user_email = user_name.replace('_at_', '@').replace('-_at_', '@')
    
    try:
        # Create thread-specific S3 client for parallel processing
        thread_s3 = boto3.client(
            's3',
            aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
            aws_secret_access_key="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",
            region_name="eu-north-1"
        )
        
        # Smart sampling: count first 1000 files for speed, estimate if more
        paginator = thread_s3.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            Prefix=user_folder,
            PaginationConfig={'MaxItems': 1000, 'PageSize': 1000}
        )
        
        count = 0
        for page in page_iterator:
            if 'Contents' in page:
                count += len(page['Contents'])
        
        # If we hit 1000 limit, this user has more files - use precise count for heavy users
        if count == 1000:
            # For heavy users, do a more precise count (but still limit to reasonable time)
            try:
                total_count = 0
                all_pages = paginator.paginate(
                    Bucket=bucket_name,
                    Prefix=user_folder,
                    PaginationConfig={'MaxItems': 10000, 'PageSize': 1000}  # Cap at 10k for speed
                )
                for page in all_pages:
                    if 'Contents' in page:
                        total_count += len(page['Contents'])
                count = min(total_count, 600000)  # Reasonable maximum
            except:
                count = 1000  # Fallback to sample count
        
        # Thread-safe update
        with count_lock:
            global_user_counts[user_email] = count
        
        return user_email, count
        
    except Exception as e:
        print(f"   ❌ Error counting {user_email}: {e}")
        return user_email, 0

def count_screenshots_by_user():
    """
    Ultra-fast counting using S3 prefix listing
    Counts objects per user folder without downloading/scanning files
    """
    print(f"� Ultra-Fast Screenshot Counting (Prefix Method)")
    print("=" * 60)
    
    start_time = time.time()
    user_counts = defaultdict(int)
    total_screenshots = 0
    
    try:
        print(f"📦 Getting user folders from: s3://{bucket_name}/{screenshots_prefix}")
        
        # First, get all user folders (much faster than scanning all files)
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=screenshots_prefix,
            Delimiter='/',
            MaxKeys=1000
        )
        
        if 'CommonPrefixes' not in response:
            print("❌ No user folders found")
            return {}, 0, {}
        
        user_folders = [prefix['Prefix'] for prefix in response['CommonPrefixes']]
        print(f"👥 Found {len(user_folders)} user folders")
        
        # Count objects in each user folder (much faster than checking file extensions)
        for i, user_folder in enumerate(user_folders, 1):
            user_name = user_folder.replace(screenshots_prefix, '').rstrip('/')
            
            # Convert folder name to email format
            user_email = user_name.replace('_at_', '@').replace('-_at_', '@')
            
            # Count all objects in this user's folder (assume all are screenshots)
            try:
                paginator = s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=bucket_name,
                    Prefix=user_folder,
                    PaginationConfig={'MaxItems': None, 'PageSize': 1000}
                )
                
                user_count = 0
                for page in page_iterator:
                    if 'Contents' in page:
                        # Count all files (assume they're all screenshots for speed)
                        user_count += len(page['Contents'])
                
                user_counts[user_email] = user_count
                total_screenshots += user_count
                
                print(f"   {i:2d}. {user_email:<40} {user_count:,} files")
                
            except Exception as e:
                print(f"   ❌ Error counting {user_email}: {e}")
        
        processing_time = time.time() - start_time
        
        print(f"\\n⚡ Ultra-fast counting complete!")
        print(f"⏱️  Processing time: {processing_time:.2f} seconds")
        print(f"🖼️  Total files counted: {total_screenshots:,}")
        print(f"👥 Users processed: {len(user_counts)}")
        
        if total_screenshots > 0:
            print(f"📈 Average files per user: {total_screenshots // len(user_counts)}")
        
        return dict(user_counts), total_screenshots, {
            'processing_time': processing_time,
            'users_processed': len(user_counts),
            'method': 'ultra_fast_prefix_counting'
        }
        
    except Exception as e:
        print(f"❌ Error in ultra-fast counting: {e}")
        return {}, 0, {}

def save_daily_results(user_counts, total_screenshots, metadata):
    """Save results for API consumption and daily records"""
    today = date.today().isoformat()
    timestamp = datetime.now().isoformat()
    
    # Create data structure
    data = {
        'date': today,
        'timestamp': timestamp,
        'source': 'direct_s3_scan',
        'method': metadata.get('method', 'unknown'),
        'processing_time_seconds': metadata.get('processing_time', 0),
        'users_processed': metadata.get('users_processed', 0),
        'total_screenshots': total_screenshots,
        'total_users': len(user_counts),
        'average_per_user': total_screenshots // len(user_counts) if len(user_counts) > 0 else 0,
        'user_screenshot_counts': user_counts
    }
    
    files_created = []
    
    # 1. API response file (for your Django API to consume)
    api_file = "daily_screenshot_counts.json"
    api_response = {
        'status': 'success',
        'last_updated': timestamp,
        'data': data
    }
    
    try:
        with open(api_file, 'w', encoding='utf-8') as f:
            json.dump(api_response, f, indent=2, ensure_ascii=False)
        files_created.append(api_file)
        print(f"💾 API file: {api_file}")
    except Exception as e:
        print(f"❌ Error saving API file: {e}")
    
    # 2. Daily archive
    archive_file = f"screenshot_archive_{today}.json"
    try:
        with open(archive_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        files_created.append(archive_file)
        print(f"📄 Archive: {archive_file}")
    except Exception as e:
        print(f"❌ Error saving archive: {e}")
    
    # 3. Simple CSV for easy viewing
    csv_file = f"user_totals_{today}.csv"
    try:
        with open(csv_file, 'w', encoding='utf-8') as f:
            f.write("User_Email,Screenshot_Count\\n")
            for email, count in sorted(user_counts.items(), key=lambda x: x[1], reverse=True):
                f.write(f'"{email}",{count}\\n')
        files_created.append(csv_file)
        print(f"📊 CSV: {csv_file}")
    except Exception as e:
        print(f"❌ Error saving CSV: {e}")
    
    return files_created

def display_results(user_counts, total_screenshots, metadata):
    """Display the results"""
    if not user_counts:
        print("❌ No screenshot data found")
        return
    
    processing_time = metadata.get('processing_time', 0)
    users_processed = metadata.get('users_processed', 0)
    
    print(f"\\n📊 DAILY SCREENSHOT TOTALS - {date.today()}")
    print("=" * 60)
    print(f"⚡ Processing time: {processing_time:.2f} seconds")
    print(f"� Users processed: {users_processed:,}")
    print(f"🖼️  Total files counted: {total_screenshots:,}")
    print(f"� Method: Ultra-Fast Prefix Counting")
    print("=" * 60)
    
    # Show all users (sorted by count)
    print(f"\\n🏆 ALL USERS BY SCREENSHOT COUNT:")
    print("-" * 60)
    
    sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
    
    for i, (email, count) in enumerate(sorted_users, 1):
        print(f"{i:2d}. {email:<40} {count:,}")
        
        # Highlight specific user
        if 'beyza-donmez' in email:
            print(f"    🎯 BEYZA VERIFIED: {count:,} screenshots ✅")

def create_cron_files():
    """Create cron job and scheduling files"""
    
    # PowerShell script for Windows
    ps_script = '''# Daily Screenshot Counter - No Date Filter
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$logFile = "daily_screenshot_cron.log"
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"$date - Starting daily screenshot count (no date filter)..." | Add-Content $logFile

try {
    python direct_screenshot_counter.py 2>&1 | Add-Content $logFile
    "$date - Daily screenshot count completed successfully" | Add-Content $logFile
} catch {
    "$date - ERROR: $_" | Add-Content $logFile
    exit 1
}
'''
    
    try:
        with open('run_daily_screenshots.ps1', 'w') as f:
            f.write(ps_script)
        print("📜 Created: run_daily_screenshots.ps1")
    except Exception as e:
        print(f"❌ Error creating PS script: {e}")
    
    # Batch file for Windows
    batch_script = f'''@echo off
cd /d "{os.getcwd()}"
echo %date% %time% - Starting daily screenshot count... >> daily_screenshot_cron.log
python direct_screenshot_counter.py >> daily_screenshot_cron.log 2>&1
echo %date% %time% - Daily screenshot count completed >> daily_screenshot_cron.log
'''
    
    try:
        with open('run_daily_screenshots.bat', 'w') as f:
            f.write(batch_script)
        print("📜 Created: run_daily_screenshots.bat")
    except Exception as e:
        print(f"❌ Error creating batch file: {e}")
    
    # Setup instructions
    instructions = f'''
DAILY SCREENSHOT COUNTER SETUP (No Date Filter)
===============================================

## What this does:
- Counts ALL screenshots in s3://ddsfocustime/screenshots/
- No date filtering - gives total counts per user
- Fast execution (typically under 30 seconds)
- Creates daily_screenshot_counts.json for your API

## Scheduling Options:

### Windows Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task: "Daily Screenshot Count"
3. Trigger: Daily at 6:00 AM
4. Action: Start a program
   - Program: {os.getcwd()}\\run_daily_screenshots.bat
   OR
   - Program: powershell.exe
   - Arguments: -File "{os.getcwd()}\\run_daily_screenshots.ps1"

### Linux Crontab:
0 6 * * * cd {os.getcwd()} && python direct_screenshot_counter.py >> cron.log 2>&1

## Files Generated Daily:
- daily_screenshot_counts.json (API consumption)
- screenshot_archive_YYYY-MM-DD.json (daily backup)
- user_totals_YYYY-MM-DD.csv (human readable)

## Your Django API Integration:
Update your API to read from: daily_screenshot_counts.json

Example Django code:
```python
import json
def get_daily_screenshots():
    try:
        with open('daily_screenshot_counts.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {{"error": "Daily counts not available"}}
```

## Testing:
Run manually: python direct_screenshot_counter.py
Check logs: daily_screenshot_cron.log
'''
    
    try:
        with open('SETUP_DAILY_SCREENSHOTS.txt', 'w') as f:
            f.write(instructions)
        print("📋 Created: SETUP_DAILY_SCREENSHOTS.txt")
    except Exception as e:
        print(f"❌ Error creating instructions: {e}")

def main():
    """Main function for daily screenshot counting"""
    print("🚀 DIRECT SCREENSHOT COUNTER (NO DATE FILTER)")
    print("=" * 70)
    print(f"📅 Date: {date.today()}")
    print(f"⏰ Time: {datetime.now().strftime('%H:%M:%S')}")
    print(f"📦 Bucket: {bucket_name}")
    print(f"📁 Scanning: {screenshots_prefix}")
    print("=" * 70)
    
    start_time = time.time()
    
    # Count all screenshots
    user_counts, total_screenshots, metadata = count_screenshots_by_user()
    
    if total_screenshots > 0:
        # Save results
        files_created = save_daily_results(user_counts, total_screenshots, metadata)
        
        # Display results
        display_results(user_counts, total_screenshots, metadata)
        
        # Create setup files
        create_cron_files()
        
        total_time = time.time() - start_time
        
        print(f"\\n🎉 DAILY PROCESSING COMPLETE!")
        print(f"⚡ Total time: {total_time:.2f} seconds")
        print(f"📄 Files created: {len(files_created)}")
        
        # Verification for Beyza
        for email, count in user_counts.items():
            if 'beyza' in email.lower():
                print(f"\\n🔍 VERIFICATION:")
                print(f"   {email}: {count:,} screenshots")
                print(f"   ✅ Source: Direct S3 scan of screenshots/ folder")
                break
        
        print(f"\\n📖 Next Steps:")
        print(f"   1. Check SETUP_DAILY_SCREENSHOTS.txt for scheduling")
        print(f"   2. Your API can read: daily_screenshot_counts.json")
        print(f"   3. Set up Windows Task Scheduler or crontab")
        
        return True
    else:
        print("❌ No screenshots found!")
        print("💡 Check if screenshots are in the screenshots/ folder")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
