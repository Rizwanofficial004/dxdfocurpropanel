import requests
import json

def test_all_employees_apis():
    """Test both APIs to get all employees screenshot data"""
    
    print("="*60)
    print("TESTING ALL EMPLOYEE SCREENSHOT APIs")
    print("="*60)
    
    # Test 1: Daily Analytics API (Database-based)
    print("\n🧪 1. Testing Daily Analytics API:")
    print("📡 URL: http://127.0.0.1:8000/api/analytics/daily-screenshots/")
    
    try:
        response = requests.get("http://127.0.0.1:8000/api/analytics/daily-screenshots/", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            employees = data.get('data', {}).get('employees', [])
            summary = data.get('data', {}).get('summary', {})
            
            print(f"✅ SUCCESS: Found {len(employees)} employees")
            print(f"📊 Total Screenshots: {summary.get('total_screenshots', 0):,}")
            print(f"📊 Average: {summary.get('average_screenshots', 0)}")
            
            # Show all employees
            print(f"\n👥 All {len(employees)} Employees (Daily Analytics):")
            for i, emp in enumerate(employees, 1):
                emp_info = emp.get('employee', {})
                print(f"  {i:2d}. {emp_info.get('email'):35} - {emp.get('total_screenshots', 0):7,} screenshots")
                
        else:
            print(f"❌ ERROR: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
    
    print("\n" + "-"*60)
    
    # Test 2: Employee Screenshots Search API (S3-based)
    print("\n🧪 2. Testing Employee Screenshots Search API:")
    print("📡 URL: http://127.0.0.1:8000/api/employees/screenshots/search/")
    
    try:
        response = requests.get("http://127.0.0.1:8000/api/employees/screenshots/search/", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            employees = data.get('data', {}).get('employees', [])
            pagination = data.get('data', {}).get('pagination', {})
            
            print(f"✅ SUCCESS: Found {len(employees)} employees")
            print(f"📊 Total Employees: {pagination.get('total_employees', 0)}")
            
            # Calculate total screenshots
            total_screenshots = sum(emp.get('screenshot_count', 0) for emp in employees)
            print(f"📊 Total Screenshots: {total_screenshots:,}")
            
            # Show all employees
            print(f"\n👥 All {len(employees)} Employees (Screenshots Search):")
            for i, emp in enumerate(employees, 1):
                emp_info = emp.get('employee', {})
                print(f"  {i:2d}. {emp_info.get('email'):35} - {emp.get('screenshot_count', 0):7,} screenshots")
                
        else:
            print(f"❌ ERROR: Status {response.status_code}")
            print(f"Response: {response.text[:300]}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
    
    print("\n" + "="*60)
    print("COMPARISON COMPLETE!")
    print("="*60)

if __name__ == "__main__":
    test_all_employees_apis()
