"""
Timer API - Employee Timer Management System

This module provides timer functionality for employees including:
- Start/Stop timer
- Set timer duration in minutes and seconds
- Apply timer settings
- Timer status tracking
- Timer history
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
from collections import defaultdict

logger = logging.getLogger(__name__)

# In-memory timer storage (in production, use database)
TIMER_STORAGE = {
    "active_timers": {},  # email: timer_data
    "timer_history": [],  # list of completed timers
    "timer_settings": {}  # email: user_timer_settings
}


@method_decorator(csrf_exempt, name='dispatch')
class TimerAPIView(APIView):
    """
    Timer API - Employee Timer Management
    
    GET /api/Timer - Get timer status and settings
    POST /api/Timer - Start/Stop timer or apply timer settings
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        GET /api/Timer
        
        Get current timer status and settings for all employees
        """
        try:
            logger.info("Fetching timer status and settings")
            
            # Get query parameters
            email = request.GET.get('email', None)
            action = request.GET.get('action', 'status')  # status, history, settings
            
            if email:
                # Get specific employee timer data
                timer_data = self._get_employee_timer_data(email)
                
                response_data = {
                    "status": "success",
                    "message": f"Timer data retrieved for {email}",
                    "data": {
                        "employee": email,
                        "timer": timer_data,
                        "action": action
                    },
                    "meta": {
                        "timestamp": datetime.now().isoformat(),
                        "api_version": "1.0.0",
                        "endpoint": "/api/Timer"
                    }
                }
            else:
                # Get all employees timer data
                all_timers = self._get_all_timers_data()
                
                response_data = {
                    "status": "success",
                    "message": "All timer data retrieved successfully",
                    "data": {
                        "active_timers": all_timers["active"],
                        "timer_settings": all_timers["settings"],
                        "history_count": len(TIMER_STORAGE["timer_history"]),
                        "total_active_timers": len(TIMER_STORAGE["active_timers"])
                    },
                    "meta": {
                        "timestamp": datetime.now().isoformat(),
                        "api_version": "1.0.0",
                        "endpoint": "/api/Timer",
                        "features": ["timer_management", "timer_history", "timer_settings"]
                    }
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching timer data: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to fetch timer data: {str(e)}",
                "data": {
                    "active_timers": {},
                    "timer_settings": {},
                    "error": str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        POST /api/Timer
        
        Timer actions:
        - start_timer: Start a new timer
        - stop_timer: Stop current timer
        - apply_settings: Apply timer settings
        - reset_timer: Reset timer
        """
        try:
            # Handle both JSON and form data
            try:
                if hasattr(request, 'data') and request.data:
                    data = dict(request.data)
                else:
                    data = json.loads(request.body.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError) as e:
                return Response({
                    "status": "error",
                    "message": f"Invalid request format: {str(e)}",
                    "data": {"error": str(e)}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            action = data.get('action')
            email = data.get('email')
            
            if not email:
                return Response({
                    "status": "error",
                    "message": "Email is required",
                    "data": {}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not action:
                return Response({
                    "status": "error",
                    "message": "Action is required",
                    "data": {}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"Timer action '{action}' requested for {email}")
            
            if action == "start_timer":
                result = self._start_timer(email, data)
            elif action == "stop_timer":
                result = self._stop_timer(email, data)
            elif action == "apply_settings":
                result = self._apply_timer_settings(email, data)
            elif action == "reset_timer":
                result = self._reset_timer(email, data)
            elif action == "pause_timer":
                result = self._pause_timer(email, data)
            elif action == "resume_timer":
                result = self._resume_timer(email, data)
            else:
                return Response({
                    "status": "error",
                    "message": f"Invalid action: {action}. Valid actions: start_timer, stop_timer, apply_settings, reset_timer, pause_timer, resume_timer",
                    "data": {}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(result, status=status.HTTP_200_OK)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Invalid JSON format: {str(e)}",
                "data": {"error": str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error processing timer action: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to process timer action: {str(e)}",
                "data": {"error": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_employee_timer_data(self, email):
        """Get timer data for specific employee"""
        active_timer = TIMER_STORAGE["active_timers"].get(email, None)
        timer_settings = TIMER_STORAGE["timer_settings"].get(email, {})
        
        # Calculate current timer status if active
        if active_timer:
            current_time = datetime.now()
            if active_timer.get("status") == "running":
                elapsed = (current_time - datetime.fromisoformat(active_timer["start_time"])).total_seconds()
                active_timer["elapsed_seconds"] = int(elapsed)
                active_timer["elapsed_formatted"] = self._format_duration(elapsed)
                
                # Check if timer has exceeded set duration
                if "duration_seconds" in active_timer and elapsed >= active_timer["duration_seconds"]:
                    active_timer["status"] = "completed"
                    active_timer["completed_time"] = current_time.isoformat()
        
        return {
            "active_timer": active_timer,
            "settings": timer_settings,
            "history": [h for h in TIMER_STORAGE["timer_history"] if h["email"] == email][-5:],  # Last 5 entries
            "has_active_timer": active_timer is not None and active_timer.get("status") in ["running", "paused"]
        }
    
    def _get_all_timers_data(self):
        """Get all timers data"""
        current_time = datetime.now()
        active_timers = {}
        
        # Update all active timers
        for email, timer in TIMER_STORAGE["active_timers"].items():
            if timer.get("status") == "running":
                elapsed = (current_time - datetime.fromisoformat(timer["start_time"])).total_seconds()
                timer["elapsed_seconds"] = int(elapsed)
                timer["elapsed_formatted"] = self._format_duration(elapsed)
                
                # Check if timer completed
                if "duration_seconds" in timer and elapsed >= timer["duration_seconds"]:
                    timer["status"] = "completed"
                    timer["completed_time"] = current_time.isoformat()
            
            active_timers[email] = timer
        
        return {
            "active": active_timers,
            "settings": TIMER_STORAGE["timer_settings"]
        }
    
    def _start_timer(self, email, data):
        """Start a new timer for employee"""
        # Stop any existing timer first
        if email in TIMER_STORAGE["active_timers"]:
            existing_timer = TIMER_STORAGE["active_timers"][email]
            if existing_timer.get("status") == "running":
                self._stop_timer(email, {"save_to_history": False})
        
        # Get timer duration from data or settings
        minutes = data.get('minutes', 0)
        seconds = data.get('seconds', 0)
        total_seconds = (minutes * 60) + seconds
        
        # If no duration provided, check user settings
        if total_seconds == 0:
            user_settings = TIMER_STORAGE["timer_settings"].get(email, {})
            total_seconds = user_settings.get("default_duration_seconds", 1800)  # Default 30 minutes
        
        start_time = datetime.now()
        
        timer_data = {
            "email": email,
            "start_time": start_time.isoformat(),
            "duration_seconds": total_seconds,
            "duration_formatted": self._format_duration(total_seconds),
            "status": "running",
            "task_description": data.get('task_description', 'Work Session'),
            "timer_id": f"{email}_{int(start_time.timestamp())}",
            "elapsed_seconds": 0,
            "elapsed_formatted": "00:00:00"
        }
        
        TIMER_STORAGE["active_timers"][email] = timer_data
        
        return {
            "status": "success",
            "message": f"Timer started for {email}",
            "data": {
                "timer": timer_data,
                "action": "start_timer",
                "duration_minutes": minutes,
                "duration_seconds": seconds,
                "total_duration": total_seconds
            },
            "meta": {
                "timestamp": datetime.now().isoformat(),
                "api_version": "1.0.0"
            }
        }
    
    def _stop_timer(self, email, data):
        """Stop current timer for employee"""
        if email not in TIMER_STORAGE["active_timers"]:
            return {
                "status": "error",
                "message": f"No active timer found for {email}",
                "data": {}
            }
        
        timer = TIMER_STORAGE["active_timers"][email]
        end_time = datetime.now()
        start_time = datetime.fromisoformat(timer["start_time"])
        elapsed_seconds = (end_time - start_time).total_seconds()
        
        # Update timer data
        timer["end_time"] = end_time.isoformat()
        timer["elapsed_seconds"] = int(elapsed_seconds)
        timer["elapsed_formatted"] = self._format_duration(elapsed_seconds)
        timer["status"] = "completed"
        
        # Save to history if requested
        save_to_history = data.get('save_to_history', True)
        if save_to_history:
            TIMER_STORAGE["timer_history"].append({
                **timer,
                "completed_at": end_time.isoformat()
            })
        
        # Remove from active timers
        del TIMER_STORAGE["active_timers"][email]
        
        return {
            "status": "success",
            "message": f"Timer stopped for {email}",
            "data": {
                "timer": timer,
                "action": "stop_timer",
                "elapsed_seconds": int(elapsed_seconds),
                "elapsed_formatted": self._format_duration(elapsed_seconds)
            },
            "meta": {
                "timestamp": datetime.now().isoformat(),
                "api_version": "1.0.0"
            }
        }
    
    def _apply_timer_settings(self, email, data):
        """Apply timer settings for employee"""
        minutes = data.get('minutes', 30)
        seconds = data.get('seconds', 0)
        total_seconds = (minutes * 60) + seconds
        
        settings = {
            "email": email,
            "default_duration_seconds": total_seconds,
            "default_duration_formatted": self._format_duration(total_seconds),
            "minutes": minutes,
            "seconds": seconds,
            "auto_start": data.get('auto_start', False),
            "notifications_enabled": data.get('notifications_enabled', True),
            "updated_at": datetime.now().isoformat()
        }
        
        TIMER_STORAGE["timer_settings"][email] = settings
        
        return {
            "status": "success",
            "message": f"Timer settings applied for {email}",
            "data": {
                "settings": settings,
                "action": "apply_settings",
                "button_clicked": True
            },
            "meta": {
                "timestamp": datetime.now().isoformat(),
                "api_version": "1.0.0"
            }
        }
    
    def _reset_timer(self, email, data):
        """Reset timer for employee"""
        if email in TIMER_STORAGE["active_timers"]:
            del TIMER_STORAGE["active_timers"][email]
        
        return {
            "status": "success",
            "message": f"Timer reset for {email}",
            "data": {
                "action": "reset_timer",
                "email": email
            },
            "meta": {
                "timestamp": datetime.now().isoformat(),
                "api_version": "1.0.0"
            }
        }
    
    def _pause_timer(self, email, data):
        """Pause current timer"""
        if email not in TIMER_STORAGE["active_timers"]:
            return {
                "status": "error",
                "message": f"No active timer found for {email}",
                "data": {}
            }
        
        timer = TIMER_STORAGE["active_timers"][email]
        if timer.get("status") != "running":
            return {
                "status": "error",
                "message": f"Timer is not running for {email}",
                "data": {}
            }
        
        current_time = datetime.now()
        start_time = datetime.fromisoformat(timer["start_time"])
        elapsed = (current_time - start_time).total_seconds()
        
        timer["status"] = "paused"
        timer["paused_at"] = current_time.isoformat()
        timer["elapsed_seconds"] = int(elapsed)
        timer["elapsed_formatted"] = self._format_duration(elapsed)
        
        return {
            "status": "success",
            "message": f"Timer paused for {email}",
            "data": {
                "timer": timer,
                "action": "pause_timer"
            },
            "meta": {
                "timestamp": datetime.now().isoformat(),
                "api_version": "1.0.0"
            }
        }
    
    def _resume_timer(self, email, data):
        """Resume paused timer"""
        if email not in TIMER_STORAGE["active_timers"]:
            return {
                "status": "error",
                "message": f"No active timer found for {email}",
                "data": {}
            }
        
        timer = TIMER_STORAGE["active_timers"][email]
        if timer.get("status") != "paused":
            return {
                "status": "error",
                "message": f"Timer is not paused for {email}",
                "data": {}
            }
        
        current_time = datetime.now()
        paused_duration = (current_time - datetime.fromisoformat(timer["paused_at"])).total_seconds()
        
        # Adjust start time to account for paused duration
        original_start = datetime.fromisoformat(timer["start_time"])
        new_start_time = original_start + timedelta(seconds=paused_duration)
        
        timer["start_time"] = new_start_time.isoformat()
        timer["status"] = "running"
        timer["resumed_at"] = current_time.isoformat()
        
        if "paused_at" in timer:
            del timer["paused_at"]
        
        return {
            "status": "success",
            "message": f"Timer resumed for {email}",
            "data": {
                "timer": timer,
                "action": "resume_timer"
            },
            "meta": {
                "timestamp": datetime.now().isoformat(),
                "api_version": "1.0.0"
            }
        }
    
    def _format_duration(self, total_seconds):
        """Format duration in HH:MM:SS format"""
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        seconds = int(total_seconds % 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


class TimerHistoryAPIView(APIView):
    """
    Timer History API - Get timer history and statistics
    
    GET /api/Timer/History - Get timer history
    """
    
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Get timer history"""
        try:
            email = request.GET.get('email', None)
            limit = int(request.GET.get('limit', 10))
            
            if email:
                # Get history for specific employee
                history = [h for h in TIMER_STORAGE["timer_history"] if h["email"] == email]
            else:
                # Get all history
                history = TIMER_STORAGE["timer_history"]
            
            # Sort by completion time (newest first)
            history = sorted(history, key=lambda x: x.get("completed_at", ""), reverse=True)
            
            # Limit results
            history = history[:limit]
            
            # Calculate statistics
            if history:
                total_sessions = len(history)
                total_time = sum(h.get("elapsed_seconds", 0) for h in history)
                avg_session_time = total_time / total_sessions if total_sessions > 0 else 0
                
                stats = {
                    "total_sessions": total_sessions,
                    "total_time_seconds": total_time,
                    "total_time_formatted": self._format_duration(total_time),
                    "average_session_seconds": int(avg_session_time),
                    "average_session_formatted": self._format_duration(avg_session_time)
                }
            else:
                stats = {
                    "total_sessions": 0,
                    "total_time_seconds": 0,
                    "total_time_formatted": "00:00:00",
                    "average_session_seconds": 0,
                    "average_session_formatted": "00:00:00"
                }
            
            return Response({
                "status": "success",
                "message": "Timer history retrieved successfully",
                "data": {
                    "history": history,
                    "statistics": stats,
                    "email_filter": email,
                    "limit": limit
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "1.0.0",
                    "endpoint": "/api/Timer/History"
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching timer history: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to fetch timer history: {str(e)}",
                "data": {"error": str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _format_duration(self, total_seconds):
        """Format duration in HH:MM:SS format"""
        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        seconds = int(total_seconds % 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
