"""
URL Configuration for DDSFocusProPanel

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # Health check endpoint
    path('health/', include('apps.health.urls')),
    
    # API endpoints
    path('api/', include('apps.dashboard.urls')),
    path('api/', include('apps.users.urls')),
    
    # Dashboard web interface
    path('', include('apps.dashboard.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin site
admin.site.site_header = "DDS Focus Pro Panel"
admin.site.site_title = "DDS Admin"
admin.site.index_title = "Welcome to DDS Focus Pro Panel Administration"
