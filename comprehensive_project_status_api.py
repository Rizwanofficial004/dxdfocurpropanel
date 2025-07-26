#!/usr/bin/env python3
"""
Comprehensive Project Status API
Single API endpoint that provides all project status information
Combines all APIs into one unified endpoint with multiple response formats
"""

import json
import requests
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

# CRM Configuration
CRM_BASE_URL = "https://crm.deluxebilisim.com/api"
CRM_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2NybS5kZWx1eGViaWxpc2ltLmNvbS9hcGkvbG9naW4iLCJpYXQiOjE3MzcwMzUzNjAsImV4cCI6MTczNzYzOTc2MCwibmJmIjoxNzM3MDM1MzYwLCJqdGkiOiJ6T3NiSHVWQU9qUXNRSGJiIiwic3ViIjoiMSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.k1VW7zWgqgMgNCtSJ-gWo6y4qaTJe8LdWzV7gZkGE-M"

def get_crm_projects():
    """Fetch all projects from CRM"""
    try:
        headers = {
            'Authorization': f'Bearer {CRM_TOKEN}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        response = requests.get(f"{CRM_BASE_URL}/projects", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') and 'data' in data:
                return data['data']
        
        return None
        
    except Exception as e:
        print(f"Error fetching CRM projects: {e}")
        return None

def analyze_project_status_static(projects):
    """Analyze project status using static CRM database mapping"""
    # Static mapping based on CRM database status values
    status_mapping = {
        '1': 'not_started',    # CRM Status 1 = Not Started
        '2': 'in_progress',    # CRM Status 2 = In Progress  
        '3': 'onhold',         # CRM Status 3 = On Hold
        '4': 'finished',       # CRM Status 4 = Finished
        '5': 'cancel'          # CRM Status 5 = Cancelled
    }
    
    # Initialize counters
    status_counts = {
        'not_started': 0,
        'in_progress': 0, 
        'onhold': 0,
        'cancel': 0,
        'finished': 0
    }
    
    # Projects by status
    projects_by_status = {
        'not_started': [],
        'in_progress': [],
        'onhold': [],
        'cancel': [],
        'finished': []
    }
    
    # Count projects by CRM status
    for project in projects:
        crm_status = str(project.get('status', '0'))
        mapped_status = status_mapping.get(crm_status, 'unknown')
        
        if mapped_status != 'unknown':
            status_counts[mapped_status] += 1
            projects_by_status[mapped_status].append({
                'id': project.get('id'),
                'name': project.get('name', 'Unknown Project'),
                'progress': project.get('progress', 0),
                'crm_status': crm_status,
                'mapped_status': mapped_status
            })
    
    return status_counts, projects_by_status

@csrf_exempt
@require_http_methods(["GET", "POST"])
def comprehensive_project_status_api(request):
    """
    Comprehensive Project Status API
    
    Single endpoint that provides all project status information in multiple formats
    
    Query Parameters:
    - format: 'simple', 'detailed', 'breakdown', 'all' (default: 'simple')
    - include_projects: 'true'/'false' (default: 'false')
    
    Returns different formats based on request:
    1. Simple: Just the counts
    2. Detailed: Counts with metadata
    3. Breakdown: Counts with sample projects
    4. All: Everything combined
    """
    
    try:
        # Get query parameters
        response_format = request.GET.get('format', 'simple')
        include_projects = request.GET.get('include_projects', 'false').lower() == 'true'
        
        print(f"🔍 Fetching projects from CRM...")
        projects = get_crm_projects()
        
        if projects is None:
            return JsonResponse({
                "success": False,
                "message": "Failed to fetch projects from CRM",
                "error": "CRM API connection failed",
                "timestamp": datetime.now().isoformat()
            }, status=500)
        
        print(f"✅ Successfully fetched {len(projects)} projects")
        
        # Analyze project status using static mapping
        status_counts, projects_by_status = analyze_project_status_static(projects)
        
        # Calculate total
        total_projects = sum(status_counts.values())
        
        # Base response data
        base_data = {
            "success": True,
            "total_projects": total_projects,
            "not_started": status_counts['not_started'],
            "in_progress": status_counts['in_progress'],
            "onhold": status_counts['onhold'],
            "cancel": status_counts['cancel'],
            "finished": status_counts['finished'],
            "from_crm_database": True,
            "timestamp": datetime.now().isoformat()
        }
        
        # Simple format - just the numbers (for dashboard widgets)
        if response_format == 'simple':
            return JsonResponse(base_data)
        
        # Detailed format - includes metadata and percentages
        elif response_format == 'detailed':
            detailed_data = base_data.copy()
            detailed_data.update({
                "percentages": {
                    "not_started_percent": round((status_counts['not_started'] / total_projects) * 100, 1) if total_projects > 0 else 0,
                    "in_progress_percent": round((status_counts['in_progress'] / total_projects) * 100, 1) if total_projects > 0 else 0,
                    "onhold_percent": round((status_counts['onhold'] / total_projects) * 100, 1) if total_projects > 0 else 0,
                    "cancel_percent": round((status_counts['cancel'] / total_projects) * 100, 1) if total_projects > 0 else 0,
                    "finished_percent": round((status_counts['finished'] / total_projects) * 100, 1) if total_projects > 0 else 0
                },
                "crm_status_mapping": {
                    "1": "not_started",
                    "2": "in_progress", 
                    "3": "onhold",
                    "4": "finished",
                    "5": "cancel"
                },
                "data_source": "CRM Database (Static Mapping)"
            })
            return JsonResponse(detailed_data)
        
        # Breakdown format - includes sample projects for each status
        elif response_format == 'breakdown':
            breakdown_data = base_data.copy()
            breakdown_data["status_breakdown"] = {}
            
            for status, projects_list in projects_by_status.items():
                breakdown_data["status_breakdown"][status] = {
                    "count": len(projects_list),
                    "sample_projects": projects_list[:5] if not include_projects else projects_list  # Show first 5 unless include_projects=true
                }
            
            return JsonResponse(breakdown_data)
        
        # All format - comprehensive response with everything
        elif response_format == 'all':
            comprehensive_data = base_data.copy()
            
            # Add percentages
            comprehensive_data["percentages"] = {
                "not_started_percent": round((status_counts['not_started'] / total_projects) * 100, 1) if total_projects > 0 else 0,
                "in_progress_percent": round((status_counts['in_progress'] / total_projects) * 100, 1) if total_projects > 0 else 0,
                "onhold_percent": round((status_counts['onhold'] / total_projects) * 100, 1) if total_projects > 0 else 0,
                "cancel_percent": round((status_counts['cancel'] / total_projects) * 100, 1) if total_projects > 0 else 0,
                "finished_percent": round((status_counts['finished'] / total_projects) * 100, 1) if total_projects > 0 else 0
            }
            
            # Add status breakdown
            comprehensive_data["status_breakdown"] = {}
            for status, projects_list in projects_by_status.items():
                comprehensive_data["status_breakdown"][status] = {
                    "count": len(projects_list),
                    "projects": projects_list if include_projects else projects_list[:3]  # Show first 3 unless include_projects=true
                }
            
            # Add metadata
            comprehensive_data.update({
                "crm_status_mapping": {
                    "1": "not_started",
                    "2": "in_progress", 
                    "3": "onhold", 
                    "4": "finished",
                    "5": "cancel"
                },
                "data_source": "CRM Database (Static Mapping)",
                "api_endpoints": {
                    "simple": "?format=simple",
                    "detailed": "?format=detailed", 
                    "breakdown": "?format=breakdown",
                    "all": "?format=all",
                    "with_projects": "?format=breakdown&include_projects=true"
                }
            })
            
            return JsonResponse(comprehensive_data)
        
        else:
            return JsonResponse({
                "success": False,
                "message": f"Invalid format: {response_format}",
                "valid_formats": ["simple", "detailed", "breakdown", "all"],
                "timestamp": datetime.now().isoformat()
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": f"API Error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status=500)

# Legacy API endpoints for backward compatibility
@csrf_exempt
@require_http_methods(["GET"])
def simple_dashboard_counts_api(request):
    """Simple counts API - backward compatibility"""
    return comprehensive_project_status_api(request)

@csrf_exempt  
@require_http_methods(["GET"])
def static_crm_status_api(request):
    """Static CRM status API - backward compatibility"""
    request.GET = request.GET.copy()
    request.GET['format'] = 'detailed'
    return comprehensive_project_status_api(request)

@csrf_exempt
@require_http_methods(["GET"])
def crm_status_breakdown_api(request):
    """CRM status breakdown API - backward compatibility"""
    request.GET = request.GET.copy()
    request.GET['format'] = 'breakdown'
    return comprehensive_project_status_api(request)
