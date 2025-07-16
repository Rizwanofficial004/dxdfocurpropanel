#!/usr/bin/env python3
"""
Complete S3 CORS and Public Access Fix
"""
import boto3
import json

def complete_s3_fix():
    """Complete fix for S3 CORS and public access"""
    print("🔧 Complete S3 CORS and Public Access Fix")
    print("=" * 60)
    
    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="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",
        region_name="eu-north-1"
    )
    
    bucket_name = "ddsfocustime"
    
    # Step 1: CORS Configuration
    print("Step 1: Configuring CORS...")
    cors_configuration = {
        'CORSRules': [
            {
                'AllowedHeaders': ['*'],
                'AllowedMethods': ['GET', 'HEAD'],
                'AllowedOrigins': [
                    'http://localhost:3000',
                    'http://localhost:5173', 
                    'http://localhost:8000',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5173',
                    'http://127.0.0.1:8000',
                    'https://localhost:3000',
                    'https://localhost:5173',
                    'https://dxdtime.ddsolutions.io'
                ],
                'ExposeHeaders': ['ETag', 'Content-Type', 'Content-Length'],
                'MaxAgeSeconds': 3600
            }
        ]
    }
    
    try:
        s3_client.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_configuration
        )
        print("✅ CORS configuration applied successfully")
    except Exception as e:
        print(f"❌ CORS configuration failed: {e}")
    
    # Step 2: Check Public Access Block
    print("\nStep 2: Checking Public Access Block...")
    try:
        response = s3_client.get_public_access_block(Bucket=bucket_name)
        config = response['PublicAccessBlockConfiguration']
        print(f"Current Public Access Block:")
        print(f"  - BlockPublicAcls: {config.get('BlockPublicAcls', 'Unknown')}")
        print(f"  - IgnorePublicAcls: {config.get('IgnorePublicAcls', 'Unknown')}")
        print(f"  - BlockPublicPolicy: {config.get('BlockPublicPolicy', 'Unknown')}")
        print(f"  - RestrictPublicBuckets: {config.get('RestrictPublicBuckets', 'Unknown')}")
        
        # Check if we need to modify public access
        if config.get('BlockPublicPolicy', True) or config.get('RestrictPublicBuckets', True):
            print("⚠️  Public access is blocked - this prevents presigned URLs from working")
            print("💡 Recommendation: Configure bucket policy for specific access instead")
        else:
            print("✅ Public access settings allow presigned URLs")
            
    except Exception as e:
        print(f"❌ Could not check public access block: {e}")
    
    # Step 3: Create a bucket policy that allows presigned URL access
    print("\nStep 3: Creating bucket policy for presigned URL access...")
    
    # Policy that allows presigned URLs to work
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowPresignedURLAccess",
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": f"arn:aws:s3:::{bucket_name}/screenshots/*",
                "Condition": {
                    "StringEquals": {
                        "s3:signatureversion": "AWS4-HMAC-SHA256"
                    }
                }
            }
        ]
    }
    
    try:
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(bucket_policy)
        )
        print("✅ Bucket policy applied successfully")
        print("✅ Policy allows presigned URL access for screenshots folder")
    except Exception as e:
        print(f"❌ Bucket policy failed: {e}")
        print("💡 This might be due to public access block restrictions")
    
    # Step 4: Test presigned URL generation and access
    print("\nStep 4: Testing presigned URL after fixes...")
    test_key = "screenshots/haseebcodejourney_at_gmail.com/Create_UI_for_YouTube_AI_Automation_/2025-06-16_14-07-58_2025-06-16_14-07-58.webp"
    
    try:
        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': test_key},
            ExpiresIn=7200  # 2 hours
        )
        
        print(f"✅ Generated fresh presigned URL")
        print(f"URL: {presigned_url[:100]}...")
        
        # Test the presigned URL
        import requests
        response = requests.get(presigned_url, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Presigned URL test: SUCCESS ({response.status_code})")
            print(f"✅ Content-Type: {response.headers.get('Content-Type')}")
            print(f"✅ Content-Length: {response.headers.get('Content-Length')}")
            print(f"✅ CORS headers: {response.headers.get('Access-Control-Allow-Origin', 'None')}")
            print("🎉 SUCCESS: Images should now load in your frontend!")
            return True
        else:
            print(f"❌ Presigned URL test: FAILED ({response.status_code})")
            print(f"❌ Error: {response.reason}")
            return False
            
    except Exception as e:
        print(f"❌ Presigned URL test failed: {e}")
        return False

def alternative_solution():
    """Alternative solution: Use backend proxy for images"""
    print("\n" + "=" * 60)
    print("🔄 Alternative Solution: Backend Image Proxy")
    print("=" * 60)
    
    print("If S3 bucket policy changes are restricted, you can:")
    print("1. Create a backend endpoint that proxies images")
    print("2. Use this endpoint instead of direct S3 URLs")
    print("3. This bypasses CORS issues entirely")
    
    print("\nBackend proxy endpoint code:")
    print("""
from django.http import HttpResponse
import boto3
import requests

@csrf_exempt
def proxy_image(request, s3_key):
    try:
        # Get S3 client
        s3_client = get_s3_client()
        
        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': 'ddsfocustime', 'Key': s3_key},
            ExpiresIn=3600
        )
        
        # Fetch image from S3
        response = requests.get(presigned_url)
        
        if response.status_code == 200:
            # Return image with proper headers
            http_response = HttpResponse(
                response.content,
                content_type=response.headers.get('content-type', 'image/webp')
            )
            # Add CORS headers
            http_response['Access-Control-Allow-Origin'] = '*'
            http_response['Access-Control-Allow-Methods'] = 'GET'
            http_response['Access-Control-Allow-Headers'] = '*'
            return http_response
        else:
            return HttpResponse('Image not found', status=404)
            
    except Exception as e:
        return HttpResponse(f'Error: {str(e)}', status=500)
""")
    
    print("\nThen in your frontend, use:")
    print("const imageUrl = `https://dxdtime.ddsolutions.io/api/proxy-image/${encodeURIComponent(s3_key)}`")

if __name__ == "__main__":
    success = complete_s3_fix()
    if not success:
        alternative_solution()
