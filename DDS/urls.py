from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from dashboard.views import language_redirect_view  # 👈 Auto-redirect view
from django.views.i18n import set_language  # 👈 Import the set_language view

urlpatterns = [
    path('', language_redirect_view),  # 👈 Redirects `/` based on browser language
    path('i18n/', include('django.conf.urls.i18n')),
    path('set-language/', set_language, name='set_language'),  # 👈 Add URL for language switching
    
    # API URLs (outside i18n_patterns to avoid language prefix requirement)
    path('api/', include('dashboard.api_urls')),
]

# Language-prefixed URLs
urlpatterns += i18n_patterns(
    path('admin/', admin.site.urls),
    path('', include('dashboard.urls')),
    prefix_default_language=True,
)

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
