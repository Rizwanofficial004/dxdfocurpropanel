from django.urls import path, include
from . import views
from .credentials_views import CredentialsStatusView

from .users_screenshots_view import UsersScreenshotsView
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
    
    # System endpoints
    path('credentials/status/', CredentialsStatusView.as_view(), name='credentials-status'),
]
