import boto3
import os
from botocore.exceptions import ClientError

# AWS config
AWS_ACCESS_KEY_ID = "AKIARSU6EUUWMQ5I2JWC"
AWS_SECRET_ACCESS_KEY = "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"
AWS_REGION = "eu-north-1"
BUCKET_NAME = "ddsfocustime"
S3_BASE_PREFIX = "screenshots/"

# Local base folder where images will be saved
LOCAL_BASE_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "dashboard", "media", "screenshots"
)


# Initialize S3 client
s3 = boto3.client("s3",
                  aws_access_key_id=AWS_ACCESS_KEY_ID,
                  aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                  region_name=AWS_REGION)


def download_all_screenshots():
    # print("🔍 Scanning S3 bucket for screenshots...\n")

    # try:
    #     paginator = s3.get_paginator("list_objects_v2")
    #     pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix=S3_BASE_PREFIX)

    #     downloaded = 0
    #     skipped = 0

    #     for page in pages:
    #         for obj in page.get("Contents", []):
    #             key = obj["Key"]

    #             if not key.lower().endswith(".png"):
    #                 continue

             
    #             relative_path = key[len(S3_BASE_PREFIX):]
    #             local_path = os.path.join(LOCAL_BASE_FOLDER, relative_path)

              
    #             os.makedirs(os.path.dirname(local_path), exist_ok=True)

                
    #             if os.path.exists(local_path):
    #                 local_mtime = os.path.getmtime(local_path)
    #                 s3_mtime = obj["LastModified"].timestamp()

                    
    #                 if abs(s3_mtime - local_mtime) < 1:
    #                     skipped += 1
    #                     continue

               
    #             s3.download_file(BUCKET_NAME, key, local_path)
    #             os.utime(local_path, (obj["LastModified"].timestamp(), obj["LastModified"].timestamp()))
    #             downloaded += 1
    #             print(f"✅ Downloaded: {relative_path}")

    #     print(f"\n🎉 Finished! {downloaded} new/updated screenshots downloaded.")
    #     print(f"⏭️ {skipped} images skipped (already up-to-date).")


    except ClientError as e:
        print(f"[❌] AWS Error: {e}")


if __name__ == "__main__":
    download_all_screenshots()