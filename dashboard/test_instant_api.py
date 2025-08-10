"""
Test the instant API responses
"""

import os
import json
from django_instant_api import InstantScreenshotReader

def test_instant_api():
    print("🧪 TESTING INSTANT SCREENSHOT API")
    print("=" * 40)
    
    reader = InstantScreenshotReader()
    
    # Test 1: Get all data
    print("📊 Test 1: Getting all screenshot data...")
    all_data = reader.get_cached_data()
    
    if 'error' in all_data:
        print(f"❌ Error: {all_data['error']}")
        print("💡 Make sure to run the service first!")
        return
    
    print(f"✅ Success! Found data for {len(all_data['data']['user_counts'])} users")
    print(f"📅 Last updated: {all_data['last_updated']}")
    
    # Test 2: Get specific user (Beyza)
    print("\\n🎯 Test 2: Getting Beyza's count...")
    user_counts = all_data['data']['user_counts']
    
    for email, count in user_counts.items():
        if 'beyza' in email.lower():
            print(f"✅ Found: {email} = {count:,} screenshots")
            break
    else:
        print("❌ Beyza not found")
    
    # Test 3: Show top 5 users
    print("\\n🏆 Test 3: Top 5 users...")
    sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
    
    for i, (email, count) in enumerate(sorted_users[:5], 1):
        print(f"   {i}. {email:<35} {count:,}")
    
    print(f"\\n⚡ API Response Time: INSTANT (reading from cached file)")
    print(f"📁 Data file size: {os.path.getsize(reader.data_file) / 1024:.1f} KB")

if __name__ == "__main__":
    test_instant_api()
