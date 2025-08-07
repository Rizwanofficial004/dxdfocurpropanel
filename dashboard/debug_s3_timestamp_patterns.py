"""
Debug S3 Files - Check Actual Filename Patterns for Timestamp Parsing
"""

import boto3
import re
from datetime import datetime

def debug_s3_filenames():
    print("🔍 DEBUGGING S3 FILE PATTERNS FOR TIMESTAMP PARSING")
    print("=" * 70)
    
    # AWS Configuration
    aws_access_key_id = 'AKIARSU6EUUWMQ5I2JWC'
    aws_secret_access_key = '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'
    bucket_name = 'ddsfocustime'
    region_name = 'eu-north-1'
    
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=region_name
        )
        
        print("✅ S3 client initialized successfully")
        print(f"📦 Bucket: {bucket_name}")
        print(f"🌍 Region: {region_name}")
        print()
        
        # Test users we know exist
        test_users = [
            {
                'email': 'amirishaque67@gmail.com',
                'folder': 'amirishaque67_at_gmail_com'
            },
            {
                'email': 'haseebcodejourney@gmail.com', 
                'folder': 'haseebcodejourney_at_gmail_com'
            },
            {
                'email': 'tugbacalik84@gmail.com',
                'folder': 'tugbacalik84_at_gmail_com'
            }
        ]
        
        for i, user in enumerate(test_users, 1):
            email = user['email']
            folder = user['folder']
            prefix = f"screenshots/{folder}/"
            
            print(f"{i}️⃣ TESTING USER: {email}")
            print(f"   📁 S3 Prefix: {prefix}")
            
            try:
                # List objects in the user's folder
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=prefix,
                    MaxKeys=20  # Get first 20 files
                )
                
                if 'Contents' in response:
                    files = response['Contents']
                    print(f"   📊 Found {len(files)} files (showing first 20)")
                    print()
                    
                    # Analyze filename patterns
                    timestamp_patterns = []
                    valid_timestamps = 0
                    
                    for j, obj in enumerate(files[:10], 1):  # Show first 10
                        key = obj['Key']
                        filename = key.split('/')[-1]  # Get just the filename
                        
                        print(f"      {j:2d}. {filename}")
                        
                        # Try different timestamp parsing patterns
                        patterns = [
                            r'(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})',  # 2025-01-16_14-59-32
                            r'(\d{4}\d{2}\d{2}_\d{2}\d{2}\d{2})',      # 20250116_145932
                            r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})', # 2025-01-16T14:59:32
                            r'(\d{13})',                               # Unix timestamp
                            r'(\d{10})',                               # Unix timestamp (seconds)
                        ]
                        
                        found_pattern = False
                        for pattern in patterns:
                            match = re.search(pattern, filename)
                            if match:
                                timestamp_str = match.group(1)
                                print(f"          ✅ Pattern found: {timestamp_str}")
                                timestamp_patterns.append(timestamp_str)
                                valid_timestamps += 1
                                found_pattern = True
                                break
                        
                        if not found_pattern:
                            print(f"          ❌ No timestamp pattern found")
                    
                    print(f"\n   📈 ANALYSIS FOR {email}:")
                    print(f"      • Total files checked: {len(files[:10])}")
                    print(f"      • Valid timestamps found: {valid_timestamps}")
                    print(f"      • Success rate: {(valid_timestamps/len(files[:10])*100):.1f}%")
                    
                    if timestamp_patterns:
                        print(f"      • First timestamp: {timestamp_patterns[0]}")
                        print(f"      • Last timestamp: {timestamp_patterns[-1]}")
                        
                        # Test parsing the first timestamp
                        try:
                            timestamp_str = timestamp_patterns[0]
                            
                            # Try to parse as our expected format
                            if '_' in timestamp_str and '-' in timestamp_str:
                                dt = datetime.strptime(timestamp_str, '%Y-%m-%d_%H-%M-%S')
                                print(f"      ✅ Successfully parsed: {dt}")
                            else:
                                print(f"      ❌ Format doesn't match expected pattern")
                                
                        except Exception as parse_error:
                            print(f"      ❌ Parse error: {parse_error}")
                    
                else:
                    print(f"   ❌ No files found in folder {prefix}")
                    
            except Exception as folder_error:
                print(f"   ❌ Error accessing folder: {folder_error}")
            
            print("-" * 50)
            print()
        
        print("🎯 TIMESTAMP PARSING RECOMMENDATIONS:")
        print("1. Check if files use expected format: YYYY-MM-DD_HH-MM-SS")
        print("2. Update parse_filename_timestamp() function if needed")
        print("3. Test with different timestamp patterns if current ones fail")
        
    except Exception as e:
        print(f"❌ Error connecting to S3: {e}")

if __name__ == "__main__":
    debug_s3_filenames()
