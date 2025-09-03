import os
import sys
import django

def start_django_server():
    print("🚀 STARTING DJANGO SERVER DIRECTLY")
    print("=" * 50)
    
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
    
    try:
        print("📦 Setting up Django...")
        django.setup()
        print("✅ Django setup successful")
        
        print("🔧 Starting development server...")
        from django.core.management import execute_from_command_line
        
        # Start the server
        execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000'])
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
    except Exception as e:
        print(f"💥 Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    start_django_server()
