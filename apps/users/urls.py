from django.urls import path
from .views import UsersSearchView

app_name = 'users'

urlpatterns = [
    # Users search endpoint
    path('users/search/', UsersSearchView.as_view(), name='users-search'),
    
    # Alternative search endpoint
    path('users/', UsersSearchView.as_view(), name='users-default'),
]
