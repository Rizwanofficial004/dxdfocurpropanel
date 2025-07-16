import boto3
import os
from urllib.parse import quote
from pathlib import Path
import hashlib

ALLOWED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')
AWS_REGION = "eu-north-1"
BUCKET_NAME = "ddsfocustime"
S3_BASE_PREFIX = "screenshots/"
LOCAL_SAVE_DIR = Path(__file__).resolve().parent / "media" / "screenshots"

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=AWS_REGION
)

def file_hash(path):
    with open(path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def scan_and_download_screenshots():
    image_urls = []
    folder_map = {}

    print(f"🔍 Scanning S3 bucket '{BUCKET_NAME}' under prefix '{S3_BASE_PREFIX}'")

    try:
        paginator = s3.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix=S3_BASE_PREFIX)

        for page in pages:
            contents = page.get("Contents", [])
            for obj in contents:
                key = obj["Key"]

                if not key.lower().endswith(ALLOWED_EXTENSIONS):
                    continue

                parts = key.replace(S3_BASE_PREFIX, "").split('/')
                if len(parts) < 3:
                    print(f"⚠️ Skipping malformed path: {key}")
                    continue

                email_folder = parts[0]
                task_folder = parts[1]
                filename = "/".join(parts[2:])

                local_folder = LOCAL_SAVE_DIR / email_folder / task_folder
                local_path = local_folder / filename

                os.makedirs(local_folder, exist_ok=True)

                map_key = f"{email_folder}/{task_folder}"
                if map_key not in folder_map:
                    folder_map[map_key] = []

                # Check if existing images should be removed
                for existing_file in local_folder.iterdir():
                    if existing_file.suffix.lower() in ALLOWED_EXTENSIONS:
                        # Compare hash before deleting
                        if existing_file.exists():
                            try:
                                s3_obj = s3.get_object(Bucket=BUCKET_NAME, Key=key)
                                s3_hash = hashlib.md5(s3_obj['Body'].read()).hexdigest()
                                local_hash = file_hash(existing_file)
                                if local_hash == s3_hash:
                                    print(f"⏭️ Skipping unchanged image: {existing_file.name}")
                                    folder_map[map_key].append(str(existing_file.relative_to(LOCAL_SAVE_DIR.parent)))
                                    continue
                            except Exception as ex:
                                print(f"⚠️ Hash check failed: {ex}")
                        print(f"🗑️ Removing outdated image: {existing_file.name}")
                        existing_file.unlink()

                # Download new image
                print(f"⬇️ Downloading: {key} → {local_path}")
                s3.download_file(BUCKET_NAME, key, str(local_path))

                # Save relative URL
                url = f"/media/screenshots/{quote(email_folder)}/{quote(task_folder)}/{quote(filename)}"
                image_urls.append(url)
                folder_map[map_key].append(url)

        print(f"\n✅ Total images downloaded: {len(image_urls)}")
        return {
            "image_urls": image_urls,
            "folder_map": folder_map
        }

    except Exception as e:
        print(f"❌ Error scanning/downloading S3 screenshots: {e}")
        return {"image_urls": [], "folder_map": {}}
