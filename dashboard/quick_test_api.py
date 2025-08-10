import requests
import json

def quick_test():
    print("Testing Employee Folders API...")
    
    # Test Beyza
    email = "beyza-donmez-@hotmail.com"
    url = f"http://localhost:8000/api/screenshots/employee/{email}/folders/"
    
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS!")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    quick_test()
