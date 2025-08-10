#!/usr/bin/env python3
"""
Settings APIs Test Script
Comprehensive testing for UI Settings, Credentials, and Application Settings APIs
"""
import requests
import json
import time
from datetime import datetime

# API Configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api/settings"

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"🔧 {title}")
    print(f"{'='*60}")

def print_test(endpoint, description):
    """Print test information"""
    print(f"\n📡 Testing: {description}")
    print(f"🌐 Endpoint: {endpoint}")
    print("-" * 40)

def print_result(response, start_time):
    """Print API response result"""
    duration = time.time() - start_time
    status_icon = "✅" if response.status_code == 200 else "❌"
    
    print(f"{status_icon} Status: {response.status_code} | Time: {duration:.2f}s")
    
    try:
        data = response.json()
        print(f"📄 Response: {json.dumps(data, indent=2)}")
    except:
        print(f"📄 Response: {response.text[:500]}...")

def test_ui_settings_api():
    """Test UI Settings API"""
    print_header("UI Settings API Tests")
    
    # Test 1: Create/Update UI Settings
    ui_settings_data = {
        "setting_name": "dashboard_theme",
        "font_family": "Roboto, sans-serif",
        "font_size": "18px",
        "primary_color": "#3498db",
        "secondary_color": "#2ecc71",
        "background_color": "#ffffff",
        "text_color": "#2c3e50",
        "theme_mode": "light",
        "sidebar_collapsed": False,
        "is_global": True
    }
    
    print_test(f"{API_BASE}/ui/", "Create/Update UI Settings (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/ui/", json=ui_settings_data)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Get UI Settings
    print_test(f"{API_BASE}/ui/", "Get UI Settings (GET)")
    start_time = time.time()
    try:
        response = requests.get(f"{API_BASE}/ui/?setting_name=dashboard_theme")
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Update with different colors
    ui_settings_update = {
        "setting_name": "dark_theme",
        "font_family": "Open Sans, sans-serif",
        "font_size": "16px",
        "primary_color": "#e74c3c",
        "secondary_color": "#f39c12",
        "background_color": "#2c3e50",
        "text_color": "#ecf0f1",
        "theme_mode": "dark",
        "sidebar_collapsed": True,
        "is_global": True
    }
    
    print_test(f"{API_BASE}/ui/", "Create Dark Theme Settings (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/ui/", json=ui_settings_update)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")

def test_credentials_api():
    """Test Credentials API"""
    print_header("Credentials API Tests")
    
    # Test 1: Create OpenAI Credentials
    openai_credentials = {
        "name": "openai_production",
        "credential_type": "openai",
        "description": "OpenAI API credentials for production",
        "api_key": "sk-1234567890abcdef1234567890abcdef",
        "is_active": True,
        "is_production": True,
        "additional_config": {
            "model": "gpt-4",
            "max_tokens": 4000,
            "temperature": 0.7
        }
    }
    
    print_test(f"{API_BASE}/credentials/", "Create OpenAI Credentials (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/credentials/", json=openai_credentials)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Create AWS Credentials
    aws_credentials = {
        "name": "aws_s3_production",
        "credential_type": "aws",
        "description": "AWS S3 credentials for file storage",
        "access_key": "AKIAIOSFODNN7EXAMPLE",
        "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "additional_config": {
            "region": "us-east-1",
            "bucket_name": "my-app-storage"
        },
        "is_active": True,
        "is_production": True
    }
    
    print_test(f"{API_BASE}/credentials/", "Create AWS Credentials (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/credentials/", json=aws_credentials)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Create Database Credentials
    db_credentials = {
        "name": "postgres_main",
        "credential_type": "database",
        "description": "Main PostgreSQL database connection",
        "username": "db_user",
        "password": "super_secure_password_123",
        "host": "localhost",
        "port": 5432,
        "database_name": "production_db",
        "additional_config": {
            "ssl_mode": "require",
            "pool_size": 20
        },
        "is_active": True,
        "is_production": True
    }
    
    print_test(f"{API_BASE}/credentials/", "Create Database Credentials (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/credentials/", json=db_credentials)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Get All Credentials
    print_test(f"{API_BASE}/credentials/", "Get All Credentials (GET)")
    start_time = time.time()
    try:
        response = requests.get(f"{API_BASE}/credentials/")
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Get Specific Credential
    print_test(f"{API_BASE}/credentials/", "Get OpenAI Credentials (GET)")
    start_time = time.time()
    try:
        response = requests.get(f"{API_BASE}/credentials/?name=openai_production")
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")

def test_app_settings_api():
    """Test Application Settings API"""
    print_header("Application Settings API Tests")
    
    # Test 1: Create String Setting
    string_setting = {
        "key": "app_name",
        "value": "DDS Focus Time Dashboard",
        "setting_type": "string",
        "category": "general",
        "description": "Application display name",
        "is_public": True,
        "is_editable": True
    }
    
    print_test(f"{API_BASE}/app/", "Create String Setting (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/app/", json=string_setting)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Create Integer Setting
    integer_setting = {
        "key": "max_users",
        "value": "100",
        "setting_type": "integer",
        "category": "limits",
        "description": "Maximum number of users allowed",
        "is_public": False,
        "is_editable": True
    }
    
    print_test(f"{API_BASE}/app/", "Create Integer Setting (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/app/", json=integer_setting)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Create Boolean Setting
    boolean_setting = {
        "key": "maintenance_mode",
        "value": "false",
        "setting_type": "boolean",
        "category": "system",
        "description": "Enable maintenance mode",
        "is_public": True,
        "is_editable": True
    }
    
    print_test(f"{API_BASE}/app/", "Create Boolean Setting (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/app/", json=boolean_setting)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Create JSON Setting
    json_setting = {
        "key": "email_config",
        "value": json.dumps({
            "smtp_host": "smtp.gmail.com",
            "smtp_port": 587,
            "use_tls": True,
            "from_email": "noreply@dds.com"
        }),
        "setting_type": "json",
        "category": "email",
        "description": "Email configuration settings",
        "is_public": False,
        "is_editable": True
    }
    
    print_test(f"{API_BASE}/app/", "Create JSON Setting (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/app/", json=json_setting)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Get All Settings
    print_test(f"{API_BASE}/app/", "Get All App Settings (GET)")
    start_time = time.time()
    try:
        response = requests.get(f"{API_BASE}/app/")
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 6: Get Settings by Category
    print_test(f"{API_BASE}/app/", "Get Settings by Category (GET)")
    start_time = time.time()
    try:
        response = requests.get(f"{API_BASE}/app/?category=system")
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")

def test_bulk_settings_api():
    """Test Bulk Settings API"""
    print_header("Bulk Settings API Tests")
    
    bulk_data = {
        "ui_settings": [
            {
                "setting_name": "mobile_theme",
                "font_family": "Arial, sans-serif",
                "font_size": "14px",
                "primary_color": "#007bff",
                "secondary_color": "#6c757d",
                "background_color": "#f8f9fa",
                "text_color": "#495057",
                "theme_mode": "light",
                "sidebar_collapsed": True,
                "is_global": True
            }
        ],
        "credentials": [
            {
                "name": "smtp_gmail",
                "credential_type": "smtp",
                "description": "Gmail SMTP for sending emails",
                "username": "admin@dds.com",
                "password": "app_specific_password_123",
                "host": "smtp.gmail.com",
                "port": 587,
                "additional_config": {
                    "use_tls": True,
                    "use_ssl": False
                },
                "is_active": True,
                "is_production": False
            }
        ],
        "app_settings": [
            {
                "key": "session_timeout",
                "value": "3600",
                "setting_type": "integer",
                "category": "security",
                "description": "Session timeout in seconds",
                "is_public": False,
                "is_editable": True
            },
            {
                "key": "enable_notifications",
                "value": "true",
                "setting_type": "boolean",
                "category": "features",
                "description": "Enable push notifications",
                "is_public": True,
                "is_editable": True
            }
        ]
    }
    
    print_test(f"{API_BASE}/bulk/", "Bulk Settings Creation (POST)")
    start_time = time.time()
    try:
        response = requests.post(f"{API_BASE}/bulk/", json=bulk_data)
        print_result(response, start_time)
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run all API tests"""
    print(f"🚀 Starting Settings APIs Test Suite")
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Base URL: {BASE_URL}")
    
    # Run all tests
    test_ui_settings_api()
    test_credentials_api()
    test_app_settings_api()
    test_bulk_settings_api()
    
    print_header("Test Summary")
    print("✅ All Settings API tests completed!")
    print("📋 Check the responses above for detailed results")
    print("\n💡 Available Endpoints:")
    print("   POST /api/settings/ui/           - UI Settings Management")
    print("   POST /api/settings/credentials/  - Credentials Management")
    print("   POST /api/settings/app/          - Application Settings")
    print("   POST /api/settings/bulk/         - Bulk Operations")
    print("\n📚 All endpoints support both GET and POST methods")
    print("🔒 Consider adding authentication for production use")

if __name__ == "__main__":
    main()
