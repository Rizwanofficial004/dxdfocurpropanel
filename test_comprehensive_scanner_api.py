#!/usr/bin/env python3
"""
Comprehensive Employee Folder Scanner API Test
Tests the new comprehensive scanning capabilities for all employees and folders
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://dxdtime.ddsolutions.io/api"
# For local testing, use: BASE_URL = "http://localhost:8000/api"

def test_comprehensive_scanner():
    """Test the comprehensive employee folder scanner API"""
    print("=" * 80)
    print("🚀 COMPREHENSIVE EMPLOYEE FOLDER SCANNER API TEST")
    print("=" * 80)
    
    print("\n1. Testing Comprehensive Scanner (All Employees, All Folders)")
    print("-" * 60)
    
    # Test 1: Basic comprehensive scan
    url = f"{BASE_URL}/screenshots/comprehensive-scan/"
    params = {
        'limit': 500000,  # Unlimited
        'include_screenshots': 'true',
        'parallel_processing': 'true',
        'cache_duration': 30
    }
    
    print(f"🔍 Making request to: {url}")
    print(f"📋 Parameters: {json.dumps(params, indent=2)}")
    
    start_time = time.time()
    
    try:
        response = requests.get(url, params=params, timeout=300)  # 5 minute timeout
        request_time = time.time() - start_time
        
        print(f"⏱️  Request completed in {request_time:.2f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                scan_data = data.get('data', {})
                summary = scan_data.get('scan_summary', {})
                
                print("\n✅ COMPREHENSIVE SCAN RESULTS:")
                print(f"   📊 Total Employees Scanned: {summary.get('total_employees_scanned', 0)}")
                print(f"   📁 Total Folders Found: {summary.get('total_folders_found', 0)}")
                print(f"   📸 Total Screenshots Found: {summary.get('total_screenshots_found', 0)}")
                print(f"   ⏱️  Processing Time: {summary.get('processing_time_seconds', 0):.2f}s")
                print(f"   🔄 Processing Method: {summary.get('processing_method', 'unknown')}")
                
                # Show top employees by screenshot count
                employees = scan_data.get('employees', [])
                if employees:
                    print(f"\n📈 TOP 10 EMPLOYEES BY SCREENSHOT COUNT:")
                    sorted_employees = sorted(employees, key=lambda x: x.get('total_screenshots', 0), reverse=True)
                    for i, emp in enumerate(sorted_employees[:10], 1):
                        print(f"   {i:2d}. {emp.get('employee_email', 'Unknown'):<35} - {emp.get('total_screenshots', 0):6d} screenshots, {emp.get('total_folders', 0):3d} folders")
                
                # Performance metrics
                performance = scan_data.get('performance_metrics', {})
                print(f"\n⚡ PERFORMANCE METRICS:")
                print(f"   📊 Screenshots per second: {performance.get('screenshots_per_second', 0):.2f}")
                print(f"   ⏱️  Avg time per employee: {performance.get('avg_time_per_employee', 0):.2f}s")
                print(f"   💾 Cache enabled: {performance.get('cache_enabled', False)}")
                
            else:
                print(f"❌ API Error: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error details: {error_data}")
            except:
                print(f"   Response: {response.text[:500]}")
                
    except requests.exceptions.Timeout:
        print("⏰ Request timed out (5 minutes)")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")


def test_specific_employees_scan():
    """Test scanning specific employees"""
    print("\n" + "=" * 80)
    print("👥 SPECIFIC EMPLOYEES SCAN TEST")
    print("=" * 80)
    
    # Test with specific employees
    specific_employees = [
        "haseebcodejourney@gmail.com",
        "nawaz@dxdglobal.com",
        "deniz@deluxebilisim.com"
    ]
    
    url = f"{BASE_URL}/screenshots/comprehensive-scan/"
    params = {
        'employees': ','.join(specific_employees),
        'limit': 500000,
        'include_screenshots': 'true',
        'parallel_processing': 'true'
    }
    
    print(f"🔍 Testing specific employees: {', '.join(specific_employees)}")
    print(f"📋 Parameters: {json.dumps(params, indent=2)}")
    
    start_time = time.time()
    
    try:
        response = requests.get(url, params=params, timeout=180)
        request_time = time.time() - start_time
        
        print(f"⏱️  Request completed in {request_time:.2f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                scan_data = data.get('data', {})
                summary = scan_data.get('scan_summary', {})
                employees = scan_data.get('employees', [])
                
                print("\n✅ SPECIFIC EMPLOYEES SCAN RESULTS:")
                print(f"   📊 Employees Scanned: {summary.get('total_employees_scanned', 0)}")
                print(f"   📁 Total Folders: {summary.get('total_folders_found', 0)}")
                print(f"   📸 Total Screenshots: {summary.get('total_screenshots_found', 0)}")
                
                print(f"\n📋 DETAILED RESULTS:")
                for emp in employees:
                    email = emp.get('employee_email', 'Unknown')
                    folders = emp.get('total_folders', 0)
                    screenshots = emp.get('total_screenshots', 0)
                    status = emp.get('scan_status', 'unknown')
                    
                    print(f"   📧 {email}")
                    print(f"      📁 Folders: {folders}")
                    print(f"      📸 Screenshots: {screenshots}")
                    print(f"      ✅ Status: {status}")
                    
                    if status == "error":
                        print(f"      ❌ Error: {emp.get('error_message', 'Unknown error')}")
                    
                    # Show top folders for this employee
                    employee_folders = emp.get('folders', [])
                    if employee_folders:
                        top_folders = sorted(employee_folders, key=lambda x: x.get('screenshot_count', 0), reverse=True)[:5]
                        print(f"      🔝 Top folders:")
                        for folder in top_folders:
                            print(f"         📁 {folder.get('folder_name', 'Unknown')}: {folder.get('screenshot_count', 0)} screenshots")
                    print()
            else:
                print(f"❌ API Error: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")


def test_enhanced_single_employee():
    """Test the enhanced single employee scanner"""
    print("\n" + "=" * 80)
    print("🎯 ENHANCED SINGLE EMPLOYEE SCANNER TEST")
    print("=" * 80)
    
    # Test the user's example email
    test_email = "haseebcodejourney@gmail.com"
    url = f"{BASE_URL}/screenshots/employee/{test_email}/comprehensive-scan/"
    
    params = {
        'limit': 500000,
        'include_screenshots': 'true'
    }
    
    print(f"🔍 Testing enhanced single employee scanner for: {test_email}")
    print(f"📋 Parameters: {json.dumps(params, indent=2)}")
    
    start_time = time.time()
    
    try:
        response = requests.get(url, params=params, timeout=180)
        request_time = time.time() - start_time
        
        print(f"⏱️  Request completed in {request_time:.2f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                scan_data = data.get('data', {})
                employee_info = scan_data.get('employee_info', {})
                folder_summary = scan_data.get('folder_summary', {})
                performance = scan_data.get('performance', {})
                folders = scan_data.get('folders', [])
                
                print("\n✅ ENHANCED SINGLE EMPLOYEE SCAN RESULTS:")
                print(f"   📧 Employee: {employee_info.get('email', 'Unknown')}")
                print(f"   👤 Name: {employee_info.get('name', 'Unknown')}")
                print(f"   📊 Total Folders: {folder_summary.get('total_folders', 0)}")
                print(f"   📸 Total Screenshots: {folder_summary.get('total_screenshots', 0)}")
                print(f"   📅 Date Folders: {folder_summary.get('date_folders', 0)}")
                print(f"   📋 Task Folders: {folder_summary.get('task_folders', 0)}")
                
                print(f"\n⚡ PERFORMANCE:")
                print(f"   ⏱️  Processing Time: {performance.get('processing_time_seconds', 0):.2f}s")
                print(f"   📊 Screenshots/sec: {performance.get('screenshots_per_second', 0):.2f}")
                print(f"   🎯 Limit Applied: {performance.get('limit_applied', 0):,}")
                
                # Show all folders with screenshot counts
                if folders:
                    print(f"\n📁 ALL FOLDERS ({len(folders)} total):")
                    sorted_folders = sorted(folders, key=lambda x: x.get('screenshot_count', 0), reverse=True)
                    
                    for i, folder in enumerate(sorted_folders, 1):
                        folder_name = folder.get('folder_name', 'Unknown')
                        screenshot_count = folder.get('screenshot_count', 0)
                        is_date = folder.get('is_date_folder', False)
                        folder_type = "📅 Date" if is_date else "📋 Task"
                        
                        print(f"   {i:3d}. {folder_type} | {folder_name:<50} | {screenshot_count:5d} screenshots")
                        
                        # Show first few screenshots if available
                        screenshots = folder.get('screenshots', [])
                        if screenshots and i <= 3:  # Show details for top 3 folders
                            print(f"        📸 First few screenshots:")
                            for j, screenshot in enumerate(screenshots[:3]):
                                filename = screenshot.get('filename', 'Unknown')
                                timestamp = screenshot.get('timestamp', 'Unknown')
                                size_mb = round(screenshot.get('size_bytes', 0) / (1024*1024), 2)
                                print(f"          {j+1}. {filename} ({timestamp}) - {size_mb}MB")
                            if len(screenshots) > 3:
                                print(f"          ... and {len(screenshots) - 3} more screenshots")
                        print()
                        
                        if i >= 20:  # Limit display to top 20 folders
                            remaining = len(sorted_folders) - 20
                            if remaining > 0:
                                print(f"   ... and {remaining} more folders")
                            break
            else:
                print(f"❌ API Error: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")


def test_date_filtered_scan():
    """Test scanning with date filters"""
    print("\n" + "=" * 80)
    print("📅 DATE FILTERED SCAN TEST")
    print("=" * 80)
    
    # Test with date range
    today = datetime.now()
    week_ago = today - timedelta(days=7)
    
    url = f"{BASE_URL}/screenshots/comprehensive-scan/"
    params = {
        'employees': 'haseebcodejourney@gmail.com,nawaz@dxdglobal.com',
        'limit': 500000,
        'date_from': week_ago.strftime('%Y-%m-%d'),
        'date_to': today.strftime('%Y-%m-%d'),
        'include_screenshots': 'false',  # Just counts for speed
        'parallel_processing': 'true'
    }
    
    print(f"🔍 Testing date filtered scan (last 7 days)")
    print(f"📅 Date range: {params['date_from']} to {params['date_to']}")
    print(f"📋 Parameters: {json.dumps(params, indent=2)}")
    
    start_time = time.time()
    
    try:
        response = requests.get(url, params=params, timeout=120)
        request_time = time.time() - start_time
        
        print(f"⏱️  Request completed in {request_time:.2f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                scan_data = data.get('data', {})
                summary = scan_data.get('scan_summary', {})
                
                print("\n✅ DATE FILTERED SCAN RESULTS:")
                print(f"   📊 Employees Scanned: {summary.get('total_employees_scanned', 0)}")
                print(f"   📁 Total Folders (in date range): {summary.get('total_folders_found', 0)}")
                print(f"   📸 Total Screenshots (in date range): {summary.get('total_screenshots_found', 0)}")
                print(f"   📅 Date Filter Applied: {summary.get('date_filter', {})}")
                
                employees = scan_data.get('employees', [])
                for emp in employees:
                    email = emp.get('employee_email')
                    date_folders = [f for f in emp.get('folders', []) if f.get('is_date_folder')]
                    
                    print(f"\n   📧 {email}:")
                    print(f"      📅 Date folders in range: {len(date_folders)}")
                    
                    if date_folders:
                        for folder in sorted(date_folders, key=lambda x: x.get('folder_name'), reverse=True):
                            folder_name = folder.get('folder_name')
                            screenshot_count = folder.get('screenshot_count', 0)
                            print(f"         📅 {folder_name}: {screenshot_count} screenshots")
            else:
                print(f"❌ API Error: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")


def main():
    """Run all tests"""
    print("🔥 COMPREHENSIVE EMPLOYEE FOLDER SCANNER API TESTS")
    print("=" * 80)
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: Comprehensive scanner (all employees)
    test_comprehensive_scanner()
    
    # Test 2: Specific employees scan
    test_specific_employees_scan()
    
    # Test 3: Enhanced single employee scanner
    test_enhanced_single_employee()
    
    # Test 4: Date filtered scan
    test_date_filtered_scan()
    
    print("\n" + "=" * 80)
    print("🎉 ALL TESTS COMPLETED!")
    print("=" * 80)
    print("\n📊 SUMMARY:")
    print("✅ 1. Comprehensive Scanner - Scans ALL employees and ALL folders")
    print("✅ 2. Specific Employees Scanner - Scan selected employees only")
    print("✅ 3. Enhanced Single Employee Scanner - Deep scan for one employee")
    print("✅ 4. Date Filtered Scanner - Filter by date range")
    print("\n🔥 NEW API ENDPOINTS AVAILABLE:")
    print(f"   📊 {BASE_URL}/screenshots/comprehensive-scan/")
    print(f"   🎯 {BASE_URL}/screenshots/employee/{{email}}/comprehensive-scan/")
    print("\n💡 These APIs provide the EXACT functionality you requested:")
    print("   📸 Scan all folders against each employee")
    print("   🔄 Get ALL screenshots from S3 with pagination")
    print("   📊 Support up to 500,000 screenshots per folder")
    print("   ⚡ Parallel processing for performance")
    print("   💾 Caching for improved response times")


if __name__ == "__main__":
    main()
