from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from dashboard.views import staff_status_view
from .views import search_staff
from .views import get_cached_staff_data  # Import the view here

urlpatterns = [
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('index/', views.dashboard_view, name='dashboard'),
    path('live/', views.live_tracking, name='live_tracking'),
    path('reports/', views.reports_view, name='reports'),
    path('api-data/', views.api_data_view, name='api_data'),
    path('search-employee-names/', views.search_employee_names, name='search_employee_names'),
    path('search_staff/', search_staff, name='search_staff'),  # <-- trailing slash
    # path('api/user-timeline/', views.user_timeline_view, name='user_timeline'),
    path('api/staff-data/', get_cached_staff_data, name='get_cached_staff_data'), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
