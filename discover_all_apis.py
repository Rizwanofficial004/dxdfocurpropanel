#!/usr/bin/env python3
"""
🔍 COMPREHENSIVE API DISCOVERY TOOL
Discovers all available APIs in the Django project by scanning code and testing endpoints
"""

import requests
import json
import time
from datetime import datetime
import re
import os
import glob

# Configuration
BASE_URL = "https://dxdtime.ddsolutions.io"

def print_header(title):
    """Print formatted header"""
    print(f"\n{'='*80}")
    print(f"🔍 {title}")
    print(f"{'='*80}")

def extract_urls_from_django_files():
    """Extract URL patterns from Django URL configuration files"""
    print_header("EXTRACTING APIs FROM DJANGO URL FILES")
    
    url_patterns = []
    
    # Files to scan for URL patterns
    url_files = [
        "dashboard/urls.py",
        "dashboard/api_urls.py"
    ]
    
    for file_path in url_files:
        if os.path.exists(file_path):
            print(f"\n📂 Scanning: {file_path}")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Extract path() patterns
                path_patterns = re.findall(r"path\(['\"]([^'\"]+)['\"]", content)
                
                for pattern in path_patterns:
                    if pattern.startswith('api/') or pattern == 'api' or 'api' in pattern:
                        # Clean up the pattern
                        clean_pattern = pattern.replace('<str:employee_email>', '{email}')
                        clean_pattern = clean_pattern.replace('<str:folder_name>', '{folder}')
                        clean_pattern = clean_pattern.replace('<str:email>', '{email}')
                        clean_pattern = clean_pattern.replace('<path:screenshot_path>', '{path}')
                        clean_pattern = clean_pattern.replace('<path:s3_key>', '{s3_key}')
                        clean_pattern = clean_pattern.replace('<int:config_id>', '{id}')
                        clean_pattern = clean_pattern.replace('<str:config_type>', '{type}')
                        clean_pattern = clean_pattern.replace('<str:config_name>', '{name}')
                        
                        # Add /api/ prefix if not present
                        if not clean_pattern.startswith('api/'):
                            clean_pattern = f"api/{clean_pattern}"
                        
                        url_patterns.append(clean_pattern)
                        print(f"   ✅ Found: /{clean_pattern}")
                        
            except Exception as e:
                print(f"   ❌ Error reading {file_path}: {e}")
    
    return sorted(list(set(url_patterns)))

def scan_standalone_api_files():
    """Scan for standalone API server files"""
    print_header("SCANNING STANDALONE API FILES")
    
    api_files = []
    
    # Look for API server files
    patterns = [
        "*api*.py",
        "*server*.py"
    ]
    
    for pattern in patterns:
        files = glob.glob(pattern, recursive=False)
        for file in files:
            if 'test_' not in file and 'debug_' not in file:
                api_files.append(file)
                print(f"   📄 Found API file: {file}")
    
    return api_files

def test_api_endpoint(endpoint, description=""):
    """Test a single API endpoint"""
    try:
        url = f"{BASE_URL}/{endpoint.lstrip('/')}"
        start_time = time.time()
        response = requests.get(url, timeout=10)
        duration = time.time() - start_time
        
        status_color = "✅" if response.status_code == 200 else "❌"
        content_type = response.headers.get('content-type', 'unknown')
        
        result = {
            "endpoint": endpoint,
            "url": url,
            "status_code": response.status_code,
            "duration": duration,
            "content_type": content_type,
            "size": len(response.content),
            "working": response.status_code == 200 and 'application/json' in content_type
        }
        
        print(f"   {status_color} {endpoint}")
        print(f"      Status: {response.status_code} | Duration: {duration:.2f}s | Size: {len(response.content)} bytes")
        
        if response.status_code == 200 and 'application/json' in content_type:
            try:
                data = response.json()
                if isinstance(data, dict):
                    if 'success' in data:
                        print(f"      Success: {data.get('success')}")
                    if 'message' in data:
                        print(f"      Message: {data.get('message')[:100]}...")
                    if 'data' in data and isinstance(data['data'], dict):
                        data_keys = list(data['data'].keys())[:5]  # First 5 keys
                        print(f"      Data keys: {data_keys}")
            except:
                pass
        
        return result
        
    except Exception as e:
        print(f"   💥 {endpoint} - Exception: {str(e)}")
        return {
            "endpoint": endpoint,
            "status_code": "ERROR",
            "working": False,
            "error": str(e)
        }

def discover_all_apis():
    """Main function to discover all APIs"""
    print(f"🚀 STARTING COMPREHENSIVE API DISCOVERY")
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Base URL: {BASE_URL}")
    
    # 1. Extract APIs from Django URL files
    django_apis = extract_urls_from_django_files()
    
    # 2. Scan standalone API files
    standalone_files = scan_standalone_api_files()
    
    # 3. Common API patterns to test
    common_apis = [
        # Core APIs
        "api/test/",
        "api/auth/login/",
        
        # User/Employee APIs
        "api/logs/search/",
        "api/users/search/",
        "api/users/suggestions/",
        "api/live-tracking/",
        
        # Screenshot APIs
        "api/screenshots/",
        "api/screenshots/search/",
        "api/screenshots/quick-search/",
        "api/screenshots/date-search/",
        "api/screenshots/comprehensive-search/",
        
        # Employee specific
        "api/screenshots/employee/amirishaque67@gmail.com/folders/",
        "api/screenshots/employee/haseebcodejourney@gmail.com/folders/",
        
        # Dashboard APIs
        "api/dashboard/data/",
        "api/dashboard/user-data/",
        
        # Settings APIs
        "api/settings/ui/",
        "api/settings/credentials/",
        "api/settings/app/",
        "api/settings/bulk/",
        
        # Log APIs
        "api/logs/",
        "api/logs/program-summary-files/",
        "api/logs/files/",
    ]
    
    # Combine all APIs
    all_apis = list(set(django_apis + common_apis))
    
    print_header(f"TESTING {len(all_apis)} API ENDPOINTS")
    
    # Test all APIs
    results = []
    working_apis = []
    failed_apis = []
    
    for i, api in enumerate(all_apis, 1):
        print(f"\n🧪 [{i}/{len(all_apis)}] Testing: {api}")
        result = test_api_endpoint(api)
        results.append(result)
        
        if result.get('working'):
            working_apis.append(result)
        else:
            failed_apis.append(result)
    
    # Summary
    print_header("API DISCOVERY SUMMARY")
    print(f"🎯 Total APIs Tested: {len(all_apis)}")
    print(f"✅ Working APIs: {len(working_apis)}")
    print(f"❌ Failed APIs: {len(failed_apis)}")
    
    # Working APIs
    if working_apis:
        print(f"\n✅ WORKING APIS:")
        for api in working_apis:
            print(f"   • {api['endpoint']}")
            print(f"     📊 {api['status_code']} | {api.get('duration', 0):.2f}s | {api.get('size', 0)} bytes")
    
    # Failed APIs by category
    if failed_apis:
        print(f"\n❌ FAILED APIS:")
        
        # Group by status code
        status_groups = {}
        for api in failed_apis:
            status = api.get('status_code', 'ERROR')
            if status not in status_groups:
                status_groups[status] = []
            status_groups[status].append(api['endpoint'])
        
        for status, endpoints in status_groups.items():
            print(f"\n   {status} ({len(endpoints)} endpoints):")
            for endpoint in endpoints[:10]:  # Show first 10
                print(f"     • {endpoint}")
            if len(endpoints) > 10:
                print(f"     ... and {len(endpoints) - 10} more")
    
    print(f"\n🕐 Discovery completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return working_apis, failed_apis

if __name__ == "__main__":
    working, failed = discover_all_apis()
    
    # Create summary file
    summary = {
        "discovery_date": datetime.now().isoformat(),
        "base_url": BASE_URL,
        "total_tested": len(working) + len(failed),
        "working_count": len(working),
        "failed_count": len(failed),
        "working_apis": [api['endpoint'] for api in working],
        "failed_apis": [{"endpoint": api['endpoint'], "status": api.get('status_code')} for api in failed]
    }
    
    with open('api_discovery_results.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n💾 Results saved to: api_discovery_results.json")
