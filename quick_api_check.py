print("Testing API connection...")

try:
    import requests
    url = "http://127.0.0.1:8001/api/actual-count-total/screenshots/"
    
    print(f"Making request to: {url}")
    response = requests.get(url, timeout=5)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        import json
        data = response.json()
        print("✅ API SUCCESS!")
        print(f"Users: {data.get('total_users')}")
        print(f"Screenshots: {data.get('total_screenshots'):,}")
        print(f"Status: {data.get('status')}")
        
        if data.get('users'):
            top_user = data['users'][0]
            print(f"Top user: {top_user.get('user_email')} - {top_user.get('screenshot_count'):,} screenshots")
        
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text[:200])

except Exception as e:
    print(f"❌ Error: {e}")
    
print("Test complete!")
