#!/usr/bin/env python3
"""
Quick test of accurate screenshot counts
"""
import requests
import json

# Test with known employees who have many screenshots
BASE_URL = "http://localhost:8000/api"
SEARCH_API = f"{BASE_URL}/employees/screenshots/search/"

def test_accurate_counts():
    """Test the updated API with accurate screenshot counts"""
    print("🚀 Testing Screenshot Counts API (Fast Mode)")
    print("=" * 50)
    
    try:
        response = requests.get(SEARCH_API, params={
            'limit': 10,  # Show 10 employees
            'fast_mode': 'true'  # Use fast mode for quick overview
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Total Employees: {data['data']['pagination']['total_employees']}")
            
            print("\n📸 Screenshot Counts per Employee:")
            print("-" * 60)
            
            for emp in data['data']['employees']:
                employee = emp['employee']
                count = emp['screenshot_count']
                has_screenshots = emp.get('has_screenshots', False)
                
                # Color coding based on count
                if count > 2000:
                    emoji = "🔥"  # High activity
                elif count > 1000:
                    emoji = "🚀"  # Very active
                elif count > 100:
                    emoji = "📈"  # Active
                elif count > 0:
                    emoji = "✅"  # Some activity
                else:
                    emoji = "❌"  # No activity
                
                print(f"{emoji} {employee['name'][:25]:<25} | {count:>6} screenshots | {employee['email']}")
            
            print("-" * 60)
            print(f"📊 Summary:")
            
            # Calculate statistics
            counts = [emp['screenshot_count'] for emp in data['data']['employees']]
            total_screenshots = sum(counts)
            max_count = max(counts) if counts else 0
            min_count = min(counts) if counts else 0
            avg_count = round(total_screenshots / len(counts), 1) if counts else 0
            
            print(f"   📈 Total Screenshots: {total_screenshots:,}")
            print(f"   📊 Average per Employee: {avg_count}")
            print(f"   🔝 Highest Count: {max_count:,}")
            print(f"   🔻 Lowest Count: {min_count}")
            print(f"   👥 Employees with Screenshots: {len([c for c in counts if c > 0])}/{len(counts)}")
                
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_specific_employee_count():
    """Test accurate count for a specific employee"""
    print(f"\n🔍 Testing Specific Employee Count (Accurate Mode)")
    print("=" * 50)
    
    # Test with employees we know have many screenshots
    test_emails = ["amirishaque67@gmail.com", "atakankahraman35@outlook.com", "begumdamlasen@gmail.com"]
    
    for email in test_emails:
        try:
            response = requests.get(SEARCH_API, params={
                'email': email,
                'limit': 1,  # Just get count, not actual screenshots
                'fast_mode': 'false'  # Use accurate counting for specific employees
            })
            
            if response.status_code == 200:
                data = response.json()
                employee = data['data']['employee']
                total_count = data['data']['pagination']['total_screenshots']
                
                print(f"📧 {employee['name']}")
                print(f"   📸 Total Screenshots: {total_count:,}")
                print(f"   📬 Email: {employee['email']}")
                print()
            else:
                print(f"❌ Error for {email}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error for {email}: {str(e)}")

def test_accurate_vs_fast_mode():
    """Compare fast mode vs accurate mode for performance"""
    print(f"\n⚡ Comparing Fast Mode vs Accurate Mode")
    print("=" * 50)
    
    import time
    
    # Test fast mode
    print("🚀 Testing Fast Mode...")
    start_time = time.time()
    try:
        response = requests.get(SEARCH_API, params={
            'limit': 5,
            'fast_mode': 'true'
        })
        fast_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Fast Mode: {fast_time:.2f}s")
            print(f"   📊 Employees: {len(data['data']['employees'])}")
            for emp in data['data']['employees']:
                count = emp['screenshot_count']
                has_screenshots = emp['has_screenshots']
                status = "📸 Has Screenshots" if has_screenshots else "❌ No Screenshots"
                print(f"      {emp['employee']['name'][:20]:<20} | Count: {count} | {status}")
        else:
            print(f"   ❌ Fast Mode Failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Fast Mode Error: {str(e)}")
    
    print()

if __name__ == "__main__":
    test_accurate_counts()
    test_specific_employee_count()
    test_accurate_vs_fast_mode()
