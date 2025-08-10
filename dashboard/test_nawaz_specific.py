#!/usr/bin/env python3
"""
Test Level 1 API - Direct Nawaz Search
"""

import urllib.request
import json

def test_nawaz_search():
    """Test specifically for nawaz search"""
    
    search_query = "nawaz"
    url = f"http://127.0.0.1:8000/api/users/s3-suggestions/?q={search_query}&limit=10"
    
    print(f"🔍 Testing Level 1 API for: '{search_query}'")
    print(f"URL: {url}")
    print("-" * 50)
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
        
        print("📋 Full Response:")
        print(json.dumps(data, indent=2))
        
        success = data.get('success', False)
        message = data.get('message', '')
        suggestions = data.get('data', {}).get('suggestions', [])
        
        print(f"\n✅ Success: {success}")
        print(f"📝 Message: {message}")
        print(f"📊 Found: {len(suggestions)} suggestions")
        
        if suggestions:
            print(f"\n📋 Results:")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"  {i}. {suggestion.get('display_name')} ({suggestion.get('email')})")
                print(f"     📸 Screenshots: {suggestion.get('screenshot_count')}")
                print(f"     🆔 Staff ID: {suggestion.get('staff_id')}")
        else:
            print("\n❌ No suggestions found for 'nawaz'")
            print("Expected: nawaz@dxdglobal.com from S3")
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_nawaz_search()
