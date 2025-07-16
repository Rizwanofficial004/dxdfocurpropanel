#!/usr/bin/env python3
"""
Configure S3 bucket for public read access to screenshots
This will allow direct URLs to work without authentication
"""

import boto3
import json
from botocore.exceptions import ClientError
import os

def configure_bucket_policy():
    """Configure bucket policy for public read access to screenshots"""
    bucket_name = "ddsfocustime"
    
    print("🔓 Configuring S3 bucket for public read access...")
    print("=" * 60)
    
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
            region_name="eu-north-1"
        )
        
        # Bucket policy for public read access to screenshots
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{bucket_name}/screenshots/*"
                }
            ]
        }
        
        # Convert policy to JSON string
        policy_json = json.dumps(bucket_policy)
        
        print(f"📝 Setting bucket policy for: {bucket_name}")
        print(f"   Allowing public read access to: screenshots/*")
        
        # Apply the bucket policy
        s3_client.put_bucket_policy(Bucket=bucket_name, Policy=policy_json)
        
        print("✅ Bucket policy applied successfully!")
        
        # Configure CORS as well
        configure_cors(s3_client, bucket_name)
        
        return True
        
    except ClientError as e:
        print(f"❌ Error configuring bucket policy: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def configure_cors(s3_client, bucket_name):
    """Configure CORS for the bucket"""
    print("\n🌐 Configuring CORS settings...")
    
    try:
        cors_configuration = {
            'CORSRules': [
                {
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['GET', 'HEAD'],
                    'AllowedOrigins': ['*'],
                    'ExposeHeaders': ['ETag'],
                    'MaxAgeSeconds': 3000
                }
            ]
        }
        
        s3_client.put_bucket_cors(Bucket=bucket_name, CORSConfiguration=cors_configuration)
        print("✅ CORS configuration applied successfully!")
        
    except ClientError as e:
        print(f"❌ Error configuring CORS: {e}")
    except Exception as e:
        print(f"❌ Unexpected CORS error: {e}")

def test_public_access():
    """Test if public access is working"""
    bucket_name = "ddsfocustime"
    
    print("\n🧪 Testing public access...")
    
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
            region_name="eu-north-1"
        )
        
        # Find a test image
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            MaxKeys=5
        )
        
        test_key = None
        if 'Contents' in response:
            for obj in response['Contents']:
                if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    test_key = obj['Key']
                    break
        
        if not test_key:
            print("⚠️ No image files found for testing")
            return False
            
        # Test direct URL with correct region
        direct_url = f"https://{bucket_name}.s3.eu-north-1.amazonaws.com/{test_key}"
        print(f"🌐 Testing URL: {direct_url}")
        
        import requests
        response = requests.head(direct_url, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Public access is working! (Status: {response.status_code})")
            print(f"   Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
            return True
        else:
            print(f"❌ Public access failed (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Error testing public access: {e}")
        return False

def main():
    print("🔧 S3 Public Access Configuration")
    print("=" * 60)
    
    # Configure bucket policy
    policy_success = configure_bucket_policy()
    
    if policy_success:
        print("\n⏳ Waiting a moment for changes to propagate...")
        import time
        time.sleep(5)
        
        # Test public access
        test_success = test_public_access()
        
        if test_success:
            print("\n🎉 SUCCESS! Your S3 bucket is now configured for public read access.")
            print("\n📋 What this means:")
            print("   ✅ Direct S3 URLs will now work in browsers")
            print("   ✅ No authentication required for screenshot access")
            print("   ✅ CORS is configured for web applications")
            print("\n🔄 Test your live tracking dashboard now!")
        else:
            print("\n⚠️ Configuration applied but public access test failed.")
            print("   It may take a few minutes for changes to propagate.")
            print("   Try testing again in 5-10 minutes.")
    else:
        print("\n❌ Failed to configure bucket policy.")
        print("   Check your AWS permissions and try again.")

if __name__ == "__main__":
    main()
