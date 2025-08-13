from django.apps import AppConfig
import threading
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Setup logging
logger = logging.getLogger(__name__)

# ✅ Load .env from project root (where manage.py is)
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard'

    def ready(self):
        """
        Called when Django is ready - start the auto scheduler here
        """
        try:
            # Import and start the production auto scheduler
            from production_auto_scheduler import start_auto_scheduler
            success = start_auto_scheduler()
            if success:
                logger.info("Production Auto Screenshot Scheduler started with Django")
            else:
                logger.error("Failed to start production auto scheduler")
        except Exception as e:
            logger.error(f"Failed to start auto scheduler: {str(e)}")
        
        # from .scheduler import start
        # start()
        # Run download_all_screenshots() once on startup, in a background thread
        def sync_once():
            try:
                from dashboard.s3_sync import download_all_screenshots
                download_all_screenshots()
            except Exception as e:
                print(f"[❌ S3 Sync Failed on Startup]: {e}")

        threading.Thread(target=sync_once, daemon=True).start()
