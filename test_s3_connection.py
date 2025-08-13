print("Testing Python output...")
print("1 + 1 =", 1 + 1)
print("Script is working!")

# Test boto3 and S3 connection
try:
    import boto3
    print("✅ boto3 imported successfully")
    
    s3 = boto3.client(
        's3',
        aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
        aws_secret_access_key='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',
        region_name='eu-north-1'
    )
    
    print("✅ S3 client created")
    
    # Test bucket access
    response = s3.list_objects_v2(
        Bucket='ddsfocustime',
        Prefix='screenshots/',
        Delimiter='/',
        MaxKeys=5
    )
    
    print(f"✅ S3 connection successful!")
    print(f"Found {len(response.get('CommonPrefixes', []))} user folders")
    
    if 'CommonPrefixes' in response:
        for prefix in response['CommonPrefixes'][:3]:
            folder = prefix['Prefix'].replace('screenshots/', '').replace('/', '')
            user_email = folder.replace('_at_', '@')
            print(f"  - User: {user_email}")
    
    print("\n🎉 REAL S3 DATA IS ACCESSIBLE!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\nDone!")
