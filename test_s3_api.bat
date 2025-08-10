@echo off
echo.
echo ===============================================
echo Testing Fast Live Tracking Screenshots API
echo ===============================================
echo.

echo Testing New S3 Scanning API:
echo -----------------------------
curl -X GET "http://127.0.0.1:8000/api/live-tracking/fast-screenshots/?limit=50" ^
     -H "Content-Type: application/json" ^
     --connect-timeout 30 ^
     --max-time 60

echo.
echo.
echo ===============================================
echo Comparison with Old Staff API:
echo ===============================================
echo.

echo Testing Old Staff Table API:
echo -----------------------------
curl -X GET "http://127.0.0.1:8000/api/live-tracking/screenshots/?limit=50" ^
     -H "Content-Type: application/json" ^
     --connect-timeout 30 ^
     --max-time 60

echo.
echo.
echo ===============================================
echo Test Complete!
echo ===============================================

pause
