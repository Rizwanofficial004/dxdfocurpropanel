"""
Quick test to verify the search API can return data
"""
import requests
import json

def test_working_search():
    """Test the search API with a simpler endpoint to verify it works"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 Testing Search API Endpoints")
    print("=" * 50)
    
    # Test different patterns to see which one works
    test_cases = [
        {
            "name": "Pattern 1 - Simple search",
            "url": f"{base_url}/api/screenshots/search/?search=gmail&limit=5",
            "description": "Simple name search without S3 scan"
        },
        {
            "name": "User Suggestions API",
            "url": f"{base_url}/api/users/suggestions/?q=",
            "description": "Check what users exist in database"
        },
        {
            "name": "S3 User Suggestions API", 
            "url": f"{base_url}/api/users/s3-suggestions/?q=",
            "description": "Check S3 user suggestions"
        },
        {
            "name": "All Screenshots API",
            "url": f"{base_url}/api/screenshots/?limit=5",
            "description": "General screenshots API"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}️⃣ {test_case['name']}")
        print(f"   URL: {test_case['url']}")
        
        try:
            response = requests.get(test_case['url'], timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS - Status: 200")
                print(f"   Message: {data.get('message', 'N/A')}")
                
                # Show relevant data
                if 'data' in data:
                    data_content = data['data']
                    if isinstance(data_content, dict):
                        if 'users' in data_content:
                            users = data_content['users']
                            print(f"   Users found: {len(users)}")
                            for user in users[:3]:
                                print(f"     - {user.get('name', 'N/A')} ({user.get('email', 'N/A')})")
                        
                        elif 'suggestions' in data_content:
                            suggestions = data_content['suggestions']
                            print(f"   Suggestions found: {len(suggestions)}")
                            for suggestion in suggestions[:3]:
                                print(f"     - {suggestion.get('display_name', 'N/A')}")
                        
                        elif 'employees' in data_content:
                            employees = data_content['employees']
                            print(f"   Employees found: {len(employees)}")
                        
                        elif 'screenshots' in data_content:
                            screenshots = data_content['screenshots']
                            print(f"   Screenshots found: {len(screenshots)}")
                    
                    elif isinstance(data_content, list):
                        print(f"   Data items: {len(data_content)}")
                        
            else:
                print(f"   ❌ HTTP {response.status_code}")
                if response.text:
                    print(f"   Response: {response.text[:200]}...")
                    
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
    
    print(f"\n🎯 Summary:")
    print(f"   Testing multiple API endpoints to find working data sources")
    print(f"   This will help us understand where the data actually exists")

if __name__ == "__main__":
    test_working_search()
