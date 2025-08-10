# Production Environment Checklist

## Critical Environment Variables Required on Production Server

Create `/path/to/your/django/project/.env` file with these values:

```bash
# Django Core Settings
DEBUG=False
SECRET_KEY=your-unique-secret-key-different-from-local
ALLOWED_HOSTS=dxdtime.ddsolutions.io,www.dxdtime.ddsolutions.io,147.93.122.202

# AWS S3 Configuration (CRITICAL for your screenshot API)
AWS_ACCESS_KEY_ID=AKIARSU6EUUWMQ5I2JWC
AWS_SECRET_ACCESS_KEY=sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS
AWS_REGION=eu-north-1
AWS_STORAGE_BUCKET_NAME=ddsfocustime

# Database (if using MySQL in production)
DATABASE_URL=mysql://username:password@localhost:3306/ddsfocustime
# OR for SQLite (simpler for testing)
# DATABASE_URL=sqlite:///db.sqlite3

# CORS Settings
CORS_ALLOWED_ORIGINS=https://dxdtime.ddsolutions.io,https://www.dxdtime.ddsolutions.io
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOW_CREDENTIALS=True
```

## Installation Commands for Production Server

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install additional packages that might be missing
pip install python-dotenv
pip install django-cors-headers
pip install boto3
pip install requests

# 3. Run Django migrations
python manage.py migrate

# 4. Collect static files
python manage.py collectstatic --noinput

# 5. Test Django directly (bypass web server)
python manage.py runserver 0.0.0.0:8000
```

## Common Issues and Fixes

### 1. Missing python-dotenv
```bash
pip install python-dotenv
```

### 2. Missing AWS credentials
Make sure AWS keys are set in environment or .env file

### 3. Database connection issues
Check if database server is running and accessible

### 4. CORS configuration
Make sure CORS is properly configured for the domain

### 5. Python version compatibility
Ensure production Python version matches development

## Testing Commands

```bash
# Test API endpoint directly on server
curl -X GET "http://localhost:8000/api/screenshots/employee/haseebcodejourney@gmail.com/folders/" \
  -H "Accept: application/json"

# Test with debug info
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DATABASES)
>>> print(settings.AWS_ACCESS_KEY_ID)
```
