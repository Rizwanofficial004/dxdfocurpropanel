"""
Enhanced Date Range Logs API - Advanced filtering and date range capabilities
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from .s3_logs_service import S3UserLogsService
import logging

logger = logging.getLogger(__name__)


class DateRangeLogsAPIView(APIView):
    """
    Enhanced API View for retrieving user logs with advanced date range filtering
    GET: Get user logs with comprehensive date range and filtering options
    """
    authentication_classes = []  # Remove if authentication required
    permission_classes = []       # Remove if permissions required
    
    def get(self, request):
        """
        Get user logs with advanced date range filtering
        
        Query Parameters:
        - user_email: Filter by specific user email
        - start_date: Start date (YYYY-MM-DD) - required
        - end_date: End date (YYYY-MM-DD) - required
        - log_type: Filter by log type (activity, timer, error, etc.)
        - time_range: Predefined time ranges (today, yesterday, last_7_days, last_30_days, this_month, last_month)
        - group_by: Group results by (date, user, log_type, project)
        - limit: Maximum number of log files to return (default: 100)
        - sort_by: Sort by field (date, size, user, project) - default: date
        - sort_order: asc or desc (default: desc)
        - include_content: Include log file content preview (true/false, default: false)
        - file_type: Filter by file type (json, csv, txt, log)
        - project: Filter by project name
        - min_size: Minimum file size in MB
        - max_size: Maximum file size in MB
        """
        try:
            # Get and validate date parameters
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            time_range = request.GET.get('time_range')
            
            # Handle predefined time ranges
            if time_range:
                start_date, end_date = self._get_time_range_dates(time_range)
            
            # Validate date parameters
            if not start_date or not end_date:
                return Response({
                    "status": "error",
                    "message": "start_date and end_date are required, or use time_range parameter",
                    "available_time_ranges": ["today", "yesterday", "last_7_days", "last_30_days", "this_month", "last_month"],
                    "data": None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate date format
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                
                if start_dt > end_dt:
                    return Response({
                        "status": "error",
                        "message": "start_date cannot be later than end_date",
                        "data": None
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
                # Check for reasonable date range (max 1 year)
                if (end_dt - start_dt).days > 365:
                    return Response({
                        "status": "error",
                        "message": "Date range cannot exceed 365 days",
                        "data": None
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except ValueError:
                return Response({
                    "status": "error",
                    "message": "Invalid date format. Use YYYY-MM-DD",
                    "data": None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get other parameters
            user_email = request.GET.get('user_email')
            log_type = request.GET.get('log_type')
            group_by = request.GET.get('group_by')
            limit = int(request.GET.get('limit', '100'))
            sort_by = request.GET.get('sort_by', 'date')
            sort_order = request.GET.get('sort_order', 'desc')
            include_content = request.GET.get('include_content', 'false').lower() == 'true'
            file_type = request.GET.get('file_type')
            project = request.GET.get('project')
            min_size = request.GET.get('min_size')
            max_size = request.GET.get('max_size')
            
            # Validate limit
            if limit > 1000:
                limit = 1000
            
            # Initialize S3 service
            logs_service = S3UserLogsService()
            
            # Get logs with date range
            logs = logs_service.get_user_logs(
                user_email=user_email,
                log_type=log_type,
                start_date=start_date,
                end_date=end_date,
                limit=limit * 2  # Get more logs for additional filtering
            )
            
            # Apply additional filters
            filtered_logs = self._apply_advanced_filters(
                logs, file_type, project, min_size, max_size
            )
            
            # Sort logs
            sorted_logs = self._sort_logs(filtered_logs, sort_by, sort_order)
            
            # Apply limit after filtering and sorting
            final_logs = sorted_logs[:limit]
            
            # Include content preview if requested
            if include_content:
                final_logs = self._add_content_preview(final_logs, logs_service)
            
            # Group results if requested
            grouped_data = None
            if group_by:
                grouped_data = self._group_logs(final_logs, group_by)
            
            # Calculate statistics
            stats = self._calculate_date_range_stats(filtered_logs, start_date, end_date)
            
            # Prepare response
            response_data = {
                "status": "success",
                "message": f"Retrieved {len(final_logs)} log files for date range {start_date} to {end_date}",
                "data": {
                    "logs": final_logs,
                    "grouped_data": grouped_data,
                    "statistics": stats,
                    "total_count": len(filtered_logs),
                    "returned_count": len(final_logs),
                    "filters_applied": {
                        "start_date": start_date,
                        "end_date": end_date,
                        "user_email": user_email,
                        "log_type": log_type,
                        "file_type": file_type,
                        "project": project,
                        "min_size_mb": min_size,
                        "max_size_mb": max_size,
                        "sort_by": sort_by,
                        "sort_order": sort_order,
                        "group_by": group_by,
                        "limit": limit
                    },
                    "date_range_info": {
                        "days_covered": (end_dt - start_dt).days + 1,
                        "time_range_used": time_range,
                        "query_timestamp": timezone.now().isoformat()
                    }
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving date range logs: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Error retrieving date range logs: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_time_range_dates(self, time_range):
        """Convert predefined time range to start_date and end_date"""
        today = datetime.now().date()
        
        if time_range == "today":
            return today.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d')
        
        elif time_range == "yesterday":
            yesterday = today - timedelta(days=1)
            return yesterday.strftime('%Y-%m-%d'), yesterday.strftime('%Y-%m-%d')
        
        elif time_range == "last_7_days":
            start = today - timedelta(days=6)  # Include today
            return start.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d')
        
        elif time_range == "last_30_days":
            start = today - timedelta(days=29)  # Include today
            return start.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d')
        
        elif time_range == "this_month":
            start = today.replace(day=1)
            return start.strftime('%Y-%m-%d'), today.strftime('%Y-%m-%d')
        
        elif time_range == "last_month":
            # Get first day of last month
            first_this_month = today.replace(day=1)
            last_day_last_month = first_this_month - timedelta(days=1)
            first_last_month = last_day_last_month.replace(day=1)
            return first_last_month.strftime('%Y-%m-%d'), last_day_last_month.strftime('%Y-%m-%d')
        
        else:
            return None, None
    
    def _apply_advanced_filters(self, logs, file_type, project, min_size, max_size):
        """Apply additional filtering beyond basic date/user filters"""
        filtered = logs
        
        # Filter by file type
        if file_type:
            filtered = [log for log in filtered 
                       if log.get('file_extension', '').lower() == file_type.lower()]
        
        # Filter by project
        if project:
            filtered = [log for log in filtered 
                       if log.get('project_name', '').lower() == project.lower()]
        
        # Filter by file size
        if min_size:
            try:
                min_size_float = float(min_size)
                filtered = [log for log in filtered 
                           if log.get('file_size_mb', 0) >= min_size_float]
            except ValueError:
                pass
        
        if max_size:
            try:
                max_size_float = float(max_size)
                filtered = [log for log in filtered 
                           if log.get('file_size_mb', 0) <= max_size_float]
            except ValueError:
                pass
        
        return filtered
    
    def _sort_logs(self, logs, sort_by, sort_order):
        """Sort logs by specified field and order"""
        reverse = (sort_order.lower() == 'desc')
        
        if sort_by == 'date':
            return sorted(logs, key=lambda x: x.get('last_modified', ''), reverse=reverse)
        elif sort_by == 'size':
            return sorted(logs, key=lambda x: x.get('file_size_mb', 0), reverse=reverse)
        elif sort_by == 'user':
            return sorted(logs, key=lambda x: x.get('user_email', ''), reverse=reverse)
        elif sort_by == 'project':
            return sorted(logs, key=lambda x: x.get('project_name', ''), reverse=reverse)
        else:
            # Default to date sorting
            return sorted(logs, key=lambda x: x.get('last_modified', ''), reverse=reverse)
    
    def _group_logs(self, logs, group_by):
        """Group logs by specified field"""
        grouped = {}
        
        for log in logs:
            if group_by == 'date':
                # Extract date from last_modified
                try:
                    log_datetime = datetime.fromisoformat(log['last_modified'].replace('Z', '+00:00'))
                    key = log_datetime.strftime('%Y-%m-%d')
                except:
                    key = 'unknown_date'
            elif group_by == 'user':
                key = log.get('user_email', 'unknown_user')
            elif group_by == 'log_type':
                key = log.get('log_type', 'unknown_type')
            elif group_by == 'project':
                key = log.get('project_name', 'unknown_project')
            else:
                key = 'ungrouped'
            
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(log)
        
        # Add counts to grouped data
        grouped_with_counts = {}
        for key, items in grouped.items():
            grouped_with_counts[key] = {
                "count": len(items),
                "total_size_mb": sum(item.get('file_size_mb', 0) for item in items),
                "logs": items
            }
        
        return grouped_with_counts
    
    def _add_content_preview(self, logs, logs_service, preview_size=500):
        """Add content preview to logs (first N characters)"""
        for log in logs:
            try:
                content = logs_service.get_log_content(log['key'])
                if content and content.get('raw_content'):
                    preview = content['raw_content'][:preview_size]
                    if len(content['raw_content']) > preview_size:
                        preview += "..."
                    log['content_preview'] = preview
                    log['content_type'] = content.get('content_type', 'text')
            except Exception as e:
                logger.warning(f"Could not get content preview for {log['key']}: {str(e)}")
                log['content_preview'] = "Preview not available"
        
        return logs
    
    def _calculate_date_range_stats(self, logs, start_date, end_date):
        """Calculate statistics for the date range"""
        if not logs:
            return {
                "total_files": 0,
                "total_size_mb": 0,
                "unique_users": 0,
                "unique_projects": 0,
                "file_types": {},
                "daily_counts": {}
            }
        
        users = set()
        projects = set()
        file_types = {}
        daily_counts = {}
        total_size = 0
        
        for log in logs:
            # Users
            if log.get('user_email'):
                users.add(log['user_email'])
            
            # Projects
            if log.get('project_name'):
                projects.add(log['project_name'])
            
            # File types
            ext = log.get('file_extension', 'unknown')
            file_types[ext] = file_types.get(ext, 0) + 1
            
            # Size
            total_size += log.get('file_size_mb', 0)
            
            # Daily counts
            try:
                log_datetime = datetime.fromisoformat(log['last_modified'].replace('Z', '+00:00'))
                date_key = log_datetime.strftime('%Y-%m-%d')
                daily_counts[date_key] = daily_counts.get(date_key, 0) + 1
            except:
                pass
        
        return {
            "total_files": len(logs),
            "total_size_mb": round(total_size, 4),
            "unique_users": len(users),
            "unique_projects": len(projects),
            "file_types": file_types,
            "daily_counts": daily_counts,
            "users_list": list(users),
            "projects_list": list(projects)
        }


class LogsCalendarAPIView(APIView):
    """
    API View for getting logs in calendar format
    GET: Get logs organized by calendar dates for visualization
    """
    authentication_classes = []
    permission_classes = []
    
    def get(self, request):
        """
        Get logs organized by calendar dates
        
        Query Parameters:
        - month: Month (1-12, default: current month)
        - year: Year (YYYY, default: current year)
        - user_email: Filter by specific user
        """
        try:
            # Get parameters
            month = int(request.GET.get('month', datetime.now().month))
            year = int(request.GET.get('year', datetime.now().year))
            user_email = request.GET.get('user_email')
            
            # Validate month
            if month < 1 or month > 12:
                return Response({
                    "status": "error",
                    "message": "Month must be between 1 and 12",
                    "data": None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate date range for the month
            start_date = datetime(year, month, 1).strftime('%Y-%m-%d')
            
            # Get last day of month
            if month == 12:
                next_month = datetime(year + 1, 1, 1)
            else:
                next_month = datetime(year, month + 1, 1)
            last_day = (next_month - timedelta(days=1)).strftime('%Y-%m-%d')
            
            # Get logs for the month
            logs_service = S3UserLogsService()
            logs = logs_service.get_user_logs(
                user_email=user_email,
                start_date=start_date,
                end_date=last_day,
                limit=1000
            )
            
            # Organize by calendar dates
            calendar_data = {}
            for log in logs:
                try:
                    log_datetime = datetime.fromisoformat(log['last_modified'].replace('Z', '+00:00'))
                    date_key = log_datetime.strftime('%Y-%m-%d')
                    
                    if date_key not in calendar_data:
                        calendar_data[date_key] = {
                            "date": date_key,
                            "log_count": 0,
                            "total_size_mb": 0,
                            "users": set(),
                            "projects": set(),
                            "log_types": set(),
                            "logs": []
                        }
                    
                    calendar_data[date_key]["log_count"] += 1
                    calendar_data[date_key]["total_size_mb"] += log.get('file_size_mb', 0)
                    calendar_data[date_key]["users"].add(log.get('user_email', 'unknown'))
                    calendar_data[date_key]["projects"].add(log.get('project_name', 'unknown'))
                    calendar_data[date_key]["log_types"].add(log.get('log_type', 'unknown'))
                    calendar_data[date_key]["logs"].append(log)
                    
                except:
                    continue
            
            # Convert sets to lists for JSON serialization
            for date_data in calendar_data.values():
                date_data["users"] = list(date_data["users"])
                date_data["projects"] = list(date_data["projects"])
                date_data["log_types"] = list(date_data["log_types"])
                date_data["total_size_mb"] = round(date_data["total_size_mb"], 4)
            
            response_data = {
                "status": "success",
                "message": f"Retrieved calendar data for {year}-{month:02d}",
                "data": {
                    "calendar": calendar_data,
                    "month": month,
                    "year": year,
                    "total_days_with_logs": len(calendar_data),
                    "total_logs": sum(day["log_count"] for day in calendar_data.values()),
                    "date_range": {
                        "start": start_date,
                        "end": last_day
                    }
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating calendar data: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Error generating calendar data: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
