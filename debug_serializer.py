#!/usr/bin/env python3
"""
Debug the serializer to see where profile fields are lost
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.auth_api.serializers import UserRegistrationSerializer
from django.contrib.auth.models import User
import json

def debug_serializer_step_by_step():
    """Debug serializer step by step"""
    print("=== Debugging Serializer Step by Step ===")
    
    test_data = {
        'email': 'debug_test@example.com',
        'username': 'debug_test123',
        'password': 'TestPassword123',
        'password_confirm': 'TestPassword123',
        'first_name': 'Debug',
        'last_name': 'Test',
        'organization_name': 'Debug Org Inc',
        'country': 'France'
    }
    
    print(f"1. Input data: {json.dumps(test_data, indent=2)}")
    
    # Step 1: Create serializer
    serializer = UserRegistrationSerializer(data=test_data)
    
    # Step 2: Check validation
    print(f"\n2. Serializer is_valid(): {serializer.is_valid()}")
    if not serializer.is_valid():
        print(f"   Validation errors: {serializer.errors}")
        return False
    
    # Step 3: Check validated data
    print(f"\n3. Validated data: {json.dumps(serializer.validated_data, indent=2)}")
    
    # Step 4: Save and check what happens
    print(f"\n4. Calling serializer.save()...")
    try:
        user = serializer.save()
        print(f"   ✅ User created: {user.username}")
        
        # Step 5: Check profile immediately after creation
        print(f"\n5. Checking profile immediately after creation:")
        print(f"   Has profile: {hasattr(user, 'profile')}")
        
        if hasattr(user, 'profile'):
            profile = user.profile
            print(f"   Organization: '{profile.organization_name}'")
            print(f"   Country: '{profile.country}'")
            print(f"   Phone: '{profile.phone_number}'")
            print(f"   Job Title: '{profile.job_title}'")
            print(f"   Industry: '{profile.industry}'")
            print(f"   Profile Completed: {profile.profile_completed}")
            
            # Check if any fields were saved
            if profile.organization_name or profile.country:
                print("   ✅ Some profile fields saved!")
                return True
            else:
                print("   ❌ No profile fields saved")
                return False
        else:
            print("   ❌ No profile created")
            return False
            
    except Exception as e:
        print(f"   ❌ Error during save: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def debug_manual_profile_creation():
    """Test manual profile creation to ensure the model works"""
    print("\n=== Testing Manual Profile Creation ===")
    
    from apps.users.models import UserProfile
    
    try:
        # Create a test user manually
        user = User.objects.create_user(
            username='manual_test123',
            email='manual_test@example.com',
            password='TestPassword123',
            first_name='Manual',
            last_name='Test'
        )
        
        print(f"✅ Manual user created: {user.username}")
        
        # Check if profile was auto-created by signal
        if hasattr(user, 'profile'):
            print("✅ Profile auto-created by signal")
            profile = user.profile
            
            # Manually set fields
            profile.organization_name = 'Manual Org'
            profile.country = 'Spain'
            profile.save()
            
            # Re-fetch and check
            profile.refresh_from_db()
            print(f"✅ Manual profile update:")
            print(f"   Organization: '{profile.organization_name}'")
            print(f"   Country: '{profile.country}'")
            
            if profile.organization_name and profile.country:
                print("✅ Manual profile creation WORKS!")
                return True
            else:
                print("❌ Manual profile creation FAILED")
                return False
        else:
            print("❌ No profile auto-created")
            return False
            
    except Exception as e:
        print(f"❌ Error in manual creation: {str(e)}")
        return False

if __name__ == "__main__":
    print("Enhanced Registration Debug")
    print("=" * 50)
    
    success_count = 0
    
    if debug_serializer_step_by_step():
        success_count += 1
        
    if debug_manual_profile_creation():
        success_count += 1
    
    print("\n" + "=" * 50)
    if success_count == 2:
        print("🎉 Both tests passed!")
    else:
        print("❌ Some debugging tests failed")
