from django.urls import path
from django.http import JsonResponse
from django.views import View

def simple_search_view(request):
    """Simple test view for users search"""
    search_query = request.GET.get('q', '')
    
    return JsonResponse({
        "status": "success",
        "message": f"Users search API is working! Query: '{search_query}'",
        "data": {
            "search_query": search_query,
            "test_users": [
                {
                    "email": "haseebcodejourney@gmail.com",
                    "display_name": "haseebcodejourney",
                    "status": "active"
                },
                {
                    "email": "nawaz@dxdglobal.com", 
                    "display_name": "nawaz",
                    "status": "active"
                }
            ],
            "total_count": 2
        }
    })

app_name = 'users'

urlpatterns = [
    # Simple test endpoint
    path('users/search/', simple_search_view, name='users-search'),
    path('users/test/', simple_search_view, name='users-test'),
]
