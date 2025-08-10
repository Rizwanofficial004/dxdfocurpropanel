#!/usr/bin/env python3
"""
Test Accurate Project Status APIs
Verify the APIs return exact dashboard counts
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dashboard'))

try:
    from dashboard.accurate_project_status_apis import map_crm_status_to_categories, get_crm_projects
    print("✅ Successfully imported accurate status APIs")
except ImportError as e:
    print(f"❌ Failed to import APIs: {e}")
    sys.exit(1)

def test_accurate_api():
    """Test the accurate project status API"""
    print("\n" + "="*80)
    print("🎯 TESTING ACCURATE PROJECT STATUS API")
    print("="*80)
    print(f"Test Time: {datetime.now().isoformat()}")
    
    # Expected dashboard values
    expected = {
        "not_started": 2,
        "in_progress": 34,
        "onhold": 4,
        "cancel": 6,
        "finished": 243
    }
    
    try:
        # Get projects from CRM
        print("🔍 Fetching projects from CRM...")
        projects = get_crm_projects()
        
        if projects is None:
            print("❌ Failed to fetch projects from CRM")
            return False
        
        print(f"✅ Successfully fetched {len(projects)} projects")
        
        # Test accurate categorization
        print("🎯 Running accurate categorization...")
        categorized_data = map_crm_status_to_categories(projects)
        
        if categorized_data:
            print("✅ Accurate categorization completed!")
            
            # Display results vs expected
            summary = categorized_data.get("summary", {})
            print("\n📊 DASHBOARD MATCH VERIFICATION:")
            print("-" * 60)
            print("Category        Expected | Actual | Status")
            print("-" * 60)
            
            all_match = True
            for category, expected_count in expected.items():
                actual_count = summary.get(f"{category}_count", 0)
                match = expected_count == actual_count
                status_icon = "✅" if match else "❌"
                all_match = all_match and match
                
                print(f"{category:<15} {expected_count:>8} | {actual_count:>6} | {status_icon}")
            
            print("-" * 60)
            total_expected = sum(expected.values())
            total_actual = sum(summary.values())
            final_status = "✅" if all_match else "❌"
            print(f"{'TOTAL':<15} {total_expected:>8} | {total_actual:>6} | {final_status}")
            
            if all_match:
                print("\n🎉 PERFECT MATCH! All counts match dashboard exactly!")
                
                # Show sample API response
                print("\n📋 SAMPLE API RESPONSE:")
                print("-" * 40)
                api_response = {
                    "success": True,
                    "total_projects": len(projects),
                    "status_summary": {
                        "not_started": summary.get("not_started_count", 0),
                        "in_progress": summary.get("in_progress_count", 0),
                        "onhold": summary.get("onhold_count", 0),
                        "cancel": summary.get("cancel_count", 0),
                        "finished": summary.get("finished_count", 0)
                    },
                    "dashboard_ready": True,
                    "crm_accurate": True
                }
                print(json.dumps(api_response, indent=2))
            else:
                print("\n❌ MISMATCH DETECTED! Some counts don't match dashboard.")
            
            return all_match
        else:
            print("❌ Accurate categorization failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 ACCURATE PROJECT STATUS API - VERIFICATION TEST")
    print("="*80)
    print("Target: Match dashboard exactly")
    print("Dashboard shows: 2|34|4|6|243 (Not Started|In Progress|On Hold|Cancel|Finished)")
    
    # Run test
    success = test_accurate_api()
    
    # Print final results
    print("\n" + "="*80)
    print("📊 FINAL TEST RESULTS")
    print("="*80)
    
    if success:
        print("✅ SUCCESS: API returns exact dashboard counts!")
        print("\n🔗 YOUR ACCURATE API ENDPOINTS:")
        print("-" * 40)
        print("1. GET /api/projects/accurate-status/")
        print("   → Full analysis with CRM mapping details")
        print("\n2. GET /api/projects/dashboard-summary/")
        print("   → Clean summary for dashboard widgets")
        
        print("\n📱 DASHBOARD INTEGRATION:")
        print("-" * 40)
        print("Use this JavaScript to update your dashboard:")
        print("""
fetch('/api/projects/dashboard-summary/')
  .then(response => response.json())
  .then(data => {
    document.getElementById('not-started-count').innerText = data.status_summary.not_started;
    document.getElementById('in-progress-count').innerText = data.status_summary.in_progress;
    document.getElementById('onhold-count').innerText = data.status_summary.onhold;
    document.getElementById('cancel-count').innerText = data.status_summary.cancel;
    document.getElementById('finished-count').innerText = data.status_summary.finished;
  });
""")
        
        print("\n🎯 Perfect! Your API now matches dashboard exactly!")
    else:
        print("❌ FAILED: API counts don't match dashboard")
        print("Check the analysis above for details")
    
    print(f"\n✅ Testing completed at {datetime.now().isoformat()}")

if __name__ == '__main__':
    main()
