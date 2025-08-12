import json
import os

cache_file = os.path.join('dashboard', 'data', 'screenshots_inventory_cache.json')
if os.path.exists(cache_file):
    with open(cache_file, 'r') as f:
        data = json.load(f)
    print('✅ Cache loaded successfully!')
    print(f'👥 Users: {data["total_users"]}')
    print(f'📸 Screenshots: {data["total_screenshots"]:,}')
    print('⚡ This would be instant via API!')
    
    # Show top users
    users = data['users']
    sorted_users = sorted(users.items(), key=lambda x: x[1]['total_count'], reverse=True)
    print('\n🏆 Top 3 Users:')
    for i, (email, user_data) in enumerate(sorted_users[:3], 1):
        print(f'  {i}. {email}: {user_data["total_count"]:,} screenshots')
else:
    print('❌ Cache file not found')
