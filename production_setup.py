#!/usr/bin/env python3
"""
Production Deployment Script
===========================

Script to set up the auto-scheduling system for production deployment.
"""

import os
import sys
import subprocess

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    
    packages = [
        'APScheduler==3.10.4',
        'django>=4.0',
        'boto3',
        'python-dotenv'
    ]
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ Installed: {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install: {package}")

def setup_production():
    """Set up production environment"""
    print("\n🚀 Setting up production environment...")
    
    # Create necessary directories
    os.makedirs('logs', exist_ok=True)
    os.makedirs('dashboard/data', exist_ok=True)
    
    print("✅ Created necessary directories")
    
    # Set up environment variables
    print("\n📋 Environment Setup:")
    print("Make sure you have these environment variables set:")
    print("- AWS_ACCESS_KEY_ID")
    print("- AWS_SECRET_ACCESS_KEY") 
    print("- AWS_DEFAULT_REGION")
    print("- DATABASE_URL (for production database)")
    
def create_systemd_service():
    """Create systemd service for Linux production"""
    service_content = """[Unit]
Description=Django Screenshot Tracker
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/path/to/your/project
Environment=DJANGO_SETTINGS_MODULE=DDS.settings
ExecStart=/path/to/your/venv/bin/python manage.py runserver 0.0.0.0:8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
"""
    
    with open('screenshot-tracker.service', 'w') as f:
        f.write(service_content)
    
    print("✅ Created systemd service file: screenshot-tracker.service")
    print("To install on Linux:")
    print("1. sudo cp screenshot-tracker.service /etc/systemd/system/")
    print("2. sudo systemctl daemon-reload")
    print("3. sudo systemctl enable screenshot-tracker")
    print("4. sudo systemctl start screenshot-tracker")

def create_docker_setup():
    """Create Docker setup files"""
    dockerfile_content = """FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
"""
    
    docker_compose_content = """version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DJANGO_SETTINGS_MODULE=DDS.settings
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
    volumes:
      - .:/app
    restart: unless-stopped
"""
    
    with open('Dockerfile', 'w') as f:
        f.write(dockerfile_content)
    
    with open('docker-compose.yml', 'w') as f:
        f.write(docker_compose_content)
    
    print("✅ Created Docker files")
    print("To run with Docker:")
    print("1. docker-compose up -d")

def main():
    print("=" * 60)
    print("🚀 PRODUCTION SETUP FOR AUTO SCREENSHOT SCHEDULER")
    print("=" * 60)
    
    install_requirements()
    setup_production()
    create_systemd_service()
    create_docker_setup()
    
    print("\n" + "=" * 60)
    print("✅ SETUP COMPLETE!")
    print("=" * 60)
    print("\n📋 HOW IT WORKS:")
    print("1. When Django starts, the scheduler automatically starts")
    print("2. Updates run every 6 hours automatically")
    print("3. No manual intervention required")
    print("4. Check status with: /api/scheduler/status/")
    print("5. View logs in: scheduler.log")
    
    print("\n🔧 API ENDPOINTS:")
    print("- /api/scheduler/status/ - Check scheduler status")
    print("- /api/users/screenshots-count/ - Get user screenshot counts")
    print("- /api/users/screenshots-summary/ - Get summary statistics")

if __name__ == "__main__":
    main()
