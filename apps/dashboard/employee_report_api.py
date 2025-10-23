"""
Employee Report API
Provides detailed individual employee reports with comprehensive analytics
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


class EmployeeReportAPIView(APIView):
    """
    API endpoint to get detailed individual employee reports
    
    GET /api/employee_report/
    Query parameters:
    - staff_id: Required - specific staff ID to get report for
    - start_date: Start date filter (YYYY-MM-DD)
    - end_date: End date filter (YYYY-MM-DD)
    - period: Predefined period (today, yesterday, this_week, last_week, this_month, last_month)
    - include_screenshots: Include screenshot analysis (true/false)
    - include_tasks: Include detailed task breakdown (true/false)
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.credentials_manager = CredentialsManager()
        self.crm_credentials = self.credentials_manager.get_crm_credentials()
    
    def get(self, request):
        """Handle GET request for employee report"""
        try:
            # Get query parameters
            staff_id = request.query_params.get('staff_id')
            if not staff_id:
                return Response({
                    "status": "error",
                    "message": "staff_id parameter is required",
                    "data": None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            filters = self._extract_filters(request)
            filters['staff_id'] = staff_id
            
            logger.info(f"Generating employee report for staff_id: {staff_id} with filters: {filters}")
            
            # Fetch comprehensive data
            report_data = self._generate_employee_report(staff_id, filters)
            
            return Response({
                "status": "success",
                "message": f"Employee report generated for staff ID: {staff_id}",
                "data": report_data,
                "filters_applied": filters,
                "timestamp": datetime.now().isoformat(),
                "test_mode": report_data.get('test_mode', True),
                "data_source": report_data.get('data_source', 'test_data')
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating employee report: {str(e)}")
            # Initialize filters if exception occurred during filter extraction
            if 'filters' not in locals():
                filters = {'staff_id': staff_id}
            return self._get_test_employee_report(staff_id, filters)
    
    def _extract_filters(self, request):
        """Extract and validate query parameters"""
        filters = {
            'start_date': request.query_params.get('start_date'),
            'end_date': request.query_params.get('end_date'),
            'period': request.query_params.get('period'),
            'include_screenshots': request.query_params.get('include_screenshots', 'false').lower() == 'true',
            'include_tasks': request.query_params.get('include_tasks', 'true').lower() == 'true'
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
    
    def _generate_employee_report(self, staff_id, filters):
        """Generate comprehensive employee report"""
        try:
            # Fetch data from multiple sources
            timesheet_data = self._fetch_timesheet_data(staff_id, filters)
            
            if not timesheet_data['success']:
                return self._get_test_employee_report_data(staff_id, filters)
            
            # Process the data
            timesheets = timesheet_data['data']
            
            # Generate comprehensive report
            report = self._build_comprehensive_report(staff_id, timesheets, filters)
            
            return report
            
        except Exception as e:
            logger.error(f"Error in employee report generation: {str(e)}")
            return self._get_test_employee_report_data(staff_id, filters)
    
    def _fetch_timesheet_data(self, staff_id, filters):
        """Fetch timesheet data for specific employee"""
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
            
            # Add staff filter if supported by API
            params = {}
            if filters.get('start_date'):
                params['start_date'] = filters['start_date'].isoformat()
            if filters.get('end_date'):
                params['end_date'] = filters['end_date'].isoformat()
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                all_timesheets = data if isinstance(data, list) else data.get('data', [])
                
                # Filter by staff_id
                staff_timesheets = [t for t in all_timesheets if str(t.get('staff_id', '')) == str(staff_id)]
                
                return {"success": True, "data": staff_timesheets}
            else:
                return {"success": False, "data": [], "error": f"API returned {response.status_code}"}
                
        except Exception as e:
            logger.error(f"Error fetching timesheet data: {str(e)}")
            return {"success": False, "data": [], "error": str(e)}
    
    def _build_comprehensive_report(self, staff_id, timesheets, filters):
        """Build comprehensive employee report"""
        # Basic information
        staff_info = self._extract_staff_info(staff_id, timesheets)
        
        # Time analysis
        time_analysis = self._analyze_time_data(timesheets)
        
        # Project and task breakdown
        project_analysis = self._analyze_projects_and_tasks(timesheets)
        
        # Productivity analysis
        productivity_analysis = self._analyze_productivity(timesheets)
        
        # Work patterns
        work_patterns = self._analyze_work_patterns(timesheets)
        
        # Performance metrics
        performance_metrics = self._calculate_performance_metrics(timesheets, time_analysis)
        
        # Recommendations
        recommendations = self._generate_recommendations(time_analysis, productivity_analysis, work_patterns)
        
        # Daily breakdown
        daily_breakdown = self._generate_daily_breakdown(timesheets)
        
        # Build final report
        report = {
            'employee_info': staff_info,
            'time_analysis': time_analysis,
            'project_analysis': project_analysis,
            'productivity_analysis': productivity_analysis,
            'work_patterns': work_patterns,
            'performance_metrics': performance_metrics,
            'daily_breakdown': daily_breakdown,
            'recommendations': recommendations,
            'report_period': {
                'start_date': filters['start_date'].isoformat() if filters['start_date'] else None,
                'end_date': filters['end_date'].isoformat() if filters['end_date'] else None,
                'period_type': filters.get('period', 'custom')
            },
            'test_mode': False,
            'data_source': 'crm_api'
        }
        
        return report
    
    def _extract_staff_info(self, staff_id, timesheets):
        """Extract basic staff information"""
        if not timesheets:
            return {
                'staff_id': staff_id,
                'staff_name': 'Unknown',
                'email': None,
                'department': None,
                'role': None
            }
        
        # Get info from first timesheet entry
        first_entry = timesheets[0]
        
        return {
            'staff_id': staff_id,
            'staff_name': first_entry.get('staff_name', 'Unknown'),
            'email': first_entry.get('staff_email'),
            'department': first_entry.get('department'),
            'role': first_entry.get('role', 'Staff Member'),
            'total_entries': len(timesheets)
        }
    
    def _analyze_time_data(self, timesheets):
        """Analyze time-related data"""
        total_hours = 0
        total_minutes = 0
        total_seconds = 0
        billable_hours = 0
        non_billable_hours = 0
        idle_minutes = 0
        
        for timesheet in timesheets:
            hours = float(timesheet.get('total_hours', 0) or timesheet.get('hours', 0) or 0)
            seconds = self._extract_seconds_from_timesheet(timesheet)
            minutes = seconds / 60 if seconds else hours * 60
            
            total_hours += hours
            total_minutes += minutes
            total_seconds += seconds
            
            if timesheet.get('billable', True):
                billable_hours += hours
            else:
                non_billable_hours += hours
            
            # Extract idle time
            idle_minutes += self._extract_idle_time_from_note(timesheet.get('note', ''))
        
        return {
            'total_hours': round(total_hours, 2),
            'total_minutes': round(total_minutes, 2),
            'total_seconds': int(total_seconds),
            'billable_hours': round(billable_hours, 2),
            'non_billable_hours': round(non_billable_hours, 2),
            'idle_minutes': round(idle_minutes, 2),
            'billable_percentage': round((billable_hours / total_hours) * 100, 1) if total_hours > 0 else 0,
            'idle_percentage': round((idle_minutes / total_minutes) * 100, 1) if total_minutes > 0 else 0,
            'productive_hours': round(total_hours - (idle_minutes / 60), 2),
            'average_session_hours': round(total_hours / len(timesheets), 2) if timesheets else 0
        }
    
    def _analyze_projects_and_tasks(self, timesheets):
        """Analyze projects and tasks"""
        project_breakdown = defaultdict(lambda: {
            'total_hours': 0,
            'total_entries': 0,
            'tasks': defaultdict(float),
            'billable_hours': 0,
            'non_billable_hours': 0
        })
        
        task_breakdown = defaultdict(lambda: {
            'total_hours': 0,
            'total_entries': 0,
            'projects': set(),
            'billable_hours': 0,
            'non_billable_hours': 0
        })
        
        for timesheet in timesheets:
            project = timesheet.get('project_name', 'No Project')
            task = timesheet.get('task_name', 'No Task')
            hours = float(timesheet.get('total_hours', 0) or timesheet.get('hours', 0) or 0)
            is_billable = timesheet.get('billable', True)
            
            # Project analysis
            project_breakdown[project]['total_hours'] += hours
            project_breakdown[project]['total_entries'] += 1
            project_breakdown[project]['tasks'][task] += hours
            
            if is_billable:
                project_breakdown[project]['billable_hours'] += hours
            else:
                project_breakdown[project]['non_billable_hours'] += hours
            
            # Task analysis
            task_breakdown[task]['total_hours'] += hours
            task_breakdown[task]['total_entries'] += 1
            task_breakdown[task]['projects'].add(project)
            
            if is_billable:
                task_breakdown[task]['billable_hours'] += hours
            else:
                task_breakdown[task]['non_billable_hours'] += hours
        
        # Convert to regular dict and format
        formatted_projects = {}
        for project, data in project_breakdown.items():
            formatted_projects[project] = {
                'total_hours': round(data['total_hours'], 2),
                'total_entries': data['total_entries'],
                'tasks': dict(data['tasks']),
                'billable_hours': round(data['billable_hours'], 2),
                'non_billable_hours': round(data['non_billable_hours'], 2),
                'billable_percentage': round((data['billable_hours'] / data['total_hours']) * 100, 1) if data['total_hours'] > 0 else 0
            }
        
        formatted_tasks = {}
        for task, data in task_breakdown.items():
            formatted_tasks[task] = {
                'total_hours': round(data['total_hours'], 2),
                'total_entries': data['total_entries'],
                'projects': list(data['projects']),
                'billable_hours': round(data['billable_hours'], 2),
                'non_billable_hours': round(data['non_billable_hours'], 2),
                'billable_percentage': round((data['billable_hours'] / data['total_hours']) * 100, 1) if data['total_hours'] > 0 else 0
            }
        
        return {
            'total_projects': len(formatted_projects),
            'total_tasks': len(formatted_tasks),
            'project_breakdown': formatted_projects,
            'task_breakdown': formatted_tasks,
            'most_worked_project': max(formatted_projects.items(), key=lambda x: x[1]['total_hours']) if formatted_projects else None,
            'most_worked_task': max(formatted_tasks.items(), key=lambda x: x[1]['total_hours']) if formatted_tasks else None
        }
    
    def _analyze_productivity(self, timesheets):
        """Analyze productivity metrics"""
        productive_entries = 0
        total_idle_time = 0
        total_work_time = 0
        
        for timesheet in timesheets:
            hours = float(timesheet.get('total_hours', 0) or timesheet.get('hours', 0) or 0)
            idle_minutes = self._extract_idle_time_from_note(timesheet.get('note', ''))
            
            total_work_time += hours * 60  # Convert to minutes
            total_idle_time += idle_minutes
            
            # Consider entry productive if idle time is less than 10% of work time
            if hours > 0 and (idle_minutes / (hours * 60)) < 0.1:
                productive_entries += 1
        
        total_entries = len(timesheets)
        productivity_score = 0
        
        if total_work_time > 0:
            idle_ratio = total_idle_time / total_work_time
            productivity_score = max(0, 100 - (idle_ratio * 100))
        
        return {
            'productivity_score': round(productivity_score, 1),
            'productive_entries': productive_entries,
            'total_entries': total_entries,
            'productive_entry_percentage': round((productive_entries / total_entries) * 100, 1) if total_entries > 0 else 0,
            'total_idle_minutes': round(total_idle_time, 2),
            'total_work_minutes': round(total_work_time, 2),
            'idle_to_work_ratio': round(total_idle_time / total_work_time, 3) if total_work_time > 0 else 0,
            'efficiency_rating': self._get_efficiency_rating(productivity_score)
        }
    
    def _get_efficiency_rating(self, score):
        """Get efficiency rating based on productivity score"""
        if score >= 90:
            return "Excellent"
        elif score >= 80:
            return "Very Good"
        elif score >= 70:
            return "Good"
        elif score >= 60:
            return "Average"
        else:
            return "Needs Improvement"
    
    def _analyze_work_patterns(self, timesheets):
        """Analyze work patterns and habits"""
        dates_worked = set()
        daily_hours = defaultdict(float)
        hourly_distribution = defaultdict(int)
        weekly_pattern = defaultdict(float)
        
        for timesheet in timesheets:
            entry_date = self._parse_timesheet_date(timesheet)
            if entry_date:
                dates_worked.add(entry_date)
                hours = float(timesheet.get('total_hours', 0) or timesheet.get('hours', 0) or 0)
                daily_hours[entry_date.isoformat()] += hours
                
                # Weekly pattern (Monday = 0, Sunday = 6)
                weekday = entry_date.weekday()
                weekly_pattern[weekday] += hours
                
                # Try to extract hour from start_time for hourly distribution
                start_time = timesheet.get('start_time', '')
                if start_time:
                    try:
                        hour = datetime.strptime(start_time[:10] + ' ' + start_time[11:16], '%Y-%m-%d %H:%M').hour
                        hourly_distribution[hour] += 1
                    except:
                        pass
        
        # Calculate patterns
        total_days = len(dates_worked)
        total_hours = sum(daily_hours.values())
        
        # Convert weekly pattern to day names
        weekday_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_breakdown = {}
        for day_num, hours in weekly_pattern.items():
            if day_num < len(weekday_names):
                weekly_breakdown[weekday_names[day_num]] = round(hours, 2)
        
        return {
            'total_days_worked': total_days,
            'average_daily_hours': round(total_hours / total_days, 2) if total_days > 0 else 0,
            'most_productive_day': max(daily_hours.items(), key=lambda x: x[1]) if daily_hours else None,
            'daily_hours_breakdown': dict(daily_hours),
            'weekly_pattern': weekly_breakdown,
            'hourly_distribution': dict(hourly_distribution),
            'consistency_score': self._calculate_consistency_score(list(daily_hours.values())),
            'work_span': {
                'first_day': min(dates_worked).isoformat() if dates_worked else None,
                'last_day': max(dates_worked).isoformat() if dates_worked else None,
                'total_span_days': (max(dates_worked) - min(dates_worked)).days + 1 if len(dates_worked) > 1 else 1
            }
        }
    
    def _calculate_consistency_score(self, daily_hours_list):
        """Calculate work consistency score based on daily hour variations"""
        if len(daily_hours_list) < 2:
            return 100.0
        
        avg_hours = sum(daily_hours_list) / len(daily_hours_list)
        variance = sum((h - avg_hours) ** 2 for h in daily_hours_list) / len(daily_hours_list)
        std_dev = variance ** 0.5
        
        # Lower standard deviation = higher consistency
        # Normalize to 0-100 scale
        if avg_hours > 0:
            coefficient_of_variation = std_dev / avg_hours
            consistency_score = max(0, 100 - (coefficient_of_variation * 100))
        else:
            consistency_score = 0
        
        return round(consistency_score, 1)
    
    def _calculate_performance_metrics(self, timesheets, time_analysis):
        """Calculate comprehensive performance metrics"""
        total_entries = len(timesheets)
        
        if total_entries == 0:
            return {}
        
        # Quality metrics
        quality_score = 0
        if time_analysis['total_hours'] > 0:
            billable_ratio = time_analysis['billable_hours'] / time_analysis['total_hours']
            idle_impact = 1 - (time_analysis['idle_minutes'] / (time_analysis['total_hours'] * 60))
            quality_score = (billable_ratio * 0.6 + idle_impact * 0.4) * 100
        
        # Reliability metrics
        dates_with_entries = len(set(self._parse_timesheet_date(t) for t in timesheets if self._parse_timesheet_date(t)))
        
        return {
            'overall_performance_score': round((quality_score + time_analysis.get('productivity_score', 0)) / 2, 1),
            'quality_score': round(quality_score, 1),
            'reliability_score': round((dates_with_entries / 30) * 100, 1),  # Assuming 30-day period
            'efficiency_metrics': {
                'hours_per_entry': round(time_analysis['total_hours'] / total_entries, 2),
                'billable_efficiency': round(time_analysis['billable_percentage'], 1),
                'time_utilization': round(100 - time_analysis['idle_percentage'], 1)
            },
            'performance_trends': self._analyze_performance_trends(timesheets),
            'strengths': self._identify_strengths(time_analysis, timesheets),
            'areas_for_improvement': self._identify_improvement_areas(time_analysis, timesheets)
        }
    
    def _analyze_performance_trends(self, timesheets):
        """Analyze performance trends over time"""
        # Group by date and calculate daily metrics
        daily_metrics = defaultdict(lambda: {'hours': 0, 'idle_minutes': 0, 'entries': 0})
        
        for timesheet in timesheets:
            entry_date = self._parse_timesheet_date(timesheet)
            if entry_date:
                date_str = entry_date.isoformat()
                hours = float(timesheet.get('total_hours', 0) or timesheet.get('hours', 0) or 0)
                idle_minutes = self._extract_idle_time_from_note(timesheet.get('note', ''))
                
                daily_metrics[date_str]['hours'] += hours
                daily_metrics[date_str]['idle_minutes'] += idle_minutes
                daily_metrics[date_str]['entries'] += 1
        
        # Calculate trends
        sorted_dates = sorted(daily_metrics.keys())
        if len(sorted_dates) >= 2:
            # Compare first half vs second half
            mid_point = len(sorted_dates) // 2
            first_half = sorted_dates[:mid_point]
            second_half = sorted_dates[mid_point:]
            
            first_half_avg = sum(daily_metrics[d]['hours'] for d in first_half) / len(first_half)
            second_half_avg = sum(daily_metrics[d]['hours'] for d in second_half) / len(second_half)
            
            trend = "improving" if second_half_avg > first_half_avg else "declining" if second_half_avg < first_half_avg else "stable"
            
            return {
                'trend': trend,
                'improvement_percentage': round(((second_half_avg - first_half_avg) / first_half_avg) * 100, 1) if first_half_avg > 0 else 0,
                'daily_average_first_half': round(first_half_avg, 2),
                'daily_average_second_half': round(second_half_avg, 2)
            }
        
        return {'trend': 'insufficient_data'}
    
    def _identify_strengths(self, time_analysis, timesheets):
        """Identify employee strengths"""
        strengths = []
        
        if time_analysis['billable_percentage'] >= 85:
            strengths.append("High billable work percentage")
        
        if time_analysis['idle_percentage'] <= 5:
            strengths.append("Excellent time utilization")
        
        if time_analysis['average_session_hours'] >= 4:
            strengths.append("Consistent long work sessions")
        
        if len(timesheets) >= 20:  # Assuming monthly report
            strengths.append("Regular and consistent logging")
        
        # Check project diversity
        projects = set(t.get('project_name') for t in timesheets if t.get('project_name'))
        if len(projects) >= 3:
            strengths.append("Multi-project capability")
        
        return strengths
    
    def _identify_improvement_areas(self, time_analysis, timesheets):
        """Identify areas for improvement"""
        improvements = []
        
        if time_analysis['idle_percentage'] > 15:
            improvements.append("Reduce idle time during work sessions")
        
        if time_analysis['billable_percentage'] < 70:
            improvements.append("Increase focus on billable activities")
        
        if time_analysis['average_session_hours'] < 2:
            improvements.append("Consider longer, more focused work sessions")
        
        if len(timesheets) < 10:  # Assuming monthly report
            improvements.append("More consistent time logging")
        
        # Check for task switching
        task_switches = 0
        prev_task = None
        for timesheet in sorted(timesheets, key=lambda x: x.get('start_time', '')):
            current_task = timesheet.get('task_name')
            if prev_task and current_task != prev_task:
                task_switches += 1
            prev_task = current_task
        
        if task_switches > len(timesheets) * 0.7:  # More than 70% of entries are task switches
            improvements.append("Reduce task switching for better focus")
        
        return improvements
    
    def _generate_recommendations(self, time_analysis, productivity_analysis, work_patterns):
        """Generate actionable recommendations"""
        recommendations = []
        
        # Time management recommendations
        if time_analysis['idle_percentage'] > 10:
            recommendations.append({
                'category': 'Time Management',
                'priority': 'High',
                'recommendation': 'Implement time blocking techniques to reduce idle time',
                'expected_impact': 'Could improve productivity by 15-25%'
            })
        
        # Work schedule recommendations
        if work_patterns['consistency_score'] < 70:
            recommendations.append({
                'category': 'Work Schedule',
                'priority': 'Medium',
                'recommendation': 'Establish more consistent daily work hours',
                'expected_impact': 'Better work-life balance and predictable output'
            })
        
        # Focus recommendations
        if productivity_analysis['productive_entry_percentage'] < 80:
            recommendations.append({
                'category': 'Focus & Concentration',
                'priority': 'High',
                'recommendation': 'Use Pomodoro technique or similar focus methods',
                'expected_impact': 'Increase productive work sessions by 20-30%'
            })
        
        # Billing recommendations
        if time_analysis['billable_percentage'] < 80:
            recommendations.append({
                'category': 'Billing Efficiency',
                'priority': 'Medium',
                'recommendation': 'Review and optimize billable vs non-billable activities',
                'expected_impact': 'Potential revenue increase of 10-20%'
            })
        
        return recommendations
    
    def _generate_daily_breakdown(self, timesheets):
        """Generate detailed daily breakdown"""
        daily_data = defaultdict(lambda: {
            'total_hours': 0,
            'total_entries': 0,
            'projects': set(),
            'tasks': set(),
            'billable_hours': 0,
            'idle_minutes': 0,
            'entries': []
        })
        
        for timesheet in timesheets:
            entry_date = self._parse_timesheet_date(timesheet)
            if entry_date:
                date_str = entry_date.isoformat()
                hours = float(timesheet.get('total_hours', 0) or timesheet.get('hours', 0) or 0)
                idle_minutes = self._extract_idle_time_from_note(timesheet.get('note', ''))
                
                daily_data[date_str]['total_hours'] += hours
                daily_data[date_str]['total_entries'] += 1
                daily_data[date_str]['idle_minutes'] += idle_minutes
                
                if timesheet.get('project_name'):
                    daily_data[date_str]['projects'].add(timesheet['project_name'])
                
                if timesheet.get('task_name'):
                    daily_data[date_str]['tasks'].add(timesheet['task_name'])
                
                if timesheet.get('billable', True):
                    daily_data[date_str]['billable_hours'] += hours
                
                daily_data[date_str]['entries'].append({
                    'start_time': timesheet.get('start_time'),
                    'end_time': timesheet.get('end_time'),
                    'project': timesheet.get('project_name'),
                    'task': timesheet.get('task_name'),
                    'hours': hours,
                    'billable': timesheet.get('billable', True),
                    'note': timesheet.get('note', '')
                })
        
        # Format the daily data
        formatted_daily = {}
        for date, data in daily_data.items():
            formatted_daily[date] = {
                'total_hours': round(data['total_hours'], 2),
                'total_entries': data['total_entries'],
                'projects': list(data['projects']),
                'tasks': list(data['tasks']),
                'billable_hours': round(data['billable_hours'], 2),
                'idle_minutes': round(data['idle_minutes'], 2),
                'productivity_score': round(100 - (data['idle_minutes'] / (data['total_hours'] * 60)) * 100, 1) if data['total_hours'] > 0 else 0,
                'entries': data['entries']
            }
        
        return formatted_daily
    
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
    
    def _parse_timesheet_date(self, timesheet):
        """Parse date from timesheet entry"""
        date_fields = ['date', 'start_date', 'created_at', 'start_time']
        
        for field in date_fields:
            if field in timesheet and timesheet[field]:
                try:
                    date_str = str(timesheet[field])
                    if len(date_str) >= 10:
                        return datetime.strptime(date_str[:10], '%Y-%m-%d').date()
                except (ValueError, AttributeError):
                    continue
        
        return None
    
    def _get_test_employee_report(self, staff_id, filters):
        """Return test employee report data"""
        return Response({
            "status": "success",
            "message": f"Employee report generated (test mode) for staff ID: {staff_id}",
            "data": self._get_test_employee_report_data(staff_id, filters),
            "filters_applied": filters,
            "timestamp": datetime.now().isoformat(),
            "test_mode": True,
            "data_source": "test_data"
        }, status=status.HTTP_200_OK)
    
    def _get_test_employee_report_data(self, staff_id, filters):
        """Generate test employee report data"""
        # Different test data based on staff_id
        if staff_id == '188':
            staff_name = 'Hamza Haseeb'
            performance_score = 94.2
            total_hours = 18.5
            productivity_score = 94.2
            idle_minutes = 3.22
        elif staff_id == '201':
            staff_name = 'Gulsum Melisa Ari'
            performance_score = 88.9
            total_hours = 15.0
            productivity_score = 88.9
            idle_minutes = 5.02
        else:
            staff_name = 'Laiba Batool'
            performance_score = 85.4
            total_hours = 12.0
            productivity_score = 85.4
            idle_minutes = 3.17
        
        return {
            'employee_info': {
                'staff_id': staff_id,
                'staff_name': staff_name,
                'email': f'{staff_name.lower().replace(" ", ".")}@company.com',
                'department': 'Engineering',
                'role': 'Software Developer',
                'total_entries': 5
            },
            'time_analysis': {
                'total_hours': total_hours,
                'total_minutes': total_hours * 60,
                'total_seconds': int(total_hours * 3600),
                'billable_hours': round(total_hours * 0.85, 2),
                'non_billable_hours': round(total_hours * 0.15, 2),
                'idle_minutes': idle_minutes,
                'billable_percentage': 85.0,
                'idle_percentage': round((idle_minutes / (total_hours * 60)) * 100, 1),
                'productive_hours': round(total_hours - (idle_minutes / 60), 2),
                'average_session_hours': round(total_hours / 5, 2)
            },
            'project_analysis': {
                'total_projects': 2,
                'total_tasks': 3,
                'project_breakdown': {
                    'Web Development': {
                        'total_hours': round(total_hours * 0.6, 2),
                        'total_entries': 3,
                        'billable_hours': round(total_hours * 0.5, 2),
                        'billable_percentage': 83.3
                    },
                    'Mobile App': {
                        'total_hours': round(total_hours * 0.4, 2),
                        'total_entries': 2,
                        'billable_hours': round(total_hours * 0.35, 2),
                        'billable_percentage': 87.5
                    }
                },
                'task_breakdown': {
                    'Frontend Development': {
                        'total_hours': round(total_hours * 0.4, 2),
                        'projects': ['Web Development']
                    },
                    'API Integration': {
                        'total_hours': round(total_hours * 0.35, 2),
                        'projects': ['Web Development', 'Mobile App']
                    },
                    'Testing': {
                        'total_hours': round(total_hours * 0.25, 2),
                        'projects': ['Mobile App']
                    }
                }
            },
            'productivity_analysis': {
                'productivity_score': productivity_score,
                'productive_entries': 4,
                'total_entries': 5,
                'productive_entry_percentage': 80.0,
                'total_idle_minutes': idle_minutes,
                'efficiency_rating': 'Excellent' if productivity_score >= 90 else 'Very Good'
            },
            'work_patterns': {
                'total_days_worked': 3,
                'average_daily_hours': round(total_hours / 3, 2),
                'consistency_score': 85.5,
                'weekly_pattern': {
                    'Monday': round(total_hours * 0.3, 2),
                    'Tuesday': round(total_hours * 0.4, 2),
                    'Wednesday': round(total_hours * 0.3, 2)
                }
            },
            'performance_metrics': {
                'overall_performance_score': performance_score,
                'quality_score': round(performance_score * 0.95, 1),
                'reliability_score': 90.0,
                'strengths': [
                    'High billable work percentage',
                    'Excellent time utilization',
                    'Consistent long work sessions'
                ],
                'areas_for_improvement': [
                    'Consider longer, more focused work sessions'
                ]
            },
            'daily_breakdown': {
                '2025-10-08': {
                    'total_hours': round(total_hours * 0.3, 2),
                    'total_entries': 2,
                    'projects': ['Web Development'],
                    'productivity_score': 92.5
                },
                '2025-10-09': {
                    'total_hours': round(total_hours * 0.4, 2),
                    'total_entries': 2,
                    'projects': ['Web Development', 'Mobile App'],
                    'productivity_score': 95.0
                },
                '2025-10-10': {
                    'total_hours': round(total_hours * 0.3, 2),
                    'total_entries': 1,
                    'projects': ['Mobile App'],
                    'productivity_score': 88.5
                }
            },
            'recommendations': [
                {
                    'category': 'Time Management',
                    'priority': 'Medium',
                    'recommendation': 'Continue current excellent time management practices',
                    'expected_impact': 'Maintain high productivity levels'
                },
                {
                    'category': 'Focus & Concentration',
                    'priority': 'Low',
                    'recommendation': 'Consider implementing deep work blocks for complex tasks',
                    'expected_impact': 'Potential 5-10% improvement in complex problem solving'
                }
            ],
            'report_period': {
                'start_date': filters['start_date'].isoformat() if filters['start_date'] else '2025-10-08',
                'end_date': filters['end_date'].isoformat() if filters['end_date'] else '2025-10-10',
                'period_type': filters.get('period', 'custom')
            },
            'test_mode': True,
            'data_source': 'test_data'
        }