#!/usr/bin/env python3
"""
Test Level 3 API - Employee Folder Screenshots
"""

import requests
import json

def test_level3_api():
    """Test the Level 3 API with haseebcodejourney@gmail.com and a specific folder"""
    
    # Test with the "2025-06-10" folder (date folder with 324 screenshots)
    folder_name = "2025-06-10"
    url = f"http://127.0.0.1:8000/api/screenshots/employee/haseebcodejourney@gmail.com/folder/{folder_name}/"
    
    print("Testing Level 3 API - Employee Folder Screenshots")
    print(f"URL: {url}")
    print(f"Folder: {folder_name}")
    print("-" * 60)
    
    try:
        # Test with pagination
        params = {"page": 1, "limit": 10}
        response = requests.get(url, params=params)
        
        print(f"Status Code: {response.status_code}")
        print()
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract key information
            if 'data' in data:
                folder_info = data['data'].get('folder_info', {})
                screenshots = data['data'].get('screenshots', [])
                pagination = data['data'].get('pagination', {})
                
                print(f"Folder Info:")
                print(f"- Folder Name: {folder_info.get('folder_name')}")
                print(f"- Display Name: {folder_info.get('folder_display_name')}")
                print(f"- Employee: {folder_info.get('employee_name')} ({folder_info.get('employee_email')})")
                print(f"- Is Date Folder: {folder_info.get('is_date_folder')}")
                print(f"- Folder Date: {folder_info.get('folder_date')}")
                
                print(f"\nPagination:")
                print(f"- Current Page: {pagination.get('current_page')}")
                print(f"- Total Pages: {pagination.get('total_pages')}")
                print(f"- Total Screenshots: {pagination.get('total_screenshots')}")
                print(f"- Limit: {pagination.get('limit')}")
                print(f"- Has Next: {pagination.get('has_next')}")
                
                if screenshots:
                    print(f"\nFirst 5 Screenshots:")
                    for i, screenshot in enumerate(screenshots[:5], 1):
                        print(f"  {i}. {screenshot.get('filename')}")
                        print(f"     - Time: {screenshot.get('time_display')}")
                        print(f"     - App: {screenshot.get('application')}")
                        print(f"     - Size: {screenshot.get('size_mb')} MB")
                        print(f"     - URL: {screenshot.get('presigned_url', 'N/A')[:60]}...")
                else:
                    print("\nNo screenshots found!")
                    
                print(f"\nResponse Summary:")
                print(f"- Success: {data.get('success')}")
                print(f"- Message: {data.get('message')}")
                
        else:
            print(f"Error Response:")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")

def test_level3_task_folder():
    """Test Level 3 API with a task folder (non-date folder)"""
    
    # Test with the "DDSFocusPro_v1.5" folder (task folder with 445 screenshots)
    folder_name = "DDSFocusPro_v1.5"
    url = f"http://127.0.0.1:8000/api/screenshots/employee/haseebcodejourney@gmail.com/folder/{folder_name}/"
    
    print("\nTesting Level 3 API - Task Folder")
    print(f"URL: {url}")
    print(f"Folder: {folder_name}")
    print("-" * 60)
    
    try:
        # Test with pagination
        params = {"page": 1, "limit": 5}
        response = requests.get(url, params=params)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if 'data' in data:
                folder_info = data['data'].get('folder_info', {})
                screenshots = data['data'].get('screenshots', [])
                pagination = data['data'].get('pagination', {})
                
                print(f"\nTask Folder Info:")
                print(f"- Folder Name: {folder_info.get('folder_name')}")
                print(f"- Display Name: {folder_info.get('folder_display_name')}")
                print(f"- Is Date Folder: {folder_info.get('is_date_folder')}")
                
                print(f"\nScreenshots Found: {pagination.get('total_screenshots')}")
                print(f"Pages: {pagination.get('total_pages')}")
                
                if screenshots:
                    print(f"\nFirst 3 Screenshots:")
                    for i, screenshot in enumerate(screenshots[:3], 1):
                        print(f"  {i}. {screenshot.get('filename')}")
                        print(f"     - Time: {screenshot.get('time_display')}")
                        print(f"     - App: {screenshot.get('application')}")
                
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_level3_api()
    test_level3_task_folder()
