import requests
import json
import time

# Test the optimized API
url = "http://localhost:8000/api/users/search/?q=nawaz&page_size=100&page=1"
print(f"Testing OPTIMIZED API: {url}")
print("🚀 Optimizations applied:")
print("  - Reduced days from 7 to 3")
print("  - Increased cache time to 3 minutes") 
print("  - Added early termination at 1500 screenshots per day")
print("  - Increased workers from 8 to 10")
print("  - Added graceful S3 failure handling")
print()

try:
    start_time = time.time()
    response = requests.get(url, timeout=25)  # Increased timeout but should be much faster now
    request_time = (time.time() - start_time) * 1000
    
    print(f"⏱️  Total Request Time: {request_time:.1f}ms")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n✅ SUCCESS! Optimized API Response:")
        print(f"Status: {data.get('status')}")
        print(f"Message: {data.get('message')}")
        
        # Check pagination
        pagination = data.get('data', {}).get('pagination', {})
        print(f"\n📊 Pagination Info:")
        print(f"Page: {pagination.get('page')}")
        print(f"Per Page: {pagination.get('per_page')}")
        print(f"Total Pages: {pagination.get('total_pages')}")
        print(f"Total Count: {pagination.get('total_count')}")
        print(f"Has Next: {pagination.get('has_next')}")
        
        # Check performance - this is the key metric
        performance = data.get('data', {}).get('performance', {})
        api_time = performance.get('response_time_ms', 'N/A')
        print(f"\n⚡ PERFORMANCE COMPARISON:")
        print(f"API Processing Time: {api_time}ms")
        print(f"Total Request Time: {request_time:.1f}ms")
        print(f"Cached: {performance.get('cached')}")
        print(f"Cache Age: {performance.get('cache_age_seconds')}s")
        print(f"Optimization: {performance.get('optimization')}")
        
        # Check search results
        search_info = data.get('data', {}).get('search', {})
        print(f"\n🔍 Search Info:")
        print(f"Query: '{search_info.get('query')}'")
        print(f"Days Searched: {search_info.get('days_searched')}")
        print(f"Total Matches: {search_info.get('total_matches')}")
        
        # Check users
        users = data.get('data', {}).get('users', [])
        print(f"\n👥 Users Found: {len(users)}")
        if users:
            first_user = users[0]
            print(f"Sample User: {first_user.get('name')} ({first_user.get('email')})")
            print(f"Screenshots: {first_user.get('total_screenshots')}")
            print(f"Active Days: {first_user.get('active_days')}")
        
        # Check meta
        meta = data.get('meta', {})
        print(f"\n🔧 API Info:")
        print(f"Version: {meta.get('api_version')}")
        print(f"Allowed Page Sizes: {meta.get('allowed_page_sizes')}")
        print(f"Current Page Size: {meta.get('current_page_size')}")
        print(f"Features: {meta.get('features')}")
        
        # Performance evaluation
        print(f"\n🎯 SPEED EVALUATION:")
        if isinstance(api_time, (int, float)) and api_time < 2000:
            print(f"✅ EXCELLENT: API response in {api_time}ms (under 2 seconds)")
        elif isinstance(api_time, (int, float)) and api_time < 5000:
            print(f"✅ GOOD: API response in {api_time}ms (under 5 seconds)")
        elif isinstance(api_time, (int, float)):
            print(f"⚠️ SLOW: API response in {api_time}ms (over 5 seconds)")
        else:
            print(f"❓ Unknown API response time: {api_time}")
        
    else:
        print(f"❌ FAILED: HTTP {response.status_code}")
        print(response.text[:500])
        
except requests.exceptions.Timeout:
    print(f"❌ TIMEOUT: API took longer than 25 seconds")
    print("💡 Try again - first request builds cache, second should be much faster")
except Exception as e:
    print(f"❌ ERROR: {str(e)}")

print(f"\n💡 Tips for faster responses:")
print(f"  - First request builds cache (slow)")
print(f"  - Subsequent requests use cache (very fast)")
print(f"  - Use refresh=true to force cache rebuild")
print(f"  - Smaller page_size = faster response")