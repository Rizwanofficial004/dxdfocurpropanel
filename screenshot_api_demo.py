#!/usr/bin/env python3
"""
Employee Screenshot Search API - Usage Guide

This script demonstrates the two modes of the screenshot search API:
1. Fast Mode: Quick overview of all employees (fast but approximate counts)
2. Accurate Mode: Precise counts for specific employees (slower but exact)
"""
import requests
import time

BASE_URL = "http://localhost:8000/api"
SEARCH_API = f"{BASE_URL}/employees/screenshots/search/"

def demonstrate_fast_mode():
    """
    Fast Mode: Use for employee overview dashboards
    - Very fast response (under 10 seconds)
    - Shows which employees have screenshots
    - Count is placeholder (1 = has screenshots, 0 = no screenshots)
    """
    print("📊 FAST MODE - Employee Overview Dashboard")
    print("=" * 60)
    print("Use Case: Quick dashboard showing who has screenshots")
    print("Performance: ~8 seconds for all employees")
    print("Accuracy: Shows presence of screenshots, not exact counts")
    print()
    
    start_time = time.time()
    response = requests.get(SEARCH_API, params={
        'limit': 10,
        'fast_mode': 'true'
    })
    
    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        print(f"⏱️  Response Time: {elapsed:.1f}s")
        print(f"👥 Total Employees: {data['data']['pagination']['total_employees']}")
        print()
        print("📋 Employee Status:")
        
        for emp in data['data']['employees']:
            employee = emp['employee']
            has_screenshots = emp['has_screenshots']
            status = "✅ Active" if has_screenshots else "❌ Inactive"
            print(f"   {employee['name'][:30]:<30} {status}")
    print()

def demonstrate_accurate_mode():
    """
    Accurate Mode: Use for detailed employee analysis
    - Slower response (30+ seconds per employee)
    - Shows exact screenshot counts
    - Perfect for detailed reports and analytics
    """
    print("🎯 ACCURATE MODE - Detailed Employee Analysis")
    print("=" * 60)
    print("Use Case: Detailed reports for specific employees")
    print("Performance: ~30 seconds per employee")
    print("Accuracy: Exact screenshot counts")
    print()
    
    # Test with one high-activity employee
    test_email = "begumdamlasen@gmail.com"
    
    start_time = time.time()
    response = requests.get(SEARCH_API, params={
        'email': test_email,
        'fast_mode': 'false'
    })
    
    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        employee = data['data']['employee']
        total_count = data['data']['pagination']['total_screenshots']
        
        print(f"⏱️  Response Time: {elapsed:.1f}s")
        print(f"👤 Employee: {employee['name']}")
        print(f"📧 Email: {employee['email']}")
        print(f"📸 Total Screenshots: {total_count:,}")
        print()
        
        # Show productivity level
        if total_count > 200000:
            level = "🔥 Extremely High Activity"
        elif total_count > 100000:
            level = "🚀 Very High Activity"
        elif total_count > 50000:
            level = "📈 High Activity"
        elif total_count > 10000:
            level = "✅ Moderate Activity"
        else:
            level = "📊 Low Activity"
            
        print(f"📊 Activity Level: {level}")
    print()

def usage_recommendations():
    """Show when to use each mode"""
    print("💡 USAGE RECOMMENDATIONS")
    print("=" * 60)
    print()
    print("🚀 Use FAST MODE when:")
    print("   • Building employee overview dashboards")
    print("   • Checking who has/doesn't have screenshots")
    print("   • Need quick response times")
    print("   • Showing large lists of employees")
    print()
    print("🎯 Use ACCURATE MODE when:")
    print("   • Generating detailed employee reports")
    print("   • Need exact screenshot counts")
    print("   • Analyzing specific employee productivity")
    print("   • Creating analytics and statistics")
    print()
    print("🔧 API Parameters:")
    print("   Fast Mode:     ?fast_mode=true&limit=50")
    print("   Accurate Mode: ?email=user@domain.com&fast_mode=false")
    print("   Specific Date: ?date_from=2024-01-01&date_to=2024-12-31")
    print("   Task Filter:   ?task_folder=specific_task")
    print()

if __name__ == "__main__":
    print("🔍 EMPLOYEE SCREENSHOT SEARCH API - DEMO")
    print("=" * 60)
    print()
    
    demonstrate_fast_mode()
    demonstrate_accurate_mode() 
    usage_recommendations()
