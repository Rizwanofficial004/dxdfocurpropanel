#!/usr/bin/env python3
"""
Detect S3 bucket region and fix configuration
"""
import boto3
from botocore.exceptions import ClientError
import os

def detect_bucket_region():
    """Detect the actual region of the S3 bucket"""
    bucket_name = "ddsfocustime"
    
    print("🔍 Detecting S3 bucket region...")
    
    # Try with different regions to find the correct one
    regions_to_try = ["us-east-1", "eu-north-1", "us-west-2", "eu-west-1", "ap-southeast-1"]
    
    for region in regions_to_try:
        try:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
                region_name=region
            )
            
            # Try to get bucket location
            response = s3_client.get_bucket_location(Bucket=bucket_name)
            actual_region = response.get('LocationConstraint')
            
            # us-east-1 returns None for LocationConstraint
            if actual_region is None:
                actual_region = "us-east-1"
                
            print(f"✅ Bucket '{bucket_name}' is located in region: {actual_region}")
            return actual_region
            
        except ClientError as e:
            if "NoSuchBucket" in str(e):
                print(f"❌ Bucket '{bucket_name}' not found")
                return None
            elif "AccessDenied" in str(e):
                print(f"❌ Access denied to bucket '{bucket_name}'")
                return None
            else:
                print(f"   Trying region {region}... {e}")
                continue
        except Exception as e:
            print(f"   Error with region {region}: {e}")
            continue
    
    print(f"❌ Could not determine region for bucket '{bucket_name}'")
    return None

def test_presigned_url_with_region(region):
    """Test presigned URL generation with specific region"""
    bucket_name = "ddsfocustime"
    
    print(f"\n🔗 Testing presigned URL with region: {region}")
    
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
            region_name=region
        )
        
        # Find a test image
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            MaxKeys=10
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
            
        print(f"📸 Testing with image: {test_key}")
        
        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': test_key},
            ExpiresIn=3600
        )
        
        print(f"✅ Generated presigned URL")
        print(f"   URL region: {region}")
        print(f"   URL (truncated): {presigned_url[:80]}...")
        
        # Test the presigned URL
        import requests
        print("🌐 Testing presigned URL accessibility...")
        response = requests.head(presigned_url, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Presigned URL is accessible (Status: {response.status_code})")
            return True
        else:
            print(f"❌ Presigned URL returned status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing presigned URL: {e}")
        return False

def main():
    print("🔧 S3 Region Detection and URL Fix")
    print("=" * 50)
    
    # Detect actual bucket region
    actual_region = detect_bucket_region()
    
    if actual_region:
        # Test presigned URL with correct region
        success = test_presigned_url_with_region(actual_region)
        
        if success:
            print(f"\n✅ SUCCESS! Use region '{actual_region}' in your configuration")
            print("\n🔧 Update your aws_utils.py:")
            print(f'   region_name=os.getenv("AWS_S3_REGION_NAME", "{actual_region}")')
        else:
            print(f"\n❌ Presigned URLs still not working with region '{actual_region}'")
    else:
        print("\n❌ Could not detect bucket region")

if __name__ == "__main__":
    main()
