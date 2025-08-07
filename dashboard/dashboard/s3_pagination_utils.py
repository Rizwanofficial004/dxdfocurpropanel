import boto3
import os
from datetime import datetime

try:
    from .get_employee_screenshots import generate_presigned_url
except ImportError:
    from get_employee_screenshots import generate_presigned_url

AWS_REGION = "eu-north-1"
BUCKET_NAME = "ddsfocustime"
S3_BASE_PREFIX = "screenshots/"
ALLOWED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')

def list_s3_screenshots_paginated(email, folder=None, limit=1000, continuation_token=None):
    """
    List screenshots in S3 for a user (and optional subfolder) with true S3 pagination.
    Returns: dict with screenshots, next_token, is_truncated, total_returned
    """
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=AWS_REGION
    )
    prefix = f"{S3_BASE_PREFIX}{email}/"
    if folder:
        prefix += f"{folder}/"
    kwargs = {
        "Bucket": BUCKET_NAME,
        "Prefix": prefix,
        "MaxKeys": limit
    }
    if continuation_token:
        kwargs["ContinuationToken"] = continuation_token
    response = s3.list_objects_v2(**kwargs)
    screenshots = []
    for obj in response.get("Contents", []):
        key = obj["Key"]
        if key.lower().endswith(ALLOWED_EXTENSIONS):
            screenshots.append({
                "key": key,
                "url": generate_presigned_url(BUCKET_NAME, key),
                "last_modified": obj["LastModified"].isoformat(),
                "size": obj["Size"]
            })
    next_token = response.get("NextContinuationToken")
    is_truncated = response.get("IsTruncated", False)
    return {
        "screenshots": screenshots,
        "next_token": next_token,
        "is_truncated": is_truncated,
        "total_returned": len(screenshots)
    }
