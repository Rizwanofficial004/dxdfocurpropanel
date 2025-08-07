"""
Quick S3 Inventory Reader - Get Real Screenshot Counts
This script connects to your S3 bucket and counts actual screenshots per employee
"""

import boto3
import os
from collections import defaultdict

def count_real_s3_screenshots():
    """Count actual screenshots in S3 by employee"""
    print("🔍 Counting Real Screenshots in S3...")
    print("=" * 50)
    
    try:
        # S3 client setup
        s3_client = boto3.client(
            's3',
            region_name='eu-north-1',  # Stockholm region as shown in your AWS console
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY')
        )
        
        bucket_name = 'ddsfocustime'
        prefix = 'screenshots/'
        
        print(f"📦 Bucket: {bucket_name}")
        print(f"📁 Prefix: {prefix}")
        print("📊 Counting objects...")
        
        # Count screenshots by employee
        employee_counts = defaultdict(int)
        continuation_token = None
        total_objects = 0
        
        while True:
            # List objects with pagination
            list_params = {
                'Bucket': bucket_name,
                'Prefix': prefix,
                'MaxKeys': 1000
            }
            
            if continuation_token:
                list_params['ContinuationToken'] = continuation_token
            
            response = s3_client.list_objects_v2(**list_params)
            
            if 'Contents' not in response:
                break
            
            # Process objects
            for obj in response['Contents']:
                key = obj['Key']
                # Extract employee email: screenshots/email@domain.com/folder/file.jpg
                parts = key.split('/')
                if len(parts) >= 2:
                    email = parts[1]
                    if '@' in email and '.' in email:  # Basic email validation
                        employee_counts[email] += 1
                        total_objects += 1
            
            # Check if there are more objects
            if not response.get('IsTruncated', False):
                break
            
            continuation_token = response.get('NextContinuationToken')
            print(f"   Processed {total_objects} objects so far...")
        
        print(f"\n✅ Counting Complete!")
        print(f"📊 Total screenshots: {total_objects:,}")
        print(f"👥 Employees found: {len(employee_counts)}")
        
        # Sort by count (descending)
        sorted_employees = sorted(employee_counts.items(), key=lambda x: x[1], reverse=True)
        
        print(f"\n📈 Top 10 Employees by Screenshot Count:")
        for i, (email, count) in enumerate(sorted_employees[:10], 1):
            print(f"   {i:2d}. {email}: {count:,} screenshots")
        
        # Check the specific user you asked about
        beyza_count = employee_counts.get('beyza-donmez-@hotmail.com', 0)
        print(f"\n🎯 Specific Check:")
        print(f"   beyza-donmez-@hotmail.com: {beyza_count} screenshots")
        
        return dict(employee_counts)
        
    except Exception as e:
        print(f"❌ Error counting S3 screenshots: {e}")
        print(f"💡 Make sure your AWS credentials are set:")
        print(f"   export AWS_ACCESS_KEY_ID=your_key")
        print(f"   export AWS_SECRET_ACCESS_KEY=your_secret")
        return None

if __name__ == "__main__":
    print("🚀 Starting S3 Screenshot Count...")
    counts = count_real_s3_screenshots()
    
    if counts:
        print(f"\n💾 Save this data to fix your database:")
        print(f"Real S3 counts obtained successfully!")
    else:
        print(f"\n❌ Failed to get S3 counts. Check AWS access.")
