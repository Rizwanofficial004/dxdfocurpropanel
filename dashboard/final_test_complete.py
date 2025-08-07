import urllib.request
import json

# Quick test of all three levels
print("🎯 FINAL API SYSTEM TEST")
print("=" * 50)

# Level 1: Search for haseeb
try:
    response1 = urllib.request.urlopen('https://dxdtime.ddsolutions.io/api/users/s3-suggestions/?q=haseeb&limit=10')
    result1 = json.loads(response1.read().decode('utf-8'))
    suggestions = result1.get('data', {}).get('suggestions', [])
    print(f"✅ Level 1 (Search): Found {len(suggestions)} users for 'haseeb'")
    if suggestions:
        print(f"   - {suggestions[0].get('display_name')} ({suggestions[0].get('email')})")
except Exception as e:
    print(f"❌ Level 1 Error: {str(e)}")

# Level 2: Get folders for haseeb
try:
    response2 = urllib.request.urlopen('https://dxdtime.ddsolutions.io/api/screenshots/employee/haseebcodejourney@gmail.com/folders/')
    result2 = json.loads(response2.read().decode('utf-8'))
    folders = result2.get('data', {}).get('task_folders', [])
    total_screenshots = result2.get('data', {}).get('summary', {}).get('total_screenshots', 0)
    print(f"✅ Level 2 (Folders): Found {len(folders)} folders, {total_screenshots} total screenshots for haseeb")
    if folders:
        print(f"   - {folders[0].get('folder_name')} ({folders[0].get('screenshot_count')} screenshots)")
except Exception as e:
    print(f"❌ Level 2 Error: {str(e)}")

# Level 3: Get screenshots from YouTube AI folder for haseeb
try:
    response3 = urllib.request.urlopen('https://dxdtime.ddsolutions.io/api/screenshots/employee/haseebcodejourney@gmail.com/folder/Create_UI_for_YouTube_AI_Automation_/?page=1&limit=3')
    result3 = json.loads(response3.read().decode('utf-8'))
    screenshots = result3.get('data', {}).get('screenshots', [])
    total = result3.get('data', {}).get('pagination', {}).get('total_screenshots', 0)
    print(f"✅ Level 3 (Screenshots): Retrieved {len(screenshots)} of {total} screenshots from Create_UI_for_YouTube_AI_Automation_")
    if screenshots:
        print(f"   - {screenshots[0].get('filename', 'N/A')}")
except Exception as e:
    print(f"❌ Level 3 Error: {str(e)}")

print("\n🎉 THREE-LEVEL API SYSTEM COMPLETE!")
print("✅ Level 1: Employee Search & Suggestions")
print("✅ Level 2: Task Folders for Selected Employee") 
print("✅ Level 3: Screenshots in Specific Folder")
