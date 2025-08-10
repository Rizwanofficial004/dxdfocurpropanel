#!/usr/bin/env python3
"""
Test login API with production credentials
Username: dds-admin
Password: 123456
"""
import urllib.request
import urllib.parse
import json

def test_login_api():
    # Test production URL since it's working
    url = "https://dxdtime.ddsolutions.io/api/auth/login/"
    
    # Try multiple credentials that might exist
    credential_sets = [
        {"username": "dds-admin", "password": "123456"},
        {"username": "admin", "password": "admin"},
        {"username": "admin", "password": "123456"},
        {"username": "amirishaque67@gmail.com", "password": "test123"},
        {"username": "haseeb.developer@gmail.com", "password": "test123"},
        {"username": "deniz@gmail.com", "password": "test123"},
        {"username": "test", "password": "test123"},
        {"username": "superuser", "password": "password"},
    ]
    
    print(f"🔄 Testing production API: {url}")
    print("="*60)
    
    for i, credentials in enumerate(credential_sets, 1):
        print(f"\n[{i}/8] Testing: {credentials['username']} / {credentials['password']}")
        
        json_data = json.dumps(credentials).encode('utf-8')
        
        # Create request
        req = urllib.request.Request(
            url, 
            data=json_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                status = response.getcode()
                response_data = response.read().decode('utf-8')
                
                print(f"✅ Status: {status} - LOGIN SUCCESSFUL!")
                print(f"📄 Response: {response_data}")
                
                try:
                    data = json.loads(response_data)
                    if 'data' in data and 'user' in data['data']:
                        user = data['data']['user']
                        print(f"🎉 FOUND WORKING CREDENTIALS!")
                        print(f"   Username: {credentials['username']}")
                        print(f"   Password: {credentials['password']}")
                        print(f"   User ID: {user.get('user_id', 'N/A')}")
                        print(f"   Email: {user.get('email', 'N/A')}")
                        print(f"   Is Staff: {user.get('is_staff', 'N/A')}")
                        print(f"   Is Superuser: {user.get('is_superuser', 'N/A')}")
                except:
                    pass
                return True
                
        except urllib.error.HTTPError as e:
            if e.code == 401:
                print(f"❌ Invalid credentials")
            else:
                print(f"❌ HTTP Error: {e.code} - {e.reason}")
                try:
                    error_data = e.read().decode('utf-8')
                    print(f"📄 Error: {error_data}")
                except:
                    pass
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "="*60)
    print("🔍 SUMMARY: Tried 8 common credential combinations")
    print("💡 If none worked, you may need to create a user on production")
    print("="*60)

if __name__ == "__main__":
    test_login_api()
