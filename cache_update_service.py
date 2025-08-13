#!/usr/bin/env python3
"""
Automated Screenshot Cache Update Service
Integrates with existing scheduler to update cache every 6 hours
"""
import os
import sys
import django
from datetime import datetime
import subprocess

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

def update_cache_service():
    """
    Service function that runs the cache update
    """
    print(f"🕒 Cache Update Service - {datetime.now()}")
    print("=" * 50)
    
    try:
        # Import and run the cache updater
        from update_screenshot_cache import update_screenshot_cache
        
        print("🔄 Starting cache update process...")
        success = update_screenshot_cache()
        
        if success:
            print("✅ Cache update completed successfully!")
            
            # Log to the existing log file
            log_dir = os.path.join(os.path.dirname(__file__), 'logs')
            os.makedirs(log_dir, exist_ok=True)
            
            log_file = os.path.join(log_dir, 'cache_update.log')
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"{datetime.now().isoformat()} - Cache update successful\n")
            
            return True
        else:
            print("❌ Cache update failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error in cache update service: {e}")
        import traceback
        traceback.print_exc()
        return False

def setup_cache_scheduler():
    """
    Setup automatic cache updates using APScheduler
    """
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.interval import IntervalTrigger
        import atexit
        
        scheduler = BackgroundScheduler()
        
        # Add job to update cache every 6 hours
        scheduler.add_job(
            func=update_cache_service,
            trigger=IntervalTrigger(hours=6),
            id='screenshot_cache_update',
            name='Screenshot Cache Update Job',
            replace_existing=True
        )
        
        scheduler.start()
        
        # Shutdown when the interpreter exits
        atexit.register(lambda: scheduler.shutdown())
        
        print("🔄 Cache update scheduler started - Updates every 6 hours")
        
        # Run initial update
        print("🚀 Running initial cache update...")
        update_cache_service()
        
        return scheduler
        
    except Exception as e:
        print(f"❌ Error setting up cache scheduler: {e}")
        return None

if __name__ == "__main__":
    # Manual execution
    print("🚀 MANUAL CACHE UPDATE")
    success = update_cache_service()
    
    if success:
        print("\n🎉 SUCCESS!")
        print("📄 Cache file updated with real S3 data")
        print("⚡ API will now be super fast!")
        print("\n🔗 Test your API:")
        print("   http://127.0.0.1:8001/api/actual-count-total/screenshots/")
    else:
        print("\n⚠️ FAILED!")
        print("❌ Cache update encountered errors")
    
    print("\n📋 SETUP AUTOMATIC UPDATES:")
    print("   Add this to your Django app's ready() method:")
    print("   from cache_update_service import setup_cache_scheduler")
    print("   setup_cache_scheduler()")
