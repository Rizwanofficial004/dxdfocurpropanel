from django.urls import path, include
from . import views
from .credentials_views import CredentialsStatusView, CredentialsAPIView, SetAllCredentialsAPIView, GetAllCredentialsAPIView
from .users_screenshots_view import UsersScreenshotsView
from .users_search_views import EnhancedUsersSearchView
from .employees_details_views import EmployeesDetailsView
from .simple_screenshot_proxy import SimpleScreenshotProxyView, SimpleScreenshotProxyStatusView
from .user_timer_views import UserTimerAPIView, UserTimerStatsAPIView, TimerQuickActionAPIView
from .user_numeric_views import UserNumericValueAPIView, AllUsersNumericValuesAPIView, UserNumericValueByUserAPIView, UserSetupValueAPIView, AllUsersSetupValuesAPIView, AutoTokenSetValueAPIView, AutoTokenGetValueAPIView, FlexibleGetValueAPIView
from .styling_views import UserStylingAPIView, AllUsersStylingAPIView, UserStylingByUserAPIView, AutoTokenStylingSetAPIView, AutoTokenStylingGetAPIView, UserStylingCSSAPIView
from .app_styling_views import AppStylingAPIView, AppStylingUpdateAPIView, AllAppStylingsAPIView, AppStylingActivateAPIView, AppStylingCSSAPIView, QuickSetStylingAPIView, SetAllStylingValuesAPIView, GetAllStylingValuesAPIView
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

    # Dashboard-specific endpoints
    path('api/live-tracking/fast-screenshots/', UsersScreenshotsView.as_view(), name='fast-screenshots'),
    
    # Simple Screenshot Proxy - Handle S3 CORS issues
    path('api/simple-screenshot-proxy/', SimpleScreenshotProxyView.as_view(), name='simple-screenshot-proxy'),
    path('api/simple-screenshot-proxy/status/', SimpleScreenshotProxyStatusView.as_view(), name='simple-screenshot-proxy-status'),
    
    # Enhanced Users Search with Month Filter
    path('users/search/', EnhancedUsersSearchView.as_view(), name='enhanced-users-search'),

    # Employees Details API - Combines S3 and CRM Data
    path('Employees/Details/', EmployeesDetailsView.as_view(), name='employees-details'),

    # User Timer API - Full-stack timer for React frontend
    path('user-timer/', UserTimerAPIView.as_view(), name='user-timer-api'),
    path('user-timer/<int:timer_id>/', UserTimerAPIView.as_view(), name='user-timer-detail'),
    path('user-timer/stats/', UserTimerStatsAPIView.as_view(), name='user-timer-stats'),
    path('user-timer/quick/', TimerQuickActionAPIView.as_view(), name='user-timer-quick'),
    
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

    # User Styling API - Theme/styling configurations for users
    path('user-styling/', UserStylingAPIView.as_view(), name='user-styling'),
    path('user-styling/all/', AllUsersStylingAPIView.as_view(), name='all-users-styling'),
    path('user-styling/<int:user_id>/', UserStylingByUserAPIView.as_view(), name='user-styling-by-id'),
    
    # Auto Token Styling API - Set/Get styling using user_id (no header token required)
    path('auto-set-styling/', AutoTokenStylingSetAPIView.as_view(), name='auto-token-set-styling'),
    path('auto-get-styling/', AutoTokenStylingGetAPIView.as_view(), name='auto-token-get-styling'),

    # CSS API - Get CSS variables for styling (no authentication required)
    path('styling-css/', UserStylingCSSAPIView.as_view(), name='styling-css'),
    path('styling-css/<int:user_id>/', UserStylingCSSAPIView.as_view(), name='styling-css-by-user'),

    # ============= GENERAL APP STYLING API =============
    # App Styling API - General application styling (not user-specific)
    path('app-styling/', AppStylingAPIView.as_view(), name='app-styling'),
    path('app-styling/all/', AllAppStylingsAPIView.as_view(), name='all-app-stylings'),
    path('app-styling/<int:styling_id>/', AppStylingUpdateAPIView.as_view(), name='app-styling-update'),
    path('app-styling/<int:styling_id>/activate/', AppStylingActivateAPIView.as_view(), name='app-styling-activate'),
    
    # Quick Set Styling API - Fast styling setup (no authentication required)
    path('quick-set-styling/', QuickSetStylingAPIView.as_view(), name='quick-set-styling'),

    # SET ALL STYLING VALUES API - Comprehensive styling endpoint (no authentication required)
    path('set-all-styling/', SetAllStylingValuesAPIView.as_view(), name='set-all-styling-values'),

    # GET ALL STYLING VALUES API - Retrieve all styling configurations (no authentication required)
    path('get-all-styling/', GetAllStylingValuesAPIView.as_view(), name='get-all-styling-values'),

    # App CSS API - Get CSS variables for general app styling (no authentication required)
    path('app-styling-css/', AppStylingCSSAPIView.as_view(), name='app-styling-css'),
    path('app-styling-css/<int:styling_id>/', AppStylingCSSAPIView.as_view(), name='app-styling-css-by-id'),

    # Global Styling API - Simplified access to global application styling
    path('styling/global/', AppStylingAPIView.as_view(), name='global-styling'),

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

    # ============= S3 USER LOGS API =============
    # User Logs API - Retrieve user logs from S3 storage
    path('user-logs/', UserLogsAPIView.as_view(), name='user-logs'),
    path('user-logs/content/<path:log_key>/', UserLogContentAPIView.as_view(), name='user-log-content'),
    path('user-logs/summary/', UserActivitySummaryAPIView.as_view(), name='user-activity-summary'),
    path('user-logs/types/', LogTypesAPIView.as_view(), name='log-types'),
    path('user-logs/statistics/', UserLogsStatsAPIView.as_view(), name='user-logs-stats'),

    # System endpoints - Credentials Management
    path('credentials/', CredentialsAPIView.as_view(), name='credentials-api'),
    path('credentials/status/', CredentialsStatusView.as_view(), name='credentials-status'),

    # ============= COMPREHENSIVE CREDENTIALS API =============
    # SET ALL CREDENTIALS API - Set AWS, Database, OpenAI, Auth credentials (no authentication required)
    path('set-all-credentials/', SetAllCredentialsAPIView.as_view(), name='set-all-credentials'),

    # GET ALL CREDENTIALS API - Retrieve all credentials configurations (no authentication required)
    path('get-all-credentials/', GetAllCredentialsAPIView.as_view(), name='get-all-credentials'),
]
