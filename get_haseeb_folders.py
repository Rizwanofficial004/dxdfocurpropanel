import urllib.request
import json

# Get folders for haseebcodejourney@gmail.com
try:
    response = urllib.request.urlopen('https://dxdtime.ddsolutions.io/api/screenshots/employee/haseebcodejourney@gmail.com/folders/')
    result = json.loads(response.read().decode('utf-8'))
    folders = result.get('data', {}).get('task_folders', [])
    
    print('📁 Available folders for haseebcodejourney@gmail.com:')
    for i, folder in enumerate(folders[:5], 1):
        folder_name = folder.get('folder_name', 'N/A')
        screenshot_count = folder.get('screenshot_count', 0)
        print(f'{i}. {folder_name} ({screenshot_count} screenshots)')
        
        # Generate Level 3 URL for this folder
        if i == 1:  # Show URL for first folder
            import urllib.parse
            encoded_folder = urllib.parse.quote(folder_name)
            level3_url = f"https://dxdtime.ddsolutions.io/api/screenshots/employee/haseebcodejourney@gmail.com/folder/{encoded_folder}/?page=1&limit=3"
            print(f"   📋 Level 3 URL: {level3_url}")
            
except Exception as e:
    print(f"❌ Error: {str(e)}")
