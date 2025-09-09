#!/usr/bin/env python3
"""
Test script to verify screenshot proxy URL generation
This script tests how S3 URLs are converted to proxy URLs to avoid CORS issues.
"""

# Sample S3 URL from the API response
s3_url = "https://ddsfocustime.s3.amazonaws.com/users_screenshots/2025-09-01/nawaz_at_dxdglobal.com/2025-09-01_17-21-51.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARSU6EUUWMQ5I2JWC%2F20250909%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250909T162735Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=348c41538b4158d3d7817f4936f9a8faabb588a6924aae4426fe8e7fd8daa347"

print("🧪 Testing Screenshot Proxy URL Generation")
print("=" * 60)

print(f"📤 Original S3 URL:")
print(f"   {s3_url}")
print()

# Simulate the proxy URL generation logic
base_url = "https://dxdtime.ddsolutions.io"
proxy_endpoint = "/api/proxy/screenshot/"

# Remove AWS signature parameters and extract just the S3 path
s3_base_url = s3_url.split('?')[0]  # Remove query parameters
s3_path = s3_base_url.split('ddsfocustime.s3.amazonaws.com/')[1]
proxy_url = f"{base_url}{proxy_endpoint}{s3_path}"

print(f"📥 Generated Proxy URL:")
print(f"   {proxy_url}")
print()

print(f"🔍 URL Components:")
print(f"   Base URL: {base_url}")
print(f"   Proxy Endpoint: {proxy_endpoint}")
print(f"   S3 Path: {s3_path}")
print()

print("✅ Proxy URL Benefits:")
print("   • Avoids CORS restrictions")
print("   • No AWS signature expiration")
print("   • Consistent access through backend")
print("   • Better error handling")

# Test with different sample URLs
sample_urls = [
    "https://ddsfocustime.s3.amazonaws.com/users_screenshots/2025-09-09/haseebcodejourney_at_gmail.com/2025-09-09_17-05-26.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256",
    "https://ddsfocustime.s3.amazonaws.com/users_screenshots/2025-09-01/kiranaiza4_at_gmail.com/2025-09-01_17-54-52.webp"
]

print(f"\n🔄 Testing Additional URLs:")
for i, url in enumerate(sample_urls, 1):
    s3_path = url.split('?')[0].split('ddsfocustime.s3.amazonaws.com/')[1]
    proxy_url = f"{base_url}{proxy_endpoint}{s3_path}"
    print(f"   {i}. {proxy_url}")

print(f"\n✅ Screenshot proxy URL generation test completed!")
