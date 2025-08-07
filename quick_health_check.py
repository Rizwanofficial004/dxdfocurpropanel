#!/usr/bin/env python
"""
Quick Health Check for Production Server
Run this on your production server to quickly identify the 500 error cause

Usage: python quick_health_check.py
"""

import os
import sys
import subprocess
import json

def run_command(cmd, description):
    """Run a command and return the result"""
    print(f"🔍 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"✅ {description}: SUCCESS")
            return True, result.stdout.strip()
        else:
            print(f"❌ {description}: FAILED")
            print(f"   Error: {result.stderr.strip()}")
            return False, result.stderr.strip()
    except subprocess.TimeoutExpired:
        print(f"⏰ {description}: TIMEOUT")
        return False, "Command timed out"
    except Exception as e:
        print(f"❌ {description}: ERROR - {e}")
        return False, str(e)

def check_python_packages():
    """Check if critical Python packages are installed"""
    print("\n📦 CHECKING PYTHON PACKAGES")
    print("=" * 50)
    
    packages = [
        'django',
        'boto3',
        'corsheaders',
        'dotenv',
        'requests'
    ]
    
    missing_packages = []
    
    for package in packages:
        success, output = run_command(f"python -c 'import {package}; print({package}.__version__ if hasattr({package}, \"__version__\") else \"installed\")'", f"Checking {package}")
        if not success:
            missing_packages.append(package)
        else:
            print(f"   Version: {output}")
    
    if missing_packages:
        print(f"\n❌ MISSING PACKAGES: {', '.join(missing_packages)}")
        print(f"🔧 Install with: pip install {' '.join(missing_packages)}")
        return False
    else:
        print("✅ All required packages are installed")
        return True

def check_environment_variables():
    """Check critical environment variables"""
    print("\n🌍 CHECKING ENVIRONMENT VARIABLES")
    print("=" * 50)
    
    required_vars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_REGION',
        'AWS_STORAGE_BUCKET_NAME'
    ]
    
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: SET (length: {len(value)})")
        else:
            print(f"❌ {var}: NOT SET")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n❌ MISSING ENVIRONMENT VARIABLES: {', '.join(missing_vars)}")
        print("🔧 Create .env file with these variables")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

def check_django_setup():
    """Check if Django can start properly"""
    print("\n🐍 CHECKING DJANGO SETUP")
    print("=" * 50)
    
    # Test Django import and setup
    django_test = """
import os
import sys
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()
from django.conf import settings
print(f"DEBUG={settings.DEBUG}")
print(f"ALLOWED_HOSTS={settings.ALLOWED_HOSTS}")
print(f"AWS_ACCESS_KEY_ID={'SET' if hasattr(settings, 'AWS_ACCESS_KEY_ID') and settings.AWS_ACCESS_KEY_ID else 'NOT_SET'}")
"""
    
    success, output = run_command(f'python -c "{django_test}"', "Django setup test")
    if success:
        print(f"   Django output: {output}")
        return True
    return False

def check_database_migration():
    """Check if database migrations are applied"""
    print("\n🗄️ CHECKING DATABASE MIGRATIONS")
    print("=" * 50)
    
    success, output = run_command("python manage.py showmigrations --plan", "Checking migration status")
    if success:
        if "[ ]" in output:
            print("❌ Some migrations are not applied")
            print("🔧 Run: python manage.py migrate")
            return False
        else:
            print("✅ All migrations are applied")
            return True
    return False

def test_direct_django():
    """Test Django development server directly"""
    print("\n🌐 TESTING DJANGO DEVELOPMENT SERVER")
    print("=" * 50)
    
    print("🔧 Starting Django development server on port 8001 for testing...")
    print("   This will help us bypass web server issues")
    
    # Test if port is available
    success, output = run_command("netstat -tuln | grep :8001 || echo 'Port 8001 is available'", "Checking port 8001")
    
    if "8001" not in output:
        print("✅ Port 8001 is available for testing")
        print("\n🔧 MANUAL TEST REQUIRED:")
        print("1. Run: python manage.py runserver 0.0.0.0:8001")
        print("2. Test: curl http://localhost:8001/api/screenshots/employee/haseebcodejourney@gmail.com/folders/")
        print("3. If this works, the issue is with your web server (Apache/Nginx)")
        print("4. If this fails, the issue is with Django configuration")
        return True
    else:
        print("⚠️ Port 8001 is already in use")
        return False

def check_file_permissions():
    """Check file permissions"""
    print("\n📁 CHECKING FILE PERMISSIONS")
    print("=" * 50)
    
    # Check current directory permissions
    success, output = run_command("ls -la .", "Checking current directory permissions")
    if success:
        print(f"   Current directory: {output.split()[-1] if output else 'unknown'}")
    
    # Check if Django files are readable
    files_to_check = [
        'manage.py',
        'DDS/settings.py',
        'db.sqlite3'
    ]
    
    all_good = True
    for file_path in files_to_check:
        if os.path.exists(file_path):
            success, output = run_command(f"ls -la {file_path}", f"Checking {file_path}")
            if not success:
                all_good = False
        else:
            print(f"⚠️ {file_path}: File not found")
            if file_path == 'db.sqlite3':
                print("   This might be normal if using external database")
    
    return all_good

def generate_fix_commands():
    """Generate commands to fix common issues"""
    print("\n🔧 AUTOMATIC FIX COMMANDS")
    print("=" * 50)
    
    print("# 1. Install missing packages")
    print("pip install django boto3 django-cors-headers python-dotenv requests")
    print()
    
    print("# 2. Apply database migrations")
    print("python manage.py migrate")
    print()
    
    print("# 3. Collect static files")
    print("python manage.py collectstatic --noinput")
    print()
    
    print("# 4. Test Django directly")
    print("python manage.py runserver 0.0.0.0:8001")
    print()
    
    print("# 5. Test API endpoint")
    print("curl http://localhost:8001/api/screenshots/employee/haseebcodejourney@gmail.com/folders/")
    print()
    
    print("# 6. Check web server logs")
    print("tail -f /var/log/apache2/error.log")
    print("# OR")
    print("tail -f /var/log/nginx/error.log")

def main():
    """Run all health checks"""
    print("🏥 PRODUCTION HEALTH CHECK")
    print("=" * 60)
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")
    print()
    
    # Run all checks
    checks = [
        check_python_packages,
        check_environment_variables,
        check_django_setup,
        check_database_migration,
        check_file_permissions,
        test_direct_django
    ]
    
    results = []
    for check in checks:
        try:
            result = check()
            results.append(result)
        except Exception as e:
            print(f"❌ Check {check.__name__} crashed: {e}")
            results.append(False)
        print()
    
    # Summary
    print("📊 HEALTH CHECK SUMMARY")
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Checks passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All health checks passed!")
        print("   The issue is likely with web server configuration.")
        print("   Try the Django development server test above.")
    else:
        print("❌ Some health checks failed.")
        print("   Fix the issues above before proceeding.")
    
    generate_fix_commands()

if __name__ == '__main__':
    main()
