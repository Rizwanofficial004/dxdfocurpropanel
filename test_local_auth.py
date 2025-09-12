#!/usr/bin/env python3
"""
Local Authentication API Test Script
Test both registration and login on local Django server
"""

import requests
import json
import time
from datetime import datetime

# Local server configuration
BASE_URL = "http://127.0.0.1:8002/api"
HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

def print_separator(title):
    """Print a nice separator with title"""
    print("\n" + "="*60)
    print(f"🧪 {title}")
    print("="*60)

def print_result(success, message, data=None):
    """Print test result with formatting"""
    status = "✅ SUCCESS" if success else "❌ FAILED"
    print(f"{status}: {message}")
    if data:
        print(f"📄 Response: {json.dumps(data, indent=2)}")

def test_registration():
    """Test user registration on local server"""
    print_separator("Testing Registration API Locally")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    test_email = f"localtest_{timestamp}@example.com"
    
    registration_data = {
        "username": test_email,
        "email": test_email,
        "password": "TestPassword123",
        "password_confirm": "TestPassword123",
        "first_name": "Local",
        "last_name": "Test",
        "organization_name": "Local Test Organization",
        "country": "USA"
    }
    
    try:
        print(f"📧 Testing with email: {test_email}")
        print(f"🔗 URL: {BASE_URL}/auth/register/")
        
        response = requests.post(
            f"{BASE_URL}/auth/register/",
            headers=HEADERS,
            json=registration_data,
            timeout=10
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            token = data.get('token', '')
            print_result(True, "Registration successful!", {
                'user_id': data.get('user', {}).get('id'),
                'email': data.get('user', {}).get('email'),
                'token': f"{token[:20]}..." if token else "No token"
            })
            return {
                'success': True,
                'email': test_email,
                'password': "TestPassword123",
                'token': token
            }
        else:
            try:
                error_data = response.json()
                print_result(False, f"Registration failed with {response.status_code}", error_data)
            except:
                print_result(False, f"Registration failed with {response.status_code}", {"error": response.text})
            return {'success': False}
            
    except requests.exceptions.ConnectionError:
        print_result(False, "Could not connect to local server. Is Django running on http://127.0.0.1:8001?")
        return {'success': False}
    except Exception as e:
        print_result(False, f"Registration test error: {str(e)}")
        return {'success': False}

def test_login(email, password):
    """Test user login on local server"""
    print_separator("Testing Login API Locally")
    
    # Test both field formats
    login_formats = [
        {"email": email, "password": password},  # Original format
        {"email_or_username": email, "password": password}  # Fixed format
    ]
    
    for i, login_data in enumerate(login_formats, 1):
        field_name = "email" if "email" in login_data else "email_or_username"
        print(f"\n🔐 Test {i}/2: Login with '{field_name}' field")
        print(f"📧 Email: {email}")
        print(f"🔗 URL: {BASE_URL}/auth/login/")
        
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login/",
                headers=HEADERS,
                json=login_data,
                timeout=10
            )
            
            print(f"📊 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                token = data.get('token', '')
                print_result(True, f"Login successful with '{field_name}' field!", {
                    'user_id': data.get('user', {}).get('id'),
                    'email': data.get('user', {}).get('email'),
                    'token': f"{token[:20]}..." if token else "No token"
                })
                return {'success': True, 'token': token, 'field_format': field_name}
            else:
                try:
                    error_data = response.json()
                    print_result(False, f"Login failed with {response.status_code} using '{field_name}'", error_data)
                except:
                    print_result(False, f"Login failed with {response.status_code} using '{field_name}'", {"error": response.text})
                    
        except Exception as e:
            print_result(False, f"Login test error with '{field_name}': {str(e)}")
    
    return {'success': False}

def test_authenticated_endpoint(token):
    """Test an authenticated endpoint with the token"""
    print_separator("Testing Authenticated Endpoint")
    
    auth_headers = HEADERS.copy()
    auth_headers['Authorization'] = f'Token {token}'
    
    try:
        print(f"🔗 URL: {BASE_URL}/auth/profile/")
        print(f"🔑 Using token: {token[:20]}...")
        
        response = requests.get(
            f"{BASE_URL}/auth/profile/",
            headers=auth_headers,
            timeout=10
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, "Authenticated request successful!", {
                'user': data.get('user', {})
            })
            return True
        else:
            try:
                error_data = response.json()
                print_result(False, f"Authenticated request failed with {response.status_code}", error_data)
            except:
                print_result(False, f"Authenticated request failed with {response.status_code}", {"error": response.text})
            return False
            
    except Exception as e:
        print_result(False, f"Authenticated endpoint test error: {str(e)}")
        return False

def main():
    """Run all local authentication tests"""
    print("🚀 Local Django Authentication API Testing")
    print("=" * 60)
    print("Testing both registration and login on local server")
    print("Server should be running at: http://127.0.0.1:8001")
    print()
    
    # Test registration
    reg_result = test_registration()
    
    if reg_result['success']:
        # Test login with the registered user
        login_result = test_login(reg_result['email'], reg_result['password'])
        
        # Test authenticated endpoint
        if login_result['success']:
            test_authenticated_endpoint(login_result['token'])
        elif reg_result.get('token'):
            # If login failed but we have registration token, test with that
            print(f"\n🔄 Login failed, testing with registration token...")
            test_authenticated_endpoint(reg_result['token'])
    
    print_separator("Test Summary")
    print("✅ Registration: Working (if status 201)")
    print("✅ Login: Check results above")
    print("✅ Authentication: Check results above")
    print()
    print("💡 If login fails with 'email_or_username' error:")
    print("   - The backend bug is still present locally")
    print("   - Use the fixed views.py file in your project")
    print("   - Restart the Django server")
    print()
    print("🔧 Next steps:")
    print("   1. If tests pass: Your local fix is working!")
    print("   2. If login fails: Apply the backend fix")
    print("   3. Deploy to production when local tests pass")

if __name__ == "__main__":
    main()
