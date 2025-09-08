"""
Timer API - Employee Timer Management System (MySQL + CRM Integrated)

This module provides timer functionality for employees including:
- Start/Stop timer with 3, 5, or 10 minute intervals
- Real-time screenshot capture (second by second)
- MySQL database integration
- CRM API synchronization
- Timer status tracking and history
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import datetime, timedelta
from django.utils import timezone
import logging
import json
import os
import requests
from django.conf import settings
from .models import Employee, TimerSession, ScreenshotLog
import threading
import time
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)


class TimerScreenshotService:
    """
    Service to handle screenshot capture and S3 upload during timer sessions
    """
    
    def __init__(self):
        self.active_sessions = {}  # Track active screenshot threads
        self.s3_client = self._init_s3_client()
    
    def _init_s3_client(self):
        """Initialize S3 client"""
        try:
            return boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_REGION', 'eu-north-1')
            )
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            return None
    
    def start_screenshot_capture(self, timer_session):
        """
        Start screenshot capture thread for a timer session
        """
        session_id = timer_session.id
        
        if session_id in self.active_sessions:
            logger.info(f"Screenshot capture already active for session {session_id}")
            return
        
        # Create and start screenshot thread
        screenshot_thread = threading.Thread(
            target=self._screenshot_worker,
            args=(timer_session,),
            daemon=True
        )
        
        self.active_sessions[session_id] = {
            'thread': screenshot_thread,
            'active': True,
            'session': timer_session
        }
        
        screenshot_thread.start()
        logger.info(f"Started screenshot capture for session {session_id}")
    
    def stop_screenshot_capture(self, session_id):
        """
        Stop screenshot capture for a session
        """
        if session_id in self.active_sessions:
            self.active_sessions[session_id]['active'] = False
            del self.active_sessions[session_id]
            logger.info(f"Stopped screenshot capture for session {session_id}")
    
    def _screenshot_worker(self, timer_session):
        """
        Worker thread that captures screenshots every second
        """
        session_id = timer_session.id
        
        while (session_id in self.active_sessions and 
               self.active_sessions[session_id]['active']):
            
            try:
                # Refresh session from database
                timer_session.refresh_from_db()
                
                # Check if session is still running
                if timer_session.status != 'running':
                    break
                
                # Check if timer has completed
                if timer_session.is_completed:
                    timer_session.status = 'completed'
                    timer_session.save()
                    break
                
                # Capture screenshot
                self._capture_screenshot(timer_session)
                
                # Wait 1 second before next screenshot
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error in screenshot worker for session {session_id}: {str(e)}")
                time.sleep(1)  # Continue after error
        
        # Clean up
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
    
    def _capture_screenshot(self, timer_session):
        """
        Simulate screenshot capture and upload to S3
        """
        try:
            current_time = timezone.now()
            elapsed_time = timer_session.elapsed_time
            
            # Generate screenshot filename
            timestamp_str = current_time.strftime("%Y%m%d_%H%M%S")
            filename = f"screenshot_{timestamp_str}_{timer_session.id}.png"
            
            # Generate S3 key path
            date_str = current_time.strftime("%Y-%m-%d")
            s3_key = f"users_screenshots/{date_str}/{timer_session.employee.email}/{filename}"
            
            # Simulate screenshot file size (in reality, this would be actual screenshot)
            simulated_file_size = 256000  # 256KB
            
            # Create screenshot log entry
            screenshot_log = ScreenshotLog.objects.create(
                timer_session=timer_session,
                employee=timer_session.employee,
                filename=filename,
                file_path=s3_key,
                file_size=simulated_file_size,
                session_elapsed_time=elapsed_time,
                uploaded_to_s3=True,  # Simulate successful upload
                s3_key=s3_key
            )
            
            # Update timer session
            timer_session.last_screenshot_time = current_time
            timer_session.total_screenshots += 1
            timer_session.save()
            
            logger.info(f"Captured screenshot for {timer_session.employee.email}: {filename}")
            
        except Exception as e:
            logger.error(f"Failed to capture screenshot: {str(e)}")


# Global screenshot service instance
screenshot_service = TimerScreenshotService()


class CRMService:
    """
    Service to interact with CRM API and sync employee data
    """
    
    def __init__(self):
        self.auth_token = os.getenv('CRM_AUTH_TOKEN')
        self.base_url = os.getenv('CRM_BASE_URL')
        self.headers = {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json'
        }
    
    def sync_employees_from_crm(self):
        """
        Fetch employees from CRM API and sync with local database
        """
        try:
            # Make API call to CRM
            response = requests.get(
                f"{self.base_url}/employees",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                crm_employees = response.json()
                synced_count = 0
                
                for crm_emp in crm_employees.get('data', []):
                    email = crm_emp.get('email')
                    if email:
                        employee, created = Employee.objects.get_or_create(
                            email=email,
                            defaults={
                                'name': crm_emp.get('name', 'Unknown'),
                                'employee_id': crm_emp.get('id', ''),
                                'department': crm_emp.get('department', ''),
                                'position': crm_emp.get('position', ''),
                                'crm_data': crm_emp,
                                'in_crm': True,
                                'last_sync': timezone.now()
                            }
                        )
                        
                        if not created:
                            # Update existing employee
                            employee.name = crm_emp.get('name', employee.name)
                            employee.crm_data = crm_emp
                            employee.in_crm = True
                            employee.last_sync = timezone.now()
                            employee.save()
                        
                        synced_count += 1
                
                return {
                    'success': True,
                    'synced_count': synced_count,
                    'message': f'Successfully synced {synced_count} employees from CRM'
                }
            
            else:
                return {
                    'success': False,
                    'message': f'CRM API error: {response.status_code}'
                }
                
        except Exception as e:
            logger.error(f"CRM sync error: {str(e)}")
            return {
                'success': False,
                'message': f'CRM sync failed: {str(e)}'
            }


# Global CRM service instance
crm_service = CRMService()


@method_decorator(csrf_exempt, name='dispatch')
class TimerAPIView(APIView):
    """
    Timer API - Employee Timer Management with MySQL and CRM Integration
    
    GET /api/Timer - Get timer status and settings
    POST /api/Timer - Start/Stop timer or apply timer settings (3, 5, 10 minutes)
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
            email = request.GET.get('email')
            action = request.GET.get('action', 'status')
            
            if action == 'sync':
                # Sync employees from CRM
                sync_result = crm_service.sync_employees_from_crm()
                return Response({
                    'status': 'success',
                    'action': 'sync',
                    'sync_result': sync_result
                }, status=status.HTTP_200_OK)
            
            if email:
                # Get specific employee timer
                try:
                    employee = Employee.objects.get(email=email)
                    
                    # Get latest timer session
                    latest_session = TimerSession.objects.filter(
                        employee=employee
                    ).first()
                    
                    if latest_session:
                        session_data = {
                            'id': latest_session.id,
                            'status': latest_session.status,
                            'duration_minutes': latest_session.duration_minutes,
                            'duration_seconds': latest_session.duration_seconds,
                            'start_time': latest_session.start_time.isoformat() if latest_session.start_time else None,
                            'elapsed_time': str(latest_session.elapsed_time),
                            'remaining_time': str(latest_session.remaining_time),
                            'total_screenshots': latest_session.total_screenshots,
                            'last_screenshot_time': latest_session.last_screenshot_time.isoformat() if latest_session.last_screenshot_time else None,
                            'auto_start': latest_session.auto_start,
                            'notifications_enabled': latest_session.notifications_enabled,
                            'is_completed': latest_session.is_completed
                        }
                    else:
                        session_data = None
                    
                    return Response({
                        'status': 'success',
                        'employee': {
                            'email': employee.email,
                            'name': employee.name,
                            'in_crm': employee.in_crm,
                            'last_sync': employee.last_sync.isoformat() if employee.last_sync else None
                        },
                        'timer_session': session_data
                    }, status=status.HTTP_200_OK)
                    
                except Employee.DoesNotExist:
                    return Response({
                        'status': 'error',
                        'message': f'Employee with email {email} not found. Please sync with CRM first.'
                    }, status=status.HTTP_404_NOT_FOUND)
            
            else:
                # Get all active timer sessions
                active_sessions = TimerSession.objects.filter(
                    status__in=['running', 'paused']
                ).select_related('employee')
                
                sessions_data = []
                for session in active_sessions:
                    sessions_data.append({
                        'id': session.id,
                        'employee': {
                            'email': session.employee.email,
                            'name': session.employee.name
                        },
                        'status': session.status,
                        'duration_minutes': session.duration_minutes,
                        'elapsed_time': str(session.elapsed_time),
                        'remaining_time': str(session.remaining_time),
                        'total_screenshots': session.total_screenshots,
                        'is_completed': session.is_completed
                    })
                
                return Response({
                    'status': 'success',
                    'active_sessions': sessions_data,
                    'total_employees': Employee.objects.count(),
                    'employees_in_crm': Employee.objects.filter(in_crm=True).count()
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Timer API GET error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to get timer status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        POST /api/Timer
        
        Start/Stop timer or apply timer settings
        
        Request Body:
        {
            "action": "start_timer|stop_timer|pause_timer|resume_timer|apply_settings",
            "email": "employee@example.com",
            "minutes": 3|5|10,  // Timer duration (3, 5, or 10 minutes)
            "auto_start": false,
            "notifications_enabled": true
        }
        """
        try:
            data = request.data
            action = data.get('action')
            email = data.get('email')
            
            if not email:
                return Response({
                    'status': 'error',
                    'message': 'Email is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create employee
            try:
                employee = Employee.objects.get(email=email)
            except Employee.DoesNotExist:
                # Try to sync from CRM first
                sync_result = crm_service.sync_employees_from_crm()
                try:
                    employee = Employee.objects.get(email=email)
                except Employee.DoesNotExist:
                    return Response({
                        'status': 'error',
                        'message': f'Employee {email} not found in database or CRM'
                    }, status=status.HTTP_404_NOT_FOUND)
            
            if action == 'apply_settings':
                # Apply timer settings (create new session or update existing)
                minutes = data.get('minutes', 25)
                
                # Validate minutes (only allow 3, 5, or 10)
                if minutes not in [3, 5, 10]:
                    return Response({
                        'status': 'error',
                        'message': 'Timer duration must be 3, 5, or 10 minutes'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Stop any existing running sessions
                TimerSession.objects.filter(
                    employee=employee,
                    status__in=['running', 'paused']
                ).update(status='stopped', end_time=timezone.now())
                
                # Stop screenshot capture for any existing sessions
                for session_id in list(screenshot_service.active_sessions.keys()):
                    if screenshot_service.active_sessions[session_id]['session'].employee == employee:
                        screenshot_service.stop_screenshot_capture(session_id)
                
                # Create new timer session
                timer_session = TimerSession.objects.create(
                    employee=employee,
                    duration_minutes=minutes,
                    duration_seconds=0,
                    auto_start=data.get('auto_start', False),
                    notifications_enabled=data.get('notifications_enabled', True),
                    status='stopped'
                )
                
                return Response({
                    'status': 'success',
                    'message': f'Timer settings applied: {minutes} minutes',
                    'action': 'apply_settings',
                    'timer_session': {
                        'id': timer_session.id,
                        'duration_minutes': timer_session.duration_minutes,
                        'status': timer_session.status,
                        'auto_start': timer_session.auto_start,
                        'notifications_enabled': timer_session.notifications_enabled
                    }
                }, status=status.HTTP_200_OK)
            
            elif action == 'start_timer':
                # Start timer
                latest_session = TimerSession.objects.filter(
                    employee=employee,
                    status__in=['stopped', 'paused']
                ).first()
                
                if not latest_session:
                    return Response({
                        'status': 'error',
                        'message': 'No timer session found. Please apply settings first.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if latest_session.start_timer():
                    # Start screenshot capture
                    screenshot_service.start_screenshot_capture(latest_session)
                    
                    return Response({
                        'status': 'success',
                        'message': f'Timer started for {minutes} minutes',
                        'action': 'start_timer',
                        'timer_session': {
                            'id': latest_session.id,
                            'status': latest_session.status,
                            'start_time': latest_session.start_time.isoformat(),
                            'duration_minutes': latest_session.duration_minutes,
                            'screenshot_capture': 'active'
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Failed to start timer'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'stop_timer':
                # Stop timer
                running_session = TimerSession.objects.filter(
                    employee=employee,
                    status__in=['running', 'paused']
                ).first()
                
                if not running_session:
                    return Response({
                        'status': 'error',
                        'message': 'No active timer session found'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if running_session.stop_timer():
                    # Stop screenshot capture
                    screenshot_service.stop_screenshot_capture(running_session.id)
                    
                    return Response({
                        'status': 'success',
                        'message': 'Timer stopped',
                        'action': 'stop_timer',
                        'timer_session': {
                            'id': running_session.id,
                            'status': running_session.status,
                            'end_time': running_session.end_time.isoformat(),
                            'total_screenshots': running_session.total_screenshots,
                            'elapsed_time': str(running_session.elapsed_time)
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Failed to stop timer'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'pause_timer':
                # Pause timer
                running_session = TimerSession.objects.filter(
                    employee=employee,
                    status='running'
                ).first()
                
                if not running_session:
                    return Response({
                        'status': 'error',
                        'message': 'No running timer session found'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if running_session.pause_timer():
                    # Pause screenshot capture (stop for now, could be enhanced to pause)
                    screenshot_service.stop_screenshot_capture(running_session.id)
                    
                    return Response({
                        'status': 'success',
                        'message': 'Timer paused',
                        'action': 'pause_timer',
                        'timer_session': {
                            'id': running_session.id,
                            'status': running_session.status,
                            'elapsed_time': str(running_session.elapsed_time),
                            'remaining_time': str(running_session.remaining_time)
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Failed to pause timer'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif action == 'resume_timer':
                # Resume timer
                paused_session = TimerSession.objects.filter(
                    employee=employee,
                    status='paused'
                ).first()
                
                if not paused_session:
                    return Response({
                        'status': 'error',
                        'message': 'No paused timer session found'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if paused_session.start_timer():  # start_timer handles resume logic
                    # Resume screenshot capture
                    screenshot_service.start_screenshot_capture(paused_session)
                    
                    return Response({
                        'status': 'success',
                        'message': 'Timer resumed',
                        'action': 'resume_timer',
                        'timer_session': {
                            'id': paused_session.id,
                            'status': paused_session.status,
                            'elapsed_time': str(paused_session.elapsed_time),
                            'remaining_time': str(paused_session.remaining_time)
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Failed to resume timer'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            else:
                return Response({
                    'status': 'error',
                    'message': f'Invalid action: {action}. Valid actions: apply_settings, start_timer, stop_timer, pause_timer, resume_timer'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Timer API POST error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Timer operation failed: {str(e)}'
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
        - Create database tables (already done via migrations)
        - Sync employees from CRM
        - Initialize default timer settings
        """
        try:
            # Sync employees from CRM
            sync_result = crm_service.sync_employees_from_crm()
            
            # Get employee count
            total_employees = Employee.objects.filter(is_active=True).count()
            
            return Response({
                "status": "success",
                "message": "Timer system setup completed",
                "setup_results": {
                    "database_tables": "Created via Django migrations",
                    "crm_sync": sync_result,
                    "total_employees": total_employees,
                    "default_timer_duration": "5 minutes (3, 5, or 10 supported)",
                    "screenshot_interval": "1 second"
                },
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Timer Setup API error: {e}")
            return Response({
                "status": "error",
                "message": f"Setup failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
