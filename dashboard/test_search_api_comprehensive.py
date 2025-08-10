"""
Test script for Screenshots Search API
"""
import requests
import json
from datetime import datetime

def test_search_api():
    """Test the screenshots search API with different patterns"""
    
    base_url = "http://localhost:8000"
    
    test_cases = [
        {
            "name": "Pattern 1 - Quick Name Search",
            "url": f"{base_url}/api/screenshots/search/?search=Haseeb&limit=10",
            "description": "Search by name only"
        },
        {
            "name": "Pattern 1 - Email Search",
            "url": f"{base_url}/api/screenshots/search/?search=haseebcodejourney@gmail.com&limit=5",
            "description": "Search by email address"
        },
        {
            "name": "Pattern 2 - Name + Date Search",
            "url": f"{base_url}/api/screenshots/search/?search=test&date=2025-01-15&limit=10",
            "description": "Search by name with specific date"
        },
        {
            "name": "Pattern 2 - Email + Date Search", 
            "url": f"{base_url}/api/screenshots/search/?search=admin@dds.com&date=2025-07-31&limit=10",
            "description": "Search by email with today's date"
        },
        {
            "name": "Pattern 3 - Comprehensive S3 Search",
            "url": f"{base_url}/api/screenshots/search/?search=user&scan_s3=true&limit=20",
            "description": "Deep S3 scan for all screenshots"
        },
        {
            "name": "Show All Available Patterns",
            "url": f"{base_url}/api/screenshots/search/",
            "description": "No parameters - shows available patterns"
        },
        {
            "name": "Invalid Date Format",
            "url": f"{base_url}/api/screenshots/search/?search=test&date=2025-1-1&limit=10",
            "description": "Test error handling for invalid date"
        },
        {
            "name": "Large Limit Test",
            "url": f"{base_url}/api/screenshots/search/?search=admin&limit=100",
            "description": "Test with higher limit"
        }
    ]
    
    print("🔍 Screenshots Search API Test")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}️⃣ {test_case['name']}")
        print(f"   {test_case['description']}")
        print(f"   URL: {test_case['url']}")
        
        try:
            response = requests.get(test_case['url'], timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS")
                print(f"   Message: {data.get('message', 'N/A')}")
                
                if 'data' in data:
                    response_data = data['data']
                    
                    # Check for search results
                    if 'search_results' in response_data:
                        results = response_data['search_results']
                        print(f"   Results found: {len(results)}")
                        
                        if results:
                            first_result = results[0]
                            if 'employee_info' in first_result:
                                emp_info = first_result['employee_info']
                                print(f"   First result: {emp_info.get('name', 'N/A')} ({emp_info.get('email', 'N/A')})")
                            
                            if 'screenshots_count' in first_result:
                                print(f"   Screenshots: {first_result['screenshots_count']}")
                    
                    # Check for available patterns (when no search provided)
                    if 'available_patterns' in response_data:
                        patterns = response_data['available_patterns']
                        print(f"   Available patterns: {len(patterns)}")
                        for pattern in patterns:
                            print(f"     - Pattern {pattern['pattern']}: {pattern['description']}")
                    
                    # Check for performance info
                    if 'performance' in response_data:
                        perf = response_data['performance']
                        print(f"   Processing time: {perf.get('total_time_ms', 0):.1f}ms")
                        
            elif response.status_code == 400:
                print(f"   ⚠️ BAD REQUEST (400)")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('message', 'Unknown error')}")
                except:
                    print(f"   Raw error: {response.text}")
                    
            elif response.status_code == 500:
                print(f"   ❌ SERVER ERROR (500)")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('message', 'Internal server error')}")
                except:
                    print(f"   Raw error: {response.text}")
                    
            else:
                print(f"   ❌ HTTP {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ CONNECTION ERROR")
            print(f"   Server not running on localhost:8000")
            break
            
        except requests.exceptions.Timeout:
            print(f"   ❌ TIMEOUT")
            print(f"   Request took longer than 15 seconds")
            
        except Exception as e:
            print(f"   ❌ EXCEPTION: {e}")
    
    print(f"\n🎯 Search API Summary:")
    print(f"   Endpoint: /api/screenshots/search/")
    print(f"   Pattern 1: ?search={{term}}&limit={{limit}}")
    print(f"   Pattern 2: ?search={{term}}&date={{YYYY-MM-DD}}&limit={{limit}}")
    print(f"   Pattern 3: ?search={{term}}&scan_s3=true&limit={{limit}}")
    print(f"   Current date for testing: {datetime.now().strftime('%Y-%m-%d')}")

if __name__ == "__main__":
    test_search_api()
