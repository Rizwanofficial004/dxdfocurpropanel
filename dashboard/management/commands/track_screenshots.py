"""
Django Management Command for Screenshots Auto-Tracking
Usage: python manage.py track_screenshots [--background]
"""

from django.core.management.base import BaseCommand
import sys
import os

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))

from auto_screenshots_tracker import ScreenshotsTracker

class Command(BaseCommand):
    help = 'Automatically track and update screenshot counts every hour'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--background',
            action='store_true',
            help='Run in background mode (daemon)',
        )
        parser.add_argument(
            '--update-now',
            action='store_true',
            help='Run single update now',
        )
        parser.add_argument(
            '--stats',
            action='store_true',
            help='Show current statistics',
        )
    
    def handle(self, *args, **options):
        tracker = ScreenshotsTracker()
        
        if options['stats']:
            self.stdout.write("📊 Current Screenshot Statistics:")
            stats = tracker.get_stats()
            for key, value in stats.items():
                self.stdout.write(f"   {key}: {value}")
            return
        
        if options['update_now']:
            self.stdout.write("🔄 Running manual update...")
            tracker.run_incremental_update()
            return
        
        if options['background']:
            self.stdout.write("🚀 Starting background auto-tracking...")
            thread = tracker.start_background_scheduler()
            
            # Keep command alive
            try:
                import time
                while True:
                    time.sleep(30)
                    self.stdout.write(f"📊 Auto-tracker running... (Ctrl+C to stop)")
            except KeyboardInterrupt:
                self.stdout.write("\n🛑 Stopping auto-tracker...")
        else:
            self.stdout.write("🚀 Starting foreground auto-tracking (every 1 hour)...")
            self.stdout.write("Press Ctrl+C to stop")
            tracker.start_auto_update_scheduler()
