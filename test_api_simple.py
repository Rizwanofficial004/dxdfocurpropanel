import requests
import json

def test_projects_api():
    """Test the projects API endpoint"""
    try:
        url = "http://127.0.0.1:8000/api/projects"
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            stats = data.get('data', {}).get('statistics', {})
            
            print("\n=== API RESPONSE STATISTICS ===")
            print(f"Total Projects: {stats.get('total', 'N/A')}")
            print(f"Not Started: {stats.get('not_started', 'N/A')}")
            print(f"In Progress: {stats.get('in_progress', 'N/A')}")
            print(f"Finished: {stats.get('finished', 'N/A')}")
            print(f"On Hold: {stats.get('on_hold', 'N/A')}")
            print(f"Cancelled: {stats.get('cancelled', 'N/A')}")
            print(f"Growth Rate: {stats.get('growth_rate', 'N/A')}")
            
            print("\n=== EXPECTED VALUES ===")
            print("Total Projects: 294")
            print("Not Started: 2")
            print("In Progress: 37")
            print("Finished: 245")
            print("On Hold: 4")
            print("Cancelled: 6")
            
            print("\n=== COMPARISON ===")
            expected = {
                'total': 294,
                'not_started': 2,
                'in_progress': 37,
                'finished': 245,
                'on_hold': 4,
                'cancelled': 6
            }
            
            all_correct = True
            for key, expected_value in expected.items():
                actual_value = stats.get(key, 0)
                status = "✅ CORRECT" if actual_value == expected_value else "❌ INCORRECT"
                print(f"{key.replace('_', ' ').title()}: {actual_value} (expected {expected_value}) {status}")
                if actual_value != expected_value:
                    all_correct = False
            
            print(f"\n=== OVERALL RESULT ===")
            if all_correct:
                print("🎉 ALL VALUES ARE CORRECT!")
            else:
                print("⚠️  SOME VALUES ARE INCORRECT")
                
            print(f"\nSource: {data.get('data', {}).get('source', 'Unknown')}")
            
        else:
            print(f"Error: HTTP {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error testing API: {str(e)}")

if __name__ == "__main__":
    test_projects_api()
