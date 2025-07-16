import requests
from django.shortcuts import render
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from dashboard.tasks import perform_search_and_cache
import time
import openai
from django.http import JsonResponse
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
# Consolidate screenshot-related imports
from dashboard.get_employee_screenshots import (
    scan_and_download_screenshots,
    generate_presigned_url
)
from dashboard.services.user_log_service import get_filtered_logs

# Organize utility imports
from dotenv import load_dotenv
from django.conf import settings
from urllib.parse import quote
import os
from pathlib import Path
from dashboard.utils import (
    fetch_staff_data,
    get_all_user,
    convert_browser_date_to_iso,
    analyze_screenshot,
    url_to_base64
)

# AI-related imports
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

import openai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
# Load environment variables from .env file
load_dotenv()
import logging


AUTH_TOKEN = os.getenv("AUTH_TOKEN")
API_URL = "https://crm.deluxebilisim.com/api/staffs/"
BASE_DIR = Path(__file__).resolve().parent.parent
(Path(BASE_DIR / "dashboard" / "data")).mkdir(parents=True, exist_ok=True)
CACHE_FILE = BASE_DIR / "dashboard" / "data" / "cached_staff_status.json"
print(f"📁 Writing cache to: {CACHE_FILE.resolve()}", file=sys.stderr)


openai.api_key = "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"


# def login_view(request):
#     return render(request, 'dashboard/login.html')

from django.contrib.auth.decorators import login_required


@csrf_exempt
def translate_text(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text = data.get("text", "")
        target_lang = data.get("lang", "tr")

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Translate to {target_lang}"},
                {"role": "user", "content": text}
            ]
        )
        return JsonResponse({"translated": response.choices[0].message.content.strip()})













# Create a logger
logger = logging.getLogger(__name__)

def login_view(request):
    print(f"⚠️ Login View Triggered -1")
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




def update_logs(request):
    print('-------------------******************UPDATE_LOGS***************--------------------')
    logger.info('inside of the function update_logs')
    logger.info(request)
    logger.info('End of the function update_logs')
    return 'Empty Object'







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



# @login_required
# def dashboard_view(request):
#     status_counts = crm_status_data.get_status_summary()
#     today = datetime.today().date()
#     date_slots = [today + timedelta(days=i) for i in range(7)]
#     print(date_slots)
#     context = {
#         "status_counts": status_counts,
#         'date_slots': date_slots
#     }
#     return render(request, 'dashboard/index.html', context)


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
    # def format_minutes_or_hours(minutes):
    #     if minutes < 1:
    #         return f"{round(minutes * 60)}s"
    #     elif minutes < 60:
    #         return f"{round(minutes)}m"
    #     elif minutes % 60 == 0:
    #         return f"{int(minutes // 60)}h"
    #     else:
    #         hours = int(minutes // 60)
    #         mins = int(minutes % 60)
    #         return f"{hours}h {mins}m"

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
 
    max_page = (total_count + per_page - 1) // per_page
    # ✅ Calculate reverse offset
    # reverse_page = max_page - current_page + 1
    # reverse_offset = (reverse_page - 1) * per_page
    offset = current_page  * per_page
    reversed_offset = total_count - offset
    # Now fetch only the reversed slice
    staff_data = fetch_staff_data(reversed_offset, per_page, search_query, days_filter)

    
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

        all_data = scan_and_download_screenshots(email)
        row["screenshots"] = [all_data.get("image_urls")]
        print("📦 Triggering screenshot download from S3...")
        # all_data = {"image_urls": [], "folder_map": {}}  # Downloads to media/screenshots/email/task/image


    # folder_map = all_data.get("folder_map", {})

    # # ✅ Match screenshots to each staff entry
    # for row in staff_data['items']:
    #     email = row.get("email", "")
    #     task = row.get("task_name", "")

    #     if not email or not task:
    #         row["screenshots"] = []
    #         continue

    #     # Normalize for folder lookup
    #     normalized_email = email.replace("@", "_at_")
    #     normalized_task = task.replace(" ", "_")  # Keep commas etc.
    #     folder_key = f"{normalized_email}/{normalized_task}"

    #     screenshots = folder_map.get(folder_key, [])
    #     # Sort by filename or timestamp if applicable (you can improve this later)
    #     latest = sorted(screenshots)[-1] if screenshots else None
    #     row["screenshots"] = [latest] if latest else []

    #     print(f"➡️ Looking for folder: {folder_key}")
    #     if screenshots:
    #         print(f"✅ Found {len(screenshots)} screenshot(s) for {email}")
    #     else:
    #         print(f"🚫 No screenshots found for {email} — {task}")



    email = row.get("email", "")
    task = row.get("task_name", "")
    # safe_task = normalize_task_name_with_ai(task)

    # screenshot_url = get_latest_screenshot_paths(email, safe_task)
    # row["screenshot_url"] = screenshot_url
    # row["screenshot_name"] = os.path.basename(screenshot_url) if screenshot_url else ""









    # total_count = staff_data['total']
    items = staff_data['items']
    # max_page = (total_count + per_page - 1) // per_page

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




















# @login_required
# # def dashboard_view(request):
# #     print('-----------PRINT DASHBOARD')
# #     from dashboard.ai_search_helpers import get_dashboard_context
# #     context = get_dashboard_context()
# #     screenshots = context.get('screenshots', [])
# #     latest = []

# #     for shot in screenshots:
# #         if shot.get("url"):
# #             latest.append({
# #                 "url": shot["url"],
# #                 "time": shot.get("time", ""),
# #                 "user": shot.get("user", "Unknown"),
# #                 "task": shot.get("task", "Untitled")
# #             })

# #     # Sort or slice if needed (assuming they're already sorted newest-first)
# #     context['latest_screenshots'] = latest[:5]

# #     return render(request, 'dashboard/index.html', context)














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
    today = datetime.today().date()
    date_slots = [today - timedelta(days=i) for i in range(30)]  # Show 30 days instead of 7
    # Get the counts dynamically from the get_status_counts function
    status_counts = get_status_counts()
    # Pass the status counts to the template along with the current date for the button
    return render(request, 'dashboard/index.html', {
        "status_counts": status_counts,
        "current_date": datetime.now().strftime("%Y-%m-%d"),
        'date_slots': date_slots  # Pass current date for the button
    })


def fetch_user_info(request):
    if request.method == "GET":
        keyword = request.GET.get('keyword', '').strip()
        date_str = request.GET.get('date', '').strip()
        print(f"📅 Received date string: '{date_str}'")
        try:
            date_to_match = convert_browser_date_to_iso(date_str) 
            if not date_to_match:
                date_to_match = datetime.now().strftime("%Y-%m-%d")
                print(f"⚠️ Using fallback date: {date_to_match}")
        except Exception as e:
            print(f"⚠️ Date conversion error: {e}")
            date_to_match = datetime.now().strftime("%Y-%m-%d")
        
        filtered_urls = []
        user_log_info = []
        available_dates_set = set()
        try:
            print(f"🔍 Fetching screenshots for user: {keyword}, date: {date_to_match}")
            all_data = scan_and_download_screenshots(keyword, None, True)
            bucket_name = 'ddsfocustime'
            raw_image_urls = all_data.get("image_urls", [])
            if not isinstance(raw_image_urls, list):
                raw_image_urls = []
                print("⚠️ image_urls is not a list")
            print(f"✅ Found {len(raw_image_urls)} total screenshots for {keyword}")
            MAX_SCREENSHOTS = 100
            for obj in raw_image_urls:
                try:
                    if not isinstance(obj, dict):
                        print(f"⚠️ Invalid object type: {type(obj)}")
                        continue
                    key = obj.get('Key', '')
                    last_modified = obj.get('LastModified', '')
                    # Parse date from LastModified
                    date_only = ""
                    if last_modified:
                        try:
                            if isinstance(last_modified, str):
                                date_only = last_modified[:10]
                            else:
                                date_only = last_modified.strftime("%Y-%m-%d")
                        except Exception as e:
                            print(f"⚠️ Error parsing date from LastModified: {e}")
                    if date_only:
                        available_dates_set.add(date_only)
                    # Strict date filter
                    if date_only == date_to_match:
                        url = generate_presigned_url(bucket_name, key)
                        # Extract task name from S3 key
                        task_name = "Unknown task"
                        try:
                            key_parts = key.split('/')
                            if len(key_parts) >= 3:
                                from urllib.parse import unquote
                                task_name = unquote(key_parts[2]).replace('_', ' ')
                        except Exception as e:
                            print(f"⚠️ Error extracting task name from key {key}: {e}")
                        new_obj = {
                            "time": str(last_modified) if last_modified else "",
                            "image_url": url,
                            "task": task_name
                        }
                        filtered_urls.append(new_obj)
                except Exception as e:
                    print(f"⚠️ Error processing S3 object: {e}")
                    continue
            # Limit screenshots for performance
            if len(filtered_urls) > MAX_SCREENSHOTS:
                print(f"⚠️ Limiting screenshots from {len(filtered_urls)} to {MAX_SCREENSHOTS}")
                filtered_urls = filtered_urls[:MAX_SCREENSHOTS]
            # Prepare available_dates (last 30 days with screenshots, always sorted)
            available_dates = sorted(list(available_dates_set), reverse=True)[:30]
            # If fewer than 30, pad with previous days (no screenshots) to always show 30 days
            if len(available_dates) < 30:
                today = datetime.now().date()
                # Add missing days (in YYYY-MM-DD format)
                for i in range(30):
                    day = (today - timedelta(days=i)).strftime("%Y-%m-%d")
                    if day not in available_dates:
                        available_dates.append(day)
                    if len(available_dates) == 30:
                        break
                available_dates = sorted(available_dates, reverse=True)
            # Always return available_dates, even if no screenshots for the selected date
            if not filtered_urls:
                print(f"⚠️ No screenshots available after processing for {keyword}")
                return JsonResponse({
                    "status": 200,
                    "screen_shot": [],
                    "user_log_info": [],
                    "available_dates": available_dates,
                    "message": f"No screenshots available for {keyword} on the selected date"
                })
            print(f"✅ Returning {len(filtered_urls)} processed screenshots for {keyword}")
            try:
                param = {
                    'email': keyword,
                    'date': date_to_match
                }
                user_log_data = get_filtered_logs(param)
                if hasattr(user_log_data, 'content'):
                    try:
                        import json
                        user_log_info = json.loads(user_log_data.content)
                    except:
                        user_log_info = []
                else:
                    user_log_info = user_log_data or []
            except Exception as log_error:
                print(f"⚠️ Error getting user logs: {log_error}")
                user_log_info = []
            return JsonResponse({
                "status": 200, 
                "screen_shot": filtered_urls,
                "user_log_info": user_log_info,
                "available_dates": available_dates
            })
        except ValueError as e:
            print(f"⚠️ Value Error in fetch_user_info: {e}")
            return JsonResponse({"status": False, "message": f"Date format error: {str(e)}"}, status=400)
        except Exception as e:
            print(f"❌ Error in fetch_user_info: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({"status": False, "message": f"Error retrieving screenshots: {str(e)}"}, status=500)
    return JsonResponse({"status": False, "message": "Only GET method allowed."}, status=405)

def cached_staff_status_view(request):
    all_user = get_all_user()
    return JsonResponse(all_user, safe=False)

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

        # Create more detailed matches that include task information
        detailed_matches = []
        
        if query:
            filtered_employees = [
                emp for emp in employees_data
                if query in emp.get('name', '').lower() or query in emp.get('job', '').lower()
            ]
        else:
            filtered_employees = employees_data[:20]  # If query is empty, return first 20
            
        for emp in filtered_employees:
            name = emp.get('name', '')
            email = emp.get('email', '')
            job = emp.get('job', '')
            task = emp.get('task', '')
            
            # Format the display text with task if available
            display_text = f"{name} – {job}"
            if task and task != '—':
                display_text += f" – {task}"
                
            detailed_matches.append({
                "text": display_text.strip(" –"),
                "name": name,
                "email": email,
                "task": task if task and task != '—' else "No active task"
            })

        return JsonResponse({"matches": detailed_matches})

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
    """
    Return cached staff data from the standard cache file location.
    This endpoint supports the staff status dashboard and screenshot display.
    """
    try:
        # Use the properly defined CACHE_FILE path instead of CACHE_FILE_PATHH
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Return the data as a JSON response
        return JsonResponse(data, safe=False)
    except FileNotFoundError:
        print(f"⚠️ Cache file not found at {CACHE_FILE}")
        # Return empty default data instead of error to prevent UI breaking
        return JsonResponse([], safe=False)
    except json.JSONDecodeError as e:
        print(f"⚠️ Error decoding JSON from cache: {e}")
        return JsonResponse({"error": "Error reading staff data."}, status=500)
    except Exception as e:
        print(f"⚠️ Unexpected error accessing staff data: {e}")
        return JsonResponse({"error": "Server error retrieving staff data."}, status=500)







def fetch_user_timeline_summary(request):
    """Fetch user timeline summary from S3 logs with categories and programs for ALL days."""
    if request.method == "GET":
        user_email = request.GET.get('user', '').strip()
        if not user_email:
            return JsonResponse({"status": False, "message": "User email is required"}, status=400)
        try:
            from .s3_log_extractor import S3LogExtractor
            extractor = S3LogExtractor()
            user_report = extractor.generate_user_program_report(user_email, date_range=None)
            # Use categories/programs directly if present
            categories = user_report.get('categories', {})
            programs = user_report.get('programs', {})
            if not categories and not programs:
                return JsonResponse({
                    "status": True,
                    "categories": {},
                    "programs": {},
                    "debug": f"No logs found for user {user_email} across all dates",
                    "real_data": False
                })
            return JsonResponse({
                "status": True,
                "categories": categories,
                "programs": programs,
                "debug": f"Logs found for user {user_email} across all dates",
                "real_data": True
            })
        except Exception as e:
            print(f"❌ Error in fetch_user_timeline_summary: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({"status": False, "message": f"Error retrieving timeline summary: {str(e)}"}, status=500)
    return JsonResponse({"status": False, "message": "Only GET method allowed."}, status=405)


def fetch_user_program_summary(request):
    """Fetch detailed program summary logs for a specific user. Uses logging functions from program_summary_logger, not a class."""
    if request.method == "GET":
        user_email = request.GET.get('user', '').strip()
        date_range = request.GET.get('date_range', 'all')
        if not user_email:
            return JsonResponse({"status": False, "message": "User email is required"}, status=400)
        try:
            from .s3_log_extractor import S3LogExtractor
            extractor = S3LogExtractor()
            user_report = extractor.generate_user_program_report(user_email, date_range=None)
            print(f"DEBUG: user_report for {user_email}: {user_report}")
            categories = user_report.get('categories', {})
            programs = user_report.get('programs', {})
            if not categories and not programs:
                return JsonResponse({
                    "status": True,
                    "data": {
                        "categories": {},
                        "programs": {},
                        "total_time": "0 mins",
                        "activity_summary": "No activity found",
                        "top_programs": [],
                        "top_categories": []
                    },
                    "message": f"No program summary data found for {user_email}",
                    "real_data": False
                })
            total_minutes = sum(float(str(time).replace(' mins', '')) for time in categories.values())
            total_time = f"{total_minutes:.1f} mins"
            top_programs = sorted(programs.items(), key=lambda x: float(str(x[1]).replace(' mins', '')), reverse=True)[:5]
            top_categories = sorted(categories.items(), key=lambda x: float(str(x[1]).replace(' mins', '')), reverse=True)[:5]
            if total_minutes > 0:
                most_active_category = max(categories.items(), key=lambda x: float(str(x[1]).replace(' mins', '')))
                most_active_program = max(programs.items(), key=lambda x: float(str(x[1]).replace(' mins', '')))
                activity_summary = f"Most active in {most_active_category[0]} ({most_active_category[1]}) using {most_active_program[0]} ({most_active_program[1]})"
            else:
                activity_summary = "No activity recorded"
            return JsonResponse({
                "status": True,
                "data": {
                    "categories": categories,
                    "programs": programs,
                    "total_time": total_time,
                    "activity_summary": activity_summary,
                    "top_programs": [{"name": name, "time": time} for name, time in top_programs],
                    "top_categories": [{"name": name, "time": time} for name, time in top_categories]
                },
                "message": f"Program summary data retrieved for {user_email}",
                "real_data": True
            })
        except Exception as e:
            print(f"❌ Error in fetch_user_program_summary: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({"status": False, "message": f"Error retrieving program summary: {str(e)}"}, status=500)
    return JsonResponse({"status": False, "message": "Only GET method allowed."}, status=405)






