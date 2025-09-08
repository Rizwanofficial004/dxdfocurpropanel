#!/usr/bin/env python
"""
Test script for User Numeric Value API
Simple numeric values for each user
"""
import os
import sys
import django

# Add the project path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from django.contrib.auth.models import User
from apps.dashboard.models import UserNumericValue

def demo_numeric_values():
    """Demonstrate numeric value functionality"""
    print("🔢 User Numeric Value API Demo")
    print("=" * 50)
    
    # Get existing users
    users = User.objects.all()
    print(f"📊 Found {users.count()} users in database:")
    
    # Set numeric values for users
    demo_values = [
        {"username": "testuser", "value": 100, "description": "Productivity score"},
        {"username": "haseebcodejourney_at_gmail.com", "value": 85, "description": "Performance rating"},
        {"username": "kiranaiza4_at_gmail.com", "value": 92, "description": "Quality score"},
        {"username": "nawaz_at_dxdglobal.com", "value": 78, "description": "Efficiency rating"},
    ]
    
    print(f"\n📝 Setting numeric values for users:")
    for data in demo_values:
        try:
            user = User.objects.get(username=data["username"])
            user_value, created = UserNumericValue.objects.get_or_create(
                user=user,
                defaults={
                    'value': data['value'],
                    'description': data['description']
                }
            )
            
            if not created:
                user_value.value = data['value']
                user_value.description = data['description']
                user_value.save()
            
            action = "✅ Created" if created else "🔄 Updated"
            print(f"  {action}: {user.username} = {data['value']} ({data['description']})")
            
        except User.DoesNotExist:
            print(f"  ⚠️  User not found: {data['username']}")
    
    print(f"\n📈 All User Numeric Values:")
    all_values = UserNumericValue.objects.all().order_by('-value')
    
    if all_values.exists():
        for user_value in all_values:
            print(f"  🔢 {user_value.user.username}: {user_value.value}")
            if user_value.description:
                print(f"     📋 {user_value.description}")
    else:
        print("  📭 No numeric values set yet")
    
    print(f"\n📊 Statistics:")
    if all_values.exists():
        values = [uv.value for uv in all_values]
        avg_value = sum(values) / len(values)
        max_value = max(values)
        min_value = min(values)
        
        print(f"  - Total users with values: {len(values)}")
        print(f"  - Average value: {avg_value:.1f}")
        print(f"  - Highest value: {max_value}")
        print(f"  - Lowest value: {min_value}")
    
    print(f"\n🔌 API Endpoints Available:")
    print(f"  GET  /api/user-value/       - Get numeric value for authenticated user")
    print(f"  POST /api/user-value/       - Set numeric value for authenticated user")
    print(f"  GET  /api/user-value/all/   - Get all users' numeric values")
    print(f"  GET  /api/user-value/{{id}}/  - Get numeric value for specific user")
    print(f"  POST /api/user-value/{{id}}/ - Set numeric value for specific user")
    
    print(f"\n📤 Example API Usage:")
    print(f"  # Set value for authenticated user")
    print(f"  POST /api/user-value/")
    print(f"  Body: {{\"value\": 95, \"description\": \"Performance score\"}}")
    print(f"")
    print(f"  # Get all users with their values")
    print(f"  GET /api/user-value/all/")
    
    print(f"\n🎉 Numeric Value System Ready!")
    print(f"✅ Simple numeric tracking for each user")
    print(f"🔧 Full CRUD API available")

if __name__ == "__main__":
    try:
        demo_numeric_values()
    except Exception as e:
        print(f"❌ Error in demo: {e}")
        import traceback
        traceback.print_exc()
