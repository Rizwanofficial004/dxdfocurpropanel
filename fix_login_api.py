#!/usr/bin/env python
"""
Fix Login API - Create Admin User with Proper Password
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from django.contrib.auth.models import User
from dashboard.models import Staff

def fix_login_api():
    """Fix login API by ensuring admin user exists with correct credentials"""
    
    print("🔧 Fixing Login API...")
    
    # 1. Create or update Admin user
    try:
        admin_user = User.objects.get(username='Admin')
        print(f"✅ Admin user found: {admin_user.username}")
    except User.DoesNotExist:
        admin_user = User.objects.create_user(
            username='Admin',
            email='admin@dds.com',
            password='admin123',
            is_staff=True,
            is_superuser=True,
            first_name='Admin',
            last_name='User'
        )
        print(f"✅ Admin user created: {admin_user.username}")
    
    # 2. Set/update password
    admin_user.set_password('admin123')
    admin_user.is_active = True
    admin_user.save()
    print("✅ Admin password set to: admin123")
    
    # 3. Create corresponding Staff entry if it doesn't exist
    try:
        staff = Staff.objects.get(email='admin@dds.com')
        print(f"✅ Staff entry found: {staff.firstname} {staff.lastname}")
    except Staff.DoesNotExist:
        staff = Staff.objects.create(
            staffid='ADM001',
            firstname='Admin',
            lastname='User', 
            email='admin@dds.com'
        )
        print(f"✅ Staff entry created: {staff.firstname} {staff.lastname}")
    
    # 4. Test authentication
    from django.contrib.auth import authenticate
    test_user = authenticate(username='Admin', password='admin123')
    
    if test_user:
        print("✅ Authentication test PASSED")
        print(f"   User ID: {test_user.id}")
        print(f"   Username: {test_user.username}")
        print(f"   Email: {test_user.email}")
        print(f"   Is Active: {test_user.is_active}")
        print(f"   Is Staff: {test_user.is_staff}")
    else:
        print("❌ Authentication test FAILED")
        return False
    
    # 5. Create test users
    test_users = [
        ('user1', 'user1@dds.com', 'password123'),
        ('testuser', 'test@example.com', 'testpass123')
    ]
    
    for username, email, password in test_users:
        try:
            user = User.objects.get(username=username)
            print(f"✅ Test user exists: {username}")
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=True
            )
            print(f"✅ Test user created: {username}")
    
    print("\n🎉 Login API Fix Complete!")
    print("\n📋 Test Credentials:")
    print("   Username: Admin")
    print("   Password: admin123")
    print("\n🧪 Test the API:")
    print("   URL: POST https://dxdtime.ddsolutions.io/api/auth/login/")
    print("   Body: {\"username\": \"Admin\", \"password\": \"admin123\"}")
    
    return True

if __name__ == "__main__":
    fix_login_api()
