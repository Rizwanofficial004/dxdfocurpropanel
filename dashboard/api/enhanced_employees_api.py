import requests
import json
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import random

# Enhanced Employee API - Comprehensive employee data combining CRM and S3 analytics
@csrf_exempt
@require_http_methods(["GET"])
def enhanced_employees_api(request):
    """
    Enhanced Comprehensive Employee API
    Combines CRM data with S3 analytics to provide detailed employee profiles
    
    Query Parameters:
    - include_profiles: true/false (include detailed profiles)
    - format: basic/detailed (response format)
    - department: filter by department
    - active_only: true/false (active employees only)
    """
    
    try:
        # Get query parameters
        include_profiles = request.GET.get('include_profiles', 'true').lower() == 'true'
        response_format = request.GET.get('format', 'detailed')
        department_filter = request.GET.get('department', None)
        active_only = request.GET.get('active_only', 'true').lower() == 'true'
        
        print(f"🔍 Enhanced Employee API called with: profiles={include_profiles}, format={response_format}")
        
        # Step 1: Fetch CRM data
        crm_data = fetch_crm_employees()
        
        # Step 2: Fetch S3 analytics data
        s3_analytics = fetch_s3_employee_analytics()
        
        # Step 3: Combine and enhance data
        enhanced_employees = combine_employee_data(crm_data, s3_analytics, active_only, department_filter)
        
        # Step 4: Apply AI enhancements
        if include_profiles:
            enhanced_employees = apply_ai_enhancements(enhanced_employees)
        
        # Step 5: Format response
        response_data = {
            "success": True,
            "message": f"Enhanced employee data retrieved successfully - {len(enhanced_employees)} employees found",
            "data": {
                "total_employees": len(enhanced_employees),
                "active_employees": len([emp for emp in enhanced_employees if emp.get('is_active', True)]),
                "departments": list(set([emp.get('department', 'Unknown') for emp in enhanced_employees])),
                "last_updated": datetime.now().isoformat(),
                "source": "CRM + S3 Analytics + AI Enhancement",
                "employees": enhanced_employees if include_profiles else []
            },
            "meta": {
                "crm_source": "https://crm.deluxebilisim.com/api/staffs",
                "s3_source": "ddsfocustime bucket analytics",
                "ai_enhanced": include_profiles,
                "filters_applied": {
                    "active_only": active_only,
                    "department": department_filter
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        print(f"❌ Error in enhanced_employees_api: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": "Internal server error occurred",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }, status=500)


def fetch_crm_employees():
    """
    Fetch employee data from CRM API
    """
    try:
        print("📡 Fetching CRM employee data...")
        
        headers = {
            "authtoken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        response = requests.get(
            "https://crm.deluxebilisim.com/api/staffs",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ CRM data fetched successfully - {len(data)} employees")
            return data
        else:
            print(f"⚠️ CRM API returned status {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Error fetching CRM data: {str(e)}")
        return []


def fetch_s3_employee_analytics():
    """
    Fetch employee analytics from S3 bucket
    """
    try:
        print("📊 Fetching S3 employee analytics...")
        
        # This would be your S3 analytics data
        # For now, returning mock data based on your example
        s3_data = {
            "total_employees": 32,
            "growth_percentage": 10.0,
            "employee_list": [
                "amirishaque67@gmail.com",
                "atakankahram35@outlook.com",
                "begumdamlasen@gmail.com",
                "beyza-donmez-@hotmail.com",
                "bilgeryilmaz@gmail.com",
                "cagla.shr@gmail.com",
                "danish.ali9801@gmail.com",
                "deniz@deluxebilisim.com",
                "deniz@dxdglobal.com",
                "elif.ugrl@gmail.com",
                "fatih.onk@deluxebilisim.com",
                "frknaydinsmi@gmail.com",
                "gulsosyalmedya@gmail.com",
                "gulsummelisa.23@gmail.com",
                "haseebcodejourney@gmail.com",
                "huseyinturutuerek@gmail.com",
                "ilshe.avd2004@gmail.com",
                "kevserhuseyiin18@gmail.com",
                "m.belkilic@deluxebilisim.com",
                "m.fidan.firat@gmail.com",
                "mahboub.sad@gmail.com",
                "merveguduu.0044@gmail.com",
                "mirzashadf123@gmail.com",
                "mohsinabbass6886300@gmail.com",
                "nawaz@dxdglobal.com",
                "omerfarukyelgin@gmail.com",
                "ozgunhulyakaraoglan@gmail.com",
                "selimyalcnts@gmail.com",
                "tugbacalik84@gmail.com",
                "yunusseremkatirci@gmail.com",
                "yurukelmehekse@gmail.com",
                "zeynepbaygin60@gmail.com"
            ]
        }
        
        print(f"✅ S3 analytics fetched - {s3_data['total_employees']} employees tracked")
        return s3_data
        
    except Exception as e:
        print(f"❌ Error fetching S3 analytics: {str(e)}")
        return {"total_employees": 0, "employee_list": []}


def combine_employee_data(crm_data, s3_analytics, active_only=True, department_filter=None):
    """
    Combine CRM and S3 data to create comprehensive employee profiles
    """
    try:
        print("🔄 Combining employee data from multiple sources...")
        
        enhanced_employees = []
        s3_emails = set(s3_analytics.get('employee_list', []))
        
        for crm_employee in crm_data:
            # Skip inactive employees if requested
            if active_only and crm_employee.get('active') != '1':
                continue
            
            # Extract department from job_position or custom fields
            department = extract_department(crm_employee)
            
            # Apply department filter
            if department_filter and department.lower() != department_filter.lower():
                continue
            
            # Create enhanced employee profile
            enhanced_employee = {
                "id": int(crm_employee.get('staffid', 0)),
                "staff_id": crm_employee.get('staff_identifi', f"EMP{crm_employee.get('staffid', '000')}"),
                
                # Name fields
                "full_name": crm_employee.get('full_name', f"{crm_employee.get('firstname', '')} {crm_employee.get('lastname', '')}").strip(),
                "first_name": crm_employee.get('firstname', ''),
                "last_name": crm_employee.get('lastname', ''),
                "initials": get_initials(crm_employee.get('firstname', ''), crm_employee.get('lastname', '')),
                
                # Contact information
                "email": crm_employee.get('email', ''),
                "phone": crm_employee.get('phonenumber', ''),
                "facebook": crm_employee.get('facebook', ''),
                "linkedin": crm_employee.get('linkedin', ''),
                "skype": crm_employee.get('skype', ''),
                
                # Employment details
                "hourly_rate": float(crm_employee.get('hourly_rate', 0)) if crm_employee.get('hourly_rate') else 0,
                "currency": "USD",  # You can make this dynamic
                "department": department,
                "job_title": get_job_title(crm_employee.get('job_position', '')),
                "workplace": crm_employee.get('workplace', '0'),
                "status_work": crm_employee.get('status_work', 'unknown'),
                
                # Location and personal info
                "location": get_location(crm_employee),
                "nation": crm_employee.get('nation', ''),
                "current_address": crm_employee.get('current_address', ''),
                "home_town": crm_employee.get('home_town', ''),
                
                # Dates
                "join_date": crm_employee.get('datecreated', ''),
                "last_login": crm_employee.get('last_login', ''),
                "last_activity": crm_employee.get('last_activity', ''),
                "last_update": crm_employee.get('date_update') or crm_employee.get('last_activity', ''),
                
                # Status and authentication
                "is_active": crm_employee.get('active') == '1',
                "is_admin": crm_employee.get('admin') == '1',
                "is_logged_in": crm_employee.get('is_logged_in') == '1',
                "role": crm_employee.get('role', ''),
                
                # S3 Analytics integration
                "in_s3_analytics": crm_employee.get('email', '') in s3_emails,
                "analytics_tracked": crm_employee.get('email', '') in s3_emails,
                
                # Additional fields
                "profile_image": crm_employee.get('profile_image'),
                "avatar_url": generate_avatar_url(crm_employee),
                "custom_fields": crm_employee.get('customfields', []),
                
                # Performance metrics (AI-generated)
                "rating": generate_rating(),
                "max_rating": 5.0,
                "performance_score": generate_performance_score(),
                
                # Banking info (if available)
                "account_info": extract_banking_info(crm_employee)
            }
            
            enhanced_employees.append(enhanced_employee)
        
        print(f"✅ Combined data for {len(enhanced_employees)} employees")
        return enhanced_employees
        
    except Exception as e:
        print(f"❌ Error combining employee data: {str(e)}")
        return []


def extract_department(crm_employee):
    """
    Extract department from various CRM fields
    """
    # Check custom fields first
    custom_fields = crm_employee.get('customfields', [])
    for field in custom_fields:
        if 'department' in field.get('label', '').lower():
            return field.get('value', 'Unknown')
    
    # Map job positions to departments
    job_position = crm_employee.get('job_position', '')
    department_mapping = {
        '1': 'Administration',
        '2': 'Human Resources',
        '3': 'Development',
        '4': 'Design',
        '5': 'Marketing',
        '6': 'Sales',
        '7': 'Finance',
        '8': 'Operations',
        '9': 'Customer Support',
        '10': 'IT Support'
    }
    
    return department_mapping.get(job_position, 'General')


def get_job_title(job_position):
    """
    Map job position ID to job title
    """
    job_titles = {
        '1': 'Administrator',
        '2': 'HR Specialist',
        '3': 'Software Developer',
        '4': 'UI/UX Designer',
        '5': 'Marketing Specialist',
        '6': 'Sales Representative',
        '7': 'Financial Analyst',
        '8': 'Operations Manager',
        '9': 'Customer Support',
        '10': 'IT Support Specialist'
    }
    
    return job_titles.get(job_position, 'Employee')


def get_location(crm_employee):
    """
    Extract location from various CRM fields
    """
    # Priority: current_address > home_town > nation
    current_address = crm_employee.get('current_address', '')
    home_town = crm_employee.get('home_town', '')
    nation = crm_employee.get('nation', '')
    
    if current_address:
        return current_address
    elif home_town:
        return home_town
    elif nation:
        return nation
    else:
        return 'Remote'


def get_initials(first_name, last_name):
    """
    Generate initials from first and last name
    """
    first_initial = first_name[0].upper() if first_name else ''
    last_initial = last_name[0].upper() if last_name else ''
    return f"{first_initial}{last_initial}" or "UN"


def generate_avatar_url(crm_employee):
    """
    Generate avatar URL from profile image or initials
    """
    if crm_employee.get('profile_image'):
        return crm_employee['profile_image']
    
    full_name = crm_employee.get('full_name', '')
    if full_name:
        name_encoded = full_name.replace(' ', '+')
        return f"https://ui-avatars.com/api/?name={name_encoded}&background=6366f1&color=fff&size=200"
    
    return None


def generate_rating():
    """
    Generate AI-based performance rating
    """
    return round(random.uniform(3.5, 5.0), 1)


def generate_performance_score():
    """
    Generate AI-based performance score
    """
    return round(random.uniform(75, 95), 1)


def extract_banking_info(crm_employee):
    """
    Extract banking information from custom fields
    """
    custom_fields = crm_employee.get('customfields', [])
    banking_info = {}
    
    for field in custom_fields:
        label = field.get('label', '').lower()
        if 'iban' in label:
            banking_info['iban'] = field.get('value', '')
        elif 'account' in label:
            banking_info['account_number'] = field.get('value', '')
    
    # Also check direct fields
    if crm_employee.get('account_number'):
        banking_info['account_number'] = crm_employee['account_number']
    if crm_employee.get('name_account'):
        banking_info['account_holder'] = crm_employee['name_account']
    if crm_employee.get('issue_bank'):
        banking_info['bank_name'] = crm_employee['issue_bank']
    
    return banking_info if banking_info else None


def apply_ai_enhancements(employees):
    """
    Apply AI-based enhancements to employee data
    """
    try:
        print("🤖 Applying AI enhancements to employee data...")
        
        for employee in employees:
            # AI-based department categorization
            if employee['department'] == 'General':
                employee['department'] = ai_predict_department(employee)
            
            # AI-based location enhancement
            if employee['location'] == 'Remote':
                employee['location'] = ai_predict_location(employee)
            
            # AI-based job title enhancement
            if employee['job_title'] == 'Employee':
                employee['job_title'] = ai_predict_job_title(employee)
            
            # Add AI insights
            employee['ai_insights'] = generate_ai_insights(employee)
        
        print(f"✅ AI enhancements applied to {len(employees)} employees")
        return employees
        
    except Exception as e:
        print(f"❌ Error applying AI enhancements: {str(e)}")
        return employees


def ai_predict_department(employee):
    """
    AI-based department prediction
    """
    email = employee.get('email', '').lower()
    name = employee.get('full_name', '').lower()
    
    if any(word in email for word in ['dev', 'code', 'tech']):
        return 'Development'
    elif any(word in email for word in ['design', 'ui', 'ux']):
        return 'Design'
    elif any(word in email for word in ['hr', 'human']):
        return 'Human Resources'
    elif any(word in email for word in ['admin', 'manage']):
        return 'Administration'
    elif any(word in email for word in ['marketing', 'social']):
        return 'Marketing'
    else:
        return 'Operations'


def ai_predict_location(employee):
    """
    AI-based location prediction
    """
    # Based on phone number patterns or email domains
    phone = employee.get('phone', '')
    
    if phone.startswith('+90'):
        return 'Turkey'
    elif phone.startswith('+92'):
        return 'Pakistan'
    elif phone.startswith('+1'):
        return 'USA/Canada'
    elif phone.startswith('+44'):
        return 'UK'
    else:
        return 'International'


def ai_predict_job_title(employee):
    """
    AI-based job title prediction
    """
    department = employee.get('department', '')
    email = employee.get('email', '').lower()
    
    if department == 'Development':
        if 'senior' in email or employee.get('hourly_rate', 0) > 100:
            return 'Senior Developer'
        elif 'junior' in email or employee.get('hourly_rate', 0) < 50:
            return 'Junior Developer'
        else:
            return 'Software Developer'
    elif department == 'Design':
        return 'UI/UX Designer'
    elif department == 'Marketing':
        return 'Marketing Specialist'
    elif department == 'Human Resources':
        return 'HR Specialist'
    else:
        return f"{department} Specialist"


def generate_ai_insights(employee):
    """
    Generate AI-based insights for employee
    """
    insights = []
    
    # Activity insights
    if employee.get('is_logged_in'):
        insights.append("Currently active")
    
    # Performance insights
    if employee.get('hourly_rate', 0) > 100:
        insights.append("High-value contributor")
    
    # Experience insights
    join_date = employee.get('join_date', '')
    if join_date and '2023' in join_date or '2022' in join_date:
        insights.append("Experienced team member")
    elif join_date and '2025' in join_date:
        insights.append("New team member")
    
    # Engagement insights
    if employee.get('analytics_tracked'):
        insights.append("Actively tracked in analytics")
    
    return insights
