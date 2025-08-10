#!/bin/bash
# Daily Screenshot Counter Cron Job
# Add this to your crontab to run daily at 2 AM:
# 0 2 * * * /path/to/your/project/daily_screenshot_cron.sh

# Set up environment
export PATH="/usr/local/bin:/usr/bin:/bin"
cd "$(dirname "$0")"

# Activate virtual environment if you're using one
# source venv/bin/activate

# Log file
LOG_FILE="logs/screenshot_counter_$(date +%Y%m%d).log"
mkdir -p logs

echo "========================================" >> "$LOG_FILE"
echo "Daily Screenshot Count - $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Method 1: Using Django management command
echo "Running Django management command..." >> "$LOG_FILE"
python manage.py process_screenshot_inventory >> "$LOG_FILE" 2>&1

# Method 2: Alternative - using standalone script
# echo "Running standalone script..." >> "$LOG_FILE"
# python daily_screenshot_counter.py >> "$LOG_FILE" 2>&1

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "✅ Screenshot counting completed successfully at $(date)" >> "$LOG_FILE"
else
    echo "❌ Screenshot counting failed at $(date)" >> "$LOG_FILE"
    # Send notification email or alert (optional)
    # echo "Daily screenshot counting failed" | mail -s "Screenshot Counter Failed" admin@example.com
fi

echo "" >> "$LOG_FILE"
