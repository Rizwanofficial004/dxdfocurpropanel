from django.urls import path, include
from . import views
from .credentials_views import CredentialsStatusView, CredentialsAPIView, SetAllCredentialsAPIView, GetAllCredentialsAPIView
from .users_screenshots_view import UsersScreenshotsView
from .users_search_views import EnhancedUsersSearchView
from .fast_users_api import FastUsersSearchAPI
from .employees_details_views import EmployeesDetailsView
from .staff_details_views import StaffDetailsView
from .timesheets_views import TimesheetsView
from .idle_time_api import IdleTimeAPIView
<<<<<<< HEAD
from .timesheet_summary_api import TimesheetSummaryAPIView
from .employee_report_api import EmployeeReportAPIView
=======
from .productive_time_views import ProductiveTimeAPIView
>>>>>>> 77557742ac678b80201f5b8f90414ab5d288c9bc
from .simple_screenshot_proxy import SimpleScreenshotProxyView, SimpleScreenshotProxyStatusView
from .ai_views import AIStatusView, AIChatView, AIEmployeeAnalysisView, AIReportGeneratorView
from .crm_comprehensive_views import CRMComprehensiveDashboardView, CRMConnectionTestView, DatabaseTestView
from .logs_views import LogsSearchView, LogsSystemView, LogsStatsView
from .user_logs_api_views import UserLogsAPIView, UserLogContentAPIView, UserActivitySummaryAPIView, LogTypesAPIView, UserLogsStatsAPIView

app_name = 'dashboard'

urlpatterns = [
    # Analytics endpoints
    path('dashboard/analytics/', include([
        path('employees/', views.EmployeesAnalyticsView.as_view(), name='employees-analytics'),
    ])),

    # Dashboard-specific endpoints - LIVE TRACKING API (OPTIMIZED)
    path('api/live-tracking/fast-screenshots/', UsersScreenshotsView.as_view(), name='fast-screenshots'),
    
    # ULTRA FAST Users Search API - New optimized endpoint
    path('api/users/search/', FastUsersSearchAPI.as_view(), name='fast-users-search'),
    
    # Simple Screenshot Proxy - Handle S3 CORS issues
    path('api/simple-screenshot-proxy/', SimpleScreenshotProxyView.as_view(), name='simple-screenshot-proxy'),
    path('api/simple-screenshot-proxy/status/', SimpleScreenshotProxyStatusView.as_view(), name='simple-screenshot-proxy-status'),

    # Employees Details API - Combines S3 and CRM Data
    path('Employees/Details/', EmployeesDetailsView.as_view(), name='employees-details'),
    
    # Staff Details API - Fetches all staff from CRM
    path('Staff/Details/', StaffDetailsView.as_view(), name='staff-details'),
    
    # Timesheets API - Fetches all timesheets from CRM
    path('Timesheets/', TimesheetsView.as_view(), name='timesheets'),
    
<<<<<<< HEAD
    # Timesheet Summary API - Comprehensive timesheet analytics
    path('timesheet_summary/', TimesheetSummaryAPIView.as_view(), name='timesheet-summary'),
    
    # Employee Report API - Detailed individual employee reports
    path('employee_report/', EmployeeReportAPIView.as_view(), name='employee-report'),
=======
    # Productive Time API - Analyzes productive time from timesheets
    path('productive_time/', ProductiveTimeAPIView.as_view(), name='productive-time'),
>>>>>>> 77557742ac678b80201f5b8f90414ab5d288c9bc
    
    # Idle Time API - Analyzes idle time from timesheets notes
    path('idle_time/', IdleTimeAPIView.as_view(), name='idle-time'),

    # Enhanced Users Search API - Accurate S3 data fetching
    path('users/search/', EnhancedUsersSearchView.as_view(), name='enhanced-users-search'),

    # Credentials Management API - Central credential handling
    path('credentials/', include([
        path('status/', CredentialsStatusView.as_view(), name='credentials-status'),
        path('api/', CredentialsAPIView.as_view(), name='credentials-api'),
        path('set-all/', SetAllCredentialsAPIView.as_view(), name='set-all-credentials'),
        path('get-all/', GetAllCredentialsAPIView.as_view(), name='get-all-credentials'),
    ])),

    # AI Services API - OpenAI integration
    path('ai/', include([
        path('status/', AIStatusView.as_view(), name='ai-status'),
        path('chat/', AIChatView.as_view(), name='ai-chat'),
        path('employee-analysis/', AIEmployeeAnalysisView.as_view(), name='ai-employee-analysis'),
        path('report-generator/', AIReportGeneratorView.as_view(), name='ai-report-generator'),
    ])),

    # CRM Comprehensive Dashboard API - Full CRM integration
    path('crm/', include([
        path('dashboard/', CRMComprehensiveDashboardView.as_view(), name='crm-comprehensive-dashboard'),
        path('test-connection/', CRMConnectionTestView.as_view(), name='crm-connection-test'),
        path('test-database/', DatabaseTestView.as_view(), name='database-test'),
    ])),

    # Logs API - System and user logs
    path('logs/', include([
        path('search/', LogsSearchView.as_view(), name='logs-search'),
        path('system/', LogsSystemView.as_view(), name='logs-system'),
        path('stats/', LogsStatsView.as_view(), name='logs-stats'),
    ])),

    # User Logs API - Enhanced user activity logs
    path('user-logs/', include([
        path('', UserLogsAPIView.as_view(), name='user-logs'),
        path('content/', UserLogContentAPIView.as_view(), name='user-log-content'),
        path('summary/', UserActivitySummaryAPIView.as_view(), name='user-activity-summary'),
        path('types/', LogTypesAPIView.as_view(), name='log-types'),
        path('stats/', UserLogsStatsAPIView.as_view(), name='user-logs-stats'),
    ])),
]