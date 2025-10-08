"""
Employees Details API - Combines S3 and CRM Data

This module provides a comprehensive API endpoint that fetches employee data
from both AWS S3 bucket and CRM system, combining the information into
a unified response. Now enhanced with ScreenshotParser for signed URLs.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime, timedelta
import logging
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import requests
import re
from urllib.parse import unquote
from collections import defaultdict
import os
from django.conf import settings
from .screenshot_parser import ScreenshotParser
from core.credentials import CredentialsManager

logger = logging.getLogger(__name__)

# AWS S3 Credentials
AWS_CREDENTIALS = {
    "access_key": "AKIARSU6EUUWMQ5I2JWC",
    "secret_key": "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",
    "region": "eu-north-1",
    "bucket_name": "ddsfocustime"
}


class EmployeesDetailsView(APIView):
    """
    Employees Details API - Combines S3 and CRM Data
    
    GET /api/Employees/Details
    
    Returns comprehensive employee data combining:
    - S3 bucket screenshot data and activity
    - CRM employee information and details
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self.bucket_name = AWS_CREDENTIALS["bucket_name"]
        self.screenshot_parser = ScreenshotParser(self.bucket_name)
        self.crm_credentials = CredentialsManager.get_crm_credentials()
        self._initialize_s3()
    
    def _initialize_s3(self):
        """Initialize S3 client with credentials"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_CREDENTIALS["access_key"],
                aws_secret_access_key=AWS_CREDENTIALS["secret_key"],
                region_name=AWS_CREDENTIALS["region"]
            )
            logger.info("S3 client initialized successfully for employee details")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
    
    def get(self, request):
        """
        GET /api/Employees/Details
        
        Fetch comprehensive employee details from S3 and CRM
        """
        try:
            logger.info("Fetching comprehensive employee details from S3 and CRM")
            
            # Fetch data from both sources
            s3_data = self._fetch_s3_employee_data()
            crm_data = self._fetch_crm_employee_data()
            
            # Combine the data
            combined_data = self._combine_employee_data(s3_data, crm_data)
            
            response_data = {
                "status": "success",
                "message": "Employee details fetched successfully",
                "data": {
                    "employees": combined_data["employees"],
                    "summary": {
                        "total_employees": combined_data["total_employees"],
                        "s3_employees": len(s3_data.get("employees", [])),
                        "crm_employees": len(crm_data.get("employees", [])),
                        "combined_employees": len(combined_data["employees"]),
                        "last_updated": datetime.now().isoformat()
                    },
                    "data_sources": {
                        "s3": {
                            "bucket": self.bucket_name,
                            "status": s3_data.get("status", "unknown"),
                            "objects_scanned": s3_data.get("objects_scanned", 0),
                            "search_time_ms": s3_data.get("search_time_ms", 0)
                        },
                        "crm": {
                            "base_url": self.crm_credentials["base_url"],
                            "status": crm_data.get("status", "unknown"),
                            "response_time_ms": crm_data.get("response_time_ms", 0)
                        }
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "1.0.0",
                    "endpoint": "/api/Employees/Details",
                    "features": ["s3_integration", "crm_integration", "data_combination"]
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching employee details: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to fetch employee details: {str(e)}",
                "data": {
                    "employees": [],
                    "summary": {
                        "total_employees": 0,
                        "error": str(e)
                    }
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _fetch_s3_employee_data(self):
        """
        Fetch employee data from S3 bucket
        """
        start_time = datetime.now()
        
        try:
            employees_data = {}
            objects_scanned = 0
            
            logger.info("Scanning S3 bucket for employee data...")
            
            # Search in users_screenshots folder
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix='users_screenshots/',
                PaginationConfig={'MaxItems': 1000}
            )
            
            for page in pages:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        objects_scanned += 1
                        key = obj['Key']
                        
                        # Extract employee info from S3 key
                        employee_info = self._extract_employee_from_s3_key(key, obj)
                        
                        if employee_info:
                            email = employee_info['email']
                            
                            if email not in employees_data:
                                employees_data[email] = {
                                    'email': email,
                                    'display_name': employee_info['display_name'],
                                    'folder_name': employee_info['folder_name'],
                                    'screenshots': [],
                                    'activity_summary': {
                                        'total_size_mb': 0,
                                        'first_activity': None,
                                        'last_activity': None,
                                        'active_days': set(),
                                        'active_months': set()
                                    }
                                }
                            
                            # Add screenshot data
                            screenshot_data = self._parse_s3_screenshot_data(key, obj)
                            if screenshot_data:
                                employee_data = employees_data[email]
                                employee_data['screenshots'].append(screenshot_data)
                                
                                # Update activity summary
                                activity = employee_data['activity_summary']
                                activity['total_size_mb'] += screenshot_data['size_mb']
                                activity['active_days'].add(screenshot_data['date'])
                                activity['active_months'].add(screenshot_data['month'])
                                
                                # Update first/last activity
                                file_date = obj['LastModified']
                                if not activity['first_activity'] or file_date < activity['first_activity']:
                                    activity['first_activity'] = file_date
                                if not activity['last_activity'] or file_date > activity['last_activity']:
                                    activity['last_activity'] = file_date
            
            # Convert sets to counts and format dates
            for employee in employees_data.values():
                activity = employee['activity_summary']
                activity['active_days_count'] = len(activity['active_days'])
                activity['active_months_count'] = len(activity['active_months'])
                activity['total_size_mb'] = round(activity['total_size_mb'], 2)
                
                # Format dates
                if activity['first_activity']:
                    activity['first_activity'] = activity['first_activity'].isoformat()
                if activity['last_activity']:
                    activity['last_activity'] = activity['last_activity'].isoformat()
                
                # Remove sets (not JSON serializable)
                del activity['active_days']
                del activity['active_months']
                
                # Keep only latest 5 screenshots
                employee['screenshots'] = sorted(
                    employee['screenshots'], 
                    key=lambda x: x['datetime'], 
                    reverse=True
                )[:5]
            
            search_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                'status': 'success',
                'employees': list(employees_data.values()),
                'objects_scanned': objects_scanned,
                'search_time_ms': round(search_time, 2)
            }
            
        except Exception as e:
            logger.error(f"Error fetching S3 data: {str(e)}")
            return {
                'status': 'error',
                'employees': [],
                'error': str(e),
                'objects_scanned': objects_scanned,
                'search_time_ms': 0
            }
    
    def _fetch_crm_employee_data(self):
        """
        Fetch employee data from CRM system
        """
        start_time = datetime.now()
        
        try:
            logger.info("Fetching employee data from CRM...")
            
            headers = {
                'Authorization': f'Bearer {self.crm_credentials["token"]}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Try different possible CRM endpoints
            possible_endpoints = [
                '/employees',
                '/users',
                '/staff',
                '/personnel',
                '/members'
            ]
            
            employees_data = []
            successful_endpoint = None
            
            for endpoint in possible_endpoints:
                try:
                    url = f"{self.crm_credentials['base_url']}{endpoint}"
                    logger.info(f"Trying CRM endpoint: {url}")
                    
                    response = requests.get(url, headers=headers, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        logger.info(f"Successfully fetched data from {endpoint}")
                        successful_endpoint = endpoint
                        
                        # Parse CRM response based on structure
                        if isinstance(data, list):
                            employees_data = data
                        elif isinstance(data, dict):
                            # Look for common keys that might contain employee data
                            for key in ['data', 'employees', 'users', 'results', 'items']:
                                if key in data and isinstance(data[key], list):
                                    employees_data = data[key]
                                    break
                            else:
                                # If no standard key found, wrap the dict in a list
                                employees_data = [data]
                        
                        break
                        
                    else:
                        logger.warning(f"CRM endpoint {endpoint} returned status {response.status_code}")
                        
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Failed to connect to CRM endpoint {endpoint}: {str(e)}")
                    continue
            
            if not successful_endpoint:
                logger.warning("No CRM endpoints were accessible, using mock data")
                employees_data = self._get_mock_crm_data()
            
            # Normalize CRM data
            normalized_employees = []
            for emp in employees_data:
                normalized_emp = self._normalize_crm_employee_data(emp)
                if normalized_emp:
                    normalized_employees.append(normalized_emp)
            
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                'status': 'success' if successful_endpoint else 'mock_data',
                'employees': normalized_employees,
                'endpoint_used': successful_endpoint,
                'response_time_ms': round(response_time, 2)
            }
            
        except Exception as e:
            logger.error(f"Error fetching CRM data: {str(e)}")
            return {
                'status': 'error',
                'employees': self._get_mock_crm_data(),
                'error': str(e),
                'response_time_ms': 0
            }
    
    def _get_mock_crm_data(self):
        """
        Provide mock CRM data when real CRM is not accessible
        """
        return [
            {
                'id': 1,
                'name': 'Nawaz Ahmed',
                'email': 'nawaz_at_dxdglobal.com',
                'department': 'Development',
                'position': 'Senior Developer',
                'status': 'Active',
                'hire_date': '2024-01-15',
                'phone': '+90-555-0001'
            },
            {
                'id': 2,
                'name': 'Haseeb Developer',
                'email': 'haseebcodejourney@gmail.com',
                'department': 'Development',
                'position': 'Full Stack Developer',
                'status': 'Active',
                'hire_date': '2024-02-01',
                'phone': '+90-555-0002'
            },
            {
                'id': 3,
                'name': 'Kiran Ahmed',
                'email': 'kiranaizad_at_gmail.com',
                'department': 'Development',
                'position': 'Frontend Developer',
                'status': 'Active',
                'hire_date': '2024-03-01',
                'phone': '+90-555-0003'
            }
        ]
    
    def _extract_employee_from_s3_key(self, key, obj):
        """
        Extract employee information from S3 key
        """
        try:
            parts = key.split('/')
            
            if len(parts) >= 3 and parts[0] == 'users_screenshots':
                date_folder = parts[1]  # 2025-09-01
                user_folder = parts[2]  # email folder
                
                # Convert folder name to email
                if '_at_' in user_folder:
                    email = user_folder.replace('_at_', '@')
                    display_name = user_folder.replace('_at_gmail.com', '').replace('_at_dxdglobal.com', '').replace('_', ' ')
                else:
                    email = user_folder
                    display_name = user_folder.split('@')[0] if '@' in user_folder else user_folder
                
                return {
                    'email': email,
                    'display_name': display_name,
                    'folder_name': user_folder,
                    'date_folder': date_folder
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting employee from S3 key {key}: {str(e)}")
            return None
    
    def _parse_s3_screenshot_data(self, key, obj):
        """
        Parse screenshot data from S3 object
        """
        try:
            parts = key.split('/')
            
            if len(parts) >= 4:
                date_part = parts[1]  # 2025-09-01
                filename = parts[-1]
                
                # Extract time from filename if available
                time_match = re.search(r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})', filename)
                if time_match:
                    file_date = time_match.group(1)
                    file_time = time_match.group(2).replace('-', ':')
                else:
                    file_date = date_part
                    file_time = "00:00:00"
                
                # Parse date components
                try:
                    date_obj = datetime.strptime(file_date, '%Y-%m-%d')
                    year = date_obj.strftime('%Y')
                    month = date_obj.strftime('%Y-%m')
                except ValueError:
                    year = file_date[:4] if len(file_date) >= 4 else 'unknown'
                    month = file_date[:7] if len(file_date) >= 7 else 'unknown'
                
                return {
                    'filename': filename,
                    'date': file_date,
                    'time': file_time,
                    'datetime': f"{file_date} {file_time}",
                    'year': year,
                    'month': month,
                    'size_bytes': obj['Size'],
                    'size_mb': round(obj['Size'] / (1024 * 1024), 3),
                    'last_modified': obj['LastModified'].isoformat(),
                    'url': self.screenshot_parser._generate_signed_url(key),  # Signed URL for frontend
                    'direct_url': f"https://{self.bucket_name}.s3.eu-north-1.amazonaws.com/{key}"  # Direct URL for reference
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing screenshot data for {key}: {str(e)}")
            return None
    
    def _normalize_crm_employee_data(self, crm_employee):
        """
        Normalize CRM employee data to standard format
        """
        try:
            # Common field mappings
            name_fields = ['name', 'full_name', 'display_name', 'employee_name', 'first_name']
            email_fields = ['email', 'email_address', 'work_email', 'username']
            department_fields = ['department', 'dept', 'division', 'team']
            position_fields = ['position', 'title', 'job_title', 'role', 'designation']
            status_fields = ['status', 'active', 'is_active', 'employee_status']
            
            def get_field_value(data, field_list):
                for field in field_list:
                    if field in data and data[field]:
                        return data[field]
                return None
            
            normalized = {
                'crm_id': crm_employee.get('id', None),
                'name': get_field_value(crm_employee, name_fields),
                'email': get_field_value(crm_employee, email_fields),
                'department': get_field_value(crm_employee, department_fields),
                'position': get_field_value(crm_employee, position_fields),
                'status': get_field_value(crm_employee, status_fields),
                'hire_date': crm_employee.get('hire_date', crm_employee.get('start_date', None)),
                'phone': crm_employee.get('phone', crm_employee.get('phone_number', None)),
                'raw_data': crm_employee  # Keep original data for reference
            }
            
            # Clean up email format if needed
            if normalized['email'] and '_at_' in normalized['email']:
                normalized['email'] = normalized['email'].replace('_at_', '@')
            
            return normalized
            
        except Exception as e:
            logger.error(f"Error normalizing CRM employee data: {str(e)}")
            return None
    
    def _combine_employee_data(self, s3_data, crm_data):
        """
        Combine employee data from S3 and CRM sources
        """
        try:
            combined_employees = []
            s3_employees = {emp['email']: emp for emp in s3_data.get('employees', [])}
            crm_employees = {emp['email']: emp for emp in crm_data.get('employees', []) if emp and emp.get('email')}
            
            # Get all unique emails
            all_emails = set(s3_employees.keys()) | set(crm_employees.keys())
            
            for email in all_emails:
                s3_emp = s3_employees.get(email, {})
                crm_emp = crm_employees.get(email, {})
                
                # Combine data with CRM taking precedence for basic info
                combined_employee = {
                    'email': email,
                    'name': crm_emp.get('name', s3_emp.get('display_name', email.split('@')[0])),
                    'display_name': s3_emp.get('display_name', crm_emp.get('name', email.split('@')[0])),
                    
                    # CRM specific data
                    'crm_data': {
                        'id': crm_emp.get('crm_id'),
                        'department': crm_emp.get('department'),
                        'position': crm_emp.get('position'),
                        'status': crm_emp.get('status'),
                        'hire_date': crm_emp.get('hire_date'),
                        'phone': crm_emp.get('phone'),
                        'available': bool(crm_emp)
                    },
                    
                    # S3 specific data
                    's3_data': {
                        'folder_name': s3_emp.get('folder_name'),
                        'activity_summary': s3_emp.get('activity_summary', {}),
                        'recent_screenshots': s3_emp.get('screenshots', []),
                        'available': bool(s3_emp)
                    },
                    
                    # Combined status
                    'data_sources': {
                        'in_crm': bool(crm_emp),
                        'in_s3': bool(s3_emp),
                        'complete_profile': bool(crm_emp and s3_emp)
                    }
                }
                
                combined_employees.append(combined_employee)
            
            # Sort by name
            combined_employees.sort(key=lambda x: x['name'].lower())
            
            return {
                'employees': combined_employees,
                'total_employees': len(combined_employees)
            }
            
        except Exception as e:
            logger.error(f"Error combining employee data: {str(e)}")
            return {
                'employees': [],
                'total_employees': 0,
                'error': str(e)
            }
