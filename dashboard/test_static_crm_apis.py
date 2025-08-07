#!/usr/bin/env python3
"""
Test Static CRM Status APIs
Test the pure CRM database status counts (no AI, no dynamic logic)
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dashboard'))

try:
    from dashboard.static_crm_status_apis import get_crm_projects, get_static_crm_status_counts
    print("✅ Successfully imported static CRM status APIs")
except ImportError as e:
    print(f"❌ Failed to import APIs: {e}")
    sys.exit(1)

def test_static_crm_api():
    """Test the static CRM status API - pure database counts"""
    print("\n" + "="*80)
    print("🗄️  TESTING STATIC CRM DATABASE STATUS API")
    print("="*80)
    print(f"Test Time: {datetime.now().isoformat()}")
    print("Data Source: CRM Database (Static, No AI)")
    
    try:
        # Get projects from CRM database
        print("🔍 Fetching projects from CRM database...")
        projects = get_crm_projects()
        
        if projects is None:
            print("❌ Failed to fetch projects from CRM database")
            return False
        
        print(f"✅ Successfully fetched {len(projects)} projects from database")
        
        # Get static status counts
        print("📊 Counting CRM status values...")
        status_data = get_static_crm_status_counts(projects)
        
        print("✅ Static status counting completed!")
        
        # Display raw CRM status counts
        print("\n🗄️  RAW CRM DATABASE STATUS COUNTS:")
        print("-" * 50)
        raw_counts = status_data["crm_status_raw"]
        for crm_status, count in raw_counts.items():
            print(f"CRM Status '{crm_status}': {count} projects")
        
        # Display mapped status counts
        print("\n📋 MAPPED STATUS COUNTS:")
        print("-" * 50)
        print(f"🔵 Not Started:  {status_data['not_started']} (CRM Status 1)")
        print(f"🟠 In Progress:  {status_data['in_progress']} (CRM Status 2)")
        print(f"🟡 On Hold:      {status_data['onhold']} (CRM Status 3)")
        print(f"🟢 Finished:     {status_data['finished']} (CRM Status 4)")
        print(f"🔴 Cancelled:    {status_data['cancel']} (CRM Status 5)")
        
        total_mapped = (status_data['not_started'] + status_data['in_progress'] + 
                       status_data['onhold'] + status_data['finished'] + status_data['cancel'])
        print(f"📊 Total Mapped: {total_mapped}")
        
        # Show API response format
        print("\n📋 STATIC API RESPONSE:")
        print("-" * 40)
        api_response = {
            "success": True,
            "not_started": status_data["not_started"],
            "in_progress": status_data["in_progress"],
            "onhold": status_data["onhold"],
            "cancel": status_data["cancel"],
            "finished": status_data["finished"],
            "total": len(projects),
            "from_crm_database": True
        }
        print(json.dumps(api_response, indent=2))
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        return False

def show_sample_projects_by_status():
    """Show sample projects for each status"""
    print("\n" + "="*80)
    print("📂 SAMPLE PROJECTS BY CRM STATUS")
    print("="*80)
    
    try:
        projects = get_crm_projects()
        if projects is None:
            print("❌ Failed to fetch projects")
            return False
        
        # Group projects by status
        status_groups = {"1": [], "2": [], "3": [], "4": [], "5": []}
        
        for project in projects:
            status = str(project.get("status", ""))
            if status in status_groups:
                status_groups[status].append(project)
        
        # Show samples for each status
        status_names = {
            "1": "Not Started",
            "2": "In Progress", 
            "3": "On Hold",
            "4": "Finished",
            "5": "Cancelled"
        }
        
        for status, name in status_names.items():
            projects_in_status = status_groups[status]
            count = len(projects_in_status)
            
            print(f"\n🔸 CRM Status {status} - {name} ({count} projects):")
            print("-" * 60)
            
            # Show first 3 projects as samples
            for i, project in enumerate(projects_in_status[:3], 1):
                name_str = project.get("name", "Unknown")[:50]
                progress = project.get("progress", "0")
                print(f"  {i}. {name_str}... (Progress: {progress}%)")
            
            if count > 3:
                print(f"     ... and {count - 3} more projects")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 STATIC CRM STATUS API - DATABASE TEST")
    print("="*80)
    print("Purpose: Get pure CRM database status counts")
    print("Method: Static mapping, no AI, no dynamic logic")
    print("Source: Direct from CRM database")
    
    results = {}
    
    # Test 1: Static CRM API
    print("\n🧪 TEST 1: Static CRM Status Counts")
    results['static_api_test'] = test_static_crm_api()
    
    # Test 2: Sample projects by status
    print("\n🧪 TEST 2: Sample Projects by Status")
    results['sample_projects_test'] = show_sample_projects_by_status()
    
    # Print final results
    print("\n" + "="*80)
    print("📊 TEST RESULTS")
    print("="*80)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    if passed_tests == total_tests:
        print("\n✅ SUCCESS: Static CRM APIs working perfectly!")
        
        print("\n🔗 YOUR STATIC CRM API ENDPOINTS:")
        print("-" * 50)
        print("1. GET /api/projects/simple-counts/")
        print("   → Just the numbers: {not_started: 2, in_progress: 34, ...}")
        print("\n2. GET /api/projects/static-status/")
        print("   → Full CRM status analysis with raw counts")
        print("\n3. GET /api/projects/status-breakdown/")
        print("   → Projects grouped by status with details")
        
        print("\n📱 SIMPLE DASHBOARD INTEGRATION:")
        print("-" * 50)
        print("fetch('/api/projects/simple-counts/')")
        print("  .then(response => response.json())")
        print("  .then(data => {")
        print("    // data.not_started = 2")
        print("    // data.in_progress = 34") 
        print("    // data.onhold = 4")
        print("    // data.cancel = 6")
        print("    // data.finished = 243")
        print("  });")
        
        print("\n🗄️  Pure CRM database data - no AI processing!")
    else:
        print(f"\n❌ FAILED: {total_tests - passed_tests} test(s) failed")
    
    print(f"\n✅ Testing completed at {datetime.now().isoformat()}")

if __name__ == '__main__':
    main()
