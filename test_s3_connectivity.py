"""
S3 Connectivity Test and Fix for Screenshots Search API
"""
import boto3
import os
from botocore.exceptions import ClientError, NoCredentialsError

def test_s3_connectivity():
    """Test S3 connection and list some objects to verify credentials work"""
    
    print("🔍 Testing S3 Connectivity...")
    
    # Try with environment variables first
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name="eu-north-1"
        )
        
        bucket_name = "ddsfocustime"
        
        print(f"   Bucket: {bucket_name}")
        print(f"   Region: eu-north-1")
        print(f"   Access Key: {os.getenv('AWS_ACCESS_KEY_ID', 'NOT_SET')[:10]}...")
        
        # Test bucket access
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            Delimiter="/",
            MaxKeys=10
        )
        
        total_prefixes = len(response.get('CommonPrefixes', []))
        total_objects = len(response.get('Contents', []))
        
        print(f"✅ S3 Connection Successful!")
        print(f"   Found {total_prefixes} employee folders")
        print(f"   Found {total_objects} direct objects")
        
        # Show some employee folders
        if total_prefixes > 0:
            print(f"   Sample employee folders:")
            for i, prefix_info in enumerate(response.get('CommonPrefixes', [])[:5]):
                folder = prefix_info['Prefix'].replace('screenshots/', '').rstrip('/')
                email = folder.replace('_at_', '@') if '_at_' in folder else folder
                print(f"     {i+1}. {email} (folder: {folder})")
        
        return True, s3_client, response
        
    except NoCredentialsError:
        print("❌ AWS credentials not found")
        print("   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables")
        return False, None, None
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        print(f"❌ AWS Client Error: {error_code}")
        print(f"   Message: {e.response['Error']['Message']}")
        return False, None, None
        
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False, None, None

def enhanced_get_all_employees_from_s3():
    """Enhanced version of get_all_employees_from_s3 with better error handling"""
    
    success, s3_client, initial_response = test_s3_connectivity()
    
    if not success:
        print("❌ Cannot access S3 - using fallback test data")
        # Return test data for development
        return [
            {'email': 'haseebcodejourney@gmail.com', 'folder': 'haseebcodejourney_at_gmail.com'},
            {'email': 'admin@dds.com', 'folder': 'admin_at_dds.com'},
            {'email': 'test@example.com', 'folder': 'test_at_example.com'}
        ]
    
    try:
        bucket_name = "ddsfocustime"
        employees = []
        
        # Use the initial response if available, otherwise make a new request
        if initial_response:
            response = initial_response
        else:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix="screenshots/",
                Delimiter="/"
            )
        
        # Process all employee folders
        for prefix_info in response.get('CommonPrefixes', []):
            prefix = prefix_info['Prefix']
            folder_name = prefix.replace('screenshots/', '').rstrip('/')
            
            # Convert S3 folder format back to email
            if '_at_' in folder_name:
                email = folder_name.replace('_at_', '@')
                employees.append({
                    'email': email,
                    'folder': folder_name,
                    'prefix': prefix
                })
                print(f"   📧 Found employee: {email}")
        
        print(f"✅ Successfully found {len(employees)} employees in S3")
        return employees
        
    except Exception as e:
        print(f"❌ Error scanning S3: {str(e)}")
        return []

if __name__ == "__main__":
    print("🧪 S3 Connectivity Test")
    print("=" * 50)
    
    employees = enhanced_get_all_employees_from_s3()
    
    print(f"\n📊 Summary:")
    print(f"   Total employees found: {len(employees)}")
    
    if employees:
        print(f"   Sample employees:")
        for i, emp in enumerate(employees[:3]):
            print(f"     {i+1}. {emp['email']}")
