import urllib.request
import urllib.parse
import json

def test_level1_api_debug():
    """Test Level 1 API with debug for 'nawaz' search"""
    
    # API endpoint
    base_url = "http://127.0.0.1:8000/api/users/s3-suggestions/"
    
    # Test data for nawaz
    test_query = "nawaz"
    
    # Construct URL with query parameters
    params = {
        'q': test_query,
        'limit': 10
    }
    query_string = urllib.parse.urlencode(params)
    full_url = f"{base_url}?{query_string}"
    
    print(f"🔍 Testing: {full_url}")
    
    try:
        # Make the API request
        request = urllib.request.Request(full_url)
        
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            print(f"✅ API Response:")
            print(f"   Status: {result.get('success', False)}")
            print(f"   Message: {result.get('message', 'No message')}")
            print(f"   Found: {len(result.get('data', {}).get('suggestions', []))} suggestions")
            
            # Print all suggestions
            suggestions = result.get('data', {}).get('suggestions', [])
            for i, suggestion in enumerate(suggestions, 1):
                print(f"   {i}. {suggestion.get('display_name', 'N/A')} ({suggestion.get('email', 'N/A')})")
                print(f"      Screenshots: {suggestion.get('screenshot_count', 0)}")
                print(f"      Source: {suggestion.get('staff_id', 'Unknown')}")
                
            if not suggestions:
                print("❌ No suggestions found!")
                print("Expected to find: nawaz@dxdglobal.com")
            
            return result
    
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        return None

if __name__ == "__main__":
    print("🔍 Testing Level 1 API for 'nawaz' search")
    test_level1_api_debug()
