#!/usr/bin/env python3
"""
Simple Health Check API - No authentication required
"""

import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@require_http_methods(["GET"])
def health_api(request):
    """
    Simple health check API endpoint
    """
    return JsonResponse({
        'status': 'ok',
        'message': 'API is working',
        'timestamp': datetime.now().isoformat(),
        'server': 'Django 5.2'
    })
