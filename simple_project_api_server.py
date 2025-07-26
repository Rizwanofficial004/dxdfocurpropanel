#!/usr/bin/env python3
"""
Simple Flask Server for Project Management APIs
Standalone test server to demonstrate the project APIs functionality
"""

from flask import Flask, jsonify, request
import requests
import json
from datetime import datetime

app = Flask(__name__)

# CRM Configuration
CRM_BASE_URL = "https://crm.deluxebilisim.com/api"
CRM_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o"

def get_crm_projects():
    """Get all projects from CRM"""
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

@app.route('/')
def home():
    """API Home page"""
    return jsonify({
        "message": "DDS Project Management API Server",
        "version": "1.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "projects": "/api/projects/",
            "projects_detailed": "/api/projects/?detailed=true",
            "projects_summary": "/api/projects/summary/",
            "project_by_id": "/api/projects/{id}/"
        }
    })

@app.route('/api/projects/', methods=['GET'])
def get_all_projects():
    """Get all projects with optional filtering and pagination"""
    try:
        # Get query parameters
        detailed = request.args.get('detailed', 'false').lower() == 'true'
        status = request.args.get('status')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Get projects from CRM
        projects = get_crm_projects()
        
        if projects is None:
            return jsonify({
                "success": False,
                "error": "Failed to fetch projects from CRM",
                "message": "Unable to connect to CRM system"
            }), 500
        
        # Filter by status if provided
        if status:
            projects = [p for p in projects if p.get('status') == status]
        
        # Calculate pagination
        total_projects = len(projects)
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_projects = projects[start_index:end_index]
        
        # Prepare response based on detailed flag
        if detailed:
            response_data = {
                "success": True,
                "data": paginated_projects,
                "meta": {
                    "total_projects": total_projects,
                    "current_page": page,
                    "per_page": limit,
                    "total_pages": (total_projects + limit - 1) // limit,
                    "has_next": end_index < total_projects,
                    "has_previous": page > 1
                },
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Basic format - only essential fields
            basic_projects = []
            for project in paginated_projects:
                basic_projects.append({
                    "id": project.get("id"),
                    "name": project.get("name"),
                    "status": project.get("status"),
                    "progress": project.get("progress"),
                    "start_date": project.get("start_date"),
                    "deadline": project.get("deadline")
                })
            
            response_data = {
                "success": True,
                "data": basic_projects,
                "meta": {
                    "total_projects": total_projects,
                    "showing": len(basic_projects)
                },
                "timestamp": datetime.now().isoformat()
            }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}",
            "message": "An error occurred while processing the request"
        }), 500

@app.route('/api/projects/summary/', methods=['GET'])
def get_projects_summary():
    """Get project statistics and summary"""
    try:
        # Get projects from CRM
        projects = get_crm_projects()
        
        if projects is None:
            return jsonify({
                "success": False,
                "error": "Failed to fetch projects from CRM"
            }), 500
        
        # Calculate statistics
        total_projects = len(projects)
        active_projects = len([p for p in projects if p.get('status') == '2'])
        completed_projects = len([p for p in projects if p.get('status') == '4'])
        pending_projects = len([p for p in projects if p.get('status') == '1'])
        
        # Calculate progress statistics
        total_progress = sum([float(p.get('progress', 0)) for p in projects])
        avg_progress = total_progress / total_projects if total_projects > 0 else 0
        
        response_data = {
            "success": True,
            "summary": {
                "total_projects": total_projects,
                "active_projects": active_projects,
                "completed_projects": completed_projects,
                "pending_projects": pending_projects,
                "average_progress": round(avg_progress, 2),
                "progress_distribution": {
                    "not_started": len([p for p in projects if float(p.get('progress', 0)) == 0]),
                    "in_progress": len([p for p in projects if 0 < float(p.get('progress', 0)) < 100]),
                    "completed": len([p for p in projects if float(p.get('progress', 0)) == 100])
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/projects/<project_id>/', methods=['GET'])
def get_project_by_id(project_id):
    """Get specific project by ID"""
    try:
        # Get projects from CRM
        projects = get_crm_projects()
        
        if projects is None:
            return jsonify({
                "success": False,
                "error": "Failed to fetch projects from CRM"
            }), 500
        
        # Find project by ID
        project = next((p for p in projects if p.get('id') == project_id), None)
        
        if not project:
            return jsonify({
                "success": False,
                "error": f"Project with ID '{project_id}' not found",
                "message": "The requested project does not exist"
            }), 404
        
        return jsonify({
            "success": True,
            "data": project,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "DDS Project Management API",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting DDS Project Management API Server...")
    print("📊 Connected to CRM: https://crm.deluxebilisim.com")
    print("🌐 Server will run on: http://127.0.0.1:5000")
    print("📋 Available endpoints:")
    print("   GET /api/projects/              - All projects (basic)")
    print("   GET /api/projects/?detailed=true - All projects (detailed)")
    print("   GET /api/projects/summary/      - Project statistics")
    print("   GET /api/projects/{id}/         - Specific project")
    print("   GET /health                     - Health check")
    print("=" * 50)
    
    app.run(host='127.0.0.1', port=5000, debug=True)
