"""
S3 User Logs API Views - REST API endpoints for retrieving user logs from S3
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .s3_logs_service import S3UserLogsService
import logging

logger = logging.getLogger(__name__)


class UserLogsAPIView(APIView):
    """
    API View for retrieving user logs from S3
    GET: Get user logs with filtering options
    """
    authentication_classes = []  # Remove if authentication required
    permission_classes = []       # Remove if permissions required
    
    def get(self, request):
        """
        Get user logs from S3 with optional filtering
        
        Query Parameters:
        - user_email: Filter by specific user email
        - log_type: Filter by log type (activity, timer, error, etc.)
        - start_date: Start date filter (YYYY-MM-DD)
        - end_date: End date filter (YYYY-MM-DD)  
        - limit: Maximum number of log files to return (default: 100)
        - search: Search term for filtering logs
        """
        try:
            # Get query parameters
            user_email = request.GET.get('user_email')
            log_type = request.GET.get('log_type')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            limit = request.GET.get('limit', '100')
            search_term = request.GET.get('search')
            
            # Validate limit
            try:
                limit = int(limit)
                if limit > 1000:  # Cap at 1000 for performance
                    limit = 1000
            except ValueError:
                limit = 100
            
            # Initialize S3 service
            logs_service = S3UserLogsService()
            
            # Get logs based on parameters
            if search_term:
                logs = logs_service.search_logs(
                    search_term=search_term,
                    user_email=user_email,
                    limit=limit
                )
            else:
                logs = logs_service.get_user_logs(
                    user_email=user_email,
                    log_type=log_type,
                    start_date=start_date,
                    end_date=end_date,
                    limit=limit
                )
            
            # Prepare response
            response_data = {
                "status": "success",
                "message": f"Retrieved {len(logs)} log files",
                "data": {
                    "logs": logs,
                    "total_count": len(logs),
                    "filters_applied": {
                        "user_email": user_email,
                        "log_type": log_type,
                        "start_date": start_date,
                        "end_date": end_date,
                        "limit": limit,
                        "search": search_term
                    },
                    "retrieved_at": timezone.now().isoformat()
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving user logs: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Error retrieving user logs: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserLogContentAPIView(APIView):
    """
    API View for retrieving the content of a specific log file
    GET: Download and return log file content
    """
    authentication_classes = []  # Remove if authentication required  
    permission_classes = []       # Remove if permissions required
    
    def get(self, request, log_key):
        """
        Get the content of a specific log file
        
        URL Parameters:
        - log_key: The S3 key of the log file (URL encoded)
        """
        try:
            # URL decode the log key
            import urllib.parse
            decoded_log_key = urllib.parse.unquote(log_key)
            
            # Initialize S3 service
            logs_service = S3UserLogsService()
            
            # Get log content
            log_content = logs_service.get_log_content(decoded_log_key)
            
            if log_content:
                response_data = {
                    "status": "success",
                    "message": f"Retrieved content for log file: {decoded_log_key}",
                    "data": log_content
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response({
                    "status": "error",
                    "message": f"Log file not found: {decoded_log_key}",
                    "data": None
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            logger.error(f"Error retrieving log content: {str(e)}")
            return Response({
                "status": "error", 
                "message": f"Error retrieving log content: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserActivitySummaryAPIView(APIView):
    """
    API View for getting user activity summary
    GET: Get activity summary for a specific user
    """
    authentication_classes = []  # Remove if authentication required
    permission_classes = []       # Remove if permissions required
    
    def get(self, request):
        """
        Get activity summary for a user
        
        Query Parameters:
        - user_email: User email (required)
        - days: Number of days to look back (default: 7)
        """
        try:
            user_email = request.GET.get('user_email')
            days = request.GET.get('days', '7')
            
            if not user_email:
                return Response({
                    "status": "error",
                    "message": "user_email parameter is required",
                    "data": None
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate days
            try:
                days = int(days)
                if days > 365:  # Cap at 1 year
                    days = 365
            except ValueError:
                days = 7
            
            # Initialize S3 service
            logs_service = S3UserLogsService()
            
            # Get activity summary
            summary = logs_service.get_user_activity_summary(user_email, days)
            
            if summary:
                response_data = {
                    "status": "success",
                    "message": f"Retrieved activity summary for {user_email}",
                    "data": summary
                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                return Response({
                    "status": "error",
                    "message": f"Could not generate activity summary for {user_email}",
                    "data": None
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            logger.error(f"Error generating activity summary: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Error generating activity summary: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogTypesAPIView(APIView):
    """
    API View for getting available log types
    GET: Get list of available log types and statistics
    """
    authentication_classes = []  # Remove if authentication required
    permission_classes = []       # Remove if permissions required
    
    def get(self, request):
        """
        Get available log types and basic statistics
        """
        try:
            # Initialize S3 service
            logs_service = S3UserLogsService()
            
            # Get a sample of logs to analyze types
            sample_logs = logs_service.get_user_logs(limit=500)
            
            # Analyze log types
            log_types = {}
            file_extensions = {}
            users = set()
            
            for log in sample_logs:
                # Count file extensions
                ext = log.get('file_extension', 'unknown')
                file_extensions[ext] = file_extensions.get(ext, 0) + 1
                
                # Extract log type from path
                key = log.get('key', '')
                key_parts = key.split('/')
                for part in key_parts:
                    if 'log' in part.lower():
                        log_types[part] = log_types.get(part, 0) + 1
                        break
                
                # Count unique users
                if 'user_email' in log:
                    users.add(log['user_email'])
            
            response_data = {
                "status": "success",
                "message": f"Analyzed {len(sample_logs)} log files",
                "data": {
                    "log_types": log_types,
                    "file_extensions": file_extensions,
                    "total_users": len(users),
                    "users": list(users) if len(users) <= 50 else list(users)[:50],  # Limit user list
                    "sample_size": len(sample_logs),
                    "analysis_date": timezone.now().isoformat()
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error analyzing log types: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Error analyzing log types: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserLogsStatsAPIView(APIView):
    """
    API View for getting overall user logs statistics
    GET: Get comprehensive statistics about user logs in S3
    """
    authentication_classes = []  # Remove if authentication required
    permission_classes = []       # Remove if permissions required
    
    def get(self, request):
        """
        Get comprehensive statistics about user logs
        
        Query Parameters:
        - detailed: Include detailed breakdown (true/false, default: false)
        """
        try:
            detailed = request.GET.get('detailed', 'false').lower() == 'true'
            
            # Initialize S3 service
            logs_service = S3UserLogsService()
            
            # Get logs for analysis
            all_logs = logs_service.get_user_logs(limit=2000 if detailed else 1000)
            
            # Calculate statistics
            stats = {
                "total_log_files": len(all_logs),
                "total_size_mb": 0,
                "file_types": {},
                "users_with_logs": set(),
                "date_range": {"earliest": None, "latest": None},
                "daily_counts": {} if detailed else None,
                "size_distribution": {
                    "small_files_under_1mb": 0,
                    "medium_files_1_10mb": 0,
                    "large_files_over_10mb": 0
                }
            }
            
            for log in all_logs:
                # Size calculations
                size_mb = log.get('size_mb', 0)
                stats["total_size_mb"] += size_mb
                
                # Size distribution
                if size_mb < 1:
                    stats["size_distribution"]["small_files_under_1mb"] += 1
                elif size_mb <= 10:
                    stats["size_distribution"]["medium_files_1_10mb"] += 1
                else:
                    stats["size_distribution"]["large_files_over_10mb"] += 1
                
                # File types
                ext = log.get('file_extension', 'unknown')
                stats["file_types"][ext] = stats["file_types"].get(ext, 0) + 1
                
                # Users
                if 'user_email' in log:
                    stats["users_with_logs"].add(log['user_email'])
                
                # Date range
                log_date = log.get('last_modified')
                if log_date:
                    if not stats["date_range"]["earliest"] or log_date < stats["date_range"]["earliest"]:
                        stats["date_range"]["earliest"] = log_date
                    if not stats["date_range"]["latest"] or log_date > stats["date_range"]["latest"]:
                        stats["date_range"]["latest"] = log_date
                
                # Daily counts (if detailed)
                if detailed and 'last_modified' in log:
                    try:
                        from datetime import datetime
                        log_datetime = datetime.fromisoformat(log['last_modified'].replace('Z', '+00:00'))
                        log_date_str = log_datetime.strftime('%Y-%m-%d')
                        stats["daily_counts"][log_date_str] = stats["daily_counts"].get(log_date_str, 0) + 1
                    except:
                        pass
            
            # Convert set to count
            stats["unique_users"] = len(stats["users_with_logs"])
            stats["users_list"] = list(stats["users_with_logs"]) if len(stats["users_with_logs"]) <= 100 else list(stats["users_with_logs"])[:100]
            del stats["users_with_logs"]  # Remove set from response
            
            # Round total size
            stats["total_size_mb"] = round(stats["total_size_mb"], 4)
            
            response_data = {
                "status": "success", 
                "message": f"Generated statistics for {len(all_logs)} log files",
                "data": {
                    "statistics": stats,
                    "generated_at": timezone.now().isoformat(),
                    "sample_size": len(all_logs)
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating log statistics: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Error generating log statistics: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
