#!/usr/bin/env python3
"""
Quick test for dds-admin login only
"""
import urllib.request
import json

def test_dds_admin_login():
    url = "https://dxdtime.ddsolutions.io/api/auth/login/"
    credentials = {"username": "dds-admin", "password": "123456"}
    
    print(f"🔄 Testing: {url}")
    print(f"📤 Credentials: {credentials}")
    
    json_data = json.dumps(credentials).encode('utf-8')
    req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            status = response.getcode()
            response_data = response.read().decode('utf-8')
            
            print(f"✅ Status: {status}")
            print(f"📄 Response: {response_data}")
            
            if status == 200:
                print("🎉 LOGIN SUCCESSFUL!")
                try:
                    data = json.loads(response_data)
                    if 'data' in data and 'user' in data['data']:
                        user = data['data']['user']
                        print(f"👤 User: {user.get('username')}")
                        print(f"📧 Email: {user.get('email')}")
                        print(f"🛡️ Is Superuser: {user.get('is_superuser')}")
                except:
                    pass
            return True
            
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error: {e.code} - {e.reason}")
        try:
            error_data = e.read().decode('utf-8')
            print(f"📄 Error: {error_data}")
        except:
            pass
        return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_dds_admin_login()
