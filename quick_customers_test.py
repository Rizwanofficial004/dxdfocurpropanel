import requests

# Test customers API
try:
    response = requests.get("http://127.0.0.1:8000/api/customers", timeout=5)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        stats = data['data']['statistics']
        
        print("=== CUSTOMERS API TEST RESULTS ===")
        print(f"Total: {stats['total']}")
        print(f"Active: {stats['active']}")
        print(f"Inactive: {stats['inactive']}")
        print(f"Growth Rate: {stats['growth_rate']}")
        print(f"Source: {data['data']['source']}")
        
        # Check against expected values
        expected = {"total": 437, "active": 281, "inactive": 156}
        print("\n=== VALIDATION ===")
        for key, expected_val in expected.items():
            actual_val = stats[key]
            status = "OK" if actual_val == expected_val else "MISMATCH"
            print(f"{key}: {actual_val} (expected {expected_val}) - {status}")
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
