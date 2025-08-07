"""
Quick S3 Historical Data Scanner
This script scans your S3 bucket to show what historical data is available
so we can understand the date ranges and then populate the database accordingly.
"""

import boto3
from datetime import datetime
from collections import defaultdict

def scan_s3_quick():
    """Quick scan of S3 to show available date ranges"""
    print("🔍 Quick S3 Historical Data Scan")
    print("=" * 50)
    
    try:
        s3_client = boto3.client('s3')
        bucket_name = 'ddsfocustime'
        
        # Test with one user first
        test_users = [
            'ilahe.avci2004@gmail.com',
            'tugbacalik84@gmail.com', 
            'begumdamlasen@gmail.com'
        ]
        
        all_dates = set()
        user_data = {}
        
        for email in test_users:
            print(f"\n📂 Scanning {email}...")
            folder_prefix = f'screenshots/{email.lower()}/'
            
            try:
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=folder_prefix,
                    MaxKeys=100  # Limit for quick scan
                )
                
                if 'Contents' in response:
                    dates_found = set()
                    for obj in response['Contents']:
                        filename = obj['Key'].split('/')[-1]
                        if filename.endswith('.webp') and '_' in filename:
                            try:
                                # Extract date from filename: 2025-06-16_15-44-53_2025-06-16_15-44-52.webp
                                date_part = filename.split('_')[0]
                                date_obj = datetime.strptime(date_part, '%Y-%m-%d').date()
                                dates_found.add(date_obj)
                                all_dates.add(date_obj)
                            except:
                                continue
                    
                    user_data[email] = sorted(dates_found)
                    print(f"   📅 Found dates: {len(dates_found)} unique dates")
                    if dates_found:
                        print(f"   🗓️  Range: {min(dates_found)} to {max(dates_found)}")
                else:
                    print("   ❌ No files found")
                    
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        print(f"\n📊 SUMMARY:")
        print(f"   📅 Total unique dates found: {len(all_dates)}")
        if all_dates:
            print(f"   🗓️  Overall date range: {min(all_dates)} to {max(all_dates)}")
            
            print(f"\n📈 All dates found:")
            for date_obj in sorted(all_dates):
                print(f"      {date_obj}")
        
        return all_dates, user_data
        
    except Exception as e:
        print(f"❌ S3 Connection Error: {e}")
        return set(), {}

if __name__ == "__main__":
    all_dates, user_data = scan_s3_quick()
    
    if all_dates:
        print(f"\n✅ Found historical data! You have {len(all_dates)} dates of screenshot data.")
        print(f"📊 Date range filtering will work once we load this into your database.")
        print(f"\n🔧 Next step: Run the historical data loader to populate your database.")
    else:
        print(f"\n❌ No historical data found. Check your S3 bucket configuration.")
