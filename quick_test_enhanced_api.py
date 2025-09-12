#!/usr/bin/env python3
"""
Quick test for the Enhanced Date Range Logs API
"""

import requests
import json

def test_enhanced_api():
    """Test the enhanced date range logs API"""
    
    base_url = "http://localhost:8000/api"
    
    print("🚀 Testing Enhanced Date Range Logs API")
    print("="*50)
    
    # Test 1: Predefined time range
    try:
        url = f"{base_url}/logs/date-range/"
        params = {'time_range': 'last_7_days', 'limit': '3'}
        
        print(f"📋 Testing: {url}")
        print(f"📋 Parameters: {params}")
        
        response = requests.get(url, params=params, timeout=30)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {data.get('message', 'No message')}")
            
            if 'data' in data:
                result_data = data['data']
                print(f"📈 Total Count: {result_data.get('total_count', 0)}")
                print(f"📈 Returned Count: {result_data.get('returned_count', 0)}")
                
                if 'logs' in result_data and result_data['logs']:
                    print(f"📋 Sample Log: {result_data['logs'][0].get('file_name', 'Unknown')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📋 Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    # Test 2: Calendar API
    try:
        print("\n" + "="*50)
        print("📅 Testing Calendar API")
        
        url = f"{base_url}/logs/calendar/"
        params = {'month': '9', 'year': '2025'}
        
        print(f"📋 Testing: {url}")
        print(f"📋 Parameters: {params}")
        
        response = requests.get(url, params=params, timeout=30)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {data.get('message', 'No message')}")
            
            if 'data' in data:
                result_data = data['data']
                print(f"📈 Days with logs: {result_data.get('total_days_with_logs', 0)}")
                print(f"📈 Total logs: {result_data.get('total_logs', 0)}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📋 Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    print("\n🎉 Enhanced API Test Completed!")

if __name__ == "__main__":
    test_enhanced_api()
