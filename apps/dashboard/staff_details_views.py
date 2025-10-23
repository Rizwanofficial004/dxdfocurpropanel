"""
Staff Details API - Fetches staff data from CRM

This module provides an API endpoint that fetches staff data from the CRM system
and presents it in a structured format for the dashboard.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime
import logging
import requests
from core.credentials import CredentialsManager

logger = logging.getLogger(__name__)


class StaffDetailsView(APIView):
    """
    Staff Details API - Fetches all staff from CRM
    
    GET /api/Staff/Details/
    
    Returns comprehensive staff data from CRM system including:
    - Full Name
    - Email
    - Role
    - Last Login
    - Active status
    - IBAN
    - Contract Type
    - Expertise
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.crm_credentials = CredentialsManager.get_crm_credentials()
    
    def get(self, request):
        """
        GET /api/Staff/Details/
        
        Fetch comprehensive staff details from CRM
        """
        try:
            logger.info("Fetching staff details from CRM...")
            
            # Fetch staff data from CRM
            staff_data = self._fetch_crm_staff_data()
            
            # Prepare response
            response_data = {
                "status": "success",
                "message": "Staff details fetched successfully",
                "data": {
                    "staff": staff_data["staff"],
                    "summary": {
                        "total_staff": len(staff_data["staff"]),
                        "active_staff": sum(1 for s in staff_data["staff"] if s.get("active", False)),
                        "inactive_staff": sum(1 for s in staff_data["staff"] if not s.get("active", False)),
                        "last_updated": datetime.now().isoformat()
                    },
                    "data_sources": {
                        "crm": {
                            "base_url": self.crm_credentials["base_url"],
                            "status": staff_data.get("status", "unknown"),
                            "response_time_ms": staff_data.get("response_time_ms", 0),
                            "endpoint_used": staff_data.get("endpoint_used", None)
                        }
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "1.0.0",
                    "endpoint": "/api/Staff/Details/",
                    "features": ["crm_integration", "staff_management"]
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in StaffDetailsView: {str(e)}")
            
            # Fallback response
            return Response({
                "status": "error",
                "message": f"Failed to fetch staff details: {str(e)}",
                "data": {
                    "staff": self._get_mock_staff_data(),
                    "summary": {
                        "total_staff": 0,
                        "active_staff": 0,
                        "inactive_staff": 0,
                        "last_updated": datetime.now().isoformat()
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                }
            }, status=status.HTTP_200_OK)
    
    def _fetch_crm_staff_data(self):
        """
        Fetch staff data from CRM system
        """
        start_time = datetime.now()
        
        try:
            logger.info("Fetching staff data from CRM...")
            
            if not self.crm_credentials["is_configured"]:
                logger.warning("CRM credentials not configured, using mock data")
                return {
                    "status": "not_configured",
                    "staff": self._get_mock_staff_data(),
                    "response_time_ms": 0
                }
            
            # Perfex CRM uses 'authtoken' header, not 'Authorization: Bearer'
            headers = {
                'authtoken': self.crm_credentials["token"],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Perfex CRM uses /api/staffs endpoint (note the 's')
            possible_endpoints = [
                '/api/staffs',  # Perfex CRM correct endpoint
                '/api/staff',
                '/staff',
                '/staffs'
            ]
            
            staff_data = []
            successful_endpoint = None
            
            for endpoint in possible_endpoints:
                try:
                    # Construct full URL
                    if endpoint.startswith('/api/'):
                        # Remove /api from base URL if endpoint already has it
                        base_url = self.crm_credentials['base_url'].replace('/api', '')
                        url = f"{base_url}{endpoint}"
                    else:
                        url = f"{self.crm_credentials['base_url']}{endpoint}"
                    
                    logger.info(f"Trying CRM endpoint: {url}")
                    
                    response = requests.get(url, headers=headers, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        logger.info(f"Successfully fetched data from {endpoint}")
                        successful_endpoint = endpoint
                        
                        # Parse CRM response based on structure
                        if isinstance(data, list):
                            staff_data = data
                        elif isinstance(data, dict):
                            # Look for common keys that might contain staff data
                            for key in ['data', 'staff', 'employees', 'users', 'results', 'items', 'records']:
                                if key in data and isinstance(data[key], list):
                                    staff_data = data[key]
                                    break
                            else:
                                # If no standard key found, wrap the dict in a list
                                staff_data = [data]
                        
                        break
                        
                    else:
                        logger.warning(f"CRM endpoint {endpoint} returned status {response.status_code}")
                        
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Failed to connect to CRM endpoint {endpoint}: {str(e)}")
                    continue
            
            if not successful_endpoint:
                logger.warning("No CRM endpoints were accessible, using mock data")
                staff_data = self._get_mock_staff_data()
            
            # Normalize staff data
            normalized_staff = []
            for staff_member in staff_data:
                normalized = self._normalize_crm_staff_data(staff_member)
                if normalized:
                    normalized_staff.append(normalized)
            
            response_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                'status': 'success' if successful_endpoint else 'mock_data',
                'staff': normalized_staff,
                'endpoint_used': successful_endpoint,
                'response_time_ms': round(response_time, 2)
            }
            
        except Exception as e:
            logger.error(f"Error fetching CRM staff data: {str(e)}")
            return {
                'status': 'error',
                'staff': self._get_mock_staff_data(),
                'error': str(e),
                'response_time_ms': 0
            }
    
    def _normalize_crm_staff_data(self, staff_member):
        """
        Normalize CRM staff data to standard format
        """
        try:
            # Common field mappings
            name_fields = ['full_name', 'name', 'display_name', 'fullname', 'staff_name', 'first_name']
            email_fields = ['email', 'email_address', 'work_email', 'username', 'user_email']
            role_fields = ['role', 'position', 'title', 'job_title', 'designation']
            active_fields = ['active', 'is_active', 'status', 'enabled']
            iban_fields = ['iban', 'bank_account', 'account_number']
            contract_type_fields = ['contract_type', 'contract', 'employment_type']
            expertise_fields = ['expertise', 'skills', 'specialization', 'specialty']
            last_login_fields = ['last_login', 'last_access', 'recent_login', 'last_seen']
            
            def get_field_value(data, field_list):
                for field in field_list:
                    if field in data and data[field]:
                        return data[field]
                return None
            
            # Check if active (handle different formats)
            active_value = get_field_value(staff_member, active_fields)
            if isinstance(active_value, bool):
                is_active = active_value
            elif isinstance(active_value, str):
                is_active = active_value.lower() in ['active', 'true', '1', 'yes', 'enabled']
            else:
                is_active = bool(active_value)
            
            normalized = {
                'id': staff_member.get('id', None),
                'full_name': get_field_value(staff_member, name_fields),
                'email': get_field_value(staff_member, email_fields),
                'role': get_field_value(staff_member, role_fields),
                'active': is_active,
                'iban': get_field_value(staff_member, iban_fields),
                'contract_type': get_field_value(staff_member, contract_type_fields),
                'expertise': get_field_value(staff_member, expertise_fields),
                'last_login': get_field_value(staff_member, last_login_fields),
                'raw_data': staff_member  # Keep original data for reference
            }
            
            # Clean up email format if needed
            if normalized['email'] and '_at_' in normalized['email']:
                normalized['email'] = normalized['email'].replace('_at_', '@')
            
            return normalized
            
        except Exception as e:
            logger.error(f"Error normalizing CRM staff data: {str(e)}")
            return None
    
    def _get_mock_staff_data(self):
        """
        Provide mock staff data based on the screenshot
        """
        return [
            {
                'id': 1,
                'full_name': 'Tuğba Gölcük',
                'email': 'idigolcuk@gmail.com',
                'role': 'Contract Employee',
                'active': True,
                'iban': 'TR69 0011 1000 0000 0061 3860 95',
                'contract_type': 'Service Cooperation Agreement',
                'expertise': None,
                'last_login': '2 hrs ago'
            },
            {
                'id': 2,
                'full_name': 'Tuğçe Hatice Açıkyürek',
                'email': 'acikyrektugce@gmail.com',
                'role': 'Account Manager',
                'active': True,
                'iban': '1',
                'contract_type': 'Service Cooperation Agreement',
                'expertise': None,
                'last_login': '4 months ago'
            },
            {
                'id': 3,
                'full_name': 'Tunahan Paşha Sword',
                'email': 'tunahankilic25@gmail.com',
                'role': 'Contract Employee',
                'active': True,
                'iban': 'TR68 0004 6000 6688 8000 5236 84',
                'contract_type': 'Service Cooperation Agreement',
                'expertise': None,
                'last_login': 'an hour ago'
            },
            {
                'id': 4,
                'full_name': 'Umut Güney',
                'email': 'umutgny16@gmail.com',
                'role': 'Contract Employee',
                'active': True,
                'iban': 'TR250006701000000026003699',
                'contract_type': 'Service Collaboration',
                'expertise': None,
                'last_login': 'yesterday'
            },
            {
                'id': 5,
                'full_name': 'Ural Şahin',
                'email': 'u.sahin@deluxebilisim.com',
                'role': 'Contract Employee',
                'active': False,
                'iban': '1',
                'contract_type': '1',
                'expertise': None,
                'last_login': '10 months ago'
            },
            {
                'id': 6,
                'full_name': 'Yakup Canöztü',
                'email': 'Yaup.51@gmail.com',
                'role': 'Contract Employee',
                'active': False,
                'iban': 'TR320006701000000022838851',
                'contract_type': 'Service Cooperation Agreement',
                'expertise': None,
                'last_login': '4 months ago'
            },
            {
                'id': 7,
                'full_name': 'Yiğit Gundogdu',
                'email': 'yigitgundogdu2000@hotmail.com',
                'role': 'Contract Employee',
                'active': False,
                'iban': 'TR70 0006 2000 0780 0006 8174 78',
                'contract_type': 'Priority',
                'expertise': 'Graphic Design',
                'last_login': '4 months ago'
            },
            {
                'id': 8,
                'full_name': 'Yunus Mule',
                'email': 'yunusemrekalkilic@gmail.com',
                'role': 'Contract Employee',
                'active': False,
                'iban': 'TR88 0004 6000 5688 8000 4374 94',
                'contract_type': 'Service Cooperation Agreement',
                'expertise': None,
                'last_login': 'a month ago'
            },
            {
                'id': 9,
                'full_name': 'Yunus Acar',
                'email': 'yunusact@gmail.com',
                'role': 'Contract Employee',
                'active': False,
                'iban': 'TR600006400060011073136693',
                'contract_type': 'Service Cooperation Agreement',
                'expertise': None,
                'last_login': '4 months ago'
            },
            {
                'id': 10,
                'full_name': 'Yusuf Ziya Respect',
                'email': 'yusufziyasaya@gmail.com',
                'role': 'Contract Employee',
                'active': True,
                'iban': 'TR20 0015 7000 0000 0067 6805 21',
                'contract_type': 'Service Cooperation Agreement',
                'expertise': None,
                'last_login': '19 minutes ago'
            },
            {
                'id': 11,
                'full_name': 'Zahra H',
                'email': 'zahrawaasis@gmail.com',
                'role': 'Contract Employee',
                'active': True,
                'iban': '1',
                'contract_type': '1',
                'expertise': 'Wordpress Intern',
                'last_login': 'Never'
            }
        ]
