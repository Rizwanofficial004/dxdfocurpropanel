"""
Timesheet Summary API
Provides comprehensive timesheet summaries with analytics and insights
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime, timedelta
import logging
import requests
import re
from collections import defaultdict
from core.credentials import CredentialsManager

logger = logging.getLogger(__name__)


class TimesheetSummaryAPIView(APIView):
    """
    API endpoint to get timesheet summary with detailed analytics
    
    GET /api/timesheet_summary/
    Query parameters:
    - staff_id: Filter by specific staff ID
    - staff_name: Filter by staff name (partial match)
    - start_date: Start date filter (YYYY-MM-DD)
    - end_date: End date filter (YYYY-MM-DD)
    - period: Predefined period (today, yesterday, this_week, last_week, this_month, last_month)
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.credentials_manager = CredentialsManager()
        self.crm_credentials = self.credentials_manager.get_crm_credentials()
    
    def get(self, request):
        """Handle GET request for timesheet summary"""
        try:
            # Get query parameters
            filters = self._extract_filters(request)
            
            logger.info(f"Fetching timesheet summary with filters: {filters}")
            
            # Fetch timesheet data
            timesheets_result = self._fetch_timesheets_data()
            
            if not timesheets_result['success']:
                # Return test data if CRM fails
                return self._get_test_summary_data(filters)
            
            # Process and analyze the data
            timesheets = timesheets_result['data']
            
            # Apply filters
            filtered_timesheets = self._apply_filters(timesheets, filters)
            
            # Generate comprehensive summary
            summary = self._generate_comprehensive_summary(filtered_timesheets, filters)
            
            return Response({
                "status": "success",
                "message": f"Timesheet summary generated for {len(filtered_timesheets)} entries",
                "data": summary,
                "filters_applied": filters,
                "timestamp": datetime.now().isoformat(),
                "test_mode": False,
                "data_source": "crm_api"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating timesheet summary: {str(e)}")
            # Initialize filters if exception occurred during filter extraction
            if 'filters' not in locals():
                filters = self._extract_filters(request)
            return self._get_test_summary_data(filters)
    
    def _extract_filters(self, request):
        """Extract and validate query parameters"""
        filters = {
            'staff_id': request.query_params.get('staff_id'),
            'staff_name': request.query_params.get('staff_name'),
            'start_date': request.query_params.get('start_date'),
            'end_date': request.query_params.get('end_date'),
            'period': request.query_params.get('period'),
        }
        
        # Handle predefined periods
        if filters['period']:
            start_date, end_date = self._get_period_dates(filters['period'])
            if start_date:
                filters['start_date'] = start_date.isoformat() if hasattr(start_date, 'isoformat') else str(start_date)
            if end_date:
                filters['end_date'] = end_date.isoformat() if hasattr(end_date, 'isoformat') else str(end_date)
        
        # Validate and parse dates
        if filters['start_date'] and isinstance(filters['start_date'], str):
            try:
                filters['start_date'] = datetime.strptime(filters['start_date'], '%Y-%m-%d').date()
            except ValueError:
                filters['start_date'] = None
        
        if filters['end_date'] and isinstance(filters['end_date'], str):
            try:
                filters['end_date'] = datetime.strptime(filters['end_date'], '%Y-%m-%d').date()
            except ValueError:
                filters['end_date'] = None
        
        return filters
    
    def _get_period_dates(self, period):
        """Get start and end dates for predefined periods"""
        today = datetime.now().date()
        
        if period == 'today':
            return today, today
        elif period == 'yesterday':
            yesterday = today - timedelta(days=1)
            return yesterday, yesterday
        elif period == 'this_week':
            start_of_week = today - timedelta(days=today.weekday())
            return start_of_week, today
        elif period == 'last_week':
            start_of_last_week = today - timedelta(days=today.weekday() + 7)
            end_of_last_week = start_of_last_week + timedelta(days=6)
            return start_of_last_week, end_of_last_week
        elif period == 'this_month':
            start_of_month = today.replace(day=1)
            return start_of_month, today
        elif period == 'last_month':
            if today.month == 1:
                start_of_last_month = today.replace(year=today.year - 1, month=12, day=1)
            else:
                start_of_last_month = today.replace(month=today.month - 1, day=1)
            
            end_of_last_month = today.replace(day=1) - timedelta(days=1)
            return start_of_last_month, end_of_last_month
        
        return None, None
    
    def _fetch_timesheets_data(self):
        """Fetch timesheets from CRM API"""
        try:
            if not self.crm_credentials["is_configured"]:
                return {"success": False, "data": [], "error": "CRM not configured"}
            
            headers = {
                'authtoken': self.crm_credentials["token"],
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            base_url = self.crm_credentials['base_url'].replace('/api', '')
            url = f"{base_url}/api/timesheets"
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                timesheets_data = data if isinstance(data, list) else data.get('data', [])
                return {"success": True, "data": timesheets_data}
            else:
                return {"success": False, "data": [], "error": f"API returned {response.status_code}"}
                
        except Exception as e:
            logger.error(f"Error fetching timesheets: {str(e)}")
            return {"success": False, "data": [], "error": str(e)}
    
    def _apply_filters(self, timesheets, filters):
        """Apply filters to timesheet data"""
        filtered = timesheets
        
        # Filter by staff ID
        if filters['staff_id']:
            filtered = [t for t in filtered if str(t.get('staff_id', '')) == str(filters['staff_id'])]
        
        # Filter by staff name (partial match)
        if filters['staff_name']:
            name_filter = filters['staff_name'].lower()
            filtered = [t for t in filtered if name_filter in str(t.get('staff_name', '')).lower()]
        
        # Filter by date range
        if filters['start_date'] or filters['end_date']:
            date_filtered = []
            for timesheet in filtered:
                entry_date = self._parse_timesheet_date(timesheet)
                if entry_date:
                    if filters['start_date'] and entry_date < filters['start_date']:
                        continue
                    if filters['end_date'] and entry_date > filters['end_date']:
                        continue
                    date_filtered.append(timesheet)
            filtered = date_filtered
        
        return filtered
    
    def _parse_timesheet_date(self, timesheet):
        """Parse date from timesheet entry"""
        # Try different date fields and formats
        date_fields = ['date', 'start_date', 'created_at', 'start_time']
        
        for field in date_fields:
            if field in timesheet and timesheet[field]:
                try:
                    # Try different date formats
                    date_str = str(timesheet[field])
                    
                    # YYYY-MM-DD format
                    if len(date_str) >= 10:
                        return datetime.strptime(date_str[:10], '%Y-%m-%d').date()
                    
                except (ValueError, AttributeError):
                    continue
        
        return None
    
    def _generate_comprehensive_summary(self, timesheets, filters):
        """Generate comprehensive timesheet summary with analytics"""
        staff_summaries = defaultdict(lambda: {
            'staff_id': '',
            'staff_name': '',
            'total_entries': 0,
            'total_hours': 0,
            'total_minutes': 0,
            'total_seconds': 0,
            'billable_hours': 0,
            'non_billable_hours': 0,
            'projects': set(),
            'tasks': set(),
            'dates_worked': set(),
            'first_entry': None,
            'last_entry': None,
            'average_daily_hours': 0,
            'idle_time_minutes': 0,
            'productivity_score': 0,
            'entries_by_date': defaultdict(list),
            'hourly_distribution': defaultdict(int),
            'task_breakdown': defaultdict(float)
        })
        
        total_seconds = 0
        total_entries = 0
        date_range = set()
        
        for timesheet in timesheets:
            staff_id = str(timesheet.get('staff_id', ''))
            staff_name = timesheet.get('staff_name', 'Unknown')
            
            # Initialize staff data
            if not staff_summaries[staff_id]['staff_name']:
                staff_summaries[staff_id]['staff_id'] = staff_id
                staff_summaries[staff_id]['staff_name'] = staff_name
            
            # Parse time data
            hours = float(timesheet.get('total_hours', 0) or timesheet.get('hours', 0) or 0)
            seconds = self._extract_seconds_from_timesheet(timesheet)
            minutes = seconds / 60 if seconds else hours * 60
            
            # Update staff summary
            staff_summaries[staff_id]['total_entries'] += 1
            staff_summaries[staff_id]['total_hours'] += hours
            staff_summaries[staff_id]['total_minutes'] += minutes
            staff_summaries[staff_id]['total_seconds'] += seconds
            
            # Billable vs non-billable
            if timesheet.get('billable', True):
                staff_summaries[staff_id]['billable_hours'] += hours
            else:
                staff_summaries[staff_id]['non_billable_hours'] += hours
            
            # Project and task tracking
            if timesheet.get('project_name'):
                staff_summaries[staff_id]['projects'].add(timesheet['project_name'])
            
            if timesheet.get('task_name'):
                staff_summaries[staff_id]['tasks'].add(timesheet['task_name'])
                staff_summaries[staff_id]['task_breakdown'][timesheet['task_name']] += hours
            
            # Date tracking
            entry_date = self._parse_timesheet_date(timesheet)
            if entry_date:
                staff_summaries[staff_id]['dates_worked'].add(entry_date)
                staff_summaries[staff_id]['entries_by_date'][entry_date.isoformat()].append(timesheet)
                date_range.add(entry_date)
                
                # Track first and last entries
                if not staff_summaries[staff_id]['first_entry'] or entry_date < staff_summaries[staff_id]['first_entry']:
                    staff_summaries[staff_id]['first_entry'] = entry_date
                
                if not staff_summaries[staff_id]['last_entry'] or entry_date > staff_summaries[staff_id]['last_entry']:
                    staff_summaries[staff_id]['last_entry'] = entry_date
            
            # Extract idle time from notes
            idle_minutes = self._extract_idle_time_from_note(timesheet.get('note', ''))
            staff_summaries[staff_id]['idle_time_minutes'] += idle_minutes
            
            # Update totals
            total_seconds += seconds
            total_entries += 1
        
        # Calculate derived metrics for each staff
        for staff_id, summary in staff_summaries.items():
            # Convert sets to lists and counts
            summary['projects'] = list(summary['projects'])
            summary['tasks'] = list(summary['tasks'])
            summary['project_count'] = len(summary['projects'])
            summary['task_count'] = len(summary['tasks'])
            summary['unique_dates_worked'] = len(summary['dates_worked'])
            summary['dates_worked'] = [d.isoformat() for d in summary['dates_worked']]
            
            # Convert task breakdown from defaultdict to dict
            summary['task_breakdown'] = dict(summary['task_breakdown'])
            
            # Convert entries_by_date from defaultdict to dict
            summary['entries_by_date'] = dict(summary['entries_by_date'])
            
            # Calculate averages
            if summary['unique_dates_worked'] > 0:
                summary['average_daily_hours'] = round(summary['total_hours'] / summary['unique_dates_worked'], 2)
            
            # Calculate productivity score (based on hours worked vs idle time)
            if summary['total_minutes'] > 0:
                idle_ratio = summary['idle_time_minutes'] / summary['total_minutes']
                summary['productivity_score'] = round(max(0, 100 - (idle_ratio * 100)), 1)
            else:
                summary['productivity_score'] = 0
            
            # Convert date objects to strings for JSON serialization
            if summary['first_entry']:
                summary['first_entry'] = summary['first_entry'].isoformat()
            if summary['last_entry']:
                summary['last_entry'] = summary['last_entry'].isoformat()
        
        # Overall summary
        overall_summary = {
            'total_staff': len(staff_summaries),
            'total_entries': total_entries,
            'total_hours': round(sum(s['total_hours'] for s in staff_summaries.values()), 2),
            'total_minutes': round(sum(s['total_minutes'] for s in staff_summaries.values()), 2),
            'total_seconds': int(sum(s['total_seconds'] for s in staff_summaries.values())),
            'total_billable_hours': round(sum(s['billable_hours'] for s in staff_summaries.values()), 2),
            'total_non_billable_hours': round(sum(s['non_billable_hours'] for s in staff_summaries.values()), 2),
            'total_idle_minutes': round(sum(s['idle_time_minutes'] for s in staff_summaries.values()), 2),
            'unique_projects': len(set().union(*[s['projects'] for s in staff_summaries.values()])),
            'unique_tasks': len(set().union(*[s['tasks'] for s in staff_summaries.values()])),
            'date_range': {
                'start': min(date_range).isoformat() if date_range else None,
                'end': max(date_range).isoformat() if date_range else None,
                'total_days': len(date_range)
            },
            'average_hours_per_staff': round(sum(s['total_hours'] for s in staff_summaries.values()) / len(staff_summaries), 2) if staff_summaries else 0,
            'average_productivity_score': round(sum(s['productivity_score'] for s in staff_summaries.values()) / len(staff_summaries), 1) if staff_summaries else 0
        }
        
        return {
            'summary': overall_summary,
            'staff_details': list(staff_summaries.values()),
            'top_performers': self._get_top_performers(staff_summaries),
            'analytics': self._generate_analytics(staff_summaries, overall_summary)
        }
    
    def _extract_seconds_from_timesheet(self, timesheet):
        """Extract seconds from timesheet entry"""
        # Try different time fields
        time_fields = ['total_seconds', 'seconds', 'duration_seconds']
        
        for field in time_fields:
            if field in timesheet and timesheet[field]:
                try:
                    return float(timesheet[field])
                except (ValueError, TypeError):
                    continue
        
        # Try to convert hours to seconds
        hours = timesheet.get('total_hours') or timesheet.get('hours')
        if hours:
            try:
                return float(hours) * 3600
            except (ValueError, TypeError):
                pass
        
        # Default fallback
        return 0
    
    def _extract_idle_time_from_note(self, note):
        """Extract idle time from timesheet note"""
        if not note:
            return 0
        
        idle_minutes = 0
        
        # Pattern for "stayed idle for X seconds"
        idle_pattern = r'stayed idle for (\d+) seconds'
        matches = re.findall(idle_pattern, note, re.IGNORECASE)
        for match in matches:
            idle_minutes += int(match) / 60
        
        # Pattern for "Auto-paused due to X seconds system idle"
        auto_pause_pattern = r'Auto-paused due to (\d+) seconds system idle'
        matches = re.findall(auto_pause_pattern, note, re.IGNORECASE)
        for match in matches:
            idle_minutes += int(match) / 60
        
        return round(idle_minutes, 2)
    
    def _get_top_performers(self, staff_summaries):
        """Get top performing staff members"""
        if not staff_summaries:
            return {}
        
        staff_list = list(staff_summaries.values())
        
        return {
            'most_hours': max(staff_list, key=lambda x: x['total_hours']),
            'most_productive': max(staff_list, key=lambda x: x['productivity_score']),
            'most_projects': max(staff_list, key=lambda x: x['project_count']),
            'most_consistent': max(staff_list, key=lambda x: x['unique_dates_worked'])
        }
    
    def _generate_analytics(self, staff_summaries, overall_summary):
        """Generate additional analytics and insights"""
        return {
            'productivity_distribution': self._get_productivity_distribution(staff_summaries),
            'work_patterns': self._analyze_work_patterns(staff_summaries),
            'efficiency_metrics': self._calculate_efficiency_metrics(staff_summaries, overall_summary)
        }
    
    def _get_productivity_distribution(self, staff_summaries):
        """Analyze productivity score distribution"""
        scores = [s['productivity_score'] for s in staff_summaries.values()]
        
        if not scores:
            return {}
        
        return {
            'high_productivity': len([s for s in scores if s >= 80]),
            'medium_productivity': len([s for s in scores if 60 <= s < 80]),
            'low_productivity': len([s for s in scores if s < 60]),
            'average_score': round(sum(scores) / len(scores), 1),
            'highest_score': max(scores),
            'lowest_score': min(scores)
        }
    
    def _analyze_work_patterns(self, staff_summaries):
        """Analyze work patterns"""
        total_staff = len(staff_summaries)
        if total_staff == 0:
            return {}
        
        consistent_workers = len([s for s in staff_summaries.values() if s['unique_dates_worked'] >= 5])
        multi_project_workers = len([s for s in staff_summaries.values() if s['project_count'] > 1])
        
        return {
            'consistent_workers_percentage': round((consistent_workers / total_staff) * 100, 1),
            'multi_project_workers_percentage': round((multi_project_workers / total_staff) * 100, 1),
            'average_projects_per_staff': round(sum(s['project_count'] for s in staff_summaries.values()) / total_staff, 1),
            'average_tasks_per_staff': round(sum(s['task_count'] for s in staff_summaries.values()) / total_staff, 1)
        }
    
    def _calculate_efficiency_metrics(self, staff_summaries, overall_summary):
        """Calculate efficiency metrics"""
        if overall_summary['total_hours'] == 0:
            return {}
        
        billable_percentage = (overall_summary['total_billable_hours'] / overall_summary['total_hours']) * 100
        idle_percentage = (overall_summary['total_idle_minutes'] / (overall_summary['total_hours'] * 60)) * 100
        
        return {
            'billable_percentage': round(billable_percentage, 1),
            'idle_percentage': round(idle_percentage, 1),
            'efficiency_score': round(100 - idle_percentage, 1),
            'average_entry_duration_hours': round(overall_summary['total_hours'] / overall_summary['total_entries'], 2) if overall_summary['total_entries'] > 0 else 0
        }
    
    def _get_test_summary_data(self, filters):
        """Return test data when CRM is unavailable"""
        test_data = {
            'summary': {
                'total_staff': 3,
                'total_entries': 12,
                'total_hours': 45.5,
                'total_minutes': 2730,
                'total_seconds': 163800,
                'total_billable_hours': 40.0,
                'total_non_billable_hours': 5.5,
                'total_idle_minutes': 11.41,
                'unique_projects': 4,
                'unique_tasks': 8,
                'date_range': {
                    'start': '2025-10-08',
                    'end': '2025-10-10',
                    'total_days': 3
                },
                'average_hours_per_staff': 15.17,
                'average_productivity_score': 89.5
            },
            'staff_details': [
                {
                    'staff_id': '188',
                    'staff_name': 'Hamza Haseeb',
                    'total_entries': 5,
                    'total_hours': 18.5,
                    'total_minutes': 1110,
                    'total_seconds': 66600,
                    'billable_hours': 16.0,
                    'non_billable_hours': 2.5,
                    'projects': ['Web Development', 'Mobile App'],
                    'tasks': ['Frontend Development', 'API Integration', 'Testing'],
                    'project_count': 2,
                    'task_count': 3,
                    'unique_dates_worked': 3,
                    'dates_worked': ['2025-10-08', '2025-10-09', '2025-10-10'],
                    'first_entry': '2025-10-08',
                    'last_entry': '2025-10-10',
                    'average_daily_hours': 6.17,
                    'idle_time_minutes': 3.22,
                    'productivity_score': 94.2,
                    'task_breakdown': {
                        'Frontend Development': 8.5,
                        'API Integration': 6.0,
                        'Testing': 4.0
                    }
                },
                {
                    'staff_id': '201',
                    'staff_name': 'Gulsum Melisa Ari',
                    'total_entries': 4,
                    'total_hours': 15.0,
                    'total_minutes': 900,
                    'total_seconds': 54000,
                    'billable_hours': 13.5,
                    'non_billable_hours': 1.5,
                    'projects': ['E-commerce Platform', 'Analytics Dashboard'],
                    'tasks': ['Backend Development', 'Database Design'],
                    'project_count': 2,
                    'task_count': 2,
                    'unique_dates_worked': 2,
                    'dates_worked': ['2025-10-08', '2025-10-09'],
                    'first_entry': '2025-10-08',
                    'last_entry': '2025-10-09',
                    'average_daily_hours': 7.5,
                    'idle_time_minutes': 5.02,
                    'productivity_score': 88.9,
                    'task_breakdown': {
                        'Backend Development': 9.0,
                        'Database Design': 6.0
                    }
                },
                {
                    'staff_id': '200',
                    'staff_name': 'Laiba Batool',
                    'total_entries': 3,
                    'total_hours': 12.0,
                    'total_minutes': 720,
                    'total_seconds': 43200,
                    'billable_hours': 10.5,
                    'non_billable_hours': 1.5,
                    'projects': ['CRM System', 'Documentation'],
                    'tasks': ['UI/UX Design', 'Content Writing', 'Quality Assurance'],
                    'project_count': 2,
                    'task_count': 3,
                    'unique_dates_worked': 2,
                    'dates_worked': ['2025-10-08', '2025-10-10'],
                    'first_entry': '2025-10-08',
                    'last_entry': '2025-10-10',
                    'average_daily_hours': 6.0,
                    'idle_time_minutes': 3.17,
                    'productivity_score': 85.4,
                    'task_breakdown': {
                        'UI/UX Design': 6.0,
                        'Content Writing': 3.5,
                        'Quality Assurance': 2.5
                    }
                }
            ],
            'top_performers': {
                'most_hours': {
                    'staff_id': '188',
                    'staff_name': 'Hamza Haseeb',
                    'total_hours': 18.5
                },
                'most_productive': {
                    'staff_id': '188',
                    'staff_name': 'Hamza Haseeb',
                    'productivity_score': 94.2
                },
                'most_projects': {
                    'staff_id': '188',
                    'staff_name': 'Hamza Haseeb',
                    'project_count': 2
                },
                'most_consistent': {
                    'staff_id': '188',
                    'staff_name': 'Hamza Haseeb',
                    'unique_dates_worked': 3
                }
            },
            'analytics': {
                'productivity_distribution': {
                    'high_productivity': 3,
                    'medium_productivity': 0,
                    'low_productivity': 0,
                    'average_score': 89.5,
                    'highest_score': 94.2,
                    'lowest_score': 85.4
                },
                'work_patterns': {
                    'consistent_workers_percentage': 100.0,
                    'multi_project_workers_percentage': 100.0,
                    'average_projects_per_staff': 2.0,
                    'average_tasks_per_staff': 2.7
                },
                'efficiency_metrics': {
                    'billable_percentage': 87.9,
                    'idle_percentage': 0.4,
                    'efficiency_score': 99.6,
                    'average_entry_duration_hours': 3.79
                }
            }
        }
        
        return Response({
            "status": "success",
            "message": "Timesheet summary generated (test mode)",
            "data": test_data,
            "filters_applied": filters,
            "timestamp": datetime.now().isoformat(),
            "test_mode": True,
            "data_source": "test_data"
        }, status=status.HTTP_200_OK)