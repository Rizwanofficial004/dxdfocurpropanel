#!/usr/bin/env python3
"""
Test the Django login API endpoint with curl-like functionality
"""
import requests
import json

def test_login_api():
    url = "http://localhost:8000/api/auth/login/"
    
    # Test credentials
    credentials = {
        "username": "dds-admin",
        "password": "1234"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print("🔄 Testing login API endpoint...")
    print(f"URL: {url}")
    print(f"Credentials: {credentials}")
    print("-" * 50)
    
    try:
        response = requests.post(
            url, 
            data=json.dumps(credentials),
            headers=headers,
            timeout=10
        )
        
        print(f"✅ Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        print(f"📄 Response Body:")
        
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
        if response.status_code == 200:
            print("\n🎉 LOGIN SUCCESSFUL!")
            if 'token' in response.json():
                print(f"🔑 Token: {response.json()['token']}")
        elif response.status_code == 401:
            print("\n❌ LOGIN FAILED - Invalid credentials")
        else:
            print(f"\n⚠️ UNEXPECTED RESPONSE - Status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR - Django server is not running!")
        print("Please start the Django server with: python manage.py runserver")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_login_api()
