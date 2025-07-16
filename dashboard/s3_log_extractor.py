from flask import Flask, request, jsonify
import boto3
import json
from datetime import datetime
from dotenv import load_dotenv
import os
import openai
from .program_summary_logger import (
    log_program_summary_operation, 
    log_user_search, 
    log_program_analysis, 
    log_openai_operation, 
    log_s3_operation, 
    log_api_request,
    log_cache_operation,
    log_detailed_program_summary,
    log_program_summary_json
)

# Env load karo (agar OPENAI key ya future config chahiye to)
load_dotenv()

# AWS Config
AWS_ACCESS_KEY_ID = "AKIARSU6EUUWMQ5I2JWC"
AWS_SECRET_ACCESS_KEY = "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"
AWS_REGION = "eu-north-1"
BUCKET_NAME = "ddsfocustime"

# Flask app
app = Flask(__name__)

@app.route("/api/staff-status/", methods=["GET"])
def staff_status():
    """
    Return a list of employees for the frontend search.
    This endpoint mimics your /en/api/staff-status/ for local testing.
    """
    # Example: Load from a static list or from your DB if available
    # Replace this with your real data source as needed
    employees = [
        {
            "firstname": "Haseeb",
            "lastname": "Codejourney",
            "email": "haseebcodejourney@gmail.com",
            "phone": "+123456789",
            "status": "Active"
        },
        {
            "firstname": "Amir",
            "lastname": "Ishaque",
            "email": "amirishaque67@gmail.com",
            "phone": "+987654321",
            "status": "Active"
        }
        # ...add more employees as needed...
    ]
    return jsonify(employees)

@app.route("/en/api/staff-status/", methods=["GET"])
def staff_status_en():
    """
    Return a list of employees for the frontend search.
    This endpoint matches your frontend's fetch URL: /en/api/staff-status/
    """
    employees = [
        {
            "firstname": "Haseeb",
            "lastname": "Codejourney",
            "email": "haseebcodejourney@gmail.com",
            "phone": "+123456789",
            "status": "Active"
        },
        {
            "firstname": "Amir",
            "lastname": "Ishaque",
            "email": "amirishaque67@gmail.com",
            "phone": "+987654321",
            "status": "Active"
        }
        # ...add more employees as needed...
    ]
    return jsonify(employees)

def find_latest_log_program_summary(user_email):
    s3_email = user_email.replace("@", "_at_")
    prefix = f"logs/{s3_email}/"

    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix=prefix)

    latest_summary = None
    found_any = False
    log_program_summary_operation(f"Searching for _program_summary.json in S3 prefix: {prefix}", user_email)
    
    for page in pages:
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if key.endswith("_program_summary.json"):
                found_any = True
                log_program_summary_operation(f"Candidate summary file: {key} (LastModified: {obj['LastModified']})", user_email, status="DEBUG")
                if not latest_summary or obj["LastModified"] > latest_summary["LastModified"]:
                    latest_summary = obj

    if not found_any:
        log_program_summary_operation("No _program_summary.json files found for this user", user_email, status="WARNING")

    if latest_summary:
        log_program_summary_operation(f"Latest summary selected: {latest_summary['Key']}", user_email)
        try:
            response = s3.get_object(Bucket=BUCKET_NAME, Key=latest_summary["Key"])
            content = response["Body"].read().decode("utf-8")
            log_s3_operation("Read program summary", BUCKET_NAME, latest_summary["Key"], success=True)
            return json.loads(content), latest_summary["Key"]
        except Exception as e:
            log_s3_operation("Read program summary", BUCKET_NAME, latest_summary["Key"], success=False, error=str(e))
            return None, latest_summary["Key"]

    log_program_summary_operation("No summary file selected/found", user_email, status="WARNING")
    return None, None

@app.route("/latest_log_summary", methods=["POST"])
def latest_log_summary():
    data = request.json
    user_email = data.get("email")
    log_program_summary_operation("/latest_log_summary called", user_email)

    if not user_email:
        log_program_summary_operation("Email is required but not provided", status="ERROR")
        return jsonify({"error": "Email is required"}), 400

    summary_data, key = find_latest_log_program_summary(user_email)
    if not summary_data:
        log_program_summary_operation("No summary data found or file is corrupt", user_email, status="ERROR")
        return jsonify({"error": "Koi program summary nahi mili ya file corrupt hai"}), 404

    log_program_summary_operation(f"Returning summary for key: {key}", user_email)
    log_api_request("/latest_log_summary", "POST", user_email, response_size=len(str(summary_data)))
    return jsonify({
        "key": key,
        "summary": summary_data
    })

def list_all_log_users():
    """
    List all unique users (emails) found in the logs/ folder in S3.
    """
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix="logs/")
    users = set()
    log_program_summary_operation("Scanning all users in logs/")
    
    for page in pages:
        for obj in page.get("Contents", []):
            key = obj["Key"]
            # logs/{s3_email}/... structure
            parts = key.split("/")
            if len(parts) > 1 and parts[0] == "logs":
                s3_email = parts[1]
                email = s3_email.replace("_at_", "@")
                users.add(email)
    
    log_program_summary_operation(f"Found {len(users)} users in logs/", details=f"Users: {sorted(users)}")
    return users

class S3LogExtractor:
    """
    Real S3LogExtractor for user program summary report from logs/ folder.
    Uses OpenAI to help extract categories/programs if not present in the JSON.
    """
    def __init__(self, aws_access_key_id=None, aws_secret_access_key=None, region_name=None, bucket_name=None):
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key_id or AWS_ACCESS_KEY_ID,
            aws_secret_access_key=aws_secret_access_key or AWS_SECRET_ACCESS_KEY,
            region_name=region_name or AWS_REGION
        )
        self.bucket_name = bucket_name or BUCKET_NAME
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    def generate_user_program_report(self, user_email, date_range=None):
        s3_email = user_email.replace("@", "_at_")
        prefix = f"logs/{s3_email}/"
        paginator = self.s3.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket=self.bucket_name, Prefix=prefix)
        summaries = []
        
        log_program_summary_operation("Starting program report generation", user_email)
        
        for page in pages:
            for obj in page.get("Contents", []):
                key = obj["Key"]
                if key.endswith("_program_summary.json"):
                    try:
                        response = self.s3.get_object(Bucket=self.bucket_name, Key=key)
                        content = response["Body"].read().decode("utf-8")
                        data = json.loads(content)
                        summaries.append({"key": key, "data": data})
                        log_s3_operation("Read program summary", self.bucket_name, key, success=True)
                    except Exception as e:
                        log_s3_operation("Read program summary", self.bucket_name, key, success=False, error=str(e))
        
        if not summaries:
            log_program_summary_operation("No _program_summary.json found", user_email, status="WARNING")
            return {
                "user_email": user_email,
                "categories": {},
                "programs": {},
                "status": False,
                "message": "No timeline data available for this user."
            }
        
        # If multiple, return the latest by LastModified (not just key sort)
        latest = max(summaries, key=lambda x: x["data"].get("last_modified") or x["key"])
        categories = latest["data"].get("categories", {})
        programs = latest["data"].get("programs", {})

        # If categories/programs are missing or empty, try to use OpenAI to extract them
        if (not categories or not programs) and self.openai_api_key:
            try:
                openai.api_key = self.openai_api_key
                # Use a short version of the JSON for prompt
                json_text = json.dumps(latest["data"])
                prompt = (
                    "Given the following JSON log summary, extract and summarize the main 'categories' and 'programs' "
                    "the user worked on. Return a JSON with 'categories' and 'programs' keys and their values.\n"
                    f"JSON:\n{json_text}\n"
                )
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=400,
                    temperature=0
                )
                answer = response.choices[0].message['content']
                log_openai_operation("Extract categories and programs", user_email, success=True, details=answer)
                # Try to parse the AI's JSON
                ai_data = json.loads(answer)
                categories = ai_data.get("categories", categories)
                programs = ai_data.get("programs", programs)
            except Exception as e:
                log_openai_operation("Extract categories and programs", user_email, success=False, error=str(e))

        log_program_analysis(user_email, len(categories), len(programs), latest["key"])
        
        # Use detailed program summary logging for better insights
        log_detailed_program_summary(
            user_email=user_email,
            categories_data=categories,
            programs_data=programs,
            source_file=latest["key"]
        )
        
        return {
            "user_email": user_email,
            "categories": categories,
            "programs": programs,
            "status": True if categories or programs else False,
            "message": f"Loaded from {latest['key']}"
        }

def search_logs_by_username_or_email(query):
    """
    Search logs/ folder for users matching the query (username or email).
    For each match, print the found _program_summary.json file key.
    Uses OpenAI to help match usernames to emails if needed.
    """
    # Load OpenAI API key from .env
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        print("ERROR: OPENAI_API_KEY not found in environment.")
        return

    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix="logs/")
    user_map = {}  # s3_email -> email

    print(f"DEBUG: Building user map from logs/ ...")
    for page in pages:
        for obj in page.get("Contents", []):
            key = obj["Key"]
            parts = key.split("/")
            if len(parts) > 1 and parts[0] == "logs":
                s3_email = parts[1]
                email = s3_email.replace("_at_", "@")
                user_map[s3_email] = email

    # Try direct match
    found = False
    for s3_email, email in user_map.items():
        if query.lower() in email.lower() or query.lower() in s3_email.lower():
            print(f"Match: {email} (S3: {s3_email})")
            prefix = f"logs/{s3_email}/"
            paginator2 = s3.get_paginator("list_objects_v2")
            pages2 = paginator2.paginate(Bucket=BUCKET_NAME, Prefix=prefix)
            for page2 in pages2:
                for obj in page2.get("Contents", []):
                    key2 = obj["Key"]
                    if key2.endswith("_program_summary.json"):
                        print(f"  Found summary: {key2}")
                        found = True
    if found:
        return

    # If not found, use OpenAI to try to guess the email from username
    print("No direct match found. Using OpenAI to guess email from username...")
    prompt = (
        f"Given this username or partial email: '{query}', and this list of emails:\n"
        + "\n".join(user_map.values()) +
        "\nWhich email(s) most likely match the username or query? Return only the best matching email(s)."
    )
    try:
        openai.api_key = openai_api_key
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0
        )
        answer = response.choices[0].message['content']
        print("OpenAI suggestion:", answer)
        # Try to extract and search for the suggested email(s)
        for email in user_map.values():
            if email in answer:
                print(f"OpenAI Match: {email}")
                s3_email = email.replace("@", "_at_")
                prefix = f"logs/{s3_email}/"
                paginator2 = s3.get_paginator("list_objects_v2")
                pages2 = paginator2.paginate(Bucket=BUCKET_NAME, Prefix=prefix)
                for page2 in pages2:
                    for obj in page2.get("Contents", []):
                        key2 = obj["Key"]
                        if key2.endswith("_program_summary.json"):
                            print(f"  Found summary: {key2}")
                            found = True
        if not found:
            print("No _program_summary.json found for OpenAI-suggested emails.")
    except Exception as e:
        print("OpenAI API error:", e)

def print_all_program_summaries_for_user(user_email):
    """
    Search S3 logs/{s3_email}/ for all _program_summary.json files for the given user,
    print their keys and contents (truncated for readability).
    """
    s3_email = user_email.replace("@", "_at_")
    prefix = f"logs/{s3_email}/"

    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix=prefix)

    found = False
    print(f"Searching for all _program_summary.json files for {user_email} in {prefix}")
    for page in pages:
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if key.endswith("_program_summary.json"):
                found = True
                print(f"\n--- S3 Key: {key} ---")
                try:
                    response = s3.get_object(Bucket=BUCKET_NAME, Key=key)
                    content = response["Body"].read().decode("utf-8")
                    # Print only the first 500 chars for brevity
                    print(content[:500] + ("..." if len(content) > 500 else ""))
                except Exception as e:
                    print(f"ERROR: Could not read {key}: {e}")
    if not found:
        print("No _program_summary.json files found for this user.")

@app.route("/search_user_logs", methods=["POST"])
def search_user_logs():
    """
    Search for a user by name or email and return their latest log summary (categories and programs).
    """
    data = request.json
    query = data.get("query")
    if not query:
        log_program_summary_operation("Query is required but not provided", status="ERROR")
        return jsonify({"error": "Query is required"}), 400

    log_user_search(query)

    # Build user map from S3 logs/
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix="logs/")
    user_map = {}  # s3_email -> email

    for page in pages:
        for obj in page.get("Contents", []):
            key = obj["Key"]
            parts = key.split("/")
            if len(parts) > 1 and parts[0] == "logs":
                s3_email = parts[1]
                email = s3_email.replace("_at_", "@")
                user_map[s3_email] = email

    # Try direct match
    matched_email = None
    for s3_email, email in user_map.items():
        if query.lower() in email.lower() or query.lower() in s3_email.lower():
            matched_email = email
            break

    # If not found, use OpenAI to guess the email from username
    if not matched_email:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            log_program_summary_operation("OPENAI_API_KEY not found in environment", status="ERROR")
            return jsonify({"error": "OPENAI_API_KEY not found in environment."}), 500
        prompt = (
            f"Given this username or partial email: '{query}', and this list of emails:\n"
            + "\n".join(user_map.values()) +
            "\nWhich email(s) most likely match the username or query? Return only the best matching email(s)."
        )
        try:
            openai.api_key = openai_api_key
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0
            )
            answer = response.choices[0].message['content']
            log_openai_operation("Guess email from username", success=True, details=answer)
            # Pick the first email in the answer that exists in user_map
            for email in user_map.values():
                if email in answer:
                    matched_email = email
                    break
        except Exception as e:
            log_openai_operation("Guess email from username", success=False, error=str(e))
            return jsonify({"error": f"OpenAI API error: {e}"}), 500

    if not matched_email:
        log_user_search(query, result_count=0)
        return jsonify({"error": "No matching user found."}), 404

    log_user_search(query, result_count=1, matched_email=matched_email)

    # Get latest log summary for matched_email
    extractor = S3LogExtractor()
    report = extractor.generate_user_program_report(matched_email)
    if not report.get("status"):
        log_program_summary_operation("No log summary found for user", matched_email, status="WARNING")
        return jsonify({"error": "No log summary found for this user."}), 404

    # Only return categories and programs as requested
    response_data = {
        "categories": report.get("categories", {}),
        "programs": report.get("programs", {}),
        "user_email": matched_email
    }
    
    log_api_request("/search_user_logs", "POST", matched_email, response_size=len(str(response_data)))
    return jsonify(response_data)

if __name__ == "__main__":
    # Print all users in logs/ folder before running the app
    list_all_log_users()
    # Example: print all program summaries for a specific user
    # print_all_program_summaries_for_user("haseebcodejourney@gmail.com")
    # To use: uncomment above and change the email as needed
    app.run(debug=True, port=5001)
