# PowerShell Continuous Scheduler
# This runs continuously and updates every 6 hours
# Much simpler than Task Scheduler

$projectPath = "c:\Users\deniz\OneDrive\Email attachments\Masaüstü\Git-Projects\dxdfocurpropanel"
$logFile = Join-Path $projectPath "scheduler.log"

Write-Host "🚀 Starting Screenshot Auto-Updater (Every 6 hours)" -ForegroundColor Green
Add-Content $logFile "$(Get-Date): Screenshot scheduler started"

while ($true) {
    try {
        Write-Host "🔄 $(Get-Date): Running screenshot update..." -ForegroundColor Yellow
        Add-Content $logFile "$(Get-Date): Starting update"
        
        # Change to project directory
        Set-Location $projectPath
        
        # Run Django command
        $result = python manage.py track_screenshots --update-now
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $(Get-Date): Update completed successfully" -ForegroundColor Green
            Add-Content $logFile "$(Get-Date): Update completed successfully"
        } else {
            Write-Host "❌ $(Get-Date): Update failed" -ForegroundColor Red
            Add-Content $logFile "$(Get-Date): Update failed with exit code $LASTEXITCODE"
        }
        
        # Wait 6 hours (21600 seconds)
        Write-Host "⏰ Next update in 6 hours..." -ForegroundColor Cyan
        Add-Content $logFile "$(Get-Date): Waiting 6 hours for next update"
        Start-Sleep -Seconds 21600
        
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Add-Content $logFile "$(Get-Date): Error: $_"
        Start-Sleep -Seconds 300  # Wait 5 minutes on error
    }
}
