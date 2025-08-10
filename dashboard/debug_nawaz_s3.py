import boto3
from datetime import datetime
import os

def debug_nawaz_s3_folders():
    """Debug S3 folders for nawaz@dxdglobal.com"""
    
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            region_name='eu-north-1',
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY')
        )
        
        bucket_name = 'ddsfocustime'
        email_prefix = 'nawaz_at_dxdglobal.com'
        prefix = f'screenshots/{email_prefix}/'
        
        print(f"🔍 Checking S3 bucket: {bucket_name}")
        print(f"📁 Prefix: {prefix}")
        
        # List folders
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix,
            Delimiter='/',
            MaxKeys=1000
        )
        
        print(f"📊 S3 Response Summary:")
        print(f"   CommonPrefixes: {len(response.get('CommonPrefixes', []))}")
        print(f"   Contents: {len(response.get('Contents', []))}")
        
        if 'CommonPrefixes' in response:
            print(f"📁 Found {len(response['CommonPrefixes'])} folders:")
            for i, prefix_info in enumerate(response['CommonPrefixes'], 1):
                folder_path = prefix_info['Prefix']
                folder_name = folder_path.replace(prefix, '').rstrip('/')
                print(f"   {i}. {folder_name}")
                
                # Count files in this folder
                folder_response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=folder_path,
                    MaxKeys=1000
                )
                
                screenshot_count = len([obj for obj in folder_response.get('Contents', []) 
                                     if not obj['Key'].endswith('/')])
                print(f"      Screenshots: {screenshot_count}")
        
        if 'Contents' in response:
            print(f"📄 Direct files in root:")
            for obj in response['Contents']:
                if not obj['Key'].endswith('/'):
                    print(f"   - {obj['Key']}")
        
        # Also check what the Level 2 API prefix looks like
        print(f"\n🔍 Level 2 API would use prefix: screenshots/{email_prefix}/")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🔍 Debugging nawaz S3 folder structure")
    debug_nawaz_s3_folders()
