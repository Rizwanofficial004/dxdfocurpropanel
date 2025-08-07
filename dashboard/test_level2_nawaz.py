import urllib.request
import urllib.parse
import json

def test_level2_api_nawaz():
    """Test Level 2 API - Task Folders for nawaz@dxdglobal.com"""
    
    # API endpoint
    base_url = "http://127.0.0.1:8000/api/screenshots/employee/nawaz@dxdglobal.com/folders/"
    
    print(f"🔍 Testing Level 2 API: {base_url}")
    
    try:
        # Make the API request
        request = urllib.request.Request(base_url)
        
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            print(f"✅ API Response:")
            print(f"   Status: {result.get('success', False)}")
            print(f"   Message: {result.get('message', 'No message')}")
            
            # Print folder data - check the actual structure
            data = result.get('data', {})
            
            # Check for different possible structures
            folders = data.get('folders', [])
            task_folders = data.get('task_folders', [])
            summary = data.get('summary', {})
            statistics = data.get('statistics', {})
            
            print(f"📊 Data Keys: {list(data.keys())}")
            
            # Use task_folders if folders is empty
            if not folders and task_folders:
                folders = task_folders
                
            # Use summary if statistics is empty
            if not statistics and summary:
                statistics = summary
            
            print(f"📊 Statistics:")
            print(f"   Total Folders: {statistics.get('total_folders', 0)}")
            print(f"   Total Screenshots: {statistics.get('total_screenshots', 0)}")
            print(f"   Active Folders: {statistics.get('active_folders', 0)}")
            print(f"   Date Range: {statistics.get('date_range', {}).get('start', 'N/A')} to {statistics.get('date_range', {}).get('end', 'N/A')}")
            
            print(f"📁 Found {len(folders)} folders:")
            for i, folder in enumerate(folders[:10], 1):  # Show first 10
                print(f"   {i}. {folder.get('folder_name', 'N/A')}")
                print(f"      Type: {folder.get('folder_type', 'N/A')}")
                print(f"      Screenshots: {folder.get('screenshot_count', 0)}")
                print(f"      Last Activity: {folder.get('last_activity', 'N/A')}")
                
            if len(folders) > 10:
                print(f"   ... and {len(folders) - 10} more folders")
            
            return result
    
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        return None

if __name__ == "__main__":
    print("🔍 Testing Level 2 API for nawaz@dxdglobal.com")
    test_level2_api_nawaz()
