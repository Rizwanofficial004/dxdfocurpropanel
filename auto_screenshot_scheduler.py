#!/usr/bin/env python3
"""
Auto Screenshot Scheduler Service
================================

Production-ready background service that automatically updates screenshots every 6 hours.
This runs as part of Django and starts automatically when the server starts.
"""

import os
import sys
import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from django.conf import settings

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AutoScreenshotScheduler:
    """
    Background scheduler that runs screenshot updates every 6 hours automatically
    """
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.is_running = False
        
    def update_screenshots_job(self):
        """
        Job function that runs the screenshot update
        """
        try:
            logger.info("🔄 Starting scheduled screenshot update...")
            
            # Import Django components
            import django
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
            django.setup()
            
            from django.core.management import call_command
            
            # Run the update command
            call_command('track_screenshots', '--update-now')
            
            logger.info("✅ Scheduled screenshot update completed successfully")
            
        except Exception as e:
            logger.error(f"❌ Error in scheduled screenshot update: {str(e)}")
            
    def start(self):
        """
        Start the scheduler
        """
        if not self.is_running:
            try:
                # Add job to run every 6 hours
                self.scheduler.add_job(
                    func=self.update_screenshots_job,
                    trigger=IntervalTrigger(hours=6),
                    id='screenshot_update_job',
                    name='Screenshot Update Job',
                    replace_existing=True,
                    max_instances=1
                )
                
                # Start the scheduler
                self.scheduler.start()
                self.is_running = True
                
                logger.info("🚀 Auto Screenshot Scheduler started - Updates every 6 hours")
                logger.info(f"⏰ Next update scheduled for: {self.get_next_run_time()}")
                
                # Run initial update
                logger.info("🔄 Running initial screenshot update...")
                self.update_screenshots_job()
                
            except Exception as e:
                logger.error(f"❌ Failed to start scheduler: {str(e)}")
                
    def stop(self):
        """
        Stop the scheduler
        """
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("🛑 Auto Screenshot Scheduler stopped")
            
    def get_next_run_time(self):
        """
        Get the next scheduled run time
        """
        job = self.scheduler.get_job('screenshot_update_job')
        if job:
            return job.next_run_time
        return "Not scheduled"
        
    def get_status(self):
        """
        Get scheduler status
        """
        return {
            'is_running': self.is_running,
            'next_run_time': str(self.get_next_run_time()),
            'job_count': len(self.scheduler.get_jobs())
        }

# Global scheduler instance
screenshot_scheduler = AutoScreenshotScheduler()

def start_auto_scheduler():
    """
    Function to start the auto scheduler
    """
    screenshot_scheduler.start()

def stop_auto_scheduler():
    """
    Function to stop the auto scheduler
    """
    screenshot_scheduler.stop()

def get_scheduler_status():
    """
    Function to get scheduler status
    """
    return screenshot_scheduler.get_status()

# Auto-start when module is imported (for production)
if __name__ != "__main__":
    # This will start automatically when Django starts
    try:
        start_auto_scheduler()
    except Exception as e:
        logger.error(f"Failed to auto-start scheduler: {str(e)}")

# For direct testing
if __name__ == "__main__":
    print("Testing Auto Screenshot Scheduler...")
    start_auto_scheduler()
    
    import time
    try:
        # Keep running for testing
        while True:
            status = get_scheduler_status()
            print(f"Scheduler Status: {status}")
            time.sleep(30)
    except KeyboardInterrupt:
        print("\nStopping scheduler...")
        stop_auto_scheduler()
