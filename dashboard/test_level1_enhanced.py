#!/usr/bin/env python3
"""
Test Level 1 API - Enhanced S3 Employee Search
Test the enhanced search that looks in S3 when database search fails
"""

import urllib.request
import json

def test_level1_enhanced():
    """Test Level 1 API with enhanced S3 search"""
    
    test_queries = [
        ("haseeb", "Should find from database"),
        ("nawaz", "Should find from S3 direct search"),
        ("deniz", "Should find deniz_at_deluxebilisim.com"),
        ("nonexistent", "Should return empty results")
    ]
    
    print("Testing Level 1 API - Enhanced S3 Employee Search")
    print("=" * 60)
    
    for search_query, description in test_queries:
        print(f"\n🔍 Testing: '{search_query}' ({description})")
        print("-" * 40)
        
        url = f"http://127.0.0.1:8000/api/users/s3-suggestions/?q={search_query}&limit=10"
        
        try:
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
            
            success = data.get('success', False)
            message = data.get('message', '')
            suggestions = data.get('data', {}).get('suggestions', [])
            
            print(f"✅ Success: {success}")
            print(f"📝 Message: {message}")
            print(f"📊 Found: {len(suggestions)} suggestions")
            
            if suggestions:
                print(f"📋 Results:")
                for i, suggestion in enumerate(suggestions, 1):
                    print(f"  {i}. {suggestion.get('display_name')} ({suggestion.get('email')})")
                    print(f"     📸 Screenshots: {suggestion.get('screenshot_count')}")
                    print(f"     🆔 Staff ID: {suggestion.get('staff_id')}")
                    print(f"     📱 Active: {suggestion.get('has_recent_activity')}")
            else:
                print("❌ No suggestions found")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✅ Enhanced Level 1 API Test Complete!")

if __name__ == "__main__":
    test_level1_enhanced()
