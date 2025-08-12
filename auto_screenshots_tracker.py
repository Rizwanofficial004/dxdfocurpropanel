#!/usr/bin/env python3
"""
Automated Screenshots Tracking System
- Stores data in database/cache
- Auto-updates every 1 hour
- Incremental updates (only changed users)
- Background processing
- Instant API responses
"""

import os
import json
import sqlite3
import boto3
import schedule
import time
import threading
from datetime import datetime, timedelta
from collections import defaultdict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ScreenshotsTracker:
    def __init__(self):
        self.db_path = os.path.join('dashboard', 'data', 'screenshots_tracker.db')
        self.cache_path = os.path.join('dashboard', 'data', 'screenshots_cache.json')
        self.s3_client = self.get_s3_client()
        self.bucket_name = 'ddsfocustime'
        self.ensure_directories()
        self.init_database()
    
    def ensure_directories(self):
        """Ensure data directory exists"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
    
    def get_s3_client(self):
        """Get S3 client with credentials"""
        return boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        )
    
    def init_database(self):
        """Initialize SQLite database for tracking"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS user_screenshots (
                    user_email TEXT PRIMARY KEY,
                    screenshot_count INTEGER DEFAULT 0,
                    total_size_bytes INTEGER DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_screenshot_date TEXT,
                    projects_json TEXT DEFAULT '{}',
                    status TEXT DEFAULT 'active'
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS update_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    update_type TEXT,
                    user_email TEXT,
                    old_count INTEGER,
                    new_count INTEGER,
                    difference INTEGER,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS system_status (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Insert initial system status
            conn.execute('''
                INSERT OR REPLACE INTO system_status (key, value) 
                VALUES ('last_full_scan', ''), ('auto_update_enabled', 'true')
            ''')
            
            conn.commit()
    
    def get_user_folder_last_modified(self, user_folder):
        """Get the last modified date of user's folder (quick check)"""
        try:
            prefix = f"screenshots/{user_folder}/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=1
            )
            
            if 'Contents' in response and response['Contents']:
                return response['Contents'][0]['LastModified']
            return None
        except Exception as e:
            print(f"Error checking folder {user_folder}: {e}")
            return None
    
    def quick_count_user_screenshots(self, user_folder):
        """Quickly count screenshots for a user using pagination"""
        try:
            prefix = f"screenshots/{user_folder}/"
            total_count = 0
            total_size = 0
            projects = defaultdict(int)
            latest_date = None
            
            continuation_token = None
            
            while True:
                kwargs = {
                    'Bucket': self.bucket_name,
                    'Prefix': prefix,
                    'MaxKeys': 1000
                }
                
                if continuation_token:
                    kwargs['ContinuationToken'] = continuation_token
                
                response = self.s3_client.list_objects_v2(**kwargs)
                
                if 'Contents' in response:
                    for obj in response['Contents']:
                        if (obj['Key'].lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif'))
                            and not obj['Key'].endswith('/')):
                            
                            total_count += 1
                            total_size += obj['Size']
                            
                            # Extract project from path
                            path_parts = obj['Key'].split('/')
                            if len(path_parts) >= 3:
                                project = path_parts[2]
                                projects[project] += 1
                            
                            # Track latest date
                            if not latest_date or obj['LastModified'] > latest_date:
                                latest_date = obj['LastModified']
                
                # Check if there are more objects
                if response.get('IsTruncated', False):
                    continuation_token = response['NextContinuationToken']
                else:
                    break
            
            return {
                'count': total_count,
                'size': total_size,
                'projects': dict(projects),
                'latest_date': latest_date.isoformat() if latest_date else None
            }
            
        except Exception as e:
            print(f"Error counting screenshots for {user_folder}: {e}")
            return None
    
    def check_for_updates(self):
        """Check which users need updates (incremental scan)"""
        print("🔍 Checking for updates...")
        
        try:
            # Get all user folders from S3
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix='screenshots/',
                Delimiter='/',
                MaxKeys=1000
            )
            
            current_users = set()
            if 'CommonPrefixes' in response:
                for prefix in response['CommonPrefixes']:
                    folder = prefix['Prefix'].replace('screenshots/', '').replace('/', '')
                    if folder and folder != 'screenshots':
                        current_users.add(folder)
            
            # Get users from database
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute('''
                    SELECT user_email, last_updated FROM user_screenshots
                ''')
                db_users = {row[0].replace('@', '_at_'): row[1] for row in cursor.fetchall()}
            
            # Find users that need updates
            users_to_update = []
            
            for user_folder in current_users:
                user_email = user_folder.replace('_at_', '@')
                
                # New user
                if user_email not in [k.replace('_at_', '@') for k in db_users.keys()]:
                    users_to_update.append((user_folder, 'new_user'))
                    continue
                
                # Check if user folder was modified recently
                last_db_update = None
                for db_email, db_time in db_users.items():
                    if db_email.replace('_at_', '@') == user_email:
                        last_db_update = datetime.fromisoformat(db_time.replace('Z', '+00:00')) if db_time else datetime.min
                        break
                
                if not last_db_update:
                    users_to_update.append((user_folder, 'missing_data'))
                    continue
                
                # Check if it's been more than 1 hour since last update
                if datetime.now() - last_db_update.replace(tzinfo=None) > timedelta(hours=1):
                    users_to_update.append((user_folder, 'scheduled_update'))
            
            return users_to_update
            
        except Exception as e:
            print(f"Error checking for updates: {e}")
            return []
    
    def update_user_data(self, user_folder, update_reason):
        """Update data for a specific user"""
        user_email = user_folder.replace('_at_', '@')
        print(f"📊 Updating {user_email} ({update_reason})")
        
        # Get current data from S3
        new_data = self.quick_count_user_screenshots(user_folder)
        if not new_data:
            return False
        
        # Get old data from database
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT screenshot_count, total_size_bytes FROM user_screenshots 
                WHERE user_email = ?
            ''', (user_email,))
            
            old_row = cursor.fetchone()
            old_count = old_row[0] if old_row else 0
            old_size = old_row[1] if old_row else 0
            
            # Update database
            conn.execute('''
                INSERT OR REPLACE INTO user_screenshots 
                (user_email, screenshot_count, total_size_bytes, last_updated, 
                 last_screenshot_date, projects_json, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_email,
                new_data['count'],
                new_data['size'],
                datetime.now().isoformat(),
                new_data['latest_date'],
                json.dumps(new_data['projects']),
                'active'
            ))
            
            # Log the update
            difference = new_data['count'] - old_count
            conn.execute('''
                INSERT INTO update_log 
                (update_type, user_email, old_count, new_count, difference)
                VALUES (?, ?, ?, ?, ?)
            ''', (update_reason, user_email, old_count, new_data['count'], difference))
            
            conn.commit()
        
        print(f"   📸 {new_data['count']:,} screenshots ({difference:+,} change)")
        return True
    
    def run_incremental_update(self):
        """Run incremental update (only changed users)"""
        print(f"\n🔄 Starting incremental update at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        users_to_update = self.check_for_updates()
        
        if not users_to_update:
            print("✅ No updates needed - all data is current")
            return
        
        print(f"📋 Found {len(users_to_update)} users to update")
        
        for user_folder, reason in users_to_update:
            self.update_user_data(user_folder, reason)
        
        # Update cache file
        self.generate_cache_file()
        
        # Update system status
        current_time = datetime.now().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                UPDATE system_status SET value = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE key = 'last_incremental_update'
            ''', (current_time,))
            conn.commit()
        
        print(f"✅ Incremental update completed at {datetime.now().strftime('%H:%M:%S')}")
    
    def generate_cache_file(self):
        """Generate JSON cache file for instant API responses"""
        print("💾 Generating cache file...")
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT user_email, screenshot_count, total_size_bytes, 
                       last_screenshot_date, projects_json, last_updated
                FROM user_screenshots 
                ORDER BY screenshot_count DESC
            ''')
            
            users_data = {}
            total_screenshots = 0
            total_size = 0
            
            for row in cursor.fetchall():
                email, count, size, last_date, projects_json, updated = row
                projects = json.loads(projects_json) if projects_json else {}
                
                users_data[email] = {
                    'total_count': count,
                    'total_size': size,
                    'projects': projects,
                    'latest_date': last_date,
                    'last_updated': updated
                }
                
                total_screenshots += count
                total_size += size
        
        cache_data = {
            'generated_at': datetime.now().isoformat(),
            'update_type': 'incremental_tracking',
            'total_users': len(users_data),
            'total_screenshots': total_screenshots,
            'total_size_bytes': total_size,
            'auto_updated': True,
            'users': users_data
        }
        
        with open(self.cache_path, 'w') as f:
            json.dump(cache_data, f, indent=2)
        
        print(f"✅ Cache updated: {total_screenshots:,} screenshots from {len(users_data)} users")
    
    def get_stats(self):
        """Get current statistics"""
        if not os.path.exists(self.db_path):
            return {"error": "No data available"}
        
        with sqlite3.connect(self.db_path) as conn:
            # Get total stats
            cursor = conn.execute('''
                SELECT COUNT(*) as users, 
                       SUM(screenshot_count) as total_screenshots,
                       SUM(total_size_bytes) as total_size
                FROM user_screenshots
            ''')
            stats = cursor.fetchone()
            
            # Get recent updates
            cursor = conn.execute('''
                SELECT update_type, COUNT(*) as count
                FROM update_log 
                WHERE timestamp > datetime('now', '-24 hours')
                GROUP BY update_type
            ''')
            recent_updates = dict(cursor.fetchall())
            
            # Get last update time
            cursor = conn.execute('''
                SELECT MAX(last_updated) FROM user_screenshots
            ''')
            last_update = cursor.fetchone()[0]
            
            return {
                'total_users': stats[0],
                'total_screenshots': stats[1] or 0,
                'total_size_gb': round((stats[2] or 0) / (1024**3), 2),
                'last_update': last_update,
                'recent_updates_24h': recent_updates,
                'auto_update_running': True
            }
    
    def start_auto_update_scheduler(self):
        """Start the automatic update scheduler"""
        print("🚀 Starting automatic screenshot tracking system...")
        print("⏰ Updates will run every 1 hour")
        
        # Schedule incremental updates every hour
        schedule.every().hour.do(self.run_incremental_update)
        
        # Run initial update
        self.run_incremental_update()
        
        # Keep scheduler running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def start_background_scheduler(self):
        """Start scheduler in background thread"""
        def scheduler_thread():
            self.start_auto_update_scheduler()
        
        thread = threading.Thread(target=scheduler_thread, daemon=True)
        thread.start()
        print("✅ Background auto-update started")
        
        return thread

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Screenshots Tracking System')
    parser.add_argument('--mode', choices=['start', 'update', 'stats', 'background'], 
                      default='start', help='Operation mode')
    
    args = parser.parse_args()
    tracker = ScreenshotsTracker()
    
    if args.mode == 'start':
        print("🚀 Starting foreground auto-update scheduler...")
        tracker.start_auto_update_scheduler()
    
    elif args.mode == 'update':
        print("🔄 Running manual update...")
        tracker.run_incremental_update()
    
    elif args.mode == 'stats':
        print("📊 Current Statistics:")
        stats = tracker.get_stats()
        for key, value in stats.items():
            print(f"   {key}: {value}")
    
    elif args.mode == 'background':
        print("🔄 Starting background scheduler...")
        thread = tracker.start_background_scheduler()
        
        # Keep main thread alive
        try:
            while True:
                time.sleep(10)
                print(f"📊 {datetime.now().strftime('%H:%M:%S')} - System running...")
        except KeyboardInterrupt:
            print("\n🛑 Stopping background scheduler...")

if __name__ == "__main__":
    main()
