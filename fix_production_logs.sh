#!/bin/bash
# Fix Logs Directory Permissions for Production Deployment
# This script should be run on the production server to fix permission issues

echo "🔧 Fixing logs directory permissions for production deployment..."

# Get the application directory
APP_DIR="/var/www/vhosts/backend-app"
LOGS_DIR="$APP_DIR/logs"

echo "📁 Creating logs directory: $LOGS_DIR"
mkdir -p "$LOGS_DIR"

echo "🔐 Setting proper permissions for logs directory"
# Make sure the web server user can write to logs directory
chown -R www-data:www-data "$LOGS_DIR" 2>/dev/null || chown -R apache:apache "$LOGS_DIR" 2>/dev/null || chown -R nginx:nginx "$LOGS_DIR" 2>/dev/null

# Set permissions: owner can read/write/execute, group can read/write, others can read
chmod 755 "$LOGS_DIR"
chmod 664 "$LOGS_DIR"/*.log 2>/dev/null || true

echo "📋 Creating placeholder log files with correct permissions"
touch "$LOGS_DIR/auto_scheduler.log"
touch "$LOGS_DIR/scheduler.log" 
touch "$LOGS_DIR/cron_job.log"

# Set permissions for log files
chmod 664 "$LOGS_DIR"/*.log
chown www-data:www-data "$LOGS_DIR"/*.log 2>/dev/null || chown apache:apache "$LOGS_DIR"/*.log 2>/dev/null || chown nginx:nginx "$LOGS_DIR"/*.log 2>/dev/null

echo "🧹 Cleaning up old log files in root directory"
cd "$APP_DIR"
rm -f auto_scheduler.log scheduler.log cron_job.log s3_log_extractor.log 2>/dev/null || true

echo "✅ Logs directory permissions fixed!"
echo "📊 Directory info:"
ls -la "$LOGS_DIR"

echo ""
echo "🚀 Ready for deployment!"
