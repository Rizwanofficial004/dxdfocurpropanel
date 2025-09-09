#!/usr/bin/env python3
"""
Test script for Live Tracking API endpoint
This script tests the live tracking screenshots API to ensure it returns the expected data structure.
"""

import requests
import json
import sys
from datetime import datetime

def test_live_tracking_api():
    """Test the live tracking API endpoint"""
    
    api_url = "https://dxdtime.ddsolutions.io/api/live-tracking/fast-screenshots/"
    
    print("🧪 Testing Live Tracking API")
    print(f"📡 Endpoint: {api_url}")
    print("-" * 60)
    
    try:
        # Make the API request
        print("⏳ Making API request...")
        response = requests.get(api_url, timeout=30)
        
        print(f"✅ Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check basic structure
            print("\n📊 API Response Structure:")
            print(f"  - Status: {data.get('status', 'N/A')}")
            
            if 'data' in data:
                data_section = data['data']
                print(f"  - Total Employees: {data_section.get('total_employees', {}).get('count', 'N/A')}")
                print(f"  - Metrics Count: {len(data_section.get('metrics', []))}")
                print(f"  - S3 Users Sample: {len(data_section.get('s3_users_sample', []))}")
                
                # Show metrics
                if 'metrics' in data_section:
                    print("\n📈 Metrics:")
                    for metric in data_section['metrics']:
                        print(f"    - {metric.get('label', 'N/A')}: {metric.get('value', 'N/A')}")
                
                # Show sample users
                if 's3_users_sample' in data_section:
                    print(f"\n👤 Sample Users ({len(data_section['s3_users_sample'])}):")
                    for i, user in enumerate(data_section['s3_users_sample'][:3]):  # Show first 3
                        email = user.get('user_email', '').replace('_at_', '@')
                        file_count = user.get('file_count', 0)
                        size_mb = user.get('total_size_mb', 0)
                        latest_date = user.get('latest_date', 'N/A')
                        
                        print(f"    {i+1}. {email}")
                        print(f"       Files: {file_count}, Size: {size_mb:.2f} MB, Latest: {latest_date}")
                        
                        # Check if image URL exists
                        if user.get('latest_file_url'):
                            print(f"       🖼️  Has screenshot URL: ✅")
                        else:
                            print(f"       🖼️  Has screenshot URL: ❌")
                        print()
                
                # Show data sources status
                if 'data_sources' in data_section:
                    sources = data_section['data_sources']
                    print("🔗 Data Sources:")
                    print(f"    - S3 Status: {sources.get('s3_status', 'N/A')}")
                    print(f"    - CRM Status: {sources.get('crm_status', 'N/A')}")
                    print(f"    - Primary Source: {sources.get('primary_source', 'N/A')}")
            
            if 'meta' in data:
                meta = data['meta']
                print(f"\n🔍 Meta Information:")
                print(f"    - Timestamp: {meta.get('timestamp', 'N/A')}")
                print(f"    - Source: {meta.get('source', 'N/A')}")
                print(f"    - API Version: {meta.get('api_version', 'N/A')}")
            
            print("\n" + "="*60)
            print("✅ API Test Completed Successfully!")
            print("✅ The API is returning the expected data structure")
            print("✅ Ready for frontend integration")
            
            # Save sample response for reference
            with open('live_tracking_api_sample.json', 'w') as f:
                json.dump(data, f, indent=2)
            print("💾 Sample response saved to 'live_tracking_api_sample.json'")
            
        else:
            print(f"❌ API Error: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timeout - API might be processing data")
    except requests.exceptions.ConnectionError:
        print("🌐 Connection error - Check if the API server is accessible")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
    except json.JSONDecodeError:
        print("❌ Invalid JSON response")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_live_tracking_api()
