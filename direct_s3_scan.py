#!/usr/bin/env python3
"""
Direct S3 scan to verify begumdamlasen screenshot count
"""
import boto3
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def direct_s3_scan_begumdamlasen():
    """Direct S3 scan to count begumdamlasen screenshots"""
    
    # AWS S3 client with credentials from the API
    s3_client = boto3.client(
        's3',
        aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
        aws_secret_access_key='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',
        region_name='eu-north-1'
    )
    bucket_name = 'ddsfocustime'
    
    # Prefix for begumdamlasen on 2025-09-01
    user_prefix = "users_screenshots/2025-09-01/begumdamlasen_at_gmail.com/"
    
    print(f"🔍 Direct S3 Scan for: {user_prefix}")
    print("=" * 60)
    
    screenshots = []
    all_objects = []
    continuation_token = None
    page_count = 0
    
    try:
        # Scan ALL objects with pagination
        while True:
            page_count += 1
            request_params = {
                'Bucket': bucket_name,
                'Prefix': user_prefix,
                'MaxKeys': 1000
            }
            
            if continuation_token:
                request_params['ContinuationToken'] = continuation_token
            
            print(f"📄 Page {page_count}: Scanning...")
            
            response = s3_client.list_objects_v2(**request_params)
            
            if 'Contents' in response:
                page_objects = response['Contents']
                all_objects.extend(page_objects)
                
                # Count screenshots in this page
                page_screenshots = [obj for obj in page_objects 
                                  if obj['Key'].lower().endswith(('.webp', '.png', '.jpg', '.jpeg'))]
                screenshots.extend(page_screenshots)
                
                print(f"   Found {len(page_objects)} objects, {len(page_screenshots)} screenshots")
                print(f"   Total so far: {len(all_objects)} objects, {len(screenshots)} screenshots")
                
                # Show some sample file paths
                if len(page_screenshots) > 0:
                    print(f"   Sample files:")
                    for i, obj in enumerate(page_screenshots[:3]):
                        size_mb = obj['Size'] / (1024 * 1024)
                        print(f"     {i+1}. {obj['Key'].split('/')[-1]} ({size_mb:.2f} MB)")
            
            # Check if there are more pages
            if response.get('IsTruncated', False):
                continuation_token = response.get('NextContinuationToken')
                print(f"   More data available, continuing to page {page_count + 1}...")
            else:
                print(f"   ✅ Scan complete!")
                break
        
        print("\n" + "=" * 60)
        print("📊 FINAL RESULTS")
        print("=" * 60)
        print(f"Total Objects: {len(all_objects)}")
        print(f"Total Screenshots: {len(screenshots)}")
        print(f"Pages Scanned: {page_count}")
        
        # Calculate total size
        total_size = sum(obj['Size'] for obj in screenshots)
        total_size_mb = total_size / (1024 * 1024)
        print(f"Total Size: {total_size_mb:.2f} MB")
        
        # Group by subfolder
        subfolders = {}
        for obj in screenshots:
            key_parts = obj['Key'].split('/')
            if len(key_parts) > 4:
                subfolder = key_parts[3]  # DDS_EYLÜL_2025_Sanal_Asistanlık_Süreci
                if subfolder not in subfolders:
                    subfolders[subfolder] = 0
                subfolders[subfolder] += 1
        
        print(f"\n📁 Screenshots by Subfolder:")
        for subfolder, count in subfolders.items():
            print(f"  {subfolder}: {count} screenshots")
        
        # Show time range
        if screenshots:
            dates = [obj['LastModified'] for obj in screenshots]
            print(f"\n📅 Date Range:")
            print(f"  First: {min(dates)}")
            print(f"  Last: {max(dates)}")
        
        print(f"\n🆚 COMPARISON:")
        print(f"  API reported: 997 screenshots")
        print(f"  Direct S3 scan: {len(screenshots)} screenshots")
        print(f"  S3 Console showed: 1500/999+ files")
        
        if len(screenshots) > 997:
            print(f"  ✅ SUCCESS: Found {len(screenshots) - 997} additional screenshots!")
        elif len(screenshots) == 997:
            print(f"  ⚠️  Same count as API - need to investigate further")
        else:
            print(f"  ❌ Fewer than API - unexpected")
        
    except Exception as e:
        print(f"❌ Error in direct S3 scan: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 DIRECT S3 SCAN FOR BEGUMDAMLASEN")
    print("This will bypass the API and scan S3 directly")
    print("=" * 60)
    
    direct_s3_scan_begumdamlasen()