@echo off
echo Testing Live Tracking Screenshots API
echo =======================================

echo.
echo Making API request to get latest screenshots for all users...
echo.

curl -X GET "http://127.0.0.1:8000/api/live-tracking/screenshots/?limit=50&status=all&latest_only=true&sort_by=name" -H "Content-Type: application/json"

echo.
echo.
echo =======================================
echo Test completed!
echo.
echo You can also test with these URLs:
echo.
echo Get only active users:
echo curl "http://127.0.0.1:8000/api/live-tracking/screenshots/?status=active&limit=20"
echo.
echo Sort by screenshot time:
echo curl "http://127.0.0.1:8000/api/live-tracking/screenshots/?sort_by=screenshot_time&limit=15"
echo.
echo Get offline users:
echo curl "http://127.0.0.1:8000/api/live-tracking/screenshots/?status=offline&limit=30"

pause
