#!/usr/bin/env python3
"""
Test S3 Access and Presigned URL Generation
"""
import boto3
import os
import requests

def test_s3_access():
    """Test S3 access and presigned URL generation"""
    print("🔍 Testing S3 Access and Presigned URL Generation")
    print("=" * 60)
    
    # Set up S3 client
    s3_client = boto3.client(
        "s3",
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="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",
        region_name="eu-north-1"
    )
    
    bucket_name = "ddsfocustime"
    test_key = "screenshots/haseebcodejourney_at_gmail.com/Create_UI_for_YouTube_AI_Automation_/2025-06-16_14-07-58_2025-06-16_14-07-58.webp"
    
    # Test 1: Check if the object exists
    try:
        response = s3_client.head_object(Bucket=bucket_name, Key=test_key)
        print(f"✅ Object exists: {test_key}")
        print(f"   Size: {response.get('ContentLength', 'Unknown')} bytes")
        print(f"   Content-Type: {response.get('ContentType', 'Unknown')}")
        print(f"   Last Modified: {response.get('LastModified', 'Unknown')}")
    except Exception as e:
        print(f"❌ Object not found: {e}")
        return
    
    # Test 2: Generate presigned URL
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': test_key},
            ExpiresIn=3600
        )
        print(f"✅ Presigned URL generated successfully")
        print(f"   URL: {presigned_url}")
    except Exception as e:
        print(f"❌ Failed to generate presigned URL: {e}")
        return
    
    # Test 3: Test the presigned URL
    try:
        response = requests.head(presigned_url, timeout=10)
        print(f"✅ Presigned URL test: Status {response.status_code}")
        if response.status_code == 200:
            print(f"   Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
            print(f"   Content-Length: {response.headers.get('Content-Length', 'Unknown')}")
        else:
            print(f"   Error: {response.status_code} - {response.reason}")
    except Exception as e:
        print(f"❌ Presigned URL access failed: {e}")
    
    # Test 4: Try direct URL
    direct_url = f"https://{bucket_name}.s3.eu-north-1.amazonaws.com/{test_key}"
    print(f"\n🔍 Testing direct URL: {direct_url}")
    try:
        response = requests.head(direct_url, timeout=10)
        print(f"✅ Direct URL test: Status {response.status_code}")
        if response.status_code == 200:
            print(f"   Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
            print(f"   Content-Length: {response.headers.get('Content-Length', 'Unknown')}")
        else:
            print(f"   Error: {response.status_code} - {response.reason}")
    except Exception as e:
        print(f"❌ Direct URL access failed: {e}")
    
    # Test 5: List some objects to verify prefix
    print(f"\n🔍 Testing S3 listing with prefix")
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/haseebcodejourney_at_gmail.com/Create_UI_for_YouTube_AI_Automation_/",
            MaxKeys=5
        )
        
        if 'Contents' in response:
            print(f"✅ Found {len(response['Contents'])} objects")
            for obj in response['Contents'][:3]:
                print(f"   - {obj['Key']}")
        else:
            print("❌ No objects found with this prefix")
    except Exception as e:
        print(f"❌ S3 listing failed: {e}")

if __name__ == "__main__":
    test_s3_access()
