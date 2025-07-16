#!/usr/bin/env python3
"""
Test script to verify Level 3 API fix
"""
import requests
import json
import os

# Set environment variables
os.environ['AWS_ACCESS_KEY_ID'] = 'AKIARSU6EUUWMQ5I2JWC'
os.environ['AWS_SECRET_ACCESS_KEY'] = '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'

def test_level3_api():
    """Test the Level 3 API after fixes"""
    print("🚀 Testing Level 3 API - Employee Folder Screenshots")
    print("=" * 60)
    
    # Test URL
    url = 'https://dxdtime.ddsolutions.io/api/screenshots/employee/haseebcodejourney@gmail.com/folder/Create_UI_for_YouTube_AI_Automation_/?page=1&limit=3'
    
    print(f"🔗 Testing URL: {url}")
    print()
    
    try:
        response = requests.get(url, timeout=30)
        print(f"✅ API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Success: {data.get('success', False)}")
            print(f"💬 Message: {data.get('message', 'No message')}")
            
            if data.get('success') and 'data' in data:
                response_data = data['data']
                screenshots = response_data.get('screenshots', [])
                
                print(f"\n📸 Screenshots Found: {len(screenshots)}")
                
                for i, screenshot in enumerate(screenshots[:3], 1):
                    print(f"\n📷 Screenshot {i}:")
                    print(f"   Filename: {screenshot.get('filename', 'N/A')}")
                    print(f"   S3 Key: {screenshot.get('s3_key', 'N/A')}")
                    
                    presigned_url = screenshot.get('presigned_url')
                    if presigned_url:
                        print(f"   Presigned URL: {presigned_url[:100]}...")
                        
                        # Test the presigned URL
                        try:
                            test_response = requests.head(presigned_url, timeout=10)
                            if test_response.status_code == 200:
                                print(f"   ✅ Image accessible (Status: {test_response.status_code})")
                                content_type = test_response.headers.get('Content-Type', 'Unknown')
                                content_length = test_response.headers.get('Content-Length', 'Unknown')
                                print(f"   Content-Type: {content_type}")
                                print(f"   Content-Length: {content_length} bytes")
                            else:
                                print(f"   ❌ Image not accessible (Status: {test_response.status_code})")
                        except Exception as e:
                            print(f"   ❌ Error accessing image: {e}")
                    else:
                        print(f"   ❌ No presigned URL generated")
                
                # Test pagination info
                pagination = response_data.get('pagination', {})
                print(f"\n📊 Pagination Info:")
                print(f"   Current Page: {pagination.get('current_page', 'N/A')}")
                print(f"   Total Pages: {pagination.get('total_pages', 'N/A')}")
                print(f"   Total Screenshots: {pagination.get('total_screenshots', 'N/A')}")
                
            else:
                print(f"❌ API returned unsuccessful response")
                
        else:
            print(f"❌ API Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_level3_api()
