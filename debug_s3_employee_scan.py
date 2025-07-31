"""
Debug the S3 employee scanning function to see why it's not finding employees
"""
import sys
sys.path.append('c:/Users/DDS/Desktop/Git-Projects/dxdfocurpropanel/dxdfocurpropanel')

# Set up Django environment
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dxdfocurpropanel.settings')
django.setup()

# Now we can import Django modules
from dashboard.get_employee_screenshots import get_all_employees_from_s3
from dashboard.aws_utils import get_s3_client

def debug_s3_employee_scan():
    """Debug why the S3 employee scan is not working"""
    
    print("🔍 Debug S3 Employee Scanning")
    print("=" * 50)
    
    # Test 1: Direct S3 client test
    print("\n1️⃣ Testing S3 Client Connection")
    try:
        s3_client = get_s3_client()
        bucket_name = "ddsfocustime"
        
        # Test basic connection
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="screenshots/",
            MaxKeys=5
        )
        
        if 'Contents' in response:
            print(f"   ✅ S3 connection works - found {len(response['Contents'])} objects")
            for obj in response['Contents'][:3]:
                print(f"     • {obj['Key']}")
        else:
            print("   ❌ No objects found with prefix 'screenshots/'")
            
    except Exception as e:
        print(f"   ❌ S3 connection failed: {e}")
        return
    
    # Test 2: Test the employee scanning function
    print("\n2️⃣ Testing get_all_employees_from_s3() Function")
    try:
        employees = get_all_employees_from_s3()
        print(f"   Found {len(employees)} employees:")
        
        for emp in employees:
            if isinstance(emp, dict):
                print(f"     • {emp.get('email', 'N/A')} (folder: {emp.get('folder', 'N/A')})")
            else:
                print(f"     • {emp}")
                
    except Exception as e:
        print(f"   ❌ Employee scanning failed: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 3: Manual prefix scanning
    print("\n3️⃣ Manual Prefix Scanning")
    try:
        s3_client = get_s3_client()
        
        # List with delimiter to get folders
        response = s3_client.list_objects_v2(
            Bucket="ddsfocustime",
            Prefix="screenshots/",
            Delimiter='/',
            MaxKeys=100
        )
        
        print(f"   CommonPrefixes found: {len(response.get('CommonPrefixes', []))}")
        for prefix_info in response.get('CommonPrefixes', []):
            prefix = prefix_info['Prefix']
            print(f"     • Prefix: {prefix}")
            
            # Convert to email
            email_folder = prefix.replace('screenshots/', '').rstrip('/')
            if '_at_' in email_folder:
                email = email_folder.replace('_at_', '@')
                print(f"       → Email: {email}")
    
    except Exception as e:
        print(f"   ❌ Manual scanning failed: {e}")
    
    # Test 4: Test search pattern matching
    print("\n4️⃣ Testing Search Pattern Matching")
    test_email = "amirishaque67@gmail.com"
    search_terms = ["amir", "haque", "gmail", "amirishaque67", test_email]
    
    for search_term in search_terms:
        print(f"   Testing '{search_term}' against '{test_email}':")
        
        # Simulate the search logic from the search API
        email = test_email
        username = email.split('@')[0]  # amirishaque67
        search_lower = search_term.lower()
        
        matches = (
            search_lower in email.lower() or 
            search_lower in username.lower()
        )
        
        print(f"     • Email match: {search_lower in email.lower()}")
        print(f"     • Username match: {search_lower in username.lower()}")
        print(f"     • Overall match: {matches}")

if __name__ == "__main__":
    debug_s3_employee_scan()
