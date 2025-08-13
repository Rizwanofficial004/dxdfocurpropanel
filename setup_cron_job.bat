@echo off
REM Script to set up Windows Task Scheduler for automatic screenshot updates every 6 hours
REM Run this script as Administrator

echo Setting up Windows Task Scheduler for Screenshot Updates...
echo ======================================================

REM Delete existing task if it exists
schtasks /delete /tn "ScreenshotAutoUpdate" /f >nul 2>&1

REM Create new scheduled task
schtasks /create /tn "ScreenshotAutoUpdate" /tr "\"%~dp0update_screenshots.bat\"" /sc hourly /mo 6 /st 00:00 /ru "SYSTEM"

if %errorlevel% equ 0 (
    echo ✅ SUCCESS: Task scheduled successfully!
    echo Task Name: ScreenshotAutoUpdate
    echo Frequency: Every 6 hours
    echo Start Time: 00:00 (midnight)
    echo Next runs: 00:00, 06:00, 12:00, 18:00
    echo.
    echo To view the task:
    echo schtasks /query /tn "ScreenshotAutoUpdate"
    echo.
    echo To run the task manually:
    echo schtasks /run /tn "ScreenshotAutoUpdate"
    echo.
    echo To delete the task:
    echo schtasks /delete /tn "ScreenshotAutoUpdate" /f
) else (
    echo ❌ FAILED: Could not create scheduled task
    echo Please run this script as Administrator
)

pause
