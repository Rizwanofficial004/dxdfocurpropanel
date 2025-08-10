import boto3

# Quick S3 Employee Search
print("🔍 QUICK S3 EMPLOYEE SEARCH")
print("=" * 40)

s3 = boto3.client('s3', 
    aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
    aws_secret_access_key='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',
    region_name='eu-north-1')

bucket = 'ddsfocustime'
print(f"📁 Searching bucket: {bucket}")

try:
    # Get all objects
    paginator = s3.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket)
    
    employees = set()
    total_objects = 0
    
    for page in pages:
        if 'Contents' in page:
            for obj in page['Contents']:
                total_objects += 1
                key = obj['Key']
                # Look for email patterns
                if '@' in key:
                    parts = key.split('/')
                    for part in parts:
                        if '@' in part and '.' in part and len(part) > 5:
                            employees.add(part)
    
    employee_list = sorted(list(employees))
    
    print(f"\n📊 RESULTS:")
    print(f"📄 Total objects in bucket: {total_objects}")
    print(f"👥 TOTAL EMPLOYEES: {len(employee_list)}")
    print()
    
    if employee_list:
        print("📋 ACTIVE EMPLOYEES LIST:")
        print("-" * 30)
        for i, emp in enumerate(employee_list, 1):
            print(f"{i:2d}. {emp}")
    else:
        print("⚠️ No employees found with email patterns")
    
except Exception as e:
    print(f"❌ Error: {e}")
