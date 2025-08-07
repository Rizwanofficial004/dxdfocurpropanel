"""
Settings API URL Configuration
URL patterns for settings management APIs
"""
from django.urls import path
from . import settings_apis

urlpatterns = [
    # UI Settings APIs
    path('ui-settings/', settings_apis.ui_settings_api, name='api_ui_settings'),
    
    # Credentials APIs  
    path('credentials/', settings_apis.credentials_api, name='api_credentials'),
    
    # Application Settings APIs
    path('app-settings/', settings_apis.app_settings_api, name='api_app_settings'),
    
    # Bulk Operations API
    path('bulk-settings/', settings_apis.bulk_settings_api, name='api_bulk_settings'),
]
