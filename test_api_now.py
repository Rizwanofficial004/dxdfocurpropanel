import requests
import json

print("Testing API endpoints...")

# Test 1: Health check
try:
    r = requests.get("http://127.0.0.1:8001/api/health/", timeout=5)
    print(f"Health check: {r.status_code}")
except Exception as e:
    print(f"Health check failed: {e}")

# Test 2: Main API
try:
    print("\nTesting main API...")
    r = requests.get("http://127.0.0.1:8001/api/actual-count-total/screenshots/", timeout=30)
    print(f"API Status: {r.status_code}")
    
    if r.status_code == 200:
        data = r.json()
        print("SUCCESS!")
        print(f"Users: {data.get('total_users')}")
        print(f"Screenshots: {data.get('total_screenshots')}")
        print(f"Status: {data.get('status')}")
    else:
        print(f"Error response: {r.text[:200]}")
        
except Exception as e:
    print(f"API test failed: {e}")

print("Done!")
