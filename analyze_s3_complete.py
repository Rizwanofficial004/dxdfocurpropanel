#!/usr/bin/env python3
"""
S3 Structure Analysis - Examine the complete S3 bucket structure
"""
import os
import sys
import django

# Add the project directory to the Python path
project_path = r"c:\Users\deniz\OneDrive\Email attachments\Masaüstü\Git-Projects\dxdfocurpropanel"
sys.path.append(project_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
os.chdir(project_path)
django.setup()

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from dashboard.aws_utils import get_s3_client

def analyze_s3_structure():
    """Analyze the complete S3 bucket structure"""
    print("🔍 Analyzing S3 Bucket Structure")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = 'ddsfocustime'
    
    # Step 1: Check root level structure
    print("\n📋 Step 1: Root Level Analysis")
    print("-" * 40)
    
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Delimiter='/',
            MaxKeys=50
        )
        
        if 'CommonPrefixes' in response:
            print(f"📁 Root-level folders found:")
            for prefix in response['CommonPrefixes']:
                folder_name = prefix['Prefix'].rstrip('/')
                print(f"   - {folder_name}")
        
        if 'Contents' in response:
            print(f"📄 Root-level files:")
            for obj in response['Contents'][:10]:
                print(f"   - {obj['Key']}")
                
    except Exception as e:
        print(f"💥 Error: {e}")
        return
    
    # Step 2: Analyze screenshots folder structure
    print("\n📋 Step 2: Screenshots Folder Analysis")
    print("-" * 40)
    
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='screenshots/',
            Delimiter='/',
            MaxKeys=100
        )
        
        user_folders = []
        if 'CommonPrefixes' in response:
            print(f"👥 User folders in screenshots/:")
            for prefix in response['CommonPrefixes']:
                user_folder = prefix['Prefix'].replace('screenshots/', '').rstrip('/')
                user_folders.append(user_folder)
                print(f"   - {user_folder}")
                
            print(f"\n📊 Total user folders: {len(user_folders)}")
            
        else:
            print("❌ No user folders found in screenshots/")
            return
            
    except Exception as e:
        print(f"💥 Error: {e}")
        return
    
    # Step 3: Analyze a few sample users in detail
    print("\n📋 Step 3: Sample User Analysis")
    print("-" * 40)
    
    sample_users = user_folders[:3]  # First 3 users
    
    for i, user_folder in enumerate(sample_users, 1):
        print(f"\n👤 User {i}: {user_folder}")
        print(f"   {'=' * 30}")
        
        try:
            # Check if user has project subfolders
            user_prefix = f"screenshots/{user_folder}/"
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=user_prefix,
                Delimiter='/',
                MaxKeys=50
            )
            
            project_folders = []
            if 'CommonPrefixes' in response:
                print(f"   📁 Project folders:")
                for prefix in response['CommonPrefixes']:
                    project_folder = prefix['Prefix'].replace(user_prefix, '').rstrip('/')
                    project_folders.append(project_folder)
                    print(f"      - {project_folder}")
            
            # Count total screenshots for this user
            total_screenshots = 0
            continuation_token = None
            
            while True:
                list_params = {
                    'Bucket': bucket_name,
                    'Prefix': user_prefix,
                    'MaxKeys': 1000
                }
                if continuation_token:
                    list_params['ContinuationToken'] = continuation_token
                
                response = s3_client.list_objects_v2(**list_params)
                
                if 'Contents' in response:
                    screenshot_objects = [
                        obj for obj in response['Contents'] 
                        if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
                        and not obj['Key'].endswith('/')
                    ]
                    total_screenshots += len(screenshot_objects)
                
                if response.get('IsTruncated'):
                    continuation_token = response.get('NextContinuationToken')
                else:
                    break
            
            print(f"   📸 Total screenshots: {total_screenshots:,}")
            print(f"   📁 Project folders: {len(project_folders)}")
            
            # Show sample screenshots from first project
            if project_folders:
                first_project = project_folders[0]
                project_prefix = f"screenshots/{user_folder}/{first_project}/"
                
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=project_prefix,
                    MaxKeys=5
                )
                
                if 'Contents' in response:
                    screenshots = [
                        obj for obj in response['Contents'] 
                        if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
                    ]
                    
                    if screenshots:
                        print(f"   🔍 Sample from '{first_project}':")
                        for j, obj in enumerate(screenshots[:3], 1):
                            filename = os.path.basename(obj['Key'])
                            size_mb = obj['Size'] / 1024 / 1024
                            print(f"      {j}. {filename} ({size_mb:.1f}MB)")
            
        except Exception as e:
            print(f"   💥 Error analyzing {user_folder}: {e}")
    
    # Step 4: Generate structure summary
    print("\n📋 Step 4: Structure Summary")
    print("-" * 40)
    
    print("🎯 S3 Structure Pattern:")
    print("   Root: ddsfocustime/")
    print("   ├── screenshots/")
    print("   │   ├── user1_at_domain.com/")
    print("   │   │   ├── Project_Folder_1/")
    print("   │   │   │   ├── screenshot1.webp")
    print("   │   │   │   └── screenshot2.webp")
    print("   │   │   └── Project_Folder_2/")
    print("   │   │       └── screenshot3.webp")
    print("   │   └── user2_at_domain.com/")
    print("   │       └── Project_Folder/")
    print("   │           └── screenshots...")
    print("   └── other_folders/")
    
    print(f"\n📊 Summary Statistics:")
    print(f"   👥 Total users: {len(user_folders)}")
    print(f"   📁 Structure: screenshots/{{user}}/{{project}}/{{files}}")
    print(f"   🔑 User format: email with @ replaced by _at_")
    print(f"   📸 File types: .webp, .png, .jpg, .jpeg")
    
    return user_folders

if __name__ == "__main__":
    analyze_s3_structure()
