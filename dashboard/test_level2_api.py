#!/usr/bin/env python3
"""
Test Level 2 API - Employee Task Folders
"""

import requests
import json

def test_level2_api():
    """Test the Level 2 API with haseebcodejourney@gmail.com"""
    
    url = "http://127.0.0.1:8000/api/screenshots/employee/haseebcodejourney@gmail.com/folders/"
    
    print("Testing Level 2 API - Employee Task Folders")
    print(f"URL: {url}")
    print("-" * 60)
    
    try:
        response = requests.get(url)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            data = response.json()
            print("Response JSON:")
            print(json.dumps(data, indent=2))
            
            # Extract key information
            if 'data' in data:
                folders = data['data'].get('task_folders', [])
                summary = data['data'].get('summary', {})
                
                print(f"\nSummary:")
                print(f"- Total folders: {summary.get('total_folders', 0)}")
                print(f"- Total screenshots: {summary.get('total_screenshots', 0)}")
                print(f"- Active folders: {summary.get('active_folders', 0)}")
                
                if folders:
                    print(f"\nFolder List:")
                    for i, folder in enumerate(folders[:5], 1):
                        print(f"  {i}. {folder.get('folder_name')} ({folder.get('screenshot_count', 0)} screenshots)")
                else:
                    print("\nNo folders found!")
        else:
            print(f"Error Response:")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_level2_api()
