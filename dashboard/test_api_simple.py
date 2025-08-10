import requests

# Test the daily screenshot analytics API
url = "http://127.0.0.1:8000/api/analytics/daily-screenshots/"
print(f"Testing API: {url}")

try:
    response = requests.get(url, timeout=15)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data.get('success')}")
        
        if data.get('success'):
            employees = data.get('data', {}).get('employees', [])
            summary = data.get('data', {}).get('summary', {})
            
            print(f"✅ Found {len(employees)} employees")
            print(f"📊 Total Screenshots: {summary.get('total_screenshots', 0):,}")
            print(f"📊 Average Screenshots: {summary.get('average_screenshots', 0)}")
            print(f"📊 Max Screenshots: {summary.get('max_screenshots', 0):,}")
            print(f"📊 Min Screenshots: {summary.get('min_screenshots', 0):,}")
            
            # Show first 3 employees
            print("\n👥 First 3 employees:")
            for i, emp in enumerate(employees[:3], 1):
                emp_info = emp.get('employee', {})
                print(f"  {i}. {emp_info.get('email')}: {emp.get('total_screenshots', 0):,}")
                
        else:
            print(f"❌ API Error: {data.get('message')}")
    else:
        print(f"❌ HTTP Error: {response.status_code}")
        print(f"Response: {response.text[:300]}")
        
except Exception as e:
    print(f"❌ Error: {e}")
