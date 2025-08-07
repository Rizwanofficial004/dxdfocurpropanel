import requests
import json

# Test Configuration APIs
BASE_URL = "http://127.0.0.1:8000/api"
LOGIN_URL = "http://127.0.0.1:8000/api/auth/login/"

def login_and_get_session():
    """Login and get session for authenticated requests"""
    print("🔐 Authenticating...")
    
    session = requests.Session()
    
    # First get the login page to get CSRF token
    login_page_response = session.get("http://127.0.0.1:8000/")
    
    # Extract CSRF token from the response
    csrf_token = None
    if 'csrfmiddlewaretoken' in login_page_response.text:
        import re
        csrf_match = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', login_page_response.text)
        if csrf_match:
            csrf_token = csrf_match.group(1)
            print(f"CSRF Token: {csrf_token[:20]}...")
    
    # Try login via regular form POST
    login_data = {
        "username": "admin",
        "password": "admin123",
        "csrfmiddlewaretoken": csrf_token
    }
    
    try:
        # Use the regular login endpoint
        response = session.post("http://127.0.0.1:8000/", data=login_data)
        print(f"Login Status Code: {response.status_code}")
        
        # Check if we're redirected or if login was successful
        if response.status_code == 302 or 'dashboard' in response.url or response.status_code == 200:
            print("✅ Authentication successful!")
            return session
        else:
            print(f"❌ Login failed: Status {response.status_code}")
            # Try API login as fallback
            api_login_data = {
                "username": "admin",
                "password": "admin123"
            }
            api_response = session.post(LOGIN_URL, json=api_login_data)
            if api_response.status_code == 200:
                result = api_response.json()
                if result.get('success', False):
                    print("✅ API Authentication successful!")
                    return session
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
    
    return None

def test_configuration_apis():
    print("🔧 Testing Configuration Settings APIs")
    print("=" * 50)
    
    # Get authenticated session
    session = login_and_get_session()
    if not session:
        print("❌ Cannot proceed without authentication")
        return
    
    # Test 1: GET All Configurations
    print("\n1. Testing GET All Configurations")
    print("Endpoint: GET /api/configurations/")
    try:
        response = session.get(f"{BASE_URL}/configurations/")
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
        
        if response.status_code == 200:
            # Check if response is HTML (redirect to login) or JSON
            if 'application/json' in response.headers.get('content-type', ''):
                data = response.json()
                print("✅ SUCCESS")
                print(f"Response: {json.dumps(data, indent=2)}")
            else:
                print("❌ FAILED: Received HTML instead of JSON (likely redirected to login)")
                print(f"First 200 chars of response: {response.text[:200]}")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test 2: GET Configurations by Type - Upload
    print("\n2. Testing GET Configurations by Type (Upload)")
    print("Endpoint: GET /api/configurations/type/upload/")
    try:
        response = session.get(f"{BASE_URL}/configurations/type/upload/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test 3: GET Configurations by Type - Database
    print("\n3. Testing GET Configurations by Type (Database)")
    print("Endpoint: GET /api/configurations/type/database/")
    try:
        response = session.get(f"{BASE_URL}/configurations/type/database/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test 4: GET Configurations by Type - AWS
    print("\n4. Testing GET Configurations by Type (AWS)")
    print("Endpoint: GET /api/configurations/type/aws/")
    try:
        response = session.get(f"{BASE_URL}/configurations/type/aws/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test 5: GET Configuration by ID
    print("\n5. Testing GET Configuration by ID")
    print("Endpoint: GET /api/configurations/1/")
    try:
        response = session.get(f"{BASE_URL}/configurations/1/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test 6: POST Create New Configuration
    print("\n6. Testing POST Create New Configuration")
    print("Endpoint: POST /api/configurations/")
    test_config = {
        "name": "Test API Configuration",
        "type": "upload",
        "description": "Test configuration created via API",
        "config_data": {
            "max_file_size": "2MB",
            "allowed_file_types": ["jpg", "png"],
            "upload_path": "/test/uploads/"
        }
    }
    try:
        response = session.post(
            f"{BASE_URL}/configurations/", 
            json=test_config,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Response: {json.dumps(data, indent=2)}")
            # Store the created ID for update test
            global created_id
            created_id = data.get('data', {}).get('id')
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test 7: PUT Update Configuration
    print("\n7. Testing PUT Update Configuration")
    print("Endpoint: PUT /api/configurations/{id}/")
    if 'created_id' in globals() and created_id:
        update_data = {
            "name": "Updated Test API Configuration",
            "config_data": {
                "max_file_size": "5MB",
                "allowed_file_types": ["jpg", "png", "gif"]
            }
        }
        try:
            response = session.put(
                f"{BASE_URL}/configurations/{created_id}/", 
                json=update_data,
                headers={'Content-Type': 'application/json'}
            )
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS")
                print(f"Response: {json.dumps(data, indent=2)}")
            else:
                print(f"❌ FAILED: {response.text}")
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
    else:
        print("❌ SKIPPED: No created ID available for update test")
    
    # Test 8: GET Configuration by Name
    print("\n8. Testing GET Configuration by Name")
    print("Endpoint: GET /api/configurations/name/{name}/")
    config_name = "Default Upload Settings"
    try:
        # URL encode the name
        import urllib.parse
        encoded_name = urllib.parse.quote(config_name)
        response = session.get(f"{BASE_URL}/configurations/name/{encoded_name}/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Configuration API Testing Complete!")

if __name__ == "__main__":
    test_configuration_apis()
