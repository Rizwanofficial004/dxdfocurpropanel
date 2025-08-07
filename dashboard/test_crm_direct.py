"""
Direct CRM API Test Script
=========================

This script tests the CRM API directly to verify our token and endpoint.
"""

import requests
import json
from datetime import datetime

# CRM Configuration
CRM_BASE_URL = "https://crm.deluxebilisim.com"
CRM_AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o"

def test_crm_direct():
    print("🔍 TESTING CRM API DIRECTLY")
    print("=" * 50)
    print(f"URL: {CRM_BASE_URL}/api/projects")
    print(f"Token: {CRM_AUTH_TOKEN[:50]}...")
    
    headers = {
        'authtoken': CRM_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DDS-Focus-Time-Dashboard/1.0'
    }
    
    try:
        print(f"\n⏳ Making request...")
        response = requests.get(f"{CRM_BASE_URL}/api/projects", headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
            
            try:
                data = response.json()
                print(f"Response Type: {type(data)}")
                
                if isinstance(data, dict):
                    print(f"Response Keys: {list(data.keys())}")
                    
                    # Check for different possible data structures
                    if 'data' in data:
                        projects = data['data']
                        print(f"Projects in 'data' field: {len(projects) if isinstance(projects, list) else 'Not a list'}")
                    elif 'projects' in data:
                        projects = data['projects']
                        print(f"Projects in 'projects' field: {len(projects) if isinstance(projects, list) else 'Not a list'}")
                    else:
                        # Maybe projects are at root level
                        print("Projects might be at root level")
                        projects = data
                        
                    # Show sample project if available
                    if isinstance(projects, list) and len(projects) > 0:
                        sample_project = projects[0]
                        print(f"\nSample Project:")
                        print(f"  Type: {type(sample_project)}")
                        if isinstance(sample_project, dict):
                            print(f"  Keys: {list(sample_project.keys())}")
                            print(f"  Sample Data: {json.dumps(sample_project, indent=2)[:300]}...")
                        
                elif isinstance(data, list):
                    print(f"Direct list of {len(data)} projects")
                    if len(data) > 0:
                        sample_project = data[0]
                        print(f"Sample Project Keys: {list(sample_project.keys()) if isinstance(sample_project, dict) else 'Not a dict'}")
                
                # Show raw response (truncated)
                raw_response = response.text
                print(f"\nRaw Response (first 500 chars):")
                print(raw_response[:500])
                if len(raw_response) > 500:
                    print("... (truncated)")
                    
            except json.JSONDecodeError:
                print("❌ Response is not valid JSON")
                print(f"Raw Response: {response.text[:500]}")
                
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Error Response: {response.text}")
            
    except requests.RequestException as e:
        print(f"❌ CONNECTION ERROR: {str(e)}")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")

def test_curl_equivalent():
    print(f"\n\n🔧 CURL EQUIVALENT COMMAND:")
    print("-" * 50)
    
    curl_command = f'''curl -X GET "{CRM_BASE_URL}/api/projects" \\
  -H "authtoken: {CRM_AUTH_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -H "User-Agent: DDS-Focus-Time-Dashboard/1.0"'''
    
    print(curl_command)

if __name__ == "__main__":
    test_crm_direct()
    test_curl_equivalent()
    print(f"\n✅ Direct CRM test completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
