def generate_proxy_url(s3_key, base_url="http://127.0.0.1:8000"):
    """
    Generate a proxy URL for serving S3 images through Django
    
    Args:
        s3_key (str): The S3 object key (e.g., "screenshots/user@example.com/task/image.webp")
        base_url (str): Base URL of the Django server
    
    Returns:
        str: Proxy URL for the image
    """
    # Remove 'screenshots/' prefix since it's added in the proxy endpoint
    if s3_key.startswith('screenshots/'):
        proxy_path = s3_key[12:]  # Remove 'screenshots/' prefix
    else:
        proxy_path = s3_key
    
    proxy_url = f"{base_url}/api/proxy/screenshot/{proxy_path}"
    print(f"[🔗] Generated proxy URL: {proxy_url}")
    return proxy_url
