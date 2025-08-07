"""
Test S3 Inventory Access
Simple script to test if we can access your S3 inventory files
"""

import boto3
import csv
import io
from collections import defaultdict

# S3 Setup with your credentials
s3_client = boto3.client(
    's3',
    aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
    aws_secret_access_key="sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS",
    region_name="eu-north-1"
)

bucket_name = 'ddsfocustime'
inventory_prefix = 'screenshot-inventory/ddsfocustime/'

def test_inventory_access():
    """Test accessing S3 inventory files"""
    print("🔍 Testing S3 Inventory Access")
    print("=" * 50)
    
    try:
        # First, check the bucket root structure
        print(f"📦 Scanning bucket root: {bucket_name}")
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            MaxKeys=50
        )
        
        if 'Contents' not in response:
            print("❌ No objects found in bucket")
            return False
        
        print(f"📄 Found {len(response['Contents'])} objects in bucket root:")
        inventory_folders = []
        
        for obj in response['Contents']:
            key = obj['Key']
            size = obj['Size']
            print(f"   📄 {key} ({size:,} bytes)")
            
            # Look for inventory-related folders
            if 'inventory' in key.lower() or 'screenshot-inventory' in key:
                inventory_folders.append(key)
        
        print(f"\n🔍 Looking for inventory folders...")
        
        # Check different possible inventory paths
        possible_prefixes = [
            'screenshot-inventory/',
            'inventory/',
            'ddsfocustime-inventory/',
            'screenshot-inventory/ddsfocustime/',
            'inventory/ddsfocustime/'
        ]
        
        for prefix in possible_prefixes:
            print(f"� Checking prefix: {prefix}")
            
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=prefix,
                MaxKeys=20
            )
            
            if 'Contents' in response and len(response['Contents']) > 0:
                print(f"   ✅ Found {len(response['Contents'])} objects in {prefix}")
                
                csv_files = []
                for obj in response['Contents']:
                    key = obj['Key']
                    size = obj['Size']
                    modified = obj['LastModified']
                    print(f"      📄 {key} ({size:,} bytes) - {modified}")
                    
                    if key.endswith('.csv'):
                        csv_files.append({
                            'key': key,
                            'last_modified': modified,
                            'size': size
                        })
                
                if csv_files:
                    print(f"\n� Found {len(csv_files)} CSV files in {prefix}")
                    
                    # Try the latest CSV file
                    latest_file = sorted(csv_files, key=lambda x: x['last_modified'], reverse=True)[0]
                    print(f"📄 Testing latest CSV: {latest_file['key']}")
                    
                    return test_csv_file(latest_file['key'])
            else:
                print(f"   ❌ No objects found in {prefix}")
        
        # If no inventory files found, fall back to direct S3 scanning
        print(f"\n📊 No inventory files found, falling back to direct S3 scan...")
        return test_direct_s3_scan()
        
    except Exception as e:
        print(f"❌ Error accessing S3: {e}")
        return False

def test_csv_file(csv_key):
    """Test reading a specific CSV file"""
    try:
        print(f"\n📊 Reading CSV file: {csv_key}")
        
        obj = s3_client.get_object(Bucket=bucket_name, Key=csv_key)
        body = obj['Body'].read().decode('utf-8')
        
        # Read first 10 lines to see format
        lines = body.split('\n')[:10]
        print(f"📋 First 10 lines of CSV:")
        for i, line in enumerate(lines, 1):
            if line.strip():
                print(f"   {i:2d}: {line}")
        
        # Count screenshots by user
        print(f"\n🔢 Counting screenshots by user...")
        employee_counts = defaultdict(int)
        total_screenshots = 0
        
        csv_reader = csv.reader(io.StringIO(body))
        
        for row in csv_reader:
            if len(row) < 2:
                continue
                
            # Try both column 0 and column 1 for the key
            for col_idx in [0, 1]:
                if col_idx < len(row):
                    object_key = row[col_idx]
                    
                    if object_key.startswith('screenshots/'):
                        parts = object_key.split('/')
                        if len(parts) >= 2:
                            email = parts[1]
                            if '@' in email:
                                employee_counts[email] += 1
                                total_screenshots += 1
                        break
        
        print(f"\n✅ CSV Analysis Complete!")
        print(f"📊 Total screenshots: {total_screenshots:,}")
        print(f"👥 Employees found: {len(employee_counts)}")
        
        if len(employee_counts) > 0:
            # Show top 10 users
            print(f"\n📈 Top 10 users by screenshot count:")
            sorted_users = sorted(employee_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            for email, count in sorted_users:
                print(f"   {email}: {count:,} screenshots")
                if email == 'beyza-donmez-@hotmail.com':
                    print(f"   🎯 FOUND BEYZA: {count} screenshots! ✅")
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")
        return False

def test_direct_s3_scan():
    """Test direct S3 scanning as fallback"""
    try:
        print(f"\n📊 Direct S3 Scan (first 100 screenshots)")
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='screenshots/',
            MaxKeys=100
        )
        
        if 'Contents' not in response:
            print("❌ No screenshots found in S3")
            return False
        
        employee_counts = defaultdict(int)
        
        for obj in response['Contents']:
            key = obj['Key']
            parts = key.split('/')
            if len(parts) >= 2:
                email = parts[1]
                if '@' in email:
                    employee_counts[email] += 1
        
        print(f"📊 Found screenshots for {len(employee_counts)} employees (sample):")
        for email, count in list(employee_counts.items())[:10]:
            print(f"   {email}: {count} screenshots")
            if email == 'beyza-donmez-@hotmail.com':
                print(f"   🎯 FOUND BEYZA: {count} screenshots! ✅")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in direct S3 scan: {e}")
        return False

if __name__ == "__main__":
    print("🚀 S3 Inventory Test")
    print("=" * 60)
    
    success = test_inventory_access()
    
    if success:
        print(f"\n✅ S3 Inventory access successful!")
        print(f"💡 You can now use the FastAPI server or Django script")
    else:
        print(f"\n❌ S3 Inventory access failed")
        print(f"💡 Check AWS credentials and inventory configuration")
