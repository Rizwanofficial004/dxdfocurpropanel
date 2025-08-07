"""
Check Amir's Specific Folder Contents
"""

import boto3

def check_amir_folder():
    print("🔍 CHECKING AMIR'S FOLDER CONTENTS")
    print("=" * 50)
    
    s3_client = boto3.client(
        's3',
        region_name='eu-north-1',
        aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
        aws_secret_access_key='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'
    )
    
    bucket_name = "ddsfocustime"
    amir_prefix = "screenshots/amirishaque67_at_gmail.com/"
    
    print(f"📁 Checking folder: {amir_prefix}")
    
    try:
        # List all objects in Amir's folder
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=amir_prefix,
            MaxKeys=20  # Get first 20 files
        )
        
        if 'Contents' in response:
            total_files = response['KeyCount']
            print(f"✅ Found {total_files} files in Amir's folder:")
            
            image_files = 0
            other_files = 0
            
            for i, obj in enumerate(response['Contents'], 1):
                key = obj['Key']
                filename = key.split('/')[-1]
                size_kb = round(obj['Size'] / 1024, 2)
                modified = obj['LastModified'].strftime('%Y-%m-%d %H:%M:%S')
                
                # Check if it's an image file
                is_image = filename.lower().endswith(('.webp', '.jpg', '.jpeg', '.png', '.gif'))
                
                if is_image:
                    image_files += 1
                    print(f"  📸 {i}. {filename} ({size_kb} KB) - IMAGE")
                else:
                    other_files += 1
                    print(f"  📄 {i}. {filename} ({size_kb} KB) - OTHER")
            
            print(f"\n📊 Summary:")
            print(f"   📸 Image files: {image_files}")
            print(f"   📄 Other files: {other_files}")
            print(f"   📁 Total files: {total_files}")
            
            if image_files == 0:
                print("\n❌ NO IMAGE FILES FOUND!")
                print("   This explains why intervals returned 'no_data'")
            else:
                print(f"\n✅ Found {image_files} image files")
                print("   The issue might be with timestamp parsing")
        
        else:
            print("❌ No files found in Amir's folder")
            print("   Folder might be empty or path incorrect")
        
        # Check if we need to check more files
        if 'NextContinuationToken' in response:
            print(f"\n📋 Note: There are more files in this folder (showing first 20)")
        
    except Exception as e:
        print(f"❌ Error checking folder: {e}")

if __name__ == "__main__":
    check_amir_folder()
