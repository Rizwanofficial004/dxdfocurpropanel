"""
S3 Inventory Based Daily Screenshot Counter
Uses AWS S3 Inventory reports for ultra-fast daily screenshot counting
Optimized for cron job execution with inventory-based processing
"""

import boto3
import json
import csv
import io
import gzip
import os
from datetime import datetime, date, timedelta
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
inventory_config_name = 'screenshot-inventory'  # From your AWS console screenshot
inventory_destination = f'{bucket_name}/{inventory_config_name}/{bucket_name}/'

# Image file extensions to count as screenshots
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}

def find_latest_inventory_report():
    """
    Find the latest S3 inventory report from your inventory configuration
    Checks multiple possible paths based on AWS S3 inventory structure
    """
    print(f"🔍 Looking for latest inventory report...")
    
    # AWS S3 Inventory stores files based on your configuration
    # Your destination is: s3://ddsfocustime/screenshot-inventory/
    possible_prefixes = [
        'screenshot-inventory/',                        # Your configured destination
        'screenshot-inventory/ddsfocustime/',          # Destination + bucket name
        'screenshot-inventory/data/',                  # Destination + data folder
        'screenshot-inventory/ddsfocustime/data/',     # Destination + bucket + data
        'screenshot-inventory/2025/',                  # Destination + year
        'screenshot-inventory/ddsfocustime/2025/',     # Destination + bucket + year
    ]
    
    print(f"📁 Checking possible inventory paths...")
    
    for prefix in possible_prefixes:
        print(f"   🔍 Checking: s3://{bucket_name}/{prefix}")
        
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=prefix,
                MaxKeys=100
            )
            
            if 'Contents' not in response or len(response['Contents']) == 0:
                print(f"      ❌ No files found")
                continue
            
            print(f"      ✅ Found {len(response['Contents'])} files")
            
            # Look for manifest files first, then data files
            manifest_files = []
            data_files = []
            
            for obj in response['Contents']:
                key = obj['Key']
                print(f"         📄 {key} ({obj['Size']} bytes, {obj['LastModified']})")
                
                if 'manifest.json' in key:
                    manifest_files.append({
                        'key': key,
                        'last_modified': obj['LastModified'],
                        'size': obj['Size']
                    })
                elif key.endswith('.csv') or key.endswith('.csv.gz'):
                    data_files.append({
                        'key': key,
                        'last_modified': obj['LastModified'],
                        'size': obj['Size']
                    })
            
            # Process files found in this prefix
            if manifest_files:
                latest_manifest = sorted(manifest_files, key=lambda x: x['last_modified'], reverse=True)[0]
                print(f"      📋 Using latest manifest: {latest_manifest['key']}")
                return process_manifest_file(latest_manifest['key'])
            
            elif data_files:
                latest_data = sorted(data_files, key=lambda x: x['last_modified'], reverse=True)[0]
                print(f"      📊 Using latest data file: {latest_data['key']}")
                return latest_data['key']
                
        except Exception as e:
            print(f"      ❌ Error checking {prefix}: {e}")
            continue
    
    # If no inventory found, show what's actually in the bucket
    print(f"\\n🔍 No inventory found. Showing bucket contents for debugging...")
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            MaxKeys=50
        )
        
        if 'Contents' in response:
            print(f"📦 Found {len(response['Contents'])} objects in bucket root:")
            for obj in response['Contents'][:20]:  # Show first 20
                key = obj['Key']
                if 'inventory' in key.lower() or 'manifest' in key.lower() or key.endswith('.csv'):
                    print(f"   📄 {key} ({obj['Size']} bytes)")
        else:
            print("❌ No objects found in bucket")
            
    except Exception as e:
        print(f"❌ Error listing bucket contents: {e}")
    
    return None

def process_manifest_file(manifest_key):
    """
    Process the manifest.json file to get the actual data file locations
    """
    try:
        print(f"📋 Processing manifest file: {manifest_key}")
        
        # Download and parse manifest
        response = s3_client.get_object(Bucket=bucket_name, Key=manifest_key)
        manifest_content = response['Body'].read().decode('utf-8')
        manifest = json.loads(manifest_content)
        
        # Get data files from manifest
        if 'files' in manifest:
            files = manifest['files']
            if files:
                # Use the first data file (usually there's only one)
                data_file_key = files[0]['key']
                print(f"📊 Data file from manifest: {data_file_key}")
                return data_file_key
        
        print("❌ No data files found in manifest")
        return None
        
    except Exception as e:
        print(f"❌ Error processing manifest: {e}")
        return None

def process_inventory_csv(csv_key):
    """
    Process the inventory CSV file to count screenshots per user
    Ultra-fast processing optimized for daily runs
    """
    print(f"🚀 Processing inventory CSV: {csv_key}")
    start_time = time.time()
    
    user_counts = defaultdict(int)
    total_screenshots = 0
    total_files = 0
    
    try:
        # Download the CSV file
        print("⬇️  Downloading inventory CSV...")
        response = s3_client.get_object(Bucket=bucket_name, Key=csv_key)
        
        # Handle gzipped files
        if csv_key.endswith('.gz'):
            print("📦 Decompressing gzipped file...")
            content = gzip.decompress(response['Body'].read()).decode('utf-8')
        else:
            content = response['Body'].read().decode('utf-8')
        
        # Process CSV content
        print("📊 Processing CSV data...")
        csv_reader = csv.reader(io.StringIO(content))
        
        for row_num, row in enumerate(csv_reader, 1):
            if len(row) < 2:
                continue
            
            total_files += 1
            
            # AWS S3 Inventory CSV format: Bucket,Key,VersionId,IsLatest,IsDeleteMarker,Size,LastModifiedDate,ETag,StorageClass
            object_key = row[1]  # Key is in column 1
            
            # Check if it's an image file
            file_extension = object_key.lower().split('.')[-1] if '.' in object_key else ''
            if f'.{file_extension}' in IMAGE_EXTENSIONS:
                
                # Extract user email from path
                parts = object_key.split('/')
                user_email = None
                
                # Look for email pattern in path parts
                for part in parts:
                    if '@' in part and '.' in part:
                        user_email = part
                        break
                
                if user_email:
                    user_counts[user_email] += 1
                    total_screenshots += 1
                    
                    # Debug: show first few findings
                    if total_screenshots <= 3:
                        print(f"   🎯 Found: {object_key} -> {user_email}")
            
            # Progress indicator every 50,000 rows
            if row_num % 50000 == 0:
                elapsed = time.time() - start_time
                print(f"   📈 Processed {row_num:,} rows, found {total_screenshots:,} screenshots in {elapsed:.1f}s")
        
        processing_time = time.time() - start_time
        
        print(f"\\n✅ Inventory processing complete!")
        print(f"⏱️  Processing time: {processing_time:.2f} seconds")
        print(f"📊 Total files in inventory: {total_files:,}")
        print(f"🖼️  Screenshot images found: {total_screenshots:,}")
        print(f"👥 Users with screenshots: {len(user_counts)}")
        
        return dict(user_counts), total_screenshots, {
            'processing_time': processing_time,
            'total_files': total_files,
            'inventory_file': csv_key
        }
        
    except Exception as e:
        print(f"❌ Error processing CSV: {e}")
        return {}, 0, {}

def save_daily_results(user_counts, total_screenshots, metadata):
    """Save results in multiple formats for API consumption"""
    today = date.today().isoformat()
    timestamp = datetime.now().isoformat()
    
    # Create comprehensive data
    data = {
        'date': today,
        'timestamp': timestamp,
        'source': 's3_inventory',
        'inventory_file': metadata.get('inventory_file', ''),
        'processing_time_seconds': metadata.get('processing_time', 0),
        'total_files_in_inventory': metadata.get('total_files', 0),
        'total_screenshots': total_screenshots,
        'total_users': len(user_counts),
        'average_per_user': total_screenshots // len(user_counts) if len(user_counts) > 0 else 0,
        'user_screenshot_counts': user_counts
    }
    
    files_created = []
    
    # 1. Daily report
    daily_file = f"daily_inventory_report_{today}.json"
    try:
        with open(daily_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        files_created.append(daily_file)
    except Exception as e:
        print(f"❌ Error saving daily file: {e}")
    
    # 2. Latest API response (overwrites daily)
    api_file = "latest_screenshot_counts_api.json"
    api_response = {
        'status': 'success',
        'last_updated': timestamp,
        'data_source': 's3_inventory',
        'data': data
    }
    try:
        with open(api_file, 'w', encoding='utf-8') as f:
            json.dump(api_response, f, indent=2, ensure_ascii=False)
        files_created.append(api_file)
    except Exception as e:
        print(f"❌ Error saving API file: {e}")
    
    # 3. Simple CSV for easy viewing
    csv_file = f"user_screenshots_{today}.csv"
    try:
        with open(csv_file, 'w', encoding='utf-8') as f:
            f.write("User_Email,Screenshot_Count\\n")
            for email, count in sorted(user_counts.items(), key=lambda x: x[1], reverse=True):
                f.write(f'"{email}",{count}\\n')
        files_created.append(csv_file)
    except Exception as e:
        print(f"❌ Error saving CSV: {e}")
    
    return files_created

def display_results(user_counts, total_screenshots, metadata, limit=15):
    """Display processing results"""
    if not user_counts:
        print("❌ No screenshot data found")
        return
    
    print(f"\\n📊 DAILY SCREENSHOT REPORT - {date.today()}")
    print("=" * 70)
    print(f"⚡ Processing time: {metadata.get('processing_time', 0):.2f} seconds")
    print(f"📄 Inventory file: {metadata.get('inventory_file', 'Unknown')}")
    print(f"📊 Total files processed: {metadata.get('total_files', 0):,}")
    print(f"🖼️  Total screenshots: {total_screenshots:,}")
    print(f"👥 Users with screenshots: {len(user_counts)}")
    print("=" * 70)
    
    print(f"\\n🏆 TOP {limit} USERS BY SCREENSHOT COUNT:")
    print("-" * 70)
    
    sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    for i, (email, count) in enumerate(sorted_users, 1):
        print(f"{i:2d}. {email:<45} {count:,} screenshots")
        
        # Highlight specific users
        if email == 'beyza-donmez-@hotmail.com':
            print(f"    🎯 BEYZA VERIFIED: {count:,} screenshots ✅")

def create_cron_setup():
    """Create cron job setup files"""
    # PowerShell script for Windows
    ps_script = f'''# Daily S3 Inventory Screenshot Counter
# Run this script daily to process latest inventory

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$logFile = "cron_inventory.log"
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"$date - Starting inventory processing..." | Add-Content $logFile

try {{
    python s3_inventory_daily_counter.py 2>&1 | Add-Content $logFile
    "$date - Inventory processing completed successfully" | Add-Content $logFile
}} catch {{
    "$date - ERROR: $_" | Add-Content $logFile
    exit 1
}}
'''
    
    try:
        with open('run_daily_inventory.ps1', 'w') as f:
            f.write(ps_script)
        print("📜 Created PowerShell script: run_daily_inventory.ps1")
    except Exception as e:
        print(f"❌ Error creating PS script: {e}")
    
    # Instructions
    instructions = f'''
# DAILY S3 INVENTORY COUNTER SETUP
# ================================

## Windows Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Name: "Daily Screenshot Count"
4. Trigger: Daily at 7:00 AM (after inventory runs at 6:00 AM)
5. Action: Start a program
6. Program: powershell.exe
7. Arguments: -File "{os.getcwd()}\\run_daily_inventory.ps1"

## Linux Crontab:
# Process inventory daily at 7 AM (after S3 inventory runs at 6 AM)
0 7 * * * cd {os.getcwd()} && python s3_inventory_daily_counter.py >> cron.log 2>&1

## Check logs:
- Windows: Check cron_inventory.log
- Linux: Check cron.log

## API Files Generated:
- latest_screenshot_counts_api.json (for your API to read)
- daily_inventory_report_YYYY-MM-DD.json (daily archives)
- user_screenshots_YYYY-MM-DD.csv (human readable)
'''
    
    try:
        with open('CRON_SETUP_INSTRUCTIONS.txt', 'w') as f:
            f.write(instructions)
        print("📋 Created setup instructions: CRON_SETUP_INSTRUCTIONS.txt")
    except Exception as e:
        print(f"❌ Error creating instructions: {e}")

def main():
    """Main function for daily inventory processing"""
    print("🚀 S3 INVENTORY DAILY SCREENSHOT COUNTER")
    print("=" * 70)
    print(f"📅 Date: {date.today()}")
    print(f"⏰ Time: {datetime.now().strftime('%H:%M:%S')}")
    print(f"📦 Bucket: {bucket_name}")
    print(f"📊 Inventory: {inventory_config_name}")
    print("=" * 70)
    
    start_total = time.time()
    
    # Step 1: Find latest inventory report
    latest_csv = find_latest_inventory_report()
    if not latest_csv:
        print("❌ No inventory data available. Check your S3 inventory configuration.")
        return False
    
    # Step 2: Process the inventory CSV
    user_counts, total_screenshots, metadata = process_inventory_csv(latest_csv)
    
    if total_screenshots > 0:
        # Step 3: Save results
        files_created = save_daily_results(user_counts, total_screenshots, metadata)
        
        # Step 4: Display results
        display_results(user_counts, total_screenshots, metadata)
        
        # Step 5: Create cron setup files
        create_cron_setup()
        
        total_time = time.time() - start_total
        
        print(f"\\n🎉 DAILY PROCESSING COMPLETE!")
        print(f"⚡ Total time: {total_time:.2f} seconds")
        print(f"📄 Files created: {len(files_created)}")
        for file in files_created:
            print(f"   📄 {file}")
        
        # Verification
        if 'beyza-donmez-@hotmail.com' in user_counts:
            beyza_count = user_counts['beyza-donmez-@hotmail.com']
            print(f"\\n🔍 VERIFICATION:")
            print(f"   beyza-donmez-@hotmail.com: {beyza_count:,} screenshots")
            print(f"   ✅ Data source: S3 Inventory ({metadata.get('inventory_file', 'Unknown')})")
        
        return True
    else:
        print("❌ No screenshots found in inventory!")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
