"""
Test settings for DDSFocusProPanel project.

This file contains settings specific to running tests.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Database configuration for testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Password hashers - use faster hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable migrations during testing
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Email backend for testing
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Cache configuration for testing
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Celery configuration for testing
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Media files for testing
MEDIA_ROOT = '/tmp/media/'

# Logging configuration for testing
LOGGING['handlers']['console']['level'] = 'CRITICAL'
LOGGING['loggers']['django']['level'] = 'CRITICAL'

# Test-specific settings
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# Disable throttling in tests
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {}

# Allow all hosts in testing
ALLOWED_HOSTS = ['*']
