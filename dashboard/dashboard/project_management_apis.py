"""
Project Management APIs
======================

This module provides APIs for project management including:
- Get All Projects from CRM
- Project Details
- Project Statistics
"""

import logging
import json
import requests
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings

logger = logging.getLogger(__name__)

# CRM Configuration
CRM_BASE_URL = "https://crm.deluxebilisim.com"
CRM_AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o"

# Custom response helper
def api_response(success=True, message="", data=None, status_code=200):
    """
    Standardized API response format
    """
    response_data = {
        "success": success,
        "message": message,
        "data": data or {},
        "timestamp": datetime.now().isoformat()
    }
    return JsonResponse(response_data, status=status_code)

def get_crm_headers():
    """
    Get standard headers for CRM API requests
    """
    return {
        'authtoken': CRM_AUTH_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DDS-Focus-Time-Dashboard/1.0'
    }

@csrf_exempt
@require_http_methods(["GET"])
def get_all_projects_api(request):
    """
    Get all projects from CRM system
    
    Query Parameters:
    - page: Page number (optional)
    - limit: Number of projects per page (optional)
    - status: Filter by project status (optional)
    - detailed: Return detailed project information (true/false)
    """
    try:
        # Get query parameters
        page = request.GET.get('page', 1)
        limit = request.GET.get('limit', 50)
        status_filter = request.GET.get('status', None)
        detailed = request.GET.get('detailed', 'false').lower() == 'true'
        
        # Construct API URL
        api_url = f"{CRM_BASE_URL}/api/projects"
        
        # Add query parameters
        params = {}
        if page:
            params['page'] = page
        if limit:
            params['limit'] = limit
        if status_filter:
            params['status'] = status_filter
            
        # Prepare headers
        headers = get_crm_headers()
        
        # Make API request to CRM
        logger.info(f"Making request to: {api_url} with params: {params}")
        response = requests.get(api_url, headers=headers, params=params, timeout=30)
        
        logger.info(f"CRM API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            crm_data = response.json()
            logger.info(f"CRM Response Keys: {crm_data.keys() if isinstance(crm_data, dict) else 'Not a dict'}")
            
            # Process the response data
            if isinstance(crm_data, dict):
                projects = crm_data.get('data', crm_data.get('projects', []))
                total_count = crm_data.get('total', crm_data.get('count', len(projects)))
                
                # If projects is still not a list, try to extract it
                if not isinstance(projects, list):
                    projects = []
                    total_count = 0
                    
            elif isinstance(crm_data, list):
                projects = crm_data
                total_count = len(projects)
            else:
                projects = []
                total_count = 0
            
            # Process projects data
            processed_projects = []
            for project in projects:
                if detailed:
                    # Return full project details
                    processed_project = {
                        'id': project.get('id', project.get('project_id', 'Unknown')),
                        'name': project.get('name', project.get('project_name', 'Unnamed Project')),
                        'description': project.get('description', project.get('desc', '')),
                        'status': project.get('status', 'Unknown'),
                        'priority': project.get('priority', 'Medium'),
                        'start_date': project.get('start_date', project.get('created_at', '')),
                        'end_date': project.get('end_date', project.get('deadline', '')),
                        'client': project.get('client', project.get('client_name', '')),
                        'budget': project.get('budget', project.get('project_budget', 0)),
                        'progress': project.get('progress', project.get('completion_percentage', 0)),
                        'team_size': project.get('team_size', 0),
                        'created_at': project.get('created_at', ''),
                        'updated_at': project.get('updated_at', ''),
                        'raw_data': project  # Include original data for debugging
                    }
                else:
                    # Return basic project info
                    processed_project = {
                        'id': project.get('id', project.get('project_id', 'Unknown')),
                        'name': project.get('name', project.get('project_name', 'Unnamed Project')),
                        'status': project.get('status', 'Unknown'),
                        'client': project.get('client', project.get('client_name', '')),
                        'progress': project.get('progress', project.get('completion_percentage', 0))
                    }
                
                processed_projects.append(processed_project)
            
            # Calculate statistics
            stats = {
                'total_projects': total_count,
                'active_projects': len([p for p in processed_projects if p.get('status', '').lower() in ['active', 'in progress', 'ongoing']]),
                'completed_projects': len([p for p in processed_projects if p.get('status', '').lower() in ['completed', 'finished', 'done']]),
                'pending_projects': len([p for p in processed_projects if p.get('status', '').lower() in ['pending', 'waiting', 'on hold']]),
                'projects_returned': len(processed_projects)
            }
            
            return api_response(
                success=True,
                message=f"Successfully retrieved {len(processed_projects)} projects from CRM",
                data={
                    "projects": processed_projects,
                    "statistics": stats,
                    "pagination": {
                        "page": int(page),
                        "limit": int(limit),
                        "total_count": total_count
                    },
                    "filters_applied": {
                        "status": status_filter,
                        "detailed": detailed
                    },
                    "last_updated": datetime.now().isoformat(),
                    "source": "Deluxe Bilisim CRM API",
                    "api_endpoint": api_url,
                    "response_status": response.status_code
                }
            )
        else:
            # Handle CRM API error
            error_details = {
                "status_code": response.status_code,
                "error_text": response.text[:500],  # Limit error text
                "headers": dict(response.headers),
                "url": api_url
            }
            
            logger.error(f"CRM API Error: {error_details}")
            
            return api_response(
                success=False,
                message=f"CRM API error: {response.status_code} - {response.reason}",
                data={
                    "error_details": error_details,
                    "crm_status_code": response.status_code,
                    "crm_error": response.text[:200]
                },
                status_code=502
            )
            
    except requests.RequestException as e:
        logger.error(f"Error connecting to CRM API: {str(e)}")
        return api_response(
            success=False,
            message=f"CRM API connection error: {str(e)}",
            data={
                "error_type": "ConnectionError",
                "error_details": str(e)
            },
            status_code=502
        )
    except Exception as e:
        logger.error(f"Error getting projects: {str(e)}")
        return api_response(
            success=False,
            message=f"Error retrieving projects: {str(e)}",
            data={
                "error_type": type(e).__name__,
                "error_details": str(e)
            },
            status_code=500
        )

@csrf_exempt
@require_http_methods(["GET"])
def get_project_by_id_api(request, project_id):
    """
    Get specific project details by ID
    """
    try:
        # Construct API URL
        api_url = f"{CRM_BASE_URL}/api/projects/{project_id}"
        
        # Prepare headers
        headers = get_crm_headers()
        
        # Make API request to CRM
        response = requests.get(api_url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            project_data = response.json()
            
            return api_response(
                success=True,
                message=f"Successfully retrieved project {project_id}",
                data={
                    "project": project_data,
                    "last_updated": datetime.now().isoformat(),
                    "source": "Deluxe Bilisim CRM API"
                }
            )
        else:
            return api_response(
                success=False,
                message=f"Project not found or CRM API error: {response.status_code}",
                data={
                    "project_id": project_id,
                    "crm_status_code": response.status_code,
                    "crm_error": response.text
                },
                status_code=404 if response.status_code == 404 else 502
            )
            
    except requests.RequestException as e:
        logger.error(f"Error connecting to CRM API: {str(e)}")
        return api_response(
            success=False,
            message=f"CRM API connection error: {str(e)}",
            status_code=502
        )
    except Exception as e:
        logger.error(f"Error getting project {project_id}: {str(e)}")
        return api_response(
            success=False,
            message=f"Error retrieving project: {str(e)}",
            status_code=500
        )

@csrf_exempt
@require_http_methods(["GET"])
def get_projects_summary_api(request):
    """
    Get project statistics and summary
    """
    try:
        # Get all projects first
        api_url = f"{CRM_BASE_URL}/api/projects"
        headers = get_crm_headers()
        
        response = requests.get(api_url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            crm_data = response.json()
            
            # Extract projects
            if isinstance(crm_data, dict):
                projects = crm_data.get('data', crm_data.get('projects', []))
            elif isinstance(crm_data, list):
                projects = crm_data
            else:
                projects = []
            
            # Calculate comprehensive statistics
            total_projects = len(projects)
            status_counts = {}
            priority_counts = {}
            monthly_projects = {}
            
            for project in projects:
                # Count by status
                status = project.get('status', 'Unknown').lower()
                status_counts[status] = status_counts.get(status, 0) + 1
                
                # Count by priority
                priority = project.get('priority', 'Medium')
                priority_counts[priority] = priority_counts.get(priority, 0) + 1
                
                # Count by month (if created_at exists)
                created_at = project.get('created_at', '')
                if created_at:
                    try:
                        month_key = created_at[:7]  # YYYY-MM
                        monthly_projects[month_key] = monthly_projects.get(month_key, 0) + 1
                    except:
                        pass
            
            summary = {
                "total_projects": total_projects,
                "status_breakdown": status_counts,
                "priority_breakdown": priority_counts,
                "monthly_breakdown": monthly_projects,
                "quick_stats": {
                    "active": status_counts.get('active', 0) + status_counts.get('in progress', 0),
                    "completed": status_counts.get('completed', 0) + status_counts.get('finished', 0),
                    "pending": status_counts.get('pending', 0) + status_counts.get('on hold', 0)
                }
            }
            
            return api_response(
                success=True,
                message="Project summary retrieved successfully",
                data={
                    "summary": summary,
                    "last_updated": datetime.now().isoformat(),
                    "source": "Deluxe Bilisim CRM API"
                }
            )
        else:
            return api_response(
                success=False,
                message=f"CRM API error: {response.status_code}",
                status_code=502
            )
            
    except Exception as e:
        logger.error(f"Error getting projects summary: {str(e)}")
        return api_response(
            success=False,
            message=f"Error retrieving projects summary: {str(e)}",
            status_code=500
        )
