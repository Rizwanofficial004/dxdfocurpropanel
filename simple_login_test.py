"""
Simple test to check if Django server is running and responsive
"""
import urllib.request
import urllib.parse
import json

def test_server():
    url = "http://localhost:8000/api/auth/login/"
    
    # Prepare data
    data = {
        "username": "dds-admin",
        "password": "123456"
    }
    
    json_data = json.dumps(data).encode('utf-8')
    
    # Create request
    req = urllib.request.Request(
        url, 
        data=json_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        print(f"🔄 Testing: {url}")
        print(f"📤 Sending: {data}")
        
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            response_data = response.read().decode('utf-8')
            
            print(f"✅ Status: {status}")
            print(f"📤 Response: {response_data}")
            
            if status == 200:
                print("🎉 LOGIN SUCCESSFUL!")
            return True
            
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error: {e.code} - {e.reason}")
        try:
            error_data = e.read().decode('utf-8')
            print(f"📄 Error response: {error_data}")
        except:
            pass
        return False
        
    except urllib.error.URLError as e:
        print(f"❌ Connection Error: {e.reason}")
        print("🔧 Make sure Django server is running on http://localhost:8000")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_server()
