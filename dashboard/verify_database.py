#!/usr/bin/env python
import os
import django
import sys
import sqlite3

# Add the project directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

# Test database connection directly
print("=== Testing SQLite Database ===")
db_path = "db.sqlite3"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if dashboard_staff table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='dashboard_staff';")
    result = cursor.fetchone()
    
    if result:
        print("✅ dashboard_staff table exists!")
        
        # Check table schema
        cursor.execute("PRAGMA table_info(dashboard_staff);")
        columns = cursor.fetchall()
        print(f"✅ Table columns: {[col[1] for col in columns]}")
        
        # Check if there are any records
        cursor.execute("SELECT COUNT(*) FROM dashboard_staff;")
        count = cursor.fetchone()[0]
        print(f"✅ Records in table: {count}")
        
    else:
        print("❌ dashboard_staff table does not exist!")
    
    conn.close()
else:
    print("❌ Database file db.sqlite3 not found!")

print("\n=== Testing Django Model ===")
try:
    from dashboard.models import Staff
    count = Staff.objects.count()
    print(f"✅ Django Staff model accessible with {count} records")
except Exception as e:
    print(f"❌ Error with Django Staff model: {e}")

print("\n=== Database Setup Complete ===")
