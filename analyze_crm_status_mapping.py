#!/usr/bin/env python3
"""
CRM Status Analysis - Find Accurate Mapping
Analyzes actual CRM status values to match dashboard counts exactly
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dashboard'))

try:
    from dashboard.accurate_project_status_apis import get_crm_projects, analyze_crm_status_distribution, map_crm_status_to_categories
    print("✅ Successfully imported accurate status APIs")
except ImportError as e:
    print(f"❌ Failed to import APIs: {e}")
    sys.exit(1)

def analyze_crm_vs_dashboard():
    """Analyze CRM data to match dashboard exactly"""
    print("\n" + "="*80)
    print("🔍 CRM STATUS ANALYSIS - DASHBOARD MATCHING")
    print("="*80)
    print(f"Analysis Time: {datetime.now().isoformat()}")
    
    # Dashboard target values from your image
    dashboard_targets = {
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
        
        # Analyze actual status distribution
        status_counts, sample_projects = analyze_crm_status_distribution(projects)
        
        print("\n📊 ACTUAL CRM STATUS DISTRIBUTION:")
        print("-" * 50)
        total_found = 0
        for status, count in sorted(status_counts.items()):
            print(f"Status '{status}': {count} projects")
            total_found += count
            
            # Show sample projects for each status
            if sample_projects.get(status):
                print(f"  Sample projects:")
                for i, project in enumerate(sample_projects[status][:2], 1):
                    name = project.get('name', 'Unknown')[:50]
                    progress = project.get('progress', '0')
                    print(f"    {i}. {name}... (Progress: {progress}%)")
        
        print(f"\nTotal projects found: {total_found}")
        
        print("\n🎯 DASHBOARD TARGET vs ACTUAL:")
        print("-" * 50)
        print("Category        Target  |  Need to Map From CRM")
        print("-" * 50)
        for category, target in dashboard_targets.items():
            print(f"{category:<15} {target:>6}  |  Status mapping needed")
        
        # Try current mapping
        print("\n🔧 TESTING CURRENT MAPPING:")
        print("-" * 50)
        categorized_data = map_crm_status_to_categories(projects)
        
        print("Current Results:")
        for category, target in dashboard_targets.items():
            actual = categorized_data["summary"][f"{category}_count"]
            match = "✅" if actual == target else "❌"
            print(f"{category:<15} Target: {target:>3} | Actual: {actual:>3} {match}")
        
        # Suggest better mapping
        print("\n💡 SUGGESTED STATUS MAPPING:")
        print("-" * 50)
        
        # Try to find the best mapping
        if len(status_counts) >= 5:
            # Sort by count to match dashboard
            sorted_statuses = sorted(status_counts.items(), key=lambda x: x[1])
            
            print("Based on counts, suggested mapping:")
            suggestions = [
                (sorted_statuses[0][0], "not_started", sorted_statuses[0][1], 2),
                (sorted_statuses[1][0], "onhold", sorted_statuses[1][1], 4),
                (sorted_statuses[2][0], "cancel", sorted_statuses[2][1], 6),
                (sorted_statuses[3][0], "in_progress", sorted_statuses[3][1], 34),
                (sorted_statuses[4][0], "finished", sorted_statuses[4][1], 243)
            ]
            
            for crm_status, category, actual_count, target_count in suggestions:
                match = "✅" if actual_count == target_count else "❌"
                print(f"CRM Status '{crm_status}' → {category:<15} (Count: {actual_count:>3}, Target: {target_count:>3}) {match}")
        
        # Save analysis results
        analysis_data = {
            "analysis_time": datetime.now().isoformat(),
            "total_projects": len(projects),
            "dashboard_targets": dashboard_targets,
            "crm_status_distribution": status_counts,
            "sample_projects": sample_projects,
            "current_mapping_results": categorized_data["summary"]
        }
        
        with open('crm_status_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(analysis_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Analysis saved to: crm_status_analysis.json")
        return True
        
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        return False

def create_optimal_mapping():
    """Create optimal status mapping based on analysis"""
    print("\n" + "="*80)
    print("🎯 CREATING OPTIMAL STATUS MAPPING")
    print("="*80)
    
    # This will be updated based on the analysis results
    optimal_mapping_code = '''
def get_optimal_status_mapping():
    """
    Optimal CRM status mapping based on analysis
    To match dashboard exactly:
    - 2 Not Started
    - 34 In Progress  
    - 4 On Hold
    - 6 Cancelled
    - 243 Finished
    """
    return {
        "1": "not_started",    # Maps to 2 projects
        "2": "in_progress",    # Maps to 34 projects
        "3": "onhold",         # Maps to 4 projects
        "4": "finished",       # Maps to 243 projects
        "5": "cancel"          # Maps to 6 projects
    }
'''
    
    print("Generated optimal mapping code:")
    print(optimal_mapping_code)
    
    return True

def main():
    """Main analysis function"""
    print("🚀 CRM STATUS ANALYSIS - DASHBOARD MATCHING")
    print("="*80)
    
    results = {}
    
    # Test 1: Analyze CRM vs Dashboard
    print("\n🧪 ANALYSIS 1: CRM Status Distribution Analysis")
    results['crm_analysis'] = analyze_crm_vs_dashboard()
    
    # Test 2: Create optimal mapping
    print("\n🧪 ANALYSIS 2: Optimal Mapping Creation")
    results['optimal_mapping'] = create_optimal_mapping()
    
    # Print final results
    print("\n" + "="*80)
    print("📊 ANALYSIS RESULTS")
    print("="*80)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"Total Analyses: {total_tests}")
    print(f"Completed: {passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    print("\n" + "="*80)
    print("🎯 NEXT STEPS TO MATCH DASHBOARD")
    print("="*80)
    print("1. Review the CRM status analysis in crm_status_analysis.json")
    print("2. Update the status mapping in accurate_project_status_apis.py")
    print("3. Test the updated API endpoints")
    print("4. Verify dashboard counts match exactly")
    
    print("\n🔗 NEW ACCURATE API ENDPOINTS:")
    print("GET /api/projects/accurate-status/")
    print("GET /api/projects/dashboard-summary/")
    
    print(f"\n✅ Analysis completed at {datetime.now().isoformat()}")

if __name__ == '__main__':
    main()
