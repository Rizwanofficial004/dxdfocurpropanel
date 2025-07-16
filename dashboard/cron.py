import logging
from dashboard.utils import get_all_user
from dashboard.utils import convert_browser_date_to_iso
from datetime import date
from dashboard.get_employee_screenshots import scan_and_download_screenshots
from dashboard.get_employee_screenshots import generate_predesigned_url
from dashboard.utils import process_images_in_batches
from .models import User_Logs
logger = logging.getLogger('django_cron')

def my_scheduled_job():
    # fetch all user
    email_user = ''
    # today = date.today()
    today = '2025-06-10'
    try:
        logger.info('-----------------------------NEW CRON JOB LISTING ---------------------') 
        all_user = get_all_user()
        
        bucket_name = 'ddsfocustime'
        for obj in all_user:
            try:
                email_user = obj["email"]
                staff_id = obj["staffid"]
                all_data = scan_and_download_screenshots(obj["email"], today, True)
                image_url = [all_data.get("image_urls")]
                image_urls = image_url[0]
                screenshots_base64 = []
                if len(image_urls) > 0:
                    
                    
                    for obj in image_urls:
                        try:
                            key = obj['Key']
                            # Step 2: Filter by date in key
                        
                                # Step 3: Generate presigned URL
                            if key and key.lower().endswith((".webp", ".png", ".jpg", ".jpeg")):
                                url = generate_predesigned_url(bucket_name,key)
                                # logger.info(url)
                           
                                # Use in OpenAI payload
                                # full_url = f"data:image/webp;base64,{base64_img}"
                                if(url):
                                    screenshots_base64.append({
                                        "type": "image_url",
                                        "image_url": {
                                            "url": url
                                        }
                                    })
                                    # Then send to OpenAI here
                            else:
                                logger.info("Skipping invalid image {email_user}")
                        except Exception as e:
                            logger.info(e)
                            logger.info(f"Error1: ${email_user} on date: ${today}")
                            continue 
                else:
                    logger.info(f"Error2: {email_user} on date: {today}: No Screen shot available ")
                    continue          
            except Exception as e:
                logger.info(e)
                logger.info(f"Error3: ${email_user} on date: ${today}") 
                continue                
                    
            logger.info(email_user)                
            logger.info(today)
            focus_timeline = process_images_in_batches(screenshots_base64,80)
            
            obj, created = User_Logs.objects.update_or_create(
                email=email_user,
                date=today,
                defaults={
                    'staffid': staff_id,
                    'jsonlog': focus_timeline
                }
            )

            if created:
                message = 'New log created successfully'
                
            else:
                message = 'Existing log updated successfully'
            logger.info(message)
            logger.info(focus_timeline)
            logger.info('------------END OF THE FUNCTION --------------------')
        logger.info("Cron job executed successfully")
    except Exception as e:
        logger.info(e)
        logger.info(f"Error4: ${email_user} on date: ${today}")
        