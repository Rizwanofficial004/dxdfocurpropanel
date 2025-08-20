import requests
import json

# Test all the API endpoints
base_url = "http://127.0.0.1:8001"

endpoints = [
    "/api/health",
    "/api/projects/1",
    "/api/staffs",
    "/api/tasks/1",
    "/api/customers/1",
    "/api/invoices/1",
    "/api/dashboard/summary"
]

print("🧪 Testing Python FastAPI Server Endpoints...")
print("=" * 60)

for endpoint in endpoints:
    try:
        url = f"{base_url}{endpoint}"
        print(f"\n📍 Testing: {endpoint}")
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            
            # Show key data structure
            if endpoint == "/api/projects/1":
                print("📋 Project Response:")
                print(json.dumps(data, indent=2))
            elif endpoint == "/api/staffs":
                print(f"👥 Staff Count: {len(data.get('data', {}).get('staffs', []))}")
                print(f"📊 Statistics: {data.get('data', {}).get('statistics', {})}")
            elif endpoint == "/api/dashboard/summary":
                print("📊 Dashboard Summary Keys:")
                summary_data = data.get('data', {})
                for key in summary_data.keys():
                    print(f"  - {key}")
            else:
                print(f"🔍 Response Keys: {list(data.keys())}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("-" * 40)

print("\n🎉 API Testing Complete!")
print(f"🌐 API Documentation: {base_url}/docs")
print(f"📊 Dashboard Summary: {base_url}/api/dashboard/summary")
