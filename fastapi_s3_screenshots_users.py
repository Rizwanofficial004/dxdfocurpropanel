"""
FastAPI S3 Screenshots Users API
Get all users/employees who have screenshots stored in S3 bucket
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
import json
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError
import uvicorn
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

# Initialize FastAPI
app = FastAPI(
    title="S3 Screenshots Users API",
    description="Get all users/employees who have screenshots stored in S3 bucket",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# S3 Configuration
S3_BUCKET_NAME = "ddsfocustime"
AWS_ACCESS_KEY_ID = "AKIARSU6EUUWMQ5I2JWC"
AWS_SECRET_ACCESS_KEY = "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"
S3_REGION = "eu-west-1"

# Response Models
class UserStatistics(BaseModel):
    total_files: int
    total_size_bytes: int
    total_size_mb: float
    last_modified: Optional[str]
    file_types: List[str]
    date_folders: List[str]

class ScreenshotUser(BaseModel):
    email: str
    username: str
    domain: str
    folder_name: str
    has_screenshots: bool
    screenshots_folder: str
    display_name: str
    source: str
    statistics: Optional[UserStatistics] = None

class APIMetadata(BaseModel):
    total_found: int
    returned: int
    limit_applied: Optional[int]
    search_term: Optional[str]
    include_statistics: bool
    s3_bucket: str
    screenshots_prefix: str
    objects_scanned: int
    scan_timestamp: str

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]
    timestamp: str

def get_s3_client():
    """Initialize S3 client with credentials"""
    try:
        return boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=S3_REGION
        )
    except Exception as e:
        print(f"Error initializing S3 client: {str(e)}")
        return None

@app.get("/api/screenshots/users", response_model=APIResponse)
async def get_s3_screenshots_users(
    include_stats: bool = Query(True, description="Include detailed statistics"),
    limit: Optional[int] = Query(100, description="Maximum number of users to return"),
    search: Optional[str] = Query(None, description="Search for specific user by email/name")
):
    """
    Get all users who have screenshots in S3 bucket
    
    - **include_stats**: Include detailed file statistics for each user
    - **limit**: Maximum number of users to return (default: 100)
    - **search**: Search filter for user email or username
    """
    
    try:
        # Initialize S3 client
        s3_client = get_s3_client()
        if not s3_client:
            raise HTTPException(
                status_code=500,
                detail="Failed to connect to S3"
            )
        
        # Scan S3 bucket for screenshots folder
        try:
            paginator = s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=S3_BUCKET_NAME,
                Prefix='screenshots/',
                Delimiter='/'
            )
            
            users_data = {}
            total_objects_scanned = 0
            
            # Process each page
            for page in pages:
                # Get user folders from common prefixes
                if 'CommonPrefixes' in page:
                    for prefix in page['CommonPrefixes']:
                        folder_name = prefix['Prefix'].replace('screenshots/', '').rstrip('/')
                        
                        # Extract email from folder name
                        if '_at_' in folder_name:
                            email = folder_name.replace('_at_', '@')
                            username = email.split('@')[0]
                            domain = email.split('@')[1] if '@' in email else ''
                            
                            # Apply search filter
                            if search and search.lower() not in email.lower() and search.lower() not in username.lower():
                                continue
                            
                            # Initialize user data
                            if email not in users_data:
                                users_data[email] = {
                                    "email": email,
                                    "username": username,
                                    "domain": domain,
                                    "folder_name": folder_name,
                                    "has_screenshots": True,
                                    "screenshots_folder": f"screenshots/{folder_name}/",
                                    "display_name": username.title(),
                                    "source": "S3_Screenshots"
                                }
                                
                                if include_stats:
                                    users_data[email]["statistics"] = {
                                        "total_files": 0,
                                        "total_size_bytes": 0,
                                        "total_size_mb": 0.0,
                                        "last_modified": None,
                                        "file_types": [],
                                        "date_folders": []
                                    }
                
                # Get detailed statistics if requested
                if include_stats and 'Contents' in page:
                    for obj in page['Contents']:
                        total_objects_scanned += 1
                        key = obj['Key']
                        
                        # Extract user email from object key
                        if key.startswith('screenshots/') and '_at_' in key:
                            parts = key.split('/')
                            if len(parts) >= 2:
                                folder_name = parts[1]
                                email = folder_name.replace('_at_', '@')
                                
                                if email in users_data:
                                    stats = users_data[email]["statistics"]
                                    stats["total_files"] += 1
                                    stats["total_size_bytes"] += obj.get('Size', 0)
                                    stats["total_size_mb"] = round(stats["total_size_bytes"] / (1024 * 1024), 2)
                                    
                                    # Update last modified
                                    if not stats["last_modified"] or obj['LastModified'] > datetime.fromisoformat(stats["last_modified"].replace('Z', '+00:00')):
                                        stats["last_modified"] = obj['LastModified'].isoformat()
                                    
                                    # Extract file extension
                                    if '.' in key:
                                        ext = key.split('.')[-1].lower()
                                        if ext not in stats["file_types"]:
                                            stats["file_types"].append(ext)
                                    
                                    # Extract date folder if exists
                                    if len(parts) >= 3:
                                        date_folder = parts[2]
                                        if date_folder not in stats["date_folders"]:
                                            stats["date_folders"].append(date_folder)
            
            # Convert to list and apply limit
            users_list = list(users_data.values())
            
            # Sort by email
            users_list.sort(key=lambda x: x['email'])
            
            # Apply limit
            if limit and len(users_list) > limit:
                users_list = users_list[:limit]
            
            # Prepare response
            response_data = {
                "success": True,
                "message": f"Found {len(users_list)} users with screenshots in S3 bucket",
                "data": {
                    "users": users_list,
                    "metadata": {
                        "total_found": len(users_data),
                        "returned": len(users_list),
                        "limit_applied": limit,
                        "search_term": search,
                        "include_statistics": include_stats,
                        "s3_bucket": S3_BUCKET_NAME,
                        "screenshots_prefix": "screenshots/",
                        "objects_scanned": total_objects_scanned,
                        "scan_timestamp": datetime.now().isoformat()
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
            
            return response_data
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            raise HTTPException(
                status_code=403,
                detail=f"S3 access error: {error_message}"
            )
            
    except NoCredentialsError:
        raise HTTPException(
            status_code=500,
            detail="S3 credentials not configured"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "S3 Screenshots Users API",
        "version": "1.0.0",
        "endpoints": {
            "/api/screenshots/users": "Get all users with screenshots in S3",
            "/docs": "Interactive API documentation",
            "/redoc": "Alternative API documentation"
        },
        "example_usage": "/api/screenshots/users?include_stats=true&limit=10&search=haseeb"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "s3_bucket": S3_BUCKET_NAME
    }

if __name__ == "__main__":
    print("🚀 Starting S3 Screenshots Users API Server")
    print("📋 Available endpoints:")
    print("   - GET /api/screenshots/users - Get all users with screenshots")
    print("   - GET /health - Health check")
    print("   - GET /docs - Interactive API documentation")
    print("   - GET / - API information")
    print("\n🌐 Server starting on http://localhost:8000")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
