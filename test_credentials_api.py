#!/usr/bin/env python3
"""
Test script for the Credentials Management API
Tests both SET and GET endpoints for AWS, Database, OpenAI, and Auth credentials
"""

import requests
import json

# API Base URL
BASE_URL = "http://127.0.0.1:8000/api"

def test_set_credentials():
    """Test setting credentials using the SetAllCredentialsAPIView"""
    
    # Test data for comprehensive credentials
    test_data = {
        # AWS Credentials
        "aws_access_key_id": "AKIATEST123456789012",
        "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY",
        "aws_region": "us-west-2",
        "aws_bucket_name": "my-app-bucket",
        
        # Database Credentials
        "db_host": "localhost",
        "db_port": 3306,
        "db_name": "myapp_db",
        "db_username": "db_admin",
        "db_password": "secure_password123",
        "db_type": "mysql",
        
        # OpenAI Credentials
        "openai_api_key": "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yzabc567def890",
        "openai_organization": "org-123456789",
        
        # Auth Credentials
        "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token.signature",
        "auth_base_url": "https://api.myapp.com/v1",
        "auth_expires_at": "2024-12-31T23:59:59Z"
    }
    
    print("=== Testing SET ALL CREDENTIALS API ===")
    print(f"URL: {BASE_URL}/set-all-credentials/")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/set-all-credentials/",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Data: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ Credentials set successfully!")
            return True
        else:
            print("❌ Failed to set credentials")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_credentials():
    """Test getting credentials using the GetAllCredentialsAPIView"""
    
    print("\n=== Testing GET ALL CREDENTIALS API ===")
    print(f"URL: {BASE_URL}/get-all-credentials/")
    
    try:
        response = requests.get(f"{BASE_URL}/get-all-credentials/")
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Data: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Credentials retrieved successfully!")
            return True
        else:
            print("❌ Failed to get credentials")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_credentials_with_filters():
    """Test getting credentials with type filters"""
    
    print("\n=== Testing GET CREDENTIALS WITH FILTERS ===")
    
    # Test filtering by credential type
    credential_types = ['aws', 'database', 'openai', 'auth']
    
    for cred_type in credential_types:
        print(f"\n--- Testing filter: {cred_type} ---")
        try:
            response = requests.get(
                f"{BASE_URL}/get-all-credentials/",
                params={'type': cred_type}
            )
            
            print(f"Status: {response.status_code}")
            print(f"Data: {json.dumps(response.json(), indent=2)}")
            
        except Exception as e:
            print(f"❌ Error for {cred_type}: {e}")

def test_partial_credentials():
    """Test setting partial credentials (only some fields)"""
    
    print("\n=== Testing PARTIAL CREDENTIALS SET ===")
    
    # Test with only AWS credentials
    aws_only_data = {
        "aws_access_key_id": "AKIAPARTIAL123456789",
        "aws_secret_access_key": "partialSecretKey/ExampleOnly",
        "aws_region": "eu-west-1"
    }
    
    print(f"Setting only AWS credentials: {json.dumps(aws_only_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/set-all-credentials/",
            json=aws_only_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run all credential API tests"""
    print("🚀 Starting Credentials API Tests")
    print("=" * 50)
    
    # Test setting credentials
    set_success = test_set_credentials()
    
    # Test getting credentials
    get_success = test_get_credentials()
    
    # Test filtering
    test_get_credentials_with_filters()
    
    # Test partial set
    test_partial_credentials()
    
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"SET API: {'✅ PASSED' if set_success else '❌ FAILED'}")
    print(f"GET API: {'✅ PASSED' if get_success else '❌ FAILED'}")
    print("\n🎉 Credentials API testing completed!")

if __name__ == "__main__":
    main()
