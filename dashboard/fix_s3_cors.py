#!/usr/bin/env python3
"""
Fix S3 CORS Configuration for Frontend Image Access
"""
import boto3
import json

def fix_s3_cors():
    """Configure S3 bucket CORS to allow frontend access"""
    print("🔧 Fixing S3 CORS Configuration")
    print("=" * 60)
    
    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS",
        region_name="eu-north-1"
    )
    
    bucket_name = "ddsfocustime"
    
    # CORS configuration for your frontend
    cors_configuration = {
        'CORSRules': [
            {
                'AllowedHeaders': ['*'],
                'AllowedMethods': ['GET', 'HEAD'],
                'AllowedOrigins': [
                    'http://localhost:3000',  # React dev server
                    'http://localhost:5173',  # Vite dev server
                    'http://localhost:8000',  # Django backend
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5173',
                    'http://127.0.0.1:8000',
                    'https://dxdtime.ddsolutions.io'  # Production domain
                ],
                'ExposeHeaders': ['ETag'],
                'MaxAgeSeconds': 3600
            }
        ]
    }
    
    try:
        # Apply CORS configuration
        s3_client.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_configuration
        )
        print(f"✅ CORS configuration applied to bucket: {bucket_name}")
        print("✅ Allowed origins: localhost:3000, localhost:5173, localhost:8000")
        print("✅ Allowed methods: GET, HEAD")
        print("✅ Allowed headers: *")
        
        # Verify the configuration
        response = s3_client.get_bucket_cors(Bucket=bucket_name)
        print(f"\n🔍 Current CORS rules:")
        for i, rule in enumerate(response['CORSRules']):
            print(f"  Rule {i+1}:")
            print(f"    - Origins: {rule['AllowedOrigins']}")
            print(f"    - Methods: {rule['AllowedMethods']}")
            print(f"    - Headers: {rule['AllowedHeaders']}")
            print(f"    - Max Age: {rule['MaxAgeSeconds']} seconds")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to configure CORS: {e}")
        return False

def test_cors_after_fix():
    """Test CORS configuration after applying fix"""
    print(f"\n🧪 Testing CORS after fix...")
    import requests
    
    # Test a presigned URL
    s3_client = boto3.client(
        "s3",
        aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
        aws_secret_access_key="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",
        region_name="eu-north-1"
    )
    
    bucket_name = "ddsfocustime"
    test_key = "screenshots/haseebcodejourney_at_gmail.com/Create_UI_for_YouTube_AI_Automation_/2025-06-16_14-07-58_2025-06-16_14-07-58.webp"
    
    try:
        # Generate a fresh presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': test_key},
            ExpiresIn=7200
        )
        
        print(f"✅ Generated fresh presigned URL")
        
        # Test the URL
        response = requests.get(presigned_url, timeout=10)
        print(f"✅ CORS test result: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Content-Type: {response.headers.get('Content-Type')}")
            print(f"✅ Content-Length: {response.headers.get('Content-Length')}")
            print(f"✅ CORS headers: {response.headers.get('Access-Control-Allow-Origin', 'None')}")
            print("✅ SUCCESS: Images should now load in your frontend!")
        else:
            print(f"❌ Still failing: {response.status_code} - {response.reason}")
            
    except Exception as e:
        print(f"❌ CORS test failed: {e}")

if __name__ == "__main__":
    if fix_s3_cors():
        test_cors_after_fix()
    else:
        print("❌ CORS configuration failed")
