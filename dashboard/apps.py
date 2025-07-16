from django.apps import AppConfig
import threading
import os
from pathlib import Path
from dotenv import load_dotenv

# ✅ Load .env from project root (where manage.py is)
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard'

    def ready(self):
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
