import requests
import json

def test_invoice_endpoints():
    """Test all invoice API endpoints"""
    base_url = "http://127.0.0.1:8000"
    
    print("🧪 TESTING INVOICE API ENDPOINTS")
    print("=" * 50)
    
    # Test 1: Get all invoices
    print("\n1️⃣ Testing GET /api/invoices")
    try:
        response = requests.get(f"{base_url}/api/invoices", timeout=10)
        if response.status_code == 200:
            data = response.json()
            stats = data.get('data', {}).get('statistics', {})
            financial = data.get('data', {}).get('financial', {})
            
            print("✅ SUCCESS - Invoice statistics:")
            print(f"   📊 Total Invoices: {stats.get('total', 'N/A')}")
            print(f"   💰 Total Paid: ${stats.get('total_paid', 'N/A'):,.2f}" if stats.get('total_paid') else f"   💰 Total Paid: {stats.get('total_paid', 'N/A')}")
            print(f"   ⏰ Overdue: ${stats.get('overdue', 'N/A'):,.2f}" if stats.get('overdue') else f"   ⏰ Overdue: {stats.get('overdue', 'N/A')}")
            print(f"   📈 Total Invoiced: ${stats.get('total_invoiced', 'N/A'):,.2f}" if stats.get('total_invoiced') else f"   📈 Total Invoiced: {stats.get('total_invoiced', 'N/A')}")
            print(f"   📊 Growth Rate: {stats.get('growth_rate', 'N/A')}")
            
            print("\n   💼 Financial Summary:")
            print(f"   💰 Paid: ${financial.get('total_paid', 'N/A'):,.2f}" if financial.get('total_paid') else f"   💰 Paid: {financial.get('total_paid', 'N/A')}")
            print(f"   ⏰ Overdue: ${financial.get('overdue', 'N/A'):,.2f}" if financial.get('overdue') else f"   ⏰ Overdue: {financial.get('overdue', 'N/A')}")
            print(f"   📈 Total: ${financial.get('total_invoiced', 'N/A'):,.2f}" if financial.get('total_invoiced') else f"   📈 Total: {financial.get('total_invoiced', 'N/A')}")
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    # Test 2: Get specific invoice by ID
    print("\n2️⃣ Testing GET /api/invoices/{id}")
    invoice_ids = [1, 123, 999]  # Test different IDs
    
    for invoice_id in invoice_ids:
        try:
            response = requests.get(f"{base_url}/api/invoices/{invoice_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                invoice = data.get('data', {})
                
                print(f"✅ SUCCESS - Invoice {invoice_id}:")
                print(f"   📄 Number: {invoice.get('number', 'N/A')}")
                print(f"   📊 Status: {invoice.get('status', 'N/A')}")
                print(f"   💰 Total: ${invoice.get('total', 'N/A')}" if invoice.get('total') else f"   💰 Total: {invoice.get('total', 'N/A')}")
                print(f"   👤 Client ID: {invoice.get('client_id', 'N/A')}")
                print(f"   📅 Created: {invoice.get('datecreated', 'N/A')}")
                print(f"   ⏰ Due Date: {invoice.get('due_date', 'N/A')}")
                print(f"   ✅ Paid Date: {invoice.get('paid_date', 'N/A')}")
            else:
                print(f"❌ FAILED - Invoice {invoice_id} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ ERROR for Invoice {invoice_id}: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎯 INVOICE ENDPOINT SUMMARY:")
    print("✅ GET /api/invoices - List all invoices with financial statistics")
    print("✅ GET /api/invoices/{id} - Get specific invoice details")
    print("📖 Full documentation: http://127.0.0.1:8000/docs")

if __name__ == "__main__":
    test_invoice_endpoints()
