import os
import django
from django.test import RequestFactory
from django.http import QueryDict

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.users.user_screenshots_api import UserScreenshotsAPI

# Create a test request
factory = RequestFactory()
request = factory.get('/api/users/screenshots/', {
    'q': 'kadircagtas_at_gmail.com',
    'start_date': '2025-08-01',
    'end_date': '2025-08-31',
    'page': 1,
    'page_size': 10
})

# Test the view
try:
    view = UserScreenshotsAPI()
    response = view.get(request)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Data:")
    print(response.data)
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
