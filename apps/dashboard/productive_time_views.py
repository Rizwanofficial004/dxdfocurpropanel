"""
Productive Time API View
Analyzes S3 user logs and timesheet data to calculate accurate productive time for each user
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime, timedelta
import logging
import requests
import re
import json
import boto3
from collections import defaultdict
from core.credentials import CredentialsManager

logger = logging.getLogger(__name__)


class ProductiveTimeAPIView(APIView):
    """
    API endpoint to calculate productive time from S3 user logs and timesheets data
    
    GET /api/productive_time/
    
    Analyzes S3 user activity logs to calculate real productive time for each user
    and provides comprehensive productive time statistics
    """
    
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.credentials_manager = CredentialsManager()
        self.crm_credentials = self.credentials_manager.get_crm_credentials()
        
        # AWS S3 credentials for user logs
        self.aws_credentials = {
            'aws_access_key_id': 'AKIARSU6EUUWMQ5I2JWC',
            'aws_secret_access_key': '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',
            'region_name': 'eu-north-1',
            'bucket_name': 'ddsfocustime'
        }
    
    def get(self, request):
        """Handle GET request for productive time analysis"""
        try:
            logger.info("Calculating productive time from S3 logs and timesheets...")
            
            # Get query parameters for filtering
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            user_email = request.GET.get('user_email')
            staff_id = request.GET.get('staff_id')
            include_timesheet_data = request.GET.get('include_timesheet_data', 'true').lower() == 'true'
            min_productive_minutes = float(request.GET.get('min_productive_minutes', '5'))
            
            # Set default date range if not provided (last 7 days)
            if not start_date:
                start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            
            # Get productive time from S3 logs
            s3_productive_data = self._analyze_s3_logs_productive_time(
                start_date, end_date, user_email, min_productive_minutes
            )
            
            # Get timesheet data if requested
            timesheet_data = {}
            if include_timesheet_data:
                timesheet_result = self._fetch_crm_timesheets()
                if timesheet_result['success']:
                    timesheet_data = self._process_timesheet_data(
                        timesheet_result['data'], start_date, end_date, staff_id
                    )
            
            # Combine S3 and timesheet data
            combined_productive_data = self._combine_s3_and_timesheet_data(
                s3_productive_data, timesheet_data, start_date, end_date
            )
            
            return Response({
                "status": "success",
                "message": f"Productive time calculated for {combined_productive_data['total_productive_time']['total_users']} users",
                "data": combined_productive_data,
                "filters": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "user_email": user_email,
                    "staff_id": staff_id,
                    "include_timesheet_data": include_timesheet_data,
                    "min_productive_minutes": min_productive_minutes
                },
                "timestamp": datetime.now().isoformat(),
                "data_sources": {
                    "s3_logs": "ddsfocustime bucket",
                    "timesheet_crm": "included" if include_timesheet_data else "excluded"
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error calculating productive time: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": f"Error calculating productive time: {str(e)}",
                "data": {
                    "users_productive_time": [],
                    "total_productive_time": {
                        "total_users": 0,
                        "total_productive_hours": 0,
                        "total_productive_entries": 0,
                        "average_productive_hours_per_user": 0
                    }
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
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
                    "message": "CRM not configured",
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
                    "message": "Successfully fetched timesheets",
                    "endpoint": "/api/timesheets",
                    "response_time_ms": round(elapsed_time, 2)
                }
            else:
                logger.warning(f"CRM API returned status {response.status_code}")
                elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
                return {
                    "success": False,
                    "data": [],
                    "message": f"CRM returned status {response.status_code}",
                    "response_time_ms": round(elapsed_time, 2)
                }
                
        except requests.exceptions.Timeout:
            logger.error("CRM API request timeout")
            elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
            return {
                "success": False,
                "data": [],
                "message": "Request timeout",
                "response_time_ms": round(elapsed_time, 2)
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"CRM API request failed: {str(e)}")
            elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
            return {
                "success": False,
                "data": [],
                "message": str(e),
                "response_time_ms": round(elapsed_time, 2)
            }
        except Exception as e:
            logger.error(f"Unexpected error fetching timesheets: {str(e)}")
            elapsed_time = (datetime.now() - start_time).total_seconds() * 1000
            return {
                "success": False,
                "data": [],
                "message": str(e),
                "response_time_ms": round(elapsed_time, 2)
            }
    
    def _calculate_productive_time(self, raw_data, start_date, end_date, staff_id_filter, exclude_idle, min_productive_minutes):
        """Calculate productive time for each user"""
        try:
            # Parse date filters
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None
            
            # Dictionary to store user productive time data
            users_productive = defaultdict(lambda: {
                'staff_id': None,
                'staff_name': None,
                'total_productive_hours': 0,
                'total_entries': 0,
                'productive_entries': 0,
                'idle_entries': 0,
                'total_idle_time_detected': 0,
                'productive_sessions': [],
                'average_session_hours': 0,
                'dates_active': set(),
                'projects_worked': set(),
                'tasks_worked': set()
            })
            
            total_processed = 0
            total_skipped = 0
            
            logger.info(f"Processing {len(raw_data)} timesheet entries...")
            logger.info(f"Date filters: start_date={start_date} ({start_dt}), end_date={end_date} ({end_dt})")
            logger.info(f"Staff filter: {staff_id_filter}")
            logger.info(f"Exclude idle: {exclude_idle}, Min minutes: {min_productive_minutes}")
            
            for entry in raw_data:
                try:
                    staff_id = entry.get('staff_id')
                    staff_name = entry.get('staff_name')
                    start_time = entry.get('start_time')
                    end_time = entry.get('end_time')
                    hours = entry.get('hours', 0)
                    note = str(entry.get('note', ''))
                    task_id = entry.get('task_id')
                    project_id = entry.get('project_id')
                    
                    # Skip invalid entries
                    if not staff_id or not start_time or hours is None:
                        total_skipped += 1
                        continue
                    
                    # Filter by staff if specified
                    if staff_id_filter and str(staff_id) != str(staff_id_filter):
                        total_skipped += 1
                        continue
                    
                    # Parse timestamps to check date range
                    try:
                        # Get date from the 'date' field first, then fallback to start_time parsing
                        entry_date_str = entry.get('date')
                        if entry_date_str:
                            # Date field format: "2025-10-14"
                            entry_date = datetime.strptime(entry_date_str, '%Y-%m-%d').date()
                        elif isinstance(start_time, str):
                            # Start time format: "2025-10-14 13:31:18"
                            if ' ' in start_time:
                                entry_date = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S').date()
                            else:
                                entry_date = datetime.strptime(start_time, '%Y-%m-%d').date()
                        else:
                            # Handle Unix timestamp
                            entry_date = datetime.fromtimestamp(int(start_time)).date()
                        
                        # Filter by date range
                        if start_dt and entry_date < start_dt:
                            total_skipped += 1
                            continue
                        if end_dt and entry_date > end_dt:
                            total_skipped += 1
                            continue
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Error parsing date for entry {entry.get('id')}: start_time={start_time}, date={entry.get('date')}, error={e}")
                        total_skipped += 1
                        continue
                    
                    # Convert hours to float
                    try:
                        hours_float = float(hours)
                    except (ValueError, TypeError):
                        hours_float = 0
                    
                    # Skip very short entries if minimum is set
                    if hours_float * 60 < min_productive_minutes:
                        total_skipped += 1
                        continue
                    
                    # Check if this is idle time
                    is_idle = self._is_idle_entry(note)
                    idle_seconds = self._extract_idle_seconds_from_note(note) if is_idle else 0
                    
                    # Skip idle entries if exclude_idle is True
                    if exclude_idle and is_idle:
                        users_productive[staff_id]['idle_entries'] += 1
                        users_productive[staff_id]['total_idle_time_detected'] += idle_seconds / 3600  # Convert to hours
                        total_skipped += 1
                        continue
                    
                    # Update user data
                    user_data = users_productive[staff_id]
                    user_data['staff_id'] = staff_id
                    user_data['staff_name'] = staff_name or f"Staff {staff_id}"
                    user_data['total_productive_hours'] += hours_float
                    user_data['total_entries'] += 1
                    
                    if is_idle:
                        user_data['idle_entries'] += 1
                        user_data['total_idle_time_detected'] += idle_seconds / 3600
                    else:
                        user_data['productive_entries'] += 1
                    
                    # Add session details
                    session = {
                        'entry_id': entry.get('id'),
                        'date': entry_date.strftime('%Y-%m-%d'),
                        'start_time': start_time,
                        'end_time': end_time,
                        'hours': hours_float,
                        'task_id': task_id,
                        'project_id': project_id,
                        'note_preview': note[:100] + '...' if len(note) > 100 else note,
                        'is_idle': is_idle,
                        'idle_seconds': idle_seconds
                    }
                    user_data['productive_sessions'].append(session)
                    
                    # Track unique dates, projects, tasks
                    user_data['dates_active'].add(entry_date.strftime('%Y-%m-%d'))
                    if task_id:
                        user_data['tasks_worked'].add(str(task_id))
                    if project_id:
                        user_data['projects_worked'].add(str(project_id))
                    
                    total_processed += 1
                    
                except Exception as e:
                    logger.warning(f"Error processing timesheet entry {entry.get('id')}: {str(e)}")
                    total_skipped += 1
                    continue
            
            # Calculate averages and finalize data
            users_final = []
            total_productive_hours = 0
            total_productive_entries = 0
            
            for staff_id, user_data in users_productive.items():
                if user_data['total_entries'] > 0:
                    user_data['average_session_hours'] = round(
                        user_data['total_productive_hours'] / user_data['total_entries'], 2
                    )
                    user_data['total_productive_hours'] = round(user_data['total_productive_hours'], 2)
                    user_data['total_idle_time_detected'] = round(user_data['total_idle_time_detected'], 2)
                    user_data['productivity_ratio'] = round(
                        user_data['productive_entries'] / user_data['total_entries'] * 100, 2
                    ) if user_data['total_entries'] > 0 else 0
                    
                    # Convert sets to lists and counts
                    user_data['unique_dates_count'] = len(user_data['dates_active'])
                    user_data['unique_projects_count'] = len(user_data['projects_worked'])
                    user_data['unique_tasks_count'] = len(user_data['tasks_worked'])
                    user_data['dates_active'] = sorted(list(user_data['dates_active']))
                    user_data['projects_worked'] = list(user_data['projects_worked'])
                    user_data['tasks_worked'] = list(user_data['tasks_worked'])
                    
                    # Sort sessions by date (most recent first)
                    user_data['productive_sessions'].sort(key=lambda x: x['date'], reverse=True)
                    
                    users_final.append(user_data)
                    total_productive_hours += user_data['total_productive_hours']
                    total_productive_entries += user_data['productive_entries']
            
            # Sort users by productive hours (highest first)
            users_final.sort(key=lambda x: x['total_productive_hours'], reverse=True)
            
            # Calculate date range info
            date_range_days = 0
            if start_dt and end_dt:
                date_range_days = (end_dt - start_dt).days + 1
            
            # Prepare summary
            total_summary = {
                "total_users": len(users_final),
                "total_productive_hours": round(total_productive_hours, 2),
                "total_productive_entries": total_productive_entries,
                "average_productive_hours_per_user": round(
                    total_productive_hours / len(users_final), 2
                ) if len(users_final) > 0 else 0,
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "total_days": date_range_days
                },
                "processing_stats": {
                    "total_entries_processed": total_processed,
                    "total_entries_skipped": total_skipped,
                    "success_rate": round(total_processed / (total_processed + total_skipped) * 100, 2) if (total_processed + total_skipped) > 0 else 0
                }
            }
            
            logger.info(f"Productive time calculation completed: {len(users_final)} users, {total_productive_hours:.2f} total hours")
            
            return {
                "users_productive_time": users_final,
                "total_productive_time": total_summary
            }
            
        except Exception as e:
            logger.error(f"Error in productive time calculation: {str(e)}", exc_info=True)
            return {
                "users_productive_time": [],
                "total_productive_time": {
                    "total_users": 0,
                    "total_productive_hours": 0,
                    "total_productive_entries": 0,
                    "average_productive_hours_per_user": 0,
                    "error": str(e)
                }
            }
    
    def _is_idle_entry(self, note):
        """Check if a timesheet entry represents idle time"""
        if not note or not isinstance(note, str):
            return False
        
        # Common idle time indicators
        idle_indicators = [
            'Auto-paused due to',
            'system idle',
            'idle time',
            'away from computer',
            'break',
            'lunch',
            'offline'
        ]
        
        note_lower = note.lower()
        return any(indicator.lower() in note_lower for indicator in idle_indicators)
    
    def _extract_idle_seconds_from_note(self, note):
        """Extract idle seconds from note column"""
        if not note or not isinstance(note, str):
            return 0
        
        import re
        
        # Pattern to match "Auto-paused due to X seconds system idle"
        pattern = r'Auto-paused due to (\d+) seconds system idle'
        match = re.search(pattern, note, re.IGNORECASE)
        
        if match:
            try:
                seconds = int(match.group(1))
                return seconds
            except (ValueError, TypeError):
                pass
        
        return 0
    
    def _analyze_s3_logs_productive_time(self, start_date, end_date, user_email_filter, min_productive_minutes):
        """Analyze S3 user logs to calculate productive time for each user"""
        try:
            logger.info(f"Analyzing S3 logs for productive time from {start_date} to {end_date}")
            
            # Create S3 client
            s3_client = boto3.client(
                's3',
                aws_access_key_id=self.aws_credentials['aws_access_key_id'],
                aws_secret_access_key=self.aws_credentials['aws_secret_access_key'],
                region_name=self.aws_credentials['region_name']
            )
            
            bucket_name = self.aws_credentials['bucket_name']
            
            # Get date range
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            users_productive_data = defaultdict(lambda: {
                'user_email': None,
                'total_productive_hours': 0,
                'total_active_sessions': 0,
                'total_logs_analyzed': 0,
                'productive_sessions': [],
                'daily_breakdown': {},
                'activity_types': {},
                'first_activity': None,
                'last_activity': None,
                'average_session_duration': 0
            })
            
            # Generate list of dates to check
            current_date = start_dt
            total_logs_processed = 0
            
            while current_date <= end_dt:
                date_str = current_date.strftime('%Y-%m-%d')
                logger.info(f"Processing logs for date: {date_str}")
                
                # List objects for this date
                try:
                    prefix = f"users_logs/{date_str}/"
                    response = s3_client.list_objects_v2(
                        Bucket=bucket_name,
                        Prefix=prefix,
                        MaxKeys=1000
                    )
                    
                    if 'Contents' in response:
                        for obj in response['Contents']:
                            key = obj['Key']
                            
                            # Extract user email from path: users_logs/2025-10-15/user@email.com/file.json
                            path_parts = key.split('/')
                            if len(path_parts) >= 3:
                                user_email = path_parts[2]
                                
                                # Filter by user email if specified
                                if user_email_filter and user_email_filter not in user_email:
                                    continue
                                
                                # Process log file
                                productive_time = self._process_s3_log_file(
                                    s3_client, bucket_name, key, date_str, min_productive_minutes
                                )
                                
                                if productive_time > 0:
                                    user_data = users_productive_data[user_email]
                                    user_data['user_email'] = user_email
                                    user_data['total_productive_hours'] += productive_time
                                    user_data['total_logs_analyzed'] += 1
                                    
                                    # Add to daily breakdown
                                    if date_str not in user_data['daily_breakdown']:
                                        user_data['daily_breakdown'][date_str] = 0
                                    user_data['daily_breakdown'][date_str] += productive_time
                                    
                                    total_logs_processed += 1
                
                except Exception as e:
                    logger.warning(f"Error processing logs for date {date_str}: {str(e)}")
                
                current_date += timedelta(days=1)
            
            # Finalize user data
            users_final = []
            total_productive_hours = 0
            
            for user_email, user_data in users_productive_data.items():
                if user_data['total_productive_hours'] > 0:
                    user_data['total_productive_hours'] = round(user_data['total_productive_hours'], 2)
                    user_data['average_session_duration'] = round(
                        user_data['total_productive_hours'] / max(user_data['total_logs_analyzed'], 1), 2
                    )
                    user_data['active_days'] = len(user_data['daily_breakdown'])
                    
                    users_final.append(user_data)
                    total_productive_hours += user_data['total_productive_hours']
            
            # Sort by productive hours (highest first)
            users_final.sort(key=lambda x: x['total_productive_hours'], reverse=True)
            
            # Calculate summary statistics
            date_range_days = (end_dt - start_dt).days + 1
            
            summary = {
                "total_users": len(users_final),
                "total_productive_hours": round(total_productive_hours, 2),
                "total_logs_processed": total_logs_processed,
                "average_productive_hours_per_user": round(
                    total_productive_hours / len(users_final), 2
                ) if len(users_final) > 0 else 0,
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "total_days": date_range_days
                },
                "s3_analysis_stats": {
                    "bucket_analyzed": bucket_name,
                    "date_range_days": date_range_days,
                    "total_log_files_processed": total_logs_processed
                }
            }
            
            logger.info(f"S3 analysis completed: {len(users_final)} users, {total_productive_hours:.2f} total hours")
            
            return {
                "users_productive_time": users_final,
                "total_productive_time": summary
            }
            
        except Exception as e:
            logger.error(f"Error analyzing S3 logs: {str(e)}", exc_info=True)
            return {
                "users_productive_time": [],
                "total_productive_time": {
                    "total_users": 0,
                    "total_productive_hours": 0,
                    "total_logs_processed": 0,
                    "average_productive_hours_per_user": 0,
                    "error": str(e)
                }
            }
    
    def _process_s3_log_file(self, s3_client, bucket_name, key, date_str, min_productive_minutes):
        """Process individual S3 log file to extract productive time"""
        try:
            # Download log file
            response = s3_client.get_object(Bucket=bucket_name, Key=key)
            content = response['Body'].read().decode('utf-8')
            
            # Parse JSON log data
            log_data = json.loads(content)
            
            productive_hours = 0
            
            # Analyze different types of log entries
            if isinstance(log_data, list):
                for entry in log_data:
                    if isinstance(entry, dict):
                        # Look for activity indicators
                        activity_duration = self._extract_activity_duration(entry)
                        if activity_duration >= min_productive_minutes:
                            productive_hours += activity_duration / 60  # Convert minutes to hours
            
            elif isinstance(log_data, dict):
                # Single log entry
                activity_duration = self._extract_activity_duration(log_data)
                if activity_duration >= min_productive_minutes:
                    productive_hours += activity_duration / 60
            
            return productive_hours
            
        except Exception as e:
            logger.warning(f"Error processing log file {key}: {str(e)}")
            return 0
    
    def _extract_activity_duration(self, log_entry):
        """Extract activity duration from log entry"""
        try:
            # Common patterns for activity duration
            duration_minutes = 0
            
            # Check for explicit duration fields
            if 'duration' in log_entry:
                duration_minutes = float(log_entry['duration'])
            elif 'active_time' in log_entry:
                duration_minutes = float(log_entry['active_time'])
            elif 'productive_time' in log_entry:
                duration_minutes = float(log_entry['productive_time'])
            elif 'work_time' in log_entry:
                duration_minutes = float(log_entry['work_time'])
            
            # Check for time range fields
            elif 'start_time' in log_entry and 'end_time' in log_entry:
                try:
                    start_time = datetime.fromisoformat(log_entry['start_time'].replace('Z', '+00:00'))
                    end_time = datetime.fromisoformat(log_entry['end_time'].replace('Z', '+00:00'))
                    duration_seconds = (end_time - start_time).total_seconds()
                    duration_minutes = duration_seconds / 60
                except:
                    pass
            
            # Check for activity indicators
            elif 'activity_count' in log_entry:
                # Assume each activity represents 1 minute of productive time
                duration_minutes = float(log_entry['activity_count'])
            elif 'keystrokes' in log_entry or 'mouse_clicks' in log_entry:
                # Estimate productivity based on activity
                keystrokes = log_entry.get('keystrokes', 0)
                mouse_clicks = log_entry.get('mouse_clicks', 0)
                total_activity = keystrokes + mouse_clicks
                
                # Rough estimation: 1 minute per 50 activities
                duration_minutes = total_activity / 50
            
            return max(0, duration_minutes)
            
        except Exception as e:
            logger.warning(f"Error extracting activity duration: {str(e)}")
            return 0
    
    def _process_timesheet_data(self, timesheet_data, start_date, end_date, staff_id_filter):
        """Process timesheet data for comparison"""
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            timesheet_summary = defaultdict(lambda: {
                'staff_id': None,
                'staff_name': None,
                'total_hours': 0,
                'total_entries': 0,
                'date_range_hours': {}
            })
            
            for entry in timesheet_data:
                staff_id = entry.get('staff_id')
                staff_name = entry.get('staff_name')
                hours = float(entry.get('hours', 0))
                date_str = entry.get('date')
                
                if not staff_id or not date_str:
                    continue
                
                # Filter by staff if specified
                if staff_id_filter and str(staff_id) != str(staff_id_filter):
                    continue
                
                # Filter by date range
                try:
                    entry_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    if entry_date < start_dt or entry_date > end_dt:
                        continue
                except:
                    continue
                
                user_data = timesheet_summary[staff_id]
                user_data['staff_id'] = staff_id
                user_data['staff_name'] = staff_name
                user_data['total_hours'] += hours
                user_data['total_entries'] += 1
                
                if date_str not in user_data['date_range_hours']:
                    user_data['date_range_hours'][date_str] = 0
                user_data['date_range_hours'][date_str] += hours
            
            return dict(timesheet_summary)
            
        except Exception as e:
            logger.error(f"Error processing timesheet data: {str(e)}")
            return {}
    
    def _combine_s3_and_timesheet_data(self, s3_data, timesheet_data, start_date, end_date):
        """Combine S3 logs and timesheet data for comprehensive analysis"""
        try:
            combined_users = []
            
            # Start with S3 data as primary source
            for user in s3_data.get('users_productive_time', []):
                user_email = user['user_email']
                
                # Try to match with timesheet data
                timesheet_match = None
                for staff_id, ts_data in timesheet_data.items():
                    # Simple matching by name similarity or email patterns
                    if ts_data['staff_name'] and user_email:
                        # Extract name from email
                        email_name = user_email.split('@')[0].lower()
                        staff_name_clean = ts_data['staff_name'].lower().replace(' ', '')
                        
                        if email_name in staff_name_clean or staff_name_clean in email_name:
                            timesheet_match = ts_data
                            break
                
                # Create combined user data
                combined_user = {
                    'user_email': user_email,
                    'staff_id': timesheet_match['staff_id'] if timesheet_match else None,
                    'staff_name': timesheet_match['staff_name'] if timesheet_match else None,
                    's3_productive_hours': user['total_productive_hours'],
                    'timesheet_hours': timesheet_match['total_hours'] if timesheet_match else 0,
                    'total_logs_analyzed': user['total_logs_analyzed'],
                    'active_days': user['active_days'],
                    'daily_breakdown': user['daily_breakdown'],
                    'productivity_ratio': 0,
                    'data_sources': {
                        's3_logs': True,
                        'timesheet': timesheet_match is not None
                    }
                }
                
                # Calculate productivity ratio
                if timesheet_match and timesheet_match['total_hours'] > 0:
                    combined_user['productivity_ratio'] = round(
                        (user['total_productive_hours'] / timesheet_match['total_hours']) * 100, 2
                    )
                
                combined_users.append(combined_user)
            
            # Sort by S3 productive hours
            combined_users.sort(key=lambda x: x['s3_productive_hours'], reverse=True)
            
            # Calculate totals
            total_s3_hours = sum(u['s3_productive_hours'] for u in combined_users)
            total_timesheet_hours = sum(u['timesheet_hours'] for u in combined_users)
            
            summary = {
                "total_users": len(combined_users),
                "total_s3_productive_hours": round(total_s3_hours, 2),
                "total_timesheet_hours": round(total_timesheet_hours, 2),
                "average_s3_productive_hours_per_user": round(
                    total_s3_hours / len(combined_users), 2
                ) if len(combined_users) > 0 else 0,
                "data_source_coverage": {
                    "users_with_s3_data": len(combined_users),
                    "users_with_timesheet_data": sum(1 for u in combined_users if u['data_sources']['timesheet']),
                    "users_with_both": sum(1 for u in combined_users if u['data_sources']['timesheet'])
                },
                "date_range": s3_data.get('total_productive_time', {}).get('date_range', {})
            }
            
            return {
                "users_productive_time": combined_users,
                "total_productive_time": summary
            }
            
        except Exception as e:
            logger.error(f"Error combining S3 and timesheet data: {str(e)}")
            return s3_data  # Fallback to S3 data only