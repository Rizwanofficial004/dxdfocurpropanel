import requests
import json

def test_projects_api():
    print("🧪 Testing Projects API: http://127.0.0.1:8000/api/projects")
    print("=" * 60)
    
    try:
        response = requests.get("http://127.0.0.1:8000/api/projects", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ API Response: SUCCESS")
            print(f"📄 Success: {data.get('success')}")
            print(f"⏰ Timestamp: {data.get('timestamp')}")
            
            # Check statistics
            if 'data' in data and 'statistics' in data['data']:
                stats = data['data']['statistics']
                print("\n📊 PROJECT STATISTICS:")
                print(f"   Total Projects: {stats.get('total', 'N/A')}")
                print(f"   Not Started: {stats.get('not_started', 'N/A')}")
                print(f"   In Progress: {stats.get('in_progress', 'N/A')}")
                print(f"   Finished: {stats.get('finished', 'N/A')}")
                print(f"   On Hold: {stats.get('on_hold', 'N/A')}")
                print(f"   Cancelled: {stats.get('cancelled', 'N/A')}")
                print(f"   Growth Rate: {stats.get('growth_rate', 'N/A')}")
                
                # Verify totals
                calculated = (stats.get('not_started', 0) + stats.get('in_progress', 0) + 
                            stats.get('finished', 0) + stats.get('on_hold', 0) + 
                            stats.get('cancelled', 0))
                total = stats.get('total', 0)
                
                print(f"\n🔍 VERIFICATION:")
                print(f"   Calculated Total: {calculated}")
                print(f"   Reported Total: {total}")
                print(f"   Match: {'✅ YES' if calculated == total else '❌ NO'}")
                
                # Check against expected values from CRM interface
                expected = {
                    'total': 294,
                    'not_started': 2,
                    'in_progress': 37,
                    'finished': 245,
                    'on_hold': 4,
                    'cancelled': 6
                }
                
                print(f"\n🎯 EXPECTED vs ACTUAL:")
                matches = 0
                for key, expected_val in expected.items():
                    actual_val = stats.get(key, 'N/A')
                    match = "✅" if actual_val == expected_val else "❌"
                    print(f"   {key.replace('_', ' ').title()}: {expected_val} vs {actual_val} {match}")
                    if actual_val == expected_val:
                        matches += 1
                
                if matches == len(expected):
                    print(f"\n🎉 PERFECT! All statistics match your CRM interface exactly!")
                else:
                    print(f"\n⚠️ {matches}/{len(expected)} statistics match. Some values may need adjustment.")
                    
            # Check projects data
            if 'data' in data and 'projects' in data['data']:
                projects = data['data']['projects']
                print(f"\n📋 PROJECTS DATA:")
                print(f"   Projects returned: {len(projects)}")
                if projects:
                    print(f"   First project ID: {projects[0].get('id', 'N/A')}")
                    print(f"   First project name: {projects[0].get('name', 'N/A')}")
                    print(f"   First project status: {projects[0].get('status', 'N/A')}")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Error: {e}")
        print("Make sure the server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

if __name__ == "__main__":
    test_projects_api()
