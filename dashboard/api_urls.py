from django.urls import path, include
from . import api_views
from .fast_live_tracking_api import fast_live_tracking_screenshots_api
from .date_based_live_tracking_api import live_tracking_screenshots_by_date_api
from . import screenshots_search_api
from . import settings_apis
from . import enhanced_api_views
from . import dashboard_analytics_apis
from . import project_management_apis
from . import ai_project_categorization_apis
from . import accurate_project_status_apis
from . import static_crm_status_apis
from . import comprehensive_employees_api  # NEW: Import comprehensive employee API
from .api.enhanced_employees_api import enhanced_employees_api  # NEW: Import enhanced employee API function
# Import the main modules from the project root
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    import comprehensive_project_status_api
except ImportError:
    comprehensive_project_status_api = None
try:
    import step2_comprehensive_database_api
    HAS_DATABASE_API = True
except ImportError:
    step2_comprehensive_database_api = None
    HAS_DATABASE_API = False
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Test endpoint
    path('test/', api_views.api_test, name='api_test'),
    
    # Screenshot Proxy Endpoint (for CORS and authentication issues)
    path('proxy/screenshot/<path:screenshot_path>', api_views.screenshot_proxy, name='api_screenshot_proxy'),
    
    # Professional API Endpoints
    path('auth/login/', api_views.login_api, name='api_login'),
    path('auth/logout/', api_views.logout_api, name='api_logout'),
    path('auth/session/', api_views.session_status_api, name='api_session_status'),
    path('screenshots/', api_views.screenshots_api, name='api_screenshots'),
    path('logs/', api_views.logs_api, name='api_logs'),
    
    # Screenshots Search API (NEW) - Three search patterns
    path('screenshots/search/', screenshots_search_api.screenshots_search_api, name='api_screenshots_search'),
    path('screenshots/quick-search/', screenshots_search_api.quick_name_search_api, name='api_quick_name_search'),
    path('screenshots/date-search/', screenshots_search_api.name_date_filter_api, name='api_name_date_filter'),
    path('screenshots/comprehensive-search/', screenshots_search_api.name_all_screenshots_api, name='api_name_all_screenshots'),
    
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
    
    # ==================== SETTINGS MANAGEMENT APIs ====================
    # UI Settings APIs
    path('settings/ui/', settings_apis.ui_settings_api, name='api_ui_settings'),
    
    # Credentials APIs  
    path('settings/credentials/', settings_apis.credentials_api, name='api_credentials'),
    
    # Application Settings APIs
    path('settings/app/', settings_apis.app_settings_api, name='api_app_settings'),
    
    # Bulk Operations API
    path('settings/bulk/', settings_apis.bulk_settings_api, name='api_bulk_settings'),
    
    # ==================== CONFIGURATION SETTINGS APIs ====================
    # Configuration management endpoints (Public - No authentication required)
    path('configurations/', api_views.configuration_settings_api, name='api_configuration_list'),
    path('configurations/<int:config_id>/', api_views.configuration_settings_api, name='api_configuration_detail'),
    path('configurations/type/<str:config_type>/', api_views.configuration_by_type_api, name='api_configuration_by_type'),
    path('configurations/name/<str:config_name>/', api_views.configuration_by_name_api, name='api_configuration_by_name'),
    
    # ==================== DASHBOARD ANALYTICS APIs ====================
    # Dashboard metrics endpoints for admin dashboard
    path('dashboard/analytics/employees/', dashboard_analytics_apis.total_employees_api, name='api_total_employees'),
    path('dashboard/analytics/projects/', dashboard_analytics_apis.total_projects_api, name='api_total_projects'),
    path('dashboard/analytics/completed-projects/', dashboard_analytics_apis.completed_projects_api, name='api_completed_projects'),
    path('dashboard/analytics/tasks/', dashboard_analytics_apis.total_tasks_api, name='api_total_tasks'),
    path('dashboard/analytics/summary/', dashboard_analytics_apis.dashboard_summary_api, name='api_dashboard_summary'),
    
    # ==================== COMPREHENSIVE EMPLOYEES APIs ====================
    # NEW: Comprehensive employee management endpoints
    path('dashboard/employees/comprehensive/', comprehensive_employees_api.comprehensive_employees_api, name='api_comprehensive_employees'),
    path('dashboard/employees/profile/<str:employee_id>/', comprehensive_employees_api.employee_profile_api, name='api_employee_profile'),
    
    # Enhanced Employee API - NEW: CRM + S3 + AI Enhanced
    path('dashboard/employees/enhanced/', enhanced_employees_api, name='api_enhanced_employees'),
    
    # ==================== PROJECT MANAGEMENT APIs ====================
    # CRM Project management endpoints
    path('projects/', project_management_apis.get_all_projects_api, name='api_get_all_projects'),
    path('projects/summary/', project_management_apis.get_projects_summary_api, name='api_get_projects_summary'),
    path('projects/<str:project_id>/', project_management_apis.get_project_by_id_api, name='api_get_project_by_id'),
    
    # ==================== AI PROJECT CATEGORIZATION APIs ====================
    # AI-powered project status categorization using OpenAI
    path('projects/ai-categorization/', ai_project_categorization_apis.ai_project_categorization_api, name='api_ai_project_categorization'),
    path('projects/status-summary/', ai_project_categorization_apis.project_status_summary_api, name='api_project_status_summary'),
    
    # ==================== ACCURATE PROJECT STATUS APIs ====================
    # Accurate CRM status mapping to match dashboard exactly
    path('projects/accurate-status/', accurate_project_status_apis.accurate_project_status_api, name='api_accurate_project_status'),
    path('projects/dashboard-summary/', accurate_project_status_apis.dashboard_status_summary_api, name='api_dashboard_status_summary'),
    
    # ==================== STATIC CRM STATUS APIs ====================
    # Static CRM database status counts - no dynamic logic, pure database data
    path('projects/static-status/', static_crm_status_apis.static_crm_status_api, name='api_static_crm_status'),
    path('projects/simple-counts/', static_crm_status_apis.simple_dashboard_counts_api, name='api_simple_dashboard_counts'),
    path('projects/status-breakdown/', static_crm_status_apis.crm_status_breakdown_api, name='api_crm_status_breakdown'),
    
    # ==================== COMPREHENSIVE PROJECT STATUS API ====================
    # Single comprehensive API with multiple response formats
    # path('projects/status/', comprehensive_project_status_api.comprehensive_project_status_api, name='api_comprehensive_project_status'),
    
    # ==================== COMPREHENSIVE DATABASE API ====================
    # AI-powered comprehensive database search and analytics
]

# Add database API endpoints if available
if HAS_DATABASE_API and step2_comprehensive_database_api:
    urlpatterns += [
        path('database/comprehensive/', step2_comprehensive_database_api.comprehensive_database_api, name='api_comprehensive_database'),
        path('database/dashboard/', step2_comprehensive_database_api.quick_dashboard_api, name='api_quick_dashboard'),
        path('database/projects/', step2_comprehensive_database_api.projects_only_api, name='api_projects_only'),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)