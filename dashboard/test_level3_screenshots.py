"""
Test Level 3 API - Individual Screenshots in Folder
"""

import requests
import json
import urllib.parse

def test_level3_screenshots():
    print("📸 TESTING LEVEL 3 API - INDIVIDUAL SCREENSHOTS")
    print("=" * 60)
    
    # From Level 2 result, we know Beyza has this folder
    email = "beyza-donmez-@hotmail.com"
    folder_name = "DDS_2025_Yılı_Ocak_Genel_Reklam_Planlama_ve_Paylaşım_Yönetimi"
    
    # URL encode the folder name
    encoded_folder = urllib.parse.quote(folder_name, safe='')
    
    print(f"👤 Employee: {email}")
    print(f"📁 Folder: {folder_name}")
    print(f"🔗 Encoded Folder: {encoded_folder}")
    print()
    
    # Test 1: Basic Level 3 API
    print("1️⃣ TESTING: Basic Level 3 API")
    print("-" * 40)
    
    url = f"http://localhost:8000/api/screenshots/employee/{email}/folder/{encoded_folder}/"
    
    print(f"🔗 URL: {url}")
    
    try:
        response = requests.get(url, timeout=15)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            
            # Parse response
            if 'data' in data:
                folder_data = data['data']
                screenshots = folder_data.get('screenshots', [])
                
                print(f"📸 Total Screenshots: {len(screenshots)}")
                print(f"📁 Folder Info: {folder_data.get('folder_info', {})}")
                
                # Show first 5 screenshots
                print(f"\n📷 FIRST 5 SCREENSHOTS:")
                for i, screenshot in enumerate(screenshots[:5]):
                    print(f"   {i+1}. {screenshot.get('filename', 'N/A')}")
                    print(f"      📅 Date: {screenshot.get('date', 'N/A')}")
                    print(f"      🔗 URL: {screenshot.get('url', 'N/A')[:50]}...")
                    print()
                
                if len(screenshots) > 5:
                    print(f"   ... and {len(screenshots) - 5} more screenshots")
                    
            else:
                print(f"📋 Full Response: {json.dumps(data, indent=2)[:500]}...")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📋 Response: {response.text[:300]}...")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 2: Enhanced Level 3 API
    print(f"\n2️⃣ TESTING: Enhanced Level 3 API")
    print("-" * 40)
    
    enhanced_url = f"http://localhost:8000/api/screenshots/employee/{email}/folder/{encoded_folder}/enhanced/"
    
    print(f"🔗 Enhanced URL: {enhanced_url}")
    
    try:
        params = {
            'limit': 10,
            'page': 1
        }
        
        response = requests.get(enhanced_url, params=params, timeout=15)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            
            if 'data' in data:
                print(f"📊 Success: {data.get('success', False)}")
                print(f"💬 Message: {data.get('message', 'N/A')}")
                
                folder_data = data['data']
                screenshots = folder_data.get('screenshots', [])
                pagination = folder_data.get('pagination', {})
                
                print(f"📸 Screenshots (Page 1): {len(screenshots)}")
                print(f"📄 Total Pages: {pagination.get('total_pages', 0)}")
                print(f"📊 Total Count: {pagination.get('total_count', 0)}")
                
                # Show screenshots with better formatting
                print(f"\n📷 SCREENSHOTS (Enhanced):")
                for i, screenshot in enumerate(screenshots[:3]):
                    print(f"   {i+1}. {screenshot.get('filename', 'N/A')}")
                    print(f"      📅 Timestamp: {screenshot.get('timestamp', 'N/A')}")
                    print(f"      📏 Size: {screenshot.get('size_mb', 'N/A')} MB")
                    print(f"      🖼️  Type: {screenshot.get('file_type', 'N/A')}")
                    print(f"      🔗 Preview: {screenshot.get('url', 'N/A')[:60]}...")
                    print()
            else:
                print(f"📋 Response: {json.dumps(data, indent=2)[:500]}...")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📋 Response: {response.text[:300]}...")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # Test 3: Folder Stats API
    print(f"\n3️⃣ TESTING: Folder Statistics API")
    print("-" * 40)
    
    stats_url = f"http://localhost:8000/api/screenshots/employee/{email}/folder/{encoded_folder}/stats/"
    
    print(f"🔗 Stats URL: {stats_url}")
    
    try:
        response = requests.get(stats_url, timeout=10)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            print(f"📋 Stats: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📋 Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print(f"\n🎯 API ENDPOINTS TESTED:")
    print("=" * 60)
    print("✅ Level 2: Employee Folders (Already Working)")
    print("🔄 Level 3: Individual Screenshots (Testing)")
    print("🔄 Enhanced: With Pagination")
    print("🔄 Stats: Folder Statistics")

if __name__ == "__main__":
    test_level3_screenshots()
