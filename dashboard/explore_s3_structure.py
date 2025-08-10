#!/usr/bin/env python3
"""
S3 Bucket Structure Explorer
"""

import boto3
from collections import defaultdict
import json

def explore_s3_structure():
    """Explore S3 bucket structure to understand how data is organized"""
    
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
            aws_secret_access_key='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',
            region_name='eu-north-1'
        )
        
        bucket_name = 'ddsfocustime'
        
        print("🔍 Exploring S3 Bucket Structure...")
        print(f"📁 Bucket: {bucket_name}")
        print("=" * 60)
        
        # First, let's see what top-level prefixes exist
        print("🔍 Top-level structure:")
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Delimiter='/',
            MaxKeys=100
        )
        
        # Check common prefixes (folders)
        if 'CommonPrefixes' in response:
            print("📂 Top-level folders:")
            for prefix in response['CommonPrefixes']:
                folder_name = prefix['Prefix'].rstrip('/')
                print(f"  - {folder_name}/")
        
        # Check files in root
        if 'Contents' in response:
            root_files = [obj['Key'] for obj in response['Contents'] if '/' not in obj['Key']]
            if root_files:
                print(f"📄 Root files: {len(root_files)}")
                for file in root_files[:5]:  # Show first 5
                    print(f"  - {file}")
        
        print("\n" + "=" * 60)
        
        # Now let's explore different possible user data locations
        prefixes_to_check = [
            'screenshots/',
            'users/',
            'data/',
            'user_data/',
            'user_screenshots/',
            '',  # Root level
        ]
        
        all_users_found = set()
        folder_structures = {}
        
        for prefix in prefixes_to_check:
            print(f"🔍 Checking prefix: '{prefix}'")
            
            try:
                paginator = s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=bucket_name,
                    Prefix=prefix
                )
                
                objects_in_prefix = 0
                users_in_prefix = set()
                sample_keys = []
                
                for page in page_iterator:
                    if 'Contents' not in page:
                        continue
                        
                    for obj in page['Contents']:
                        objects_in_prefix += 1
                        key = obj['Key']
                        
                        if len(sample_keys) < 10:
                            sample_keys.append(key)
                        
                        # Try to extract user info from different patterns
                        parts = key.split('/')
                        
                        # Pattern 1: prefix/user_email/...
                        if len(parts) >= 2:
                            potential_user = parts[1] if prefix else parts[0]
                            if '_at_' in potential_user or '@' in potential_user:
                                user_email = potential_user.replace('_at_', '@').replace('_dot_', '.')
                                users_in_prefix.add(user_email)
                                all_users_found.add(user_email)
                        
                        # Pattern 2: Look for email patterns anywhere in the path
                        for part in parts:
                            if '_at_' in part or '@' in part:
                                user_email = part.replace('_at_', '@').replace('_dot_', '.')
                                if '@' in user_email and '.' in user_email:
                                    users_in_prefix.add(user_email)
                                    all_users_found.add(user_email)
                
                folder_structures[prefix] = {
                    'objects_count': objects_in_prefix,
                    'users_found': len(users_in_prefix),
                    'sample_keys': sample_keys,
                    'users_list': list(users_in_prefix)[:10]  # First 10 users
                }
                
                print(f"  📊 Objects: {objects_in_prefix}")
                print(f"  👥 Users found: {len(users_in_prefix)}")
                if sample_keys:
                    print(f"  📄 Sample keys:")
                    for key in sample_keys[:3]:
                        print(f"    - {key}")
                print()
                
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
                print()
        
        print("=" * 60)
        print("📊 SUMMARY:")
        print(f"👥 Total unique users found: {len(all_users_found)}")
        print("👤 Users:")
        for i, user in enumerate(sorted(all_users_found), 1):
            print(f"  {i:2d}. {user}")
        
        print("\n📂 Best prefix for user data:")
        best_prefix = max(folder_structures.items(), key=lambda x: x[1]['users_found'])
        print(f"  Prefix: '{best_prefix[0]}'")
        print(f"  Users: {best_prefix[1]['users_found']}")
        print(f"  Objects: {best_prefix[1]['objects_count']}")
        
        # Save results to file
        results = {
            'total_users_found': len(all_users_found),
            'users_list': sorted(all_users_found),
            'folder_structures': folder_structures,
            'best_prefix': best_prefix[0],
            'exploration_summary': f"Found {len(all_users_found)} users across different prefixes"
        }
        
        with open('s3_structure_exploration.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Results saved to: s3_structure_exploration.json")
        return results
        
    except Exception as e:
        print(f"❌ Error exploring S3: {str(e)}")
        return None

if __name__ == "__main__":
    explore_s3_structure()
