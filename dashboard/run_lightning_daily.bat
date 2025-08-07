@echo off
cd /d "C:\Users\DDS\Desktop\New folder"
echo %date% %time% - Lightning count starting... >> lightning_daily.log
python lightning_daily_counter.py >> lightning_daily.log 2>&1
echo %date% %time% - Lightning count completed >> lightning_daily.log
