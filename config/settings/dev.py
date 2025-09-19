"""
Development settings for DDSFocusProPanel project.

This file contains settings specific to the development environment.
"""

from .base import *
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Database configuration - Use environment DATABASE_URL
# Check if we should use MySQL or SQLite based on DATABASE_URL
DATABASE_URL = env('DATABASE_URL', default='sqlite:///db.sqlite3')

if DATABASE_URL.startswith('mysql://'):
    # Use MySQL configuration from environment
    DATABASES = {
        'default': env.db('DATABASE_URL'),
        # SQLite fallback if needed
        'sqlite': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Use SQLite for development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        },
        # MySQL configuration (available when needed)
        'mysql': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('MYSQL_DATABASE', 'u906714182_sqlrrefdvdv'),
            'USER': os.getenv('MYSQL_USER', 'u906714182_root'),
            'PASSWORD': os.getenv('MYSQL_PASSWORD', 'Daniyal@123'),
            'HOST': os.getenv('MYSQL_HOST', '92.113.22.65'),
            'PORT': '3306',
            'OPTIONS': {
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
                'charset': 'utf8mb4',
            },
        }
    }

# Add development-specific apps
INSTALLED_APPS += [
    'django_extensions',
]

# Development middleware
# MIDDLEWARE += [
#     'debug_toolbar.middleware.DebugToolbarMiddleware',
# ]

# Debug toolbar configuration (disabled for now)
# if DEBUG:
#     import socket
#     hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
#     INTERNAL_IPS = [ip[: ip.rfind(".")] + ".1" for ip in ips] + ["127.0.0.1", "10.0.2.2"]

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Disable caching in development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Logging configuration for development
LOGGING['handlers']['console']['level'] = 'INFO'
LOGGING['loggers']['django']['level'] = 'INFO'

# Additional logging configuration to reduce verbosity
LOGGING['loggers']['django.utils.autoreload'] = {
    'handlers': ['console'],
    'level': 'WARNING',
    'propagate': False,
}

# Reduce file watching debug messages
LOGGING['loggers']['django.template'] = {
    'handlers': ['console'],
    'level': 'WARNING',
    'propagate': False,
}

# Allow all hosts in development
ALLOWED_HOSTS = ['*']

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Enable preflight max age to cache OPTIONS requests
CORS_PREFLIGHT_MAX_AGE = 86400

# Additional CORS headers for better frontend compatibility
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'access-control-allow-origin',
    'access-control-allow-headers',
    'access-control-allow-methods',
    'cache-control',
    'pragma',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://dxdtime.ddsolutions.io",
]

CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-csrftoken',
]

# Allow all HTTP methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
