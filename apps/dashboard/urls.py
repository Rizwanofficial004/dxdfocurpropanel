from django.urls import path, include
from . import views
from .credentials_views import CredentialsStatusView, CredentialsAPIView

from .users_screenshots_view import UsersScreenshotsView
from .users_search_views import EnhancedUsersSearchView
from .employees_details_views import EmployeesDetailsView
# from .user_timer_views import UserTimerAPIView, UserTimerStatsAPIView, TimerQuickActionAPIView
from .user_numeric_views import UserNumericValueAPIView, AllUsersNumericValuesAPIView, UserNumericValueByUserAPIView, UserSetupValueAPIView, AllUsersSetupValuesAPIView, AutoTokenSetValueAPIView, AutoTokenGetValueAPIView, FlexibleGetValueAPIView
# from .s3_timer_api_views import S3TimerAPIView, S3ScreenshotAPIView
from .ai_views import AIStatusView, AIChatView, AIEmployeeAnalysisView, AIReportGeneratorView
from .crm_comprehensive_views import CRMComprehensiveDashboardView, CRMConnectionTestView, DatabaseTestView
from .logs_views import LogsSearchView, LogsSystemView, LogsStatsView


app_name = 'dashboard'

urlpatterns = [
    # Analytics endpoints
    path('dashboard/analytics/', include([
        path('employees/', views.EmployeesAnalyticsView.as_view(), name='employees-analytics'),
    ])),
    
    # Dashboard-specific endpoints
    path('dashboard/employees/', UsersScreenshotsView.as_view(), name='dashboard-employees'),
    
    # Enhanced Users Search with Month Filter
    path('users/search/', EnhancedUsersSearchView.as_view(), name='enhanced-users-search'),
    
    # Employees Details API - Combines S3 and CRM Data
    path('Employees/Details/', EmployeesDetailsView.as_view(), name='employees-details'),
    
    # User Timer API - Full-stack timer for React frontend (temporarily disabled)
    # path('user-timer/', UserTimerAPIView.as_view(), name='user-timer-api'),
    # path('user-timer/<int:timer_id>/', UserTimerAPIView.as_view(), name='user-timer-detail'),
    # path('user-timer/stats/', UserTimerStatsAPIView.as_view(), name='user-timer-stats'),
    # path('user-timer/quick/', TimerQuickActionAPIView.as_view(), name='user-timer-quick'),
    
    # User Numeric Value API - Simple numeric values for each user
    path('user-value/', UserNumericValueAPIView.as_view(), name='user-numeric-value'),
    path('user-value/all/', AllUsersNumericValuesAPIView.as_view(), name='all-users-numeric-values'),
    path('user-value/<int:user_id>/', UserNumericValueByUserAPIView.as_view(), name='user-numeric-value-by-id'),
    
    # User Setup Value API - Get setup/configuration values
    path('setup-value/', UserSetupValueAPIView.as_view(), name='user-setup-value'),
    path('setup-value/<int:user_id>/', UserSetupValueAPIView.as_view(), name='user-setup-value-by-id'),
    path('setup-value/all/', AllUsersSetupValuesAPIView.as_view(), name='all-users-setup-values'),
    
    # Auto Token API - Set/Get values using user_id (no header token required)
    path('auto-set-value/', AutoTokenSetValueAPIView.as_view(), name='auto-token-set-value'),
    path('auto-get-value/', AutoTokenGetValueAPIView.as_view(), name='auto-token-get-value'),
    
    # Flexible Get Value API - Get values using user_id OR username (no header token required)
    path('flexible-get-value/', FlexibleGetValueAPIView.as_view(), name='flexible-get-value'),
    
    # S3 Timer API - S3 Integration for Timer Management (Temporarily disabled)
    # path('Timer/s3/', S3TimerAPIView.as_view(), name='s3-timer-api'),
    # path('Timer/s3/screenshots/', S3ScreenshotAPIView.as_view(), name='s3-screenshot-api'),
    
    # CRM Comprehensive endpoints
    path('dashboard/crm-comprehensive/', CRMComprehensiveDashboardView.as_view(), name='crm-comprehensive-dashboard'),
    path('dashboard/crm-test/', CRMConnectionTestView.as_view(), name='crm-connection-test'),
    path('dashboard/database-test/', DatabaseTestView.as_view(), name='database-test'),
   
    
  
    
    # AI endpoints
    path('ai/', include([
        path('status/', AIStatusView.as_view(), name='ai-status'),
        path('chat/', AIChatView.as_view(), name='ai-chat'),
        path('analyze/employees/', AIEmployeeAnalysisView.as_view(), name='ai-employee-analysis'),
        path('generate/report/', AIReportGeneratorView.as_view(), name='ai-report-generator'),
    ])),
    
    # Logs endpoints - Activity tracking and system logs
    path('logs/', include([
        path('search/', LogsSearchView.as_view(), name='logs-search'),
        path('system/', LogsSystemView.as_view(), name='logs-system'),
        path('stats/', LogsStatsView.as_view(), name='logs-stats'),
    ])),
    
    # System endpoints - Credentials Management
    path('credentials/', CredentialsAPIView.as_view(), name='credentials-api'),
    path('credentials/status/', CredentialsStatusView.as_view(), name='credentials-status'),
]
