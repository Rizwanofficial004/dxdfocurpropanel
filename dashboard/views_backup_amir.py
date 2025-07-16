import requests
from django.shortcuts import render
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from dashboard.tasks import perform_search_and_cache
import time
from django.http import JsonResponse
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
# from .get_employee_screenshots import scan_and_download_screenshots
from dashboard.get_employee_screenshots import scan_and_download_screenshots
from django.utils.timezone import now


from django.conf import settings
from urllib.parse import quote
import os
from pathlib import Path
from dashboard.utils import fetch_staff_data
from .ai_helpers import normalize_task_name_with_ai, get_latest_screenshot_paths
from .ai_search_helpers import ai_fuzzy_match_employees, generate_user_timeline_data
from dashboard.utils import fetch_all_employees
from django.views.decorators.http import require_GET
from dashboard.ai_search_helpers import get_user_timelines_by_staffid
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout
from django.utils.translation import activate
from .ai_helpers import normalize_task_name_with_ai, get_latest_screenshot_paths
from django.shortcuts import render
from . import crm_status_data


import json
import hashlib
from pathlib import Path
from django.http import JsonResponse
from django.shortcuts import render
# from .get_employee_screenshots import list_screenshots_with_mapping
# from .get_employee_screenshots import fallback_screenshot_url
# from .get_employee_screenshots import fallback_screenshot_url



import json
import hashlib
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.shortcuts import render
from . import crm_status_data

import logging


AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o"
API_URL = "https://crm.deluxebilisim.com/api/staffs/"
BASE_DIR = Path(__file__).resolve().parent.parent
(Path(BASE_DIR / "dashboard" / "data")).mkdir(parents=True, exist_ok=True)
CACHE_FILE = BASE_DIR / "dashboard" / "data" / "cached_staff_status.json"
print(f"📁 Writing cache to: {CACHE_FILE.resolve()}", file=sys.stderr)




# def login_view(request):
#     return render(request, 'dashboard/login.html')

from django.contrib.auth.decorators import login_required

















# Create a logger
logger = logging.getLogger(__name__)

def login_view(request):
    print(f"⚠️ Login View Triggered")
    activate(request.LANGUAGE_CODE)  # Force translation based on /tr/ or /en/
    if request.user.is_authenticated:
        logger.debug(f"User is already authenticated. Redirecting to dashboard.")
        return redirect('dashboard')  # If the user is already logged in, redirect to dashboard

    error = None
    if request.method == 'POST':
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        
        if user:
            login(request, user)
            logger.debug(f"User {username} logged in successfully. Redirecting to dashboard.")
            return redirect('dashboard')  # Redirect to dashboard after login
        else:
            error = "Invalid username or password."
            logger.debug(f"Failed login attempt for {username}. Error: {error}")

    return render(request, 'dashboard/login.html', {'error': error})














def logout_view(request):
    logout(request)
    return redirect('login')




@login_required
def index(request):
    return render(request, 'dashboard/index.html')


@login_required
def home(request):
    return render(request, 'dashboard/home.html')

def reports_view(request):
    return render(request, 'dashboard/reports.html')

def search_view(request):
    query = request.GET.get("q", "").strip()
    if not query:
        return JsonResponse({"error": "Search query cannot be empty."}, status=400)
    task = perform_search_and_cache.delay(query)
    return JsonResponse({"task_id": task.id, "status": "Task started"})

def search_status_view(request, task_id):
    from celery.result import AsyncResult
    result = AsyncResult(task_id)
    if result.state == 'PENDING':
        return JsonResponse({"status": "Pending"})
    elif result.state == 'SUCCESS':
        return JsonResponse({"status": "Success", "data": result.result})
    elif result.state == 'FAILURE':
        return JsonResponse({"status": "Failure", "error": str(result.info)})
    else:
        return JsonResponse({"status": result.state})

def api_data_view(request):
    return render(request, 'dashboard/api_data.html', {
        'message': 'This is a placeholder for API data view.'
    })



@login_required
def dashboard_view(request):
    status_counts = crm_status_data.get_status_summary()

    context = {
        "status_counts": status_counts
    }
    return render(request, 'dashboard/index.html', context)


# Check if the cache file is still valid based on timestamp
def is_cache_valid():
    if not CACHE_FILE.exists():
        return False

    # Get the last modification time of the cache file
    last_modified = datetime.fromtimestamp(CACHE_FILE.stat().st_mtime)
    
    # Define the cache expiration time in minutes (e.g., 30 minutes)
    CACHE_EXPIRY_MINUTES = 30

    # If the data is older than 30 minutes, refresh it
    if (datetime.now() - last_modified).total_seconds() > CACHE_EXPIRY_MINUTES * 60:
        return False
    return True



def hash_data(data):
    return hashlib.md5(json.dumps(data, sort_keys=True).encode("utf-8")).hexdigest()


# Global set to track duplicates
seen_combinations = set()
















@login_required
def live_tracking(request):
    def format_minutes_or_hours(minutes):
        if minutes < 1:
            return f"{round(minutes * 60)}s"
        elif minutes < 60:
            return f"{round(minutes)}m"
        elif minutes % 60 == 0:
            return f"{int(minutes // 60)}h"
        else:
            hours = int(minutes // 60)
            mins = int(minutes % 60)
            return f"{hours}h {mins}m"

    search_query = request.GET.get("search", "").strip().lower()
    days_filter = request.GET.get("days", "").strip()

    try:
        current_page = int(request.GET.get("page", 1))
    except ValueError:
        current_page = 1

    per_page = 8



    # First, fetch just the total
    initial_data = fetch_staff_data(0, 1, search_query, days_filter)
    total_count = initial_data.get('total', 0)

    per_page = 8
    max_page = (total_count + per_page - 1) // per_page

    try:
        current_page = int(request.GET.get("page", 1))
    except ValueError:
        current_page = 1

    # ✅ Calculate reverse offset
    reverse_page = max_page - current_page + 1
    reverse_offset = (reverse_page - 1) * per_page

    # Now fetch only the reversed slice
    staff_data = fetch_staff_data(reverse_offset, per_page, search_query, days_filter)


    

    # In views.py
    for row in staff_data['items']:
        email = row.get("email", "")
        task = row.get("task_name", "")
        print(f"🔍 Start: {row.get('start_time')} | End: {row.get('end_time')}")
        time_spent = row.get("total_spent_time", 0)
        
        try:
            if time_spent:
                hours = int(time_spent // 60)
                minutes = int(time_spent % 60)
                row["formatted_time"] = f"{hours}h {minutes}m" if hours else f"{minutes}m"
            else:
                row["formatted_time"] = "—"
        except Exception as e:
            print(f"⚠️ Time format error: {e}")
            row["formatted_time"] = "—"

        print(f"📸 Generating screenshots for: {email} — {task}")

        # all_data = scan_and_download_screenshots()
        print("📦 Triggering screenshot download from S3...")
        all_data = scan_and_download_screenshots()  # Downloads to media/screenshots/email/task/image


    folder_map = all_data.get("folder_map", {})

    # ✅ Match screenshots to each staff entry
    for row in staff_data['items']:
        email = row.get("email", "")
        task = row.get("task_name", "")

        if not email or not task:
            row["screenshots"] = []
            continue

        # Normalize for folder lookup
        normalized_email = email.replace("@", "_at_")
        normalized_task = task.replace(" ", "_")  # Keep commas etc.
        folder_key = f"{normalized_email}/{normalized_task}"

        screenshots = folder_map.get(folder_key, [])
        # Sort by filename or timestamp if applicable (you can improve this later)
        latest = sorted(screenshots)[-1] if screenshots else None
        row["screenshots"] = [latest] if latest else []

        print(f"➡️ Looking for folder: {folder_key}")
        if screenshots:
            latest = sorted(screenshots)[-1]
            if os.path.exists(latest):  # ✅ ensure the file exists
                row["screenshots"] = [latest]
            else:
                print(f"⛔ File doesn't exist yet: {latest}")
                row["screenshots"] = []
        else:
            row["screenshots"] = []




    email = row.get("email", "")
    task = row.get("task_name", "")
    safe_task = normalize_task_name_with_ai(task)

    # screenshot_url = get_latest_screenshot_paths(email, safe_task)
    # row["screenshot_url"] = screenshot_url
    # row["screenshot_name"] = os.path.basename(screenshot_url) if screenshot_url else ""









    total_count = staff_data['total']
    items = staff_data['items']
    max_page = (total_count + per_page - 1) // per_page

    def get_pagination_range(current_page, max_page, delta=2):
        left = max(current_page - delta, 1)
        right = min(current_page + delta, max_page)
        range_pages = []

        if left > 1:
            range_pages.append(1)
            if left > 2:
                range_pages.append("...")

        range_pages.extend(range(left, right + 1))

        if right < max_page:
            if right < max_page - 1:
                range_pages.append("...")
            range_pages.append(max_page)

        return range_pages

    pagination_range = get_pagination_range(current_page, max_page)

    return render(request, 'dashboard/live_tracking.html', {
        'staff_data': items,
        'current_page': current_page,
        'previous_page': current_page - 1 if current_page > 1 else None,
        'next_page': current_page + 1 if current_page < max_page else None,
        'pages': range(1, max_page + 1),
        'pagination_range': pagination_range,
        'max_page': max_page,
        'search_query': request.GET.get("search", ""),
        'now': now(),  # 🕓 Add this line
        'days_filter': days_filter
    })































































logger = logging.getLogger(__name__)
# Function to handle the fetching and storing of staff status data
from django.shortcuts import render
import json
import hashlib
import sys
from dashboard import crm_status_data

# Global set to track duplicates
seen_combinations = set()

# Function to fetch and update data
def fetch_and_update_data():
    """Fetch fresh data from the CRM and update cache if changed."""
    timesheets = crm_status_data.get_timesheets()  # Fetch the timesheet data
    new_data = []
    seen_ids = set()
    total = len(timesheets)

    for index, timesheet in enumerate(timesheets, 1):
        staff_id = timesheet.get("staff_id")

        if staff_id in seen_ids:
            print(f"⚠️ Duplicate staff_id {staff_id} skipped", file=sys.stderr)
            continue

        try:
            status = crm_status_data.determine_status(timesheet)
            staff_details = crm_status_data.get_staff_details(staff_id)

            firstname = staff_details.get("firstname", "").strip()
            lastname = staff_details.get("lastname", "").strip()
            full_name = f"{firstname} {lastname}".strip() or "—"

            entry = {
                "id": staff_id,
                "name": full_name,
                "status": status,
                "email": staff_details.get("email", ""),
                "phone": staff_details.get("phonenumber", ""),
                "task": timesheet.get("task_name", "—"),
                "start_time": timesheet.get("start_time", "—"),
                "end_time": timesheet.get("end_time", "—")
            }

            new_data.append(entry)
            seen_ids.add(staff_id)

        except Exception as e:
            print(f"[❌ get_staff_details] Error for staff_id {staff_id}: {e}", file=sys.stderr)
            continue

    return new_data


# Function to determine if the data should be refreshed
def staff_status_view(request):
    print("🔥 staff_status_view triggered!", file=sys.stderr)

    # If the cache is invalid or doesn't exist, fetch fresh data
    if not is_cache_valid():
        print("⚠️ Cache invalid or missing. Fetching fresh data.", file=sys.stderr)
        new_data = fetch_and_update_data()

        # Save the new data to cache
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)
        print(f"📁 Writing cache to: {CACHE_FILE.resolve()}", file=sys.stderr)
    else:
        # If the cache is valid, load the data from the cache
        print("✅ Cache is valid. Using cached data.", file=sys.stderr)
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            new_data = json.load(f)

    # Pagination logic
    page = int(request.GET.get("page", 1))
    per_page = 200
    start = (page - 1) * per_page
    end = start + per_page
    total = len(new_data)
    max_page = (total + per_page - 1) // per_page
    paged_data = new_data[start:end]

    print(f"📄 Showing page {page} of {max_page} ({len(paged_data)} items)", file=sys.stderr)

    return render(request, "dashboard/staff_status.html", {
        "staff_statuses": paged_data,
        "current_page": page,
        "max_page": max_page
    })




















@login_required
def dashboard_view(request):
    from dashboard.ai_search_helpers import get_dashboard_context
    context = get_dashboard_context()

    screenshots = context.get('screenshots', [])
    latest = []

    for shot in screenshots:
        if shot.get("url"):
            latest.append({
                "url": shot["url"],
                "time": shot.get("time", ""),
                "user": shot.get("user", "Unknown"),
                "task": shot.get("task", "Untitled")
            })

    # Sort or slice if needed (assuming they're already sorted newest-first)
    context['latest_screenshots'] = latest[:5]

    return render(request, 'dashboard/index.html', context)














def search_employee_names(request):
    query = request.GET.get("q", "").strip().lower()

    try:
        res = requests.get(API_URL, headers={
            "authtoken": AUTH_TOKEN,
            "Accept": "application/json"
        }, timeout=10)
        res.raise_for_status()
        staff_list = res.json()

        cleaned = []
        for staff in staff_list:
            firstname = (staff.get("firstname") or "").strip()
            lastname = (staff.get("lastname") or "").strip()
            job = str(staff.get("job_position") or "").strip()
            full_name = f"{firstname} {lastname}".strip()
            if full_name:
                entry = {
                    "name": full_name,
                    "job": job,
                    "last_login": staff.get("last_login") or "1970-01-01 00:00:00"
                }
                cleaned.append(entry)

        if query:
            matches = [
                f"{emp['name']} – {emp['job']}"
                for emp in cleaned
                if query in emp['name'].lower()
            ]
        else:
            sorted_employees = sorted(
                cleaned,
                key=lambda x: x['last_login'],
                reverse=True
            )
            matches = [
                f"{emp['name']} – {emp['job']}"
                for emp in sorted_employees[:10]
            ]

        return JsonResponse({"matches": matches})

    except Exception as e:
        print(f"[❌ search_employee_names] Error: {e}")
        return JsonResponse({"matches": []})





@require_GET
def user_timeline_view(request):
    staffid = request.GET.get("staffid")
    if not staffid:
        return JsonResponse({"error": "Missing staffid parameter"}, status=400)

    print(f"[DEBUG] Staff ID received: {staffid}")
    try:
        timeline_entries = get_user_timelines_by_staffid(staffid)
        return JsonResponse({"entries": timeline_entries}, safe=False)
    except Exception as e:
        print(f"[❌ Error in user_timeline_view] {e}")
        return JsonResponse({"error": str(e)}, status=500)
    

from django.shortcuts import redirect

def language_redirect_view(request):
    user_language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'en').split(',')[0]
    lang_code = user_language.split('-')[0]

    if lang_code not in ['en', 'tr']:
        lang_code = 'en'

    return redirect(f'/{lang_code}/')






import json
from django.shortcuts import render
from django.http import JsonResponse
file_path = BASE_DIR / 'dashboard' / 'data' / 'cached_staff_status.json'

# Assuming BASE_DIR is defined earlier in your settings.py or here
BASE_DIR = Path(__file__).resolve().parent.parent  # Path to your project root



























def get_status_counts():
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"⚠️ File not found at {file_path}")
        return {"at_work": 0, "in_meeting": 0, "at_break": 0, "idle": 0, "off": 0}
    except json.JSONDecodeError:
        print("⚠️ Error decoding JSON. Returning default status counts.")
        return {"at_work": 0, "in_meeting": 0, "at_break": 0, "idle": 0, "off": 0}
    
    # Adjusted keys
    status_counts = {
        "at_work": 0,
        "in_meeting": 0,
        "at_break": 0,
        "idle": 0,
        "off": 0,
    }

    for item in data:
        status = item.get("status", "").strip().lower()
        if status == "working":
            status_counts["at_work"] += 1
        elif status == "meeting":
            status_counts["in_meeting"] += 1
        elif status == "break":
            status_counts["at_break"] += 1
        elif status == "idle":
            status_counts["idle"] += 1
        elif status == "off":
            status_counts["off"] += 1

    return status_counts


























def dashboard_view(request):
    """
    View function to render the dashboard with status counts dynamically fetched.
    """
    # Get the counts dynamically from the get_status_counts function
    status_counts = get_status_counts()

    # Pass the status counts to the template along with the current date for the button
    return render(request, 'dashboard/index.html', {
        "status_counts": status_counts,
        "current_date": datetime.now().strftime("%Y-%m-%d")  # Pass current date for the button
    })

















# Function to load staff data from JSON file
def load_staff_data():
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"⚠️ Error loading staff data: {e}")
        return []

# Function to search staff names dynamically
from django.views.decorators.csrf import csrf_exempt





@require_GET
def search_staff(request):
    print(f"⚠️ Function Triggered wow")

    # Ensure the query parameter is cleaned and not empty
    query = request.GET.get('q', '').strip().lower()

    # Path to cached staff status data
    file_path = BASE_DIR / 'dashboard' / 'data' / 'cached_staff_status.json'

    if not file_path.exists():
        return JsonResponse({"matches": []})

    try:
        # Load staff data from JSON cache
        with open(file_path, 'r') as f:
            employees_data = json.load(f)

        if query:
            matches = [
                f"{emp.get('name', '')} – {emp.get('job', '')}".strip(" –")
                for emp in employees_data
                if query in emp.get('name', '').lower() or query in emp.get('job', '').lower()
            ]
        else:
            matches = [
                f"{emp.get('name', '')} – {emp.get('job', '')}".strip(" –")
                for emp in employees_data[:20]  # If query is empty, return first 20
            ]

        return JsonResponse({"matches": matches})

    except FileNotFoundError:
        return JsonResponse({"matches": [], "error": "File not found."})
    except json.JSONDecodeError:
        return JsonResponse({"matches": [], "error": "Error decoding JSON."})
    except Exception as e:
        print(f"Error in search_staff: {e}")
        return JsonResponse({"matches": [], "error": str(e)})
    













# Path to your cached staff status JSON file
CACHE_FILE_PATHH = Path('C:/Users/DDS/Downloads/site/dashboard/data/cached_staff_status.json')

def get_cached_staff_data(request):
    try:
        # Open the file and load data
        with open(CACHE_FILE_PATHH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Return the data as a JSON response
        return JsonResponse(data, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "File not found."}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Error decoding JSON."}, status=500)
    


