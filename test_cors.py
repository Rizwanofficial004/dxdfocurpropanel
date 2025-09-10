#!/usr/bin/env python3
"""
Test script to verify CORS configuration is working properly
"""

import requests
import json

def test_cors():
    """Test CORS by making requests to the Django server"""
    
    base_url = "http://localhost:8000"
    
    # Test simple GET request
    print("Testing CORS configuration...")
    print("-" * 50)
    
    try:
        # Test a simple GET request
        response = requests.get(f"{base_url}/api/health/", timeout=5)
        print(f"GET /api/health/ - Status: {response.status_code}")
        print(f"CORS Headers present: {bool(response.headers.get('Access-Control-Allow-Origin'))}")
        
        if response.headers.get('Access-Control-Allow-Origin'):
            print(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin')}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")
        print("Make sure Django server is running on localhost:8000")
        return False
    
    # Test preflight OPTIONS request
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        
        response = requests.options(f"{base_url}/api/dashboard/employees/", 
                                  headers=headers, timeout=5)
        print(f"\nOPTIONS preflight - Status: {response.status_code}")
        print(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not set')}")
        print(f"Access-Control-Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'Not set')}")
        print(f"Access-Control-Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'Not set')}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error with OPTIONS request: {e}")
    
    print("\nIf you're still seeing CORS errors, check:")
    print("1. Make sure your frontend is running on one of the allowed origins")
    print("2. Check browser developer tools for specific CORS error messages")
    print("3. Verify Django server is accessible from your frontend's origin")

if __name__ == "__main__":
    test_cors()
