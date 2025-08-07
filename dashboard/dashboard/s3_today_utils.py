import boto3
from datetime import datetime, timezone

def fetch_today_screenshots_from_s3():
    s3 = boto3.client("s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name="eu-north-1"
    )

    bucket = "ddsfocustime"
    prefix = "screenshots/"
    today = datetime.now(timezone.utc).date()
    fetched_images = []

    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents", []):
            if obj["Key"].lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                if obj["LastModified"].date() == today:
                    url = f"https://{bucket}.s3.eu-north-1.amazonaws.com/{obj['Key']}"
                    fetched_images.append(url)

    print(f"📸 Found {len(fetched_images)} screenshots from today.")
    return fetched_images
