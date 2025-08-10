import os
from pathlib import Path
from urllib.parse import quote
from datetime import datetime

SCREENSHOT_DIR = Path("dashboard/media/screenshots")

def find_latest_screenshots():
    screenshot_map = {}

    if not SCREENSHOT_DIR.exists():
        return screenshot_map

    for user_folder in SCREENSHOT_DIR.iterdir():
        if not user_folder.is_dir():
            continue

        for task_folder in user_folder.iterdir():
            if not task_folder.is_dir():
                continue

            screenshots = list(task_folder.glob("*.png"))
            if not screenshots:
                continue

            latest_file = max(screenshots, key=os.path.getmtime)

            email = user_folder.name
            task_name = task_folder.name

            screenshot_map[(email, task_name)] = {
                "path": f"/media/screenshots/{quote(email)}/{quote(task_name)}/{quote(latest_file.name)}",
                "filename": latest_file.name,
                "timestamp": datetime.fromtimestamp(latest_file.stat().st_mtime).strftime('%Y-%m-%d %H:%M:%S')
            }

    return screenshot_map
