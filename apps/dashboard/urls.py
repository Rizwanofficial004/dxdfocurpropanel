from django.urls import path, include
from . import views
from .credentials_views import CredentialsStatusView, CredentialsAPIView, SetAllCredentialsAPIView, GetAllCredentialsAPIView
from .users_screenshots_view import UsersScreenshotsView
from .users_search_views import EnhancedUsersSearchView
from .employees_details_views import EmployeesDetailsView
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
    
    # Simple Screenshot Proxy - Handle S3 CORS issues
    path('api/simple-screenshot-proxy/', SimpleScreenshotProxyView.as_view(), name='simple-screenshot-proxy'),
    path('api/simple-screenshot-proxy/status/', SimpleScreenshotProxyStatusView.as_view(), name='simple-screenshot-proxy-status'),

    # Employees Details API - Combines S3 and CRM Data
    path('Employees/Details/', EmployeesDetailsView.as_view(), name='employees-details'),

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