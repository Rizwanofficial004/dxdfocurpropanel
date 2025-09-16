import requests
import json

# Test the local API endpoint
url = "http://127.0.0.1:8000/api/users/screenshots/"
params = {
    'q': 'kadircagtas_at_gmail.com',
    'start_date': '2025-08-01',
    'end_date': '2025-08-31',
    'page': 1,
    'page_size': 10
}

try:
    print("Testing local API endpoint...")
    print(f"URL: {url}")
    print(f"Params: {params}")
    
    response = requests.get(url, params=params, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        data = response.json()
        print("SUCCESS! Response:")
        print(json.dumps(data, indent=2))
    else:
        print("Error Response:")
        print(response.text)
        
except requests.exceptions.ConnectionError as e:
    print(f"Connection Error: {e}")
except requests.exceptions.Timeout as e:
    print(f"Timeout Error: {e}")
except Exception as e:
    print(f"Error: {e}")
