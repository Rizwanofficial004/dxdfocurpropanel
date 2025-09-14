from django.urls import path
from .views import UsersSearchView
from .user_monthly_api import UserMonthlyScreenshotsAPI
from .user_screenshots_api import UserScreenshotsAPI

app_name = 'users'

urlpatterns = [
    # Users search endpoint
    path('users/search/', UsersSearchView.as_view(), name='users-search'),
    
    # Alternative search endpoint
    path('users/', UsersSearchView.as_view(), name='users-default'),
    
    # User-based Monthly Screenshots API - Works with actual user structure
    path('users/monthly-screenshots/', UserMonthlyScreenshotsAPI.as_view(), name='user-monthly-screenshots'),
    
    # Individual User Screenshots API - Returns individual screenshots with pagination
    path('users/screenshots/', UserScreenshotsAPI.as_view(), name='user-screenshots'),
]
