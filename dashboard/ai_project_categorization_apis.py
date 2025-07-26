#!/usr/bin/env python3
"""
AI-Powered Project Status Categorization API
Uses OpenAI to analyze project names and categorize them into status groups
"""

import requests
import json
from openai import OpenAI
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# OpenAI Configuration
OPENAI_API_KEY = "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"
client = OpenAI(api_key=OPENAI_API_KEY)

# CRM Configuration
CRM_BASE_URL = "https://crm.deluxebilisim.com/api"
CRM_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o"

def get_crm_projects():
    """Fetch all projects from CRM"""
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

def categorize_projects_with_ai(projects):
    """Use OpenAI to categorize projects into status groups"""
    try:
        # Prepare project data for AI analysis
        project_names = []
        for project in projects[:50]:  # Limit to first 50 for API efficiency
            project_names.append({
                "id": project.get("id"),
                "name": project.get("name"),
                "current_status": project.get("status"),
                "progress": project.get("progress", "0")
            })
        
        prompt = f"""
Analyze these project names and categorize them into 5 status categories based on their names, keywords, and context.

Categories:
1. "not_started" - Projects that haven't begun, planning phase, or preparation
2. "in_progress" - Active ongoing projects, development, implementation
3. "onhold" - Paused, delayed, or temporarily suspended projects
4. "cancel" - Cancelled, abandoned, or terminated projects  
5. "finished" - Completed, delivered, or finalized projects

Projects to analyze:
{json.dumps(project_names, indent=2)}

Look for keywords like:
- Not started: "planning", "proposal", "design phase", "upcoming"
- In progress: "development", "ongoing", "current", "active", "working on"
- On hold: "paused", "delayed", "suspended", "pending"
- Cancelled: "cancelled", "abandoned", "terminated", "stopped"
- Finished: "completed", "delivered", "finalized", "done", "launched"

Also consider:
- Year indicators (2025 projects might be ongoing/planned)
- Website/development projects are often in progress
- Marketing/social media projects are typically ongoing
- Maintenance projects are usually continuous

Return a JSON response with this exact structure:
{{
  "categorized_projects": {{
    "not_started": [
      {{"id": "123", "name": "Project Name", "reason": "why categorized as not started"}}
    ],
    "in_progress": [
      {{"id": "456", "name": "Project Name", "reason": "why categorized as in progress"}}
    ],
    "onhold": [
      {{"id": "789", "name": "Project Name", "reason": "why categorized as on hold"}}
    ],
    "cancel": [
      {{"id": "101", "name": "Project Name", "reason": "why categorized as cancelled"}}
    ],
    "finished": [
      {{"id": "112", "name": "Project Name", "reason": "why categorized as finished"}}
    ]
  }},
  "summary": {{
    "not_started_count": 0,
    "in_progress_count": 0,
    "onhold_count": 0,
    "cancel_count": 0,
    "finished_count": 0
  }}
}}
"""

        # Call OpenAI API with new v1.0+ syntax
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert project manager who can analyze project names and categorize them by status. Always return valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=2000,
            temperature=0.3
        )
        
        # Parse AI response
        ai_response = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            json_str = ai_response[json_start:json_end]
            
            categorized_data = json.loads(json_str)
            return categorized_data
            
        except json.JSONDecodeError:
            # Fallback: create basic categorization
            return create_basic_categorization(projects)
            
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        return create_basic_categorization(projects)

def create_basic_categorization(projects):
    """Fallback categorization based on keywords"""
    categorized = {
        "categorized_projects": {
            "not_started": [],
            "in_progress": [],
            "onhold": [],
            "cancel": [],
            "finished": []
        },
        "summary": {
            "not_started_count": 0,
            "in_progress_count": 0,
            "onhold_count": 0,
            "cancel_count": 0,
            "finished_count": 0
        }
    }
    
    for project in projects:
        name = project.get("name", "").lower()
        project_data = {
            "id": project.get("id"),
            "name": project.get("name"),
            "reason": "Keyword-based categorization"
        }
        
        # Basic keyword categorization
        if any(keyword in name for keyword in ["2025", "planning", "design", "proposal"]):
            categorized["categorized_projects"]["not_started"].append(project_data)
            categorized["summary"]["not_started_count"] += 1
        elif any(keyword in name for keyword in ["development", "website", "web", "ongoing", "management"]):
            categorized["categorized_projects"]["in_progress"].append(project_data)
            categorized["summary"]["in_progress_count"] += 1
        elif any(keyword in name for keyword in ["hold", "pause", "delay"]):
            categorized["categorized_projects"]["onhold"].append(project_data)
            categorized["summary"]["onhold_count"] += 1
        elif any(keyword in name for keyword in ["cancel", "abandon", "stop"]):
            categorized["categorized_projects"]["cancel"].append(project_data)
            categorized["summary"]["cancel_count"] += 1
        else:
            # Default to in progress for active projects
            categorized["categorized_projects"]["in_progress"].append(project_data)
            categorized["summary"]["in_progress_count"] += 1
    
    return categorized

@csrf_exempt
def ai_project_categorization_api(request):
    """API endpoint for AI-powered project categorization"""
    if request.method != 'GET':
        return JsonResponse({
            "success": False,
            "error": "Method not allowed. Use GET."
        }, status=405)
    
    try:
        # Get projects from CRM
        projects = get_crm_projects()
        
        if projects is None:
            return JsonResponse({
                "success": False,
                "error": "Failed to fetch projects from CRM",
                "message": "Unable to connect to CRM system"
            }, status=500)
        
        # Categorize projects using AI
        categorized_data = categorize_projects_with_ai(projects)
        
        # Prepare response
        response_data = {
            "success": True,
            "message": "Projects categorized successfully using AI",
            "total_projects": len(projects),
            "categorization": categorized_data,
            "ai_powered": True,
            "timestamp": datetime.now().isoformat()
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"Server error: {str(e)}",
            "message": "An error occurred while categorizing projects"
        }, status=500)

@csrf_exempt
def project_status_summary_api(request):
    """API endpoint for project status summary only"""
    if request.method != 'GET':
        return JsonResponse({
            "success": False,
            "error": "Method not allowed. Use GET."
        }, status=405)
    
    try:
        # Get projects from CRM
        projects = get_crm_projects()
        
        if projects is None:
            return JsonResponse({
                "success": False,
                "error": "Failed to fetch projects from CRM"
            }, status=500)
        
        # Categorize projects using AI
        categorized_data = categorize_projects_with_ai(projects)
        
        # Return only summary
        response_data = {
            "success": True,
            "total_projects": len(projects),
            "status_summary": categorized_data.get("summary", {}),
            "ai_powered": True,
            "timestamp": datetime.now().isoformat()
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"Server error: {str(e)}"
        }, status=500)
