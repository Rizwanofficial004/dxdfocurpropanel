#!/bin/bash

# Production Deployment Script for DDS Focus Time API
# Run this script on your production server to deploy the application

set -e  # Exit on any error

echo "🚀 DDS FOCUS TIME API - PRODUCTION DEPLOYMENT"
echo "=============================================="

# Configuration
PROJECT_DIR="/var/www/dxdtime"  # Adjust this to your actual project directory
VENV_DIR="$PROJECT_DIR/venv"
DJANGO_DIR="$PROJECT_DIR"
USER="www-data"  # Adjust this to your web server user

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root or with sudo"
    exit 1
fi

# Step 1: Install system dependencies
echo "📦 Installing system dependencies..."
apt-get update
apt-get install -y python3 python3-pip python3-venv python3-dev
apt-get install -y mysql-server mysql-client libmysqlclient-dev  # If using MySQL
apt-get install -y apache2 libapache2-mod-wsgi-py3  # If using Apache
# apt-get install -y nginx  # If using Nginx instead

print_status "System dependencies installed"

# Step 2: Create project directory and set permissions
echo "📁 Setting up project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Copy your project files here (you need to upload them first)
print_warning "Make sure your Django project files are in $PROJECT_DIR"

# Step 3: Create virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv $VENV_DIR
source $VENV_DIR/bin/activate

print_status "Virtual environment created"

# Step 4: Install Python dependencies
echo "📦 Installing Python packages..."
pip install --upgrade pip
pip install django
pip install boto3
pip install django-cors-headers
pip install python-dotenv
pip install requests
pip install mysqlclient  # If using MySQL
pip install gunicorn  # For production WSGI server

print_status "Python packages installed"

# Step 5: Create environment file
echo "🌍 Creating production environment file..."
cat > $DJANGO_DIR/.env << EOF
# Production Environment Configuration
DEBUG=False
SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
ALLOWED_HOSTS=dxdtime.ddsolutions.io,www.dxdtime.ddsolutions.io,147.93.122.202

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIARSU6EUUWMQ5I2JWC
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=eu-north-1
AWS_STORAGE_BUCKET_NAME=ddsfocustime

# Database (SQLite for simplicity)
DATABASE_URL=sqlite:///db.sqlite3

# CORS Settings
CORS_ALLOWED_ORIGINS=https://dxdtime.ddsolutions.io,https://www.dxdtime.ddsolutions.io
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOW_CREDENTIALS=True

# Static Files
STATIC_URL=/static/
STATIC_ROOT=$PROJECT_DIR/static/
MEDIA_URL=/media/
MEDIA_ROOT=$PROJECT_DIR/media/
EOF

print_status "Environment file created"

# Step 6: Django setup
echo "🔧 Setting up Django..."
cd $DJANGO_DIR

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser (optional)
print_warning "You may want to create a superuser: python manage.py createsuperuser"

print_status "Django setup completed"

# Step 7: Set file permissions
echo "🔒 Setting file permissions..."
chown -R $USER:$USER $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 644 $PROJECT_DIR/static/
chmod 600 $PROJECT_DIR/.env

print_status "File permissions set"

# Step 8: Test Django directly
echo "🧪 Testing Django application..."
cd $DJANGO_DIR

# Test if Django can start
python manage.py check

print_status "Django application check passed"

# Step 9: Configure web server (Apache example)
if command -v apache2 &> /dev/null; then
    echo "🌐 Configuring Apache..."
    
    # Create Apache virtual host configuration
    cat > /etc/apache2/sites-available/dxdtime.conf << EOF
<VirtualHost *:80>
    ServerName dxdtime.ddsolutions.io
    DocumentRoot $PROJECT_DIR
    
    WSGIDaemonProcess dxdtime python-home=$VENV_DIR python-path=$DJANGO_DIR
    WSGIProcessGroup dxdtime
    WSGIScriptAlias / $DJANGO_DIR/DDS/wsgi.py
    
    Alias /static/ $PROJECT_DIR/static/
    <Directory $PROJECT_DIR/static/>
        Require all granted
    </Directory>
    
    <Directory $DJANGO_DIR/DDS>
        <Files wsgi.py>
            Require all granted
        </Files>
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/dxdtime_error.log
    CustomLog \${APACHE_LOG_DIR}/dxdtime_access.log combined
</VirtualHost>
EOF

    # Enable the site
    a2ensite dxdtime.conf
    a2enmod wsgi
    a2dissite 000-default.conf  # Disable default site
    
    # Restart Apache
    systemctl restart apache2
    
    print_status "Apache configured and restarted"
fi

# Step 10: Create systemd service for Gunicorn (alternative to Apache mod_wsgi)
echo "🔄 Creating Gunicorn service..."
cat > /etc/systemd/system/dxdtime.service << EOF
[Unit]
Description=DDS Focus Time API
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$DJANGO_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 DDS.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable dxdtime.service
systemctl start dxdtime.service

print_status "Gunicorn service created and started"

# Step 11: Final tests
echo "🧪 Running final tests..."

# Test if the service is running
if systemctl is-active --quiet dxdtime.service; then
    print_status "Django service is running"
else
    print_error "Django service is not running"
    systemctl status dxdtime.service
fi

# Test API endpoint
sleep 5  # Wait for service to fully start
if curl -f http://localhost:8000/api/ &> /dev/null; then
    print_status "API endpoint is responding"
else
    print_warning "API endpoint test failed - check logs"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "📋 Next steps:"
echo "1. Test your API: curl http://your-server-ip:8000/api/"
echo "2. Check logs: journalctl -u dxdtime.service"
echo "3. Configure SSL certificate for HTTPS"
echo "4. Set up domain DNS to point to your server"
echo ""
echo "📊 Service commands:"
echo "- Start:   sudo systemctl start dxdtime.service"
echo "- Stop:    sudo systemctl stop dxdtime.service"
echo "- Restart: sudo systemctl restart dxdtime.service"
echo "- Status:  sudo systemctl status dxdtime.service"
echo "- Logs:    sudo journalctl -u dxdtime.service -f"
echo ""
echo "🐛 Troubleshooting:"
echo "- Django logs: sudo journalctl -u dxdtime.service"
echo "- Apache logs: sudo tail -f /var/log/apache2/dxdtime_error.log"
echo "- Test Django directly: cd $DJANGO_DIR && python manage.py runserver 0.0.0.0:8001"
