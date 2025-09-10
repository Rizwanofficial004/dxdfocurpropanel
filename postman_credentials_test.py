#!/usr/bin/env python3
"""
Postman Test Script for Credentials API
This script shows the exact request format for testing in Postman
"""

import requests
import json

# API Configuration
BASE_URL = "http://127.0.0.1:8000"
ENDPOINT = "/api/set-all-credentials/"
FULL_URL = f"{BASE_URL}{ENDPOINT}"

def test_aws_credentials():
    """Test AWS credentials only"""
    
    aws_data = {
        "credential_name": "AWS Production Config",
        "credential_type": "aws",
        "description": "Production AWS S3 configuration",
        "aws_access_key_id": "AKIAIOSFODNN7EXAMPLE",
        "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY",
        "aws_region": "us-east-1",
        "aws_bucket_name": "my-production-bucket",
        "environment": "production",
        "is_active": True,
        "is_default": True
    }
    
    print("=== AWS CREDENTIALS TEST ===")
    print(f"URL: {FULL_URL}")
    print(f"Method: POST")
    print(f"Content-Type: application/json")
    print(f"Body (JSON):")
    print(json.dumps(aws_data, indent=2))
    
    try:
        response = requests.post(
            FULL_URL,
            json=aws_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n✅ Response Status: {response.status_code}")
        print(f"Response Body:")
        print(json.dumps(response.json(), indent=2))
        
    except Exception as e:
        print(f"❌ Error: {e}")

def test_database_credentials():
    """Test Database credentials only"""
    
    db_data = {
        "credential_name": "Database Production Config",
        "credential_type": "database",
        "description": "Production MySQL database",
        "db_host": "db-production.company.com",
        "db_port": "3306",
        "db_name": "production_app",
        "db_username": "app_user",
        "db_password": "super_secure_password_123",
        "db_type": "mysql",
        "environment": "production",
        "is_active": True,
        "is_default": True
    }
    
    print("\n=== DATABASE CREDENTIALS TEST ===")
    print(f"URL: {FULL_URL}")
    print(f"Method: POST")
    print(f"Content-Type: application/json")
    print(f"Body (JSON):")
    print(json.dumps(db_data, indent=2))
    
    try:
        response = requests.post(
            FULL_URL,
            json=db_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n✅ Response Status: {response.status_code}")
        print(f"Response Body:")
        print(json.dumps(response.json(), indent=2))
        
    except Exception as e:
        print(f"❌ Error: {e}")

def test_combined_credentials():
    """Test AWS + Database + OpenAI credentials together"""
    
    combined_data = {
        "credential_name": "Complete Production Config",
        "credential_type": "general",
        "description": "All production services configuration",
        
        # AWS Credentials
        "aws_access_key_id": "AKIATEST123456789012",
        "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY",
        "aws_region": "us-west-2",
        "aws_bucket_name": "company-production-bucket",
        
        # Database Credentials
        "db_host": "prod-db.company.com",
        "db_port": "5432",
        "db_name": "main_app_db",
        "db_username": "db_admin",
        "db_password": "extremely_secure_password_2025",
        "db_type": "postgresql",
        
        # OpenAI Credentials
        "openai_api_key": "sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        "openai_organization": "org-company123456789",
        
        # Auth Credentials
        "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        
        # General Settings
        "environment": "production",
        "is_active": True,
        "is_default": True
    }
    
    print("\n=== COMBINED CREDENTIALS TEST ===")
    print(f"URL: {FULL_URL}")
    print(f"Method: POST")
    print(f"Content-Type: application/json")
    print(f"Body (JSON):")
    print(json.dumps(combined_data, indent=2))
    
    try:
        response = requests.post(
            FULL_URL,
            json=combined_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n✅ Response Status: {response.status_code}")
        print(f"Response Body:")
        print(json.dumps(response.json(), indent=2))
        
    except Exception as e:
        print(f"❌ Error: {e}")

def show_postman_instructions():
    """Show instructions for Postman testing"""
    
    print("\n" + "="*60)
    print("📬 POSTMAN TESTING INSTRUCTIONS")
    print("="*60)
    print()
    print("1. 🌐 SETUP:")
    print(f"   URL: {FULL_URL}")
    print("   Method: POST")
    print("   Content-Type: application/json")
    print()
    print("2. 📋 HEADERS:")
    print("   Key: Content-Type")
    print("   Value: application/json")
    print()
    print("3. 📦 BODY (select 'raw' and 'JSON'):")
    print()
    print("   📘 For AWS Only:")
    print("   {")
    print('     "credential_name": "My AWS Config",')
    print('     "credential_type": "aws",')
    print('     "aws_access_key_id": "AKIAIOSFODNN7EXAMPLE",')
    print('     "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY",')
    print('     "aws_region": "us-east-1",')
    print('     "aws_bucket_name": "my-bucket",')
    print('     "environment": "production"')
    print("   }")
    print()
    print("   📗 For Database Only:")
    print("   {")
    print('     "credential_name": "My Database Config",')
    print('     "credential_type": "database",')
    print('     "db_host": "localhost",')
    print('     "db_port": "3306",')
    print('     "db_name": "myapp",')
    print('     "db_username": "admin",')
    print('     "db_password": "password123",')
    print('     "db_type": "mysql",')
    print('     "environment": "development"')
    print("   }")
    print()
    print("4. 🚀 EXPECTED RESPONSE:")
    print("   Status: 201 Created")
    print("   Body: JSON with credential details")
    print()
    print("5. 🔍 TO RETRIEVE CREDENTIALS:")
    print(f"   URL: {BASE_URL}/api/get-all-credentials/")
    print("   Method: GET")
    print("   No body required")
    print()
    print("="*60)

if __name__ == "__main__":
    print("🚀 CREDENTIALS API POSTMAN TESTING")
    print("="*50)
    
    # Show Postman instructions first
    show_postman_instructions()
    
    # Run individual tests
    print("\n🧪 RUNNING TEST EXAMPLES:")
    test_aws_credentials()
    test_database_credentials()
    test_combined_credentials()
    
    print("\n✅ All tests completed!")
    print("📌 Use the instructions above to test in Postman")
