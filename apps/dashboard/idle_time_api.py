"""
Idle Time API View
Analyzes timesheet data to extract and calculate idle time for users from the 'note' column
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime
import logging
import requests
import re
from collections import defaultdict
from core.credentials import CredentialsManager

logger = logging.getLogger(__name__)


class IdleTimeAPIView(APIView):
    """
    API endpoint to analyze idle time from timesheets data
    
    GET /api/idle_time/
    
    Analyzes timesheet notes to extract idle time information and 
    provides idle time statistics for each user
    """
    
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.credentials_manager = CredentialsManager()
        self.crm_credentials = self.credentials_manager.get_crm_credentials()
    
    def get(self, request):
        """Handle GET request for idle time analysis"""
        try:
            logger.info("Analyzing idle time from timesheets...")
            
            # Check if this is a test request or if CRM is not configured
            is_test = request.GET.get('test', 'false').lower() == 'true'
            
            # Get query parameters for filtering
            user_email = request.GET.get('user_email')
            user_name = request.GET.get('user_name')
            staff_id = request.GET.get('staff_id')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            
            # Get timesheets data - try CRM first, fallback to test data
            if is_test:
                timesheets_result = self._get_sample_timesheets()
                logger.info("Using test data as requested")
            else:
                # Try to fetch from CRM
                timesheets_result = self._fetch_crm_timesheets()
                
                # If CRM fails, automatically fall back to test data
                if not timesheets_result['success']:
                    logger.warning(f"CRM fetch failed: {timesheets_result['message']}. Falling back to test data.")
                    timesheets_result = self._get_sample_timesheets()
                    is_test = True  # Mark as test mode for response
            
            # Analyze idle time from timesheets
            idle_analysis = self._analyze_idle_time(
                timesheets_result['data'], 
                user_email, 
                user_name, 
                staff_id,
                start_date,
                end_date
            )
            
            return Response({
                "status": "success",
                "message": f"Idle time analysis completed for {len(idle_analysis['users'])} users",
                "data": idle_analysis,
                "timestamp": datetime.now().isoformat(),
                "test_mode": is_test,
                "data_source": "test_data" if is_test else "crm_api"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error analyzing idle time: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Error analyzing idle time: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _fetch_crm_timesheets(self):
        """Fetch timesheets data from CRM"""
        try:
            if not self.crm_credentials or not self.crm_credentials.get('is_configured'):
                return {
                    'success': False,
                    'message': 'CRM credentials not configured',
                    'data': None
                }
            
            # Build CRM API URL
            base_url = self.crm_credentials.get('api_base_url', '').rstrip('/')
            auth_token = self.crm_credentials.get('auth_token', '')
            
            if not base_url or not auth_token:
                return {
                    'success': False,
                    'message': 'CRM API URL or token not configured',
                    'data': None
                }
            
            url = f"{base_url}/api/timesheets?authtoken={auth_token}"
            
            # Make API request
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract timesheets array
            if isinstance(data, dict) and 'data' in data:
                timesheets = data['data'].get('timesheets', [])
            elif isinstance(data, list):
                timesheets = data
            else:
                timesheets = []
            
            return {
                'success': True,
                'message': f'Successfully fetched {len(timesheets)} timesheets',
                'data': timesheets
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"CRM API request failed: {str(e)}")
            return {
                'success': False,
                'message': f'CRM API request failed: {str(e)}',
                'data': None
            }
        except Exception as e:
            logger.error(f"Error fetching timesheets: {str(e)}")
            return {
                'success': False,
                'message': f'Error fetching timesheets: {str(e)}',
                'data': None
            }
    
    def _analyze_idle_time(self, timesheets, user_email=None, user_name=None, staff_id=None, start_date=None, end_date=None):
        """Analyze idle time from timesheet notes"""
        try:
            user_idle_data = defaultdict(lambda: {
                'staff_id': None,
                'staff_name': None,
                'total_idle_seconds': 0,
                'total_idle_minutes': 0,
                'idle_sessions': [],
                'auto_pause_sessions': [],
                'work_sessions': [],
                'total_sessions': 0,
                'dates_active': set(),
                'first_activity': None,
                'last_activity': None
            })
            
            # Regex patterns to extract idle time
            idle_patterns = [
                r'stayed idle for (\d+) seconds',  # "stayed idle for X seconds"
                r'system idle for (\d+) seconds',  # "system idle for X seconds"
                r'(\d+) seconds system idle',      # "X seconds system idle"
                r'Auto-paused due to (\d+) seconds system idle',  # "Auto-paused due to X seconds system idle"
            ]
            
            # Work time pattern
            work_pattern = r'worked for (\d+) minutes'
            
            processed_count = 0
            for timesheet in timesheets:
                try:
                    # Apply filters
                    if user_email and timesheet.get('staff_email', '').lower() != user_email.lower():
                        continue
                    if user_name and user_name.lower() not in timesheet.get('staff_name', '').lower():
                        continue
                    if staff_id and str(timesheet.get('staff_id', '')) != str(staff_id):
                        continue
                    
                    # Date filtering
                    timesheet_date = timesheet.get('date', '')
                    if start_date and timesheet_date < start_date:
                        continue
                    if end_date and timesheet_date > end_date:
                        continue
                    
                    # Extract data
                    staff_id_val = timesheet.get('staff_id', 'unknown')
                    staff_name = timesheet.get('staff_name', 'Unknown User')
                    note = timesheet.get('note', '')
                    date = timesheet.get('date', '')
                    start_time = timesheet.get('start_time', '')
                    end_time = timesheet.get('end_time', '')
                    
                    # Initialize user data
                    user_key = f"{staff_id_val}_{staff_name}"
                    user_data = user_idle_data[user_key]
                    user_data['staff_id'] = staff_id_val
                    user_data['staff_name'] = staff_name
                    
                    # Track dates and activity times
                    if date:
                        user_data['dates_active'].add(date)
                        if not user_data['first_activity'] or date < user_data['first_activity']:
                            user_data['first_activity'] = date
                        if not user_data['last_activity'] or date > user_data['last_activity']:
                            user_data['last_activity'] = date
                    
                    # Analyze note for idle time
                    idle_seconds_found = 0
                    work_minutes_found = 0
                    session_type = 'unknown'
                    
                    # Check for idle patterns
                    for pattern in idle_patterns:
                        matches = re.findall(pattern, note, re.IGNORECASE)
                        if matches:
                            idle_seconds_found = int(matches[0])
                            session_type = 'auto_pause' if 'auto-paused' in note.lower() else 'idle'
                            break
                    
                    # Check for work time
                    work_matches = re.findall(work_pattern, note, re.IGNORECASE)
                    if work_matches:
                        work_minutes_found = int(work_matches[0])
                        if session_type == 'unknown':
                            session_type = 'work'
                    
                    # Create session record
                    session = {
                        'date': date,
                        'start_time': start_time,
                        'end_time': end_time,
                        'note': note,
                        'idle_seconds': idle_seconds_found,
                        'idle_minutes': round(idle_seconds_found / 60, 2) if idle_seconds_found > 0 else 0,
                        'work_minutes': work_minutes_found,
                        'session_type': session_type
                    }
                    
                    # Add to appropriate session list
                    if session_type == 'auto_pause':
                        user_data['auto_pause_sessions'].append(session)
                    elif idle_seconds_found > 0:
                        user_data['idle_sessions'].append(session)
                    elif work_minutes_found > 0:
                        user_data['work_sessions'].append(session)
                    
                    # Update totals
                    user_data['total_idle_seconds'] += idle_seconds_found
                    user_data['total_sessions'] += 1
                    
                    processed_count += 1
                    
                except Exception as e:
                    logger.warning(f"Error processing timesheet entry: {str(e)}")
                    continue
            
            # Calculate final statistics
            result_users = []
            total_idle_seconds = 0
            total_idle_minutes = 0
            
            for user_key, data in user_idle_data.items():
                # Convert dates set to list
                data['dates_active'] = sorted(list(data['dates_active']))
                data['total_days_active'] = len(data['dates_active'])
                
                # Calculate idle minutes
                data['total_idle_minutes'] = round(data['total_idle_seconds'] / 60, 2)
                data['average_idle_per_day'] = round(
                    data['total_idle_minutes'] / max(1, data['total_days_active']), 2
                )
                
                # Count session types
                data['idle_session_count'] = len(data['idle_sessions'])
                data['auto_pause_count'] = len(data['auto_pause_sessions'])
                data['work_session_count'] = len(data['work_sessions'])
                
                # Add to totals
                total_idle_seconds += data['total_idle_seconds']
                total_idle_minutes += data['total_idle_minutes']
                
                result_users.append(data)
            
            # Sort users by total idle time (descending)
            result_users.sort(key=lambda x: x['total_idle_seconds'], reverse=True)
            
            return {
                'users': result_users,
                'summary': {
                    'total_users_analyzed': len(result_users),
                    'total_timesheets_processed': processed_count,
                    'total_idle_seconds_all_users': total_idle_seconds,
                    'total_idle_minutes_all_users': round(total_idle_minutes, 2),
                    'average_idle_per_user_minutes': round(total_idle_minutes / max(1, len(result_users)), 2)
                },
                'filters_applied': {
                    'user_email': user_email,
                    'user_name': user_name,
                    'staff_id': staff_id,
                    'start_date': start_date,
                    'end_date': end_date
                }
            }
            
        except Exception as e:
            logger.error(f"Error in idle time analysis: {str(e)}")
            raise
    
    def _get_sample_timesheets(self):
        """Get sample timesheet data for testing"""
        sample_data = [
            {
                "id": "24954",
                "staff_id": "188",
                "staff_name": "Hamza Haseeb",
                "date": "2025-10-09",
                "start_time": "2025-10-09 15:54:23",
                "end_time": "2025-10-09 15:54:33",
                "note": "User worked for 0 minutes and stayed idle for 5 seconds."
            },
            {
                "id": "24955",
                "staff_id": "188",
                "staff_name": "Hamza Haseeb",
                "date": "2025-10-09",
                "start_time": "2025-10-09 15:32:00",
                "end_time": "2025-10-09 15:42:00",
                "note": "Auto-paused due to 183 seconds system idle"
            },
            {
                "id": "24956",
                "staff_id": "200",
                "staff_name": "Laiba Batool",
                "date": "2025-10-09",
                "start_time": "2025-10-09 15:04:00",
                "end_time": "2025-10-09 15:26:00",
                "note": "Auto-paused due to 180 seconds system idle"
            },
            {
                "id": "24957",
                "staff_id": "201",
                "staff_name": "Gulsum Melisa Ari",
                "date": "2025-10-09",
                "start_time": "2025-10-09 14:56:00",
                "end_time": "2025-10-09 15:35:00",
                "note": "Auto-paused due to 181 seconds system idle"
            },
            {
                "id": "24958",
                "staff_id": "188",
                "staff_name": "Hamza Haseeb",
                "date": "2025-10-09",
                "start_time": "2025-10-09 14:53:00",
                "end_time": "2025-10-09 15:00:00",
                "note": "User worked for 4 minutes and stayed idle for 5 seconds."
            },
            {
                "id": "24959",
                "staff_id": "200",
                "staff_name": "Laiba Batool",
                "date": "2025-10-08",
                "start_time": "2025-10-08 16:30:00",
                "end_time": "2025-10-08 16:35:00",
                "note": "User worked for 5 minutes and stayed idle for 10 seconds."
            },
            {
                "id": "24960",
                "staff_id": "201",
                "staff_name": "Gulsum Melisa Ari",
                "date": "2025-10-08",
                "start_time": "2025-10-08 10:00:00",
                "end_time": "2025-10-08 11:00:00",
                "note": "User worked for 60 minutes and stayed idle for 120 seconds."
            }
        ]
        
        return {
            'success': True,
            'message': f'Sample data loaded with {len(sample_data)} timesheet entries',
            'data': sample_data
        }