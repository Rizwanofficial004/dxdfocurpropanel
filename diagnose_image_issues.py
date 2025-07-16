#!/usr/bin/env python3
"""
Test script to diagnose image loading issues in Live Tracking
This script will help identify S3 configuration and URL generation issues
"""

import requests
import json
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
import os

def test_s3_connectivity():
    """Test basic S3 connectivity"""
    print("🔍 Testing S3 Connectivity")
    print("=" * 50)
    
    try:
        # Test S3 client creation
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
            region_name=os.getenv("AWS_S3_REGION_NAME", "us-east-1")
        )
        
        # Test bucket access
        bucket_name = "ddsfocustime"
        response = s3_client.head_bucket(Bucket=bucket_name)
        print(f"✅ S3 bucket '{bucket_name}' is accessible")
        
        # Test listing objects
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            MaxKeys=5
        )
        
        if 'Contents' in response:
            print(f"✅ Found {len(response['Contents'])} objects in screenshots/")
            for obj in response['Contents'][:3]:
                print(f"   📁 {obj['Key']}")
        else:
            print("⚠️ No objects found in screenshots/ directory")
            
        return True
        
    except ClientError as e:
        print(f"❌ S3 Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

def test_presigned_url_generation():
    """Test presigned URL generation"""
    print("\n🔗 Testing Presigned URL Generation")
    print("=" * 50)
    
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
            region_name=os.getenv("AWS_S3_REGION_NAME", "us-east-1")
        )
        
        bucket_name = "ddsfocustime"
        
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
        
        print(f"✅ Generated presigned URL (truncated): {presigned_url[:100]}...")
        
        # Test the presigned URL
        print("🌐 Testing presigned URL accessibility...")
        response = requests.head(presigned_url, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Presigned URL is accessible (Status: {response.status_code})")
            print(f"   Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
            print(f"   Content-Length: {response.headers.get('Content-Length', 'Unknown')} bytes")
            return True
        else:
            print(f"❌ Presigned URL returned status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing presigned URL: {e}")
        return False

def test_direct_s3_url():
    """Test direct S3 URL access"""
    print("\n🌐 Testing Direct S3 URL Access")
    print("=" * 50)
    
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
            region_name=os.getenv("AWS_S3_REGION_NAME", "us-east-1")
        )
        
        bucket_name = "ddsfocustime"
        
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
        
        # Generate direct S3 URL
        direct_url = f"https://{bucket_name}.s3.amazonaws.com/{test_key}"
        print(f"🌐 Direct URL: {direct_url}")
        
        # Test the direct URL
        response = requests.head(direct_url, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Direct S3 URL is accessible (Status: {response.status_code})")
            return True
        elif response.status_code == 403:
            print(f"❌ Direct S3 URL access denied (Status: {response.status_code})")
            print("   This means the bucket doesn't allow public read access")
            return False
        else:
            print(f"❌ Direct S3 URL returned status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing direct S3 URL: {e}")
        return False

def test_api_endpoint():
    """Test the live tracking API endpoint"""
    print("\n📡 Testing Live Tracking API")
    print("=" * 50)
    
    try:
        api_url = "http://127.0.0.1:8000/api/live-tracking/fast-screenshots/"
        params = {"limit": 5}
        
        print(f"🌐 Testing API: {api_url}")
        response = requests.get(api_url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                users = data.get('data', {}).get('users', [])
                print(f"✅ API call successful")
                print(f"   Users returned: {len(users)}")
                
                # Check first user with screenshot
                for user in users:
                    screenshot = user.get('latest_screenshot', {})
                    if screenshot.get('has_screenshot') and screenshot.get('url'):
                        print(f"\n📸 Testing screenshot URL for user: {user.get('email', 'Unknown')}")
                        screenshot_url = screenshot['url']
                        
                        # Test if it's a presigned URL
                        if 'X-Amz-Algorithm' in screenshot_url:
                            print("✅ URL appears to be a presigned URL")
                        else:
                            print("⚠️ URL appears to be a direct S3 URL")
                        
                        # Test URL accessibility
                        try:
                            img_response = requests.head(screenshot_url, timeout=10)
                            if img_response.status_code == 200:
                                print(f"✅ Screenshot URL is accessible (Status: {img_response.status_code})")
                            else:
                                print(f"❌ Screenshot URL returned status: {img_response.status_code}")
                        except Exception as e:
                            print(f"❌ Error accessing screenshot URL: {e}")
                        
                        break
                
                return True
            else:
                print(f"❌ API returned success=false: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ API returned status: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        return False

def main():
    """Run all diagnostic tests"""
    print("🔧 Live Tracking Image Diagnostics")
    print("=" * 70)
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Run tests
    tests = [
        ("S3 Connectivity", test_s3_connectivity),
        ("Presigned URL Generation", test_presigned_url_generation),
        ("Direct S3 URL Access", test_direct_s3_url),
        ("API Endpoint", test_api_endpoint)
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ Test '{test_name}' failed with exception: {e}")
            results[test_name] = False
        print()
    
    # Summary
    print("📋 DIAGNOSTIC SUMMARY")
    print("=" * 70)
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Image loading should work correctly.")
    else:
        print("\n🔧 RECOMMENDATIONS:")
        if not results.get("S3 Connectivity"):
            print("   1. Check AWS credentials and S3 bucket access")
        if not results.get("Direct S3 URL Access"):
            print("   2. Configure S3 bucket for public read access OR use presigned URLs")
        if not results.get("Presigned URL Generation"):
            print("   3. Ensure AWS SDK has proper permissions for generating presigned URLs")
        if not results.get("API Endpoint"):
            print("   4. Check if Django server is running and API is accessible")

if __name__ == "__main__":
    main()
