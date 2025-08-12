#!/usr/bin/env python3
"""
Debug S3 folder structure for specific user
"""
import os
import boto3
from dotenv import load_dotenv

load_dotenv()

def debug_user_folder():
    """Debug the folder structure for a specific user"""
    
    # AWS Configuration
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
        region_name=os.getenv("AWS_S3_REGION_NAME", "eu-north-1")
    )
    
    bucket_name = "ddsfocustime"
    test_user = "amirishaque67_at_gmail.com"
    
    print(f"🔍 Debugging folder structure for: {test_user}")
    print("=" * 60)
    
    # List all objects for this user
    prefix = f"screenshots/{test_user}/"
    
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix
        )
        
        if 'Contents' in response:
            objects = response['Contents']
            print(f"📂 Found {len(objects)} total objects")
            
            # Show all objects
            for i, obj in enumerate(objects, 1):
                key = obj['Key']
                size = obj['Size']
                modified = obj['LastModified']
                
                print(f"{i:2d}. {key}")
                print(f"    Size: {size} bytes")
                print(f"    Modified: {modified}")
                print(f"    Is image: {key.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))}")
                print()
            
            # Filter for images
            image_objects = [
                obj for obj in objects 
                if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
                and obj['Key'] != prefix  # Exclude folder itself
            ]
            
            print(f"📸 Image files found: {len(image_objects)}")
            
            if image_objects:
                print(f"\n🖼️ Sample image files:")
                for i, obj in enumerate(image_objects[:5], 1):
                    print(f"   {i}. {obj['Key']}")
                    
            # Show folder structure
            folders = set()
            for obj in objects:
                key_parts = obj['Key'].split('/')
                if len(key_parts) > 2:  # screenshots/user/folder/file
                    folder = key_parts[2]
                    folders.add(folder)
            
            print(f"\n📁 Subfolders found: {len(folders)}")
            for folder in sorted(folders):
                print(f"   - {folder}")
                
        else:
            print(f"❌ No objects found for prefix: {prefix}")
            
    except Exception as e:
        print(f"💥 Error: {e}")

if __name__ == "__main__":
    debug_user_folder()
