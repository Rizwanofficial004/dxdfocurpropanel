@echo off
echo 🧹 VS Code Cache Cleaner
echo.
echo ⚠️  IMPORTANT: Make sure VS Code is completely closed before running this script
echo.
pause

echo 🔍 Checking for running VS Code processes...
tasklist /FI "IMAGENAME eq Code.exe" 2>NUL | find /I /N "Code.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ❌ VS Code is still running! Please close it completely and try again.
    pause
    exit /b 1
)

echo ✅ No VS Code processes found. Proceeding with cache clearing...
echo.

echo 🗂️  Clearing workspace storage...
if exist "%APPDATA%\Code\User\workspaceStorage" (
    rmdir /s /q "%APPDATA%\Code\User\workspaceStorage"
    echo ✅ Workspace storage cleared
) else (
    echo ℹ️  Workspace storage directory not found
)

echo 📝 Clearing logs...
if exist "%APPDATA%\Code\logs" (
    rmdir /s /q "%APPDATA%\Code\logs"
    echo ✅ Logs cleared
) else (
    echo ℹ️  Logs directory not found
)

echo 🔧 Clearing extension host cache...
if exist "%APPDATA%\Code\CachedExtensions" (
    rmdir /s /q "%APPDATA%\Code\CachedExtensions"
    echo ✅ Cached extensions cleared
) else (
    echo ℹ️  Cached extensions directory not found
)

echo 💾 Clearing crash dumps...
if exist "%APPDATA%\Code\CrashDumps" (
    rmdir /s /q "%APPDATA%\Code\CrashDumps"
    echo ✅ Crash dumps cleared
) else (
    echo ℹ️  Crash dumps directory not found
)

echo 🗄️  Clearing backup files...
if exist "%APPDATA%\Code\Backups" (
    rmdir /s /q "%APPDATA%\Code\Backups"
    echo ✅ Backups cleared
) else (
    echo ℹ️  Backups directory not found
)

echo.
echo 🎉 VS Code cache clearing completed!
echo.
echo 📋 Summary of actions:
echo   • Workspace storage cleared
echo   • Logs cleared  
echo   • Extension cache cleared
echo   • Crash dumps cleared
echo   • Backup files cleared
echo.
echo 🚀 You can now restart VS Code with a fresh cache!
echo.
pause
