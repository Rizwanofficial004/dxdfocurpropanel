import os
from urllib.parse import quote

def get_latest_screenshot_path(email, task, base_dir="dashboard/media/screenshots"):
    """
    Return the path of the latest screenshot for a given email and task.
    """
    normalized_email = quote(email)
    normalized_task = quote(task)

    folder_path = os.path.join(base_dir, normalized_email, normalized_task)

    if not os.path.exists(folder_path):
        return ""

    try:
        image_files = sorted(
            [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))],
            key=lambda f: os.path.getmtime(os.path.join(folder_path, f)),
            reverse=True
        )
        if image_files:
            return f"/media/screenshots/{normalized_email}/{normalized_task}/{quote(image_files[0])}"
    except Exception as e:
        print(f"[❌ Screenshot Fetch Error] {e}")

    return ""
