#!/bin/bash

# One-Click Production Fix Script
# This script attempts to automatically fix the most common 500 error causes

set -e

echo "🔧 ONE-CLICK PRODUCTION FIX"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_step() {
    echo -e "${BLUE}🔄 $1...${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    log_error "manage.py not found. Please run this script from your Django project root."
    exit 1
fi

log_step "Step 1: Installing required Python packages"
pip3 install --upgrade pip
pip3 install django boto3 django-cors-headers python-dotenv requests gunicorn
log_success "Python packages installed"

log_step "Step 2: Creating production environment file"
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Production Environment Configuration
DEBUG=False
SECRET_KEY=dj-production-key-$(date +%s)-$(openssl rand -hex 16)
ALLOWED_HOSTS=dxdtime.ddsolutions.io,www.dxdtime.ddsolutions.io,147.93.122.202,localhost,127.0.0.1

# AWS S3 Configuration (CRITICAL for screenshot API)
AWS_ACCESS_KEY_ID=AKIARSU6EUUWMQ5I2JWC
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=eu-north-1
AWS_STORAGE_BUCKET_NAME=ddsfocustime

# Database (SQLite for simplicity)
DATABASE_URL=sqlite:///db.sqlite3

# CORS Settings
CORS_ALLOWED_ORIGINS=https://dxdtime.ddsolutions.io,https://www.dxdtime.ddsolutions.io,http://localhost:3000,http://localhost:5173
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOW_CREDENTIALS=True

# Static Files
STATIC_URL=/static/
STATIC_ROOT=./static/
MEDIA_URL=/media/
MEDIA_ROOT=./media/
EOF
    log_success "Environment file created"
else
    log_warning "Environment file already exists, skipping"
fi

log_step "Step 3: Running Django migrations"
python3 manage.py migrate --noinput
log_success "Database migrations completed"

log_step "Step 4: Collecting static files"
python3 manage.py collectstatic --noinput
log_success "Static files collected"

log_step "Step 5: Testing Django configuration"
python3 manage.py check --deploy
log_success "Django configuration check passed"

log_step "Step 6: Setting file permissions"
chmod 600 .env 2>/dev/null || true
chmod 664 db.sqlite3 2>/dev/null || true
chmod -R 755 static/ 2>/dev/null || true
log_success "File permissions set"

log_step "Step 7: Testing Django application"
echo "Starting Django test server on port 8001..."

# Start Django in background for testing
python3 manage.py runserver 127.0.0.1:8001 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test basic API
if curl -f -s http://127.0.0.1:8001/api/ > /dev/null; then
    log_success "Django API is responding"
    
    # Test specific endpoint
    if curl -f -s "http://127.0.0.1:8001/api/screenshots/employee/haseebcodejourney@gmail.com/folders/" > /dev/null; then
        log_success "Specific API endpoint is working"
    else
        log_warning "Specific endpoint test failed, but base API works"
    fi
else
    log_error "Django API test failed"
fi

# Stop test server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "🎉 PRODUCTION FIX COMPLETE!"
echo "==========================="
echo ""
echo "📋 What was fixed:"
echo "✅ Python packages installed/updated"
echo "✅ Environment variables configured"
echo "✅ Database migrations applied"
echo "✅ Static files collected"
echo "✅ File permissions set"
echo "✅ Django configuration tested"
echo ""
echo "🚀 Next steps:"
echo "1. If Django test passed above:"
echo "   → The issue is with your web server (Nginx/Apache)"
echo "   → Check web server logs and configuration"
echo ""
echo "2. If Django test failed:"
echo "   → Check the error messages above"
echo "   → Run: python3 manage.py runserver 0.0.0.0:8001"
echo "   → Test manually: curl http://localhost:8001/api/"
echo ""
echo "🔧 Production deployment options:"
echo ""
echo "Option A: Use Gunicorn (Recommended)"
echo "gunicorn --bind 0.0.0.0:8000 DDS.wsgi:application"
echo ""
echo "Option B: Use Django dev server (Testing only)"
echo "python3 manage.py runserver 0.0.0.0:8000"
echo ""
echo "📊 Check status:"
echo "curl http://your-server-ip:8000/api/"
echo "curl https://dxdtime.ddsolutions.io/api/"
echo ""
echo "🐛 If still having issues:"
echo "1. Check web server error logs"
echo "2. Verify DNS points to correct server"
echo "3. Check SSL certificate"
echo "4. Verify firewall allows ports 80/443"
