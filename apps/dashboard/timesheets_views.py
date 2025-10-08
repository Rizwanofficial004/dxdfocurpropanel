"""
Timesheets API View
Fetches timesheet data from Perfex CRM system
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


class TimesheetsView(APIView):
    """
    API endpoint to fetch timesheets from Perfex CRM
    
    GET /api/Timesheets/
    
    Returns all timesheet entries with staff details, tasks, and time tracking
    """
    
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.credentials_manager = CredentialsManager()
        self.crm_credentials = self.credentials_manager.get_crm_credentials()
    
    def get(self, request):
        """Handle GET request for timesheets"""
        try:
            logger.info("Fetching timesheets from Perfex CRM...")
            
            # Fetch timesheets from CRM
            crm_result = self._fetch_crm_timesheets()
            
            if crm_result['success']:
                # Normalize the timesheet data
                timesheets = self._normalize_timesheets(crm_result['data'])
                
                # Calculate summary statistics
                summary = self._calculate_summary(timesheets)
                
                return Response({
                    "status": "success",
                    "message": "Timesheets fetched successfully",
                    "data": {
                        "timesheets": timesheets,
                        "summary": summary,
                        "data_sources": {
                            "crm": {
                                "base_url": self.crm_credentials['base_url'],
                                "status": "success",
                                "endpoint": crm_result.get('endpoint', '/api/timesheets'),
                                "response_time_ms": crm_result.get('response_time_ms', 0)
                            }
                        }
                    },
                    "meta": {
                        "timestamp": datetime.now().isoformat(),
                        "total_count": len(timesheets)
                    }
                }, status=status.HTTP_200_OK)
            else:
                # Return empty data with error status
                return Response({
                    "status": "error",
                    "message": "Failed to fetch timesheets from CRM",
                    "data": {
                        "timesheets": [],
                        "summary": {
                            "total_entries": 0,
                            "total_hours": 0,
                            "total_staff": 0,
                            "entries_today": 0
                        },
                        "data_sources": {
                            "crm": {
                                "base_url": self.crm_credentials['base_url'],
                                "status": "error",
                                "error": crm_result.get('error', 'Unknown error'),
                                "response_time_ms": crm_result.get('response_time_ms', 0)
                            }
                        }
                    },
                    "meta": {
                        "timestamp": datetime.now().isoformat(),
                        "total_count": 0
                    }
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error in TimesheetsView: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": f"Internal server error: {str(e)}",
                "data": {
                    "timesheets": [],
                    "summary": {
                        "total_entries": 0,
                        "total_hours": 0,
                        "total_staff": 0,
                        "entries_today": 0
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                }
            }, status=status.HTTP_200_OK)
    
    def _fetch_crm_timesheets(self):
        """Fetch timesheets from Perfex CRM API"""
        start_time = datetime.now()
        
        try:
            logger.info("Fetching timesheets from Perfex CRM...")
            
            if not self.crm_credentials["is_configured"]:
                logger.warning("CRM credentials not configured")
                return {
                    "success": False,
                    "data": [],
                    "error": "CRM not configured",
                    "response_time_ms": 0
                }
            
            # Perfex CRM uses 'authtoken' header
            headers = {
                'authtoken': self.crm_credentials["token"],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Perfex CRM timesheets endpoint
            base_url = self.crm_credentials['base_url'].replace('/api', '')
            url = f"{base_url}/api/timesheets"
            
            logger.info(f"Fetching from: {url}")
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Successfully fetched timesheets from Perfex CRM")
                
                # Perfex CRM returns a direct list
                timesheets_data = []
                if isinstance(data, list):
                    timesheets_data = data
                elif isinstance(data, dict):
                    # Look for common keys that might contain timesheet data
                    for key in ['data', 'timesheets', 'entries', 'results', 'items', 'records']:
                        if key in data and isinstance(data[key], list):
                            timesheets_data = data[key]
                            break
                    else:
                        # If no standard key found, wrap the dict in a list
                        timesheets_data = [data]
                
                elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
                
                return {
                    "success": True,
                    "data": timesheets_data,
                    "endpoint": "/api/timesheets",
                    "response_time_ms": round(elapsed_time, 2)
                }
            else:
                logger.warning(f"CRM API returned status {response.status_code}")
                elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
                return {
                    "success": False,
                    "data": [],
                    "error": f"CRM returned status {response.status_code}",
                    "response_time_ms": round(elapsed_time, 2)
                }
                
        except requests.exceptions.Timeout:
            logger.error("CRM API request timeout")
            elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
            return {
                "success": False,
                "data": [],
                "error": "Request timeout",
                "response_time_ms": round(elapsed_time, 2)
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"CRM API request failed: {str(e)}")
            elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
            return {
                "success": False,
                "data": [],
                "error": str(e),
                "response_time_ms": round(elapsed_time, 2)
            }
        except Exception as e:
            logger.error(f"Unexpected error fetching timesheets: {str(e)}")
            elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
            return {
                "success": False,
                "data": [],
                "error": str(e),
                "response_time_ms": round(elapsed_time, 2)
            }
    
    def _normalize_timesheets(self, raw_data):
        """Normalize timesheet data from Perfex CRM format"""
        normalized_timesheets = []
        
        # Fetch staff and task lookup data
        staff_lookup = self._fetch_staff_lookup()
        
        for entry in raw_data:
            try:
                # Parse Unix timestamps
                start_time = entry.get('start_time')
                end_time = entry.get('end_time')
                
                # Calculate hours from Unix timestamps
                hours = 0
                start_dt_str = None
                end_dt_str = None
                date_str = None
                
                if start_time:
                    try:
                        # Convert Unix timestamp to datetime
                        from datetime import datetime
                        start_timestamp = int(start_time)
                        start_dt = datetime.fromtimestamp(start_timestamp)
                        start_dt_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
                        date_str = start_dt.strftime('%Y-%m-%d')
                        
                        if end_time:
                            end_timestamp = int(end_time)
                            end_dt = datetime.fromtimestamp(end_timestamp)
                            end_dt_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
                            
                            # Calculate hours
                            duration_seconds = end_timestamp - start_timestamp
                            hours = duration_seconds / 3600
                    except (ValueError, TypeError):
                        pass
                
                # Get staff information
                staff_id = entry.get('staff_id')
                staff_name = staff_lookup.get(staff_id, {}).get('name') if staff_id else None
                
                normalized = {
                    "id": entry.get('id'),
                    "staff_id": staff_id,
                    "staff_name": staff_name,
                    "task_id": entry.get('task_id'),
                    "task_name": None,  # Would need separate API call to /api/tasks
                    "project_id": None,
                    "project_name": None,
                    "date": date_str,
                    "start_time": start_dt_str,
                    "end_time": end_dt_str,
                    "hours": round(hours, 2),
                    "note": entry.get('note'),
                    "tags": [],
                    "billable": True,
                    "hourly_rate": float(entry.get('hourly_rate', 0) or 0),
                    "created_at": None,
                    "updated_at": None
                }
                
                normalized_timesheets.append(normalized)
                
            except Exception as e:
                logger.warning(f"Error normalizing timesheet entry: {str(e)}")
                continue
        
        return normalized_timesheets
    
    def _fetch_staff_lookup(self):
        """Fetch staff data and create lookup dictionary"""
        try:
            headers = {
                'authtoken': self.crm_credentials["token"],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            base_url = self.crm_credentials['base_url'].replace('/api', '')
            url = f"{base_url}/api/staffs"
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                staff_lookup = {}
                if isinstance(data, list):
                    for staff in data:
                        staff_id = str(staff.get('staffid'))
                        firstname = staff.get('firstname', '')
                        lastname = staff.get('lastname', '')
                        full_name = f"{firstname} {lastname}".strip()
                        
                        staff_lookup[staff_id] = {
                            'name': full_name if full_name else None,
                            'email': staff.get('email')
                        }
                
                return staff_lookup
            else:
                logger.warning(f"Failed to fetch staff data: {response.status_code}")
                return {}
                
        except Exception as e:
            logger.warning(f"Error fetching staff lookup: {str(e)}")
            return {}
    
    def _calculate_summary(self, timesheets):
        """Calculate summary statistics for timesheets"""
        total_entries = len(timesheets)
        total_hours = sum(t['hours'] for t in timesheets)
        unique_staff = len(set(t['staff_id'] for t in timesheets if t['staff_id']))
        
        # Count today's entries
        today = datetime.now().strftime('%Y-%m-%d')
        entries_today = sum(1 for t in timesheets if t.get('date') and t.get('date').startswith(today))
        
        # Calculate by staff
        staff_hours = {}
        for t in timesheets:
            staff_id = t['staff_id']
            if staff_id:
                if staff_id not in staff_hours:
                    staff_hours[staff_id] = {
                        'staff_id': staff_id,
                        'staff_name': t['staff_name'],
                        'hours': 0,
                        'entries': 0
                    }
                staff_hours[staff_id]['hours'] += t['hours']
                staff_hours[staff_id]['entries'] += 1
        
        # Sort staff by hours (descending)
        staff_breakdown = sorted(
            staff_hours.values(),
            key=lambda x: x['hours'],
            reverse=True
        )
        
        # Round hours in staff breakdown
        for staff in staff_breakdown:
            staff['hours'] = round(staff['hours'], 2)
        
        return {
            "total_entries": total_entries,
            "total_hours": round(total_hours, 2),
            "total_staff": unique_staff,
            "entries_today": entries_today,
            "average_hours_per_entry": round(total_hours / total_entries, 2) if total_entries > 0 else 0,
            "staff_breakdown": staff_breakdown
        }
