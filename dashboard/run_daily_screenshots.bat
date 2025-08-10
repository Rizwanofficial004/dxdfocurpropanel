@echo off
cd /d "C:\Users\DDS\Desktop\New folder"
echo %date% %time% - Starting daily screenshot count... >> daily_screenshot_cron.log
python direct_screenshot_counter.py >> daily_screenshot_cron.log 2>&1
echo %date% %time% - Daily screenshot count completed >> daily_screenshot_cron.log
