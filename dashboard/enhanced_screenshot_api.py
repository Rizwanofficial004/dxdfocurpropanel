"""
Enhanced Screenshot API with Intervals and Detailed Counts
Analyzes screenshot timing patterns and detailed statistics per user
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import boto3
from collections import defaultdict
import re

app = Flask(__name__)
CORS(app)

class EnhancedScreenshotAPI:
    def __init__(self):
        self.base_path = r"c:\Users\DDS\Desktop\New folder"
        self.data_file = os.path.join(self.base_path, "daily_screenshot_counts.json")
        self.status_file = os.path.join(self.base_path, "service_status.json")
        
        # AWS S3 Configuration
        self.bucket_name = "ddsfocustime"
        self.s3_client = boto3.client(
            's3',
            region_name='eu-north-1',
            aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
            aws_secret_access_key='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'
        )
    
    def parse_filename_timestamp(self, filename):
        """Extract timestamp from screenshot filename"""
        try:
            # Pattern: 2025-07-01_23-31-37_2025-07-01_23-31-36.webp
            match = re.search(r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})', filename)
            if match:
                date_str, time_str = match.groups()
                datetime_str = f"{date_str} {time_str.replace('-', ':')}"
                return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
        except:
            pass
        return None
    
    def get_user_screenshot_intervals(self, user_email):
        """Get screenshot intervals for a specific user"""
        try:
            # Convert email format for S3 folder structure (only replace @ with _at_)
            # Replace @ with _at_ but keep dots
            folder_name = user_email.replace('@', '_at_')
            prefix = f"screenshots/{folder_name}/"
            
            print(f"🔍 Analyzing intervals for: {user_email}")
            print(f"📁 S3 folder: {prefix}")
            
            # Get all screenshots for this user
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(Bucket=self.bucket_name, Prefix=prefix)
            
            timestamps = []
            screenshots = []
            
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if obj['Key'].endswith(('.webp', '.jpg', '.jpeg', '.png')):
                            filename = os.path.basename(obj['Key'])
                            timestamp = self.parse_filename_timestamp(filename)
                            
                            if timestamp:
                                timestamps.append(timestamp)
                                screenshots.append({
                                    'filename': filename,
                                    'timestamp': timestamp.isoformat(),
                                    'size_kb': round(obj['Size'] / 1024, 2)
                                })
            
            if not timestamps:
                return {
                    'user_email': user_email,
                    'error': 'No screenshots with valid timestamps found',
                    'status': 'no_data'
                }
            
            # Sort by timestamp
            timestamps.sort()
            screenshots.sort(key=lambda x: x['timestamp'])
            
            # Calculate intervals
            intervals = []
            for i in range(1, len(timestamps)):
                interval_seconds = (timestamps[i] - timestamps[i-1]).total_seconds()
                intervals.append({
                    'from_screenshot': screenshots[i-1]['filename'],
                    'to_screenshot': screenshots[i]['filename'],
                    'from_time': screenshots[i-1]['timestamp'],
                    'to_time': screenshots[i]['timestamp'],
                    'interval_seconds': interval_seconds,
                    'interval_minutes': round(interval_seconds / 60, 2),
                    'interval_hours': round(interval_seconds / 3600, 2)
                })
            
            # Calculate statistics
            if intervals:
                interval_seconds_list = [i['interval_seconds'] for i in intervals]
                avg_interval = sum(interval_seconds_list) / len(interval_seconds_list)
                min_interval = min(interval_seconds_list)
                max_interval = max(interval_seconds_list)
            else:
                avg_interval = min_interval = max_interval = 0
            
            # Group by date
            daily_counts = defaultdict(int)
            for screenshot in screenshots:
                date = screenshot['timestamp'][:10]  # YYYY-MM-DD
                daily_counts[date] += 1
            
            return {
                'user_email': user_email,
                'total_screenshots': len(screenshots),
                'date_range': {
                    'first_screenshot': timestamps[0].isoformat(),
                    'last_screenshot': timestamps[-1].isoformat(),
                    'total_days': (timestamps[-1] - timestamps[0]).days + 1
                },
                'interval_statistics': {
                    'total_intervals': len(intervals),
                    'average_interval_minutes': round(avg_interval / 60, 2),
                    'min_interval_minutes': round(min_interval / 60, 2),
                    'max_interval_minutes': round(max_interval / 60, 2),
                    'average_interval_seconds': round(avg_interval, 2)
                },
                'daily_breakdown': dict(daily_counts),
                'recent_intervals': intervals[-10:] if len(intervals) > 10 else intervals,
                'all_intervals': intervals,
                'status': 'success'
            }
            
        except Exception as e:
            return {
                'user_email': user_email,
                'error': f'Error analyzing intervals: {str(e)}',
                'status': 'error'
            }
    
    def get_user_detailed_counts(self, user_email):
        """Get detailed screenshot counts and patterns for a user"""
        try:
            intervals_data = self.get_user_screenshot_intervals(user_email)
            
            if intervals_data['status'] != 'success':
                return intervals_data
            
            daily_counts = intervals_data['daily_breakdown']
            
            # Calculate patterns
            hourly_pattern = defaultdict(int)
            weekly_pattern = defaultdict(int)
            
            # Convert email format for S3 folder structure (only replace @ with _at_)
            folder_name = user_email.replace('@', '_at_')
            prefix = f"screenshots/{folder_name}/"
            
            # Get hourly patterns
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(Bucket=self.bucket_name, Prefix=prefix)
            
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if obj['Key'].endswith(('.webp', '.jpg', '.jpeg', '.png')):
                            filename = os.path.basename(obj['Key'])
                            timestamp = self.parse_filename_timestamp(filename)
                            
                            if timestamp:
                                # Hour of day (0-23)
                                hour = timestamp.hour
                                hourly_pattern[hour] += 1
                                
                                # Day of week (0=Monday, 6=Sunday)
                                weekday = timestamp.weekday()
                                day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                                weekly_pattern[day_names[weekday]] += 1
            
            # Find peak times
            peak_hour = max(hourly_pattern.items(), key=lambda x: x[1]) if hourly_pattern else (0, 0)
            peak_day = max(weekly_pattern.items(), key=lambda x: x[1]) if weekly_pattern else ('Monday', 0)
            
            # Calculate productivity metrics
            total_screenshots = intervals_data['total_screenshots']
            total_days = intervals_data['date_range']['total_days']
            avg_per_day = round(total_screenshots / total_days, 2) if total_days > 0 else 0
            
            return {
                'user_email': user_email,
                'summary': {
                    'total_screenshots': total_screenshots,
                    'total_days_active': total_days,
                    'average_per_day': avg_per_day,
                    'first_screenshot': intervals_data['date_range']['first_screenshot'],
                    'last_screenshot': intervals_data['date_range']['last_screenshot']
                },
                'patterns': {
                    'hourly_distribution': dict(hourly_pattern),
                    'weekly_distribution': dict(weekly_pattern),
                    'peak_hour': f"{peak_hour[0]:02d}:00 ({peak_hour[1]} screenshots)",
                    'peak_day': f"{peak_day[0]} ({peak_day[1]} screenshots)"
                },
                'daily_breakdown': daily_counts,
                'interval_stats': intervals_data['interval_statistics'],
                'productivity_score': min(100, round((avg_per_day / 50) * 100, 1)),  # Score out of 100
                'status': 'success'
            }
            
        except Exception as e:
            return {
                'user_email': user_email,
                'error': f'Error getting detailed counts: {str(e)}',
                'status': 'error'
            }
    
    def get_cached_data(self):
        """Get basic screenshot data from cache"""
        try:
            if not os.path.exists(self.data_file):
                return {
                    'error': 'Screenshot data not available yet',
                    'message': 'Background service is updating data...',
                    'status': 'waiting'
                }
            
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            file_time = os.path.getmtime(self.data_file)
            hours_old = (datetime.now().timestamp() - file_time) / 3600
            data['data_age_hours'] = round(hours_old, 2)
            data['is_fresh'] = hours_old < 25
            
            return data
            
        except Exception as e:
            return {
                'error': f'Error reading screenshot data: {str(e)}',
                'status': 'error'
            }

# Create API instance
api = EnhancedScreenshotAPI()

# Root endpoint
@app.route('/')
def home():
    """Enhanced API Documentation"""
    return jsonify({
        'message': 'Enhanced Screenshot API - Intervals & Detailed Analysis',
        'version': '2.0',
        'endpoints': {
            'GET /': 'This documentation',
            'GET /api/screenshots/all': 'Get all user screenshot counts',
            'GET /api/screenshots/user/<email>': 'Search for specific user',
            'GET /api/screenshots/user/<email>/intervals': 'Get screenshot intervals for user',
            'GET /api/screenshots/user/<email>/details': 'Get detailed counts and patterns',
            'GET /api/screenshots/top': 'Get top 10 users (default)',
            'GET /api/screenshots/top/<limit>': 'Get top N users',
            'GET /api/screenshots/status': 'Get service status',
            'GET /api/screenshots/stats': 'Get summary statistics'
        },
        'new_features': {
            'intervals': 'Time gaps between screenshots',
            'detailed_analysis': 'Hourly/daily patterns, productivity scores',
            'real_time_s3': 'Live data from S3 bucket analysis'
        },
        'examples': {
            'beyza_intervals': '/api/screenshots/user/beyza-donmez-@hotmail.com/intervals',
            'beyza_details': '/api/screenshots/user/beyza-donmez-@hotmail.com/details',
            'amir_intervals': '/api/screenshots/user/amir/intervals'
        }
    })

# Get screenshot intervals for specific user
@app.route('/api/screenshots/user/<path:email>/intervals')
def get_user_intervals(email):
    """Get screenshot intervals for a specific user"""
    return jsonify(api.get_user_screenshot_intervals(email))

# Get detailed counts and patterns for specific user
@app.route('/api/screenshots/user/<path:email>/details')
def get_user_details(email):
    """Get detailed screenshot analysis for a specific user"""
    return jsonify(api.get_user_detailed_counts(email))

# Basic user search (existing functionality)
@app.route('/api/screenshots/user/<path:email>')
def get_user_screenshots(email):
    """Search for user by email (basic count)"""
    cached_data = api.get_cached_data()
    
    if 'error' in cached_data:
        return jsonify(cached_data)
    
    try:
        user_counts = cached_data['data']['user_counts']
        
        # Find user (case insensitive search)
        found_users = []
        for user_email, count in user_counts.items():
            if email.lower() in user_email.lower():
                found_users.append({
                    'user_email': user_email,
                    'screenshot_count': count,
                    'links': {
                        'intervals': f'/api/screenshots/user/{user_email}/intervals',
                        'details': f'/api/screenshots/user/{user_email}/details'
                    }
                })
        
        if found_users:
            return jsonify({
                'search_term': email,
                'found_users': found_users,
                'total_matches': len(found_users),
                'last_updated': cached_data['last_updated'],
                'status': 'success',
                'note': 'Use /intervals or /details endpoints for detailed analysis'
            })
        else:
            return jsonify({
                'search_term': email,
                'error': f'No users found matching "{email}"',
                'total_users_available': len(user_counts),
                'status': 'not_found'
            })
            
    except Exception as e:
        return jsonify({
            'error': f'Error processing search: {str(e)}',
            'status': 'error'
        })

# Get all screenshot counts (existing)
@app.route('/api/screenshots/all')
def get_all_screenshots():
    """Get all user screenshot counts instantly"""
    return jsonify(api.get_cached_data())

# Get top users (existing)
@app.route('/api/screenshots/top')
def get_top_users_default():
    """Get top 10 users by screenshot count"""
    cached_data = api.get_cached_data()
    if 'error' in cached_data:
        return jsonify(cached_data)
    
    try:
        user_counts = cached_data['data']['user_counts']
        sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
        top_users = sorted_users[:10]
        
        return jsonify({
            'top_users': [
                {
                    'rank': i + 1,
                    'email': email,
                    'screenshot_count': count,
                    'analysis_links': {
                        'intervals': f'/api/screenshots/user/{email}/intervals',
                        'details': f'/api/screenshots/user/{email}/details'
                    }
                }
                for i, (email, count) in enumerate(top_users)
            ],
            'showing_top': len(top_users),
            'total_users': len(user_counts),
            'last_updated': cached_data['last_updated'],
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error getting top users: {str(e)}',
            'status': 'error'
        })

# Get top N users
@app.route('/api/screenshots/top/<int:limit>')
def get_top_users(limit):
    """Get top N users by screenshot count"""
    if limit > 100:
        return jsonify({
            'error': 'Limit too high. Maximum 100 users allowed.',
            'requested_limit': limit,
            'max_allowed': 100
        }), 400
    
    cached_data = api.get_cached_data()
    if 'error' in cached_data:
        return jsonify(cached_data)
    
    try:
        user_counts = cached_data['data']['user_counts']
        sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
        top_users = sorted_users[:limit]
        
        return jsonify({
            'top_users': [
                {
                    'rank': i + 1,
                    'email': email,
                    'screenshot_count': count,
                    'analysis_links': {
                        'intervals': f'/api/screenshots/user/{email}/intervals',
                        'details': f'/api/screenshots/user/{email}/details'
                    }
                }
                for i, (email, count) in enumerate(top_users)
            ],
            'requested_limit': limit,
            'showing_top': len(top_users),
            'total_users': len(user_counts),
            'last_updated': cached_data['last_updated'],
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error getting top users: {str(e)}',
            'status': 'error'
        })

# Service status (existing)
@app.route('/api/screenshots/status')
def get_service_status():
    """Get background service status"""
    try:
        service_status = {}
        
        if os.path.exists(api.status_file):
            with open(api.status_file, 'r') as f:
                service_status = json.load(f)
        
        # Add data file info
        if os.path.exists(api.data_file):
            file_time = os.path.getmtime(api.data_file)
            file_size = os.path.getsize(api.data_file)
            service_status.update({
                'data_file_exists': True,
                'data_file_size_kb': round(file_size / 1024, 2),
                'data_file_last_modified': datetime.fromtimestamp(file_time).isoformat(),
                'data_age_hours': round((datetime.now().timestamp() - file_time) / 3600, 2)
            })
        
        return jsonify(service_status)
        
    except Exception as e:
        return jsonify({
            'error': f'Error getting service status: {str(e)}',
            'status': 'error'
        })

# Summary statistics (existing)
@app.route('/api/screenshots/stats')
def get_stats():
    """Get summary statistics"""
    cached_data = api.get_cached_data()
    
    if 'error' in cached_data:
        return jsonify(cached_data)
    
    try:
        user_counts = cached_data['data']['user_counts']
        counts_list = list(user_counts.values())
        
        return jsonify({
            'total_users': len(user_counts),
            'total_screenshots': sum(counts_list),
            'average_per_user': round(sum(counts_list) / len(counts_list), 2),
            'max_screenshots': max(counts_list),
            'min_screenshots': min(counts_list),
            'users_with_100plus': len([c for c in counts_list if c >= 100]),
            'users_with_1000plus': len([c for c in counts_list if c >= 1000]),
            'users_with_10000plus': len([c for c in counts_list if c >= 10000]),
            'last_updated': cached_data['last_updated'],
            'data_age_hours': cached_data.get('data_age_hours', 0),
            'new_features': {
                'interval_analysis': 'Available via /user/<email>/intervals',
                'detailed_patterns': 'Available via /user/<email>/details'
            },
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error calculating stats: {str(e)}',
            'status': 'error'
        })

# Health check
@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'data_available': os.path.exists(api.data_file),
        'version': '2.0',
        'features': ['basic_counts', 'intervals', 'detailed_analysis']
    })

if __name__ == "__main__":
    print("🚀 ENHANCED SCREENSHOT API - INTERVALS & ANALYSIS")
    print("=" * 60)
    print("🔗 Starting Flask server...")
    print("📡 Available endpoints:")
    print("   GET  http://localhost:5000/")
    print("   GET  http://localhost:5000/api/screenshots/all")
    print("   GET  http://localhost:5000/api/screenshots/user/beyza")
    print("   🆕  http://localhost:5000/api/screenshots/user/beyza/intervals")
    print("   🆕  http://localhost:5000/api/screenshots/user/beyza/details")
    print("   GET  http://localhost:5000/api/screenshots/top/10")
    print("   GET  http://localhost:5000/api/screenshots/status")
    print("   GET  http://localhost:5000/api/screenshots/stats")
    print("   GET  http://localhost:5000/health")
    print("=" * 60)
    print("🆕 NEW FEATURES:")
    print("   ⏱️  Screenshot intervals between captures")
    print("   📊 Hourly/daily activity patterns")
    print("   🎯 Productivity scoring")
    print("   📈 Peak usage analysis")
    print("🧪 Ready for enhanced Postman testing!")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
