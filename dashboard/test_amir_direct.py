"""
Direct Test - Amir's Screenshot Intervals
Test the exact URL: http://localhost:5000/api/screenshots/user/amirishaque67@gmail.com/intervals
"""

import requests
import json
from datetime import datetime

def test_amir_intervals_direct():
    url = "http://localhost:5000/api/screenshots/user/amirishaque67@gmail.com/intervals"
    
    print("🧪 TESTING AMIR'S INTERVALS - DIRECT")
    print("=" * 60)
    print(f"🔗 URL: {url}")
    print(f"📅 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    try:
        print("📡 Making request...")
        start_time = datetime.now()
        
        response = requests.get(url, timeout=60)  # Extended timeout for large datasets
        
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds()
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"⏱️  Response Time: {response_time:.2f} seconds")
        print(f"📏 Response Size: {len(response.text):,} bytes")
        print(f"📋 Content Type: {response.headers.get('content-type', 'Unknown')}")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS! Processing response...")
            print("-" * 40)
            
            try:
                data = response.json()
                
                # Print formatted JSON response
                print("📄 FULL RESPONSE:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                
                # Extract and analyze key information
                print("\n📊 ANALYSIS:")
                print("-" * 20)
                
                status = data.get('status', 'unknown')
                print(f"🔸 Status: {status}")
                
                if status == 'success':
                    print("🎉 INTERVALS DATA RETRIEVED SUCCESSFULLY!")
                    
                    # User info
                    user_email = data.get('user_email', 'N/A')
                    total_screenshots = data.get('total_screenshots', 0)
                    print(f"👤 User: {user_email}")
                    print(f"📸 Total Screenshots: {total_screenshots:,}")
                    
                    # Date range
                    if 'date_range' in data:
                        date_range = data['date_range']
                        print(f"📅 First Screenshot: {date_range.get('first_screenshot', 'N/A')}")
                        print(f"📅 Last Screenshot: {date_range.get('last_screenshot', 'N/A')}")
                        print(f"📊 Active Days: {date_range.get('total_days', 0)}")
                    
                    # Interval statistics
                    if 'interval_statistics' in data:
                        stats = data['interval_statistics']
                        print(f"⏱️  Total Intervals: {stats.get('total_intervals', 0):,}")
                        print(f"⏱️  Average Interval: {stats.get('average_interval_minutes', 0):.2f} minutes")
                        print(f"⚡ Min Interval: {stats.get('min_interval_minutes', 0):.2f} minutes")
                        print(f"🕐 Max Interval: {stats.get('max_interval_minutes', 0):.2f} minutes")
                    
                    # Daily breakdown
                    if 'daily_breakdown' in data:
                        daily = data['daily_breakdown']
                        print(f"📅 Days with Data: {len(daily)}")
                        if daily:
                            # Show top 5 most active days
                            sorted_days = sorted(daily.items(), key=lambda x: x[1], reverse=True)[:5]
                            print("🏆 Top 5 Most Active Days:")
                            for i, (date, count) in enumerate(sorted_days, 1):
                                print(f"   {i}. {date}: {count:,} screenshots")
                    
                    # Recent intervals
                    if 'recent_intervals' in data:
                        recent = data['recent_intervals']
                        print(f"🔄 Recent Intervals Available: {len(recent)}")
                        if recent:
                            print("📋 Latest 3 Intervals:")
                            for i, interval in enumerate(recent[-3:], 1):
                                from_time = interval.get('from_time', 'N/A')
                                to_time = interval.get('to_time', 'N/A')
                                interval_min = interval.get('interval_minutes', 0)
                                print(f"   {i}. {from_time} → {to_time}")
                                print(f"      ⏱️  Gap: {interval_min:.2f} minutes")
                
                elif status == 'error':
                    error_msg = data.get('error', 'Unknown error')
                    print(f"❌ ERROR: {error_msg}")
                    
                    if 'SignatureDoesNotMatch' in error_msg:
                        print("🔑 AWS CREDENTIALS ISSUE")
                        print("   - AWS signature mismatch")
                        print("   - Check AWS access keys")
                        print("   - Verify region settings")
                    elif 'No screenshots' in error_msg:
                        print("📸 NO DATA FOUND")
                        print("   - User folder may be empty")
                        print("   - Check S3 folder structure")
                    else:
                        print("🔧 OTHER ERROR")
                        print(f"   - Details: {error_msg}")
                
                elif status == 'no_data':
                    print("⚠️  NO SCREENSHOT DATA")
                    print("   - User exists but no screenshots found")
                    print("   - Check S3 folder structure")
                
                else:
                    print(f"❓ UNKNOWN STATUS: {status}")
                
            except json.JSONDecodeError:
                print("❌ INVALID JSON RESPONSE")
                print(f"📝 Raw response: {response.text[:500]}...")
        
        elif response.status_code == 404:
            print("\n❌ 404 NOT FOUND")
            print("🔧 Possible issues:")
            print("   - Flask route not configured correctly")
            print("   - Email format issue in URL")
            print("   - Server not running")
            
        elif response.status_code == 500:
            print("\n❌ 500 INTERNAL SERVER ERROR")
            print("🔧 Server-side issue:")
            print(f"📝 Response: {response.text[:300]}...")
            
        else:
            print(f"\n❌ UNEXPECTED STATUS: {response.status_code}")
            print(f"📝 Response: {response.text[:300]}...")
    
    except requests.exceptions.ConnectionError:
        print("\n❌ CONNECTION ERROR")
        print("🔧 Server not accessible:")
        print("   - Check if Flask server is running")
        print("   - Verify localhost:5000 is available")
        print("   - Check firewall settings")
    
    except requests.exceptions.Timeout:
        print(f"\n⏱️  TIMEOUT ERROR (>60 seconds)")
        print("🔧 Request took too long:")
        print("   - Large dataset processing")
        print("   - Server performance issue")
        print("   - Network latency")
    
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {str(e)}")
        print(f"🔧 Error type: {type(e).__name__}")
    
    finally:
        print("\n" + "=" * 60)
        print("🏁 TEST COMPLETED")
        print(f"🕐 End Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    test_amir_intervals_direct()
