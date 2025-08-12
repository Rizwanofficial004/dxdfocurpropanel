#!/usr/bin/env python3
"""
S3 Inventory-based Screenshot Analysis
Uses S3 Inventory to efficiently analyze large buckets
"""
import os
import sys
import django
import boto3
import json
from datetime import datetime, timedelta
import csv
import gzip
from collections import defaultdict

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

def setup_s3_inventory():
    """Set up S3 Inventory configuration"""
    print("🔧 Setting up S3 Inventory Configuration")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = 'ddsfocustime'
    inventory_id = 'screenshots-inventory'
    
    # Inventory configuration
    inventory_config = {
        'Id': inventory_id,
        'IsEnabled': True,
        'Destination': {
            'S3BucketDestination': {
                'Bucket': f'arn:aws:s3:::{bucket_name}',
                'Prefix': 'inventory-reports/',
                'Format': 'CSV'
            }
        },
        'Schedule': {
            'Frequency': 'Daily'
        },
        'Filter': {
            'Prefix': 'screenshots/'
        },
        'IncludedObjectVersions': 'Current',
        'OptionalFields': [
            'Size',
            'LastModifiedDate',
            'StorageClass'
        ]
    }
    
    try:
        # Check if inventory already exists
        try:
            response = s3_client.get_bucket_inventory_configuration(
                Bucket=bucket_name,
                Id=inventory_id
            )
            print(f"✅ Inventory configuration '{inventory_id}' already exists")
            return True
        except s3_client.exceptions.NoSuchConfiguration:
            pass
        
        # Create inventory configuration
        s3_client.put_bucket_inventory_configuration(
            Bucket=bucket_name,
            Id=inventory_id,
            InventoryConfiguration=inventory_config
        )
        
        print(f"✅ Created inventory configuration: {inventory_id}")
        print(f"📋 Inventory will generate daily reports to: inventory-reports/")
        print(f"⏰ Note: First report will be available within 24-48 hours")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up inventory: {e}")
        return False

def check_existing_inventory_reports():
    """Check for existing inventory reports"""
    print("\n🔍 Checking for existing inventory reports")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = 'ddsfocustime'
    
    try:
        # List inventory report files
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='inventory-reports/',
            MaxKeys=20
        )
        
        if 'Contents' in response:
            reports = [obj for obj in response['Contents'] if obj['Key'].endswith('.csv.gz')]
            
            if reports:
                print(f"📊 Found {len(reports)} inventory report files:")
                
                # Sort by last modified (newest first)
                reports.sort(key=lambda x: x['LastModified'], reverse=True)
                
                for i, report in enumerate(reports[:5], 1):
                    print(f"   {i}. {report['Key']}")
                    print(f"      Size: {report['Size']:,} bytes")
                    print(f"      Modified: {report['LastModified']}")
                    print()
                
                return reports[0]  # Return newest report
            else:
                print("❌ No inventory report files found")
        else:
            print("❌ No inventory-reports folder found")
            
    except Exception as e:
        print(f"❌ Error checking inventory reports: {e}")
    
    return None

def analyze_inventory_report(report_key):
    """Analyze an existing inventory report"""
    print(f"\n📊 Analyzing inventory report: {report_key}")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = 'ddsfocustime'
    
    try:
        # Download and analyze the report
        response = s3_client.get_object(Bucket=bucket_name, Key=report_key)
        
        # Read gzipped CSV
        with gzip.open(response['Body'], 'rt') as f:
            csv_reader = csv.reader(f)
            
            # Skip header if present
            headers = next(csv_reader, None)
            print(f"📋 CSV Headers: {headers}")
            
            user_screenshots = defaultdict(lambda: {
                'total_count': 0,
                'total_size': 0,
                'projects': defaultdict(int),
                'latest_date': None,
                'files': []
            })
            
            total_processed = 0
            
            for row in csv_reader:
                if len(row) < 3:
                    continue
                    
                file_key = row[1]  # Assuming key is in second column
                size = int(row[2]) if len(row) > 2 and row[2].isdigit() else 0
                last_modified = row[3] if len(row) > 3 else ""
                
                # Filter screenshot files
                if (file_key.startswith('screenshots/') and 
                    file_key.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))):
                    
                    # Parse path: screenshots/user_email/project/filename
                    path_parts = file_key.split('/')
                    if len(path_parts) >= 4:
                        user_folder = path_parts[1]
                        project_folder = path_parts[2]
                        filename = path_parts[-1]
                        
                        # Convert folder back to email
                        user_email = user_folder.replace('_at_', '@')
                        
                        user_screenshots[user_email]['total_count'] += 1
                        user_screenshots[user_email]['total_size'] += size
                        user_screenshots[user_email]['projects'][project_folder] += 1
                        
                        if (not user_screenshots[user_email]['latest_date'] or 
                            last_modified > user_screenshots[user_email]['latest_date']):
                            user_screenshots[user_email]['latest_date'] = last_modified
                        
                        # Store file info (limit to prevent memory issues)
                        if len(user_screenshots[user_email]['files']) < 10:
                            user_screenshots[user_email]['files'].append({
                                'filename': filename,
                                'project': project_folder,
                                'size': size,
                                'date': last_modified,
                                'full_path': file_key
                            })
                
                total_processed += 1
                if total_processed % 10000 == 0:
                    print(f"   📊 Processed {total_processed:,} records...")
            
            print(f"\n✅ Analysis complete! Processed {total_processed:,} records")
            print(f"👥 Found screenshots for {len(user_screenshots)} users")
            
            # Display results
            display_analysis_results(user_screenshots)
            
            return user_screenshots
            
    except Exception as e:
        print(f"❌ Error analyzing inventory report: {e}")
        return None

def display_analysis_results(user_screenshots):
    """Display the analysis results"""
    print(f"\n📊 Screenshot Analysis Results")
    print("=" * 60)
    
    # Sort users by screenshot count
    sorted_users = sorted(user_screenshots.items(), 
                         key=lambda x: x[1]['total_count'], 
                         reverse=True)
    
    total_screenshots = sum(data['total_count'] for data in user_screenshots.values())
    total_size = sum(data['total_size'] for data in user_screenshots.values())
    
    print(f"📈 Summary:")
    print(f"   👥 Total Users: {len(user_screenshots)}")
    print(f"   📸 Total Screenshots: {total_screenshots:,}")
    print(f"   💾 Total Size: {total_size / (1024*1024*1024):.2f} GB")
    
    print(f"\n🏆 Top 10 Users by Screenshot Count:")
    for i, (email, data) in enumerate(sorted_users[:10], 1):
        size_mb = data['total_size'] / (1024*1024)
        projects = len(data['projects'])
        latest = data['latest_date'].strftime('%Y-%m-%d') if data['latest_date'] else 'Unknown'
        
        print(f"   {i:2d}. {email}")
        print(f"       📸 Screenshots: {data['total_count']:,}")
        print(f"       📁 Projects: {projects}")
        print(f"       💾 Size: {size_mb:.1f} MB")
        print(f"       📅 Latest: {latest}")
        
        # Show top projects for this user
        top_projects = sorted(data['projects'].items(), 
                            key=lambda x: x[1], reverse=True)[:3]
        if top_projects:
            print(f"       🎯 Top Projects: {', '.join([f'{p}({c})' for p, c in top_projects])}")
        print()

def create_fast_screenshots_api():
    """Create an optimized API that uses cached inventory data"""
    api_code = '''
"""
Fast All Screenshots API using S3 Inventory data
This is much faster than direct S3 listing for large buckets
"""
import json
import os
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# Cache file path
CACHE_FILE = os.path.join(os.path.dirname(__file__), 'data', 'screenshots_inventory_cache.json')

@csrf_exempt
@require_http_methods(["GET"])
def fast_all_screenshots_api(request):
    """
    Fast API using cached inventory data
    
    GET: /api/screenshots/fast-all/
    Parameters:
    - limit_users=N : Limit number of users returned
    - limit_per_user=N : Limit screenshots per user  
    - sort_by=count|size|date|name : Sort users by different criteria
    """
    try:
        # Get parameters
        limit_users = request.GET.get('limit_users', 50)
        limit_per_user = request.GET.get('limit_per_user', 100)
        sort_by = request.GET.get('sort_by', 'count')
        
        if isinstance(limit_users, str):
            limit_users = int(limit_users) if limit_users.isdigit() else 50
        if isinstance(limit_per_user, str):
            limit_per_user = int(limit_per_user) if limit_per_user.isdigit() else 100
        
        # Load cached data
        if not os.path.exists(CACHE_FILE):
            return JsonResponse({
                "success": False,
                "message": "Inventory cache not found. Run inventory analysis first.",
                "data": {}
            }, status=404)
        
        with open(CACHE_FILE, 'r') as f:
            cache_data = json.load(f)
        
        user_data = cache_data.get('users', {})
        
        # Sort users
        if sort_by == 'size':
            sorted_users = sorted(user_data.items(), 
                                key=lambda x: x[1]['total_size'], reverse=True)
        elif sort_by == 'date':
            sorted_users = sorted(user_data.items(), 
                                key=lambda x: x[1]['latest_date'] or '', reverse=True)
        elif sort_by == 'name':
            sorted_users = sorted(user_data.items())
        else:  # count
            sorted_users = sorted(user_data.items(), 
                                key=lambda x: x[1]['total_count'], reverse=True)
        
        # Limit users
        sorted_users = sorted_users[:limit_users]
        
        # Format response
        users_response = []
        total_screenshots = 0
        
        for email, data in sorted_users:
            # Limit files per user
            files = data.get('files', [])[:limit_per_user]
            
            user_info = {
                "employee_email": email,
                "employee_name": email.split('@')[0].replace('.', ' ').title(),
                "screenshot_count": data['total_count'],
                "total_size_mb": round(data['total_size'] / (1024*1024), 2),
                "project_count": len(data.get('projects', {})),
                "latest_activity": data.get('latest_date', ''),
                "top_projects": sorted(data.get('projects', {}).items(), 
                                     key=lambda x: x[1], reverse=True)[:5],
                "sample_screenshots": files
            }
            
            users_response.append(user_info)
            total_screenshots += data['total_count']
        
        response_data = {
            "users": users_response,
            "total_users_returned": len(users_response),
            "total_users_available": len(user_data),
            "total_screenshots": total_screenshots,
            "cache_generated": cache_data.get('generated_at', ''),
            "parameters": {
                "limit_users": limit_users,
                "limit_per_user": limit_per_user,
                "sort_by": sort_by
            }
        }
        
        return JsonResponse({
            "success": True,
            "message": f"Found {len(users_response)} users with {total_screenshots:,} screenshots (cached data)",
            "data": response_data,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"Error retrieving cached screenshots: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)
'''
    
    # Write the API file
    api_file_path = os.path.join(project_path, 'dashboard', 'fast_screenshots_api.py')
    with open(api_file_path, 'w') as f:
        f.write(api_code)
    
    print(f"✅ Created fast screenshots API: {api_file_path}")

def save_analysis_cache(user_screenshots):
    """Save analysis results to cache file"""
    print(f"\n💾 Saving analysis results to cache...")
    
    cache_dir = os.path.join(project_path, 'dashboard', 'data')
    os.makedirs(cache_dir, exist_ok=True)
    
    cache_file = os.path.join(cache_dir, 'screenshots_inventory_cache.json')
    
    # Convert datetime objects to strings for JSON serialization
    serializable_data = {}
    for email, data in user_screenshots.items():
        serializable_data[email] = {
            'total_count': data['total_count'],
            'total_size': data['total_size'],
            'projects': dict(data['projects']),
            'latest_date': data['latest_date'].isoformat() if data['latest_date'] else None,
            'files': data.get('files', [])
        }
    
    cache_data = {
        'generated_at': datetime.now().isoformat(),
        'total_users': len(user_screenshots),
        'total_screenshots': sum(data['total_count'] for data in user_screenshots.values()),
        'users': serializable_data
    }
    
    with open(cache_file, 'w') as f:
        json.dump(cache_data, f, indent=2)
    
    print(f"✅ Cache saved to: {cache_file}")
    
def use_alternative_fast_listing():
    """Alternative: Use optimized S3 listing with pagination and limits"""
    print(f"\n⚡ Using alternative fast listing approach")
    print("=" * 60)
    
    s3_client = get_s3_client()
    bucket_name = 'ddsfocustime'
    
    user_screenshots = defaultdict(lambda: {
        'total_count': 0,
        'total_size': 0,
        'projects': defaultdict(int),
        'latest_date': None,
        'files': []
    })
    
    try:
        # List user folders first
        print("🔍 Finding user folders...")
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='screenshots/',
            Delimiter='/',
            MaxKeys=100
        )
        
        user_folders = []
        if 'CommonPrefixes' in response:
            for prefix in response['CommonPrefixes']:
                folder = prefix['Prefix'].replace('screenshots/', '').replace('/', '')
                if folder:
                    user_folders.append(folder)
        
        print(f"📁 Found {len(user_folders)} user folders")
        
        # Sample first 10 users to avoid timeout
        sample_users = user_folders[:10]
        print(f"📊 Analyzing sample of {len(sample_users)} users...")
        
        for i, user_folder in enumerate(sample_users, 1):
            print(f"   {i}/{len(sample_users)}: {user_folder}")
            
            user_email = user_folder.replace('_at_', '@')
            prefix = f"screenshots/{user_folder}/"
            
            # List with limit to avoid timeout
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=prefix,
                MaxKeys=1000  # Limit per user
            )
            
            if 'Contents' in response:
                screenshot_files = [
                    obj for obj in response['Contents']
                    if obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
                    and not obj['Key'].endswith('/')
                ]
                
                user_screenshots[user_email]['total_count'] = len(screenshot_files)
                user_screenshots[user_email]['total_size'] = sum(obj['Size'] for obj in screenshot_files)
                
                # Extract project info from first few files
                for obj in screenshot_files[:10]:
                    path_parts = obj['Key'].split('/')
                    if len(path_parts) >= 3:
                        project = path_parts[2]
                        user_screenshots[user_email]['projects'][project] += 1
                    
                    if (not user_screenshots[user_email]['latest_date'] or 
                        obj['LastModified'] > user_screenshots[user_email]['latest_date']):
                        user_screenshots[user_email]['latest_date'] = obj['LastModified']
                    
                    user_screenshots[user_email]['files'].append({
                        'filename': os.path.basename(obj['Key']),
                        'project': path_parts[2] if len(path_parts) >= 3 else 'Unknown',
                        'size': obj['Size'],
                        'date': obj['LastModified'].isoformat(),
                        'full_path': obj['Key']
                    })
        
        print(f"\n✅ Sample analysis complete!")
        display_analysis_results(user_screenshots)
        save_analysis_cache(dict(user_screenshots))
        
        return user_screenshots
        
    except Exception as e:
        print(f"❌ Error in alternative listing: {e}")
        return None

def main():
    """Main function"""
    print("🚀 S3 Screenshots Inventory Analysis")
    print("=" * 60)
    print("This tool will analyze your S3 bucket for screenshots using efficient methods:")
    print("1. Try to use existing S3 Inventory reports (fastest)")
    print("2. Set up S3 Inventory for future use")
    print("3. Use optimized listing as fallback")
    print()
    
    # Check for existing inventory reports first
    latest_report = check_existing_inventory_reports()
    
    if latest_report:
        print(f"✅ Using existing inventory report for analysis...")
        user_data = analyze_inventory_report(latest_report['Key'])
        if user_data:
            save_analysis_cache(dict(user_data))
    else:
        print(f"📋 No inventory reports found. Setting up inventory for future use...")
        setup_s3_inventory()
        
        print(f"⚡ Using alternative fast listing for immediate results...")
        user_data = use_alternative_fast_listing()
    
    # Create the fast API
    create_fast_screenshots_api()
    
    print(f"\n🎉 Analysis complete!")
    print(f"📋 Next steps:")
    print(f"   1. Add fast_screenshots_api to your Django URLs")
    print(f"   2. Test the API: /api/screenshots/fast-all/")
    print(f"   3. Inventory reports will be available daily for faster future analysis")

if __name__ == "__main__":
    main()
