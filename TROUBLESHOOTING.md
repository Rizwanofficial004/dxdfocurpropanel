# 🔧 Production 500 Error Troubleshooting Guide

## Quick Diagnosis Commands

Run these commands on your production server to identify the issue:

```bash
# 1. Check if Django can start at all
python manage.py check

# 2. Check if all migrations are applied
python manage.py showmigrations

# 3. Test Django directly (bypass web server)
python manage.py runserver 0.0.0.0:8001

# 4. Test the specific failing endpoint
curl -v http://localhost:8001/api/screenshots/employee/haseebcodejourney@gmail.com/folders/

# 5. Check what packages are installed
pip list | grep -E "(django|boto3|cors)"

# 6. Check environment variables
env | grep -E "(AWS|DEBUG|SECRET)"

# 7. Check web server logs
tail -f /var/log/apache2/error.log
# OR
tail -f /var/log/nginx/error.log

# 8. Check Django service logs (if using systemd)
journalctl -u your-django-service -f
```

## Common 500 Error Causes & Fixes

### 1. Missing Environment Variables ⚠️ (Most Common)

**Symptoms:** 500 error on all endpoints, Django can't start

**Fix:**
```bash
# Create .env file in your Django project root
cat > .env << EOF
DEBUG=False
SECRET_KEY=your-secret-key-here
AWS_ACCESS_KEY_ID=AKIARSU6EUUWMQ5I2JWC
AWS_SECRET_ACCESS_KEY=sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS
AWS_REGION=eu-north-1
AWS_STORAGE_BUCKET_NAME=ddsfocustime
ALLOWED_HOSTS=dxdtime.ddsolutions.io,147.93.122.202
EOF
```

### 2. Missing Python Packages 📦

**Symptoms:** ImportError in logs, 500 on specific endpoints

**Fix:**
```bash
pip install boto3 django-cors-headers python-dotenv requests
```

### 3. Database Issues 🗄️

**Symptoms:** Database connection errors in logs

**Fix:**
```bash
# Apply migrations
python manage.py migrate

# Check database file permissions (if using SQLite)
ls -la db.sqlite3
chmod 664 db.sqlite3
```

### 4. File Permissions 📁

**Symptoms:** Permission denied errors in logs

**Fix:**
```bash
# Set correct ownership (replace www-data with your web server user)
sudo chown -R www-data:www-data /path/to/your/django/project

# Set correct permissions
sudo chmod -R 755 /path/to/your/django/project
sudo chmod 600 /path/to/your/django/project/.env
sudo chmod 664 /path/to/your/django/project/db.sqlite3
```

### 5. Web Server Configuration 🌐

**Symptoms:** Django works directly but fails through web server

**Apache Fix:**
```bash
# Check if mod_wsgi is enabled
sudo a2enmod wsgi

# Check virtual host configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

**Nginx Fix:**
```bash
# Check configuration syntax
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check if Django service is running
sudo systemctl status your-django-service
```

### 6. CORS Issues 🌍

**Symptoms:** 500 only from frontend, works with curl

**Fix in Django settings.py:**
```python
CORS_ALLOWED_ORIGINS = [
    "https://dxdtime.ddsolutions.io",
    "https://www.dxdtime.ddsolutions.io",
]
CORS_ALLOW_CREDENTIALS = True
```

### 7. SSL/HTTPS Issues 🔒

**Symptoms:** Works on HTTP but fails on HTTPS

**Fix:**
```bash
# Check SSL certificate
openssl x509 -in /path/to/certificate.crt -text -noout

# Check SSL configuration in web server
# Make sure certificate paths are correct
```

## Step-by-Step Debugging Process

### Step 1: Test Django Directly
```bash
cd /path/to/your/django/project
python manage.py runserver 0.0.0.0:8001
```

If this fails → Django configuration issue (environment, packages, database)
If this works → Web server configuration issue

### Step 2: Test Specific Endpoint
```bash
curl -v http://localhost:8001/api/screenshots/employee/haseebcodejourney@gmail.com/folders/
```

### Step 3: Check Logs
```bash
# Django service logs
journalctl -u your-service-name -f

# Web server logs
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log
```

### Step 4: Enable Django Debug Mode Temporarily
```python
# In settings.py (TEMPORARILY)
DEBUG = True
ALLOWED_HOSTS = ['*']
```

**⚠️ IMPORTANT: Disable debug mode after fixing!**

## Emergency Fix Script

Create this script to automatically fix common issues:

```bash
#!/bin/bash
# emergency_fix.sh

set -e

echo "🚨 Emergency Production Fix"

# Install missing packages
pip install boto3 django-cors-headers python-dotenv requests

# Apply migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Fix permissions
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod 600 .env
sudo chmod 664 db.sqlite3

# Restart services
sudo systemctl restart apache2
# OR
sudo systemctl restart nginx
sudo systemctl restart your-django-service

echo "✅ Emergency fix complete"
```

## Contact Information

If you're still experiencing issues:

1. Run the `quick_health_check.py` script
2. Run the `debug_production.py` script  
3. Check the specific error messages in logs
4. Test with the Django development server
5. Compare working local environment with production

The 500 error you're experiencing is likely due to missing environment variables or Python packages, since it affects even the base `/api/` endpoint.
