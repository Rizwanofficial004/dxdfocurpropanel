#!/usr/bin/env python3
"""
Test the Employee Task Folders API to verify it's working with populated data
"""
import requests
import json
from datetime import datetime

# API endpoint
API_BASE = "http://127.0.0.1:8000"
ENDPOINT = "/api/employees/task-folders/"

def test_employee_task_folders_api():
    """Test the employee task folders API"""
    
    print("=" * 70)
    print("🧪 TESTING EMPLOYEE TASK FOLDERS API")
    print("=" * 70)
    
    # Test 1: Get all employees
    print("\n1️⃣ Testing: Get all employees task folders")
    url = f"{API_BASE}{ENDPOINT}"
    
    try:
        response = requests.get(url, timeout=30)
        print(f"📡 Request URL: {url}")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {data.get('message', 'No message')}")
            
            employees = data.get('data', {}).get('employees', [])
            total_employees = data.get('data', {}).get('total_employees', 0)
            
            print(f"👥 Total Employees: {total_employees}")
            
            if employees:
                print(f"\n📋 Sample Employee Data:")
                sample_emp = employees[0]
                print(f"   Name: {sample_emp['employee']['name']}")
                print(f"   Email: {sample_emp['employee']['email']}")
                print(f"   Total Folders: {sample_emp['total_folders']}")
                
                if sample_emp['task_folders']:
                    print(f"   Sample Folder: {sample_emp['task_folders'][0]['folder_name']}")
                    print(f"   Screenshots in Folder: {sample_emp['task_folders'][0].get('total_screenshots', 'N/A')}")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Django server not running")
        print("💡 Please start the server with: python manage.py runserver")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test 2: Get specific employee
    print("\n2️⃣ Testing: Get specific employee (Haseeb)")
    test_email = "haseebcodejourney@gmail.com"
    url_specific = f"{API_BASE}{ENDPOINT}?email={test_email}"
    
    try:
        response = requests.get(url_specific, timeout=30)
        print(f"📡 Request URL: {url_specific}")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {data.get('message', 'No message')}")
            
            employee = data.get('data', {}).get('employee', {})
            folders = data.get('data', {}).get('task_folders', [])
            
            print(f"👤 Employee: {employee.get('name', 'Unknown')}")
            print(f"📧 Email: {employee.get('email', 'Unknown')}")
            print(f"📁 Total Folders: {len(folders)}")
            
            for folder in folders[:3]:  # Show first 3 folders
                print(f"   📂 {folder['folder_name']} ({folder.get('total_screenshots', 0)} screenshots)")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 70)
    print("🎯 API ENDPOINT SUMMARY:")
    print("=" * 70)
    print(f"🔗 All Employees: GET {API_BASE}{ENDPOINT}")
    print(f"🔗 Specific Employee: GET {API_BASE}{ENDPOINT}?email=USER_EMAIL")
    print("=" * 70)

if __name__ == "__main__":
    test_employee_task_folders_api()
