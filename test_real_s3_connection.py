#!/usr/bin/env python3
"""
Test Real S3 Connection - Verify AWS credentials and bucket access
"""
import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_s3_connection():
    """Test the real S3 connection with your credentials"""
    print("🔍 Testing Real S3 Connection")
    print("=" * 50)
    
    # AWS Configuration
    aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC")
    aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "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")
    aws_region = os.getenv("AWS_S3_REGION_NAME", "eu-north-1")
    bucket_name = os.getenv("AWS_STORAGE_BUCKET_NAME", "ddsfocustime")
    
    print(f"🔧 Configuration:")
    print(f"   Region: {aws_region}")
    print(f"   Bucket: {bucket_name}")
    print(f"   Access Key: {aws_access_key_id[:10]}...")
    print(f"   Secret Key: {'*' * 20}")
    
    try:
        # Create S3 client
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region
        )
        
        print(f"\n✅ S3 client created successfully")
        
        # Test 1: List buckets
        print(f"\n📋 Test 1: Listing buckets...")
        try:
            response = s3_client.list_buckets()
            buckets = [bucket['Name'] for bucket in response['Buckets']]
            print(f"   Found {len(buckets)} buckets:")
            for bucket in buckets:
                print(f"     - {bucket}")
                
            if bucket_name in buckets:
                print(f"   ✅ Target bucket '{bucket_name}' found!")
            else:
                print(f"   ⚠️ Target bucket '{bucket_name}' not found in list")
                
        except Exception as e:
            print(f"   ❌ Error listing buckets: {e}")
            return False
        
        # Test 2: Access specific bucket
        print(f"\n📋 Test 2: Accessing bucket '{bucket_name}'...")
        try:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix="screenshots/",
                MaxKeys=10
            )
            
            if 'Contents' in response:
                objects = response['Contents']
                print(f"   ✅ Found {len(objects)} objects (showing first 10)")
                
                # Show first few objects
                for i, obj in enumerate(objects[:5], 1):
                    print(f"     {i}. {obj['Key']} ({obj['Size']} bytes)")
                    
                # Look for user folders
                user_folders = set()
                for obj in objects:
                    key_parts = obj['Key'].split('/')
                    if len(key_parts) >= 2 and key_parts[0] == 'screenshots':
                        user_folders.add(key_parts[1])
                
                print(f"   👥 Found {len(user_folders)} user folders:")
                for i, folder in enumerate(sorted(list(user_folders))[:10], 1):
                    print(f"     {i}. {folder}")
                    
                if len(user_folders) > 10:
                    print(f"     ... and {len(user_folders) - 10} more")
                    
            else:
                print(f"   ⚠️ No objects found in screenshots/ folder")
                
        except Exception as e:
            print(f"   ❌ Error accessing bucket: {e}")
            return False
        
        # Test 3: Check specific user folder
        print(f"\n📋 Test 3: Checking for specific users...")
        test_users = ["haseeb.nawaz@deluxebilisim.com", "admin@deluxebilisim.com", "test@deluxebilisim.com"]
        
        for user_email in test_users:
            try:
                prefix = f"screenshots/{user_email}/"
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=prefix,
                    MaxKeys=5
                )
                
                if 'Contents' in response:
                    count = len(response['Contents'])
                    print(f"   ✅ {user_email}: {count} objects found")
                else:
                    print(f"   ⚪ {user_email}: No objects found")
                    
            except Exception as e:
                print(f"   ❌ {user_email}: Error - {e}")
        
        print(f"\n🎉 S3 Connection Test Complete!")
        print(f"✅ Your S3 credentials are working correctly")
        print(f"✅ Bucket access is functional")
        print(f"✅ Ready to use real data in API")
        
        return True
        
    except NoCredentialsError:
        print(f"❌ AWS credentials not found or invalid")
        return False
    except ClientError as e:
        print(f"❌ AWS client error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_s3_connection()
    
    if success:
        print(f"\n🚀 Next: Your All Screenshots API is ready to use real S3 data!")
        print(f"   Test it with: python test_all_screenshots_api.py")
    else:
        print(f"\n🔧 Please check your AWS credentials and try again")
