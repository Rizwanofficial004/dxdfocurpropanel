#!/usr/bin/env python3
"""
Test different approaches to fix S3 image access
"""

import boto3
import requests
from botocore.exceptions import ClientError
import os
from urllib.parse import quote

def test_different_url_formats():
    """Test different URL formats for S3 access"""
    bucket_name = "ddsfocustime"
    region = "eu-north-1"
    
    print("🔍 Testing Different S3 URL Formats")
    print("=" * 50)
    
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
            return
            
        print(f"📸 Testing with image: {test_key}")
        
        # Test different URL formats
        url_formats = [
            f"https://{bucket_name}.s3.{region}.amazonaws.com/{test_key}",
            f"https://{bucket_name}.s3.amazonaws.com/{test_key}",
            f"https://s3.{region}.amazonaws.com/{bucket_name}/{test_key}",
            f"https://s3.amazonaws.com/{bucket_name}/{test_key}",
        ]
        
        for i, url in enumerate(url_formats, 1):
            print(f"\n{i}. Testing: {url}")
            try:
                response = requests.head(url, timeout=10)
                if response.status_code == 200:
                    print(f"   ✅ SUCCESS (Status: {response.status_code})")
                    return url
                else:
                    print(f"   ❌ Failed (Status: {response.status_code})")
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        # Test URL encoding
        print(f"\n5. Testing URL encoding...")
        encoded_key = quote(test_key, safe='/')
        encoded_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{encoded_key}"
        print(f"   URL: {encoded_url}")
        
        try:
            response = requests.head(encoded_url, timeout=10)
            if response.status_code == 200:
                print(f"   ✅ SUCCESS with encoding (Status: {response.status_code})")
                return encoded_url
            else:
                print(f"   ❌ Failed with encoding (Status: {response.status_code})")
        except Exception as e:
            print(f"   ❌ Error with encoding: {e}")
        
        return None
        
    except Exception as e:
        print(f"❌ Error testing URL formats: {e}")
        return None

def create_simple_proxy_endpoint():
    """Create a simple proxy endpoint suggestion"""
    print("\n🔄 Alternative Solution: Proxy Endpoint")
    print("=" * 50)
    
    proxy_code = '''
# Add this to your Django views.py
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import boto3
import os

@csrf_exempt
def screenshot_proxy(request, screenshot_path):
    """Proxy endpoint to serve S3 images through Django"""
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
            region_name="eu-north-1"
        )
        
        # Get object from S3
        response = s3_client.get_object(Bucket="ddsfocustime", Key=f"screenshots/{screenshot_path}")
        
        # Return image data
        content_type = response.get('ContentType', 'image/webp')
        return HttpResponse(response['Body'].read(), content_type=content_type)
        
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=404)

# Add this to your urls.py:
# path('proxy/screenshot/<path:screenshot_path>', views.screenshot_proxy, name='screenshot_proxy'),
'''
    
    print("📝 You can create a Django proxy endpoint:")
    print(proxy_code)
    
    print("\n📋 Then update your API to use proxy URLs:")
    print("   Instead of: https://bucket.s3.region.amazonaws.com/key")
    print("   Use: http://127.0.0.1:8000/proxy/screenshot/user/folder/image.webp")

def main():
    print("🔧 S3 Image Access Troubleshooting")
    print("=" * 60)
    
    # Test different URL formats
    working_url = test_different_url_formats()
    
    if working_url:
        print(f"\n🎉 Found working URL format!")
        print(f"   Use this format: {working_url}")
        print("\n🔧 Update your code to use this URL format.")
    else:
        print("\n❌ No direct URL formats worked.")
        create_simple_proxy_endpoint()
        
        print("\n🔧 Quick Fix Options:")
        print("   1. Use the Django proxy endpoint (recommended)")
        print("   2. Contact AWS admin to configure bucket public access")
        print("   3. Use a different image hosting solution")

if __name__ == "__main__":
    main()
