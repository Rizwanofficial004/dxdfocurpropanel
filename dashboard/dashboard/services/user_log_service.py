from django.http import JsonResponse
from dashboard.models import User_Logs

def get_filtered_logs(param):
    logs = User_Logs.objects.filter(**param).values('staffid', 'email', 'jsonlog', 'date')
    return JsonResponse({'logs': list(logs)})