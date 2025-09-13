from django.urls import path
from .views import UsersSearchView
from .user_monthly_api import UserMonthlyScreenshotsAPI

app_name = 'users'

urlpatterns = [
    # Users search endpoint
    path('users/search/', UsersSearchView.as_view(), name='users-search'),
    
    # Alternative search endpoint
    path('users/', UsersSearchView.as_view(), name='users-default'),
    
    # User-based Monthly Screenshots API - Works with actual user structure
    path('users/monthly-screenshots/', UserMonthlyScreenshotsAPI.as_view(), name='user-monthly-screenshots'),
]
