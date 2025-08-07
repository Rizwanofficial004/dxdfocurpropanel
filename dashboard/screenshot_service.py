"""
Daily Screenshot Counter Service
Runs continuously and executes screenshot counting every day at 6 AM
No need to manually run - just start once and it keeps running
"""

import schedule
import time
import subprocess
import os
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('screenshot_service.log'),
        logging.StreamHandler()
    ]
)

def run_screenshot_counter():
    """Run the lightning screenshot counter"""
    try:
        logging.info("🚀 Starting daily screenshot count...")
        
        # Run the lightning counter
        result = subprocess.run(
            ['python', 'lightning_daily_counter.py'],
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        
        if result.returncode == 0:
            logging.info("✅ Screenshot counting completed successfully")
            logging.info(f"📊 Output preview: {result.stdout[:200]}...")
        else:
            logging.error(f"❌ Screenshot counting failed: {result.stderr}")
            
    except Exception as e:
        logging.error(f"❌ Error running screenshot counter: {e}")

def main():
    """Main service loop"""
    logging.info("🔄 Daily Screenshot Counter Service Started")
    logging.info("⏰ Scheduled to run daily at 6:00 AM")
    logging.info("📍 Working directory: " + os.getcwd())
    
    # Schedule daily execution at 6 AM
    schedule.every().day.at("06:00").do(run_screenshot_counter)
    
    # Also allow immediate testing
    logging.info("🧪 Running initial test...")
    run_screenshot_counter()
    
    # Keep service running
    logging.info("🔄 Service running... Press Ctrl+C to stop")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logging.info("🛑 Service stopped by user")
    except Exception as e:
        logging.error(f"❌ Service error: {e}")

if __name__ == "__main__":
    main()
