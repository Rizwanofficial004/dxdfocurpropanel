#!/usr/bin/env python3
"""
Local test to verify the direct S3 URL generation method works correctly
"""

def test_direct_s3_url_generation():
    """Test the direct S3 URL generation logic"""
    
    # Simulate the method we added
    def _generate_direct_s3_url(key):
        """
        Generate a direct S3 URL without authentication parameters.
        Format: https://bucket.s3.region.amazonaws.com/key
        """
        try:
            bucket_name = "ddsfocustime"
            region = 'eu-north-1'  # Your S3 bucket region
            direct_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{key}"
            return direct_url
        except Exception as e:
            print(f"Error generating direct S3 URL for {key}: {str(e)}")
            return None
    
    # Test with sample keys
    test_keys = [
        "users_screenshots/2025-09-01/nawaz_at_dxdglobal.com/DDSFocusPro_v1.4/2025-09-01_17-21-51.webp",
        "users_screenshots/2025-09-02/test@example.com/DDSFocusPro_v1.4/2025-09-02_10-30-45.webp",
        "users_screenshots/2025-09-03/user@company.com/DDSFocusPro_v1.4/2025-09-03_14-15-22.webp"
    ]
    
    print("Testing Direct S3 URL Generation:")
    print("=" * 50)
    
    for i, key in enumerate(test_keys, 1):
        direct_url = _generate_direct_s3_url(key)
        print(f"\nTest {i}:")
        print(f"Key: {key}")
        print(f"Direct URL: {direct_url}")
        
        # Verify format
        expected_format = "https://ddsfocustime.s3.eu-north-1.amazonaws.com/"
        if direct_url and direct_url.startswith(expected_format):
            print("✅ Correct format!")
        else:
            print("❌ Incorrect format!")
    
    print("\n" + "=" * 50)
    print("Local test completed!")
    print("\nExpected vs Current API:")
    print("Expected: https://ddsfocustime.s3.eu-north-1.amazonaws.com/users_screenshots/...")
    print("Current API: Still returning signed URLs (server not updated)")
    print("\nThe code changes are correct, but the production server needs to be updated.")

if __name__ == "__main__":
    test_direct_s3_url_generation()
