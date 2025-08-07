"""
Debug API Test - Find Amir's correct email format and test intervals
"""

import requests
import json

def test_api_debug():
    print("🔍 DEBUGGING AMIR'S EMAIL FORMAT")
    print("=" * 50)
    
    # Step 1: Test basic API health
    print("1️⃣ Testing API Health...")
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            print("✅ API is healthy!")
            health_data = response.json()
            print(f"   Version: {health_data.get('version', 'N/A')}")
            print(f"   Data Available: {health_data.get('data_available', False)}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return
    
    # Step 2: Get all users to find Amir's exact email
    print("\n2️⃣ Finding Amir's exact email format...")
    try:
        response = requests.get("http://localhost:5000/api/screenshots/all")
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'user_counts' in data['data']:
                user_counts = data['data']['user_counts']
                print(f"✅ Found {len(user_counts)} users")
                
                # Find users with "amir" in their email
                amir_users = []
                for email, count in user_counts.items():
                    if 'amir' in email.lower():
                        amir_users.append((email, count))
                        print(f"   🎯 Found: {email} ({count} screenshots)")
                
                if not amir_users:
                    print("❌ No users found with 'amir' in email")
                    print("📋 Available users:")
                    for email, count in list(user_counts.items())[:10]:  # Show first 10
                        print(f"   - {email} ({count})")
                    return
                
                # Test intervals for each Amir user found
                for email, count in amir_users:
                    print(f"\n3️⃣ Testing intervals for: {email}")
                    test_intervals(email)
                    
            else:
                print("❌ Unexpected data structure in response")
        else:
            print(f"❌ Failed to get users: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting users: {e}")

def test_intervals(email):
    """Test intervals endpoint for specific email"""
    url = f"http://localhost:5000/api/screenshots/user/{email}/intervals"
    print(f"🔗 Testing: {url}")
    
    try:
        response = requests.get(url, timeout=30)
        print(f"📊 Status: {response.status_code}")
        print(f"⏱️  Time: {response.elapsed.total_seconds():.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            
            if data.get('status') == 'success':
                print(f"   📸 Screenshots: {data.get('total_screenshots', 0)}")
                if 'interval_statistics' in data:
                    stats = data['interval_statistics']
                    print(f"   ⏱️  Avg Interval: {stats.get('average_interval_minutes', 0):.2f} min")
                    print(f"   📊 Total Intervals: {stats.get('total_intervals', 0)}")
            elif data.get('status') == 'no_data':
                print("   ⚠️  No screenshot data found")
            elif data.get('status') == 'error':
                print(f"   ❌ Error: {data.get('error', 'Unknown')}")
            else:
                print(f"   ❓ Status: {data.get('status', 'Unknown')}")
                
        elif response.status_code == 404:
            print("❌ 404 - Endpoint not found (check route)")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            
    except requests.exceptions.Timeout:
        print("⏱️  TIMEOUT (>30s) - Large dataset processing")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api_debug()
