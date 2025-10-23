from django.urls import path
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "healthy", "message": "API is running"})

app_name = 'health'

urlpatterns = [
    path('', health_check, name='health-check'),
]
