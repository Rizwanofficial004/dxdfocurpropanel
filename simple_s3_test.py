#!/usr/bin/env python3
"""
Simple S3 API Test - No Initial Scan
"""

import http.server
import socketserver
import json
from urllib.parse import urlparse, parse_qs
import boto3
from datetime import datetime, timezone
import traceback

class SimpleS3Handler(http.server.BaseHTTPRequestHandler):
    
    def do_GET(self):
        try:
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            
            # Add CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            if path == '/':
                response = {
                    "status": "success",
                    "message": "Simple S3 API Test Server",
                    "endpoints": [
                        "/api/test",
                        "/api/s3/basic-info"
                    ]
                }
            elif path == '/api/test':
                response = {
                    "status": "success",
                    "message": "API test endpoint working",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            elif path == '/api/s3/basic-info':
                # Test S3 connection without scanning
                try:
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                        aws_secret_access_key='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',
                        region_name='us-east-1'
                    )
                    
                    # Just check if we can access the bucket
                    bucket_response = s3_client.head_bucket(Bucket='ddsfocustime')
                    
                    response = {
                        "status": "success",
                        "message": "S3 connection successful",
                        "bucket": "ddsfocustime",
                        "region": "us-east-1",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                    
                except Exception as e:
                    response = {
                        "status": "error",
                        "message": f"S3 connection failed: {str(e)}",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
            else:
                response = {
                    "status": "error",
                    "message": "Endpoint not found",
                    "path": path
                }
            
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        except Exception as e:
            error_response = {
                "status": "error",
                "message": str(e),
                "traceback": traceback.format_exc()
            }
            self.wfile.write(json.dumps(error_response, indent=2).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress default logging
        return

def run_simple_server(port=9001):
    try:
        with socketserver.TCPServer(("", port), SimpleS3Handler) as httpd:
            print(f"✅ Simple S3 Test Server running on port {port}")
            print(f"🌐 Test URL: http://localhost:{port}/")
            print(f"🔍 S3 Test: http://localhost:{port}/api/s3/basic-info")
            print("🎯 Press Ctrl+C to stop")
            print()
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {str(e)}")

if __name__ == "__main__":
    run_simple_server()
