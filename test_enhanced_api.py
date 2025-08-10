"""
Test script for Enhanced Folder Screenshots API
"""
import requests
import json

def test_enhanced_api():
    """Test the enhanced folder screenshots API"""
    
    base_url = "http://localhost:8000"
    
    test_cases = [
        {
            "name": "Basic Test",
            "url": f"{base_url}/api/screenshots/employee/test@example.com/folder/2025-01-15/enhanced/?page=1&limit=10",
            "description": "Test with valid email and date folder"
        },
        {
            "name": "Different Email",
            "url": f"{base_url}/api/screenshots/employee/haseebcodejourney@gmail.com/folder/work_folder/enhanced/?page=1&limit=5",
            "description": "Test with different email and custom folder"
        },
        {
            "name": "Pagination Test",
            "url": f"{base_url}/api/screenshots/employee/admin@dds.com/folder/test-folder/enhanced/?page=2&limit=20",
            "description": "Test pagination with page 2"
        },
        {
            "name": "Large Limit",
            "url": f"{base_url}/api/screenshots/employee/user@company.com/folder/screenshots/enhanced/?page=1&limit=100",
            "description": "Test with maximum limit"
        }
    ]
    
    print("🧪 Enhanced Folder Screenshots API Test")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}️⃣ {test_case['name']}")
        print(f"   {test_case['description']}")
        print(f"   URL: {test_case['url']}")
        
        try:
            response = requests.get(test_case['url'], timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ SUCCESS")
                print(f"   Message: {data.get('message', 'N/A')}")
                
                if 'data' in data and 'pagination' in data['data']:
                    pagination = data['data']['pagination']
                    print(f"   Screenshots: {pagination.get('total_screenshots', 0)}")
                    print(f"   Page: {pagination.get('current_page', 0)}/{pagination.get('total_pages', 0)}")
                    
                if 'data' in data and 'performance' in data['data']:
                    performance = data['data']['performance']
                    print(f"   Processing time: {performance.get('total_processing_time_ms', 0):.1f}ms")
                    
            elif response.status_code == 400:
                print(f"   ❌ BAD REQUEST (400)")
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
            print(f"   Request took longer than 10 seconds")
            
        except Exception as e:
            print(f"   ❌ EXCEPTION: {e}")
    
    print(f"\n🎯 Test Summary:")
    print(f"   All tests completed")
    print(f"   API endpoint: /api/screenshots/employee/{{email}}/folder/{{folderName}}/enhanced/")
    print(f"   Parameters: page={{page}}&limit={{limit}}")

if __name__ == "__main__":
    test_enhanced_api()
