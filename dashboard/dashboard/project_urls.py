"""
URL Configuration for Project Management APIs
"""

from django.urls import path
from . import project_management_apis

urlpatterns = [
    # Project Management APIs
    path('projects/', project_management_apis.get_all_projects_api, name='get_all_projects'),
    path('projects/summary/', project_management_apis.get_projects_summary_api, name='get_projects_summary'),
    path('projects/<str:project_id>/', project_management_apis.get_project_by_id_api, name='get_project_by_id'),
]
