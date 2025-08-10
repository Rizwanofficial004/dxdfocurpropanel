from dotenv import load_dotenv
import os

# Load .env.production from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.production'))

from s3_pagination_utils import list_s3_screenshots_paginated

if __name__ == "__main__":
    # Example test: adjust email/folder as needed for your S3
    email = "mervegucluu.0044_at_gmail.com"
    folder = "_EASY_HOME_2025_Yılı_HAZİRAN_Genel_Reklam_Planlama_ve_Paylaşım_Yönetimi"
    limit = 10
    continuation_token = None

    print(f"Testing S3 pagination for: {email} / {folder}")
    result = list_s3_screenshots_paginated(email, folder, limit, continuation_token)
    print(f"Total returned: {result['total_returned']}")
    print(f"Is truncated: {result['is_truncated']}")
    print(f"Next token: {result['next_token']}")
    print("First 3 screenshots:")
    for ss in result['screenshots'][:3]:
        print(ss)
