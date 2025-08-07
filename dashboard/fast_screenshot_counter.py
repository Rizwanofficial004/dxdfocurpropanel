"""
Fast Daily Screenshot Counter - Direct S3 Image Scanning
Optimized for fast execution as a cron job to count actual image files per user
"""

import boto3
import json
import os
from datetime import datetime, date
from collections import defaultdict
import time

# S3 Setup with your credentials
s3_client = boto3.client(
    's3',
    aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
    aws_secret_access_key="sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS",
    region_name="eu-north-1"
)

bucket_name = 'ddsfocustime'

# Image file extensions to count as screenshots
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}

def count_user_screenshots_fast():
    """
    Ultra-fast counting of screenshot images per user
    Scans all objects and counts only image files
    """
    print(f"🔍 Fast Screenshot Counting - {datetime.now()}")
    print("=" * 60)
    
    start_time = time.time()
    user_counts = defaultdict(int)
    total_screenshots = 0
    processed_objects = 0
    
    try:
        print(f"📦 Scanning bucket: {bucket_name}")
        print(f"🖼️  Looking for image files...")
        
        # Use pagination for efficient scanning
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bucket_name,
            PaginationConfig={
                'MaxItems': None,
                'PageSize': 1000  # Process 1000 objects per page
            }
        )
        
        for page in page_iterator:
            if 'Contents' not in page:
                continue
                
            for obj in page['Contents']:
                key = obj['Key']
                processed_objects += 1
                
                # Check if it's an image file
                file_extension = os.path.splitext(key.lower())[1]
                if file_extension in IMAGE_EXTENSIONS:
                    # Extract user email from any path structure
                    parts = key.split('/')
                    
                    user_email = None
                    
                    # Look for email pattern in all path parts
                    for part in parts:
                        if '@' in part and '.' in part:  # Email pattern
                            user_email = part
                            break
                    
                    if user_email:
                        user_counts[user_email] += 1
                        total_screenshots += 1
                        
                        # Debug: show first few findings
                        if total_screenshots <= 5:
                            print(f"   🎯 Found: {key} -> {user_email}")
                
                # Progress indicator every 5000 objects
                if processed_objects % 5000 == 0:
                    elapsed = time.time() - start_time
                    print(f"   📊 Processed {processed_objects:,} objects, found {total_screenshots:,} images in {elapsed:.1f}s...")
        
        elapsed_time = time.time() - start_time
        
        print(f"\n✅ Scanning Complete!")
        print(f"⏱️  Time taken: {elapsed_time:.2f} seconds")
        print(f"📊 Total objects processed: {processed_objects:,}")
        print(f"🖼️  Total screenshot images: {total_screenshots:,}")
        print(f"👥 Users with screenshots: {len(user_counts)}")
        
        if total_screenshots > 0:
            print(f"📈 Average screenshots per user: {total_screenshots // len(user_counts) if len(user_counts) > 0 else 0}")
        
        return dict(user_counts), total_screenshots
        
    except Exception as e:
        print(f"❌ Error counting screenshots: {e}")
        return {}, 0

def save_results(user_counts, total_screenshots):
    """Save results to multiple formats for easy consumption"""
    today = date.today().isoformat()
    timestamp = datetime.now().isoformat()
    
    # Create comprehensive data structure
    data = {
        'date': today,
        'timestamp': timestamp,
        'total_screenshots': total_screenshots,
        'total_users': len(user_counts),
        'average_per_user': total_screenshots // len(user_counts) if len(user_counts) > 0 else 0,
        'user_counts': user_counts
    }
    
    files_created = []
    
    # 1. Save daily summary JSON
    daily_file = f"daily_screenshot_counts_{today}.json"
    try:
        with open(daily_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        files_created.append(daily_file)
        print(f"💾 Daily summary: {daily_file}")
    except Exception as e:
        print(f"❌ Error saving daily file: {e}")
    
    # 2. Save API-ready response
    api_file = "latest_screenshot_counts.json"
    api_data = {
        'status': 'success',
        'date': today,
        'last_updated': timestamp,
        'data': data
    }
    try:
        with open(api_file, 'w', encoding='utf-8') as f:
            json.dump(api_data, f, indent=2, ensure_ascii=False)
        files_created.append(api_file)
        print(f"🔗 API response: {api_file}")
    except Exception as e:
        print(f"❌ Error saving API file: {e}")
    
    # 3. Save simple CSV for easy viewing
    csv_file = f"screenshot_counts_{today}.csv"
    try:
        with open(csv_file, 'w', encoding='utf-8') as f:
            f.write("Email,Screenshot_Count\\n")
            for email, count in sorted(user_counts.items(), key=lambda x: x[1], reverse=True):
                f.write(f"{email},{count}\\n")
        files_created.append(csv_file)
        print(f"📊 CSV report: {csv_file}")
    except Exception as e:
        print(f"❌ Error saving CSV file: {e}")
    
    return files_created

def display_top_users(user_counts, limit=20):
    """Display top users by screenshot count"""
    if not user_counts:
        print("❌ No user data to display")
        return
    
    print(f"\\n📈 Top {limit} Users by Screenshot Count:")
    print("-" * 70)
    
    sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    for i, (email, count) in enumerate(sorted_users, 1):
        print(f"{i:2d}. {email:<40} {count:,} screenshots")
        
        # Highlight specific users
        if email == 'beyza-donmez-@hotmail.com':
            print(f"    🎯 BEYZA FOUND: {count} screenshots ✅")

def create_cron_script():
    """Create a shell script for easy cron job setup"""
    script_content = f'''#!/bin/bash
# Daily Screenshot Counter Cron Job
# Add to crontab with: 0 6 * * * /path/to/this/script.sh

cd "$(dirname "$0")"
echo "$(date): Starting daily screenshot count..." >> cron.log
python fast_screenshot_counter.py >> cron.log 2>&1
echo "$(date): Daily screenshot count completed" >> cron.log
'''
    
    try:
        with open('run_daily_count.sh', 'w') as f:
            f.write(script_content)
        
        # Make it executable on Unix systems
        try:
            os.chmod('run_daily_count.sh', 0o755)
        except:
            pass  # Windows doesn't need chmod
        
        print(f"📜 Created cron script: run_daily_count.sh")
        return True
    except Exception as e:
        print(f"❌ Error creating cron script: {e}")
        return False

def main():
    """Main function optimized for cron job execution"""
    print("🚀 Fast Screenshot Counter (Optimized for Cron)")
    print("=" * 70)
    print(f"📅 Date: {date.today()}")
    print(f"⏰ Time: {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 70)
    
    # Count screenshots with timing
    start_total = time.time()
    user_counts, total_screenshots = count_user_screenshots_fast()
    
    if total_screenshots > 0:
        # Save results in multiple formats
        files_created = save_results(user_counts, total_screenshots)
        
        # Display top users
        display_top_users(user_counts)
        
        # Create cron script for future use
        create_cron_script()
        
        total_time = time.time() - start_total
        
        print(f"\\n🎉 Fast count complete in {total_time:.2f} seconds!")
        print(f"📊 Files created: {len(files_created)}")
        for file in files_created:
            print(f"   📄 {file}")
        
        # Quick verification for specific user
        if 'beyza-donmez-@hotmail.com' in user_counts:
            beyza_count = user_counts['beyza-donmez-@hotmail.com']
            print(f"\\n🔍 Quick verification:")
            print(f"   beyza-donmez-@hotmail.com: {beyza_count:,} screenshots")
        
        # Cron job instructions
        print(f"\\n🔧 To set up as daily cron job:")
        print(f"   crontab -e")
        print(f"   Add: 0 6 * * * cd {os.getcwd()} && python fast_screenshot_counter.py")
        
        return True
    else:
        print(f"\\n❌ No screenshots found!")
        print(f"💡 Check if images are stored in a different path structure")
        return False

if __name__ == "__main__":
    success = main()
    
    exit_code = 0 if success else 1
    exit(exit_code)
