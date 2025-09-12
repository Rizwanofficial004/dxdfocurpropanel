import requests
import json
from datetime import datetime

# Test registration
print("🧪 Testing Registration API")
print("=" * 40)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
test_email = f"localtest_{timestamp}@example.com"

registration_data = {
    "username": test_email,
    "email": test_email,
    "password": "TestPassword123",
    "password_confirm": "TestPassword123",
    "first_name": "Test",
    "last_name": "User",
    "organization_name": "Test Org",
    "country": "USA"
}

try:
    print(f"📧 Testing with: {test_email}")
    response = requests.post(
        "http://127.0.0.1:8000/api/auth/register/",
        headers={'Content-Type': 'application/json'},
        json=registration_data,
        timeout=10
    )
    
    print(f"📊 Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print("✅ Registration SUCCESS!")
        print(f"🔑 Token: {data.get('token', 'No token')[:20]}...")
        token = data.get('token')
        
        # Test login
        print("\n🧪 Testing Login API")
        print("=" * 40)
        
        # Test with email field
        login_data_email = {
            "email": test_email,
            "password": "TestPassword123"
        }
        
        print("🔐 Testing login with 'email' field...")
        login_response = requests.post(
            "http://127.0.0.1:8000/api/auth/login/",
            headers={'Content-Type': 'application/json'},
            json=login_data_email,
            timeout=10
        )
        
        print(f"📊 Status: {login_response.status_code}")
        if login_response.status_code == 200:
            print("✅ Login with 'email' field SUCCESS!")
            login_data = login_response.json()
            print(f"🔑 Login Token: {login_data.get('token', 'No token')[:20]}...")
        else:
            print("❌ Login with 'email' field FAILED")
            try:
                error = login_response.json()
                print(f"Error: {error}")
            except:
                print(f"Error: {login_response.text}")
        
        # Test with email_or_username field
        login_data_username = {
            "email_or_username": test_email,
            "password": "TestPassword123"
        }
        
        print("\n🔐 Testing login with 'email_or_username' field...")
        login_response2 = requests.post(
            "http://127.0.0.1:8000/api/auth/login/",
            headers={'Content-Type': 'application/json'},
            json=login_data_username,
            timeout=10
        )
        
        print(f"📊 Status: {login_response2.status_code}")
        if login_response2.status_code == 200:
            print("✅ Login with 'email_or_username' field SUCCESS!")
            login_data2 = login_response2.json()
            print(f"🔑 Login Token: {login_data2.get('token', 'No token')[:20]}...")
        else:
            print("❌ Login with 'email_or_username' field FAILED")
            try:
                error = login_response2.json()
                print(f"Error: {error}")
            except:
                print(f"Error: {login_response2.text}")
        
        # Test authenticated endpoint
        print("\n🧪 Testing Authenticated Endpoint")
        print("=" * 40)
        
        profile_response = requests.get(
            "http://127.0.0.1:8000/api/auth/profile/",
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Token {token}'
            },
            timeout=10
        )
        
        print(f"📊 Status: {profile_response.status_code}")
        if profile_response.status_code == 200:
            print("✅ Authenticated endpoint SUCCESS!")
            profile_data = profile_response.json()
            print(f"👤 User: {profile_data.get('user', {}).get('email', 'Unknown')}")
        else:
            print("❌ Authenticated endpoint FAILED")
            
    else:
        print("❌ Registration FAILED")
        try:
            error = response.json()
            print(f"Error: {error}")
        except:
            print(f"Error: {response.text}")

except requests.exceptions.ConnectionError:
    print("❌ Could not connect to server. Is Django running on http://127.0.0.1:8000?")
except Exception as e:
    print(f"❌ Test error: {e}")

print("\n🎉 Local Testing Complete!")
print("✅ If all tests passed: Your authentication system is working locally!")
print("✅ Deploy to production when ready!")
