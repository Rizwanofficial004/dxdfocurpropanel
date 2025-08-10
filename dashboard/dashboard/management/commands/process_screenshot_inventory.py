#!/usr/bin/env python3
"""
Django Management Command: Process S3 Inventory for Daily Screenshot Counts

This command processes AWS S3 inventory files to count screenshots per employee
and stores the data in the database for analytics and reporting.

Usage:
    python manage.py process_screenshot_inventory
    python manage.py process_screenshot_inventory --date 2025-08-06
    python manage.py process_screenshot_inventory --inventory-file screenshots-inventory/latest.csv
"""

import boto3
import csv
import gzip
import time
from datetime import datetime, date
from collections import defaultdict
from io import BytesIO
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db import transaction
from dashboard.models import Staff, DailyScreenshotCount, ScreenshotInventoryLog
from dashboard.aws_utils import get_s3_client


class Command(BaseCommand):
    help = 'Process S3 inventory files to count daily screenshots per employee'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Specific date to process (YYYY-MM-DD). Default: today'
        )
        parser.add_argument(
            '--inventory-file',
            type=str,
            help='Specific S3 inventory file to process. Default: latest file'
        )
        parser.add_argument(
            '--bucket',
            type=str,
            default='ddsfocustime',
            help='S3 bucket name (default: ddsfocustime)'
        )
        parser.add_argument(
            '--inventory-prefix',
            type=str,
            default='screenshots-inventory/',
            help='S3 inventory prefix (default: screenshots-inventory/)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without saving to database'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reprocessing even if data exists for the date'
        )

    def handle(self, *args, **options):
        start_time = time.time()
        
        # Parse options
        target_date = self.parse_date(options.get('date'))
        inventory_file = options.get('inventory_file')
        bucket = options['bucket']
        inventory_prefix = options['inventory_prefix']
        dry_run = options['dry_run']
        force = options['force']
        
        self.stdout.write("=" * 70)
        self.stdout.write(self.style.SUCCESS("📊 S3 INVENTORY SCREENSHOT COUNTER"))
        self.stdout.write("=" * 70)
        self.stdout.write(f"🗓️  Target Date: {target_date}")
        self.stdout.write(f"🪣  S3 Bucket: {bucket}")
        self.stdout.write(f"📁  Inventory Prefix: {inventory_prefix}")
        
        if dry_run:
            self.stdout.write(self.style.WARNING("🚧 DRY RUN MODE - No data will be saved"))
        
        try:
            # Initialize S3 client
            s3_client = get_s3_client()
            
            # Create inventory log entry
            log_entry = None
            if not dry_run:
                log_entry = ScreenshotInventoryLog.objects.create(
                    inventory_file="Processing...",
                    status='processing'
                )
            
            # Get inventory file to process
            if inventory_file:
                self.stdout.write(f"📄 Using specified file: {inventory_file}")
            else:
                inventory_file = self.get_latest_inventory_file(s3_client, bucket, inventory_prefix)
                if not inventory_file:
                    raise CommandError("❌ No inventory files found")
                self.stdout.write(f"📄 Using latest file: {inventory_file}")
            
            # Check if we already have data for this date
            if not force and not dry_run:
                existing_count = DailyScreenshotCount.objects.filter(date=target_date).count()
                if existing_count > 0:
                    self.stdout.write(
                        self.style.WARNING(
                            f"⚠️  Data already exists for {target_date} ({existing_count} records). "
                            f"Use --force to reprocess."
                        )
                    )
                    if log_entry:
                        log_entry.status = 'completed'
                        log_entry.error_message = "Skipped - data already exists"
                        log_entry.save()
                    return
            
            # Process the inventory file
            screenshot_counts, task_folder_breakdown, total_files = self.process_inventory_file(
                s3_client, bucket, inventory_file
            )
            
            # Update database
            if not dry_run:
                employees_updated = self.update_database(
                    screenshot_counts, task_folder_breakdown, target_date, force
                )
                
                # Update log entry
                processing_duration = time.time() - start_time
                if log_entry:
                    log_entry.inventory_file = inventory_file
                    log_entry.total_files_processed = total_files
                    log_entry.total_employees_updated = employees_updated
                    log_entry.processing_duration = processing_duration
                    log_entry.status = 'completed'
                    log_entry.summary_data = {
                        'target_date': target_date.isoformat(),
                        'total_employees': len(screenshot_counts),
                        'total_screenshots': sum(screenshot_counts.values()),
                        'processing_time': processing_duration
                    }
                    log_entry.save()
                
                self.stdout.write("=" * 70)
                self.stdout.write(self.style.SUCCESS("✅ PROCESSING COMPLETED"))
                self.stdout.write(f"📊 Employees Updated: {employees_updated}")
                self.stdout.write(f"📷 Total Screenshots: {sum(screenshot_counts.values()):,}")
                self.stdout.write(f"⏱️  Processing Time: {processing_duration:.2f} seconds")
            else:
                self.stdout.write("=" * 70)
                self.stdout.write(self.style.SUCCESS("✅ DRY RUN COMPLETED"))
                self.stdout.write(f"📊 Would update {len(screenshot_counts)} employees")
                self.stdout.write(f"📷 Total Screenshots: {sum(screenshot_counts.values()):,}")
            
            # Show top 10 employees by screenshot count
            self.show_top_employees(screenshot_counts)
            
        except Exception as e:
            if log_entry and not dry_run:
                log_entry.status = 'failed'
                log_entry.error_message = str(e)
                log_entry.processing_duration = time.time() - start_time
                log_entry.save()
            
            self.stdout.write(self.style.ERROR(f"❌ Error: {str(e)}"))
            raise CommandError(f"Processing failed: {str(e)}")
        
        self.stdout.write("=" * 70)

    def parse_date(self, date_str):
        """Parse date string or return today"""
        if date_str:
            try:
                return datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                raise CommandError(f"Invalid date format: {date_str}. Use YYYY-MM-DD")
        return date.today()

    def get_latest_inventory_file(self, s3_client, bucket, prefix):
        """Get the latest inventory file from S3"""
        self.stdout.write(f"🔍 Searching for inventory files in s3://{bucket}/{prefix}")
        
        try:
            response = s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)
            files = [
                obj['Key'] for obj in response.get('Contents', [])
                if obj['Key'].endswith('.csv') or obj['Key'].endswith('.csv.gz')
            ]
            
            if not files:
                return None
                
            # Sort by last modified date (most recent first)
            files_with_dates = []
            for file_key in files:
                obj_response = s3_client.head_object(Bucket=bucket, Key=file_key)
                files_with_dates.append((file_key, obj_response['LastModified']))
            
            latest_file = sorted(files_with_dates, key=lambda x: x[1], reverse=True)[0][0]
            return latest_file
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error fetching inventory files: {str(e)}"))
            return None

    def process_inventory_file(self, s3_client, bucket, file_key):
        """Process the inventory CSV file and count screenshots"""
        self.stdout.write(f"📄 Processing inventory file: {file_key}")
        
        try:
            # Download and decompress file
            response = s3_client.get_object(Bucket=bucket, Key=file_key)
            body = response['Body'].read()
            
            if file_key.endswith('.gz'):
                body = gzip.decompress(body)
            
            # Parse CSV
            csv_content = body.decode('utf-8')
            csv_lines = csv_content.splitlines()
            reader = csv.reader(csv_lines)
            
            screenshot_counts = defaultdict(int)
            task_folder_breakdown = defaultdict(lambda: defaultdict(int))
            total_files = 0
            
            self.stdout.write("🔄 Processing CSV rows...")
            
            for row_num, row in enumerate(reader, 1):
                if row_num % 10000 == 0:
                    self.stdout.write(f"   Processed {row_num:,} rows...")
                
                if len(row) < 2:
                    continue
                    
                object_key = row[1]  # Object key is in second column
                total_files += 1
                
                # Only process screenshot files
                if object_key.startswith("screenshots/"):
                    parts = object_key.split('/')
                    if len(parts) >= 3:  # screenshots/employee/task_folder/file.jpg
                        employee_id = parts[1]
                        task_folder = parts[2] if len(parts) > 2 else 'unknown'
                        
                        screenshot_counts[employee_id] += 1
                        task_folder_breakdown[employee_id][task_folder] += 1
            
            self.stdout.write(f"📊 Found {len(screenshot_counts)} employees with screenshots")
            self.stdout.write(f"📁 Processed {total_files:,} total files")
            
            return screenshot_counts, dict(task_folder_breakdown), total_files
            
        except Exception as e:
            raise CommandError(f"Error processing inventory file: {str(e)}")

    def update_database(self, screenshot_counts, task_folder_breakdown, target_date, force=False):
        """Update the database with screenshot counts"""
        self.stdout.write("💾 Updating database...")
        
        employees_updated = 0
        
        with transaction.atomic():
            # Delete existing data for this date if force is enabled
            if force:
                deleted_count = DailyScreenshotCount.objects.filter(date=target_date).delete()[0]
                if deleted_count > 0:
                    self.stdout.write(f"🗑️  Deleted {deleted_count} existing records for {target_date}")
            
            for employee_id, screenshot_count in screenshot_counts.items():
                try:
                    # Try to find staff by multiple methods
                    staff = None
                    
                    # Method 1: Direct email match
                    try:
                        staff = Staff.objects.get(email=employee_id)
                    except Staff.DoesNotExist:
                        pass
                    
                    # Method 2: Match by staff ID (if employee_id looks like a staff ID)
                    if not staff:
                        try:
                            staff = Staff.objects.get(staffid__iexact=employee_id)
                        except Staff.DoesNotExist:
                            pass
                    
                    # Method 3: Try to find by email domain (remove domain variations)
                    if not staff and '@' not in employee_id:
                        try:
                            # This might be a username, try to find by email contains
                            staff = Staff.objects.filter(email__icontains=employee_id).first()
                        except:
                            pass
                    
                    if not staff:
                        self.stdout.write(
                            self.style.WARNING(f"⚠️  Employee not found in database: {employee_id}")
                        )
                        continue
                    
                    # Create or update screenshot count record
                    count_record, created = DailyScreenshotCount.objects.update_or_create(
                        staff=staff,
                        date=target_date,
                        defaults={
                            'total_screenshots': screenshot_count,
                            'task_folder_breakdown': dict(task_folder_breakdown.get(employee_id, {})),
                            's3_inventory_processed_at': timezone.now(),
                            's3_inventory_file': 'S3 Inventory Processing'
                        }
                    )
                    
                    action = "Created" if created else "Updated"
                    self.stdout.write(f"   ✅ {action}: {staff.email} - {screenshot_count} screenshots")
                    employees_updated += 1
                    
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"❌ Error updating {employee_id}: {str(e)}")
                    )
                    continue
        
        return employees_updated

    def show_top_employees(self, screenshot_counts):
        """Show top 10 employees by screenshot count"""
        self.stdout.write("\n📈 TOP 10 EMPLOYEES BY SCREENSHOT COUNT:")
        self.stdout.write("-" * 50)
        
        sorted_employees = sorted(
            screenshot_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        for i, (employee_id, count) in enumerate(sorted_employees, 1):
            self.stdout.write(f"{i:2d}. {employee_id:<30} {count:,} screenshots")
