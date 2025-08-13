#!/usr/bin/env python3
"""
Django Background Scheduler
==========================

Runs as part of Django and handles scheduling internally.
"""

import os
import sys
import time
import threading
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

# Add Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django
django.setup()

from dashboard.models import UpdateLog

class BackgroundScheduler:
    def __init__(self):
        self.running = False
        self.thread = None
        
    def start(self):
        """Start the background scheduler"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._scheduler_loop, daemon=True)
            self.thread.start()
            print("🚀 Background scheduler started (every 6 hours)")
    
    def stop(self):
        """Stop the background scheduler"""
        self.running = False
        if self.thread:
            self.thread.join()
            print("🛑 Background scheduler stopped")
    
    def _scheduler_loop(self):
        """Main scheduler loop"""
        while self.running:
            try:
                # Check if it's time to update (every 6 hours)
                last_update = UpdateLog.objects.filter(status='completed').order_by('-completed_at').first()
                
                if not last_update:
                    # No previous update, run now
                    self._run_update()
                else:
                    # Check if 6 hours have passed
                    six_hours_ago = timezone.now() - timedelta(hours=6)
                    if last_update.completed_at < six_hours_ago:
                        self._run_update()
                
                # Sleep for 30 minutes before checking again
                time.sleep(1800)  # 30 minutes
                
            except Exception as e:
                print(f"❌ Scheduler error: {e}")
                time.sleep(300)  # 5 minutes on error
    
    def _run_update(self):
        """Run the screenshot update"""
        try:
            print(f"🔄 {datetime.now()}: Running scheduled update...")
            
            # Import and run the auto tracker
            from auto_screenshots_tracker import main as run_tracker
            run_tracker()
            
            print(f"✅ {datetime.now()}: Scheduled update completed")
            
        except Exception as e:
            print(f"❌ {datetime.now()}: Update failed: {e}")

# Global scheduler instance
scheduler = BackgroundScheduler()

def start_background_scheduler():
    """Start the background scheduler"""
    scheduler.start()

def stop_background_scheduler():
    """Stop the background scheduler"""
    scheduler.stop()

# For direct execution
if __name__ == "__main__":
    print("🚀 Starting Django Background Scheduler...")
    start_background_scheduler()
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping scheduler...")
        stop_background_scheduler()
