from django.urls import path
from . import views, api_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Regular views (require login)
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('index/', views.dashboard_view, name='dashboard'),
    path('live/', views.live_tracking, name='live_tracking'),
    path('api-data/', views.api_data_view, name='api_data'),
    path('search-employee-names/', views.search_employee_names, name='search_employee_names'),
    path('api/user-timeline/', views.user_timeline_view, name='user_timeline'),
    path('api/staff-status/', views.cached_staff_status_view, name='static_user'),

    # Translation and other endpoints
    path('translate/', views.translate_text, name='translate_text'),
    path('api/user-information/', views.fetch_user_info, name='user_info'),
    path('api/user-timeline-summary/', views.fetch_user_timeline_summary, name='user_timeline_summary'),
    path('api/user-program-summary/', views.fetch_user_program_summary, name='user_program_summary'),

    # ==================== PUBLIC API ENDPOINTS (No login required) ====================
    # API Test endpoint - MUST BE FIRST
    path('api/test/', api_views.api_test, name='api_test'),
    
    # Configuration Settings Test Endpoint (Public)
    path('api/test-configs/', views.configuration_settings_api, name='test_configs'),
    
    # Authentication APIs
    path('api/auth/login/', api_views.login_api, name='login_api'),
    
    # Public API endpoints (no authentication required for testing)
    path('api/logs/search/', api_views.logs_users_search_api, name='logs_users_search_api'),
    path('api/users/search/', api_views.user_search_api, name='user_search_api'),
    path('api/users/suggestions/', api_views.user_suggestions_api, name='user_suggestions_api'),
    
    # Logs Program Summary Files API
    path('api/logs/program-summary-files/', api_views.logs_program_summary_files_api, name='logs_program_summary_files_api'),
    
    # Logs Folder Files API - List files in specific user folder or date folder
    path('api/logs/files/', api_views.logs_folder_files_api, name='logs_folder_files_api'),
    
    # Live Tracking APIs - Real-time user activity and status tracking
    path('api/live-tracking/', api_views.live_tracking_api, name='live_tracking_api'),
    
    # ==================== PROTECTED API ENDPOINTS (Login required) ====================
    # Main APIs that require authentication
    path('api/screenshots/', api_views.screenshots_api, name='screenshots_api'),
    path('api/logs/', api_views.logs_api, name='logs_api'),
    path('api/dashboard/data/', api_views.dashboard_data_api, name='dashboard_data_api'),
    
    # User-specific APIs
    path('api/users/<str:email>/screenshots/', api_views.user_screenshots_api, name='user_screenshots_api'),
    path('api/users/<str:email>/logs/', api_views.user_logs_api, name='user_logs_api'),
    
    # Image proxy endpoint to fix CORS issues
    path('api/proxy-image/<path:s3_key>/', api_views.proxy_image_api, name='proxy_image_api'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
