# Daily Screenshot Counter PowerShell Script
# For Windows Task Scheduler
# Schedule this to run daily at 2 AM

param(
    [string]$ProjectPath = "C:\Users\DDS\Desktop\back-end-work-5\dxdfocurpropanel-back-end-work-02"
)

# Set working directory
Set-Location $ProjectPath

# Create logs directory if it doesn't exist
$LogDir = "logs"
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir
}

# Log file with date
$LogFile = "$LogDir\screenshot_counter_$(Get-Date -Format 'yyyyMMdd').log"

# Function to log messages
function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Output $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

Write-Log "========================================"
Write-Log "Daily Screenshot Count - $(Get-Date)"
Write-Log "========================================"

try {
    Write-Log "Starting screenshot inventory processing..."
    
    # Method 1: Using Django management command
    Write-Log "Running Django management command..."
    $Output = python manage.py process_screenshot_inventory 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Django command completed successfully"
        Write-Log "Output: $Output"
    } else {
        Write-Log "❌ Django command failed with exit code: $LASTEXITCODE"
        Write-Log "Error: $Output"
        
        # Try standalone script as fallback
        Write-Log "Trying standalone script as fallback..."
        $Output = python daily_screenshot_counter.py 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Standalone script completed successfully"
            Write-Log "Output: $Output"
        } else {
            Write-Log "❌ Standalone script also failed with exit code: $LASTEXITCODE"
            Write-Log "Error: $Output"
            throw "Both methods failed"
        }
    }
    
    Write-Log "✅ Screenshot counting completed successfully"
    
} catch {
    Write-Log "❌ Critical error: $($_.Exception.Message)"
    
    # Optional: Send email notification
    # Send-MailMessage -To "admin@example.com" -From "server@example.com" -Subject "Screenshot Counter Failed" -Body "Daily screenshot counting failed: $($_.Exception.Message)" -SmtpServer "your-smtp-server"
    
    exit 1
}

Write-Log "========================================"
Write-Log "Process completed at $(Get-Date)"
Write-Log ""
