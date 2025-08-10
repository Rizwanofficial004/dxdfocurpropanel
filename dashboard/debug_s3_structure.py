"""
Debug S3 File Structure - Check actual filename formats
"""

import boto3
from datetime import datetime
import re

def debug_s3_structure():
    print("🔍 DEBUGGING S3 FILE STRUCTURE")
    print("=" * 50)
    
    # AWS Configuration
    s3_client = boto3.client(
        's3',
        region_name='eu-north-1',
        aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
        aws_secret_access_key='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'
    )
    
    bucket_name = "ddsfocustime"
    
    try:
        print("📡 Connecting to S3...")
        
        # Check Beyza's folder structure
        beyza_prefix = "screenshots/beyza-donmez-_at_hotmail.com/"
        print(f"\n1️⃣ Checking Beyza's folder: {beyza_prefix}")
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=beyza_prefix,
            MaxKeys=10  # Just get first 10 files
        )
        
        if 'Contents' in response:
            print(f"✅ Found {len(response['Contents'])} files (showing first 10):")
            for i, obj in enumerate(response['Contents'], 1):
                filename = obj['Key'].split('/')[-1]
                size_kb = round(obj['Size'] / 1024, 2)
                modified = obj['LastModified'].strftime('%Y-%m-%d %H:%M:%S')
                print(f"  {i}. {filename} ({size_kb} KB, {modified})")
                
                # Test timestamp parsing
                timestamp = parse_filename_timestamp(filename)
                if timestamp:
                    print(f"     ✅ Parsed timestamp: {timestamp}")
                else:
                    print(f"     ❌ Could not parse timestamp")
        else:
            print("❌ No files found in Beyza's folder")
        
        # Check Amir's folder structure
        amir_prefix = "screenshots/amirishaque67-at-gmail.com/"
        print(f"\n2️⃣ Checking Amir's folder: {amir_prefix}")
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=amir_prefix,
            MaxKeys=10
        )
        
        if 'Contents' in response:
            print(f"✅ Found {len(response['Contents'])} files (showing first 10):")
            for i, obj in enumerate(response['Contents'], 1):
                filename = obj['Key'].split('/')[-1]
                size_kb = round(obj['Size'] / 1024, 2)
                modified = obj['LastModified'].strftime('%Y-%m-%d %H:%M:%S')
                print(f"  {i}. {filename} ({size_kb} KB, {modified})")
                
                # Test timestamp parsing
                timestamp = parse_filename_timestamp(filename)
                if timestamp:
                    print(f"     ✅ Parsed timestamp: {timestamp}")
                else:
                    print(f"     ❌ Could not parse timestamp")
        else:
            print("❌ No files found in Amir's folder")
        
        # Try alternative folder names
        print(f"\n3️⃣ Checking alternative folder structures...")
        
        # List all screenshot folders
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            Delimiter="/"
        )
        
        if 'CommonPrefixes' in response:
            print("📁 Available user folders:")
            for prefix in response['CommonPrefixes']:
                folder_name = prefix['Prefix'].replace('screenshots/', '').rstrip('/')
                if 'beyza' in folder_name.lower() or 'amir' in folder_name.lower():
                    print(f"  🎯 {folder_name}")
                else:
                    print(f"  - {folder_name}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def parse_filename_timestamp(filename):
    """Test different timestamp parsing patterns"""
    try:
        patterns = [
            # Pattern 1: 2025-07-01_23-31-37_2025-07-01_23-31-36.webp
            r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})',
            # Pattern 2: screenshot_2025-07-01_23-31-37.webp
            r'screenshot_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})',
            # Pattern 3: 20250701_233137.webp
            r'(\d{8})_(\d{6})',
            # Pattern 4: 2025-07-01T23:31:37.webp
            r'(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, filename)
            if match:
                if len(match.groups()) == 2:
                    date_str, time_str = match.groups()
                    
                    # Try different date/time formats
                    try:
                        if '-' in time_str:
                            # Format: 2025-07-01_23-31-37
                            datetime_str = f"{date_str} {time_str.replace('-', ':')}"
                            return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
                        elif ':' in time_str:
                            # Format: 2025-07-01T23:31:37
                            datetime_str = f"{date_str} {time_str}"
                            return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
                        elif len(time_str) == 6:
                            # Format: 20250701_233137
                            date_formatted = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
                            time_formatted = f"{time_str[:2]}:{time_str[2:4]}:{time_str[4:6]}"
                            datetime_str = f"{date_formatted} {time_formatted}"
                            return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
                    except ValueError:
                        continue
        
        return None
    except:
        return None

if __name__ == "__main__":
    debug_s3_structure()
