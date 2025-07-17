#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from django.contrib.auth.models import User

# Set admin password
try:
    admin_user = User.objects.get(username='admin')
    admin_user.set_password('admin123')
    admin_user.save()
    print("✅ Admin password set successfully")
    print(f"Username: admin")
    print(f"Password: admin123")
except User.DoesNotExist:
    print("❌ Admin user not found")
except Exception as e:
    print(f"❌ Error: {e}")
