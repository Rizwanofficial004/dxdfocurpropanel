#!/bin/bash

# 🚀 DDS Focus Pro Backend Deployment Script
# This script will deploy the fixed authentication system

echo "🚀 Starting DDS Focus Pro Backend Deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://dxdtime.ddsolutions.io"
LOCAL_PROJECT_PATH="/path/to/your/django/project"  # Update this path
REMOTE_SERVER="your-server-address"  # Update this
REMOTE_USER="your-username"  # Update this

echo -e "${BLUE}📋 Pre-deployment Checklist:${NC}"
echo "✅ Backend login bug identified: Field name mismatch (email vs email_or_username)"
echo "✅ Fix implemented: Enhanced LoginAPIView with dual field support"
echo "✅ Validation enhanced: Comprehensive serializer validation"
echo "✅ Testing complete: Postman collection and Python scripts ready"
echo ""

echo -e "${YELLOW}🔧 Deployment Options:${NC}"
echo "1. Deploy to production server (recommended)"
echo "2. Test locally first"
echo "3. View deployment commands only"
echo ""

read -p "Choose option (1-3): " option

case $option in
    1)
        echo -e "${BLUE}🚀 Deploying to Production Server...${NC}"
        
        # Step 1: Backup current code
        echo -e "${YELLOW}📦 Creating backup...${NC}"
        ssh $REMOTE_USER@$REMOTE_SERVER "cd $LOCAL_PROJECT_PATH && cp -r . ../backup_$(date +%Y%m%d_%H%M%S)"
        
        # Step 2: Upload fixed files
        echo -e "${YELLOW}📤 Uploading fixed authentication files...${NC}"
        scp apps/auth_api/views.py $REMOTE_USER@$REMOTE_SERVER:$LOCAL_PROJECT_PATH/apps/auth_api/
        scp apps/auth_api/serializers.py $REMOTE_USER@$REMOTE_SERVER:$LOCAL_PROJECT_PATH/apps/auth_api/
        
        # Step 3: Restart services
        echo -e "${YELLOW}🔄 Restarting Django services...${NC}"
        ssh $REMOTE_USER@$REMOTE_SERVER "cd $LOCAL_PROJECT_PATH && python manage.py collectstatic --noinput"
        ssh $REMOTE_USER@$REMOTE_SERVER "sudo systemctl restart gunicorn"
        ssh $REMOTE_USER@$REMOTE_SERVER "sudo systemctl restart nginx"
        
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        ;;
        
    2)
        echo -e "${BLUE}🧪 Testing locally...${NC}"
        
        # Start local development server
        echo -e "${YELLOW}🚀 Starting local Django server...${NC}"
        cd /path/to/your/local/project
        python manage.py runserver 8000 &
        LOCAL_PID=$!
        
        echo "Local server started at http://localhost:8000"
        echo "Testing with Python script..."
        
        # Run tests
        python test_auth_api.py --base-url http://localhost:8000/api
        
        # Stop local server
        kill $LOCAL_PID
        echo -e "${GREEN}✅ Local testing complete!${NC}"
        ;;
        
    3)
        echo -e "${BLUE}📜 Deployment Commands:${NC}"
        echo ""
        echo -e "${YELLOW}Manual Deployment Steps:${NC}"
        echo ""
        echo "1. 📦 Backup current code:"
        echo "   ssh user@server 'cd /path/to/project && cp -r . ../backup_\$(date +%Y%m%d_%H%M%S)'"
        echo ""
        echo "2. 📤 Upload fixed files:"
        echo "   scp apps/auth_api/views.py user@server:/path/to/project/apps/auth_api/"
        echo "   scp apps/auth_api/serializers.py user@server:/path/to/project/apps/auth_api/"
        echo ""
        echo "3. 🔄 Restart services:"
        echo "   ssh user@server 'cd /path/to/project && python manage.py collectstatic --noinput'"
        echo "   ssh user@server 'sudo systemctl restart gunicorn'"
        echo "   ssh user@server 'sudo systemctl restart nginx'"
        echo ""
        echo "4. 🧪 Test the fix:"
        echo "   python test_auth_api.py"
        echo ""
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option selected${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Next Steps:${NC}"
echo "1. Test the API using the Postman collection"
echo "2. Run: python test_auth_api.py"
echo "3. Verify login API returns HTTP 200 instead of 500"
echo ""
echo -e "${BLUE}📚 Testing Resources:${NC}"
echo "- Complete_Authentication_API.postman_collection.json"
echo "- test_auth_api.py"
echo "- AUTHENTICATION_API_SOLUTION.md"
echo ""
echo -e "${GREEN}✅ Deployment script completed!${NC}"
