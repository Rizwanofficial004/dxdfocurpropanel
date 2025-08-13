from django.urls import path, include
from . import api_views
from .fast_live_tracking_api import fast_live_tracking_screenshots_api
from .date_based_live_tracking_api import live_tracking_screenshots_by_date_api
from . import screenshots_search_api
from . import settings_apis
from . import enhanced_api_views
from . import all_screenshots_api
from . import fast_screenshots_api
from . import ultra_fast_screenshots_api
from django.conf import settings
from django.conf.urls.static import static
from s3_screenshots_users_api import s3_screenshots_users_api
from user_screenshots_count_api import user_screenshots_count_api, user_screenshots_summary_api
from scheduler_status_api import scheduler_status_api
from health_api import health_api
from cached_api import cached_screenshots_api
from working_api import working_screenshots_api
from . import api_views
from .fast_live_tracking_api import fast_live_tracking_screenshots_api
from .date_based_live_tracking_api import live_tracking_screenshots_by_date_api
from . import screenshots_search_api
from . import settings_apis
from . import enhanced_api_views
from . import all_screenshots_api
from . import fast_screenshots_api
from . import ultra_fast_screenshots_api
from django.conf import settings
from django.conf.urls.static import static
from s3_screenshots_users_api import s3_screenshots_users_api
from user_screenshots_count_api import user_screenshots_count_api, user_screenshots_summary_api
from scheduler_status_api import scheduler_status_api
from health_api import health_api
from cached_api import cached_screenshots_api
from working_api import working_screenshots_api

urlpatterns = [
    # Health Check API - Simple test endpoint
    path('health/', health_api, name='api_health'),
    
    # Actual Count Total Screenshots API - FAST CACHED VERSION
    path('actual-count-total/screenshots/', cached_screenshots_api, name='api_actual_count_total_screenshots'),
    
    # Working API with fallback (for testing)
    path('working/screenshots/', working_screenshots_api, name='api_working_screenshots'),
    
    # Test endpoint
    path('test/', api_views.api_test, name='api_test'),
    
    # S3 Screenshots Users API - Get all users with screenshots in S3
    path('screenshots/users/', s3_screenshots_users_api, name='api_s3_screenshots_users'),
    
    # Screenshot Proxy Endpoint (for CORS and authentication issues)
    path('proxy/screenshot/<path:screenshot_path>', api_views.screenshot_proxy, name='api_screenshot_proxy'),
    
    # Professional API Endpoints
    path('auth/login/', api_views.login_api, name='api_login'),
    path('screenshots/', api_views.screenshots_api, name='api_screenshots'),
    path('logs/', api_views.logs_api, name='api_logs'),
    
    # Screenshots Search API (NEW) - Three search patterns
    path('screenshots/search/', screenshots_search_api.screenshots_search_api, name='api_screenshots_search'),
    path('screenshots/quick-search/', screenshots_search_api.quick_name_search_api, name='api_quick_name_search'),
    path('screenshots/date-search/', screenshots_search_api.name_date_filter_api, name='api_name_date_filter'),
    path('screenshots/comprehensive-search/', screenshots_search_api.name_all_screenshots_api, name='api_name_all_screenshots'),
    
    # All Screenshots API (NEW) - Get ALL users with ALL screenshots
    path('screenshots/all/', all_screenshots_api.all_screenshots_api, name='api_all_screenshots'),
    path('screenshots/summary/', all_screenshots_api.user_screenshots_summary_api, name='api_user_screenshots_summary'),
    path('screenshots/fast-all/', fast_screenshots_api.fast_all_screenshots_api, name='api_fast_all_screenshots'),
    
    # Ultra-Fast Screenshots API (NEWEST) - Instant responses with auto-tracking
    path('screenshots/ultra-fast/', ultra_fast_screenshots_api.ultra_fast_screenshots_api, name='api_ultra_fast_screenshots'),
    path('screenshots/tracking-status/', ultra_fast_screenshots_api.cache_status_api, name='api_tracking_status'),
    
    # Google-like Search & Suggestion APIs (NEW)
    path('users/suggestions/', api_views.user_suggestions_api, name='api_user_suggestions'),
    path('users/s3-suggestions/', api_views.s3_user_suggestions_api, name='api_s3_user_suggestions'),
    path('dashboard/user-data/', api_views.dashboard_data_api, name='api_dashboard_data_complete'),
    
    # Employee Task Folders API (Level 2)
    path('screenshots/employee/<str:employee_email>/folders/', api_views.employee_task_folders_api, name='api_employee_task_folders'),
    
    # Employee Folder Screenshots API (Level 3)
    path('screenshots/employee/<str:employee_email>/folder/<str:folder_name>/', api_views.employee_folder_screenshots_api, name='api_employee_folder_screenshots'),
    
    # Enhanced Employee Folder Screenshots API (Level 3 Optimized)
    path('screenshots/employee/<str:employee_email>/folder/<str:folder_name>/enhanced/', enhanced_api_views.employee_folder_screenshots_enhanced_api, name='api_employee_folder_screenshots_enhanced'),
    
    # Folder Statistics API
    path('screenshots/employee/<str:employee_email>/folder/<str:folder_name>/stats/', enhanced_api_views.employee_folder_stats_api, name='api_employee_folder_stats'),
    
    # Cache Management API
    path('screenshots/employee/<str:employee_email>/folder/<str:folder_name>/clear-cache/', enhanced_api_views.clear_folder_cache_api, name='api_clear_folder_cache'),
    
    # Performance Testing API
    path('screenshots/employee/<str:employee_email>/folder/<str:folder_name>/performance-test/', enhanced_api_views.folder_performance_test_api, name='api_folder_performance_test'),

    # Dashboard Data APIs
    path('dashboard/data/', api_views.dashboard_data_api, name='api_dashboard_data'),
    path('users/search/', api_views.user_search_api, name='api_user_search'),
    
    # User-specific API Endpoints
    path('users/<str:email>/screenshots/', api_views.user_screenshots_api, name='api_user_screenshots'),
    path('users/<str:email>/logs/', api_views.user_logs_api, name='api_user_logs'),
    
    # Logs search API
    path('logs/search/', api_views.logs_users_search_api, name='api_logs_search'),
    
    # Logs Program Summary Files API - Get all program_summary.json files from user folders
    path('logs/program-summary-files/', api_views.logs_program_summary_files_api, name='api_logs_program_summary_files'),
    
    # Logs Folder Files API - List files in specific user folder or date folder
    path('logs/files/', api_views.logs_folder_files_api, name='api_logs_folder_files'),
    
    # Live Tracking APIs - Real-time user activity and status tracking
    path('live-tracking/', api_views.live_tracking_api, name='api_live_tracking'),
    path('live-tracking/screenshots/', api_views.live_tracking_screenshots_api, name='api_live_tracking_screenshots'),
    path('live-tracking/fast-screenshots/', fast_live_tracking_screenshots_api, name='api_fast_live_tracking_screenshots'),
    
    # Enhanced Live Tracking API - Date-based search
    path('live-tracking/screenshots-by-date/', live_tracking_screenshots_by_date_api, name='api_live_tracking_screenshots_by_date'),
    
    # ==================== USER SCREENSHOTS COUNT APIs ====================
    # User Screenshots Count API - Get screenshot counts for each user
    path('users/screenshots-count/', user_screenshots_count_api, name='api_user_screenshots_count'),
    
    # User Screenshots Summary API - Quick summary statistics
    path('users/screenshots-summary/', user_screenshots_summary_api, name='api_user_screenshots_summary'),
    
    # ==================== SCHEDULER MANAGEMENT API ====================
    # Scheduler Status API - Check and control the auto scheduler
    path('scheduler/status/', scheduler_status_api, name='api_scheduler_status'),
    
    # ==================== SETTINGS MANAGEMENT APIs ====================
    # UI Settings APIs
    path('settings/ui/', settings_apis.ui_settings_api, name='api_ui_settings'),
    
    # Credentials APIs  
    path('settings/credentials/', settings_apis.credentials_api, name='api_credentials'),
    
    # Application Settings APIs
    path('settings/app/', settings_apis.app_settings_api, name='api_app_settings'),
    
    # Bulk Operations API
    path('settings/bulk/', settings_apis.bulk_settings_api, name='api_bulk_settings'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)