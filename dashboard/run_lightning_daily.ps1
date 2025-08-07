# Lightning-Fast Daily Screenshot Counter
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$logFile = "lightning_daily.log"
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"$date - Starting lightning screenshot count..." | Add-Content $logFile

try {
    python lightning_daily_counter.py 2>&1 | Add-Content $logFile
    "$date - Lightning count completed successfully" | Add-Content $logFile
} catch {
    "$date - ERROR: $_" | Add-Content $logFile
    exit 1
}
