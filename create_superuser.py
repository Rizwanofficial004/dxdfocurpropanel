#!/usr/bin/env python3
"""
Create Django superuser for production
Username: dds-admin
Password: 1234
"""
import os
import sys
import django

# Setup Django
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')

try:
    django.setup()
    from django.contrib.auth.models import User
    
    def create_superuser():
        username = "dds-admin"
        email = "dds-admin@ddsolutions.io"
        password = "1234"
        
        print(f"Creating superuser: {username}")
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"❌ User '{username}' already exists!")
            print("Updating password...")
            user = User.objects.get(username=username)
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.save()
            print(f"✅ Password updated for user '{username}'")
        else:
            # Create new superuser
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f"✅ Superuser '{username}' created successfully!")
        
        print("\n" + "="*50)
        print("SUPERUSER CREDENTIALS:")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print(f"Email: {email}")
        print("="*50)
        print("\nYou can now log in to:")
        print("- Django Admin: http://localhost:8000/admin/")
        print("- API Login: http://localhost:8000/api/auth/login/")
        
    if __name__ == "__main__":
        create_superuser()
        
except Exception as e:
    print(f"Error: {e}")
    print("Make sure Django is properly configured and the database is accessible.")
