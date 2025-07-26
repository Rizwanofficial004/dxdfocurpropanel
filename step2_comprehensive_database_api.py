#!/usr/bin/env python3
"""
AI-Powered Database Comprehensive API - Step 2
Creates a unified API that searches across all key database tables using AI
Returns comprehensive business insights from CRM data
"""

import mysql.connector
import json
import requests
from datetime import datetime, date
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from openai import OpenAI

# Database Configuration
DB_CONFIG = {
    'host': '92.113.22.65',
    'user': 'u906714182_sqlrrefdvdv', 
    'password': '3@6*t:lU',
    'database': 'u906714182_sqlrrefdvdv',
    'port': 3306
}

# OpenAI Configuration
OPENAI_API_KEY = "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"
client = OpenAI(api_key=OPENAI_API_KEY)

class DatabaseAPIManager:
    def __init__(self):
        self.connection = None
        self.cursor = None
        
    def connect(self):
        """Connect to database"""
        try:
            self.connection = mysql.connector.connect(**DB_CONFIG)
            self.cursor = self.connection.cursor(dictionary=True)
            return True
        except Exception as e:
            print(f"Database connection error: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from database"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
    
    def safe_execute(self, query, params=None):
        """Safely execute query with error handling"""
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            return self.cursor.fetchall()
        except Exception as e:
            print(f"Query error: {e}")
            return []
    
    def get_projects_data(self):
        """Get comprehensive projects data"""
        query = """
        SELECT 
            p.id,
            p.name,
            p.description,
            p.status,
            p.progress,
            p.start_date,
            p.deadline,
            p.dateadded,
            p.addedfrom,
            CONCAT(s.firstname, ' ', s.lastname) as project_manager,
            c.company as client_name,
            c.email as client_email,
            (SELECT COUNT(*) FROM tbltasks WHERE rel_type='project' AND rel_id=p.id) as task_count,
            (SELECT COUNT(*) FROM tbltasks WHERE rel_type='project' AND rel_id=p.id AND status=5) as completed_tasks,
            (SELECT SUM(total) FROM tblinvoices WHERE project_id=p.id) as total_invoiced
        FROM tblprojects p
        LEFT JOIN tblstaff s ON p.addedfrom = s.staffid
        LEFT JOIN tblclients c ON p.clientid = c.userid
        ORDER BY p.dateadded DESC
        LIMIT 100
        """
        return self.safe_execute(query)
    
    def get_tasks_data(self):
        """Get comprehensive tasks data"""
        query = """
        SELECT 
            t.id,
            t.name,
            t.description,
            t.status,
            t.priority,
            t.startdate,
            t.duedate,
            t.dateadded,
            t.addedfrom,
            t.rel_type,
            t.rel_id,
            CONCAT(s.firstname, ' ', s.lastname) as created_by,
            (SELECT COUNT(*) FROM tbltask_comments WHERE taskid=t.id) as comment_count,
            (SELECT SUM(TIMESTAMPDIFF(SECOND, start_time, end_time)) FROM tbltaskstimers WHERE task_id=t.id) as total_time_seconds
        FROM tbltasks t
        LEFT JOIN tblstaff s ON t.addedfrom = s.staffid
        ORDER BY t.dateadded DESC
        LIMIT 200
        """
        return self.safe_execute(query)
    
    def get_clients_data(self):
        """Get comprehensive clients data"""
        query = """
        SELECT 
            c.userid,
            c.company,
            c.email,
            c.phonenumber,
            c.country,
            c.city,
            c.dateadded,
            c.addedfrom,
            CONCAT(s.firstname, ' ', s.lastname) as added_by,
            (SELECT COUNT(*) FROM tblprojects WHERE clientid=c.userid) as project_count,
            (SELECT COUNT(*) FROM tblinvoices WHERE clientid=c.userid) as invoice_count,
            (SELECT SUM(total) FROM tblinvoices WHERE clientid=c.userid AND status=2) as total_paid,
            (SELECT COUNT(*) FROM tbltickets WHERE userid=c.userid) as ticket_count
        FROM tblclients c
        LEFT JOIN tblstaff s ON c.addedfrom = s.staffid
        ORDER BY c.dateadded DESC
        LIMIT 100
        """
        return self.safe_execute(query)
    
    def get_invoices_data(self):
        """Get comprehensive invoices data"""
        query = """
        SELECT 
            i.id,
            i.number,
            i.clientid,
            i.project_id,
            i.date,
            i.duedate,
            i.status,
            i.subtotal,
            i.total,
            i.dateadded,
            c.company as client_name,
            p.name as project_name,
            CASE 
                WHEN i.status = 1 THEN 'Draft'
                WHEN i.status = 2 THEN 'Paid'
                WHEN i.status = 3 THEN 'Partially Paid'
                WHEN i.status = 4 THEN 'Overdue'
                WHEN i.status = 5 THEN 'Cancelled'
                ELSE 'Unknown'
            END as status_text
        FROM tblinvoices i
        LEFT JOIN tblclients c ON i.clientid = c.userid
        LEFT JOIN tblprojects p ON i.project_id = p.id
        ORDER BY i.dateadded DESC
        LIMIT 100
        """
        return self.safe_execute(query)
    
    def get_staff_data(self):
        """Get comprehensive staff data"""
        query = """
        SELECT 
            s.staffid,
            s.firstname,
            s.lastname,
            s.email,
            s.phonenumber,
            s.datecreated,
            s.admin,
            s.active,
            (SELECT COUNT(*) FROM tblprojects WHERE addedfrom=s.staffid) as projects_created,
            (SELECT COUNT(*) FROM tbltasks WHERE addedfrom=s.staffid) as tasks_created,
            (SELECT COUNT(*) FROM tbltask_assigned WHERE staffid=s.staffid) as tasks_assigned
        FROM tblstaff s
        WHERE s.active = 1
        ORDER BY s.datecreated DESC
        LIMIT 50
        """
        return self.safe_execute(query)
    
    def get_activity_data(self):
        """Get recent activity data"""
        query = """
        SELECT 
            a.id,
            a.description,
            a.date,
            a.staffid,
            CONCAT(s.firstname, ' ', s.lastname) as staff_name
        FROM tblactivity_log a
        LEFT JOIN tblstaff s ON a.staffid = s.staffid
        ORDER BY a.date DESC
        LIMIT 50
        """
        return self.safe_execute(query)

    def get_dashboard_statistics(self):
        """Get dashboard statistics"""
        stats = {}
        
        # Project statistics
        project_stats = self.safe_execute("""
        SELECT 
            COUNT(*) as total_projects,
            SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as in_progress_projects,
            SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as on_hold_projects,
            SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as finished_projects,
            SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) as cancelled_projects
        FROM tblprojects
        """)
        
        # Task statistics
        task_stats = self.safe_execute("""
        SELECT 
            COUNT(*) as total_tasks,
            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as not_started_tasks,
            SUM(CASE WHEN status = 4 THEN 1 ELSE 0 END) as in_progress_tasks,
            SUM(CASE WHEN status = 5 THEN 1 ELSE 0 END) as completed_tasks
        FROM tbltasks
        """)
        
        # Client statistics
        client_stats = self.safe_execute("""
        SELECT 
            COUNT(*) as total_clients,
            COUNT(CASE WHEN active = 1 THEN 1 END) as active_clients
        FROM tblclients
        """)
        
        # Invoice statistics
        invoice_stats = self.safe_execute("""
        SELECT 
            COUNT(*) as total_invoices,
            SUM(CASE WHEN status = 2 THEN total ELSE 0 END) as total_paid,
            SUM(CASE WHEN status = 4 THEN total ELSE 0 END) as total_overdue,
            SUM(total) as total_invoiced
        FROM tblinvoices
        """)
        
        return {
            'projects': project_stats[0] if project_stats else {},
            'tasks': task_stats[0] if task_stats else {},
            'clients': client_stats[0] if client_stats else {},
            'invoices': invoice_stats[0] if invoice_stats else {}
        }

def analyze_data_with_ai(data_summary):
    """Use AI to analyze business data and provide insights"""
    try:
        prompt = f"""
Analyze this CRM business data and provide comprehensive insights:

Data Summary:
{json.dumps(data_summary, indent=2, default=str)}

Please provide:
1. Key Business Insights
2. Performance Analysis
3. Trends and Patterns
4. Recommendations
5. Risk Areas
6. Growth Opportunities

Return a structured JSON response with actionable insights.
"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert business analyst specializing in CRM data analysis. Provide actionable insights in JSON format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1500,
            temperature=0.3
        )
        
        ai_response = response.choices[0].message.content
        
        # Try to extract JSON
        try:
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = ai_response[json_start:json_end]
                return json.loads(json_str)
        except:
            pass
        
        # Fallback: return text analysis
        return {
            "analysis": ai_response,
            "insights": "AI analysis completed",
            "recommendations": "See full analysis text"
        }
        
    except Exception as e:
        return {
            "error": f"AI analysis failed: {str(e)}",
            "fallback_insights": "Manual analysis recommended"
        }

@csrf_exempt
@require_http_methods(["GET", "POST"])
def comprehensive_database_api(request):
    """
    Comprehensive Database API
    
    Single endpoint that provides complete business intelligence from CRM database
    
    Query Parameters:
    - include_projects: 'true'/'false' (default: 'true')
    - include_tasks: 'true'/'false' (default: 'true') 
    - include_clients: 'true'/'false' (default: 'true')
    - include_invoices: 'true'/'false' (default: 'true')
    - include_staff: 'true'/'false' (default: 'true')
    - include_activity: 'true'/'false' (default: 'false')
    - include_ai_analysis: 'true'/'false' (default: 'true')
    - format: 'detailed', 'summary', 'statistics' (default: 'detailed')
    """
    
    try:
        # Get query parameters
        include_projects = request.GET.get('include_projects', 'true').lower() == 'true'
        include_tasks = request.GET.get('include_tasks', 'true').lower() == 'true'
        include_clients = request.GET.get('include_clients', 'true').lower() == 'true'
        include_invoices = request.GET.get('include_invoices', 'true').lower() == 'true'
        include_staff = request.GET.get('include_staff', 'true').lower() == 'true'
        include_activity = request.GET.get('include_activity', 'false').lower() == 'true'
        include_ai_analysis = request.GET.get('include_ai_analysis', 'true').lower() == 'true'
        response_format = request.GET.get('format', 'detailed')
        
        # Initialize database manager
        db_manager = DatabaseAPIManager()
        
        if not db_manager.connect():
            return JsonResponse({
                "success": False,
                "error": "Database connection failed",
                "timestamp": datetime.now().isoformat()
            }, status=500)
        
        # Collect data based on parameters
        response_data = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "database_info": {
                "host": DB_CONFIG['host'],
                "database": DB_CONFIG['database'],
                "total_tables": 551
            }
        }
        
        # Get dashboard statistics
        statistics = db_manager.get_dashboard_statistics()
        response_data["statistics"] = statistics
        
        # Get detailed data if requested
        if response_format == 'detailed':
            if include_projects:
                projects = db_manager.get_projects_data()
                response_data["projects"] = {
                    "count": len(projects),
                    "data": projects
                }
            
            if include_tasks:
                tasks = db_manager.get_tasks_data()
                response_data["tasks"] = {
                    "count": len(tasks),
                    "data": tasks
                }
            
            if include_clients:
                clients = db_manager.get_clients_data()
                response_data["clients"] = {
                    "count": len(clients),
                    "data": clients
                }
            
            if include_invoices:
                invoices = db_manager.get_invoices_data()
                response_data["invoices"] = {
                    "count": len(invoices),
                    "data": invoices
                }
            
            if include_staff:
                staff = db_manager.get_staff_data()
                response_data["staff"] = {
                    "count": len(staff),
                    "data": staff
                }
            
            if include_activity:
                activity = db_manager.get_activity_data()
                response_data["recent_activity"] = {
                    "count": len(activity),
                    "data": activity
                }
        
        elif response_format == 'summary':
            # Summary format - just counts and key metrics
            if include_projects:
                projects = db_manager.get_projects_data()
                response_data["projects_summary"] = {
                    "total_count": len(projects),
                    "recent_projects": projects[:5] if projects else []
                }
            
            if include_tasks:
                tasks = db_manager.get_tasks_data()
                response_data["tasks_summary"] = {
                    "total_count": len(tasks),
                    "recent_tasks": tasks[:5] if tasks else []
                }
            
            if include_clients:
                clients = db_manager.get_clients_data()
                response_data["clients_summary"] = {
                    "total_count": len(clients),
                    "recent_clients": clients[:5] if clients else []
                }
        
        # AI Analysis
        if include_ai_analysis and response_format != 'statistics':
            print("🤖 Running AI analysis...")
            ai_insights = analyze_data_with_ai(statistics)
            response_data["ai_insights"] = ai_insights
        
        # Close database connection
        db_manager.disconnect()
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"API Error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status=500)

# Additional specialized endpoints
@csrf_exempt
@require_http_methods(["GET"])
def quick_dashboard_api(request):
    """Quick dashboard statistics only"""
    try:
        db_manager = DatabaseAPIManager()
        if not db_manager.connect():
            return JsonResponse({"success": False, "error": "Database connection failed"}, status=500)
        
        statistics = db_manager.get_dashboard_statistics()
        db_manager.disconnect()
        
        return JsonResponse({
            "success": True,
            "statistics": statistics,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"API Error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def projects_only_api(request):
    """Projects data only"""
    try:
        db_manager = DatabaseAPIManager()
        if not db_manager.connect():
            return JsonResponse({"success": False, "error": "Database connection failed"}, status=500)
        
        projects = db_manager.get_projects_data()
        statistics = db_manager.get_dashboard_statistics()
        db_manager.disconnect()
        
        return JsonResponse({
            "success": True,
            "projects": {
                "count": len(projects),
                "data": projects
            },
            "project_statistics": statistics.get('projects', {}),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"API Error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }, status=500)
