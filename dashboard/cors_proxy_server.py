#!/usr/bin/env python3
"""
CORS Proxy Server to fix frontend API access issues
This server acts as a proxy to add proper CORS headers
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)

# Configure CORS to allow your frontend
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://192.168.0.161:5173",  # Your current frontend URL
    "http://192.168.0.161:*",     # Allow any port on your local IP
])

@app.route('/api/dashboard/employees/enhanced/', methods=['GET', 'OPTIONS'])
def proxy_employees():
    """Proxy the employees API with proper CORS headers"""
    
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', '*')
        response.headers.add('Access-Control-Allow-Methods', '*')
        return response
    
    try:
        # Get query parameters from the original request
        params = dict(request.args)
        
        # Make request to the actual API
        api_url = "http://dxdtime.ddsolutions.io/api/dashboard/employees/enhanced/"
        
        print(f"🔄 Proxying request to: {api_url}")
        print(f"📋 Parameters: {params}")
        
        # Forward the request to the real API
        response = requests.get(api_url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Successfully fetched {len(data.get('results', []))} employees")
            return jsonify(data)
        else:
            print(f"❌ API returned status {response.status_code}")
            return jsonify({
                'error': f'API returned status {response.status_code}',
                'message': response.text
            }), response.status_code
            
    except requests.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch employee data',
            'message': str(e)
        }), 500
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'CORS Proxy Server is running',
        'timestamp': str(request.headers.get('Date', 'N/A'))
    })

if __name__ == '__main__':
    print("🚀 Starting CORS Proxy Server...")
    print("📡 This server will proxy API requests with proper CORS headers")
    print("🌐 Frontend should connect to: http://localhost:5000/api/dashboard/employees/enhanced/")
    print("=" * 80)
    
    app.run(
        host='0.0.0.0',  # Allow access from your local network
        port=5000,
        debug=True
    )
