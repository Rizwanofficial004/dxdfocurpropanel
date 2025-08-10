"""
Simple S3 employee scanning debug without Django
"""
import boto3

def debug_s3_simple():
    """Debug S3 employee scanning without Django"""
    
    print("🔍 Simple S3 Employee Scanning Debug")
    print("=" * 50)
    
    # Use the same credentials as aws_utils.py
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
            aws_secret_access_key="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",
            region_name="eu-north-1"
        )
        
        bucket_name = "ddsfocustime"
        
        print(f"📦 Scanning bucket: {bucket_name}")
        
        # Test 1: List objects with screenshots/ prefix
        print(f"\n1️⃣ Testing list_objects_v2 with prefix 'screenshots/'")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            MaxKeys=10
        )
        
        if 'Contents' in response:
            print(f"   ✅ Found {len(response['Contents'])} objects")
            for obj in response['Contents']:
                print(f"     • {obj['Key']}")
        else:
            print("   ❌ No objects found")
        
        # Test 2: List with delimiter to get folders (like the original function)
        print(f"\n2️⃣ Testing list_objects_v2 with delimiter='/' (folder structure)")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            Delimiter='/',
            MaxKeys=100
        )
        
        print(f"   CommonPrefixes found: {len(response.get('CommonPrefixes', []))}")
        
        employees = []
        for prefix_info in response.get('CommonPrefixes', []):
            prefix = prefix_info['Prefix']
            print(f"     • Prefix: {prefix}")
            
            # Extract email folder: screenshots/email_folder/ -> email_folder
            email_folder = prefix.replace('screenshots/', '').rstrip('/')
            print(f"       - Email folder: {email_folder}")
            
            # Convert back to email format
            if '_at_' in email_folder:
                email = email_folder.replace('_at_', '@')
                employees.append({
                    'email': email,
                    'folder': email_folder,
                    'prefix': prefix
                })
                print(f"       → Email: {email}")
        
        print(f"\n✅ Total employees found: {len(employees)}")
        
        # Test 3: Test search matching
        if employees:
            print(f"\n3️⃣ Testing Search Matching")
            test_searches = ["haseeb", "amir", "gmail", "amirishaque67", "amirishaque67@gmail.com"]
            
            for search_term in test_searches:
                print(f"\n   Testing search: '{search_term}'")
                matches = []
                
                for emp in employees:
                    email = emp['email']
                    username = email.split('@')[0]
                    search_lower = search_term.lower()
                    
                    if (search_lower in email.lower() or 
                        search_lower in username.lower()):
                        matches.append(emp)
                        print(f"     ✅ MATCH: {email}")
                    else:
                        print(f"     ❌ No match: {email}")
                
                print(f"     Total matches: {len(matches)}")
        else:
            print("   No employees found to test search matching")
        
        # Test 4: Check if there are any objects at all in screenshots/
        print(f"\n4️⃣ Detailed object inspection")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            MaxKeys=100
        )
        
        if 'Contents' in response:
            print(f"   Found {len(response['Contents'])} objects in screenshots/:")
            
            # Group by first folder level
            folders = {}
            for obj in response['Contents']:
                key = obj['Key']
                parts = key.split('/')
                if len(parts) >= 2:  # screenshots/folder/...
                    folder = parts[1]  # The email folder
                    if folder not in folders:
                        folders[folder] = []
                    folders[folder].append(key)
            
            print(f"   Folders found: {len(folders)}")
            for folder, files in folders.items():
                if '_at_' in folder:
                    email = folder.replace('_at_', '@')
                    print(f"     • {folder} → {email} ({len(files)} files)")
                else:
                    print(f"     • {folder} (not email format, {len(files)} files)")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_s3_simple()
