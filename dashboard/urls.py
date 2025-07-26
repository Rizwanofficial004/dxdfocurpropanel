from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    # Enhanced Employee API
    path('api/dashboard/employees/enhanced/', views.enhanced_employees_api, name='enhanced_employees_api'),
    
    # Health check
    path('api/health/', views.api_health_check, name='api_health_check'),
]
