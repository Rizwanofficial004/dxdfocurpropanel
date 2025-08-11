#!/usr/bin/env python3
"""
Get accurate screenshot counts for ALL employees
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"
SEARCH_API = f"{BASE_URL}/employees/screenshots/search/"

def get_all_employees_list():
    """First get list of all employees using fast mode"""
    print("📋 Getting list of all employees...")
    
    response = requests.get(SEARCH_API, params={
        'fast_mode': 'true',
        'limit': 100  # Get more employees at once
    })
    
    if response.status_code == 200:
        data = response.json()
        employees = []
        
        # Get all pages
        total_pages = data['data']['pagination']['total_pages']
        current_employees = data['data']['employees']
        
        for emp in current_employees:
            employees.append({
                'email': emp['employee']['email'],
                'name': emp['employee']['name'],
                'has_screenshots': emp['has_screenshots']
            })
        
        # Get remaining pages if any
        for page in range(2, total_pages + 1):
            print(f"   📄 Getting page {page}/{total_pages}...")
            response = requests.get(SEARCH_API, params={
                'fast_mode': 'true',
                'limit': 100,
                'page': page
            })
            
            if response.status_code == 200:
                page_data = response.json()
                for emp in page_data['data']['employees']:
                    employees.append({
                        'email': emp['employee']['email'],
                        'name': emp['employee']['name'],
                        'has_screenshots': emp['has_screenshots']
                    })
        
        return employees
    
    return []

def get_accurate_count_for_employee(email, name):
    """Get accurate screenshot count for a specific employee"""
    try:
        response = requests.get(SEARCH_API, params={
            'email': email,
            'fast_mode': 'false',
            'limit': 1
        })
        
        if response.status_code == 200:
            data = response.json()
            total_count = data['data']['pagination']['total_screenshots']
            return total_count
        else:
            print(f"   ❌ Error for {email}: {response.status_code}")
            return 0
            
    except Exception as e:
        print(f"   ❌ Error for {email}: {str(e)}")
        return 0

def get_all_users_accurate_counts():
    """Get accurate screenshot counts for ALL employees"""
    print("🚀 Getting Accurate Screenshot Counts for ALL Employees")
    print("=" * 70)
    
    # First get list of all employees
    all_employees = get_all_employees_list()
    
    if not all_employees:
        print("❌ Could not get employee list")
        return
    
    print(f"👥 Found {len(all_employees)} total employees")
    print(f"📸 Getting accurate counts (this will take a while)...")
    print()
    
    results = []
    total_start_time = time.time()
    
    # Filter to only employees who have screenshots
    employees_with_screenshots = [emp for emp in all_employees if emp['has_screenshots']]
    employees_without_screenshots = [emp for emp in all_employees if not emp['has_screenshots']]
    
    print(f"📊 {len(employees_with_screenshots)} employees have screenshots")
    print(f"❌ {len(employees_without_screenshots)} employees have no screenshots")
    print()
    
    print("🔍 Getting Accurate Counts for Active Employees:")
    print("=" * 70)
    
    for i, employee in enumerate(employees_with_screenshots, 1):
        print(f"[{i:2d}/{len(employees_with_screenshots)}] Processing {employee['name'][:30]:<30}", end=" ", flush=True)
        
        start_time = time.time()
        accurate_count = get_accurate_count_for_employee(employee['email'], employee['name'])
        elapsed = time.time() - start_time
        
        # Determine activity level
        if accurate_count > 200000:
            emoji = "🔥"
            level = "Extremely High"
        elif accurate_count > 100000:
            emoji = "🚀"
            level = "Very High"
        elif accurate_count > 50000:
            emoji = "📈"
            level = "High"
        elif accurate_count > 10000:
            emoji = "✅"
            level = "Moderate"
        elif accurate_count > 1000:
            emoji = "📊"
            level = "Low"
        else:
            emoji = "⚪"
            level = "Minimal"
        
        print(f"| {emoji} {accurate_count:>8,} screenshots | {level:<15} | {elapsed:.1f}s")
        
        results.append({
            'name': employee['name'],
            'email': employee['email'],
            'count': accurate_count,
            'level': level,
            'emoji': emoji
        })
    
    # Add employees with no screenshots
    for employee in employees_without_screenshots:
        results.append({
            'name': employee['name'],
            'email': employee['email'],
            'count': 0,
            'level': 'No Activity',
            'emoji': '❌'
        })
    
    total_elapsed = time.time() - total_start_time
    
    # Sort by screenshot count (descending)
    results.sort(key=lambda x: x['count'], reverse=True)
    
    print()
    print("📊 FINAL RESULTS - ALL EMPLOYEES RANKED BY ACTIVITY")
    print("=" * 70)
    
    total_screenshots = 0
    
    for i, result in enumerate(results, 1):
        count = result['count']
        total_screenshots += count
        
        if count > 0:
            print(f"{i:2d}. {result['emoji']} {result['name'][:25]:<25} | {count:>8,} screenshots | {result['level']}")
        else:
            print(f"{i:2d}. {result['emoji']} {result['name'][:25]:<25} | {'No screenshots':<15} | {result['level']}")
    
    print()
    print("📈 SUMMARY STATISTICS")
    print("=" * 70)
    print(f"👥 Total Employees: {len(results)}")
    print(f"📸 Total Screenshots: {total_screenshots:,}")
    print(f"📊 Average per Employee: {total_screenshots // len(results):,}")
    print(f"🔝 Highest Count: {results[0]['count']:,} ({results[0]['name']})")
    print(f"⏱️  Total Processing Time: {total_elapsed/60:.1f} minutes")
    
    active_employees = [r for r in results if r['count'] > 0]
    print(f"✅ Active Employees: {len(active_employees)}/{len(results)}")
    
    if active_employees:
        avg_active = sum(r['count'] for r in active_employees) // len(active_employees)
        print(f"📊 Average for Active Employees: {avg_active:,}")
    
    # Activity level breakdown
    levels = {}
    for result in results:
        level = result['level']
        levels[level] = levels.get(level, 0) + 1
    
    print()
    print("📊 Activity Level Breakdown:")
    for level, count in levels.items():
        print(f"   {level}: {count} employees")

if __name__ == "__main__":
    get_all_users_accurate_counts()
