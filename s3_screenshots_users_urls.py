"""
URL configuration for S3 Screenshots Users API
Add this to your Django urls.py file
"""

from django.urls import path
from . import s3_screenshots_users_api

urlpatterns = [
    # S3 Screenshots Users API
    path('api/s3/screenshots/users/', s3_screenshots_users_api.s3_screenshots_users_api, name='s3_screenshots_users'),
    
    # Alternative shorter URL
    path('api/screenshots/users/', s3_screenshots_users_api.s3_screenshots_users_api, name='screenshots_users'),
]

# If you want to add this to an existing urls.py, add this line:
# path('api/screenshots/users/', include('path.to.s3_screenshots_users_api.urls')),
