import os
import boto3
from botocore.exceptions import ClientError
from django.conf import settings

AWS_REGION = "eu-north-1"
BUCKET_NAME = "ddsfocustime"
S3_BASE_PREFIX = "screenshots/"
LOCAL_BASE_FOLDER = os.path.join(settings.MEDIA_ROOT, "screenshots")

def download_all_screenshots():
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

    s3 = boto3.client("s3",
                      aws_access_key_id=AWS_ACCESS_KEY_ID,
                      aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                      region_name=AWS_REGION)

    print("🔍 Scanning S3 bucket for screenshots...\n")

    try:

        print(f"\n🎉 Finished!  new/updated screenshots downloaded.")
        print(f"⏭️ images skipped (already up-to-date).")

    except ClientError as e:
        print(f"[❌] AWS Error: {e}")
