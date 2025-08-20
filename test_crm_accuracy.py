import requests
import json

def test_all_crm_endpoints():
    """Test all CRM endpoints and compare with actual CRM interface data"""
    base_url = "http://127.0.0.1:8000/api"
    
    print("🧪 COMPREHENSIVE CRM DATA ACCURACY TEST")
    print("=" * 60)
    
    # Expected values from your CRM interface screenshots
    expected_data = {
        "staffs": {
            "total": 58,  # From "Showing 1 to 58 of 58 entries"
            "active": 52,   # Estimated based on typical ratios
            "inactive": 6,
            "logged_in": 8
        },
        "projects": {
            "total": 294,       # 2+37+245+4+6
            "not_started": 2,
            "in_progress": 37,
            "finished": 245,
            "on_hold": 4,
            "cancelled": 6
        },
        "tasks": {
            "total": 1530,      # 21+49+1+1446+14 (with 1 rounding difference)
            "not_started": 21,
            "in_progress": 49,
            "testing": 1,
            "completed": 1446,
            "beklemede": 14
        },
        "invoices": {
            "total": 476,       # From invoice summary
            "paid": 363,        # 76.26% of 476
            "unpaid": 6,        # 1.26% of 476
            "overdue": 56,      # 11.76% of 476
            "partially_paid": 1, # 0.21% of 476
            "draft": 0          # 0.00% of 476
        }
    }
    
    endpoints = ["staffs", "projects", "tasks", "invoices"]
    
    for endpoint in endpoints:
        print(f"\n📊 === TESTING {endpoint.upper()} ENDPOINT ===")
        try:
            url = f"{base_url}/{endpoint}"
            response = requests.get(url, timeout=10)
            
            print(f"URL: {url}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                stats = data.get('data', {}).get('statistics', {})
                
                print("✅ SUCCESS - Retrieved data")
                print(f"Data Source: {data.get('data', {}).get('source', 'Unknown')}")
                
                # Compare with expected data
                expected = expected_data.get(endpoint, {})
                print(f"\nCOMPARISON WITH CRM INTERFACE:")
                
                for key, expected_value in expected.items():
                    actual_value = stats.get(key, 'N/A')
                    status = "✅" if actual_value == expected_value else "❌"
                    print(f"  {key.replace('_', ' ').title()}: {actual_value} (expected {expected_value}) {status}")
                
                # Show additional data
                print(f"\nADDITIONAL STATS:")
                for key, value in stats.items():
                    if key not in expected:
                        print(f"  {key.replace('_', ' ').title()}: {value}")
                        
            else:
                print(f"❌ ERROR: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error Detail: {error_data.get('detail', response.text)}")
                except:
                    print(f"Error Text: {response.text}")
                    
        except Exception as e:
            print(f"❌ REQUEST ERROR: {str(e)}")
    
    # Test dashboard summary
    print(f"\n🏠 === TESTING DASHBOARD SUMMARY ===")
    try:
        url = f"{base_url}/dashboard/summary"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            summary = data.get('data', {})
            
            print("✅ Dashboard Summary Retrieved")
            print(f"Employees Total: {summary.get('employees', {}).get('total_count', 'N/A')}")
            print(f"Projects Total: {summary.get('projects', {}).get('total', 'N/A')}")
            print(f"Tasks Total: {summary.get('tasks', {}).get('total', 'N/A')}")
            print(f"Clients Total: {summary.get('clients', {}).get('total', 'N/A')}")
            print(f"Invoices Total: {summary.get('invoices', {}).get('total', 'N/A')}")
            
        else:
            print(f"❌ Dashboard Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Dashboard Error: {str(e)}")
    
    print(f"\n🏁 === TEST COMPLETE ===")
    print("Check the results above to verify accuracy against your CRM interface")

if __name__ == "__main__":
    test_all_crm_endpoints()
