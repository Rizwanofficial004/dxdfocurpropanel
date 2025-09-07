from django.urls import path, include
from . import views
from .credentials_views import CredentialsStatusView, CredentialsAPIView

from .users_screenshots_view import UsersScreenshotsView
from .users_search_views import EnhancedUsersSearchView
from .employees_details_views import EmployeesDetailsView
# from .timer_api_views import TimerAPIView, TimerHistoryAPIView, TimerSetupAPIView
# from .s3_timer_api_views import S3TimerAPIView, S3ScreenshotAPIView
from .ai_views import AIStatusView, AIChatView, AIEmployeeAnalysisView, AIReportGeneratorView
from .crm_comprehensive_views import CRMComprehensiveDashboardView, CRMConnectionTestView, DatabaseTestView


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
    
    # Timer API - Employee Timer Management (Temporarily disabled)
    # path('Timer/', TimerAPIView.as_view(), name='timer-api'),
    # path('Timer/History/', TimerHistoryAPIView.as_view(), name='timer-history'),
    # path('Timer/Setup/', TimerSetupAPIView.as_view(), name='timer-setup'),
    
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
    
    # System endpoints - Credentials Management
    path('credentials/', CredentialsAPIView.as_view(), name='credentials-api'),
    path('credentials/status/', CredentialsStatusView.as_view(), name='credentials-status'),
]
