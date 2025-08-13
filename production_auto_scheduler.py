#!/usr/bin/env python3
"""
Production Auto Screenshot Scheduler
===================================

Clean, production-ready scheduler that works automatically every 6 hours.
"""

import os
import sys
import logging
import threading
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Simple logging without emojis for production
# Ensure logs directory exists
import os
logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(logs_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(logs_dir, 'auto_scheduler.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ProductionScreenshotScheduler:
    """
    Production scheduler for automatic screenshot updates
    """
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.is_running = False
        self._django_initialized = False
        
    def initialize_django(self):
        """
        Initialize Django safely (only once)
        """
        if not self._django_initialized:
            try:
                import django
                from django.conf import settings
                if not settings.configured:
                    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
                    django.setup()
                self._django_initialized = True
                logger.info("Django initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Django: {str(e)}")
                raise
        
    def update_screenshots_job(self):
        """
        Job function that runs the screenshot update
        """
        try:
            logger.info("Starting scheduled screenshot update...")
            
            # Initialize Django if needed
            self.initialize_django()
            
            # Import and run the management command
            from django.core.management import call_command
            call_command('track_screenshots', '--update-now')
            
            logger.info("Scheduled screenshot update completed successfully")
            
        except Exception as e:
            logger.error(f"Error in scheduled screenshot update: {str(e)}")
            
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
                
                logger.info("Auto Screenshot Scheduler started - Updates every 6 hours")
                next_run = self.get_next_run_time()
                logger.info(f"Next update scheduled for: {next_run}")
                
            except Exception as e:
                logger.error(f"Failed to start scheduler: {str(e)}")
                
    def stop(self):
        """
        Stop the scheduler
        """
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Auto Screenshot Scheduler stopped")
            
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
            'job_count': len(self.scheduler.get_jobs()) if self.is_running else 0
        }

# Global scheduler instance
scheduler_instance = ProductionScreenshotScheduler()

def start_auto_scheduler():
    """
    Start the auto scheduler
    """
    try:
        scheduler_instance.start()
        return True
    except Exception as e:
        logger.error(f"Failed to start auto scheduler: {str(e)}")
        return False

def stop_auto_scheduler():
    """
    Stop the auto scheduler
    """
    try:
        scheduler_instance.stop()
        return True
    except Exception as e:
        logger.error(f"Failed to stop auto scheduler: {str(e)}")
        return False

def get_scheduler_status():
    """
    Get scheduler status
    """
    return scheduler_instance.get_status()

# For testing
if __name__ == "__main__":
    print("Testing Production Auto Screenshot Scheduler...")
    
    success = start_auto_scheduler()
    if success:
        print("Scheduler started successfully!")
        print(f"Status: {get_scheduler_status()}")
        
        try:
            import time
            # Run for 30 seconds for testing
            time.sleep(30)
        except KeyboardInterrupt:
            pass
        
        stop_auto_scheduler()
        print("Scheduler stopped.")
    else:
        print("Failed to start scheduler.")
