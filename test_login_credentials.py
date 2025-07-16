#!/usr/bin/env python3
"""
Login Test Script - Test Available User Credentials
==================================================

This script tests all available login credentials for your Django API.
"""

import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"

def test_login(username, password):
    """Test login with given credentials"""
    print(f"🔐 Testing login: {username}")
    print("-" * 40)
    
    payload = {
        "username": username,
        "password": password
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(LOGIN_URL, json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                user_data = data.get('data', {}).get('user', {})
                print(f"✅ LOGIN SUCCESS!")
                print(f"   Username: {user_data.get('username')}")
                print(f"   Email: {user_data.get('email')}")
                print(f"   Is Staff: {user_data.get('is_staff')}")
                print(f"   Is Superuser: {user_data.get('is_superuser')}")
                return True
            else:
                print(f"❌ Login failed: {data.get('message')}")
        else:
            try:
                error_data = response.json()
                print(f"❌ HTTP Error: {error_data.get('message', 'Unknown error')}")
            except:
                print(f"❌ HTTP Error: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Request Error: {str(e)}")
    
    print()
    return False

def main():
    print("🔑 Django API Login Test")
    print("=" * 50)
    print(f"Login URL: {LOGIN_URL}")
    print()
    
    # List of credentials to test
    credentials = [
        ("Admin", "admin123"),           # Common admin password
        ("admin2", "admin123"),          # Common admin password
        ("testuser", "testpass123"),     # Test user we just created
        ("Admin", "password"),           # Common password
        ("admin2", "password"),          # Common password
        ("Admin", "admin"),              # Simple admin password
        ("admin2", "admin"),             # Simple admin password
    ]
    
    successful_logins = []
    
    for username, password in credentials:
        if test_login(username, password):
            successful_logins.append((username, password))
    
    print("🎯 SUMMARY")
    print("=" * 50)
    
    if successful_logins:
        print("✅ WORKING CREDENTIALS:")
        for username, password in successful_logins:
            print(f"   Username: {username}")
            print(f"   Password: {password}")
            print()
        
        print("🌐 You can now use these credentials to:")
        print("   1. Test login API in Postman")
        print("   2. Login to Django admin panel")
        print("   3. Use in your frontend application")
        print("   4. Test all other API endpoints")
        
    else:
        print("❌ No working credentials found!")
        print("   You may need to reset passwords or create new users")

if __name__ == "__main__":
    main()
