"""
Daily Screenshot Background Service
- Runs daily at 6 AM automatically
- Updates data in background 
- Your API reads instantly from cached file (no waiting!)
"""

import time
import threading
import subprocess
import os
import json
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler('screenshot_service.log'),
        logging.StreamHandler()
    ]
)

class DailyScreenshotService:
    def __init__(self):
        self.running = False
        self.last_run = None
        self.target_hour = 6  # 6 AM daily
        
    def run_screenshot_counter(self):
        """Execute the lightning screenshot counter in background"""
        try:
            logging.info("Starting daily screenshot count...")
            
            # Run the direct counter (more stable)
            result = subprocess.run(
                ['python', 'direct_screenshot_counter.py'],
                capture_output=True,
                text=True,
                cwd=os.getcwd()
            )
            
            if result.returncode == 0:
                logging.info("Screenshot counting completed successfully")
                self.last_run = datetime.now()
                
                # Update status file for API
                status = {
                    'last_updated': self.last_run.isoformat(),
                    'status': 'success',
                    'next_run': self.get_next_run_time().isoformat()
                }
                with open('service_status.json', 'w') as f:
                    json.dump(status, f, indent=2)
                    
            else:
                logging.error(f"Screenshot counting failed: {result.stderr}")
                
        except Exception as e:
            logging.error(f"Error in background count: {e}")
    
    def get_next_run_time(self):
        """Calculate next run time (tomorrow at 6 AM)"""
        now = datetime.now()
        next_run = now.replace(hour=self.target_hour, minute=0, second=0, microsecond=0)
        if next_run <= now:
            next_run += timedelta(days=1)
        return next_run
    
    def should_run_now(self):
        """Check if it's time to run (6 AM daily)"""
        now = datetime.now()
        
        # Run if it's 6 AM and we haven't run today
        if now.hour == self.target_hour and now.minute < 5:  # 5-minute window
            if self.last_run is None or self.last_run.date() < now.date():
                return True
        return False
    
    def start_service(self):
        """Start the background service"""
        self.running = True
        logging.info("🔄 Daily Screenshot Service Started")
        logging.info(f"⏰ Will run daily at {self.target_hour}:00 AM")
        logging.info("📍 Working directory: " + os.getcwd())
        
        # Run immediately for testing
        logging.info("🧪 Running initial screenshot count...")
        threading.Thread(target=self.run_screenshot_counter, daemon=True).start()
        
        # Main service loop
        try:
            while self.running:
                if self.should_run_now():
                    logging.info("⏰ Daily run time - executing screenshot count...")
                    threading.Thread(target=self.run_screenshot_counter, daemon=True).start()
                
                # Check every minute
                time.sleep(60)
                
        except KeyboardInterrupt:
            logging.info("🛑 Service stopped by user")
            self.running = False
        except Exception as e:
            logging.error(f"❌ Service error: {e}")
    
    def stop_service(self):
        """Stop the service"""
        self.running = False
        logging.info("🛑 Service stopped")

def main():
    """Main service entry point"""
    print("🔄 DAILY SCREENSHOT BACKGROUND SERVICE")
    print("=" * 50)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d')}")
    print(f"⏰ Time: {datetime.now().strftime('%H:%M:%S')}")
    print("🎯 Purpose: Auto-update data daily, instant API responses")
    print("=" * 50)
    
    service = DailyScreenshotService()
    
    try:
        service.start_service()
    except KeyboardInterrupt:
        print("\\n🛑 Stopping service...")
        service.stop_service()

if __name__ == "__main__":
    main()
