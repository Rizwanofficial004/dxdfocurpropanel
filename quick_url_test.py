#!/usr/bin/env python3
"""
Simple API test to check URL formats
"""
import requests

def test_api_urls():
    """Test the API and check URL formats"""
    
    url = "https://dxdtime.ddsolutions.io/api/live-tracking/fast-screenshots/"
    
    try:
        print("Testing API...")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Get users
            users = data.get('data', {}).get('s3_users_sample', [])
            print(f"Found {len(users)} users")
            
            if users:
                user = users[0]
                print(f"\nFirst user has {user.get('file_count', 0)} files")
                
                # Check latest URL
                latest_url = user.get('latest_file_url', '')
                print(f"\nLatest file URL:")
                print(latest_url)
                
                # Check URL type
                if 'ddsfocustime.s3.eu-north-1.amazonaws.com' in latest_url and '?' not in latest_url:
                    print("✅ DIRECT S3 URL - SUCCESS!")
                elif 'ddsfocustime.s3' in latest_url and '?' in latest_url:
                    print("❌ SIGNED URL - Still old format")
                else:
                    print("⚠️ UNKNOWN URL FORMAT")
                
                # Check screenshots
                screenshots = user.get('screenshots', [])
                if screenshots:
                    print(f"\nFirst screenshot URL:")
                    first_screenshot_url = screenshots[0].get('file_url', '')
                    print(first_screenshot_url)
                    
                    if 'ddsfocustime.s3.eu-north-1.amazonaws.com' in first_screenshot_url and '?' not in first_screenshot_url:
                        print("✅ SCREENSHOT DIRECT S3 URL - SUCCESS!")
                    elif 'ddsfocustime.s3' in first_screenshot_url and '?' in first_screenshot_url:
                        print("❌ SCREENSHOT SIGNED URL - Still old format")
                    else:
                        print("⚠️ UNKNOWN SCREENSHOT URL FORMAT")
        else:
            print(f"Error: {response.status_code}")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api_urls()
