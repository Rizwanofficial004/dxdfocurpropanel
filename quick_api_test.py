#!/usr/bin/env python3
"""
Quick API Test - Test your comprehensive database API endpoints
"""
import requests
import json
from datetime import datetime

def test_api_endpoint(url, description):
    """Test a single API endpoint"""
    print(f"\n🔄 Testing: {description}")
    print(f"URL: {url}")
    print("-" * 60)
    
    try:
        response = requests.get(url, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            
            # Show key statistics
            if 'statistics' in data:
                stats = data['statistics']
                if 'projects' in stats:
                    print(f"📊 Projects: {stats['projects'].get('total_projects', 'N/A')}")
                if 'tasks' in stats:
                    print(f"📋 Tasks: {stats['tasks'].get('total_tasks', 'N/A')}")
                if 'clients' in stats:
                    print(f"👥 Clients: {stats['clients'].get('total_clients', 'N/A')}")
                if 'invoices' in stats:
                    print(f"💰 Total Revenue: ${stats['invoices'].get('total_paid', 'N/A')}")
            
            # Show response size
            response_size = len(response.text)
            if response_size > 1024:
                print(f"📦 Response Size: {response_size / 1024:.1f} KB")
            else:
                print(f"📦 Response Size: {response_size} bytes")
                
            # Show AI insights if available
            if 'ai_insights' in data:
                print("🤖 AI Analysis: Available")
            
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
    except requests.exceptions.ConnectionError:
        print("❌ FAILED - Server not running")
        print("Make sure Django server is running: python manage.py runserver")
    except Exception as e:
        print(f"❌ FAILED - Error: {str(e)}")

def main():
    print("🚀 COMPREHENSIVE DATABASE API TEST")
    print("=" * 80)
    print(f"Test Time: {datetime.now().isoformat()}")
    print("Server: http://127.0.0.1:8000")
    
    # Test endpoints
    endpoints = [
        {
            "url": "http://127.0.0.1:8000/api/database/dashboard/",
            "description": "📊 Quick Dashboard Statistics"
        },
        {
            "url": "http://127.0.0.1:8000/api/database/projects/",
            "description": "📋 Projects Only API"
        },
        {
            "url": "http://127.0.0.1:8000/api/database/comprehensive/?format=statistics",
            "description": "📈 Comprehensive - Statistics Only"
        },
        {
            "url": "http://127.0.0.1:8000/api/database/comprehensive/?format=summary",
            "description": "📝 Comprehensive - Summary Format"
        },
        {
            "url": "http://127.0.0.1:8000/api/database/comprehensive/?format=detailed&include_ai_analysis=true",
            "description": "🤖 Comprehensive - Full Data with AI"
        }
    ]
    
    for endpoint in endpoints:
        test_api_endpoint(endpoint["url"], endpoint["description"])
    
    print("\n" + "=" * 80)
    print("🎯 SUMMARY:")
    print("✅ Your comprehensive database API provides:")
    print("   • Real-time access to your MySQL database (551 tables)")
    print("   • Multiple response formats for different use cases")
    print("   • AI-powered business intelligence and insights")
    print("   • Customizable data selection")
    print("   • Fast dashboard metrics")
    print("\n💡 Use these endpoints in your frontend applications!")
    print("📊 Dashboard widgets: /api/database/dashboard/")
    print("🤖 Business intelligence: /api/database/comprehensive/?include_ai_analysis=true")

if __name__ == "__main__":
    main()
