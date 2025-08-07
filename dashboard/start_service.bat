@echo off
echo 🚀 STARTING DAILY SCREENSHOT BACKGROUND SERVICE
echo ===============================================

cd /d "%~dp0"

echo 📍 Working Directory: %CD%
echo ⏰ Service will run daily at 6:00 AM
echo 📊 Your API will get instant responses from cached data
echo.

echo 🔄 Starting background service...
python daily_service.py

pause
