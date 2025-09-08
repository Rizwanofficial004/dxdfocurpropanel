"""
URL patterns for Authentication API
"""

from django.urls import path
from . import views, simple_views

urlpatterns = [
    # Authentication endpoints
    path('login/', views.LoginAPIView.as_view(), name='auth_login'),
    path('logout/', views.LogoutAPIView.as_view(), name='auth_logout'),
    path('register/', views.RegisterAPIView.as_view(), name='auth_register'),
    path('profile/', views.UserProfileAPIView.as_view(), name='auth_profile'),
    
    # Simple test endpoints
    path('simple-login/', simple_views.SimpleLoginAPIView.as_view(), name='simple_login'),
    path('users/', simple_views.UserListAPIView.as_view(), name='user_list'),
    
    # Database testing
    path('database-test/', views.DatabaseTestAPIView.as_view(), name='auth_database_test'),
]
