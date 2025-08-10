#!/usr/bin/env python3
"""
Test AI Project Categorization APIs
Tests the new AI-powered project categorization functionality
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dashboard'))

try:
    from dashboard.ai_project_categorization_apis import categorize_projects_with_ai, get_crm_projects
    print("✅ Successfully imported AI categorization APIs")
except ImportError as e:
    print(f"❌ Failed to import AI APIs: {e}")
    sys.exit(1)

def test_ai_categorization():
    """Test AI project categorization"""
    print("\n" + "="*80)
    print("🤖 AI PROJECT CATEGORIZATION TEST")
    print("="*80)
    print(f"Test Time: {datetime.now().isoformat()}")
    print("Testing Mode: AI-Powered Status Categorization")
    print("-" * 80)
    
    try:
        # Get projects from CRM
        print("🔍 Fetching projects from CRM...")
        projects = get_crm_projects()
        
        if projects is None:
            print("❌ Failed to fetch projects from CRM")
            return False
        
        print(f"✅ Successfully fetched {len(projects)} projects")
        
        # Test AI categorization
        print("🤖 Running AI categorization...")
        categorized_data = categorize_projects_with_ai(projects)
        
        if categorized_data:
            print("✅ AI categorization completed successfully!")
            
            # Display results
            summary = categorized_data.get("summary", {})
            print("\n📊 CATEGORIZATION SUMMARY:")
            print("-" * 40)
            print(f"🔵 Not Started:    {summary.get('not_started_count', 0)}")
            print(f"🟠 In Progress:    {summary.get('in_progress_count', 0)}")
            print(f"🟡 On Hold:        {summary.get('onhold_count', 0)}")
            print(f"🔴 Cancelled:      {summary.get('cancel_count', 0)}")
            print(f"🟢 Finished:       {summary.get('finished_count', 0)}")
            
            # Show some examples
            categorized_projects = categorized_data.get("categorized_projects", {})
            
            print("\n📝 SAMPLE CATEGORIZATIONS:")
            print("-" * 50)
            
            for status, projects_list in categorized_projects.items():
                if projects_list:
                    print(f"\n{status.upper().replace('_', ' ')}:")
                    for i, project in enumerate(projects_list[:3], 1):  # Show first 3
                        print(f"  {i}. {project.get('name')[:60]}...")
                        print(f"     Reason: {project.get('reason', 'N/A')}")
            
            # Save results
            with open('ai_categorization_results.json', 'w', encoding='utf-8') as f:
                json.dump(categorized_data, f, indent=2, ensure_ascii=False)
            
            print(f"\n💾 Results saved to: ai_categorization_results.json")
            return True
        else:
            print("❌ AI categorization failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during AI categorization: {str(e)}")
        return False

def create_simple_test():
    """Create a simple manual test with sample projects"""
    print("\n" + "="*80)
    print("📝 SIMPLE AI TEST WITH SAMPLE PROJECTS")
    print("="*80)
    
    # Sample projects for testing
    sample_projects = [
        {"id": "1", "name": "Website Development for TRNCNEWS", "status": "2", "progress": "50"},
        {"id": "2", "name": "2025 Yılı Genel Grafik Tasarımı", "status": "1", "progress": "0"},
        {"id": "3", "name": "Completed Marketing Campaign", "status": "4", "progress": "100"},
        {"id": "4", "name": "Paused Website Project", "status": "3", "progress": "30"},
        {"id": "5", "name": "Cancelled Mobile App", "status": "5", "progress": "20"}
    ]
    
    try:
        categorized_data = categorize_projects_with_ai(sample_projects)
        
        if categorized_data:
            print("✅ Sample AI categorization successful!")
            print(json.dumps(categorized_data, indent=2, ensure_ascii=False))
            return True
        else:
            print("❌ Sample AI categorization failed")
            return False
            
    except Exception as e:
        print(f"❌ Error in sample test: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 AI PROJECT CATEGORIZATION - TEST SUITE")
    print("="*80)
    
    results = {}
    
    # Test 1: Real CRM data categorization
    print("\n🧪 TEST 1: Real CRM Data AI Categorization")
    results['real_data_test'] = test_ai_categorization()
    
    # Test 2: Sample data categorization
    print("\n🧪 TEST 2: Sample Data AI Categorization")
    results['sample_data_test'] = create_simple_test()
    
    # Print final results
    print("\n" + "="*80)
    print("📊 FINAL TEST RESULTS")
    print("="*80)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    print("\nDetailed Results:")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
    
    print("\n" + "="*80)
    print("🎯 NEW AI API ENDPOINTS")
    print("="*80)
    print("1. GET /api/projects/ai-categorization/")
    print("   - AI-powered project categorization into 5 status groups")
    print("   - Returns detailed categorization with reasons")
    
    print("\n2. GET /api/projects/status-summary/")
    print("   - Quick status summary with counts only")
    print("   - Optimized for dashboard widgets")
    
    print("\n🤖 AI Features:")
    print("   - Uses OpenAI GPT-3.5-turbo for intelligent categorization")
    print("   - Analyzes project names and context")
    print("   - Provides reasoning for each categorization")
    print("   - Fallback to keyword-based categorization")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED! AI categorization is working!")
        print("🚀 Your AI-powered project status APIs are ready!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) failed.")
    
    print(f"\n✅ Testing completed at {datetime.now().isoformat()}")

if __name__ == '__main__':
    main()
