import requests
import json

def test_customers_api():
    """Test the customers API endpoint and compare with expected data"""
    try:
        url = "http://127.0.0.1:8000/api/customers"
        print("🧪 TESTING CUSTOMERS API ENDPOINT")
        print("=" * 50)
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            customers_data = data.get('data', {})
            stats = customers_data.get('statistics', {})
            breakdown = customers_data.get('breakdown', {})
            
            print("✅ SUCCESS - Retrieved customers data")
            print(f"Timestamp: {data.get('timestamp', 'N/A')}")
            print(f"Data Source: {customers_data.get('source', 'Unknown')}")
            
            print(f"\n📊 === CUSTOMERS STATISTICS ===")
            print(f"Total Customers: {stats.get('total', 'N/A')}")
            print(f"Active Customers: {stats.get('active', 'N/A')}")
            print(f"Inactive Customers: {stats.get('inactive', 'N/A')}")
            print(f"Growth Rate: {stats.get('growth_rate', 'N/A')}")
            
            print(f"\n📈 === BREAKDOWN ===")
            print(f"Active: {breakdown.get('active', 'N/A')}")
            print(f"Inactive: {breakdown.get('inactive', 'N/A')}")
            print(f"Total: {breakdown.get('total', 'N/A')}")
            
            # Expected values from your request
            expected_stats = {
                "total": 437,
                "active": 281,
                "inactive": 156,
                "growth_rate": "+12.5%"
            }
            
            print(f"\n🎯 === VALIDATION AGAINST EXPECTED VALUES ===")
            all_correct = True
            
            for key, expected_value in expected_stats.items():
                actual_value = stats.get(key, 'N/A')
                
                # Handle growth_rate as string comparison
                if key == "growth_rate":
                    is_correct = actual_value == expected_value
                else:
                    is_correct = actual_value == expected_value
                
                status = "✅ CORRECT" if is_correct else "❌ INCORRECT"
                
                if not is_correct:
                    all_correct = False
                
                field_name = key.replace('_', ' ').title()
                print(f"{field_name}: {actual_value} (expected {expected_value}) {status}")
            
            # Check if totals add up correctly
            active = stats.get('active', 0)
            inactive = stats.get('inactive', 0)
            total = stats.get('total', 0)
            
            print(f"\n🔢 === MATHEMATICAL VALIDATION ===")
            calculated_total = active + inactive
            math_correct = calculated_total == total
            print(f"Active + Inactive = {active} + {inactive} = {calculated_total}")
            print(f"Total from API = {total}")
            print(f"Math Check: {'✅ CORRECT' if math_correct else '❌ INCORRECT'}")
            
            # Show sample customer data if available
            customers_list = customers_data.get('customers', [])
            if customers_list:
                print(f"\n👥 === SAMPLE CUSTOMER DATA ===")
                print(f"Total Customer Records Retrieved: {len(customers_list)}")
                
                # Show first few customers
                for i, customer in enumerate(customers_list[:3]):
                    print(f"Customer {i+1}:")
                    print(f"  ID: {customer.get('id', 'N/A')}")
                    print(f"  Company: {customer.get('company', 'N/A')}")
                    print(f"  Email: {customer.get('email', 'N/A')}")
                    print(f"  Active: {customer.get('active', 'N/A')}")
                    print(f"  Date Created: {customer.get('datecreated', 'N/A')}")
            else:
                print(f"\n👥 === NO SAMPLE DATA ===")
                print("No individual customer records returned (using aggregated data)")
            
            print(f"\n🏆 === FINAL RESULT ===")
            if all_correct and math_correct:
                print("🎉 ALL CUSTOMER DATA IS ACCURATE!")
                print("💰 The API returns correct statistics matching your CRM interface!")
            else:
                print("⚠️  SOME CUSTOMER DATA NEEDS VERIFICATION")
                if not all_correct:
                    print("❌ Statistics don't match expected values")
                if not math_correct:
                    print("❌ Mathematical totals don't add up correctly")
                
        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Detail: {error_data.get('detail', response.text)}")
            except:
                print(f"Error Text: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing customers API: {str(e)}")

if __name__ == "__main__":
    test_customers_api()
