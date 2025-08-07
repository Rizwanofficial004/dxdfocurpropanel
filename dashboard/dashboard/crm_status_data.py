import requests

AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o"
BASE_URL = "https://crm.deluxebilisim.com/api"

HEADERS = {
    "authtoken": AUTH_TOKEN,
    "Accept": "application/json"
}

def get_timesheets():
    try:
        res = requests.get(f"{BASE_URL}/timesheets", headers=HEADERS)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print("[❌ get_timesheets] Error:", e)
        return []

def get_staff_details(staff_id):
    try:
        res = requests.get(f"{BASE_URL}/staffs/search/{staff_id}", headers=HEADERS)
        res.raise_for_status()
        data = res.json()
        return data[0] if isinstance(data, list) and data else {}
    except Exception as e:
        print(f"[❌ get_staff_details] Error for staff_id {staff_id}:", e)
        return {}

def determine_status(timesheet):
    # Customize based on business rules
    try:
        if not timesheet.get("end_time"):
            return "Active"
        duration = int(timesheet["end_time"]) - int(timesheet["start_time"])
        if duration < 120:
            return "Idle"
        elif duration < 1800:
            return "Break"
        else:
            return "Working"
    except Exception:
        return "Unknown"

def get_status_summary(timesheets):
    summary = {"Active": 0, "Idle": 0, "Break": 0, "Working": 0, "Unknown": 0}
    for ts in timesheets:
        status = determine_status(ts)
        summary[status] = summary.get(status, 0) + 1
    return summary


def get_status_summary():
    timesheets = get_timesheets()
    summary = {
        "at_work": 0,
        "in_meeting": 0,
        "at_break": 0,
        "idle": 0,
        "off": 0
    }

    for ts in timesheets:
        status = determine_status(ts)

        if status == "Working":
            summary["at_work"] += 1
        elif status == "Meeting":
            summary["in_meeting"] += 1
        elif status == "Break":
            summary["at_break"] += 1
        elif status == "Idle":
            summary["idle"] += 1
        else:
            summary["off"] += 1  # fallback / unknown

    return summary
