#!/usr/bin/env python3
"""
Test Employee Screenshot Search API

This script tests the comprehensive employee screenshot search functionality:
1. Search all employees overview
2. Search specific employee screenshots with pagination
3. Search by task folder
4. Search with date filters
5. Test task folders API

Usage:
    python test_employee_screenshot_search.py
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000/api"
SEARCH_API = f"{BASE_URL}/employees/screenshots/search/"
TASK_FOLDERS_API = f"{BASE_URL}/employees/task-folders/"

def test_all_employees_overview():
    """Test getting overview of all employees and their screenshots"""
    print("\n🔍 TEST 1: All Employees Screenshot Overview")
    print("=" * 60)
    
    try:
        response = requests.get(SEARCH_API, params={
            'limit': 5  # Show 5 employees per page
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Total Employees: {data['data']['pagination']['total_employees']}")
            print(f"📄 Current Page: {data['data']['pagination']['current_page']}")
            print(f"📈 Employees per Page: {data['data']['pagination']['employees_per_page']}")
            
            print("\n👥 Employees Overview:")
            for emp in data['data']['employees']:
                employee = emp['employee']
                print(f"   📧 {employee['name']} ({employee['email']})")
                print(f"      📸 Screenshots: {emp['screenshot_count']}")
                print(f"      🔗 Has Screenshots: {'Yes' if emp.get('has_screenshots', False) else 'No'}")
                print()
                
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_specific_employee_search():
    """Test searching screenshots for a specific employee"""
    print("\n🔍 TEST 2: Specific Employee Screenshot Search")
    print("=" * 60)
    
    # Test with a real employee from our S3 data
    test_email = "haseebcodejourney@gmail.com"  # From our S3 data
    
    try:
        response = requests.get(SEARCH_API, params={
            'email': test_email,
            'limit': 10
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            
            employee = data['data']['employee']
            print(f"👤 Employee: {employee['name']} ({employee['email']})")
            print(f"🆔 Staff ID: {employee['staff_id']}")
            
            pagination = data['data']['pagination']
            print(f"📊 Total Screenshots: {pagination['total_screenshots']}")
            print(f"📄 Current Page: {pagination['current_page']}")
            print(f"🔢 Per Page: {pagination['screenshots_per_page']}")
            print(f"➡️ Has Next: {pagination['has_next']}")
            
            print(f"\n📸 Screenshots ({len(data['data']['screenshots'])}):")
            for i, screenshot in enumerate(data['data']['screenshots'][:5], 1):  # Show first 5
                print(f"   {i}. {screenshot['filename']}")
                print(f"      📁 Task: {screenshot['task_folder']}")
                print(f"      📅 Date: {screenshot['last_modified'][:19]}")
                print(f"      📏 Size: {screenshot['size_mb']} MB")
                if screenshot['url']:
                    print(f"      🔗 URL: {screenshot['url'][:50]}...")
                print()
                
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_task_folder_search():
    """Test searching screenshots by specific task folder"""
    print("\n🔍 TEST 3: Task Folder Specific Search")
    print("=" * 60)
    
    test_email = "haseebcodejourney@gmail.com"
    # First, let's see what task folders are available
    
    try:
        # Get task folders for this employee
        folders_response = requests.get(TASK_FOLDERS_API, params={
            'email': test_email
        })
        
        if folders_response.status_code == 200:
            folders_data = folders_response.json()
            task_folders = folders_data['data']['task_folders']
            
            if task_folders:
                # Use the first task folder for testing
                test_folder = task_folders[0]['folder_name']
                print(f"🗂️ Testing with task folder: {test_folder}")
                
                # Search screenshots in this specific folder
                response = requests.get(SEARCH_API, params={
                    'email': test_email,
                    'task_folder': test_folder,
                    'limit': 5
                })
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Status: {response.status_code}")
                    print(f"📁 Folder: {test_folder}")
                    print(f"📸 Screenshots in folder: {len(data['data']['screenshots'])}")
                    
                    for i, screenshot in enumerate(data['data']['screenshots'], 1):
                        print(f"   {i}. {screenshot['filename']}")
                        print(f"      📅 {screenshot['last_modified'][:19]}")
                        print(f"      📏 {screenshot['size_mb']} MB")
                        print()
                else:
                    print(f"❌ Screenshot search failed: {response.status_code}")
            else:
                print("❌ No task folders found for this employee")
                
        else:
            print(f"❌ Task folders API failed: {folders_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_date_filter_search():
    """Test searching screenshots with date filters"""
    print("\n🔍 TEST 4: Date Filter Search")
    print("=" * 60)
    
    test_email = "haseebcodejourney@gmail.com"
    
    # Search for screenshots from the last 7 days
    date_from = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    date_to = datetime.now().strftime("%Y-%m-%d")
    
    try:
        response = requests.get(SEARCH_API, params={
            'email': test_email,
            'date_from': date_from,
            'date_to': date_to,
            'limit': 10
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📅 Date Range: {date_from} to {date_to}")
            print(f"📸 Screenshots in range: {len(data['data']['screenshots'])}")
            
            filters = data['data']['filters']
            print(f"🔍 Applied Filters:")
            print(f"   📅 From: {filters['date_from']}")
            print(f"   📅 To: {filters['date_to']}")
            
            if data['data']['screenshots']:
                print(f"\n📸 Recent Screenshots:")
                for i, screenshot in enumerate(data['data']['screenshots'][:3], 1):
                    print(f"   {i}. {screenshot['filename']}")
                    print(f"      📅 {screenshot['last_modified'][:19]}")
                    print(f"      📁 {screenshot['task_folder']}")
                    print()
            else:
                print("❌ No screenshots found in the specified date range")
                
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_task_folders_api():
    """Test the task folders API"""
    print("\n🔍 TEST 5: Employee Task Folders API")
    print("=" * 60)
    
    test_email = "haseebcodejourney@gmail.com"
    
    try:
        response = requests.get(TASK_FOLDERS_API, params={
            'email': test_email
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            
            employee = data['data']['employee']
            print(f"👤 Employee: {employee['name']} ({employee['email']})")
            print(f"📁 Total Folders: {data['data']['total_folders']}")
            
            print(f"\n🗂️ Task Folders:")
            for folder in data['data']['task_folders']:
                print(f"   📁 {folder['folder_name']}")
                print(f"      📸 Screenshots: {folder['screenshot_count']}")
                print(f"      📏 Size: {folder['total_size_mb']} MB")
                print(f"      🔗 Path: {folder['folder_path']}")
                print()
                
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_pagination():
    """Test pagination functionality"""
    print("\n🔍 TEST 6: Pagination Test")
    print("=" * 60)
    
    try:
        # Test first page
        response1 = requests.get(SEARCH_API, params={
            'limit': 2  # Very small limit to test pagination
        })
        
        if response1.status_code == 200:
            data1 = response1.json()
            pagination1 = data1['data']['pagination']
            
            print(f"✅ Page 1 Status: {response1.status_code}")
            print(f"📄 Current Page: {pagination1['current_page']}")
            print(f"📊 Total Pages: {pagination1['total_pages']}")
            print(f"👥 Employees on Page 1: {len(data1['data']['employees'])}")
            print(f"➡️ Has Next: {pagination1['has_next']}")
            
            if pagination1['has_next']:
                # Test second page
                response2 = requests.get(SEARCH_API, params={
                    'limit': 2,
                    'page': 2
                })
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    pagination2 = data2['data']['pagination']
                    
                    print(f"\n✅ Page 2 Status: {response2.status_code}")
                    print(f"📄 Current Page: {pagination2['current_page']}")
                    print(f"👥 Employees on Page 2: {len(data2['data']['employees'])}")
                    print(f"⬅️ Has Previous: {pagination2['has_previous']}")
                    
        else:
            print(f"❌ Status: {response1.status_code}")
            print(f"Error: {response1.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    """Run all tests"""
    print("🚀 Employee Screenshot Search API - Comprehensive Test Suite")
    print("=" * 80)
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"🔍 Search API: {SEARCH_API}")
    print(f"📁 Task Folders API: {TASK_FOLDERS_API}")
    
    # Run all tests
    test_all_employees_overview()
    test_specific_employee_search()
    test_task_folder_search()
    test_date_filter_search()
    test_task_folders_api()
    test_pagination()
    
    print("\n🎉 All tests completed!")
    print("=" * 80)
    print("\n📖 API Usage Examples:")
    print(f"1. All employees: GET {SEARCH_API}")
    print(f"2. Specific employee: GET {SEARCH_API}?email=user@domain.com")
    print(f"3. With task folder: GET {SEARCH_API}?email=user@domain.com&task_folder=TaskName")
    print(f"4. With date filter: GET {SEARCH_API}?email=user@domain.com&date_from=2025-01-01&date_to=2025-01-31")
    print(f"5. With pagination: GET {SEARCH_API}?page=2&limit=10")
    print(f"6. Task folders: GET {TASK_FOLDERS_API}?email=user@domain.com")

if __name__ == "__main__":
    main()
