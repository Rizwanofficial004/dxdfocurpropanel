@echo off
REM Windows batch script for cron job
REM Use Windows Task Scheduler to run this every 6 hours

cd /d "c:\Users\deniz\OneDrive\Email attachments\Masaüstü\Git-Projects\dxdfocurpropanel"

REM Log the start time
echo %date% %time%: Starting screenshot update job >> cron_job.log

REM Run the Django management command
python manage.py track_screenshots --update-now >> cron_job.log 2>&1

REM Log completion
echo %date% %time%: Screenshot update job completed >> cron_job.log
echo ---------------------------------------- >> cron_job.log
