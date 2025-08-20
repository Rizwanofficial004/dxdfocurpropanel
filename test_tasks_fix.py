import requests
import json

def test_tasks_api():
    """Test the tasks API endpoint with updated statistics"""
    try:
        url = "http://127.0.0.1:8000/api/tasks"
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            stats = data.get('data', {}).get('statistics', {})
            breakdown = data.get('data', {}).get('breakdown', {})
            
            print("\n=== API RESPONSE STATISTICS ===")
            print(f"Total Tasks: {stats.get('total', 'N/A')}")
            print(f"Not Started: {stats.get('not_started', 'N/A')}")
            print(f"In Progress: {stats.get('in_progress', 'N/A')}")
            print(f"Testing: {stats.get('testing', 'N/A')}")
            print(f"Awaiting Feedback: {stats.get('awaiting_feedback', 'N/A')}")
            print(f"Completed: {stats.get('completed', 'N/A')}")
            print(f"Beklemede: {stats.get('beklemede', 'N/A')}")
            print(f"Growth Rate: {stats.get('growth_rate', 'N/A')}")
            
            print("\n=== EXPECTED VALUES (from CRM Interface) ===")
            print("Total Tasks: ~1530")
            print("Not Started: 21")
            print("In Progress: 49")  
            print("Testing: 1")
            print("Awaiting Feedback: 0")
            print("Completed: 1446")
            print("Beklemede: 14")
            
            print("\n=== COMPARISON ===")
            expected = {
                'not_started': 21,
                'in_progress': 49,
                'testing': 1,
                'awaiting_feedback': 0,
                'completed': 1446,
                'beklemede': 14
            }
            
            all_correct = True
            for key, expected_value in expected.items():
                actual_value = stats.get(key, 0)
                status = "✅ CORRECT" if actual_value == expected_value else "❌ INCORRECT"
                print(f"{key.replace('_', ' ').title()}: {actual_value} (expected {expected_value}) {status}")
                if actual_value != expected_value:
                    all_correct = False
            
            # Check total calculation
            calculated_total = sum(expected.values())
            actual_total = stats.get('total', 0)
            total_status = "✅ CORRECT" if actual_total >= calculated_total else "❌ INCORRECT"
            print(f"Total: {actual_total} (calculated {calculated_total}) {total_status}")
            
            print(f"\n=== BREAKDOWN SECTION ===")
            for key, value in breakdown.items():
                print(f"{key.replace('_', ' ').title()}: {value}")
            
            print(f"\n=== OVERALL RESULT ===")
            if all_correct:
                print("🎉 ALL VALUES ARE CORRECT!")
            else:
                print("⚠️  SOME VALUES ARE INCORRECT")
                
        else:
            print(f"Error: HTTP {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error testing API: {str(e)}")

if __name__ == "__main__":
    test_tasks_api()
