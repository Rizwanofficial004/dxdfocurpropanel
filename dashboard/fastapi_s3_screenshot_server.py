import csv
import boto3
import io
from fastapi import FastAPI, Query
from typing import Optional, Dict

app = FastAPI()

# S3 Setup
S3_BUCKET = "ddsfocustime"
INVENTORY_CSV_KEY = "screenshot-inventory/ddsfocustime/2025-08-06T00-00Z/manifest.checksum"  # AWS inventory path
INVENTORY_BASE_PATH = "screenshot-inventory/ddsfocustime/"  # Base path for inventory files
TARGET_FOLDER_PREFIX = "screenshots/"

# Boto3 client with your AWS credentials
s3 = boto3.client(
    "s3",
    aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
    aws_secret_access_key="sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS",
    region_name="eu-north-1"
)


def find_latest_inventory_file():
    """Find the latest inventory CSV file from S3 inventory reports"""
    try:
        # List all objects in the inventory base path
        response = s3.list_objects_v2(
            Bucket=S3_BUCKET,
            Prefix=INVENTORY_BASE_PATH,
            MaxKeys=1000
        )
        
        if 'Contents' not in response:
            return None
        
        # Find CSV files (inventory data files)
        csv_files = []
        for obj in response['Contents']:
            key = obj['Key']
            if key.endswith('.csv') and '/data/' in key:
                csv_files.append({
                    'key': key,
                    'last_modified': obj['LastModified']
                })
        
        if not csv_files:
            return None
        
        # Sort by last modified date and return the most recent
        latest_file = sorted(csv_files, key=lambda x: x['last_modified'], reverse=True)[0]
        return latest_file['key']
        
    except Exception as e:
        print(f"Error finding inventory file: {e}")
        return None


@app.get("/api/analytics/screenshot-counts")
def get_screenshot_counts(user: Optional[str] = None) -> Dict[str, int]:
    """
    Return the count of screenshots per user from the S3 Inventory CSV.
    If `user` is provided, return only for that user.
    """
    try:
        # Find the latest inventory CSV file
        inventory_file = find_latest_inventory_file()
        if not inventory_file:
            return {"error": "No inventory CSV file found"}
        
        print(f"Using inventory file: {inventory_file}")
        
        # Read CSV from S3
        obj = s3.get_object(Bucket=S3_BUCKET, Key=inventory_file)
        body = obj['Body'].read().decode('utf-8')
        csv_reader = csv.reader(io.StringIO(body))

        counts = {}

        for row in csv_reader:
            if len(row) < 2:
                continue
                
            # AWS inventory CSV format: Bucket,Key,VersionId,IsLatest,IsDeleteMarker,Size,LastModifiedDate,ETag,StorageClass
            key = row[1]  # Key is the second column
            
            if not key.startswith(TARGET_FOLDER_PREFIX):
                continue

            parts = key.split('/')
            if len(parts) < 2:
                continue

            user_email = parts[1]  # Extract email from screenshots/email@domain.com/folder/file.jpg
            
            # Filter by specific user if requested
            if user and user not in user_email:
                continue

            counts[user_email] = counts.get(user_email, 0) + 1

        return {
            "inventory_file_used": inventory_file,
            "total_users": len(counts),
            "counts": counts
        }
        
    except Exception as e:
        return {"error": f"Failed to read S3 inventory: {str(e)}"}


@app.get("/api/analytics/screenshot-counts-direct")
def get_screenshot_counts_direct(user: Optional[str] = None) -> Dict[str, int]:
    """
    Return the count of screenshots per user by directly scanning S3 bucket.
    This is a fallback if inventory CSV is not available.
    """
    try:
        counts = {}
        continuation_token = None
        
        while True:
            list_params = {
                'Bucket': S3_BUCKET,
                'Prefix': TARGET_FOLDER_PREFIX,
                'MaxKeys': 1000
            }
            
            if continuation_token:
                list_params['ContinuationToken'] = continuation_token
            
            response = s3.list_objects_v2(**list_params)
            
            if 'Contents' not in response:
                break
            
            for obj in response['Contents']:
                key = obj['Key']
                parts = key.split('/')
                if len(parts) >= 2:
                    user_email = parts[1]
                    
                    # Filter by specific user if requested
                    if user and user not in user_email:
                        continue
                    
                    if '@' in user_email and '.' in user_email:  # Valid email
                        counts[user_email] = counts.get(user_email, 0) + 1
            
            if not response.get('IsTruncated', False):
                break
            
            continuation_token = response.get('NextContinuationToken')
        
        return counts
        
    except Exception as e:
        return {"error": f"Failed to scan S3 directly: {str(e)}"}


@app.get("/api/analytics/user-screenshots/{email}")
def get_user_screenshots(email: str) -> Dict[str, int]:
    """
    Get screenshot count for a specific user email.
    """
    try:
        # First try direct S3 scan for specific user
        user_count = 0
        continuation_token = None
        user_prefix = f"{TARGET_FOLDER_PREFIX}{email}/"
        
        while True:
            list_params = {
                'Bucket': S3_BUCKET,
                'Prefix': user_prefix,
                'MaxKeys': 1000
            }
            
            if continuation_token:
                list_params['ContinuationToken'] = continuation_token
            
            response = s3.list_objects_v2(**list_params)
            
            if 'Contents' not in response:
                break
            
            user_count += len(response['Contents'])
            
            if not response.get('IsTruncated', False):
                break
            
            continuation_token = response.get('NextContinuationToken')
        
        return {
            "email": email,
            "screenshot_count": user_count,
            "source": "S3_direct_scan"
        }
        
    except Exception as e:
        return {"error": f"Failed to get user screenshots: {str(e)}"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    try:
        # Test S3 connection
        s3.head_bucket(Bucket=S3_BUCKET)
        return {"status": "healthy", "s3_connection": "ok"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FastAPI S3 Screenshot Analytics Server...")
    print("📊 Endpoints available:")
    print("   GET /api/analytics/screenshot-counts - All users from inventory CSV")
    print("   GET /api/analytics/screenshot-counts-direct - All users from direct S3 scan")
    print("   GET /api/analytics/user-screenshots/{email} - Specific user count")
    print("   GET /health - Health check")
    print("\n💡 Example usage:")
    print("   http://localhost:8001/api/analytics/user-screenshots/beyza-donmez-@hotmail.com")
    print("   http://localhost:8001/api/analytics/screenshot-counts?user=beyza")
    
    uvicorn.run(app, host="0.0.0.0", port=8001)
