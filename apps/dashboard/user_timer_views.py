"""
User Timer API Views - POST time against registered users
Created: September 10, 2025
"""

import json
import logging
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from django.core.exceptions import ValidationError
from django.db.models import Q, Sum, Count, Avg
from .models import UserTimer
from .serializers import UserTimerSerializer, TimerCreateSerializer

logger = logging.getLogger(__name__)


class UserTimerAPIView(APIView):
    """
    API View for User Timer Management
    POST: Create timer session for user
    GET: Get timer sessions
    """
    
    permission_classes = [AllowAny]  # No authentication required
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def post(self, request, timer_id=None):
        """
        POST time against registered user
        
        Request Body:
        {
            "user_id": 123,
            "duration_seconds": 3600,
            "timer_name": "Work Session",
            "notes": "Project work"
        }
        
        OR for bulk operations:
        [
            {"user_id": 123, "duration_seconds": 3600},
            {"user_id": 456, "duration_seconds": 1800}
        ]
        """
        
        logger.info(f"Timer API POST called from IP: {self.get_client_ip(request)}")
        logger.debug(f"Request data: {json.dumps(request.data, default=str)}")
        
        try:
            # Handle bulk operations
            if isinstance(request.data, list):
                return self._handle_bulk_timer_creation(request.data)
            
            # Single timer creation
            return self._create_single_timer(request.data)
            
        except Exception as e:
            logger.error(f"Unexpected error in Timer API: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An unexpected error occurred while creating timer",
                "error_code": "INTERNAL_ERROR",
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _create_single_timer(self, data):
        """Create a single timer session"""
        
        # Validate required fields
        if not data.get('user_id'):
            return Response({
                "status": "error",
                "message": "user_id is required",
                "error_code": "MISSING_USER_ID"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not data.get('duration_seconds'):
            return Response({
                "status": "error",
                "message": "duration_seconds is required",
                "error_code": "MISSING_DURATION"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = data.get('user_id')
        duration_seconds = data.get('duration_seconds')
        timer_name = data.get('timer_name', 'Timer Session')
        notes = data.get('notes', '')
        
        # Validate user exists
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                "status": "error",
                "message": f"User with ID {user_id} not found",
                "error_code": "USER_NOT_FOUND"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Validate duration
        try:
            duration_seconds = int(duration_seconds)
            if duration_seconds <= 0:
                raise ValueError("Duration must be positive")
            if duration_seconds > 86400:  # 24 hours max
                raise ValueError("Duration cannot exceed 24 hours")
        except ValueError as e:
            return Response({
                "status": "error",
                "message": f"Invalid duration: {str(e)}",
                "error_code": "INVALID_DURATION"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create timer session
        try:
            with transaction.atomic():
                timer = UserTimer.objects.create(
                    user=user,
                    duration_seconds=duration_seconds,
                    timer_name=timer_name,
                    notes=notes
                )
                
                # Get or create user token for response
                token, created = Token.objects.get_or_create(user=user)
                
                logger.info(f"Timer created for user {user.username} (ID: {user_id}) - Duration: {duration_seconds}s")
                
                return Response({
                    "status": "success",
                    "message": f"Timer session created successfully for {user.username}",
                    "data": {
                        "timer_id": timer.id,
                        "user_id": user.id,
                        "username": user.username,
                        "duration_seconds": timer.duration_seconds,
                        "duration_formatted": timer.duration_formatted,
                        "timer_name": timer.timer_name,
                        "start_time": timer.start_time.isoformat(),
                        "end_time": timer.end_time.isoformat() if timer.end_time else None,
                        "notes": timer.notes,
                        "token": token.key
                    },
                    "metadata": {
                        "created_at": timer.start_time.isoformat(),
                        "api_version": "1.0.0"
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Error creating timer: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to create timer session",
                "error_code": "CREATION_FAILED"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _handle_bulk_timer_creation(self, data_list):
        """Handle bulk timer creation"""
        
        if len(data_list) > 100:
            return Response({
                "status": "error",
                "message": "Bulk operation limited to 100 timers per request",
                "error_code": "BULK_LIMIT_EXCEEDED"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        successful = 0
        errors = 0
        
        with transaction.atomic():
            for i, timer_data in enumerate(data_list):
                try:
                    # Validate each timer data
                    if not timer_data.get('user_id') or not timer_data.get('duration_seconds'):
                        results.append({
                            "index": i,
                            "status": "error",
                            "message": "Missing required fields (user_id, duration_seconds)",
                            "data": timer_data
                        })
                        errors += 1
                        continue
                    
                    user_id = timer_data.get('user_id')
                    duration_seconds = int(timer_data.get('duration_seconds'))
                    timer_name = timer_data.get('timer_name', 'Timer Session')
                    notes = timer_data.get('notes', '')
                    
                    # Check user exists
                    try:
                        user = User.objects.get(id=user_id)
                    except User.DoesNotExist:
                        results.append({
                            "index": i,
                            "status": "error",
                            "message": f"User with ID {user_id} not found",
                            "data": timer_data
                        })
                        errors += 1
                        continue
                    
                    # Create timer
                    timer = UserTimer.objects.create(
                        user=user,
                        duration_seconds=duration_seconds,
                        timer_name=timer_name,
                        notes=notes
                    )
                    
                    results.append({
                        "index": i,
                        "status": "success",
                        "message": f"Timer created for {user.username}",
                        "data": {
                            "timer_id": timer.id,
                            "user_id": user.id,
                            "username": user.username,
                            "duration_seconds": timer.duration_seconds,
                            "duration_formatted": timer.duration_formatted
                        }
                    })
                    successful += 1
                    
                except Exception as e:
                    results.append({
                        "index": i,
                        "status": "error",
                        "message": str(e),
                        "data": timer_data
                    })
                    errors += 1
        
        logger.info(f"Bulk timer creation completed: {successful} successful, {errors} errors")
        
        return Response({
            "status": "completed",
            "message": f"Bulk timer creation completed",
            "summary": {
                "total_requested": len(data_list),
                "successful": successful,
                "errors": errors
            },
            "results": results,
            "metadata": {
                "timestamp": timezone.now().isoformat(),
                "api_version": "1.0.0"
            }
        }, status=status.HTTP_200_OK if errors == 0 else status.HTTP_207_MULTI_STATUS)
    
    def get(self, request, timer_id=None):
        """
        GET timer sessions
        
        Query Parameters:
        - user_id: Filter by user ID
        - username: Filter by username
        - date_from: Filter from date (YYYY-MM-DD)
        - date_to: Filter to date (YYYY-MM-DD)
        - limit: Limit results (default: 50)
        """
        
        logger.info(f"Timer API GET called from IP: {self.get_client_ip(request)}")
        
        try:
            # Get specific timer by ID
            if timer_id:
                try:
                    timer = UserTimer.objects.get(id=timer_id)
                    serializer = UserTimerSerializer(timer)
                    return Response({
                        "status": "success",
                        "data": serializer.data
                    })
                except UserTimer.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": f"Timer with ID {timer_id} not found"
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Filter timers
            timers = UserTimer.objects.all()
            
            # Filter by user_id
            user_id = request.GET.get('user_id')
            if user_id:
                timers = timers.filter(user_id=user_id)
            
            # Filter by username
            username = request.GET.get('username')
            if username:
                timers = timers.filter(user__username__icontains=username)
            
            # Filter by date range
            date_from = request.GET.get('date_from')
            date_to = request.GET.get('date_to')
            
            if date_from:
                try:
                    date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
                    timers = timers.filter(start_time__date__gte=date_from)
                except ValueError:
                    return Response({
                        "status": "error",
                        "message": "Invalid date_from format. Use YYYY-MM-DD"
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            if date_to:
                try:
                    date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
                    timers = timers.filter(start_time__date__lte=date_to)
                except ValueError:
                    return Response({
                        "status": "error",
                        "message": "Invalid date_to format. Use YYYY-MM-DD"
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Limit results
            limit = request.GET.get('limit', 50)
            try:
                limit = int(limit)
                if limit > 1000:
                    limit = 1000
            except ValueError:
                limit = 50
            
            timers = timers.order_by('-start_time')[:limit]
            
            # Serialize data
            serializer = UserTimerSerializer(timers, many=True)
            
            # Calculate statistics
            total_timers = timers.count()
            total_duration = timers.aggregate(Sum('duration_seconds'))['duration_seconds__sum'] or 0
            avg_duration = timers.aggregate(Avg('duration_seconds'))['duration_seconds__avg'] or 0
            
            return Response({
                "status": "success",
                "message": f"Retrieved {total_timers} timer sessions",
                "data": serializer.data,
                "statistics": {
                    "total_timers": total_timers,
                    "total_duration_seconds": total_duration,
                    "total_duration_formatted": f"{total_duration // 3600:02d}:{(total_duration % 3600) // 60:02d}:{total_duration % 60:02d}",
                    "average_duration_seconds": round(avg_duration, 2),
                    "average_duration_formatted": f"{int(avg_duration) // 3600:02d}:{(int(avg_duration) % 3600) // 60:02d}:{int(avg_duration) % 60:02d}"
                },
                "metadata": {
                    "timestamp": timezone.now().isoformat(),
                    "api_version": "1.0.0",
                    "filters_applied": {
                        "user_id": user_id,
                        "username": username,
                        "date_from": date_from.isoformat() if date_from else None,
                        "date_to": date_to.isoformat() if date_to else None,
                        "limit": limit
                    }
                }
            })
            
        except Exception as e:
            logger.error(f"Error retrieving timers: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An error occurred while retrieving timer sessions",
                "error_code": "RETRIEVAL_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserTimerStatsAPIView(APIView):
    """
    API View for Timer Statistics
    """
    
    permission_classes = [AllowAny]  # No authentication required
    
    def get(self, request):
        """Get timer statistics for users"""
        
        user_id = request.GET.get('user_id')
        username = request.GET.get('username')
        days = request.GET.get('days', 30)  # Default last 30 days
        
        try:
            days = int(days)
        except ValueError:
            days = 30
        
        # Filter date range
        date_from = timezone.now() - timedelta(days=days)
        
        # Base queryset
        timers = UserTimer.objects.filter(start_time__gte=date_from)
        
        # Filter by user
        if user_id:
            timers = timers.filter(user_id=user_id)
        elif username:
            timers = timers.filter(user__username__icontains=username)
        
        # Calculate statistics
        stats = timers.aggregate(
            total_sessions=Count('id'),
            total_duration=Sum('duration_seconds'),
            avg_duration=Avg('duration_seconds')
        )
        
        # Per-user statistics
        user_stats = timers.values('user__username', 'user__id').annotate(
            sessions=Count('id'),
            total_duration=Sum('duration_seconds'),
            avg_duration=Avg('duration_seconds')
        ).order_by('-total_duration')[:10]
        
        return Response({
            "status": "success",
            "data": {
                "overview": {
                    "total_sessions": stats['total_sessions'] or 0,
                    "total_duration_seconds": stats['total_duration'] or 0,
                    "average_duration_seconds": round(stats['avg_duration'] or 0, 2),
                    "date_range_days": days
                },
                "top_users": list(user_stats)
            }
        })


class TimerQuickActionAPIView(APIView):
    """
    Quick Timer Actions API
    """
    
    permission_classes = [AllowAny]  # No authentication required
    
    permission_classes = [AllowAny]  # No authentication required
    
    def post(self, request):
        """
        Quick timer actions
        
        Actions:
        - start_15min: Start 15-minute timer
        - start_30min: Start 30-minute timer
        - start_60min: Start 60-minute timer
        - start_custom: Start custom timer
        """
        
        action = request.data.get('action')
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                "status": "error",
                "message": "user_id is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                "status": "error",
                "message": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Predefined durations
        durations = {
            'start_15min': 900,   # 15 minutes
            'start_30min': 1800,  # 30 minutes
            'start_60min': 3600,  # 60 minutes
        }
        
        if action in durations:
            duration_seconds = durations[action]
            timer_name = f"{action.replace('start_', '').replace('min', ' minutes')}"
        elif action == 'start_custom':
            duration_seconds = request.data.get('duration_seconds')
            timer_name = request.data.get('timer_name', 'Custom Timer')
            
            if not duration_seconds:
                return Response({
                    "status": "error",
                    "message": "duration_seconds required for custom timer"
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                "status": "error",
                "message": "Invalid action. Available: start_15min, start_30min, start_60min, start_custom"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create timer
        try:
            timer = UserTimer.objects.create(
                user=user,
                duration_seconds=duration_seconds,
                timer_name=timer_name,
                notes=f"Quick action: {action}"
            )
            
            return Response({
                "status": "success",
                "message": f"Quick timer started: {timer_name}",
                "data": {
                    "timer_id": timer.id,
                    "duration_seconds": timer.duration_seconds,
                    "duration_formatted": timer.duration_formatted,
                    "timer_name": timer.timer_name
                }
            })
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Failed to create timer: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
