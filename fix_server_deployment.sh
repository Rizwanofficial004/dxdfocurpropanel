#!/bin/bash
# Server Deployment Fix Script
# Run this on the server to fix the Git conflict with log files

echo "🔧 Fixing deployment conflicts on server..."
echo "==============================================="

# Navigate to the application directory
cd /var/www/vhosts/backend-app

# Show current status
echo "📊 Current Git status:"
git status

# Backup any important log files (optional)
echo "💾 Backing up log files..."
mkdir -p logs_backup
cp -f *.log logs_backup/ 2>/dev/null || echo "No log files to backup"

# Stash or remove local log files that conflict
echo "🗑️ Removing conflicting log files..."
rm -f auto_scheduler.log scheduler.log cron_job.log s3_log_extractor.log

# Create logs directory with proper permissions
echo "📁 Setting up logs directory..."
mkdir -p logs
chown -R www-data:www-data logs/ 2>/dev/null || chown -R apache:apache logs/ 2>/dev/null || chown -R nginx:nginx logs/ 2>/dev/null
chmod 755 logs/

# Reset any local changes to tracked files
echo "🔄 Resetting local changes..."
git reset --hard HEAD

# Force pull the latest changes
echo "⬇️ Pulling latest changes from repository..."
git pull origin back-end

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod +x *.sh 2>/dev/null || echo "No shell scripts to make executable"

# Restart services if needed
echo "🔄 Restarting services..."
# Uncomment the line below if you're using systemd
# systemctl restart your-django-app

# Or if using supervisor
# supervisorctl restart django-app

# Or if using traditional web server
# service apache2 restart
# service nginx restart

echo "✅ Deployment fix completed!"
echo "🚀 Your application should now deploy successfully."
