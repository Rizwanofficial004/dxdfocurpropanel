"""
Timer API - Employee Timer Management System (Database Integrated)

This module provides timer functionality for employees including:
- Start/Stop timer
- Set timer duration in minutes and seconds
- Apply timer settings
- Timer status tracking
- Timer history
- Employee synchronization from CRM API
- Screenshot management
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import datetime, timedelta
import logging
import json
import os
from django.conf import settings
from .timer_service import timer_service
from .models import Employee, TimerSession, ScreenshotLog

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class TimerAPIView(APIView):
    """
    Timer API - Employee Timer Management with Database Integration
    
    GET /api/Timer - Get timer status and settings
    POST /api/Timer - Start/Stop timer or apply timer settings
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        GET /api/Timer
        
        Get current timer status and settings for all employees or specific employee
        
        Query Parameters:
        - email: Get timer for specific employee
        - action: 'status', 'history', 'settings', 'sync'
        """
        try:
            email = request.GET.get('email', '').strip().lower()
            action = request.GET.get('action', 'status')
            
            # Handle sync action - fetch employees from CRM API
            if action == 'sync':
                try:
                    synced_count = timer_service.sync_employees_to_database()
                    return Response({
                        "status": "success",
                        "message": f"Synced {synced_count} employees from CRM API",
                        "synced_count": synced_count,
                        "timestamp": datetime.now().isoformat()
                    })
                except Exception as e:
                    logger.error(f"Error syncing employees: {e}")
                    return Response({
                        "status": "error",
                        "message": f"Failed to sync employees: {str(e)}"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Handle specific employee request
            if email:
                employee_data = timer_service.get_employee_timer(email)
                if not employee_data:
                    return Response({
                        "status": "error",
                        "message": "Employee not found"
                    }, status=status.HTTP_404_NOT_FOUND)
                
                if action == 'history':
                    # Get timer history for employee
                    employee = Employee.objects.get(email=email)
                    history = TimerSession.objects.filter(
                        employee=employee,
                        status='completed'
                    ).order_by('-created_at')[:10]
                    
                    history_data = []
                    for session in history:
                        history_data.append({
                            'id': session.id,
                            'start_time': session.start_time.isoformat() if session.start_time else None,
                            'end_time': session.end_time.isoformat() if session.end_time else None,
                            'duration_minutes': session.duration_minutes,
                            'duration_seconds': session.duration_seconds,
                            'elapsed_time': str(session.elapsed_time),
                            'total_screenshots': session.total_screenshots,
                            'created_at': session.created_at.isoformat()
                        })
                    
                    return Response({
                        "status": "success",
                        "employee": employee_data['employee'],
                        "history": history_data
                    })
                
                return Response({
                    "status": "success",
                    "data": employee_data
                })
            
            # Get all employees with timers
            employees_data = timer_service.get_all_employees_with_timers()
            
            # Calculate summary statistics
            total_employees = len(employees_data)
            active_timers = len([emp for emp in employees_data if emp['timer_status']['status'] in ['running', 'paused']])
            running_timers = len([emp for emp in employees_data if emp['timer_status']['status'] == 'running'])
            
            return Response({
                "status": "success",
                "summary": {
                    "total_employees": total_employees,
                    "active_timers": active_timers,
                    "running_timers": running_timers,
                    "timestamp": datetime.now().isoformat()
                },
                "employees": employees_data
            })
            
        except Exception as e:
            logger.error(f"Timer API GET error: {e}")
            return Response({
                "status": "error",
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        POST /api/Timer
        
        Perform timer actions
        
        Request Body:
        {
            "action": "apply_settings|start_timer|stop_timer|pause_timer|resume_timer|reset_timer",
            "email": "employee@example.com",
            "minutes": 25,  # for apply_settings
            "seconds": 30,  # for apply_settings
            "auto_start": false,  # for apply_settings
            "notifications_enabled": true  # for apply_settings
        }
        """
        try:
            # Parse request data
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data
            
            action = data.get('action', '').strip().lower()
            email = data.get('email', '').strip().lower()
            
            if not action:
                return Response({
                    "status": "error",
                    "message": "Action is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not email:
                return Response({
                    "status": "error",
                    "message": "Email is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle different actions
            if action == 'apply_settings':
                minutes = int(data.get('minutes', 10))
                seconds = int(data.get('seconds', 0))
                auto_start = data.get('auto_start', False)
                notifications_enabled = data.get('notifications_enabled', True)
                
                result = timer_service.apply_timer_settings(
                    email=email,
                    minutes=minutes,
                    seconds=seconds,
                    auto_start=auto_start,
                    notifications_enabled=notifications_enabled
                )
                
                if result['success']:
                    return Response({
                        "status": "success",
                        "message": result['message'],
                        "data": result['timer'],
                        "action": "apply_settings"
                    })
                else:
                    return Response({
                        "status": "error",
                        "message": result['message']
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'start_timer':
                result = timer_service.start_timer(email)
                
                if result['success']:
                    return Response({
                        "status": "success",
                        "message": result['message'],
                        "data": result['timer'],
                        "action": "start_timer"
                    })
                else:
                    return Response({
                        "status": "error",
                        "message": result['message']
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'stop_timer':
                result = timer_service.stop_timer(email)
                
                if result['success']:
                    return Response({
                        "status": "success",
                        "message": result['message'],
                        "data": result['timer'],
                        "action": "stop_timer"
                    })
                else:
                    return Response({
                        "status": "error",
                        "message": result['message']
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'pause_timer':
                result = timer_service.pause_timer(email)
                
                if result['success']:
                    return Response({
                        "status": "success",
                        "message": result['message'],
                        "data": result['timer'],
                        "action": "pause_timer"
                    })
                else:
                    return Response({
                        "status": "error",
                        "message": result['message']
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'resume_timer':
                result = timer_service.resume_timer(email)
                
                if result['success']:
                    return Response({
                        "status": "success",
                        "message": result['message'],
                        "data": result['timer'],
                        "action": "resume_timer"
                    })
                else:
                    return Response({
                        "status": "error",
                        "message": result['message']
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'reset_timer':
                result = timer_service.reset_timer(email)
                
                if result['success']:
                    return Response({
                        "status": "success",
                        "message": result['message'],
                        "data": result['timer'],
                        "action": "reset_timer"
                    })
                else:
                    return Response({
                        "status": "error",
                        "message": result['message']
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            else:
                return Response({
                    "status": "error",
                    "message": f"Unknown action: {action}. Available actions: apply_settings, start_timer, stop_timer, pause_timer, resume_timer, reset_timer"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except json.JSONDecodeError:
            return Response({
                "status": "error",
                "message": "Invalid JSON format"
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Timer API POST error: {e}")
            return Response({
                "status": "error",
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class TimerHistoryAPIView(APIView):
    """
    Timer History API
    
    GET /api/Timer/History - Get timer history and statistics
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        GET /api/Timer/History
        
        Get timer history and statistics
        
        Query Parameters:
        - email: Get history for specific employee
        - limit: Number of records to return (default: 10)
        """
        try:
            email = request.GET.get('email', '').strip().lower()
            limit = int(request.GET.get('limit', 10))
            
            if email:
                # Get history for specific employee
                try:
                    employee = Employee.objects.get(email=email, is_active=True)
                    sessions = TimerSession.objects.filter(
                        employee=employee
                    ).order_by('-created_at')[:limit]
                    
                    history_data = []
                    total_time = timedelta()
                    
                    for session in sessions:
                        session_data = {
                            'id': session.id,
                            'start_time': session.start_time.isoformat() if session.start_time else None,
                            'end_time': session.end_time.isoformat() if session.end_time else None,
                            'status': session.status,
                            'duration_minutes': session.duration_minutes,
                            'duration_seconds': session.duration_seconds,
                            'elapsed_time': str(session.elapsed_time),
                            'remaining_time': str(session.remaining_time),
                            'total_screenshots': session.total_screenshots,
                            'screenshot_interval': session.screenshot_interval,
                            'created_at': session.created_at.isoformat()
                        }
                        history_data.append(session_data)
                        
                        if session.status == 'completed':
                            total_time += session.elapsed_time
                    
                    return Response({
                        "status": "success",
                        "employee": {
                            "email": employee.email,
                            "name": employee.name
                        },
                        "statistics": {
                            "total_sessions": len(history_data),
                            "total_time_worked": str(total_time),
                            "completed_sessions": len([s for s in sessions if s.status == 'completed'])
                        },
                        "history": history_data
                    })
                    
                except Employee.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": "Employee not found"
                    }, status=status.HTTP_404_NOT_FOUND)
            
            else:
                # Get overall history statistics
                total_sessions = TimerSession.objects.count()
                completed_sessions = TimerSession.objects.filter(status='completed').count()
                active_employees = Employee.objects.filter(is_active=True).count()
                
                # Get recent sessions across all employees
                recent_sessions = TimerSession.objects.select_related('employee').order_by('-created_at')[:limit]
                
                history_data = []
                for session in recent_sessions:
                    session_data = {
                        'id': session.id,
                        'employee': {
                            'email': session.employee.email,
                            'name': session.employee.name
                        },
                        'start_time': session.start_time.isoformat() if session.start_time else None,
                        'end_time': session.end_time.isoformat() if session.end_time else None,
                        'status': session.status,
                        'duration_minutes': session.duration_minutes,
                        'duration_seconds': session.duration_seconds,
                        'elapsed_time': str(session.elapsed_time),
                        'total_screenshots': session.total_screenshots,
                        'created_at': session.created_at.isoformat()
                    }
                    history_data.append(session_data)
                
                return Response({
                    "status": "success",
                    "statistics": {
                        "total_sessions": total_sessions,
                        "completed_sessions": completed_sessions,
                        "active_employees": active_employees
                    },
                    "recent_sessions": history_data
                })
        
        except Exception as e:
            logger.error(f"Timer History API error: {e}")
            return Response({
                "status": "error",
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class TimerSetupAPIView(APIView):
    """
    Timer Setup API - Initialize system and create MySQL tables
    
    POST /api/Timer/Setup - Setup timer system
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        POST /api/Timer/Setup
        
        Setup timer system:
        - Create MySQL tables
        - Sync employees from CRM
        - Initialize default timer settings
        """
        try:
            # Create MySQL tables
            mysql_result = timer_service.create_mysql_tables()
            
            # Sync employees from CRM
            synced_count = timer_service.sync_employees_to_database()
            
            # Get employee count
            total_employees = Employee.objects.filter(is_active=True).count()
            
            return Response({
                "status": "success",
                "message": "Timer system setup completed",
                "setup_results": {
                    "mysql_tables": mysql_result,
                    "employees_synced": synced_count,
                    "total_employees": total_employees,
                    "default_timer_duration": "10 minutes",
                    "screenshot_interval": "10 seconds"
                },
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Timer Setup API error: {e}")
            return Response({
                "status": "error",
                "message": f"Setup failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
