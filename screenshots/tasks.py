import os
import requests
from django.utils import timezone
from django.conf import settings
from dotenv import load_dotenv
from .models import ScreenshotRecord

load_dotenv()  # load CRM_TOKEN and CRM_BASE_URL

def fetch_crm_screenshots():
    """
    Fetch screenshot-related data from CRM and update ScreenshotRecord table.
    Runs automatically every day at 9 AM Turkey time.
    """

    base_url = os.getenv("CRM_BASE_URL", "https://crm.deluxebilisim.com")
    token = os.getenv("CRM_TOKEN")

    # Example endpoint — modify if CRM API path is different
    api_url = f"{base_url}/api/users/"
    headers = {"Authorization": f"authtoken={token}"}

    try:
        response = requests.get(api_url, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()

        for user in data:
            ScreenshotRecord.objects.update_or_create(
                email=user.get("email"),
                defaults={
                    "name": user.get("name") or user.get("full_name") or "Unknown",
                    "staff_id": user.get("staff_id") or None,
                    "phone_number": user.get("phone") or None,
                    "job_position": user.get("job_title") or None,
                    "screenshot_interval": user.get("screenshot_interval") or None,  # Leave blank if missing
                    "updated_at": timezone.now(),
                },
            )

        print("✅ Screenshot records synced successfully from CRM.")

    except Exception as e:
        print(f"❌ Error fetching CRM screenshot data: {e}")
