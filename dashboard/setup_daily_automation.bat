@echo off
echo Setting up Daily Screenshot Counter Automation...
echo ================================================

REM Create the task in Windows Task Scheduler
schtasks /create /tn "Daily Screenshot Counter" /tr "powershell.exe -ExecutionPolicy Bypass -File \"%~dp0run_lightning_daily.ps1\"" /sc daily /st 06:00 /f

if %errorlevel% == 0 (
    echo ✅ SUCCESS: Daily task created successfully!
    echo 📅 Will run every day at 6:00 AM
    echo 📁 Working directory: %~dp0
    echo 📜 Script: lightning_daily_counter.py
    echo.
    echo 🔧 To modify the schedule:
    echo    - Open Task Scheduler
    echo    - Find "Daily Screenshot Counter" 
    echo    - Right-click and select Properties
    echo.
    echo 📋 To test immediately:
    echo    schtasks /run /tn "Daily Screenshot Counter"
    echo.
    echo 📊 Results will be saved to: daily_screenshot_counts.json
) else (
    echo ❌ ERROR: Failed to create scheduled task
    echo 💡 Try running this script as Administrator
)

pause
