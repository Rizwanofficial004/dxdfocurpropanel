"""
Test Employee Folders API
Testing: http://localhost:8000/api/screenshots/employee/{employeeEmail}/folders/
"""

import requests
import time
import json

def test_employee_folders_api():
    print("📁 TESTING EMPLOYEE FOLDERS API")
    print("=" * 60)
    print("🎯 Endpoint: http://localhost:8000/api/screenshots/employee/{employeeEmail}/folders/")
    print()
    
    # Test employees to check
    test_employees = [
        'beyza-donmez-@hotmail.com',
        'danish.ali9801@gmail.com', 
        'haseebcodejourney@gmail.com',
        'amirishaque67@gmail.com',
        'invalid-email@test.com'  # Test invalid email
    ]
    
    for i, email in enumerate(test_employees, 1):
        print(f"{i}️⃣ TESTING: {email}")
        print("-" * 50)
        
        start_time = time.time()
        
        try:
            # Build the URL with employee email
            url = f"http://localhost:8000/api/screenshots/employee/{email}/folders/"
            
            print(f"🔗 URL: {url}")
            
            response = requests.get(url, timeout=10)
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            
            print(f"⏱️  Response Time: {response_time:.1f} ms")
            print(f"📊 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"✅ SUCCESS! JSON Response received")
                    
                    # Check response structure
                    if isinstance(data, dict):
                        print(f"📋 Response Keys: {list(data.keys())}")
                        
                        # Look for common keys
                        if 'folders' in data:
                            folders = data['folders']
                            print(f"📁 Total Folders: {len(folders)}")
                            
                            # Show first few folders
                            for j, folder in enumerate(folders[:3]):
                                print(f"   {j+1}. {folder}")
                        
                        if 'employee' in data:
                            emp_data = data['employee']
                            print(f"👤 Employee Data: {emp_data}")
                        
                        if 'total_folders' in data:
                            print(f"📊 Total Folders Count: {data['total_folders']}")
                        
                        if 'message' in data:
                            print(f"💬 Message: {data['message']}")
                    
                    elif isinstance(data, list):
                        print(f"📋 Response is a list with {len(data)} items")
                        
                        # Show first few items
                        for j, item in enumerate(data[:3]):
                            print(f"   {j+1}. {item}")
                    
                    else:
                        print(f"📋 Response Type: {type(data)}")
                        print(f"📋 Response: {str(data)[:200]}...")
                        
                except json.JSONDecodeError:
                    print(f"❌ Invalid JSON Response")
                    print(f"📋 Raw Response: {response.text[:200]}...")
                    
            elif response.status_code == 404:
                print(f"❌ Not Found - Employee might not exist")
                print(f"📋 Response: {response.text}")
                
            elif response.status_code == 500:
                print(f"❌ Server Error")
                print(f"📋 Response: {response.text[:200]}...")
                
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"📋 Response: {response.text[:200]}...")
            
        except requests.exceptions.ConnectRefused:
            print(f"❌ Connection Refused - Server not running on port 8000")
            
        except requests.exceptions.Timeout:
            print(f"❌ Request Timeout - Server took too long to respond")
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print()
    
    print("🔍 CHECKING IF SERVER IS RUNNING:")
    print("-" * 50)
    
    try:
        # Test if port 8000 is listening
        test_url = "http://localhost:8000/"
        response = requests.get(test_url, timeout=3)
        print(f"✅ Server is running on port 8000")
        print(f"📊 Root response: {response.status_code}")
        
    except requests.exceptions.ConnectionError:
        print(f"❌ No server running on port 8000")
        print(f"💡 You need to start your Django/Flask server first")
        
    except Exception as e:
        print(f"⚠️  Server check error: {str(e)}")

if __name__ == "__main__":
    test_employee_folders_api()
