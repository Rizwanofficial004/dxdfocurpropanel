#!/usr/bin/env python3
"""
Update Django superuser password
Username: dds-admin
New Password: 123456
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
    
    def update_password():
        username = "dds-admin"
        new_password = "123456"
        
        print(f"Updating password for user: {username}")
        
        try:
            # Get the user
            user = User.objects.get(username=username)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            print(f"✅ Password updated successfully for user '{username}'")
            print("\n" + "="*50)
            print("UPDATED SUPERUSER CREDENTIALS:")
            print(f"Username: {username}")
            print(f"New Password: {new_password}")
            print(f"Email: {user.email}")
            print("="*50)
            print("\nYou can now log in to:")
            print("- Django Admin: http://localhost:8000/admin/")
            print("- API Login: http://localhost:8000/api/auth/login/")
            
        except User.DoesNotExist:
            print(f"❌ User '{username}' not found!")
            print("Please create the user first with: python create_superuser.py")
            
    if __name__ == "__main__":
        update_password()
        
except Exception as e:
    print(f"Error: {e}")
    print("Make sure Django is properly configured and the database is accessible.")
