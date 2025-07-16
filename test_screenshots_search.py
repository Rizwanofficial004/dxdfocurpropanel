#!/usr/bin/env python3
"""
Test the new Screenshots Search API with all your filter requirements
"""

import requests
import json

def test_screenshots_search_api():
    print("🔍 Testing New Screenshots Search API")
    print("=" * 60)
    
    base_url = "https://dxdtime.ddsolutions.io/api/screenshots/search/"
    
    # Test cases for your requirements
    test_cases = [
        {
            "name": "1️⃣ Search by Name (Haseeb)",
            "url": f"{base_url}?search=Haseeb&limit=5",
            "description": "Search screenshots for employees named 'Haseeb'"
        },
        {
            "name": "2️⃣ Search by Email", 
            "url": f"{base_url}?search=amirishaque67@gmail.com&limit=5",
            "description": "Search screenshots by specific email address"
        },
        {
            "name": "3️⃣ Filter by Specific Date",
            "url": f"{base_url}?date=2025-07-02&limit=5",
            "description": "Show screenshots from July 2, 2025 only"
        },
        {
            "name": "4️⃣ Search + Date Filter Combined",
            "url": f"{base_url}?search=Haseeb&date=2025-06-10&limit=5",
            "description": "Find Haseeb's screenshots from June 10, 2025"
        },
        {
            "name": "5️⃣ Show ALL Screenshots (Button)",
            "url": f"{base_url}?show_all=true&limit=10",
            "description": "Show all screenshots regardless of date (your 'Show All' button)"
        },
        {
            "name": "6️⃣ Show All for Specific User",
            "url": f"{base_url}?search=Amir&show_all=true&limit=20",
            "description": "Show ALL screenshots for Amir (no date restrictions)"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{test_case['name']}")
        print(f"Description: {test_case['description']}")
        print(f"URL: {test_case['url']}")
        print("-" * 60)
        
        try:
            response = requests.get(test_case['url'], timeout=20)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS!")
                
                if 'data' in data:
                    response_data = data['data']
                    employees = response_data.get('employees', [])
                    summary = response_data.get('summary', {})
                    filters = response_data.get('filters_applied', {})
                    
                    print(f"📊 Employees Found: {len(employees)}")
                    print(f"📸 Total Screenshots: {summary.get('total_screenshots', 0)}")
                    print(f"🔍 Search Query: '{filters.get('search', 'None')}'")
                    print(f"📅 Date Filter: '{filters.get('date', 'None')}'")
                    print(f"🌟 Show All Mode: {filters.get('show_all', False)}")
                    
                    # Show employee details
                    for j, emp in enumerate(employees[:2]):  # Show first 2
                        print(f"\n   👤 Employee {j+1}: {emp.get('name', 'Unknown')}")
                        print(f"      📧 Email: {emp.get('email', 'Unknown')}")
                        print(f"      📸 Screenshots: {emp.get('screenshots_shown', 0)}/{emp.get('total_screenshots', 0)}")
                        
                        screenshots = emp.get('screenshots', [])
                        if screenshots:
                            latest = screenshots[0]
                            print(f"      🖼️  Latest: {latest.get('filename', 'N/A')}")
                            print(f"      📅 Date: {latest.get('date_folder', 'N/A')}")
                
                print(f"🕐 Response Time: {response.elapsed.total_seconds():.2f}s")
                
            else:
                print(f"❌ Error: {response.status_code}")
                try:
                    error = response.json()
                    print(f"Error Message: {error.get('message', 'Unknown error')}")
                except:
                    print(f"Raw Error: {response.text[:200]}")
                    
        except requests.exceptions.Timeout:
            print("❌ Request timed out")
            
        except Exception as e:
            print(f"❌ Error: {e}")

def show_api_usage_examples():
    print("\n\n📚 API USAGE EXAMPLES FOR YOUR FRONTEND:")
    print("=" * 60)
    
    examples = [
        {
            "scenario": "Search by Name Input",
            "frontend_action": "User types 'John' in search box",
            "api_call": "GET /api/screenshots/search/?search=John&limit=10"
        },
        {
            "scenario": "Search by Email Input", 
            "frontend_action": "User types 'john@company.com' in search box",
            "api_call": "GET /api/screenshots/search/?search=john@company.com&limit=10"
        },
        {
            "scenario": "Date Filter Selection",
            "frontend_action": "User selects date '2025-07-01' from date picker",
            "api_call": "GET /api/screenshots/search/?date=2025-07-01&limit=15"
        },
        {
            "scenario": "Show All Button",
            "frontend_action": "User clicks 'Show All Screenshots' button",
            "api_call": "GET /api/screenshots/search/?show_all=true&limit=50"
        },
        {
            "scenario": "Combined Search + Date",
            "frontend_action": "User searches 'Sarah' AND selects date '2025-06-15'",
            "api_call": "GET /api/screenshots/search/?search=Sarah&date=2025-06-15&limit=10"
        },
        {
            "scenario": "Pagination",
            "frontend_action": "User clicks 'Next Page' button",
            "api_call": "GET /api/screenshots/search/?search=current_search&page=2&limit=10"
        }
    ]
    
    for example in examples:
        print(f"\n🎯 {example['scenario']}:")
        print(f"   Frontend: {example['frontend_action']}")
        print(f"   API Call: {example['api_call']}")

if __name__ == "__main__":
    test_screenshots_search_api()
    show_api_usage_examples()
