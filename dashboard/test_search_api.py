#!/usr/bin/env python3
"""
Simple test script for the screenshots search API
"""

import requests
import json

def test_search_api():
    print("🔍 Testing Screenshots Search API")
    print("=" * 50)
    
    # Replace ${searchTerm} with actual search terms
    search_terms = [
        "Haseeb",           # Search by name
        "Amir",             # Search by name
        "gmail.com",        # Search by email domain
        "developer",        # Search by title/role
        "amirishaque67@gmail.com"  # Search by full email
    ]
    
    base_url = "https://dxdtime.ddsolutions.io/api/screenshots/search/"
    
    for i, search_term in enumerate(search_terms, 1):
        print(f"\n{i}️⃣ Testing search term: '{search_term}'")
        
        # Build the URL (replace ${searchTerm} with actual term)
        url = f"{base_url}?search={search_term}&limit=10"
        print(f"URL: {url}")
        print("-" * 50)
        
        try:
            response = requests.get(url, timeout=15)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS!")
                
                # Extract key information
                employees = data.get('data', {}).get('employees', [])
                summary = data.get('data', {}).get('summary', {})
                
                print(f"📊 Employees Found: {len(employees)}")
                print(f"📸 Total Screenshots: {summary.get('total_screenshots', 0)}")
                
                # Show each employee found
                for j, emp in enumerate(employees):
                    name = emp.get('name', 'Unknown')
                    email = emp.get('email', 'Unknown')
                    total_screenshots = emp.get('total_screenshots', 0)
                    shown_screenshots = emp.get('screenshots_shown', 0)
                    
                    print(f"   👤 {j+1}. {name} ({email})")
                    print(f"      📸 Screenshots: {shown_screenshots}/{total_screenshots}")
                    
                    # Show first screenshot if available
                    screenshots = emp.get('screenshots', [])
                    if screenshots:
                        first_screenshot = screenshots[0]
                        filename = first_screenshot.get('filename', 'N/A')
                        date_folder = first_screenshot.get('date_folder', 'N/A')
                        print(f"      🖼️  Latest: {filename}")
                        print(f"      📅 From: {date_folder}")
                
            elif response.status_code == 404:
                print("❌ 404 - API endpoint not found")
                
            elif response.status_code == 500:
                print("❌ 500 - Internal server error")
                try:
                    error_data = response.json()
                    print(f"Error: {error_data.get('message', 'Unknown error')}")
                except:
                    print("Error details not available")
                    
            else:
                print(f"❌ Error: {response.status_code}")
                
        except requests.exceptions.ConnectError:
            print("❌ Connection error - Is the server running?")
            print("   Run: python manage.py runserver 0.0.0.0:8000")
            
        except requests.exceptions.Timeout:
            print("❌ Request timed out")
            
        except Exception as e:
            print(f"❌ Error: {e}")

def test_with_different_parameters():
    print("\n\n🔧 Testing Different Parameter Combinations")
    print("=" * 50)
    
    base_url = "https://dxdtime.ddsolutions.io/api/screenshots/search/"
    
    test_cases = [
        {
            "name": "Search only",
            "params": "search=Haseeb&limit=5"
        },
        {
            "name": "Date filter only", 
            "params": "date=2025-06-10&limit=5"
        },
        {
            "name": "Show all screenshots",
            "params": "show_all=true&limit=15"
        },
        {
            "name": "Search + Date filter",
            "params": "search=Amir&date=2025-07-02&limit=3"
        },
        {
            "name": "Search + Show all",
            "params": "search=Haseeb&show_all=true&limit=8"
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📋 {test_case['name']}:")
        url = f"{base_url}?{test_case['params']}"
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                employees = data.get('data', {}).get('employees', [])
                total_screenshots = data.get('data', {}).get('summary', {}).get('total_screenshots', 0)
                print(f"   ✅ Found {len(employees)} employees, {total_screenshots} screenshots")
            else:
                print(f"   ❌ Status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def show_curl_examples():
    print("\n\n🌐 CURL Command Examples")
    print("=" * 50)
    
    curl_commands = [
        'curl "https://dxdtime.ddsolutions.io/api/screenshots/search/?search=Haseeb&limit=10"',
        'curl "https://dxdtime.ddsolutions.io/api/screenshots/search/?search=amirishaque67@gmail.com&limit=5"',
        'curl "https://dxdtime.ddsolutions.io/api/screenshots/search/?date=2025-06-10&limit=10"',
        'curl "https://dxdtime.ddsolutions.io/api/screenshots/search/?show_all=true&limit=20"',
        'curl "https://dxdtime.ddsolutions.io/api/screenshots/search/?search=Amir&date=2025-07-02&limit=5"'
    ]
    
    for i, cmd in enumerate(curl_commands, 1):
        print(f"{i}. {cmd}")

if __name__ == "__main__":
    test_search_api()
    test_with_different_parameters()
    show_curl_examples()
