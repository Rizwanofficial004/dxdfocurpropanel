"""
API Serializers for DDS Focus Time Application

This module contains serializers for API data validation and serialization.
"""

import json
from datetime import datetime
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .models import User_Logs, Staff


class LoginSerializer:
    """Serializer for login API"""
    
    @staticmethod
    def validate(data):
        """Validate login data"""
        errors = {}
        
        if not data.get('username'):
            errors['username'] = 'Username is required'
        
        if not data.get('password'):
            errors['password'] = 'Password is required'
        
        # Email format validation if username is email
        username = data.get('username', '')
        if '@' in username and '.' not in username.split('@')[1]:
            errors['username'] = 'Invalid email format'
        
        return errors
    
    @staticmethod
    def serialize_user(user):
        """Serialize user object for API response"""
        return {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "date_joined": user.date_joined.isoformat()
        }


class ScreenshotsSerializer:
    """Serializer for screenshots API"""
    
    @staticmethod
    def validate_get_params(params):
        """Validate GET request parameters"""
        errors = {}
        
        email = params.get('email', '')
        if email and '@' not in email:
            errors['email'] = 'Invalid email format'
        
        # Validate date format
        date = params.get('date', '')
        if date:
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                errors['date'] = 'Date must be in YYYY-MM-DD format'
        
        # Validate limit and page
        try:
            limit = int(params.get('limit', 50))
            if limit <= 0 or limit > 1000:
                errors['limit'] = 'Limit must be between 1 and 1000'
        except (ValueError, TypeError):
            errors['limit'] = 'Limit must be a valid integer'
        
        try:
            page = int(params.get('page', 1))
            if page <= 0:
                errors['page'] = 'Page must be a positive integer'
        except (ValueError, TypeError):
            errors['page'] = 'Page must be a valid integer'
        
        return errors
    
    @staticmethod
    def validate_post_data(data):
        """Validate POST request data"""
        errors = {}
        
        email = data.get('email', '')
        if email and '@' not in email:
            errors['email'] = 'Invalid email format'
        
        # Validate date
        date = data.get('date', '')
        if date:
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                errors['date'] = 'Date must be in YYYY-MM-DD format'
        
        # Validate date range
        date_range = data.get('date_range', {})
        if date_range:
            start_date = date_range.get('start', '')
            end_date = date_range.get('end', '')
            
            if start_date:
                try:
                    start = datetime.strptime(start_date, '%Y-%m-%d')
                except ValueError:
                    errors['date_range'] = 'Start date must be in YYYY-MM-DD format'
            
            if end_date:
                try:
                    end = datetime.strptime(end_date, '%Y-%m-%d')
                except ValueError:
                    errors['date_range'] = 'End date must be in YYYY-MM-DD format'
            
            if start_date and end_date:
                try:
                    start = datetime.strptime(start_date, '%Y-%m-%d')
                    end = datetime.strptime(end_date, '%Y-%m-%d')
                    if start > end:
                        errors['date_range'] = 'Start date cannot be after end date'
                except ValueError:
                    pass  # Already handled above
        
        # Validate limit and page
        limit = data.get('limit', 50)
        if not isinstance(limit, int) or limit <= 0 or limit > 1000:
            errors['limit'] = 'Limit must be an integer between 1 and 1000'
        
        page = data.get('page', 1)
        if not isinstance(page, int) or page <= 0:
            errors['page'] = 'Page must be a positive integer'
        
        return errors
    
    @staticmethod
    def serialize_screenshot(screenshot_data):
        """Serialize screenshot data for API response"""
        return {
            "key": screenshot_data.get('key', ''),
            "filename": screenshot_data.get('filename', ''),
            "date_folder": screenshot_data.get('date_folder', ''),
            "url": screenshot_data.get('url', ''),  # This is the presigned URL
            "last_modified": screenshot_data.get('last_modified', ''),
            "size": screenshot_data.get('size', 0),
            "type": "screenshot"
        }


class LogsSerializer:
    """Serializer for logs API"""
    
    @staticmethod
    def validate_get_params(params):
        """Validate GET request parameters"""
        errors = {}
        
        email = params.get('email', '')
        if email and '@' not in email:
            errors['email'] = 'Invalid email format'
        
        # Validate staffid
        staffid = params.get('staffid', '')
        if staffid:
            try:
                int(staffid)
            except ValueError:
                errors['staffid'] = 'Staff ID must be a valid integer'
        
        # Validate date
        date = params.get('date', '')
        if date:
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                errors['date'] = 'Date must be in YYYY-MM-DD format'
        
        # Validate limit and page
        try:
            limit = int(params.get('limit', 20))
            if limit <= 0 or limit > 1000:
                errors['limit'] = 'Limit must be between 1 and 1000'
        except (ValueError, TypeError):
            errors['limit'] = 'Limit must be a valid integer'
        
        try:
            page = int(params.get('page', 1))
            if page <= 0:
                errors['page'] = 'Page must be a positive integer'
        except (ValueError, TypeError):
            errors['page'] = 'Page must be a valid integer'
        
        return errors
    
    @staticmethod
    def validate_post_data(data):
        """Validate POST request data for creating logs"""
        errors = {}
        
        # Required fields validation
        required_fields = ['staffid', 'email', 'jsonlog', 'date']
        for field in required_fields:
            if not data.get(field):
                errors[field] = f'{field.replace("_", " ").title()} is required'
        
        # Email format validation
        email = data.get('email', '')
        if email and '@' not in email:
            errors['email'] = 'Invalid email format'
        
        # Staff ID validation
        staffid = data.get('staffid')
        if staffid is not None:
            try:
                int(staffid)
            except (ValueError, TypeError):
                errors['staffid'] = 'Staff ID must be a valid integer'
        
        # Date validation
        date = data.get('date', '')
        if date:
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                errors['date'] = 'Date must be in YYYY-MM-DD format'
        
        # JSON log validation
        jsonlog = data.get('jsonlog')
        if jsonlog is not None:
            if isinstance(jsonlog, str):
                try:
                    json.loads(jsonlog)
                except json.JSONDecodeError:
                    errors['jsonlog'] = 'Invalid JSON format in jsonlog field'
            elif not isinstance(jsonlog, dict):
                errors['jsonlog'] = 'jsonlog must be a valid JSON object or string'
        
        return errors
    
    @staticmethod
    def serialize_log(log):
        """Serialize log object for API response"""
        try:
            jsonlog_data = json.loads(log.jsonlog) if isinstance(log.jsonlog, str) else log.jsonlog
        except json.JSONDecodeError:
            jsonlog_data = {"raw_log": log.jsonlog}
        
        return {
            "id": log.id,
            "staffid": log.staffid,
            "email": log.email,
            "jsonlog": jsonlog_data,
            "date": log.date,
            "created_at": log.date  # Assuming date field contains creation timestamp
        }


class PaginationSerializer:
    """Serializer for pagination data"""
    
    @staticmethod
    def serialize_pagination(page_obj):
        """Serialize Django paginator object"""
        return {
            "current_page": page_obj.number,
            "total_pages": page_obj.paginator.num_pages,
            "total_count": page_obj.paginator.count,
            "limit": page_obj.paginator.per_page,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous()
        }


# Utility functions for validation
def validate_email_format(email):
    """Validate email format"""
    if not email or '@' not in email:
        return False
    
    try:
        local, domain = email.split('@', 1)
        if not local or not domain or '.' not in domain:
            return False
        return True
    except ValueError:
        return False


def validate_date_format(date_string, date_format='%Y-%m-%d'):
    """Validate date format"""
    try:
        datetime.strptime(date_string, date_format)
        return True
    except ValueError:
        return False


def sanitize_json_log(jsonlog):
    """Sanitize and validate JSON log data"""
    if isinstance(jsonlog, dict):
        return json.dumps(jsonlog)
    elif isinstance(jsonlog, str):
        try:
            # Validate that it's valid JSON
            json.loads(jsonlog)
            return jsonlog
        except json.JSONDecodeError:
            # If not valid JSON, wrap it
            return json.dumps({"raw_log": jsonlog})
    else:
        return json.dumps({"data": str(jsonlog)})
