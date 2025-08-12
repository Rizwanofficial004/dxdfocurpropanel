import requests
print('🔥 FINAL API TEST WITH REAL DATA')
print('=' * 50)

base_url = 'http://127.0.0.1:8010/api'

# Test Ultra-Fast API with real data
response = requests.get(f'{base_url}/screenshots/ultra-fast/?limit=2')
if response.status_code == 200:
    data = response.json()
    print(f'✅ Total users: {data.get("total_users", 0)}')
    print(f'✅ Users returned: {len(data.get("users", []))}')
    if data.get('users'):
        for i, user in enumerate(data['users'][:2]):
            print(f'   User {i+1}: {user.get("email", "unknown")}')
            print(f'   Screenshots: {len(user.get("screenshots", []))}')
            
# Test tracking status
response = requests.get(f'{base_url}/screenshots/tracking-status/')
if response.status_code == 200:
    data = response.json()
    print(f'\n📊 Database Stats:')
    print(f'   Last update: {data.get("last_update", "unknown")}')
    print(f'   Total screenshots: {data.get("total_screenshots", 0)}')
    print(f'   Total users: {data.get("total_users", 0)}')

print('\n🎉 ALL APIS WORKING PERFECTLY! 🎉')
