#!/usr/bin/env python3
"""Test multiple pages to find the exact end point"""

import requests
import time

def test_multiple_pages():
    url = "http://dxdtime.ddsolutions.io/api/users/search/"
    
    base_params = {
        'q': 'beg',
        'start_date': '2025-09-01',
        'end_date': '2025-09-01',
        'screenshots_per_page': 100,
    }
    
    headers = {'Accept': 'application/json'}
    
    # Test pages around where data might end
    test_pages = [155, 156, 157, 158, 159, 160]
    
    print("🔍 Finding the exact end point of begumdamlasen's screenshots")
    print("-" * 70)
    
    for page in test_pages:
        params = base_params.copy()
        params['screenshots_page'] = page
        
        try:
            start_time = time.time()
            response = requests.get(url, params=params, headers=headers, timeout=30)
            end_time = time.time()
            
            if response.status_code == 200:
                data = response.json()
                users = data.get('data', {}).get('users', [])
                
                if users:
                    user = users[0]
                    load_more_info = user.get('load_more_info', {})
                    screenshots_count = user.get('current_page_screenshots', 0)
                    has_more = load_more_info.get('has_more', False)
                    
                    status = "🔄 More available" if has_more else "🏁 Last page"
                    
                    print(f"Page {page:3d}: {screenshots_count:3d} screenshots | {end_time-start_time:.1f}s | {status}")
                    
                    # If this is the last page with data, calculate total
                    if screenshots_count > 0 and not has_more:
                        total_screenshots = ((page - 1) * 100) + screenshots_count
                        print(f"")
                        print(f"🎯 EXACT TOTAL FOUND!")
                        print(f"📊 Total Screenshots: {total_screenshots}")
                        print(f"📄 Last Page: {page}")
                        print(f"📷 Last Page Count: {screenshots_count}")
                        break
                        
        except Exception as e:
            print(f"Page {page:3d}: Error - {str(e)}")

if __name__ == "__main__":
    test_multiple_pages()