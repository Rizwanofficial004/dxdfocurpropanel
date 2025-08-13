#!/usr/bin/env python3
"""
API Response Demo - Shows what your Postman should return
"""

import json
from datetime import datetime

def main():
    print("🚀 Screenshot Count API Demo")
    print("=" * 60)
    print("This is what your Postman API should return:")
    print("URL: http://127.0.0.1:8010/api/users/screenshots-count/")
    print("=" * 60)
    
    # Sample response based on the real data from your database
    sample_response = {
        "success": True,
        "timestamp": datetime.now().isoformat(),
        "total_users": 34,
        "total_screenshots": 1933961,
        "last_update": "2025-08-13T12:25:13.009315",
        "users": [
            {
                "user_email": "ilahe.avci2004@gmail.com",
                "screenshot_count": 611337,
                "percentage": 31.61
            },
            {
                "user_email": "tugbacalik84@gmail.com",
                "screenshot_count": 325703,
                "percentage": 16.84
            },
            {
                "user_email": "begumdamlasen@gmail.com",
                "screenshot_count": 280375,
                "percentage": 14.50
            },
            {
                "user_email": "gulsummelisa.23@gmail.com",
                "screenshot_count": 153901,
                "percentage": 7.96
            },
            {
                "user_email": "yurukelmenekse@gmail.com",
                "screenshot_count": 100761,
                "percentage": 5.21
            },
            {
                "user_email": "amirishaque67@gmail.com",
                "screenshot_count": 64824,
                "percentage": 3.35
            },
            {
                "user_email": "deniz@dxdglobal.com",
                "screenshot_count": 58,
                "percentage": 0.003
            },
            {
                "user_email": "atakankahraman35@outlook.com",
                "screenshot_count": 53258,
                "percentage": 2.75
            },
            {
                "user_email": "cagla.shr@gmail.com",
                "screenshot_count": 45873,
                "percentage": 2.37
            },
            {
                "user_email": "mahboub.sad@gmail.com",
                "screenshot_count": 34969,
                "percentage": 1.81
            }
        ],
        "query_params": {
            "limit": None,
            "sort_by": "count",
            "order": "desc",
            "min_count": 0
        }
    }
    
    print("\n📊 JSON Response:")
    print(json.dumps(sample_response, indent=2))
    
    print("\n📈 Summary:")
    print(f"   👥 Total Users: {sample_response['total_users']}")
    print(f"   📸 Total Screenshots: {sample_response['total_screenshots']:,}")
    
    print(f"\n🔝 Top Employees by Screenshot Count:")
    for i, user in enumerate(sample_response['users'][:5], 1):
        email = user['user_email']
        count = user['screenshot_count']
        percentage = user['percentage']
        print(f"   {i}. {email}: {count:,} screenshots ({percentage}%)")
    
    print("\n" + "=" * 60)
    print("🎯 To test in Postman:")
    print("1. Make sure URL is: http://127.0.0.1:8010/api/users/screenshots-count/")
    print("2. Method: GET")
    print("3. No authentication needed")
    print("4. Should return data like above")
    print("\n💡 Try these URL parameters:")
    print("   ?limit=5           - Get top 5 users only")
    print("   ?sort_by=count     - Sort by screenshot count")
    print("   ?min_count=1000    - Only users with 1000+ screenshots")
    print("=" * 60)

if __name__ == "__main__":
    main()
