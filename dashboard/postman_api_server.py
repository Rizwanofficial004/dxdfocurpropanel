"""
Flask API Server for Postman Testing
Instant Screenshot APIs with HTTP endpoints
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class PostmanScreenshotAPI:
    def __init__(self):
        # Update this path to your screenshot counter directory
        self.base_path = r"c:\Users\DDS\Desktop\New folder"
        self.data_file = os.path.join(self.base_path, "daily_screenshot_counts.json")
        self.status_file = os.path.join(self.base_path, "service_status.json")
    
    def get_cached_data(self):
        """Get screenshot data instantly from cache"""
        try:
            if not os.path.exists(self.data_file):
                return {
                    'error': 'Screenshot data not available yet',
                    'message': 'Background service is updating data...',
                    'status': 'waiting'
                }
            
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Add freshness info
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
    
    def find_user(self, search_term):
        """Find user by email search"""
        data = self.get_cached_data()
        
        if 'error' in data:
            return data
        
        try:
            user_counts = data['data']['user_counts']
            
            # Find user (case insensitive search)
            found_users = []
            for user_email, count in user_counts.items():
                if search_term.lower() in user_email.lower():
                    found_users.append({
                        'user_email': user_email,
                        'screenshot_count': count
                    })
            
            if found_users:
                return {
                    'search_term': search_term,
                    'found_users': found_users,
                    'total_matches': len(found_users),
                    'last_updated': data['last_updated'],
                    'status': 'success'
                }
            else:
                return {
                    'search_term': search_term,
                    'error': f'No users found matching "{search_term}"',
                    'total_users_available': len(user_counts),
                    'status': 'not_found'
                }
                
        except Exception as e:
            return {
                'error': f'Error processing search: {str(e)}',
                'status': 'error'
            }
    
    def get_top_users(self, limit=10):
        """Get top N users by screenshot count"""
        data = self.get_cached_data()
        
        if 'error' in data:
            return data
        
        try:
            user_counts = data['data']['user_counts']
            
            # Sort and limit
            sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
            top_users = sorted_users[:limit]
            
            return {
                'top_users': [
                    {
                        'rank': i + 1,
                        'email': email,
                        'screenshot_count': count
                    }
                    for i, (email, count) in enumerate(top_users)
                ],
                'requested_limit': limit,
                'total_users': len(user_counts),
                'showing_top': len(top_users),
                'last_updated': data['last_updated'],
                'status': 'success'
            }
            
        except Exception as e:
            return {
                'error': f'Error getting top users: {str(e)}',
                'status': 'error'
            }
    
    def get_service_status(self):
        """Get background service status"""
        try:
            service_status = {}
            
            if os.path.exists(self.status_file):
                with open(self.status_file, 'r') as f:
                    service_status = json.load(f)
            
            # Add data file info
            if os.path.exists(self.data_file):
                file_time = os.path.getmtime(self.data_file)
                file_size = os.path.getsize(self.data_file)
                service_status.update({
                    'data_file_exists': True,
                    'data_file_size_kb': round(file_size / 1024, 2),
                    'data_file_last_modified': datetime.fromtimestamp(file_time).isoformat(),
                    'data_age_hours': round((datetime.now().timestamp() - file_time) / 3600, 2)
                })
            else:
                service_status.update({
                    'data_file_exists': False,
                    'message': 'Data file not found - service may be running first scan'
                })
            
            return service_status
            
        except Exception as e:
            return {
                'error': f'Error getting service status: {str(e)}',
                'status': 'error'
            }

# Create API instance
api = PostmanScreenshotAPI()

# Root endpoint
@app.route('/')
def home():
    """API Documentation"""
    return jsonify({
        'message': 'Screenshot Count API - Instant Responses',
        'version': '1.0',
        'endpoints': {
            'GET /': 'This documentation',
            'GET /api/screenshots/all': 'Get all user screenshot counts',
            'GET /api/screenshots/user/<email>': 'Search for specific user',
            'GET /api/screenshots/top': 'Get top 10 users (default)',
            'GET /api/screenshots/top/<limit>': 'Get top N users',
            'GET /api/screenshots/status': 'Get service status',
            'GET /api/screenshots/stats': 'Get summary statistics'
        },
        'examples': {
            'search_user': '/api/screenshots/user/beyza',
            'top_5_users': '/api/screenshots/top/5',
            'all_data': '/api/screenshots/all'
        }
    })

# Get all screenshot counts
@app.route('/api/screenshots/all')
def get_all_screenshots():
    """Get all user screenshot counts instantly"""
    return jsonify(api.get_cached_data())

# Search for specific user
@app.route('/api/screenshots/user/<email>')
def get_user_screenshots(email):
    """Search for user by email"""
    return jsonify(api.find_user(email))

# Get top users (default 10)
@app.route('/api/screenshots/top')
def get_top_users_default():
    """Get top 10 users by screenshot count"""
    return jsonify(api.get_top_users(10))

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
    
    return jsonify(api.get_top_users(limit))

# Get service status
@app.route('/api/screenshots/status')
def get_service_status():
    """Get background service status"""
    return jsonify(api.get_service_status())

# Get summary statistics
@app.route('/api/screenshots/stats')
def get_stats():
    """Get summary statistics"""
    data = api.get_cached_data()
    
    if 'error' in data:
        return jsonify(data)
    
    try:
        user_counts = data['data']['user_counts']
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
            'last_updated': data['last_updated'],
            'data_age_hours': data.get('data_age_hours', 0),
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
        'data_available': os.path.exists(api.data_file)
    })

if __name__ == "__main__":
    print("🚀 SCREENSHOT API SERVER FOR POSTMAN")
    print("=" * 50)
    print("🔗 Starting Flask server...")
    print("📡 Available endpoints:")
    print("   GET  http://localhost:5000/")
    print("   GET  http://localhost:5000/api/screenshots/all")
    print("   GET  http://localhost:5000/api/screenshots/user/beyza")
    print("   GET  http://localhost:5000/api/screenshots/top/10")
    print("   GET  http://localhost:5000/api/screenshots/status")
    print("   GET  http://localhost:5000/api/screenshots/stats")
    print("   GET  http://localhost:5000/health")
    print("=" * 50)
    print("🧪 Ready for Postman testing!")
    
    # Run Flask server
    app.run(host='0.0.0.0', port=5000, debug=False)
