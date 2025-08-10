# Daily Screenshot Counter - No Date Filter
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$logFile = "daily_screenshot_cron.log"
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"$date - Starting daily screenshot count (no date filter)..." | Add-Content $logFile

try {
    python direct_screenshot_counter.py 2>&1 | Add-Content $logFile
    "$date - Daily screenshot count completed successfully" | Add-Content $logFile
} catch {
    "$date - ERROR: $_" | Add-Content $logFile
    exit 1
}
