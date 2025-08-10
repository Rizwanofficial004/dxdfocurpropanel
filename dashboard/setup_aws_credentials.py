"""
AWS Credentials Setup Helper
This script helps you configure AWS credentials for S3 access
"""

import os
import boto3
from pathlib import Path

def setup_aws_credentials():
    """Help user set up AWS credentials properly"""
    print("🔧 AWS Credentials Setup Helper")
    print("=" * 50)
    
    print("📋 You have several options to configure AWS credentials:")
    print()
    
    print("📍 Option 1: Environment Variables (Recommended for testing)")
    print("   Set these environment variables in PowerShell:")
    print("   $env:AWS_ACCESS_KEY_ID='your_access_key_here'")
    print("   $env:AWS_SECRET_ACCESS_KEY='your_secret_key_here'")
    print("   $env:AWS_DEFAULT_REGION='eu-north-1'")
    print()
    
    print("📍 Option 2: AWS Credentials File (Recommended for permanent setup)")
    print("   Create/edit file: ~/.aws/credentials")
    print("   Content:")
    print("   [default]")
    print("   aws_access_key_id = your_access_key_here")
    print("   aws_secret_access_key = your_secret_key_here")
    print()
    
    print("📍 Option 3: AWS Config File")
    print("   Create/edit file: ~/.aws/config")
    print("   Content:")
    print("   [default]")
    print("   region = eu-north-1")
    print()
    
    # Check current credential status
    print("🔍 Checking current credential status...")
    
    # Check environment variables
    aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
    aws_region = os.environ.get('AWS_DEFAULT_REGION')
    
    if aws_access_key and aws_secret_key:
        print("   ✅ Environment variables found:")
        print(f"   AWS_ACCESS_KEY_ID: {aws_access_key[:10]}...")
        print(f"   AWS_SECRET_ACCESS_KEY: {'*' * 20}")
        print(f"   AWS_DEFAULT_REGION: {aws_region or 'not set'}")
    else:
        print("   ❌ Environment variables not found")
    
    # Check credentials file
    credentials_file = Path.home() / '.aws' / 'credentials'
    if credentials_file.exists():
        print(f"   ✅ Credentials file exists: {credentials_file}")
    else:
        print(f"   ❌ Credentials file not found: {credentials_file}")
    
    # Check config file
    config_file = Path.home() / '.aws' / 'config'
    if config_file.exists():
        print(f"   ✅ Config file exists: {config_file}")
    else:
        print(f"   ❌ Config file not found: {config_file}")
    
    # Test connection
    print()
    print("🧪 Testing AWS connection...")
    try:
        s3_client = boto3.client('s3', region_name='eu-north-1')
        
        # Try to list buckets (simple test)
        response = s3_client.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        
        print("   ✅ AWS connection successful!")
        print(f"   📦 Found {len(buckets)} buckets")
        
        if 'ddsfocustime' in buckets:
            print("   ✅ Target bucket 'ddsfocustime' found")
        else:
            print("   ❌ Target bucket 'ddsfocustime' not found")
            print(f"   Available buckets: {', '.join(buckets)}")
            
    except Exception as e:
        print("   ❌ AWS connection failed:")
        print(f"   Error: {e}")
        print()
        print("🔧 To fix this:")
        print("   1. Get your AWS Access Key ID and Secret Access Key from AWS console")
        print("   2. Set them using one of the methods above")
        print("   3. Make sure your AWS user has S3 permissions")

def create_credentials_file_template():
    """Create a template credentials file"""
    print()
    print("📝 Creating AWS credentials file template...")
    
    aws_dir = Path.home() / '.aws'
    aws_dir.mkdir(exist_ok=True)
    
    credentials_file = aws_dir / 'credentials'
    config_file = aws_dir / 'config'
    
    # Create credentials template
    credentials_content = """[default]
aws_access_key_id = YOUR_ACCESS_KEY_HERE
aws_secret_access_key = YOUR_SECRET_KEY_HERE
"""
    
    config_content = """[default]
region = eu-north-1
output = json
"""
    
    try:
        if not credentials_file.exists():
            with open(credentials_file, 'w') as f:
                f.write(credentials_content)
            print(f"   ✅ Created template: {credentials_file}")
            print("   📝 Edit this file and add your real AWS credentials")
        else:
            print(f"   ℹ️  Credentials file already exists: {credentials_file}")
        
        if not config_file.exists():
            with open(config_file, 'w') as f:
                f.write(config_content)
            print(f"   ✅ Created template: {config_file}")
        else:
            print(f"   ℹ️  Config file already exists: {config_file}")
            
    except Exception as e:
        print(f"   ❌ Error creating files: {e}")

if __name__ == "__main__":
    setup_aws_credentials()
    
    print()
    create_template = input("📝 Create AWS credentials file template? (y/n): ").lower().strip()
    if create_template == 'y':
        create_credentials_file_template()
    
    print()
    print("🎯 Next Steps:")
    print("   1. Set up your AWS credentials using one of the methods above")
    print("   2. Run: python inspect_s3_bucket.py")
    print("   3. Run: python fix_realistic_counts.py")
    print("   4. Your S3 data will be automatically detected and used!")
