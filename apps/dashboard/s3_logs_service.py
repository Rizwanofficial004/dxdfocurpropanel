"""
S3 User Logs Service - Retrieve user activity logs from S3 storage
This module provides functionality to fetch and parse user logs stored in S3.
"""

import os
import boto3
import logging
import json
import csv
from datetime import datetime, timedelta
from botocore.exceptions import ClientError, NoCredentialsError
from core.credentials import get_aws_client_config

logger = logging.getLogger(__name__)

class S3UserLogsService:
    """Service for retrieving and parsing user logs from S3"""
    
    def __init__(self, bucket_name=None):
        self.bucket_name = bucket_name or os.getenv("AWS_STORAGE_BUCKET_NAME", "ddsfocustime")
        
        # Initialize S3 client with credentials
        aws_config = get_aws_client_config()
        self.s3_client = boto3.client('s3', **aws_config)
        
    def _generate_signed_url(self, key, expires_in=3600):
        """Generate a pre-signed URL for private S3 objects"""
        try:
            signed_url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expires_in
            )
            logger.debug(f"Generated signed URL for log file: {key}")
            return signed_url
        except Exception as e:
            logger.error(f"Error generating signed URL for {key}: {str(e)}")
            return None

    def _parse_log_file_metadata(self, key, obj):
        """Parse metadata from S3 log file key and object"""
        try:
            parts = key.split('/')
            
            # Structure: logs/2025-09-10/user_at_domain.com/project/file.json
            # or: users_logs/2025-09-10/user_at_domain.com/project/file.json
            
            metadata = {
                'key': key,
                'file_name': parts[-1] if parts else key,
                'file_size': obj['Size'],
                'file_size_mb': round(obj['Size'] / (1024 * 1024), 4),
                'last_modified': obj['LastModified'].isoformat(),
                'file_extension': parts[-1].split('.')[-1] if '.' in parts[-1] else 'unknown'
            }
            
            # Parse S3 structure: prefix/date/user_email/project/filename
            if len(parts) >= 4:
                prefix = parts[0]  # logs or users_logs
                date_part = parts[1]  # 2025-09-10
                user_part = parts[2]  # user_at_domain.com or user_at_domain_com
                project_part = parts[3]  # project name
                
                metadata['log_type'] = prefix
                metadata['date'] = date_part
                metadata['project_name'] = project_part
                
                # Convert user_at_domain.com back to user@domain.com
                if '_at_' in user_part:
                    user_email = user_part.replace('_at_', '@')
                    # Handle cases like user_at_domain_com -> user@domain.com
                    if not '.' in user_email.split('@')[-1]:
                        # Replace last underscore with dot for domain
                        parts_email = user_email.split('@')
                        if len(parts_email) == 2:
                            domain_part = parts_email[1]
                            if '_' in domain_part:
                                domain_part = domain_part.replace('_', '.', domain_part.count('_') - 1) if domain_part.count('_') > 0 else domain_part
                                user_email = f"{parts_email[0]}@{domain_part}"
                    metadata['user_email'] = user_email
                else:
                    metadata['user_email'] = user_part
            
            # Generate signed URL for downloading
            metadata['download_url'] = self._generate_signed_url(key)
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error parsing log file metadata for {key}: {str(e)}")
            return None

    def get_user_logs(self, user_email=None, log_type=None, start_date=None, end_date=None, limit=None):
        """
        Get user logs from S3 with filtering options
        
        Args:
            user_email (str): Filter by specific user email
            log_type (str): Filter by log type (activity, timer, error, etc.)
            start_date (str): Start date filter (YYYY-MM-DD)
            end_date (str): End date filter (YYYY-MM-DD)
            limit (int): Maximum number of log files to return
            
        Returns:
            list: List of log file metadata with download URLs
        """
        try:
            # Define possible log prefixes
            log_prefixes = [
                "logs/",
                "user_logs/",
                "activity_logs/",
                "timer_logs/",
                "error_logs/",
                "users_logs/"  # Alternative naming
            ]
            
            all_logs = []
            
            for prefix in log_prefixes:
                try:
                    # If log_type is specified, try to use it in prefix
                    if log_type:
                        specific_prefix = f"logs/{log_type}_logs/" if not prefix.endswith('logs/') else f"{prefix}{log_type}/"
                    else:
                        specific_prefix = prefix
                    
                    # List objects with prefix
                    paginator = self.s3_client.get_paginator('list_objects_v2')
                    pages = paginator.paginate(Bucket=self.bucket_name, Prefix=specific_prefix)
                    
                    for page in pages:
                        if 'Contents' in page:
                            for obj in page['Contents']:
                                key = obj['Key']
                                
                                # Skip directories (keys ending with /)
                                if key.endswith('/'):
                                    continue
                                
                                # Parse log file metadata
                                log_metadata = self._parse_log_file_metadata(key, obj)
                                if log_metadata:
                                    all_logs.append(log_metadata)
                                    
                except ClientError as e:
                    # Continue if prefix doesn't exist
                    if e.response['Error']['Code'] != 'NoSuchBucket':
                        logger.warning(f"Error accessing prefix {specific_prefix}: {str(e)}")
                    continue
            
            # Apply filters
            filtered_logs = self._apply_filters(all_logs, user_email, start_date, end_date)
            
            # Sort by last modified (newest first)
            filtered_logs.sort(key=lambda x: x['last_modified'], reverse=True)
            
            # Apply limit
            if limit:
                filtered_logs = filtered_logs[:limit]
            
            logger.info(f"Retrieved {len(filtered_logs)} log files from S3")
            return filtered_logs
            
        except Exception as e:
            logger.error(f"Error retrieving user logs from S3: {str(e)}")
            return []

    def _apply_filters(self, logs, user_email, start_date, end_date):
        """Apply filtering to log files"""
        filtered = logs
        
        # Filter by user email (handle both @ and _at_ formats)
        if user_email:
            # Convert @ to _at_ for S3 key matching if needed
            user_email_normalized = user_email.replace('@', '_at_').replace('.', '_')
            filtered = [log for log in filtered 
                       if log.get('user_email') == user_email or 
                          log.get('user_email') == user_email_normalized]
        
        # Filter by date range
        if start_date or end_date:
            date_filtered = []
            for log in filtered:
                log_date = None
                
                # Try to extract date from various fields
                if 'date' in log:
                    log_date = log['date']
                elif 'year' in log and 'month' in log and 'day' in log:
                    log_date = f"{log['year']}-{log['month'].zfill(2)}-{log['day'].zfill(2)}"
                else:
                    # Use last_modified date as fallback
                    try:
                        log_datetime = datetime.fromisoformat(log['last_modified'].replace('Z', '+00:00'))
                        log_date = log_datetime.strftime('%Y-%m-%d')
                    except:
                        continue
                
                if log_date:
                    try:
                        log_dt = datetime.strptime(log_date, '%Y-%m-%d')
                        
                        # Check start date
                        if start_date:
                            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                            if log_dt < start_dt:
                                continue
                        
                        # Check end date
                        if end_date:
                            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                            if log_dt > end_dt:
                                continue
                        
                        date_filtered.append(log)
                    except ValueError:
                        # Skip logs with invalid dates
                        continue
            
            filtered = date_filtered
        
        return filtered

    def get_log_content(self, log_key):
        """
        Download and return the content of a specific log file
        
        Args:
            log_key (str): S3 key of the log file
            
        Returns:
            dict: Log content and metadata
        """
        try:
            # Download the log file
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=log_key)
            content = response['Body'].read()
            
            # Try to decode content
            try:
                # Try UTF-8 first
                content_str = content.decode('utf-8')
            except UnicodeDecodeError:
                # Try latin-1 as fallback
                content_str = content.decode('latin-1', errors='replace')
            
            # Try to parse as JSON
            parsed_content = None
            content_type = 'text'
            
            if log_key.endswith('.json'):
                try:
                    parsed_content = json.loads(content_str)
                    content_type = 'json'
                except json.JSONDecodeError:
                    pass
            elif log_key.endswith('.csv'):
                try:
                    import io
                    csv_reader = csv.DictReader(io.StringIO(content_str))
                    parsed_content = list(csv_reader)
                    content_type = 'csv'
                except Exception:
                    pass
            
            return {
                'key': log_key,
                'content_type': content_type,
                'raw_content': content_str,
                'parsed_content': parsed_content,
                'size_bytes': len(content),
                'last_modified': response['LastModified'].isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error downloading log content for {log_key}: {str(e)}")
            return None

    def get_user_activity_summary(self, user_email, days=7):
        """
        Get activity summary for a user over the last N days
        
        Args:
            user_email (str): User email to get summary for
            days (int): Number of days to look back
            
        Returns:
            dict: Activity summary
        """
        try:
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            
            logs = self.get_user_logs(
                user_email=user_email,
                start_date=start_date,
                end_date=end_date
            )
            
            summary = {
                'user_email': user_email,
                'period_days': days,
                'start_date': start_date,
                'end_date': end_date,
                'total_log_files': len(logs),
                'log_types': {},
                'daily_activity': {},
                'total_size_mb': 0
            }
            
            # Analyze logs
            for log in logs:
                # Count by file extension/type
                ext = log.get('file_extension', 'unknown')
                summary['log_types'][ext] = summary['log_types'].get(ext, 0) + 1
                
                # Sum total size
                summary['total_size_mb'] += log.get('size_mb', 0)
                
                # Daily activity
                log_date = log.get('date')
                if not log_date and 'last_modified' in log:
                    try:
                        log_datetime = datetime.fromisoformat(log['last_modified'].replace('Z', '+00:00'))
                        log_date = log_datetime.strftime('%Y-%m-%d')
                    except:
                        pass
                
                if log_date:
                    if log_date not in summary['daily_activity']:
                        summary['daily_activity'][log_date] = {'files': 0, 'size_mb': 0}
                    summary['daily_activity'][log_date]['files'] += 1
                    summary['daily_activity'][log_date]['size_mb'] += log.get('size_mb', 0)
            
            # Round total size
            summary['total_size_mb'] = round(summary['total_size_mb'], 4)
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating activity summary for {user_email}: {str(e)}")
            return None

    def search_logs(self, search_term, user_email=None, limit=50):
        """
        Search for logs containing specific terms (searches in filename/key)
        
        Args:
            search_term (str): Term to search for
            user_email (str): Optional user filter
            limit (int): Maximum results to return
            
        Returns:
            list: Matching log files
        """
        try:
            all_logs = self.get_user_logs(user_email=user_email, limit=1000)
            
            matching_logs = []
            search_lower = search_term.lower()
            
            for log in all_logs:
                # Search in key, filename, and any other text fields
                searchable_text = f"{log.get('key', '')} {log.get('filename', '')}".lower()
                
                if search_lower in searchable_text:
                    matching_logs.append(log)
                
                if len(matching_logs) >= limit:
                    break
            
            return matching_logs
            
        except Exception as e:
            logger.error(f"Error searching logs: {str(e)}")
            return []
