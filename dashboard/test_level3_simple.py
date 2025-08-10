#!/usr/bin/env python3
"""
Test Level 3 API - Employee Folder Screenshots
Simple Python test using urllib instead of requests
"""

import urllib.request
import json

def test_level3_api_simple():
    """Test the Level 3 API with a simple Python approach"""
    
    # Test with the "2025-06-10" folder (date folder with 324 screenshots)
    folder_name = "2025-06-10"
    url = f"http://127.0.0.1:8000/api/screenshots/employee/haseebcodejourney@gmail.com/folder/{folder_name}/?page=1&limit=5"
    
    print("Testing Level 3 API - Employee Folder Screenshots")
    print(f"URL: {url}")
    print(f"Folder: {folder_name}")
    print("-" * 60)
    
    try:
        # Make request
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
        
        print(f"Status: Success")
        print(f"Success: {data.get('success')}")
        print(f"Message: {data.get('message')}")
        
        if 'data' in data:
            folder_info = data['data'].get('folder_info', {})
            screenshots = data['data'].get('screenshots', [])
            pagination = data['data'].get('pagination', {})
            
            print(f"\n📁 Folder Info:")
            print(f"  - Name: {folder_info.get('folder_name')}")
            print(f"  - Display: {folder_info.get('folder_display_name')}")
            print(f"  - Employee: {folder_info.get('employee_name')} ({folder_info.get('employee_email')})")
            print(f"  - Is Date Folder: {folder_info.get('is_date_folder')}")
            
            print(f"\n📊 Pagination:")
            print(f"  - Current Page: {pagination.get('current_page')}")
            print(f"  - Total Pages: {pagination.get('total_pages')}")
            print(f"  - Total Screenshots: {pagination.get('total_screenshots')}")
            print(f"  - Showing: {len(screenshots)} screenshots")
            
            if screenshots:
                print(f"\n📸 Screenshots (First {len(screenshots)}):")
                for i, screenshot in enumerate(screenshots, 1):
                    print(f"  {i}. {screenshot.get('filename')}")
                    print(f"     🕒 Time: {screenshot.get('time_display')}")
                    print(f"     💻 App: {screenshot.get('application')}")
                    print(f"     📁 Size: {screenshot.get('size_mb')} MB")
                    url_preview = screenshot.get('presigned_url', 'N/A')
                    print(f"     🔗 URL: {url_preview[:50]}..." if len(url_preview) > 50 else f"     🔗 URL: {url_preview}")
                    print()
            else:
                print("\n❌ No screenshots found!")
                
        print("✅ Level 3 API Test Complete!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_level3_task_folder():
    """Test Level 3 API with a task folder"""
    
    # Test with task folder (non-date folder)
    folder_name = "DDSFocusPro_v1.5"
    url = f"http://127.0.0.1:8000/api/screenshots/employee/haseebcodejourney@gmail.com/folder/{folder_name}/?page=1&limit=3"
    
    print("\n" + "="*60)
    print("Testing Level 3 API - Task Folder")
    print(f"URL: {url}")
    print(f"Folder: {folder_name}")
    print("-" * 60)
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
        
        if 'data' in data:
            folder_info = data['data'].get('folder_info', {})
            screenshots = data['data'].get('screenshots', [])
            pagination = data['data'].get('pagination', {})
            
            print(f"📁 Task Folder: {folder_info.get('folder_display_name')}")
            print(f"📊 Total Screenshots: {pagination.get('total_screenshots')}")
            print(f"📄 Pages: {pagination.get('total_pages')}")
            
            if screenshots:
                print(f"\n📸 Sample Screenshots:")
                for i, screenshot in enumerate(screenshots, 1):
                    print(f"  {i}. {screenshot.get('filename')} ({screenshot.get('size_mb')} MB)")
            
        print("✅ Task Folder Test Complete!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_level3_api_simple()
    test_level3_task_folder()
