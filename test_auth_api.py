"""
Quick API Test Script for Authentication Endpoints
Tests both local and production authentication APIs
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
LOCAL_URL = "http://127.0.0.1:8000/api/auth"
PROD_URL = "https://dxdtime.ddsolutions.io/api/auth"

def test_registration(base_url, suffix=""):
    """Test registration endpoint"""
    print(f"\n🧪 Testing Registration: {base_url}/register/")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    test_data = {
        "username": f"testuser_{timestamp}{suffix}@example.com",
        "email": f"testuser_{timestamp}{suffix}@example.com",
        "password": "TestPassword123",
        "password_confirm": "TestPassword123",
        "first_name": "Test",
        "last_name": "User",
        "organization_name": "Test Organization",
        "country": "USA"
    }
    
    try:
        response = requests.post(
            f"{base_url}/register/",
            json=test_data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            token = data.get('token')
            user_email = data.get('user', {}).get('email')
            print(f"✅ Registration successful! Token: {token[:20]}...")
            return token, user_email
        else:
            print(f"❌ Registration failed")
            return None, None
            
    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return None, None

def test_login(base_url, email, password):
    """Test login endpoint with different formats"""
    print(f"\n🔐 Testing Login: {base_url}/login/")
    
    # Test format 1: email field
    test_data_email = {
        "email": email,
        "password": password
    }
    
    print(f"Testing with email field...")
    try:
        response = requests.post(
            f"{base_url}/login/",
            json=test_data_email,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"✅ Login successful! Token: {token[:20]}...")
            return token
        else:
            print(f"❌ Login with email failed")
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
    
    # Test format 2: email_or_username field
    test_data_username = {
        "email_or_username": email,
        "password": password
    }
    
    print(f"Testing with email_or_username field...")
    try:
        response = requests.post(
            f"{base_url}/login/",
            json=test_data_username,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print(f"✅ Login successful! Token: {token[:20]}...")
            return token
        else:
            print(f"❌ Login with email_or_username failed")
            
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
    
    return None

def test_authenticated_endpoint(base_url, token):
    """Test authenticated endpoint"""
    print(f"\n👤 Testing Profile: {base_url}/profile/")
    
    try:
        response = requests.get(
            f"{base_url}/profile/",
            headers={
                "Authorization": f"Token {token}",
                "Accept": "application/json"
            },
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print(f"✅ Authenticated request successful!")
            return True
        else:
            print(f"❌ Authenticated request failed")
            
    except Exception as e:
        print(f"❌ Authenticated request error: {str(e)}")
    
    return False

def main():
    """Main test function"""
    print("🎯 DDS Focus Pro - Authentication API Testing")
    print("=" * 60)
    
    # Test production server
    print(f"\n🌐 Testing Production Server: {PROD_URL}")
    print("-" * 40)
    
    prod_token, prod_email = test_registration(PROD_URL, "_prod")
    if prod_token and prod_email:
        login_token = test_login(PROD_URL, prod_email, "TestPassword123")
        if login_token:
            test_authenticated_endpoint(PROD_URL, login_token)
    
    # Test with existing user
    print(f"\n🔍 Testing with existing user")
    existing_login_token = test_login(PROD_URL, "testapi@example.com", "testpassword123")
    if existing_login_token:
        test_authenticated_endpoint(PROD_URL, existing_login_token)
    
    print(f"\n📋 Test Summary:")
    print(f"- Registration: {'✅ Working' if prod_token else '❌ Failed'}")
    print(f"- Login: {'✅ Working' if existing_login_token else '❌ Failed'}")
    print(f"- Authentication: {'✅ Working' if existing_login_token and test_authenticated_endpoint(PROD_URL, existing_login_token) else '❌ Failed'}")

if __name__ == "__main__":
    main()
