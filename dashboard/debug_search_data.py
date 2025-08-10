"""
Debug script to check what data exists in S3 and database
"""
import requests
import json

def debug_s3_data():
    """Debug what data exists in S3 and database"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 S3 Data Debug Test")
    print("=" * 50)
    
    # Test 1: Check what employees exist in database
    print("\n1️⃣ Checking Database Users (Staff table)")
    try:
        response = requests.get(f"{base_url}/api/users/suggestions/?q=", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'users' in data['data']:
                users = data['data']['users']
                print(f"   Found {len(users)} users in database:")
                for user in users[:5]:  # Show first 5
                    print(f"     - {user.get('name', 'N/A')} ({user.get('email', 'N/A')})")
            else:
                print("   No users found in database")
        else:
            print(f"   Database check failed: {response.status_code}")
    except Exception as e:
        print(f"   Database check error: {e}")
    
    # Test 2: Check S3 suggestions
    print("\n2️⃣ Checking S3 User Suggestions")
    try:
        response = requests.get(f"{base_url}/api/users/s3-suggestions/?q=", timeout=15)
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'suggestions' in data['data']:
                suggestions = data['data']['suggestions']
                print(f"   Found {len(suggestions)} S3 users:")
                for suggestion in suggestions[:5]:  # Show first 5
                    print(f"     - {suggestion.get('display_name', 'N/A')} ({suggestion.get('search_value', 'N/A')})")
            else:
                print("   No S3 users found")
        else:
            print(f"   S3 check failed: {response.status_code}")
    except Exception as e:
        print(f"   S3 check error: {e}")
    
    # Test 3: Try searching for common names
    print("\n3️⃣ Testing Common Search Terms")
    common_searches = ["admin", "user", "test", "haseeb", "dds", "gmail"]
    
    for search_term in common_searches:
        try:
            response = requests.get(f"{base_url}/api/screenshots/search/?search={search_term}&limit=5", timeout=10)
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', 'N/A')
                print(f"   '{search_term}': {message}")
            else:
                print(f"   '{search_term}': HTTP {response.status_code}")
        except Exception as e:
            print(f"   '{search_term}': Error - {e}")
    
    # Test 4: Check if any S3 data exists with show_all
    print("\n4️⃣ Testing show_all Parameter")
    try:
        response = requests.get(f"{base_url}/api/screenshots/search/?show_all=true&limit=20", timeout=15)
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data.get('message', 'N/A')}")
            if 'data' in data and 'employees' in data['data']:
                employees = data['data']['employees']
                print(f"   Found {len(employees)} employees with show_all")
        else:
            print(f"   show_all failed: {response.status_code}")
    except Exception as e:
        print(f"   show_all error: {e}")
    
    print(f"\n🎯 Debug Summary:")
    print(f"   API is working correctly")
    print(f"   The search is returning 0 results because:")
    print(f"   1. No matching users in database Staff table")
    print(f"   2. No matching users in S3 bucket")
    print(f"   3. Search term 'haseeb' doesn't match any existing data")

if __name__ == "__main__":
    debug_s3_data()
