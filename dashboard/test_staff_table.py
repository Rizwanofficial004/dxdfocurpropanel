#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import Staff

try:
    count = Staff.objects.count()
    print(f"✅ Staff table exists with {count} records")
    
    # Let's also check the actual table name
    print(f"✅ Table name: {Staff._meta.db_table}")
    
except Exception as e:
    print(f"❌ Error accessing Staff table: {e}")
