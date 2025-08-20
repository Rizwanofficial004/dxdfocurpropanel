import requests
import json

def test_staffs_endpoint():
    """Test the staffs endpoint and show detailed response"""
    try:
        url = "http://127.0.0.1:8000/api/staffs"
        print("🧪 TESTING STAFFS ENDPOINT")
        print("=" * 50)
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print("\nResponse Body:")
        print("=" * 30)
        
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
            
            # Extract staff statistics if available
            if 'data' in data and 'statistics' in data['data']:
                stats = data['data']['statistics']
                print(f"\n📊 STAFFS STATISTICS:")
                print(f"Total Staff: {stats.get('total', 'N/A')}")
                print(f"Active: {stats.get('active', 'N/A')}")
                print(f"Inactive: {stats.get('inactive', 'N/A')}")
                print(f"Logged In: {stats.get('logged_in', 'N/A')}")
                
        else:
            print(f"❌ Error Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Cannot connect to server")
        print("Please check if the server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_health_endpoint():
    """Test the health endpoint to verify server is running"""
    try:
        url = "http://127.0.0.1:8000/api/health"
        print("\n🔍 TESTING HEALTH ENDPOINT")
        print("=" * 30)
        
        response = requests.get(url, timeout=5)
        print(f"Health Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Server Status: {data.get('status', 'Unknown')}")
            print("✅ Server is running!")
        else:
            print("❌ Server health check failed")
            
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")

if __name__ == "__main__":
    test_health_endpoint()
    test_staffs_endpoint()
