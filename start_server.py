import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
    print("🚀 Starting Django server...")
    print(f"Python path: {sys.path}")
    print(f"Django settings: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
    
    try:
        django.setup()
        print("✅ Django setup successful")
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        sys.exit(1)
    
    try:
        execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000'])
    except Exception as e:
        print(f"❌ Server start failed: {e}")
        sys.exit(1)
