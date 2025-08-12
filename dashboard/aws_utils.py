import boto3
from botocore.exceptions import ClientError
import re
import unicodedata
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def clean_for_s3(name):
    # Normalize Turkish characters and remove unsafe symbols
    name = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode()
    name = name.replace(" ", "").replace(".", "").lower()
    return re.sub(r"[^a-z0-9]", "", name)

def get_s3_client():
    """
    Get configured S3 client for API operations
    """
    return boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
        region_name=os.getenv("AWS_S3_REGION_NAME", "eu-north-1")  # Updated to correct region
    )

def generate_presigned_url(s3_key, bucket_name="ddsfocustime", expiration=3600):
    """
    Generate a presigned URL for secure access to S3 objects
    
    Args:
        s3_key (str): The S3 object key
        bucket_name (str): S3 bucket name
        expiration (int): URL expiration time in seconds (default: 1 hour)
    
    Returns:
        str: Presigned URL or direct URL as fallback
    """
    try:
        s3_client = get_s3_client()
        
        # Generate presigned URL with correct region
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': s3_key},
            ExpiresIn=expiration
        )
        
        print(f"[🔗] Generated presigned URL for: {s3_key}")
        return presigned_url
        
    except ClientError as e:
        print(f"[❌] Error generating presigned URL for {s3_key}: {e}")
        # Fallback to direct URL with correct region
        direct_url = f"https://{bucket_name}.s3.eu-north-1.amazonaws.com/{s3_key}"
        print(f"[🔄] Fallback to direct URL: {direct_url}")
        return direct_url
    except Exception as e:
        print(f"[❌] Unexpected error generating presigned URL: {e}")
        # Fallback to direct URL with correct region  
        direct_url = f"https://{bucket_name}.s3.eu-north-1.amazonaws.com/{s3_key}"
        print(f"[🔄] Fallback to direct URL: {direct_url}")
        return direct_url

def get_latest_screenshot_url(email, task_name):
    s3 = get_s3_client()

    base_prefix = f"screenshots/{email}/"
    try:
        # Step 1: list all folders under this user
        response = s3.list_objects_v2(Bucket="ddsfocustime", Prefix=base_prefix, Delimiter="/")
        all_objects = s3.list_objects_v2(Bucket="ddsfocustime", Prefix=base_prefix)

        # Step 2: Try to match folder with task name
        task_key = clean_for_s3(task_name)

        matches = []
        for obj in all_objects.get("Contents", []):
            parts = obj["Key"].split("/")
            if len(parts) >= 3:
                folder = parts[2]
                if clean_for_s3(folder) == task_key:
                    matches.append(obj)

        if not matches:
            print(f"[❌] No match for task: {task_name}")
            return None

        # Step 3: Return the latest screenshot with presigned URL
        matches.sort(key=lambda x: x["LastModified"], reverse=True)
        latest_key = matches[0]["Key"]
        
        # Generate presigned URL instead of direct URL
        presigned_url = generate_presigned_url(latest_key)
        if presigned_url:
            print(f"[🖼️] Matched Screenshot URL: {presigned_url}")
            return presigned_url
        else:
            # Fallback to direct URL if presigned fails
            url = f"https://ddsfocustime.s3.amazonaws.com/{latest_key}"
            print(f"[🖼️] Fallback Screenshot URL: {url}")
            return url

    except ClientError as e:
        print(f"[❌] S3 Access Error: {e}")
        return None
