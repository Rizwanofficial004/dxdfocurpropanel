import urllib.request
import urllib.parse
import json

def test_level3_api_nawaz():
    """Test Level 3 API - Screenshots in a specific folder for nawaz"""
    
    # Test with the first folder that has many screenshots
    employee_email = "nawaz@dxdglobal.com"
    folder_name = "DSSFocus_Pro_Admin_Panel_Task"  # 1000 screenshots
    
    # API endpoint
    base_url = f"http://127.0.0.1:8000/api/screenshots/employee/{employee_email}/folder/{urllib.parse.quote(folder_name)}/"
    
    print(f"🔍 Testing Level 3 API")
    print(f"   Employee: {employee_email}")
    print(f"   Folder: {folder_name}")
    print(f"   URL: {base_url}")
    
    try:
        # Make the API request
        request = urllib.request.Request(base_url)
        
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            print(f"✅ API Response:")
            print(f"   Status: {result.get('success', False)}")
            print(f"   Message: {result.get('message', 'No message')}")
            
            # Print data
            data = result.get('data', {})
            
            print(f"📊 Data Keys: {list(data.keys())}")
            
            screenshots = data.get('screenshots', [])
            metadata = data.get('metadata', {})
            pagination = data.get('pagination', {})
            
            print(f"📊 Metadata:")
            print(f"   Employee: {metadata.get('employee_email', 'N/A')}")
            print(f"   Folder: {metadata.get('folder_name', 'N/A')}")
            print(f"   S3 Prefix: {metadata.get('s3_prefix', 'N/A')}")
            
            print(f"📊 Pagination:")
            print(f"   Total Screenshots: {pagination.get('total_screenshots', 0)}")
            print(f"   Page: {pagination.get('current_page', 0)} of {pagination.get('total_pages', 0)}")
            print(f"   Per Page: {pagination.get('per_page', 0)}")
            
            print(f"📷 Found {len(screenshots)} screenshots on this page:")
            for i, screenshot in enumerate(screenshots[:5], 1):  # Show first 5
                print(f"   {i}. {screenshot.get('filename', 'N/A')}")
                print(f"      Size: {screenshot.get('size_mb', 0)} MB")
                print(f"      Date: {screenshot.get('timestamp', 'N/A')}")
                print(f"      URL: {screenshot.get('presigned_url', 'N/A')[:50]}...")
                
            if len(screenshots) > 5:
                print(f"   ... and {len(screenshots) - 5} more screenshots")
            
            return result
    
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        return None

if __name__ == "__main__":
    print("🔍 Testing Level 3 API for nawaz screenshot folder")
    test_level3_api_nawaz()
