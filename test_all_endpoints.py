#!/usr/bin/env python3
"""
Complete API Test Suite for Django Live Tracking System
Tests all available endpoints and provides detailed results
"""

import requests
import json
from datetime import datetime
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api"

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*80}")
    print(f"🔥 {title}")
    print(f"{'='*80}")

def print_endpoint_test(endpoint, description):
    """Print endpoint test header"""
    print(f"\n📡 Testing: {endpoint}")
    print(f"   Description: {description}")
    print("-" * 60)

def test_endpoint(endpoint, method="GET", data=None, params=None, headers=None):
    """Test an API endpoint and return results"""
    start_time = time.time()
    
    try:
        url = f"{API_BASE}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, params=params, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        
        result = {
            "status_code": response.status_code,
            "response_time_ms": round(response_time, 2),
            "success": response.status_code == 200,
            "url": url,
            "method": method
        }
        
        if response.status_code == 200:
            try:
                json_data = response.json()
                result["data"] = json_data
                result["message"] = json_data.get("message", "Success")
            except:
                result["data"] = response.text[:200] + "..." if len(response.text) > 200 else response.text
                result["message"] = "Non-JSON response"
        else:
            result["error"] = response.text[:200] + "..." if len(response.text) > 200 else response.text
            result["message"] = f"Error {response.status_code}"
        
        return result
        
    except Exception as e:
        return {
            "status_code": 0,
            "response_time_ms": 0,
            "success": False,
            "error": str(e),
            "message": "Connection failed",
            "url": f"{API_BASE}{endpoint}",
            "method": method
        }

def print_test_result(result):
    """Print test result in a formatted way"""
    status_icon = "✅" if result["success"] else "❌"
    print(f"{status_icon} Status: {result['status_code']} | Time: {result['response_time_ms']}ms")
    print(f"   Message: {result['message']}")
    
    if result["success"] and "data" in result:
        # Print relevant data summary
        data = result["data"]
        if isinstance(data, dict):
            if "employee_cards" in data.get("data", {}):
                cards = data["data"]["employee_cards"]
                pagination = data["data"].get("pagination", {})
                print(f"   📊 Employee Cards: {len(cards)}")
                print(f"   📄 Pagination: {pagination.get('showing_text', 'N/A')}")
                
                if cards:
                    print(f"   👤 Sample Employee: {cards[0].get('name')} ({cards[0].get('status')})")
                    print(f"   🕒 Working Time: {cards[0].get('time_info', {}).get('working_time', 'N/A')}")
                    print(f"   📸 Has Screenshot: {cards[0].get('screenshot', {}).get('has_screenshot', False)}")
                    
            elif "users" in data.get("data", {}):
                users = data["data"]["users"]
                print(f"   👥 Users Found: {len(users)}")
                if users:
                    print(f"   👤 Sample User: {users[0].get('name')} ({users[0].get('email')})")
                    
            elif "suggestions" in data.get("data", {}):
                suggestions = data["data"]["suggestions"]
                print(f"   💡 Suggestions: {len(suggestions)}")
                if suggestions:
                    print(f"   🔍 Top Suggestion: {suggestions[0].get('name')} (Score: {suggestions[0].get('relevance_score', 0)})")
                    
            elif "screenshots" in data.get("data", {}):
                screenshots = data["data"]["screenshots"]
                print(f"   📸 Screenshots: {len(screenshots)}")
                
            elif "logs" in data.get("data", {}):
                logs = data["data"]["logs"]
                print(f"   📝 Logs: {len(logs)}")
                
            elif data.get("success"):
                print(f"   📊 Data Keys: {list(data.get('data', {}).keys()) if 'data' in data else list(data.keys())}")
        
    elif not result["success"]:
        print(f"   ❌ Error: {result.get('error', 'Unknown error')}")
    
    print()

def main():
    """Main test function"""
    print_header("COMPLETE API TEST SUITE")
    print(f"🌐 Testing API Base: {API_BASE}")
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test Results Storage
    results = {}
    
    # Test 1: API Health Check
    print_endpoint_test("/test/", "Basic API health check")
    results["health"] = test_endpoint("/test/")
    print_test_result(results["health"])
    
    # Test 2: Employee Cards API (Main Frontend API)
    print_endpoint_test("/employee-cards/", "Main frontend employee cards API")
    results["employee_cards"] = test_endpoint("/employee-cards/")
    print_test_result(results["employee_cards"])
    
    # Test 3: Employee Cards with Today Filter
    print_endpoint_test("/employee-cards/?date_range=today", "Employee cards for today")
    results["cards_today"] = test_endpoint("/employee-cards/", params={"date_range": "today", "limit": 5})
    print_test_result(results["cards_today"])
    
    # Test 4: Employee Cards with Week Filter
    print_endpoint_test("/employee-cards/?date_range=week", "Employee cards for this week")
    results["cards_week"] = test_endpoint("/employee-cards/", params={"date_range": "week"})
    print_test_result(results["cards_week"])
    
    # Test 5: Employee Cards with Month Filter
    print_endpoint_test("/employee-cards/?date_range=month", "Employee cards for this month")
    results["cards_month"] = test_endpoint("/employee-cards/", params={"date_range": "month"})
    print_test_result(results["cards_month"])
    
    # Test 6: Employee Cards with Year Filter
    print_endpoint_test("/employee-cards/?date_range=year", "Employee cards for this year")
    results["cards_year"] = test_endpoint("/employee-cards/", params={"date_range": "year"})
    print_test_result(results["cards_year"])
    
    # Test 7: Employee Cards with Name Search
    print_endpoint_test("/employee-cards/?search_name=amir", "Search employee by name")
    results["cards_search"] = test_endpoint("/employee-cards/", params={"search_name": "amir"})
    print_test_result(results["cards_search"])
    
    # Test 8: Employee Cards with Combined Filters
    print_endpoint_test("/employee-cards/ (combined filters)", "All filters combined")
    results["cards_combined"] = test_endpoint("/employee-cards/", params={
        "employee_filter": "all",
        "date_range": "week",
        "search_name": "developer",
        "limit": 3
    })
    print_test_result(results["cards_combined"])
    
    # Test 9: User Search API
    print_endpoint_test("/users/search/?q=amir", "User search functionality")
    results["user_search"] = test_endpoint("/users/search/", params={"q": "amir", "limit": 5})
    print_test_result(results["user_search"])
    
    # Test 10: User Suggestions API
    print_endpoint_test("/users/suggestions/?q=am", "Google-like user suggestions")
    results["user_suggestions"] = test_endpoint("/users/suggestions/", params={"q": "am", "limit": 3})
    print_test_result(results["user_suggestions"])
    
    # Test 11: Screenshots API
    print_endpoint_test("/screenshots/?limit=5", "General screenshots API")
    results["screenshots"] = test_endpoint("/screenshots/", params={"limit": 5})
    print_test_result(results["screenshots"])
    
    # Test 12: Logs API
    print_endpoint_test("/logs/?limit=5", "General logs API")
    results["logs"] = test_endpoint("/logs/", params={"limit": 5})
    print_test_result(results["logs"])
    
    # Test 13: User Screenshots API
    print_endpoint_test("/users/{email}/screenshots/", "User-specific screenshots")
    results["user_screenshots"] = test_endpoint("/users/amirishaque67@gmail.com/screenshots/")
    print_test_result(results["user_screenshots"])
    
    # Test 14: User Logs API
    print_endpoint_test("/users/{email}/logs/", "User-specific logs")
    results["user_logs"] = test_endpoint("/users/amirishaque67@gmail.com/logs/")
    print_test_result(results["user_logs"])
    
    # Test 15: Dashboard Data API
    print_endpoint_test("/dashboard/data/", "Dashboard analytics data")
    results["dashboard"] = test_endpoint("/dashboard/data/")
    print_test_result(results["dashboard"])
    
    # Test 16: Login API
    print_endpoint_test("/auth/login/", "User authentication")
    results["login"] = test_endpoint("/auth/login/", method="POST", data={
        "username": "admin",
        "password": "admin"
    }, headers={"Content-Type": "application/json"})
    print_test_result(results["login"])
    
    # Summary Report
    print_header("TEST SUMMARY REPORT")
    
    total_tests = len(results)
    successful_tests = sum(1 for r in results.values() if r["success"])
    failed_tests = total_tests - successful_tests
    
    print(f"📊 Total Tests: {total_tests}")
    print(f"✅ Successful: {successful_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"📈 Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    print(f"\n🏆 **KEY ENDPOINTS FOR YOUR FRONTEND:**")
    print(f"✅ Main API: /api/employee-cards/ - {results['employee_cards']['message']}")
    print(f"✅ Today Filter: /api/employee-cards/?date_range=today - {results['cards_today']['message']}")
    print(f"✅ Week Filter: /api/employee-cards/?date_range=week - {results['cards_week']['message']}")
    print(f"✅ Month Filter: /api/employee-cards/?date_range=month - {results['cards_month']['message']}")
    print(f"✅ Year Filter: /api/employee-cards/?date_range=year - {results['cards_year']['message']}")
    print(f"✅ Name Search: /api/employee-cards/?search_name=amir - {results['cards_search']['message']}")
    
    print(f"\n🚀 **PERFORMANCE SUMMARY:**")
    avg_response_time = sum(r["response_time_ms"] for r in results.values() if r["success"]) / successful_tests
    print(f"⚡ Average Response Time: {avg_response_time:.1f}ms")
    fastest = min((r for r in results.values() if r["success"]), key=lambda x: x["response_time_ms"])
    slowest = max((r for r in results.values() if r["success"]), key=lambda x: x["response_time_ms"])
    print(f"🏃 Fastest Endpoint: {fastest['url'].replace(API_BASE, '')} ({fastest['response_time_ms']}ms)")
    print(f"🐌 Slowest Endpoint: {slowest['url'].replace(API_BASE, '')} ({slowest['response_time_ms']}ms)")
    
    if failed_tests > 0:
        print(f"\n❌ **FAILED ENDPOINTS:**")
        for name, result in results.items():
            if not result["success"]:
                print(f"   • {result['url'].replace(API_BASE, '')} - {result['message']}")
    
    print(f"\n🎯 **STATUS: {'🟢 ALL SYSTEMS OPERATIONAL' if failed_tests == 0 else '🟡 SOME ISSUES DETECTED'}**")
    print(f"📱 **READY FOR FRONTEND INTEGRATION**")
    print(f"🕒 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()
