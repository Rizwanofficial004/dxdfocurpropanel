"""
URL patterns for Authentication API
"""

from django.urls import path
from . import views, simple_views
from .all_users_views import AllRegisteredUsersAPIView
from .single_user_views import SingleUserAPIView
from .post_users_views import PostUsersAPIView

urlpatterns = [
    # Authentication endpoints with unique email validation
    path('login/', views.LoginAPIView.as_view(), name='auth_login'),
    path('logout/', views.LogoutAPIView.as_view(), name='auth_logout'),
    path('register/', views.RegisterAPIView.as_view(), name='auth_register'),
    path('profile/', views.UserProfileAPIView.as_view(), name='auth_profile'),
    path('change-password/', views.PasswordChangeAPIView.as_view(), name='auth_change_password'),
    path('check-email/', views.CheckEmailAPIView.as_view(), name='auth_check_email'),
    
    # Simple test endpoints
    path('simple-login/', simple_views.SimpleLoginAPIView.as_view(), name='simple_login'),
    path('users/', simple_views.UserListAPIView.as_view(), name='user_list'),
    
    # All registered users endpoint with numeric_value field
    path('register/users/', AllRegisteredUsersAPIView.as_view(), name='all_registered_users'),
    
    # Enhanced POST users registration endpoint
    path('register/post_users/', PostUsersAPIView.as_view(), name='post_users_registration'),
    
    # Single user by ID endpoint
    path('register/users/<int:user_id>/', SingleUserAPIView.as_view(), name='single_registered_user'),
    
    # Database testing with unique email stats
    path('database-test/', views.DatabaseTestAPIView.as_view(), name='auth_database_test'),
]
