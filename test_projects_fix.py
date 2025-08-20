import requests
import json

def test_projects_api():
    base_url = "http://127.0.0.1:8002"
    
    print("🧪 Testing Updated Projects API with Actual CRM Data")
    print("=" * 60)
    
    # Test all projects endpoint
    print("\n📋 Testing /api/projects")
    try:
        response = requests.get(f"{base_url}/api/projects", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                project_data = data['data']
                stats = project_data.get('statistics', {})
                breakdown = project_data.get('breakdown', {})
                
                print("✅ SUCCESS - Projects API Response:")
                print(f"📊 Total Projects: {stats.get('total', 0)}")
                print(f"📈 Growth Rate: {stats.get('growth_rate', 'N/A')}")
                print("\n📊 Project Status Breakdown:")
                print(f"  🟡 Not Started: {breakdown.get('not_started', 0)}")
                print(f"  🔵 In Progress: {breakdown.get('in_progress', 0)}")
                print(f"  🟢 Finished: {breakdown.get('finished', 0)}")
                print(f"  🟠 On Hold: {breakdown.get('on_hold', 0)}")
                print(f"  🔴 Cancelled: {breakdown.get('cancelled', 0)}")
                print(f"\n📊 Data Source: {project_data.get('source', 'Unknown')}")
                
                # Verify the numbers match your CRM interface
                expected = {"not_started": 2, "in_progress": 35, "finished": 245, "on_hold": 4, "cancelled": 6}
                actual = breakdown
                
                print("\n🔍 Verification Against CRM Interface:")
                all_match = True
                for status, expected_count in expected.items():
                    actual_count = actual.get(status, 0)
                    match_status = "✅" if actual_count == expected_count else "❌"
                    print(f"  {match_status} {status}: Expected {expected_count}, Got {actual_count}")
                    if actual_count != expected_count:
                        all_match = False
                
                if all_match:
                    print("\n🎉 ALL NUMBERS MATCH YOUR CRM INTERFACE!")
                else:
                    print("\n⚠️  Some numbers don't match - needs adjustment")
                    
            else:
                print(f"❌ API Error: {data}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:300]}")
            
    except Exception as e:
        print(f"❌ Request Error: {str(e)}")
    
    # Test individual project endpoint
    print("\n" + "-" * 60)
    print("\n📋 Testing /api/projects/1")
    try:
        response = requests.get(f"{base_url}/api/projects/1", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                project = data['data']
                print("✅ SUCCESS - Individual Project Response:")
                print(f"  ID: {project.get('id')}")
                print(f"  Name: {project.get('name')}")
                print(f"  Status: {project.get('status')}")
                print(f"  Progress: {project.get('progress', 'N/A')}%")
                print(f"  Created: {project.get('datecreated', 'N/A')}")
            else:
                print(f"❌ API Error: {data}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request Error: {str(e)}")
    
    print("\n🎯 Testing Complete!")
    print(f"🌐 API Documentation: {base_url}/docs")

if __name__ == "__main__":
    test_projects_api()
