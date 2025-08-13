#!/usr/bin/env python3
"""
Advanced Python Scheduler for Screenshot Updates
==============================================

This runs as a Windows service and handles automatic updates every 6 hours.
Much more reliable than Task Scheduler.
"""

import os
import sys
import time
import logging
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger
import subprocess

# Add Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('screenshot_scheduler.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def update_screenshots():
    """
    Function to run screenshot updates
    """
    try:
        logger.info("🔄 Starting scheduled screenshot update...")
        
        # Change to project directory
        project_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(project_dir)
        
        # Run Django management command
        result = subprocess.run([
            sys.executable, 'manage.py', 'track_screenshots', '--update-now'
        ], capture_output=True, text=True, timeout=1800)  # 30 min timeout
        
        if result.returncode == 0:
            logger.info("✅ Screenshot update completed successfully")
            logger.info(f"Output: {result.stdout}")
        else:
            logger.error(f"❌ Screenshot update failed: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Screenshot update timed out after 30 minutes")
    except Exception as e:
        logger.error(f"❌ Error during screenshot update: {e}")

def main():
    """
    Main scheduler function
    """
    logger.info("🚀 Starting Screenshot Auto-Updater Service")
    logger.info("📅 Schedule: Every 6 hours")
    
    # Create scheduler
    scheduler = BlockingScheduler()
    
    # Add job to run every 6 hours
    scheduler.add_job(
        func=update_screenshots,
        trigger=IntervalTrigger(hours=6),
        id='screenshot_update_job',
        name='Screenshot Update Job',
        replace_existing=True
    )
    
    # Also run once immediately
    logger.info("🔄 Running initial update...")
    update_screenshots()
    
    try:
        logger.info("⏰ Scheduler started. Next update in 6 hours...")
        scheduler.start()
    except KeyboardInterrupt:
        logger.info("🛑 Scheduler stopped by user")
    except Exception as e:
        logger.error(f"❌ Scheduler error: {e}")

if __name__ == "__main__":
    main()
