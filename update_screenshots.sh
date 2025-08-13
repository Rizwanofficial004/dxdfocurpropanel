#!/bin/bash
# Cron job script to update screenshots every 6 hours
# Add this to crontab: 0 */6 * * * /path/to/update_screenshots.sh

cd "c:\Users\deniz\OneDrive\Email attachments\Masaüstü\Git-Projects\dxdfocurpropanel"

# Log the start time
echo "$(date): Starting screenshot update job" >> cron_job.log

# Run the Django management command
python manage.py track_screenshots --update-now >> cron_job.log 2>&1

# Log completion
echo "$(date): Screenshot update job completed" >> cron_job.log
echo "----------------------------------------" >> cron_job.log
