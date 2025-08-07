#!/usr/bin/env python3
"""
Test script for Users Summary API - generates demo data for testing
"""

import requests
import json
from datetime import datetime, timedelta
import random

def test_users_summary_api_with_demo_data():
    """Test the API endpoint with demo data"""
    
    print("🧪 Testing Users Summary API with Demo Data...")
    print("=" * 60)
    
    # Generate demo data that matches your requirements
    demo_users = [
        {
            'name': 'Haseeb Ahmed',
            'email': 'haseeb@deluxebilisim.com',
            'staff_id': 'EMP001',
            'department': 'Development',
            'designation': 'Senior Developer',
            'profile_image': 'https://crm.deluxebilisim.com/uploads/staff_profil/haseeb.jpg',
            'rating': 4.8,
            'total_screenshots': 5000,  # As requested: Haseeb has 5000 screenshots
            'total_folders': 10,        # As requested: 10 task folders
            'total_size_mb': 1250.5,
            'last_activity': '20 minutes ago',  # As requested: 20 minutes ago
            'last_activity_raw': (datetime.now() - timedelta(minutes=20)).isoformat(),
            'has_screenshots': True,
            'folders_list': [
                '2025-01-27', '2025-01-26', '2025-01-25', 'DDSFocusPro_v1.3',
                'YouTube_AI_Automation', 'Create_UI_for_YouTube', 'EASY_HOME_Project',
                'Island_Green_Construction', 'DDS_Admin_Panel', 'Client_Dashboard'
            ]
        },
        {
            'name': 'Zahra H',
            'email': 'zahra@deluxebilisim.com',
            'staff_id': 'EMP002',
            'department': 'Development',
            'designation': 'Frontend Developer',
            'profile_image': 'https://crm.deluxebilisim.com/uploads/staff_profil/zahra.jpg',
            'rating': 4.5,
            'total_screenshots': 3200,
            'total_folders': 8,
            'total_size_mb': 800.2,
            'last_activity': '45 minutes ago',
            'last_activity_raw': (datetime.now() - timedelta(minutes=45)).isoformat(),
            'has_screenshots': True,
            'folders_list': [
                '2025-01-27', '2025-01-26', 'React_Dashboard', 'Vue_Components',
                'CSS_Animations', 'Mobile_App_UI', 'E_Commerce_Frontend', 'Admin_Interface'
            ]
        },
        {
            'name': 'Yunus Katic',
            'email': 'yunus@deluxebilisim.com',
            'staff_id': 'EMP003',
            'department': 'Backend',
            'designation': 'Backend Developer',
            'profile_image': 'https://crm.deluxebilisim.com/uploads/staff_profil/yunus.jpg',
            'rating': 4.3,
            'total_screenshots': 2800,
            'total_folders': 12,
            'total_size_mb': 700.8,
            'last_activity': '1 hour ago',
            'last_activity_raw': (datetime.now() - timedelta(hours=1)).isoformat(),
            'has_screenshots': True,
            'folders_list': [
                '2025-01-27', '2025-01-26', 'API_Development', 'Database_Design',
                'Server_Configuration', 'Microservices', 'Authentication_System',
                'Payment_Gateway', 'Email_Service', 'File_Upload_System', 'Backup_Scripts', 'Security_Updates'
            ]
        },
        {
            'name': 'Merve Balkis',
            'email': 'merve@deluxebilisim.com',
            'staff_id': 'EMP004',
            'department': 'Design',
            'designation': 'UI/UX Designer',
            'profile_image': 'https://crm.deluxebilisim.com/uploads/staff_profil/merve.jpg',
            'rating': 4.7,
            'total_screenshots': 1500,
            'total_folders': 6,
            'total_size_mb': 375.3,
            'last_activity': '2 hours ago',
            'last_activity_raw': (datetime.now() - timedelta(hours=2)).isoformat(),
            'has_screenshots': True,
            'folders_list': [
                '2025-01-27', 'UI_Mockups', 'Logo_Design', 'Brand_Identity',
                'Mobile_Designs', 'Web_Templates'
            ]
        },
        {
            'name': 'Ömer Yalçın',
            'email': 'omer@deluxebilisim.com',
            'staff_id': 'EMP005',
            'department': 'QA',
            'designation': 'Quality Assurance',
            'profile_image': 'https://crm.deluxebilisim.com/uploads/staff_profil/omer.jpg',
            'rating': 4.2,
            'total_screenshots': 900,
            'total_folders': 4,
            'total_size_mb': 225.7,
            'last_activity': '3 hours ago',
            'last_activity_raw': (datetime.now() - timedelta(hours=3)).isoformat(),
            'has_screenshots': True,
            'folders_list': [
                '2025-01-27', 'Testing_Reports', 'Bug_Documentation', 'Performance_Tests'
            ]
        }
    ]
    
    # Calculate summary statistics
    total_users = len(demo_users)
    users_with_screenshots = len([u for u in demo_users if u['has_screenshots']])
    total_screenshots_all = sum(u['total_screenshots'] for u in demo_users)
    total_folders_all = sum(u['total_folders'] for u in demo_users)
    total_size_all = sum(u['total_size_mb'] for u in demo_users)
    
    # Sort by total screenshots (descending)
    demo_users.sort(key=lambda x: x['total_screenshots'], reverse=True)
    
    demo_response = {
        'success': True,
        'message': 'Users summary generated successfully (DEMO DATA)',
        'data': {
            'users': demo_users,
            'summary': {
                'total_users': total_users,
                'users_with_screenshots': users_with_screenshots,
                'users_without_screenshots': total_users - users_with_screenshots,
                'total_screenshots_all_users': total_screenshots_all,
                'total_folders_all_users': total_folders_all,
                'total_size_mb_all_users': round(total_size_all, 2),
                'average_screenshots_per_user': round(total_screenshots_all / total_users if total_users > 0 else 0, 1),
                'average_folders_per_user': round(total_folders_all / total_users if total_users > 0 else 0, 1)
            }
        },
        'meta': {
            'execution_time_seconds': 0.05,
            'generated_at': datetime.now().isoformat(),
            'timezone': 'Europe/Istanbul',
            'bucket_scanned': 'ddsfocustime',
            'crm_users_count': total_users,
            's3_users_count': total_users,
            'note': 'This is DEMO DATA for testing purposes'
        }
    }
    
    print("📊 USERS SUMMARY API RESULT (DEMO):")
    print("=" * 50)
    print(f"Success: {demo_response['success']}")
    print(f"Total Users: {demo_response['data']['summary']['total_users']}")
    print(f"Users with Screenshots: {demo_response['data']['summary']['users_with_screenshots']}")
    print(f"Total Screenshots (All Users): {demo_response['data']['summary']['total_screenshots_all_users']}")
    print(f"Total Folders (All Users): {demo_response['data']['summary']['total_folders_all_users']}")
    print(f"Total Size (All Users): {demo_response['data']['summary']['total_size_mb_all_users']} MB")
    print(f"Average Screenshots/User: {demo_response['data']['summary']['average_screenshots_per_user']}")
    print(f"Average Folders/User: {demo_response['data']['summary']['average_folders_per_user']}")
    
    print(f"\n👥 ALL USERS BY SCREENSHOT COUNT:")
    print("-" * 100)
    print(f"{'#':<3} {'Name':<20} {'Email':<25} {'Screenshots':<12} {'Folders':<8} {'Size(MB)':<10} {'Last Activity'}")
    print("-" * 100)
    
    for i, user in enumerate(demo_response['data']['users'], 1):
        print(f"{i:<3} {user['name']:<20} {user['email']:<25} {user['total_screenshots']:<12} {user['total_folders']:<8} {user['total_size_mb']:<10} {user['last_activity']}")
    
    print(f"\n📈 Demo API Response Size: {len(str(demo_response))} characters")
    print("\n🔗 API Endpoint for your frontend:")
    print("   GET http://localhost:8000/api/users/summary/")
    print("\n📝 Expected Response Format:")
    print(json.dumps(demo_response, indent=2, default=str)[:500] + "...")
    
    return demo_response

def test_api_endpoint():
    """Test the actual API endpoint if server is running"""
    try:
        print("\n🌐 Testing actual API endpoint...")
        response = requests.get('http://localhost:8000/api/users/summary/', timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API endpoint working! Status: {response.status_code}")
            print(f"📊 Response: {data['success']}, Users: {data['data']['summary']['total_users']}")
        else:
            print(f"⚠️ API endpoint returned status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            
    except requests.exceptions.ConnectionError:
        print("❌ API endpoint not available (Django server not running)")
        print("💡 Start Django server with: python manage.py runserver")
    except Exception as e:
        print(f"❌ Error testing API endpoint: {e}")

if __name__ == "__main__":
    # Run demo test
    test_users_summary_api_with_demo_data()
    
    # Try to test actual endpoint
    test_api_endpoint()
