#!/usr/bin/env python3
"""
Windows Service for Screenshot Updates
====================================

Install as Windows service using python-windows-service or pywin32
"""

import os
import sys
import time
import logging
import servicemanager
import win32event
import win32service
import win32serviceutil
from datetime import datetime, timedelta

class ScreenshotUpdateService(win32serviceutil.ServiceFramework):
    _svc_name_ = "ScreenshotUpdateService"
    _svc_display_name_ = "Screenshot Auto Update Service"
    _svc_description_ = "Automatically updates screenshot database every 6 hours"
    
    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        self.is_alive = True
        
        # Setup logging
        logging.basicConfig(
            filename='screenshot_service.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_alive = False
        self.logger.info("Service stop requested")
    
    def SvcDoRun(self):
        self.logger.info("Screenshot Update Service started")
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_, '')
        )
        
        self.main_loop()
    
    def main_loop(self):
        last_update = datetime.now()
        
        while self.is_alive:
            try:
                # Check if 6 hours have passed
                if datetime.now() - last_update >= timedelta(hours=6):
                    self.run_update()
                    last_update = datetime.now()
                
                # Wait 30 minutes before next check
                if win32event.WaitForSingleObject(self.hWaitStop, 30 * 60 * 1000) == win32event.WAIT_OBJECT_0:
                    break
                    
            except Exception as e:
                self.logger.error(f"Service error: {e}")
                time.sleep(300)  # Wait 5 minutes on error
    
    def run_update(self):
        try:
            self.logger.info("Running scheduled screenshot update")
            
            # Add project directory to path
            project_dir = os.path.dirname(os.path.abspath(__file__))
            sys.path.append(project_dir)
            
            # Import and run Django update
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
            import django
            django.setup()
            
            from auto_screenshots_tracker import main as run_tracker
            run_tracker()
            
            self.logger.info("Screenshot update completed successfully")
            
        except Exception as e:
            self.logger.error(f"Update failed: {e}")

if __name__ == '__main__':
    if len(sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(ScreenshotUpdateService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(ScreenshotUpdateService)
