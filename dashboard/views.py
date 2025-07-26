from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import requests
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["GET"])
def enhanced_employees_api(request):
    """
    Enhanced Employee API that fetches data from CRM and adds analytics
    """
    try:
        logger.info("🚀 Enhanced Employee API called")
        
        # Get parameters
        include_profiles = request.GET.get('include_profiles', 'false').lower() == 'true'
        format_type = request.GET.get('format', 'basic')
        
        logger.info(f"📊 Parameters: include_profiles={include_profiles}, format={format_type}")
        
        # Fetch from CRM API
        crm_employees = fetch_crm_employees()
        
        if not crm_employees:
            logger.warning("⚠️ No employees returned from CRM")
            return JsonResponse({
                'success': False,
                'error': 'No employees found in CRM system',
                'data': {'employees': []}
            })
        
        # Transform and enhance data
        enhanced_employees = []
        for emp in crm_employees:
            enhanced_emp = {
                'id': emp.get('id', 0),
                'full_name': emp.get('name', 'Unknown Employee'),
                'email': emp.get('email', ''),
                'phone': emp.get('phone', ''),
                'job_title': emp.get('designation', 'Staff Member'),
                'department': get_department_from_designation(emp.get('designation', '')),
                'hourly_rate': calculate_hourly_rate(emp.get('salary', 0)),
                'rating': generate_performance_rating(),
                'is_active': emp.get('status', 1) == 1,
                'join_date': emp.get('created_at', datetime.now().isoformat())[:10],
                'location': emp.get('address', 'Remote'),
                'profile_image': emp.get('image'),
                'initials': generate_initials(emp.get('name', '')),
                'staff_id': f"EMP{emp.get('id', 0):03d}",
                'performance_score': generate_performance_score(),
                'ai_insights': generate_ai_insights(emp.get('designation', '')),
                'is_logged_in': False,
                'last_activity': datetime.now().isoformat(),
                'currency': 'USD'
            }
            enhanced_employees.append(enhanced_emp)
        
        logger.info(f"✅ Successfully enhanced {len(enhanced_employees)} employees")
        
        response_data = {
            'success': True,
            'message': f'Retrieved {len(enhanced_employees)} employees successfully',
            'data': {
                'employees': enhanced_employees,
                'total_count': len(enhanced_employees),
                'fetch_time': datetime.now().isoformat(),
                'source': 'CRM_API_Enhanced'
            }
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        logger.error(f"❌ Error in enhanced_employees_api: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e),
            'data': {'employees': []}
        }, status=500)

def fetch_crm_employees():
    """
    Fetch employees from CRM API
    """
    try:
        logger.info("📡 Fetching from CRM API...")
        
        # CRM API endpoint
        crm_url = "https://crm.deluxebilisim.com/api/staffs"
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
        
        response = requests.get(crm_url, headers=headers, timeout=30)
        logger.info(f"📊 CRM Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            employees = data.get('data', [])
            logger.info(f"✅ Retrieved {len(employees)} employees from CRM")
            return employees
        else:
            logger.error(f"❌ CRM API error: {response.status_code}")
            return []
            
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Network error fetching from CRM: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"❌ Unexpected error fetching from CRM: {str(e)}")
        return []

def get_department_from_designation(designation):
    """
    Map designation to department
    """
    designation = designation.lower() if designation else ''
    
    if any(word in designation for word in ['developer', 'engineer', 'programmer', 'tech']):
        return 'Engineering'
    elif any(word in designation for word in ['manager', 'lead', 'director']):
        return 'Management'
    elif any(word in designation for word in ['designer', 'ui', 'ux']):
        return 'Design'
    elif any(word in designation for word in ['marketing', 'sales']):
        return 'Sales & Marketing'
    elif any(word in designation for word in ['hr', 'human']):
        return 'Human Resources'
    elif any(word in designation for word in ['finance', 'accounting']):
        return 'Finance'
    else:
        return 'General'

def calculate_hourly_rate(salary):
    """
    Calculate hourly rate from salary
    """
    try:
        monthly_salary = float(salary) if salary else 0
        if monthly_salary > 0:
            # Assuming 160 working hours per month
            return round(monthly_salary / 160, 2)
        return 0
    except:
        return 0

def generate_performance_rating():
    """
    Generate a performance rating between 3.5 and 5.0
    """
    import random
    return round(random.uniform(3.5, 5.0), 1)

def generate_performance_score():
    """
    Generate a performance score between 70 and 100
    """
    import random
    return random.randint(70, 100)

def generate_ai_insights(designation):
    """
    Generate AI insights based on designation
    """
    insights_map = {
        'developer': ['Code Quality Expert', 'Innovation Driver'],
        'engineer': ['Technical Leader', 'Problem Solver'],
        'manager': ['Team Builder', 'Strategic Thinker'],
        'designer': ['Creative Visionary', 'User Experience Expert'],
        'marketing': ['Brand Champion', 'Growth Catalyst'],
        'sales': ['Revenue Generator', 'Client Relations'],
        'hr': ['People Champion', 'Culture Builder']
    }
    
    designation = designation.lower() if designation else ''
    for key, insights in insights_map.items():
        if key in designation:
            return insights
    
    return ['Valuable Team Member', 'Dedicated Professional']

def generate_initials(name):
    """
    Generate initials from name
    """
    if not name:
        return 'NA'
    
    words = name.strip().split()
    if len(words) >= 2:
        return f"{words[0][0]}{words[1][0]}".upper()
    elif len(words) == 1:
        return words[0][:2].upper()
    else:
        return 'NA'

# Health check endpoint
@csrf_exempt
@require_http_methods(["GET"])
def api_health_check(request):
    """
    Simple health check for the API
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'Employee API is running',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'enhanced_employees': '/api/dashboard/employees/enhanced/',
            'health': '/api/health/'
        }
    })
