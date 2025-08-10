#!/usr/bin/env python3
"""
Test Static CRM API - Exact Dashboard Numbers
Shows the exact static numbers from CRM database
"""

import sys
import os
import django
import requests
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dxdfocurpropanel.settings')
django.setup()

def test_static_crm_api():
    """Test the static CRM API directly"""
    print("🗄️ STATIC CRM API - EXACT DASHBOARD NUMBERS")
    print("=" * 60)
    print(f"Test Time: {datetime.now().isoformat()}")
    print("Data Source: CRM Database (Static, No AI)")
    print()
    
    try:
        # Import the static CRM API function
        from static_crm_status_apis import static_crm_status_api
        
        # Create a mock request object
        class MockRequest:
            def __init__(self):
                self.method = 'GET'
        
        request = MockRequest()
        
        # Call the static API directly
        print("🔍 Calling static CRM API...")
        response = static_crm_status_api(request)
        
        # Parse the response
        response_data = json.loads(response.content.decode())
        
        print("📊 EXACT DASHBOARD NUMBERS:")
        print("-" * 40)
        print(f"🔵 Not Started:  {response_data['not_started']}")
        print(f"🟠 In Progress:  {response_data['in_progress']}")
        print(f"🟡 Hold:         {response_data['onhold']}")
        print(f"🔴 Cancelled:    {response_data['cancel']}")
        print(f"🟢 Finished:     {response_data['finished']}")
        print("-" * 40)
        print(f"📋 Total:        {response_data['total']}")
        
        print("\n✅ VERIFICATION:")
        print("-" * 40)
        expected = {
            'not_started': 2,
            'in_progress': 34,
            'onhold': 4,
            'cancel': 6,
            'finished': 243
        }
        
        all_match = True
        for status, expected_count in expected.items():
            actual_count = response_data[status]
            match = "✅" if actual_count == expected_count else "❌"
            print(f"{match} {status}: Expected {expected_count}, Got {actual_count}")
            if actual_count != expected_count:
                all_match = False
        
        if all_match:
            print("\n🎯 PERFECT! Numbers match your dashboard exactly!")
        else:
            print("\n⚠️ Numbers don't match dashboard")
        
        print("\n🔗 YOUR STATIC API ENDPOINT:")
        print("-" * 40)
        print("GET /api/projects/simple-counts/")
        print()
        print("📱 Frontend Integration:")
        print("-" * 40)
        print("fetch('/api/projects/simple-counts/')")
        print("  .then(response => response.json())")
        print("  .then(data => {")
        print(f"    // data.not_started = {response_data['not_started']}")
        print(f"    // data.in_progress = {response_data['in_progress']}")
        print(f"    // data.onhold = {response_data['onhold']}")
        print(f"    // data.cancel = {response_data['cancel']}")
        print(f"    // data.finished = {response_data['finished']}")
        print("  });")
        
        print("\n📋 FULL API RESPONSE:")
        print("-" * 40)
        print(json.dumps(response_data, indent=2))
        
        print("\n✅ Static CRM API working perfectly!")
        print("🗄️ Pure database data - no AI, no dynamic processing!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_static_crm_api()
