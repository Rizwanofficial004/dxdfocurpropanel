"""
Instant Screenshot API Reader
Reads pre-calculated data for instant responses
No S3 calls - just reads cached JSON file
"""

import json
import os
from datetime import datetime
from flask import Flask, jsonify

app = Flask(__name__)

class InstantScreenshotAPI:
    def __init__(self):
        self.data_file = "daily_screenshot_counts.json"
        self.status_file = "service_status.json"
    
    def get_cached_data(self):
        """Get screenshot data instantly from cache"""
        try:
            # Check if data file exists
            if not os.path.exists(self.data_file):
                return {
                    'error': 'No data available yet',
                    'message': 'Background service is preparing data...',
                    'status': 'waiting'
                }
            
            # Read cached data
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Add freshness info
            file_time = os.path.getmtime(self.data_file)
            data['file_age_hours'] = (datetime.now().timestamp() - file_time) / 3600
            data['is_fresh'] = data['file_age_hours'] < 25  # Fresh if less than 25 hours
            
            return data
            
        except Exception as e:
            return {
                'error': f'Error reading cached data: {str(e)}',
                'status': 'error'
            }
    
    def get_service_status(self):
        """Get background service status"""
        try:
            if os.path.exists(self.status_file):
                with open(self.status_file, 'r') as f:
                    return json.load(f)
            else:
                return {
                    'status': 'unknown',
                    'message': 'Service status not available'
                }
        except:
            return {
                'status': 'error',
                'message': 'Could not read service status'
            }
    
    def get_user_count(self, email):
        """Get specific user's screenshot count instantly"""
        data = self.get_cached_data()
        
        if 'error' in data:
            return data
        
        try:
            user_counts = data['data']['user_screenshot_counts']
            
            # Find user (case insensitive)
            for user_email, count in user_counts.items():
                if email.lower() in user_email.lower():
                    return {
                        'user_email': user_email,
                        'screenshot_count': count,
                        'last_updated': data['last_updated'],
                        'status': 'success'
                    }
            
            return {
                'error': f'User {email} not found',
                'available_users': len(user_counts),
                'status': 'not_found'
            }
            
        except Exception as e:
            return {
                'error': f'Error processing user data: {str(e)}',
                'status': 'error'
            }

# Create API instance
api = InstantScreenshotAPI()

# Flask routes for instant API responses
@app.route('/screenshots/all')
def get_all_screenshots():
    """Get all user screenshot counts instantly"""
    return jsonify(api.get_cached_data())

@app.route('/screenshots/user/<email>')
def get_user_screenshots(email):
    """Get specific user's count instantly"""
    return jsonify(api.get_user_count(email))

@app.route('/service/status')
def get_service_status():
    """Get background service status"""
    return jsonify(api.get_service_status())

@app.route('/screenshots/top/<int:limit>')
def get_top_users(limit=10):
    """Get top N users by screenshot count"""
    data = api.get_cached_data()
    
    if 'error' in data:
        return jsonify(data)
    
    try:
        user_counts = data['data']['user_screenshot_counts']
        
        # Sort and limit
        sorted_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)
        top_users = sorted_users[:limit]
        
        return jsonify({
            'top_users': [
                {'email': email, 'count': count} 
                for email, count in top_users
            ],
            'total_users': len(user_counts),
            'last_updated': data['last_updated'],
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error getting top users: {str(e)}',
            'status': 'error'
        })

if __name__ == "__main__":
    print("🚀 INSTANT SCREENSHOT API SERVER")
    print("=" * 40)
    print("📡 Starting Flask server...")
    print("🔗 Endpoints:")
    print("   GET /screenshots/all")
    print("   GET /screenshots/user/<email>")
    print("   GET /screenshots/top/<limit>")
    print("   GET /service/status")
    print("=" * 40)
    
    # Run Flask server
    app.run(host='0.0.0.0', port=5000, debug=False)
