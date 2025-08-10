#!/usr/bin/env python3
"""
Test Comprehensive Database API - Step 3
Tests the unified database API with AI analysis
"""

import sys
import os
import requests
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_comprehensive_database_api():
    """Test the comprehensive database API"""
    print("🚀 COMPREHENSIVE DATABASE API TEST")
    print("=" * 80)
    print(f"Test Time: {datetime.now().isoformat()}")
    print("Purpose: Test unified database API with AI analysis")
    print("-" * 80)
    
    base_url = "http://localhost:8000/api/database/"
    
    # Test different API endpoints
    test_cases = [
        {
            "name": "Quick Dashboard Statistics",
            "url": f"{base_url}dashboard/",
            "description": "Dashboard statistics only"
        },
        {
            "name": "Projects Only",
            "url": f"{base_url}projects/",
            "description": "Projects data and statistics"
        },
        {
            "name": "Comprehensive - Summary Format",
            "url": f"{base_url}comprehensive/?format=summary",
            "description": "Summary of all data"
        },
        {
            "name": "Comprehensive - Statistics Only",
            "url": f"{base_url}comprehensive/?format=statistics",
            "description": "Statistics without detailed data"
        },
        {
            "name": "Comprehensive - Full Data with AI",
            "url": f"{base_url}comprehensive/?format=detailed&include_ai_analysis=true",
            "description": "Complete data with AI insights"
        },
        {
            "name": "Custom Query - Projects + Tasks Only",
            "url": f"{base_url}comprehensive/?include_projects=true&include_tasks=true&include_clients=false&include_invoices=false&include_staff=false",
            "description": "Projects and tasks only"
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 TEST {i}: {test_case['name']}")
        print("-" * 50)
        print(f"URL: {test_case['url']}")
        print(f"Description: {test_case['description']}")
        
        try:
            response = requests.get(test_case['url'], timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    print(f"✅ SUCCESS: {response.status_code}")
                    print(f"📊 Response size: {len(response.content)} bytes")
                    
                    # Show key data points
                    if 'statistics' in data:
                        stats = data['statistics']
                        if 'projects' in stats:
                            proj_stats = stats['projects']
                            print(f"📋 Projects: {proj_stats.get('total_projects', 0)} total")
                            print(f"   - In Progress: {proj_stats.get('in_progress_projects', 0)}")
                            print(f"   - Finished: {proj_stats.get('finished_projects', 0)}")
                        
                        if 'tasks' in stats:
                            task_stats = stats['tasks']
                            print(f"📝 Tasks: {task_stats.get('total_tasks', 0)} total")
                            print(f"   - Completed: {task_stats.get('completed_tasks', 0)}")
                        
                        if 'clients' in stats:
                            client_stats = stats['clients']
                            print(f"👥 Clients: {client_stats.get('total_clients', 0)} total")
                        
                        if 'invoices' in stats:
                            invoice_stats = stats['invoices']
                            total_paid = invoice_stats.get('total_paid', 0)
                            print(f"💰 Total Paid: ${total_paid:,.2f}" if total_paid else "💰 Total Paid: $0.00")
                    
                    # Show data sections
                    data_sections = []
                    if 'projects' in data:
                        data_sections.append(f"Projects ({data['projects'].get('count', 0)})")
                    if 'tasks' in data:
                        data_sections.append(f"Tasks ({data['tasks'].get('count', 0)})")
                    if 'clients' in data:
                        data_sections.append(f"Clients ({data['clients'].get('count', 0)})")
                    if 'invoices' in data:
                        data_sections.append(f"Invoices ({data['invoices'].get('count', 0)})")
                    if 'staff' in data:
                        data_sections.append(f"Staff ({data['staff'].get('count', 0)})")
                    
                    if data_sections:
                        print(f"📂 Data Sections: {', '.join(data_sections)}")
                    
                    # Show AI insights if available
                    if 'ai_insights' in data and data['ai_insights']:
                        ai_data = data['ai_insights']
                        print(f"🤖 AI Analysis: Available")
                        if isinstance(ai_data, dict) and 'analysis' in ai_data:
                            print(f"   - Insights: {str(ai_data['analysis'])[:100]}...")
                    
                    results.append(True)
                else:
                    print(f"❌ FAILED: API returned success=false")
                    print(f"Error: {data.get('error', 'Unknown error')}")
                    results.append(False)
                    
            else:
                print(f"❌ FAILED: HTTP {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                results.append(False)
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            results.append(False)
    
    # Final results
    print("\n" + "=" * 80)
    print("📊 FINAL TEST RESULTS")
    print("=" * 80)
    
    total_tests = len(results)
    passed_tests = sum(results)
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Comprehensive Database API is working perfectly!")
    else:
        print(f"\n⚠️ {total_tests - passed_tests} test(s) failed.")
    
    print("\n🔗 AVAILABLE ENDPOINTS:")
    print("-" * 40)
    print("1. Dashboard Statistics:")
    print("   GET /api/database/dashboard/")
    print()
    print("2. Projects Only:")
    print("   GET /api/database/projects/")
    print()
    print("3. Comprehensive Summary:")
    print("   GET /api/database/comprehensive/?format=summary")
    print()
    print("4. Full Data with AI Analysis:")
    print("   GET /api/database/comprehensive/?format=detailed&include_ai_analysis=true")
    print()
    print("5. Custom Data Selection:")
    print("   GET /api/database/comprehensive/?include_projects=true&include_tasks=true&include_clients=false")
    
    print(f"\n✅ Testing completed at {datetime.now().isoformat()}")

def show_available_endpoints():
    """Show all available endpoints"""
    print("🔗 ALL AVAILABLE DATABASE API ENDPOINTS")
    print("=" * 80)
    
    endpoints = {
        "Dashboard Statistics": {
            "url": "/api/database/dashboard/",
            "description": "Quick dashboard statistics and metrics",
            "response": "Statistics for projects, tasks, clients, invoices"
        },
        "Projects Only": {
            "url": "/api/database/projects/",
            "description": "Comprehensive projects data and statistics",
            "response": "All projects with details and statistics"
        },
        "Comprehensive API": {
            "url": "/api/database/comprehensive/",
            "description": "Complete database data with AI analysis",
            "response": "All data types with AI insights"
        }
    }
    
    for name, info in endpoints.items():
        print(f"\n📋 {name}")
        print(f"   URL: {info['url']}")
        print(f"   Description: {info['description']}")
        print(f"   Response: {info['response']}")
    
    print("\n📊 Query Parameters for Comprehensive API:")
    print("-" * 50)
    print("• format: 'detailed', 'summary', 'statistics'")
    print("• include_projects: 'true'/'false'") 
    print("• include_tasks: 'true'/'false'")
    print("• include_clients: 'true'/'false'")
    print("• include_invoices: 'true'/'false'")
    print("• include_staff: 'true'/'false'")
    print("• include_activity: 'true'/'false'")
    print("• include_ai_analysis: 'true'/'false'")
    
    print("\n🤖 AI-Powered Features:")
    print("-" * 30)
    print("✅ Business Intelligence Analysis")
    print("✅ Performance Trend Analysis")
    print("✅ Risk Assessment")
    print("✅ Growth Recommendations")
    print("✅ Data Pattern Recognition")

if __name__ == '__main__':
    print("⚠️ Make sure Django server is running: python manage.py runserver")
    print("Press Enter to continue or Ctrl+C to exit...")
    try:
        input()
        show_available_endpoints()
        print("\n" + "="*80)
        test_comprehensive_database_api()
    except KeyboardInterrupt:
        print("\n❌ Test cancelled by user.")
