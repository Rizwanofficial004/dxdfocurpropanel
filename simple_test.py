#!/usr/bin/env python3
"""
Simple test to check S3 employee discovery
"""

import requests
import json

def simple_test():
    print("🔍 Simple S3 Employee Discovery Test")
    print("=" * 50)
    
    # Test just the employee list (no screenshots)
    url = "https://dxdtime.ddsolutions.io/api/s3-employees/?include_screenshots=false&per_page=5"
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            
            employees = data.get('data', {}).get('employees', [])
            pagination = data.get('data', {}).get('pagination', {})
            
            print(f"📊 Found {len(employees)} employees on this page")
            print(f"📄 Total Employees: {pagination.get('total_employees', 'Unknown')}")
            
            print("\n👥 Employees found in S3:")
            for i, emp in enumerate(employees, 1):
                name = emp.get('name', 'Unknown')
                email = emp.get('email', 'Unknown')
                print(f"  {i}. {name} ({email})")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    simple_test()
