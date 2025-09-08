#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

print("=" * 80)
print("🔑 ALL VALID AUTHENTICATION TOKENS")
print("=" * 80)

users = User.objects.all().order_by('id')
print(f"Total Users: {users.count()}\n")

for user in users:
    token, created = Token.objects.get_or_create(user=user)
    print(f"User ID: {user.id:2} | Username: {user.username:30} | Token: {token.key}")

print("\n" + "=" * 80)
print("🎯 FOR POSTMAN TESTING:")
print("=" * 80)
print("Authorization Header Format:")
print("Key: Authorization")
print("Value: Token [TOKEN_FROM_ABOVE]")
print("\nExample:")
print("Authorization: Token 35605779df845064f908ff421c07f788f759959a")
print("=" * 80)
