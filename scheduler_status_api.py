#!/usr/bin/env python3
"""
Scheduler Status API
===================

API endpoint to check the status of the auto scheduler.
"""

import json
import os
import sys
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@require_http_methods(["GET", "POST"])
def scheduler_status_api(request):
    """
    API endpoint to check and control the auto scheduler
    
    GET: Returns scheduler status
    POST: Control scheduler (start/stop)
    """
    
    try:
        # Import scheduler functions
        from production_auto_scheduler import get_scheduler_status, start_auto_scheduler, stop_auto_scheduler
        
        if request.method == "GET":
            # Return scheduler status
            status = get_scheduler_status()
            
            response_data = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'scheduler': status,
                'message': 'Scheduler is running automatically every 6 hours' if status['is_running'] else 'Scheduler is not running'
            }
            
            return JsonResponse(response_data, json_dumps_params={'indent': 2})
            
        elif request.method == "POST":
            # Control scheduler
            data = json.loads(request.body) if request.body else {}
            action = data.get('action', '').lower()
            
            if action == 'start':
                start_auto_scheduler()
                message = "Scheduler started successfully"
            elif action == 'stop':
                stop_auto_scheduler()
                message = "Scheduler stopped successfully"
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid action. Use "start" or "stop"',
                    'timestamp': datetime.now().isoformat()
                }, status=400)
            
            status = get_scheduler_status()
            
            response_data = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'action': action,
                'message': message,
                'scheduler': status
            }
            
            return JsonResponse(response_data, json_dumps_params={'indent': 2})
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)
