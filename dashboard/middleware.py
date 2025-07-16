from django.shortcuts import redirect
from django.urls import reverse

class RedirectInvalidURLMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if response.status_code == 404:
            if request.user.is_authenticated:
                return redirect(reverse('dashboard'))  # ✅ Correct name from your urls.py
            else:
                return redirect(reverse('login'))      # ✅ Already correct

        return response
