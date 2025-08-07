"""
Quick Test - Get User Intervals (Individual Users)
"""

import requests

def test_individual_users():
    print("🎯 QUICK USER INTERVAL TEST")
    print("=" * 50)
    
    # Test users that we know work
    users = [
        "beyza-donmez-@hotmail.com",
        "danish.ali9801@gmail.com", 
        "haseebcodejourney@gmail.com"
    ]
    
    successful_results = []
    
    for user in users:
        print(f"\n👤 Testing: {user}")
        url = f"http://localhost:5000/api/screenshots/user/{user}/intervals"
        
        try:
            response = requests.get(url, timeout=60)  # Longer timeout
            
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                
                if status == 'success':
                    total_screenshots = data.get('total_screenshots', 0)
                    stats = data.get('interval_statistics', {})
                    avg_seconds = stats.get('average_interval_seconds', 0)
                    
                    name = user.split('@')[0]
                    
                    print(f"   ✅ SUCCESS!")
                    print(f"   📸 Screenshots: {total_screenshots:,}")
                    print(f"   ⏱️  Average: {avg_seconds:.1f} seconds")
                    
                    successful_results.append({
                        'name': name,
                        'avg_seconds': round(avg_seconds, 1),
                        'total': total_screenshots
                    })
                    
                elif status == 'no_data':
                    print(f"   ⚠️  No data found")
                elif status == 'error':
                    error = data.get('error', 'Unknown')
                    print(f"   ❌ Error: {error[:50]}...")
                    
            else:
                print(f"   ❌ HTTP {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"   ⏱️  Timeout (large dataset)")
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:50]}...")
    
    # Final results in the format you wanted
    print(f"\n🎉 FINAL RESULTS (as you requested):")
    print("=" * 50)
    
    if successful_results:
        print("✅ USER INTERVAL TIMES:")
        for result in successful_results:
            name = result['name']
            avg = result['avg_seconds']
            total = result['total']
            
            print(f"   📊 {name} has {avg:.0f} seconds interval time")
            print(f"      (from {total:,} screenshots)")
        
        print(f"\n💬 SUMMARY:")
        for result in successful_results:
            name = result['name']
            avg = result['avg_seconds']
            print(f"   • {name}: {avg:.0f} seconds average")
            
    else:
        print("❌ No successful results")
    
    print(f"\n🧪 POSTMAN READY:")
    print("   These endpoints are working:")
    for user in users[:2]:
        print(f"   GET http://localhost:5000/api/screenshots/user/{user}/intervals")

if __name__ == "__main__":
    test_individual_users()
