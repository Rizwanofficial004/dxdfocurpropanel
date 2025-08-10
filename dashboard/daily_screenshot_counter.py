#!/usr/bin/env python3
"""
Standalone S3 Inventory Screenshot Counter
Enhanced version of your original script with database integration

This script can be run independently or as part of a cron job.
It processes AWS S3 inventory files to count screenshots per employee.
"""

import os
import sys
import django
import boto3
import csv
import gzip
import time
from datetime import datetime, date
from collections import defaultdict
from io import BytesIO

# Add Django project to path and configure
current_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(project_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

# Now import Django models
from dashboard.models import Staff, DailyScreenshotCount, ScreenshotInventoryLog
from dashboard.aws_utils import get_s3_client


class S3InventoryProcessor:
    def __init__(self, bucket='ddsfocustime', inventory_prefix='screenshots-inventory/'):
        self.bucket = bucket
        self.inventory_prefix = inventory_prefix
        self.s3_client = get_s3_client()
        
    def get_latest_inventory_file(self):
        """Get the most recent inventory file from S3"""
        print(f"🔍 Fetching latest inventory file from s3://{self.bucket}/{self.inventory_prefix}")
        
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket, 
                Prefix=self.inventory_prefix
            )
            
            files = [
                obj for obj in response.get('Contents', [])
                if obj['Key'].endswith('.csv') or obj['Key'].endswith('.csv.gz')
            ]
            
            if not files:
                print("❌ No inventory files found yet.")
                return None
            
            # Sort by LastModified date, newest first
            latest_file = sorted(files, key=lambda x: x['LastModified'], reverse=True)[0]
            print(f"✅ Found latest inventory file: {latest_file['Key']}")
            print(f"   📅 Last Modified: {latest_file['LastModified']}")
            print(f"   📦 Size: {latest_file['Size']:,} bytes")
            
            return latest_file['Key']
            
        except Exception as e:
            print(f"❌ Error fetching inventory files: {str(e)}")
            return None

    def process_inventory_file(self, file_key):
        """Process the inventory CSV file and count screenshots per employee"""
        print(f"\n📄 Processing inventory file: {file_key}")
        start_time = time.time()
        
        try:
            # Download the file
            print("⬇️  Downloading inventory file...")
            response = self.s3_client.get_object(Bucket=self.bucket, Key=file_key)
            body = response['Body'].read()
            
            # Decompress if it's gzipped
            if file_key.endswith('.gz'):
                print("📦 Decompressing gzipped file...")
                body = gzip.decompress(body)
            
            # Parse CSV content
            print("📊 Parsing CSV content...")
            csv_content = body.decode('utf-8')
            csv_lines = csv_content.splitlines()
            reader = csv.reader(csv_lines)
            
            # Count screenshots per employee
            screenshot_counts = defaultdict(int)
            task_folder_breakdown = defaultdict(lambda: defaultdict(int))
            total_files_processed = 0
            screenshot_files_found = 0
            
            print("🔄 Processing rows...")
            for row_num, row in enumerate(reader, 1):
                # Show progress every 10,000 rows
                if row_num % 10000 == 0:
                    print(f"   📈 Processed {row_num:,} rows...")
                
                if len(row) < 2:
                    continue
                
                object_key = row[1]  # Object key is in the second column
                total_files_processed += 1
                
                # Only process screenshot files
                if object_key.startswith("screenshots/"):
                    screenshot_files_found += 1
                    parts = object_key.split('/')
                    
                    if len(parts) >= 2:
                        employee_id = parts[1]  # screenshots/EMPLOYEE_ID/...
                        task_folder = parts[2] if len(parts) > 2 else 'unknown'
                        
                        screenshot_counts[employee_id] += 1
                        task_folder_breakdown[employee_id][task_folder] += 1
            
            processing_time = time.time() - start_time
            
            print(f"\n📊 Processing Results:")
            print(f"   ⏱️  Processing Time: {processing_time:.2f} seconds")
            print(f"   📁 Total Files Processed: {total_files_processed:,}")
            print(f"   📷 Screenshot Files Found: {screenshot_files_found:,}")
            print(f"   👥 Employees with Screenshots: {len(screenshot_counts)}")
            print(f"   📈 Total Screenshots: {sum(screenshot_counts.values()):,}")
            
            return screenshot_counts, dict(task_folder_breakdown), {
                'total_files': total_files_processed,
                'screenshot_files': screenshot_files_found,
                'processing_time': processing_time,
                'inventory_file': file_key
            }
            
        except Exception as e:
            print(f"❌ Error processing inventory file: {str(e)}")
            raise

    def update_database(self, screenshot_counts, task_folder_breakdown, metadata, target_date=None):
        """Update the database with screenshot counts"""
        if target_date is None:
            target_date = date.today()
        
        print(f"\n💾 Updating database for date: {target_date}")
        
        # Create inventory log entry
        log_entry = ScreenshotInventoryLog.objects.create(
            inventory_file=metadata['inventory_file'],
            total_files_processed=metadata['total_files'],
            processing_duration=metadata['processing_time'],
            status='processing',
            summary_data=metadata
        )
        
        employees_updated = 0
        employees_not_found = []
        
        try:
            for employee_id, screenshot_count in screenshot_counts.items():
                try:
                    # Try to find the staff member
                    staff = self.find_staff_member(employee_id)
                    
                    if not staff:
                        employees_not_found.append(employee_id)
                        continue
                    
                    # Create or update daily count record
                    count_record, created = DailyScreenshotCount.objects.update_or_create(
                        staff=staff,
                        date=target_date,
                        defaults={
                            'total_screenshots': screenshot_count,
                            'task_folder_breakdown': task_folder_breakdown.get(employee_id, {}),
                            's3_inventory_processed_at': django.utils.timezone.now(),
                            's3_inventory_file': metadata['inventory_file']
                        }
                    )
                    
                    action = "✅ Created" if created else "🔄 Updated"
                    print(f"   {action}: {staff.email} - {screenshot_count:,} screenshots")
                    employees_updated += 1
                    
                except Exception as e:
                    print(f"   ❌ Error updating {employee_id}: {str(e)}")
                    continue
            
            # Update log entry with success
            log_entry.total_employees_updated = employees_updated
            log_entry.status = 'completed'
            log_entry.summary_data.update({
                'employees_updated': employees_updated,
                'employees_not_found': len(employees_not_found),
                'target_date': target_date.isoformat()
            })
            log_entry.save()
            
            print(f"\n📈 Database Update Summary:")
            print(f"   ✅ Employees Updated: {employees_updated}")
            print(f"   ⚠️  Employees Not Found: {len(employees_not_found)}")
            
            if employees_not_found and len(employees_not_found) <= 10:
                print(f"   🔍 Not Found: {', '.join(employees_not_found)}")
            elif employees_not_found:
                print(f"   🔍 Not Found (first 10): {', '.join(employees_not_found[:10])}...")
                
            return employees_updated
            
        except Exception as e:
            log_entry.status = 'failed'
            log_entry.error_message = str(e)
            log_entry.save()
            raise

    def find_staff_member(self, employee_id):
        """Try multiple methods to find staff member by employee_id"""
        # Method 1: Direct email match
        try:
            return Staff.objects.get(email=employee_id)
        except Staff.DoesNotExist:
            pass
        
        # Method 2: Staff ID match
        try:
            return Staff.objects.get(staffid__iexact=employee_id)
        except Staff.DoesNotExist:
            pass
        
        # Method 3: Email contains (for username-style IDs)
        if '@' not in employee_id:
            try:
                return Staff.objects.filter(email__icontains=employee_id).first()
            except:
                pass
        
        return None

    def show_top_employees(self, screenshot_counts, limit=10):
        """Display top employees by screenshot count"""
        print(f"\n📊 TOP {limit} EMPLOYEES BY SCREENSHOT COUNT:")
        print("-" * 60)
        
        sorted_employees = sorted(
            screenshot_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        for i, (employee_id, count) in enumerate(sorted_employees, 1):
            # Try to get the actual name from database
            staff = self.find_staff_member(employee_id)
            display_name = f"{staff.firstname} {staff.lastname}" if staff else employee_id
            
            print(f"{i:2d}. {display_name:<35} {count:,} screenshots")

    def run_daily_process(self, target_date=None):
        """Run the complete daily screenshot counting process"""
        print("=" * 70)
        print("📊 DAILY S3 INVENTORY SCREENSHOT COUNTER")
        print("=" * 70)
        print(f"🗓️  Target Date: {target_date or date.today()}")
        print(f"🪣  S3 Bucket: {self.bucket}")
        print(f"📁  Inventory Prefix: {self.inventory_prefix}")
        print("=" * 70)
        
        try:
            # Step 1: Get latest inventory file
            latest_file = self.get_latest_inventory_file()
            if not latest_file:
                print("❌ No inventory files found. Exiting.")
                return False
            
            # Step 2: Process the inventory file
            screenshot_counts, task_breakdown, metadata = self.process_inventory_file(latest_file)
            
            # Step 3: Update database
            employees_updated = self.update_database(
                screenshot_counts, task_breakdown, metadata, target_date
            )
            
            # Step 4: Show summary
            self.show_top_employees(screenshot_counts)
            
            print("\n" + "=" * 70)
            print("✅ DAILY PROCESSING COMPLETED SUCCESSFULLY")
            print(f"📊 Total Employees Updated: {employees_updated}")
            print(f"📷 Total Screenshots Counted: {sum(screenshot_counts.values()):,}")
            print("=" * 70)
            
            return True
            
        except Exception as e:
            print(f"\n❌ PROCESSING FAILED: {str(e)}")
            print("=" * 70)
            return False


def main():
    """Main entry point for standalone execution"""
    processor = S3InventoryProcessor()
    
    # You can specify a custom date here if needed
    # processor.run_daily_process(target_date=date(2025, 8, 6))
    
    success = processor.run_daily_process()
    
    if success:
        print("🎉 Process completed successfully!")
        sys.exit(0)
    else:
        print("💥 Process failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
