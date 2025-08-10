#!/usr/bin/env python3
"""
Static CRM Project Status API
Returns actual CRM status counts directly from database - no AI, no dynamic categorization
Just pure CRM data mapping
"""

import requests
import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# CRM Configuration
CRM_BASE_URL = "https://crm.deluxebilisim.com/api"
CRM_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o"

def get_crm_projects():
    """Fetch all projects from CRM database"""
    try:
        headers = {
            'authtoken': CRM_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'DDS-Focus-Time-Dashboard/1.0'
        }
        
        response = requests.get(f"{CRM_BASE_URL}/projects", headers=headers, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            return None
            
    except Exception as e:
        print(f"CRM API Error: {str(e)}")
        return None

def get_static_crm_status_counts(projects):
    """
    Get static status counts directly from CRM database
    No AI, no dynamic logic - just count the actual CRM status values
    """
    # Initialize counters
    status_counts = {
        "1": 0,  # CRM Status 1
        "2": 0,  # CRM Status 2  
        "3": 0,  # CRM Status 3
        "4": 0,  # CRM Status 4
        "5": 0   # CRM Status 5
    }
    
    # Count actual CRM status values
    for project in projects:
        crm_status = str(project.get("status", "unknown"))
        if crm_status in status_counts:
            status_counts[crm_status] += 1
    
    # Static mapping (based on analysis - these are the real CRM mappings)
    # Status 1 = Not Started (2 projects)
    # Status 2 = In Progress (34 projects)  
    # Status 3 = On Hold (4 projects)
    # Status 4 = Finished (243 projects)
    # Status 5 = Cancelled (6 projects)
    
    return {
        "not_started": status_counts["1"],     # Static: CRM Status 1 → Not Started
        "in_progress": status_counts["2"],     # Static: CRM Status 2 → In Progress
        "onhold": status_counts["3"],          # Static: CRM Status 3 → On Hold  
        "finished": status_counts["4"],        # Static: CRM Status 4 → Finished
        "cancel": status_counts["5"],          # Static: CRM Status 5 → Cancelled
        "crm_status_raw": status_counts        # Raw CRM status counts
    }

@csrf_exempt
def static_crm_status_api(request):
    """
    Static CRM Status API - Returns actual database counts
    No AI, no dynamic logic - pure CRM data
    """
    if request.method != 'GET':
        return JsonResponse({
            "success": False,
            "error": "Method not allowed. Use GET."
        }, status=405)
    
    try:
        # Get projects from CRM database
        projects = get_crm_projects()
        
        if projects is None:
            return JsonResponse({
                "success": False,
                "error": "Failed to fetch projects from CRM database",
                "message": "Unable to connect to CRM system"
            }, status=500)
        
        # Get static status counts from database
        status_data = get_static_crm_status_counts(projects)
        
        # Prepare response with actual CRM data
        response_data = {
            "success": True,
            "message": "Static CRM status counts from database",
            "total_projects": len(projects),
            "status_summary": {
                "not_started": status_data["not_started"],
                "in_progress": status_data["in_progress"], 
                "onhold": status_data["onhold"],
                "cancel": status_data["cancel"],
                "finished": status_data["finished"]
            },
            "crm_mapping": {
                "status_1_not_started": status_data["not_started"],
                "status_2_in_progress": status_data["in_progress"],
                "status_3_onhold": status_data["onhold"],
                "status_4_finished": status_data["finished"],
                "status_5_cancel": status_data["cancel"]
            },
            "raw_crm_counts": status_data["crm_status_raw"],
            "data_source": "CRM Database",
            "static": True,
            "timestamp": datetime.now().isoformat()
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"Server error: {str(e)}",
            "message": "An error occurred while fetching CRM data"
        }, status=500)

@csrf_exempt
def simple_dashboard_counts_api(request):
    """
    Simple Dashboard Counts API - Just the numbers for dashboard
    Pure CRM database counts - no extra data
    """
    if request.method != 'GET':
        return JsonResponse({
            "success": False,
            "error": "Method not allowed. Use GET."
        }, status=405)
    
    try:
        # Get projects from CRM database
        projects = get_crm_projects()
        
        if projects is None:
            return JsonResponse({
                "success": False,
                "error": "Failed to fetch projects from CRM database"
            }, status=500)
        
        # Get static status counts
        status_data = get_static_crm_status_counts(projects)
        
        # Return simple counts only
        response_data = {
            "success": True,
            "not_started": status_data["not_started"],      # 2
            "in_progress": status_data["in_progress"],      # 34
            "onhold": status_data["onhold"],                # 4  
            "cancel": status_data["cancel"],                # 6
            "finished": status_data["finished"],            # 243
            "total": len(projects),                         # 289
            "from_crm_database": True
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"Server error: {str(e)}"
        }, status=500)

@csrf_exempt  
def crm_status_breakdown_api(request):
    """
    CRM Status Breakdown API - Shows which projects are in each status
    Static data from CRM database with project details
    """
    if request.method != 'GET':
        return JsonResponse({
            "success": False,
            "error": "Method not allowed. Use GET."
        }, status=405)
    
    try:
        # Get projects from CRM database
        projects = get_crm_projects()
        
        if projects is None:
            return JsonResponse({
                "success": False,
                "error": "Failed to fetch projects from CRM database"
            }, status=500)
        
        # Group projects by CRM status
        status_groups = {
            "not_started": [],      # CRM Status 1
            "in_progress": [],      # CRM Status 2
            "onhold": [],           # CRM Status 3
            "finished": [],         # CRM Status 4
            "cancel": []            # CRM Status 5
        }
        
        # Static mapping
        status_mapping = {
            "1": "not_started",
            "2": "in_progress", 
            "3": "onhold",
            "4": "finished",
            "5": "cancel"
        }
        
        for project in projects:
            crm_status = str(project.get("status", ""))
            
            if crm_status in status_mapping:
                category = status_mapping[crm_status]
                project_info = {
                    "id": project.get("id"),
                    "name": project.get("name"),
                    "crm_status": crm_status,
                    "progress": project.get("progress", "0"),
                    "start_date": project.get("start_date"),
                    "client": project.get("company", "")
                }
                status_groups[category].append(project_info)
        
        # Prepare response
        response_data = {
            "success": True,
            "total_projects": len(projects),
            "projects_by_status": status_groups,
            "counts": {
                "not_started": len(status_groups["not_started"]),
                "in_progress": len(status_groups["in_progress"]),
                "onhold": len(status_groups["onhold"]),
                "cancel": len(status_groups["cancel"]),
                "finished": len(status_groups["finished"])
            },
            "crm_database": True,
            "static_data": True,
            "timestamp": datetime.now().isoformat()
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"Server error: {str(e)}"
        }, status=500)
