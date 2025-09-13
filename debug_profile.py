#!/usr/bin/env python3
"""
Debug script to check profile creation
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from django.contrib.auth.models import User
from apps.users.models import UserProfile

# Check the last created user
try:
    user = User.objects.get(username='apiview_test123')
    print(f'User: {user.username}')
    print(f'Has profile: {hasattr(user, "profile")}')

    if hasattr(user, 'profile'):
        profile = user.profile
        print(f'Organization: {profile.organization_name}')
        print(f'Country: {profile.country}')
        print(f'Phone: {profile.phone_number}')
        print(f'Job Title: {profile.job_title}')
        print(f'Industry: {profile.industry}')
    else:
        print('No profile found')
        
    # Check all profiles
    print(f'\nTotal profiles: {UserProfile.objects.count()}')
    
except User.DoesNotExist:
    print('User apiview_test123 not found')
