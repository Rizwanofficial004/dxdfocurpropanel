#!/usr/bin/env python3
"""
Check the raw response from the screenshots API
"""

import requests

def check_raw_response():
    print("🔍 Checking Raw Response")
    print("=" * 50)
    
    url = "https://dxdtime.ddsolutions.io/api/screenshots/user/?user=Haseeb&date=2025-06-10&limit=5"
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'Unknown')}")
        print(f"Content-Length: {len(response.text)}")
        
        print("\n📄 Raw Response:")
        print("-" * 30)
        print(response.text[:500])  # Show first 500 characters
        print("-" * 30)
        
        # Try to identify the issue
        if response.text.strip().startswith('<'):
            print("⚠️  Response appears to be HTML (possibly an error page)")
        elif not response.text.strip():
            print("⚠️  Response is empty")
        else:
            print("ℹ️  Response contains text but may not be valid JSON")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_raw_response()
