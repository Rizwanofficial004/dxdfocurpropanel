"""
Timer Service - Employee Timer Management with Database Integration

This service provides:
- Employee synchronization from CRM API
- Timer management with database persistence
- Screenshot scheduling and logging
- MySQL database integration
"""

import requests
import json
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from .models import Employee, TimerSession, ScreenshotLog
import mysql.connector
from mysql.connector import Error
import os
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)

class TimerService:
    """
    Service class for managing employee timers and CRM integration
    """
    
    def __init__(self):
        self.crm_api_url = "http://127.0.0.1:8001/api/dashboard/crm-comprehensive/"
        self.mysql_config = {
            'host': os.getenv('MYSQL_HOST', '92.113.22.65'),
            'user': os.getenv('MYSQL_USER', 'u906714182_root'),
            'password': os.getenv('MYSQL_PASSWORD', 'Daniyal@123'),
            'database': os.getenv('MYSQL_DATABASE', 'u906714182_sqlrrefdvdv')
        }
    
    def fetch_employees_from_crm(self):
        """
        Fetch employees from CRM comprehensive API
        """
        try:
            response = requests.get(self.crm_api_url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            employees_data = []
            
            if data.get('status') == 'success' and 'data' in data:
                if 'employees' in data['data']:
                    employees_data = data['data']['employees']
                else:
                    employees_data = data['data']
            
            logger.info(f"Fetched {len(employees_data)} employees from CRM API")
            return employees_data
            
        except requests.RequestException as e:
            logger.error(f"Failed to fetch employees from CRM API: {e}")
            return []
        except Exception as e:
            logger.error(f"Error processing CRM response: {e}")
            return []
    
    def sync_employees_to_database(self):
        """
        Sync employees from CRM API to local database
        """
        employees_data = self.fetch_employees_from_crm()
        synced_count = 0
        
        for emp_data in employees_data:
            try:
                email = emp_data.get('email', '').strip().lower()
                name = emp_data.get('name', 'Unknown')
                
                if not email:
                    continue
                
                # Create or update employee
                employee, created = Employee.objects.get_or_create(
                    email=email,
                    defaults={
                        'name': name,
                        'crm_data': emp_data.get('crm_data', {}),
                        's3_data': emp_data.get('s3_data', {}),
                        'in_crm': emp_data.get('data_sources', {}).get('in_crm', True),
                        'in_s3': emp_data.get('data_sources', {}).get('in_s3', False),
                        'last_sync': timezone.now()
                    }
                )
                
                if not created:
                    # Update existing employee
                    employee.name = name
                    employee.crm_data = emp_data.get('crm_data', {})
                    employee.s3_data = emp_data.get('s3_data', {})
                    employee.in_crm = emp_data.get('data_sources', {}).get('in_crm', True)
                    employee.in_s3 = emp_data.get('data_sources', {}).get('in_s3', False)
                    employee.last_sync = timezone.now()
                    employee.save()
                
                # Create default timer session if doesn't exist
                timer_session, timer_created = TimerSession.objects.get_or_create(
                    employee=employee,
                    status='stopped',
                    defaults={
                        'duration_minutes': 10,  # Default 10 minutes as requested
                        'duration_seconds': 0,
                        'screenshot_interval': 10,  # 10 seconds between screenshots
                        'notifications_enabled': True,
                        'auto_start': False
                    }
                )
                
                synced_count += 1
                
            except Exception as e:
                logger.error(f"Error syncing employee {emp_data.get('email', 'unknown')}: {e}")
                continue
        
        logger.info(f"Synced {synced_count} employees to database")
        return synced_count
    
    def get_all_employees_with_timers(self):
        """
        Get all employees with their current timer status
        """
        employees = Employee.objects.filter(is_active=True).prefetch_related('timer_sessions')
        
        result = []
        for employee in employees:
            # Get the most recent timer session
            current_timer = employee.timer_sessions.filter(status__in=['running', 'paused']).first()
            if not current_timer:
                current_timer = employee.timer_sessions.order_by('-created_at').first()
            
            employee_data = {
                'id': employee.id,
                'email': employee.email,
                'name': employee.name,
                'department': employee.department,
                'position': employee.position,
                'is_active': employee.is_active,
                'in_crm': employee.in_crm,
                'in_s3': employee.in_s3,
                'complete_profile': employee.complete_profile,
                'timer_status': {
                    'id': current_timer.id if current_timer else None,
                    'status': current_timer.status if current_timer else 'stopped',
                    'duration_minutes': current_timer.duration_minutes if current_timer else 10,
                    'duration_seconds': current_timer.duration_seconds if current_timer else 0,
                    'screenshot_interval': current_timer.screenshot_interval if current_timer else 10,
                    'start_time': current_timer.start_time.isoformat() if current_timer and current_timer.start_time else None,
                    'elapsed_time': str(current_timer.elapsed_time) if current_timer else '0:00:00',
                    'remaining_time': str(current_timer.remaining_time) if current_timer else '10:00',
                    'total_screenshots': current_timer.total_screenshots if current_timer else 0,
                    'notifications_enabled': current_timer.notifications_enabled if current_timer else True,
                }
            }
            result.append(employee_data)
        
        return result
    
    def get_employee_timer(self, email):
        """
        Get specific employee timer status
        """
        try:
            employee = Employee.objects.get(email=email.lower(), is_active=True)
            current_timer = employee.timer_sessions.filter(status__in=['running', 'paused']).first()
            
            if not current_timer:
                current_timer = employee.timer_sessions.order_by('-created_at').first()
            
            if not current_timer:
                # Create default timer if none exists
                current_timer = TimerSession.objects.create(
                    employee=employee,
                    duration_minutes=10,
                    duration_seconds=0,
                    screenshot_interval=10
                )
            
            return {
                'employee': {
                    'id': employee.id,
                    'email': employee.email,
                    'name': employee.name,
                    'department': employee.department,
                    'position': employee.position,
                },
                'timer': {
                    'id': current_timer.id,
                    'status': current_timer.status,
                    'duration_minutes': current_timer.duration_minutes,
                    'duration_seconds': current_timer.duration_seconds,
                    'screenshot_interval': current_timer.screenshot_interval,
                    'start_time': current_timer.start_time.isoformat() if current_timer.start_time else None,
                    'elapsed_time': str(current_timer.elapsed_time),
                    'remaining_time': str(current_timer.remaining_time),
                    'total_screenshots': current_timer.total_screenshots,
                    'notifications_enabled': current_timer.notifications_enabled,
                    'auto_start': current_timer.auto_start,
                }
            }
            
        except Employee.DoesNotExist:
            return None
    
    def apply_timer_settings(self, email, minutes=10, seconds=0, auto_start=False, notifications_enabled=True):
        """
        Apply timer settings for an employee
        """
        try:
            employee = Employee.objects.get(email=email.lower(), is_active=True)
            
            # Get current active timer or create new one
            current_timer = employee.timer_sessions.filter(status__in=['running', 'paused']).first()
            
            if current_timer and current_timer.status in ['running', 'paused']:
                # Stop current timer before applying new settings
                current_timer.stop_timer()
            
            # Create new timer session with new settings
            new_timer = TimerSession.objects.create(
                employee=employee,
                duration_minutes=minutes,
                duration_seconds=seconds,
                screenshot_interval=10,  # Fixed at 10 seconds as requested
                auto_start=auto_start,
                notifications_enabled=notifications_enabled,
                status='stopped'
            )
            
            return {
                'success': True,
                'message': f'Timer settings applied for {employee.name}',
                'timer': {
                    'id': new_timer.id,
                    'duration_minutes': new_timer.duration_minutes,
                    'duration_seconds': new_timer.duration_seconds,
                    'screenshot_interval': new_timer.screenshot_interval,
                    'auto_start': new_timer.auto_start,
                    'notifications_enabled': new_timer.notifications_enabled,
                }
            }
            
        except Employee.DoesNotExist:
            return {'success': False, 'message': 'Employee not found'}
        except Exception as e:
            logger.error(f"Error applying timer settings for {email}: {e}")
            return {'success': False, 'message': str(e)}
    
    def start_timer(self, email):
        """
        Start timer for an employee
        """
        try:
            employee = Employee.objects.get(email=email.lower(), is_active=True)
            current_timer = employee.timer_sessions.filter(status='stopped').order_by('-created_at').first()
            
            if not current_timer:
                # Create new timer with default settings
                current_timer = TimerSession.objects.create(
                    employee=employee,
                    duration_minutes=10,
                    duration_seconds=0,
                    screenshot_interval=10
                )
            
            success = current_timer.start_timer()
            
            if success:
                return {
                    'success': True,
                    'message': f'Timer started for {employee.name}',
                    'timer': {
                        'id': current_timer.id,
                        'status': current_timer.status,
                        'start_time': current_timer.start_time.isoformat(),
                        'duration_minutes': current_timer.duration_minutes,
                        'duration_seconds': current_timer.duration_seconds,
                    }
                }
            else:
                return {'success': False, 'message': 'Timer could not be started'}
                
        except Employee.DoesNotExist:
            return {'success': False, 'message': 'Employee not found'}
        except Exception as e:
            logger.error(f"Error starting timer for {email}: {e}")
            return {'success': False, 'message': str(e)}
    
    def stop_timer(self, email):
        """
        Stop timer for an employee
        """
        try:
            employee = Employee.objects.get(email=email.lower(), is_active=True)
            current_timer = employee.timer_sessions.filter(status__in=['running', 'paused']).first()
            
            if not current_timer:
                return {'success': False, 'message': 'No active timer found'}
            
            success = current_timer.stop_timer()
            
            if success:
                return {
                    'success': True,
                    'message': f'Timer stopped for {employee.name}',
                    'timer': {
                        'id': current_timer.id,
                        'status': current_timer.status,
                        'end_time': current_timer.end_time.isoformat(),
                        'elapsed_time': str(current_timer.elapsed_time),
                        'total_screenshots': current_timer.total_screenshots,
                    }
                }
            else:
                return {'success': False, 'message': 'Timer could not be stopped'}
                
        except Employee.DoesNotExist:
            return {'success': False, 'message': 'Employee not found'}
        except Exception as e:
            logger.error(f"Error stopping timer for {email}: {e}")
            return {'success': False, 'message': str(e)}
    
    def pause_timer(self, email):
        """
        Pause timer for an employee
        """
        try:
            employee = Employee.objects.get(email=email.lower(), is_active=True)
            current_timer = employee.timer_sessions.filter(status='running').first()
            
            if not current_timer:
                return {'success': False, 'message': 'No running timer found'}
            
            success = current_timer.pause_timer()
            
            if success:
                return {
                    'success': True,
                    'message': f'Timer paused for {employee.name}',
                    'timer': {
                        'id': current_timer.id,
                        'status': current_timer.status,
                        'pause_time': current_timer.pause_time.isoformat(),
                        'elapsed_time': str(current_timer.elapsed_time),
                    }
                }
            else:
                return {'success': False, 'message': 'Timer could not be paused'}
                
        except Employee.DoesNotExist:
            return {'success': False, 'message': 'Employee not found'}
        except Exception as e:
            logger.error(f"Error pausing timer for {email}: {e}")
            return {'success': False, 'message': str(e)}
    
    def resume_timer(self, email):
        """
        Resume paused timer for an employee
        """
        try:
            employee = Employee.objects.get(email=email.lower(), is_active=True)
            current_timer = employee.timer_sessions.filter(status='paused').first()
            
            if not current_timer:
                return {'success': False, 'message': 'No paused timer found'}
            
            success = current_timer.start_timer()  # start_timer handles resume logic
            
            if success:
                return {
                    'success': True,
                    'message': f'Timer resumed for {employee.name}',
                    'timer': {
                        'id': current_timer.id,
                        'status': current_timer.status,
                        'elapsed_time': str(current_timer.elapsed_time),
                        'remaining_time': str(current_timer.remaining_time),
                    }
                }
            else:
                return {'success': False, 'message': 'Timer could not be resumed'}
                
        except Employee.DoesNotExist:
            return {'success': False, 'message': 'Employee not found'}
        except Exception as e:
            logger.error(f"Error resuming timer for {email}: {e}")
            return {'success': False, 'message': str(e)}
    
    def reset_timer(self, email):
        """
        Reset timer for an employee
        """
        try:
            employee = Employee.objects.get(email=email.lower(), is_active=True)
            current_timer = employee.timer_sessions.filter(status__in=['running', 'paused', 'stopped']).order_by('-created_at').first()
            
            if not current_timer:
                return {'success': False, 'message': 'No timer found'}
            
            success = current_timer.reset_timer()
            
            if success:
                return {
                    'success': True,
                    'message': f'Timer reset for {employee.name}',
                    'timer': {
                        'id': current_timer.id,
                        'status': current_timer.status,
                        'duration_minutes': current_timer.duration_minutes,
                        'duration_seconds': current_timer.duration_seconds,
                    }
                }
            else:
                return {'success': False, 'message': 'Timer could not be reset'}
                
        except Employee.DoesNotExist:
            return {'success': False, 'message': 'Employee not found'}
        except Exception as e:
            logger.error(f"Error resetting timer for {email}: {e}")
            return {'success': False, 'message': str(e)}
    
    def create_mysql_tables(self):
        """
        Create MySQL tables for timer tracking
        """
        try:
            connection = mysql.connector.connect(**self.mysql_config)
            cursor = connection.cursor()
            
            # Create employees table
            employees_table = """
            CREATE TABLE IF NOT EXISTS timer_employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                department VARCHAR(100),
                position VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                in_crm BOOLEAN DEFAULT FALSE,
                in_s3 BOOLEAN DEFAULT FALSE,
                crm_data JSON,
                s3_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_sync TIMESTAMP NULL,
                INDEX idx_email (email),
                INDEX idx_active (is_active)
            )
            """
            
            # Create timer sessions table
            timer_sessions_table = """
            CREATE TABLE IF NOT EXISTS timer_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                duration_minutes INT DEFAULT 25,
                duration_seconds INT DEFAULT 0,
                start_time TIMESTAMP NULL,
                end_time TIMESTAMP NULL,
                pause_time TIMESTAMP NULL,
                total_paused_duration TIME DEFAULT '00:00:00',
                status ENUM('stopped', 'running', 'paused', 'completed') DEFAULT 'stopped',
                auto_start BOOLEAN DEFAULT FALSE,
                notifications_enabled BOOLEAN DEFAULT TRUE,
                screenshot_interval INT DEFAULT 10,
                last_screenshot_time TIMESTAMP NULL,
                total_screenshots INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES timer_employees(id) ON DELETE CASCADE,
                INDEX idx_employee_status (employee_id, status),
                INDEX idx_start_time (start_time)
            )
            """
            
            # Create screenshot logs table
            screenshot_logs_table = """
            CREATE TABLE IF NOT EXISTS screenshot_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                timer_session_id INT NOT NULL,
                employee_id INT NOT NULL,
                filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(500),
                file_size BIGINT DEFAULT 0,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_elapsed_time TIME,
                uploaded_to_s3 BOOLEAN DEFAULT FALSE,
                s3_key VARCHAR(500),
                FOREIGN KEY (timer_session_id) REFERENCES timer_sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES timer_employees(id) ON DELETE CASCADE,
                INDEX idx_session_timestamp (timer_session_id, timestamp),
                INDEX idx_employee_timestamp (employee_id, timestamp)
            )
            """
            
            # Execute table creation
            cursor.execute(employees_table)
            cursor.execute(timer_sessions_table)
            cursor.execute(screenshot_logs_table)
            
            connection.commit()
            logger.info("MySQL tables created successfully")
            
            return {'success': True, 'message': 'MySQL tables created successfully'}
            
        except Error as e:
            logger.error(f"Error creating MySQL tables: {e}")
            return {'success': False, 'message': str(e)}
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()


# Initialize timer service
timer_service = TimerService()
