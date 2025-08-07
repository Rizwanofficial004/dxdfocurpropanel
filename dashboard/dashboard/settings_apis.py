"""
Settings Management APIs
Professional APIs for managing UI settings, credentials, and system configurations
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import transaction
import json
import logging
from .models import UISettings, SystemCredentials, ApplicationSettings
from .api_views import api_response

logger = logging.getLogger(__name__)


# ==================== UI SETTINGS APIs ====================

@csrf_exempt
@require_http_methods(["POST", "GET"])
def ui_settings_api(request):
    """
    UI Settings Management API
    POST: Create/Update UI settings
    GET: Retrieve current UI settings
    """
    if request.method == 'GET':
        try:
            # Get user-specific settings or global settings
            user_id = request.GET.get('user_id')
            setting_name = request.GET.get('setting_name', 'default')
            
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    settings = UISettings.objects.filter(user=user, setting_name=setting_name).first()
                except User.DoesNotExist:
                    return api_response(False, "User not found", status_code=404)
            else:
                # Get global settings
                settings = UISettings.objects.filter(is_global=True, setting_name=setting_name).first()
            
            if not settings:
                # Return default settings
                return api_response(True, "Default UI settings", {
                    'font_family': 'Arial, sans-serif',
                    'font_size': '16px',
                    'primary_color': '#007bff',
                    'secondary_color': '#6c757d',
                    'background_color': '#ffffff',
                    'text_color': '#333333',
                    'theme_mode': 'light',
                    'sidebar_collapsed': False,
                    'is_global': False
                })
            
            return api_response(True, "UI settings retrieved", {
                'id': settings.id,
                'setting_name': settings.setting_name,
                'font_family': settings.font_family,
                'font_size': settings.font_size,
                'primary_color': settings.primary_color,
                'secondary_color': settings.secondary_color,
                'background_color': settings.background_color,
                'text_color': settings.text_color,
                'theme_mode': settings.theme_mode,
                'sidebar_collapsed': settings.sidebar_collapsed,
                'is_global': settings.is_global,
                'created_at': settings.created_at.isoformat(),
                'updated_at': settings.updated_at.isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error retrieving UI settings: {e}")
            return api_response(False, f"Error retrieving UI settings: {str(e)}", status_code=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['font_family', 'font_size', 'primary_color', 'secondary_color']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return api_response(False, f"Missing required fields: {', '.join(missing_fields)}", status_code=400)
            
            # Get or create settings
            user_id = data.get('user_id')
            setting_name = data.get('setting_name', 'default')
            is_global = data.get('is_global', False)
            
            if user_id and not is_global:
                try:
                    user = User.objects.get(id=user_id)
                    settings, created = UISettings.objects.get_or_create(
                        user=user,
                        setting_name=setting_name,
                        defaults={'is_global': False}
                    )
                except User.DoesNotExist:
                    return api_response(False, "User not found", status_code=404)
            else:
                # Global settings
                settings, created = UISettings.objects.get_or_create(
                    user=None,
                    setting_name=setting_name,
                    is_global=True,
                    defaults={'is_global': True}
                )
            
            # Update settings
            settings.font_family = data.get('font_family', settings.font_family)
            settings.font_size = data.get('font_size', settings.font_size)
            settings.primary_color = data.get('primary_color', settings.primary_color)
            settings.secondary_color = data.get('secondary_color', settings.secondary_color)
            settings.background_color = data.get('background_color', settings.background_color)
            settings.text_color = data.get('text_color', settings.text_color)
            settings.theme_mode = data.get('theme_mode', settings.theme_mode)
            settings.sidebar_collapsed = data.get('sidebar_collapsed', settings.sidebar_collapsed)
            
            settings.save()
            
            action = "created" if created else "updated"
            return api_response(True, f"UI settings {action} successfully", {
                'id': settings.id,
                'setting_name': settings.setting_name,
                'font_family': settings.font_family,
                'font_size': settings.font_size,
                'primary_color': settings.primary_color,
                'secondary_color': settings.secondary_color,
                'background_color': settings.background_color,
                'text_color': settings.text_color,
                'theme_mode': settings.theme_mode,
                'sidebar_collapsed': settings.sidebar_collapsed,
                'is_global': settings.is_global,
                'action': action
            })
            
        except json.JSONDecodeError:
            return api_response(False, "Invalid JSON format", status_code=400)
        except ValidationError as e:
            return api_response(False, f"Validation error: {str(e)}", status_code=400)
        except Exception as e:
            logger.error(f"Error managing UI settings: {e}")
            return api_response(False, f"Error managing UI settings: {str(e)}", status_code=500)


# ==================== CREDENTIALS APIs ====================

@csrf_exempt
@require_http_methods(["POST", "GET"])
def credentials_api(request):
    """
    System Credentials Management API
    POST: Create/Update credentials
    GET: Retrieve credentials (masked for security)
    """
    if request.method == 'GET':
        try:
            # Get specific credential or all credentials
            credential_name = request.GET.get('name')
            credential_type = request.GET.get('type')
            
            if credential_name:
                try:
                    credential = SystemCredentials.objects.get(name=credential_name)
                    return api_response(True, "Credential retrieved", {
                        'id': credential.id,
                        'name': credential.name,
                        'credential_type': credential.credential_type,
                        'description': credential.description,
                        'api_key': mask_sensitive_value(credential.api_key),
                        'secret_key': mask_sensitive_value(credential.secret_key),
                        'access_key': mask_sensitive_value(credential.access_key),
                        'username': credential.username,
                        'password': mask_sensitive_value(credential.password),
                        'host': credential.host,
                        'port': credential.port,
                        'database_name': credential.database_name,
                        'is_active': credential.is_active,
                        'is_production': credential.is_production,
                        'created_at': credential.created_at.isoformat()
                    })
                except SystemCredentials.DoesNotExist:
                    return api_response(False, "Credential not found", status_code=404)
            else:
                # Get all credentials
                credentials = SystemCredentials.objects.all()
                if credential_type:
                    credentials = credentials.filter(credential_type=credential_type)
                
                credentials_data = []
                for cred in credentials:
                    credentials_data.append({
                        'id': cred.id,
                        'name': cred.name,
                        'credential_type': cred.credential_type,
                        'description': cred.description,
                        'is_active': cred.is_active,
                        'is_production': cred.is_production,
                        'created_at': cred.created_at.isoformat()
                    })
                
                return api_response(True, f"Retrieved {len(credentials_data)} credentials", {
                    'credentials': credentials_data,
                    'total_count': len(credentials_data)
                })
                
        except Exception as e:
            logger.error(f"Error retrieving credentials: {e}")
            return api_response(False, f"Error retrieving credentials: {str(e)}", status_code=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['name', 'credential_type']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return api_response(False, f"Missing required fields: {', '.join(missing_fields)}", status_code=400)
            
            # Create or update credential
            credential, created = SystemCredentials.objects.get_or_create(
                name=data['name'],
                defaults={'credential_type': data['credential_type']}
            )
            
            # Update fields
            credential.credential_type = data.get('credential_type', credential.credential_type)
            credential.description = data.get('description', credential.description)
            credential.api_key = data.get('api_key', credential.api_key)
            credential.secret_key = data.get('secret_key', credential.secret_key)
            credential.access_key = data.get('access_key', credential.access_key)
            credential.username = data.get('username', credential.username)
            credential.password = data.get('password', credential.password)
            credential.host = data.get('host', credential.host)
            credential.port = data.get('port', credential.port)
            credential.database_name = data.get('database_name', credential.database_name)
            credential.is_active = data.get('is_active', credential.is_active)
            credential.is_production = data.get('is_production', credential.is_production)
            credential.additional_config = data.get('additional_config', credential.additional_config)
            
            credential.save()
            
            action = "created" if created else "updated"
            return api_response(True, f"Credential {action} successfully", {
                'id': credential.id,
                'name': credential.name,
                'credential_type': credential.credential_type,
                'description': credential.description,
                'is_active': credential.is_active,
                'is_production': credential.is_production,
                'action': action
            })
            
        except json.JSONDecodeError:
            return api_response(False, "Invalid JSON format", status_code=400)
        except Exception as e:
            logger.error(f"Error managing credentials: {e}")
            return api_response(False, f"Error managing credentials: {str(e)}", status_code=500)


# ==================== APPLICATION SETTINGS APIs ====================

@csrf_exempt
@require_http_methods(["POST", "GET"])
def app_settings_api(request):
    """
    Application Settings Management API
    POST: Create/Update application settings
    GET: Retrieve application settings
    """
    if request.method == 'GET':
        try:
            # Get specific setting or all settings
            setting_key = request.GET.get('key')
            category = request.GET.get('category')
            
            if setting_key:
                try:
                    setting = ApplicationSettings.objects.get(key=setting_key)
                    return api_response(True, "Setting retrieved", {
                        'id': setting.id,
                        'key': setting.key,
                        'value': setting.value,
                        'typed_value': setting.get_typed_value(),
                        'setting_type': setting.setting_type,
                        'category': setting.category,
                        'description': setting.description,
                        'is_public': setting.is_public,
                        'is_editable': setting.is_editable,
                        'created_at': setting.created_at.isoformat()
                    })
                except ApplicationSettings.DoesNotExist:
                    return api_response(False, "Setting not found", status_code=404)
            else:
                # Get all settings
                settings = ApplicationSettings.objects.all()
                if category:
                    settings = settings.filter(category=category)
                
                settings_data = []
                for setting in settings:
                    settings_data.append({
                        'id': setting.id,
                        'key': setting.key,
                        'value': setting.value,
                        'typed_value': setting.get_typed_value(),
                        'setting_type': setting.setting_type,
                        'category': setting.category,
                        'description': setting.description,
                        'is_public': setting.is_public,
                        'is_editable': setting.is_editable
                    })
                
                return api_response(True, f"Retrieved {len(settings_data)} settings", {
                    'settings': settings_data,
                    'total_count': len(settings_data)
                })
                
        except Exception as e:
            logger.error(f"Error retrieving settings: {e}")
            return api_response(False, f"Error retrieving settings: {str(e)}", status_code=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validate required fields
            required_fields = ['key', 'value']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return api_response(False, f"Missing required fields: {', '.join(missing_fields)}", status_code=400)
            
            # Create or update setting
            setting, created = ApplicationSettings.objects.get_or_create(
                key=data['key'],
                defaults={
                    'value': str(data['value']),
                    'setting_type': data.get('setting_type', 'string'),
                    'category': data.get('category', 'general')
                }
            )
            
            # Update fields
            setting.value = str(data['value'])
            setting.setting_type = data.get('setting_type', setting.setting_type)
            setting.category = data.get('category', setting.category)
            setting.description = data.get('description', setting.description)
            setting.is_public = data.get('is_public', setting.is_public)
            setting.is_editable = data.get('is_editable', setting.is_editable)
            
            setting.save()
            
            action = "created" if created else "updated"
            return api_response(True, f"Setting {action} successfully", {
                'id': setting.id,
                'key': setting.key,
                'value': setting.value,
                'typed_value': setting.get_typed_value(),
                'setting_type': setting.setting_type,
                'category': setting.category,
                'description': setting.description,
                'is_public': setting.is_public,
                'is_editable': setting.is_editable,
                'action': action
            })
            
        except json.JSONDecodeError:
            return api_response(False, "Invalid JSON format", status_code=400)
        except Exception as e:
            logger.error(f"Error managing settings: {e}")
            return api_response(False, f"Error managing settings: {str(e)}", status_code=500)


# ==================== HELPER FUNCTIONS ====================

def mask_sensitive_value(value):
    """Mask sensitive credential values for API responses"""
    if not value or len(value) <= 4:
        return value
    return f"{value[:4]}{'*' * (len(value) - 4)}"


# ==================== BULK OPERATIONS ====================

@csrf_exempt
@require_http_methods(["POST"])
def bulk_settings_api(request):
    """
    Bulk Settings Management API
    POST: Create/Update multiple settings at once
    """
    try:
        data = json.loads(request.body)
        
        if 'ui_settings' not in data and 'credentials' not in data and 'app_settings' not in data:
            return api_response(False, "No settings data provided", status_code=400)
        
        results = {
            'ui_settings': [],
            'credentials': [],
            'app_settings': [],
            'errors': []
        }
        
        with transaction.atomic():
            # Process UI Settings
            if 'ui_settings' in data:
                for ui_data in data['ui_settings']:
                    try:
                        # Create/update UI setting
                        setting_name = ui_data.get('setting_name', 'default')
                        is_global = ui_data.get('is_global', False)
                        
                        if is_global:
                            settings, created = UISettings.objects.get_or_create(
                                user=None,
                                setting_name=setting_name,
                                is_global=True,
                                defaults={'is_global': True}
                            )
                        else:
                            user_id = ui_data.get('user_id')
                            if user_id:
                                user = User.objects.get(id=user_id)
                                settings, created = UISettings.objects.get_or_create(
                                    user=user,
                                    setting_name=setting_name,
                                    defaults={'is_global': False}
                                )
                            else:
                                results['errors'].append(f"User ID required for non-global UI setting: {setting_name}")
                                continue
                        
                        # Update settings
                        for field in ['font_family', 'font_size', 'primary_color', 'secondary_color', 
                                    'background_color', 'text_color', 'theme_mode', 'sidebar_collapsed']:
                            if field in ui_data:
                                setattr(settings, field, ui_data[field])
                        
                        settings.save()
                        results['ui_settings'].append({
                            'setting_name': setting_name,
                            'action': 'created' if created else 'updated',
                            'id': settings.id
                        })
                        
                    except Exception as e:
                        results['errors'].append(f"UI Settings error: {str(e)}")
            
            # Process Credentials
            if 'credentials' in data:
                for cred_data in data['credentials']:
                    try:
                        name = cred_data.get('name')
                        if not name:
                            results['errors'].append("Credential name is required")
                            continue
                        
                        credential, created = SystemCredentials.objects.get_or_create(
                            name=name,
                            defaults={'credential_type': cred_data.get('credential_type', 'api_key')}
                        )
                        
                        # Update fields
                        for field in ['credential_type', 'description', 'api_key', 'secret_key', 
                                    'access_key', 'username', 'password', 'host', 'port', 
                                    'database_name', 'is_active', 'is_production']:
                            if field in cred_data:
                                setattr(credential, field, cred_data[field])
                        
                        credential.save()
                        results['credentials'].append({
                            'name': name,
                            'action': 'created' if created else 'updated',
                            'id': credential.id
                        })
                        
                    except Exception as e:
                        results['errors'].append(f"Credentials error: {str(e)}")
            
            # Process App Settings
            if 'app_settings' in data:
                for app_data in data['app_settings']:
                    try:
                        key = app_data.get('key')
                        if not key:
                            results['errors'].append("Setting key is required")
                            continue
                        
                        setting, created = ApplicationSettings.objects.get_or_create(
                            key=key,
                            defaults={
                                'value': str(app_data.get('value', '')),
                                'setting_type': app_data.get('setting_type', 'string'),
                                'category': app_data.get('category', 'general')
                            }
                        )
                        
                        # Update fields
                        setting.value = str(app_data.get('value', setting.value))
                        setting.setting_type = app_data.get('setting_type', setting.setting_type)
                        setting.category = app_data.get('category', setting.category)
                        setting.description = app_data.get('description', setting.description)
                        setting.is_public = app_data.get('is_public', setting.is_public)
                        setting.is_editable = app_data.get('is_editable', setting.is_editable)
                        
                        setting.save()
                        results['app_settings'].append({
                            'key': key,
                            'action': 'created' if created else 'updated',
                            'id': setting.id
                        })
                        
                    except Exception as e:
                        results['errors'].append(f"App Settings error: {str(e)}")
        
        return api_response(True, "Bulk settings operation completed", results)
        
    except json.JSONDecodeError:
        return api_response(False, "Invalid JSON format", status_code=400)
    except Exception as e:
        logger.error(f"Error in bulk settings operation: {e}")
        return api_response(False, f"Error in bulk settings operation: {str(e)}", status_code=500)
