from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Define the base directory (project root)
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key')  # Default secret key for local dev
DEBUG = True

# Allow network access for local development and production
ALLOWED_HOSTS = [
    'dxdtime.ddsolutions.io', 
    'www.dxdtime.ddsolutions.io', 
    '127.0.0.1', 
    'localhost', 
    '147.93.122.202', 
    '0.0.0.0',
    '172.27.0.1',  # Local network IP
    '*'  # Allow all hosts for development (remove in production)
]
FORCE_SCRIPT_NAME = ''

# Database connection settings for MySQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv("DB_NAME", "default_db_name"),
        'USER': os.getenv("DB_USER", "root"),
        'PASSWORD': os.getenv("DB_PASSWORD", ""),
        'HOST': os.getenv("DB_HOST", "localhost"),
        'PORT': os.getenv("DB_PORT", "3306"),
    }
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),# Updated to reflect actual static dir
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files (uploaded images, etc.)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'dashboard', 'media')


# Templates settings (for rendering HTML files)
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'dashboard' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Root URL configuration (URL routing)
ROOT_URLCONF = 'DDS.urls'

# Installed apps (modules or components of your Django app)
INSTALLED_APPS = [
    'django_crontab',
    'corsheaders',  # Add CORS headers support
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'dashboard.apps.DashboardConfig',

]

# Middleware configuration for handling requests/responses
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add CORS middleware at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # Ensure this is included and correctly ordered
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'dashboard.middleware.RedirectInvalidURLMiddleware',  # 👈 Add this line
]

# WSGI application configuration
WSGI_APPLICATION = 'DDS.wsgi.application'

# Password validation settings
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Localization and timezone settings
LANGUAGE_CODE = 'tr'  # Default language

LANGUAGES = [
    ('en', 'English'),
    ('tr', 'Türkçe'),
]

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),  # Ensure translations are stored here
]

USE_I18N = True
USE_L10N = True
USE_TZ = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
import os

BASE_PATH_LOG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_PATH_LOG, 'cron_job.log'),
        },
    },
    'loggers': {
        'django_cron': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}


CRONJOBS = [
    # ('*/10 * * * *', 'dashboard.cron.my_scheduled_job'),
    ('0 * * * *', 'dashboard.cron.my_scheduled_job')
]
# Import pymysql if using MySQL
import pymysql
pymysql.install_as_MySQLdb()

# Ensure .env file is loaded correctly
load_dotenv()

from django.utils.translation import gettext_lazy as _

# ===========================
# CORS Settings for React App
# ===========================

# Allow React development server to connect
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",   # React default port
    "http://127.0.0.1:3000",
    "http://localhost:5173",   # Vite default port
    "http://127.0.0.1:5173",
    "http://localhost:5174",   # Vite alternative port
    "http://127.0.0.1:5174",
    "https://dxdtime.ddsolutions.io",  # Production domain
]

# Allow credentials (cookies, sessions) to be sent
CORS_ALLOW_CREDENTIALS = True

# For development only - allows all origins (remove in production)
CORS_ALLOW_ALL_ORIGINS = True

# Allowed headers for CORS requests
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
]

# Allowed methods for CORS requests
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# CSRF Settings for API
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://dxdtime.ddsolutions.io",  # Production domain
]
