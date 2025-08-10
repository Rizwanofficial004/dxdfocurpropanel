# Windows Task Scheduler Setup Guide

## Setup Daily Screenshot Counter on Windows

### Option 1: Using Windows Task Scheduler (Recommended)

1. **Open Task Scheduler**
   - Press `Win + R`, type `taskschd.msc`, press Enter
   - Or search "Task Scheduler" in Windows Start Menu

2. **Create Basic Task**
   - Click "Create Basic Task..." in the right panel
   - Name: `Daily Screenshot Counter`
   - Description: `Daily automated screenshot counting from S3 inventory`

3. **Set Trigger**
   - When: `Daily`
   - Start date: Today
   - Start time: `02:00:00` (2 AM)
   - Recur every: `1 days`

4. **Set Action**
   - Action: `Start a program`
   - Program/script: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\Users\DDS\Desktop\back-end-work-5\dxdfocurpropanel-back-end-work-02\daily_screenshot_cron.ps1"`
   - Start in: `C:\Users\DDS\Desktop\back-end-work-5\dxdfocurpropanel-back-end-work-02`

5. **Finish Setup**
   - Check "Open the Properties dialog..."
   - In Properties:
     - General tab: Check "Run whether user is logged on or not"
     - Settings tab: Check "Run task as soon as possible after a scheduled start is missed"

### Option 2: Using PowerShell Scheduled Jobs

```powershell
# Register scheduled job (run once to setup)
$JobName = "DailyScreenshotCounter"
$ScriptPath = "C:\Users\DDS\Desktop\back-end-work-5\dxdfocurpropanel-back-end-work-02\daily_screenshot_cron.ps1"

$Trigger = New-JobTrigger -Daily -At "2:00 AM"
$Options = New-ScheduledJobOption -RunElevated -MultipleInstancePolicy StopExisting

Register-ScheduledJob -Name $JobName -FilePath $ScriptPath -Trigger $Trigger -ScheduledJobOption $Options

# To check status:
Get-ScheduledJob -Name $JobName

# To remove:
# Unregister-ScheduledJob -Name $JobName
```

### Testing the Setup

1. **Test PowerShell Script Manually**
   ```powershell
   cd "C:\Users\DDS\Desktop\back-end-work-5\dxdfocurpropanel-back-end-work-02"
   .\daily_screenshot_cron.ps1
   ```

2. **Check Logs**
   - Look for log files in `logs\screenshot_counter_YYYYMMDD.log`
   - Verify successful execution

3. **Test Task Scheduler**
   - Right-click your task in Task Scheduler
   - Select "Run" to test immediately

### Troubleshooting

1. **PowerShell Execution Policy**
   ```powershell
   # Check current policy
   Get-ExecutionPolicy
   
   # Set to allow local scripts (if needed)
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Environment Variables**
   - Ensure Python is in PATH
   - Django settings are properly configured
   - AWS credentials are available

3. **Permissions**
   - Ensure the user has read/write access to the project directory
   - Check AWS S3 permissions for inventory access

### Monitoring

1. **Check Task History**
   - In Task Scheduler, select your task
   - Click "History" tab to see execution history

2. **Log Files**
   - Daily logs are created in `logs/` directory
   - Check for errors or successful completions

3. **Database Verification**
   ```python
   # Check latest entries
   python manage.py shell
   >>> from dashboard.models import DailyScreenshotCount
   >>> DailyScreenshotCount.objects.order_by('-date')[:5]
   ```

### Alternative: Manual Daily Run

If automation fails, you can run manually:

```powershell
# Navigate to project
cd "C:\Users\DDS\Desktop\back-end-work-5\dxdfocurpropanel-back-end-work-02"

# Run Django command
python manage.py process_screenshot_inventory

# Or run standalone script
python daily_screenshot_counter.py
```
