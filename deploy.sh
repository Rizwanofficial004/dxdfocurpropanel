#!/bin/bash

# Deployment Script for DDS Focus Time API
# Run this script on your server after uploading the code

set -e  # Exit on any error

echo "🚀 Starting deployment of DDS Focus Time API..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python 3.11 and required packages
echo "🐍 Installing Python and dependencies..."
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
sudo apt install -y postgresql postgresql-contrib nginx redis-server
sudo apt install -y git curl wget unzip

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /var/www/ddsfocustime
sudo chown $USER:$USER /var/www/ddsfocustime
cd /var/www/ddsfocustime

# Create virtual environment
echo "🔧 Creating virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python packages..."
pip install --upgrade pip
pip install -r requirements-production.txt

# Set up PostgreSQL database
echo "🗄️ Setting up PostgreSQL database..."
sudo -u postgres createdb ddsfocustime || echo "Database already exists"
sudo -u postgres createuser ddsfocustime || echo "User already exists"
sudo -u postgres psql -c "ALTER USER ddsfocustime CREATEDB;"

# Copy environment file
echo "⚙️ Setting up environment variables..."
cp .env.production .env
echo "🚨 IMPORTANT: Edit the .env file with your actual values!"

# Run Django migrations
echo "🔄 Running database migrations..."
python manage.py migrate

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser (optional)
echo "👤 Creating superuser (you'll be prompted)..."
python manage.py createsuperuser --noinput --username admin --email admin@example.com || echo "Superuser already exists"

# Set up systemd service
echo "🔧 Setting up systemd service..."
sudo tee /etc/systemd/system/ddsfocustime.service > /dev/null <<EOF
[Unit]
Description=DDS Focus Time API
After=network.target

[Service]
User=$USER
Group=www-data
WorkingDirectory=/var/www/ddsfocustime
Environment="PATH=/var/www/ddsfocustime/venv/bin"
ExecStart=/var/www/ddsfocustime/venv/bin/gunicorn --workers 3 --bind unix:/var/www/ddsfocustime/ddsfocustime.sock DDS.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start and enable the service
echo "🚀 Starting the application service..."
sudo systemctl daemon-reload
sudo systemctl start ddsfocustime
sudo systemctl enable ddsfocustime

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ddsfocustime > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /var/www/ddsfocustime;
    }
    
    location /media/ {
        root /var/www/ddsfocustime;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/ddsfocustime/ddsfocustime.sock;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/ddsfocustime /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /var/www/ddsfocustime/.env with your actual values"
echo "2. Update your domain name in /etc/nginx/sites-available/ddsfocustime"
echo "3. Set up SSL certificate with: sudo certbot --nginx"
echo "4. Restart services: sudo systemctl restart ddsfocustime nginx"
echo ""
echo "🌐 Your API should be available at: http://your-domain.com/api/test/"
echo "📊 Admin panel: http://your-domain.com/admin/"
