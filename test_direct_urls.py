#!/usr/bin/env python3
"""
Test script to verify direct S3 URLs are working correctly
"""
import requests
import json

def test_api():
    """Test the live tracking API and verify URL format"""
    
    # API endpoint
    url = "https://dxdtime.ddsolutions.io/api/live-tracking/fast-screenshots/"
    
    try:
        print("Testing Live Tracking API...")
        print(f"URL: {url}")
        print("-" * 50)
        
        # Make request
        response = requests.get(url, timeout=30)
        
        # Check response status
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds():.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            
            # Display summary
            summary = data.get('data', {}).get('summary', {})
            print(f"\nSummary:")
            print(f"- Total Users: {summary.get('total_count', 0)}")
            print(f"- S3 Files: {summary.get('s3_files', 0)}")
            print(f"- S3 Size: {summary.get('s3_size_gb', 0)} GB")
            
            # Debug: Check the structure
            print(f"\nDebug - Response structure:")
            print(f"- Main keys: {list(data.keys())}")
            if 'data' in data:
                print(f"- Data keys: {list(data['data'].keys())}")
            
            # Check URL format for first user
            users = data.get('data', {}).get('s3_users_sample', [])
            
            print(f"- Found {len(users)} users in s3_users_sample")
            
            if users:
                first_user = users[0]
                print(f"\nFirst User Sample:")
                print(f"- Email: {first_user.get('email', 'N/A')}")
                print(f"- File Count: {first_user.get('file_count', 0)}")
                
                # Check latest file URL format
                latest_url = first_user.get('latest_file_url')
                print(f"- Latest File URL: {latest_url}")
                
                # Check if it's direct S3 URL format
                if latest_url:
                    if "ddsfocustime.s3.eu-north-1.amazonaws.com" in latest_url:
                        print("✓ URL is in direct S3 format")
                        if "?" not in latest_url:
                            print("✓ No query parameters (authentication-free)")
                        else:
                            print("⚠ URL still contains query parameters")
                    else:
                        print("⚠ URL is not in expected direct S3 format")
                
                # Check screenshots array
                screenshots = first_user.get('screenshots', [])
                if screenshots:
                    print(f"\nScreenshots Sample (showing first 3 of {len(screenshots)}):")
                    for i, screenshot in enumerate(screenshots[:3]):
                        file_url = screenshot.get('file_url', '')
                        filename = screenshot.get('filename', '')
                        print(f"  {i+1}. {filename}")
                        print(f"     URL: {file_url}")
                        
                        # Verify URL format
                        if "ddsfocustime.s3.eu-north-1.amazonaws.com" in file_url and "?" not in file_url:
                            print("     ✓ Direct S3 URL format")
                        else:
                            print("     ⚠ Unexpected URL format")
                        print()
                else:
                    print("\nNo screenshots found in response")
            else:
                print("\nNo users found in response")
            
            print(f"\nAPI Test Completed Successfully!")
            
        else:
            print(f"Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error testing API: {str(e)}")

if __name__ == "__main__":
    test_api()
