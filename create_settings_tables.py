#!/usr/bin/env python3
"""
Django Database Table Creation Script
Creates the settings tables using Django's database connection
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from django.db import connection

def create_settings_tables():
    """Create the settings tables using Django's database connection"""
    
    sql_commands = [
        """
        CREATE TABLE IF NOT EXISTS `application_settings` (
            `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, 
            `key` varchar(100) NOT NULL UNIQUE,
            `value` longtext NOT NULL, 
            `setting_type` varchar(20) NOT NULL, 
            `category` varchar(50) NOT NULL, 
            `description` longtext NOT NULL, 
            `is_public` bool NOT NULL, 
            `is_editable` bool NOT NULL, 
            `created_at` datetime(6) NOT NULL, 
            `updated_at` datetime(6) NOT NULL
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS `system_credentials` (
            `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, 
            `name` varchar(100) NOT NULL UNIQUE, 
            `credential_type` varchar(20) NOT NULL, 
            `description` longtext NOT NULL, 
            `api_key` longtext NOT NULL, 
            `secret_key` longtext NOT NULL, 
            `access_key` longtext NOT NULL, 
            `username` varchar(255) NOT NULL, 
            `password` longtext NOT NULL, 
            `host` varchar(255) NOT NULL, 
            `port` integer NULL, 
            `database_name` varchar(255) NOT NULL, 
            `additional_config` json NOT NULL, 
            `is_active` bool NOT NULL, 
            `is_production` bool NOT NULL, 
            `created_at` datetime(6) NOT NULL, 
            `updated_at` datetime(6) NOT NULL, 
            `created_by_id` integer NULL
        );
        """,
        
        """
        CREATE TABLE IF NOT EXISTS `ui_settings` (
            `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY, 
            `setting_name` varchar(100) NOT NULL, 
            `is_global` bool NOT NULL, 
            `font_family` varchar(100) NOT NULL, 
            `font_size` varchar(10) NOT NULL, 
            `primary_color` varchar(7) NOT NULL, 
            `secondary_color` varchar(7) NOT NULL, 
            `background_color` varchar(7) NOT NULL, 
            `text_color` varchar(7) NOT NULL, 
            `theme_mode` varchar(10) NOT NULL, 
            `sidebar_collapsed` bool NOT NULL, 
            `created_at` datetime(6) NOT NULL, 
            `updated_at` datetime(6) NOT NULL, 
            `is_active` bool NOT NULL, 
            `user_id` integer NULL UNIQUE
        );
        """
    ]
    
    try:
        with connection.cursor() as cursor:
            print("🔌 Using Django database connection...")
            
            # Execute each SQL command
            for i, sql in enumerate(sql_commands, 1):
                try:
                    cursor.execute(sql)
                    table_name = ["application_settings", "system_credentials", "ui_settings"][i-1]
                    print(f"✅ Table '{table_name}' created successfully!")
                except Exception as e:
                    print(f"❌ Error creating table {i}: {e}")
            
            # Check if tables exist
            cursor.execute("SHOW TABLES LIKE 'application_settings'")
            result1 = cursor.fetchone()
            
            cursor.execute("SHOW TABLES LIKE 'system_credentials'")
            result2 = cursor.fetchone()
            
            cursor.execute("SHOW TABLES LIKE 'ui_settings'")
            result3 = cursor.fetchone()
            
            if result1 and result2 and result3:
                print("🎉 All settings tables created successfully!")
                print("   - application_settings")
                print("   - system_credentials") 
                print("   - ui_settings")
                return True
            else:
                print("⚠️ Some tables may not have been created properly")
                return False
                
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

if __name__ == "__main__":
    print("🗄️ Creating Settings Tables with Django...")
    print("=" * 50)
    success = create_settings_tables()
    
    if success:
        print("\n🚀 Now you can test the APIs!")
        print("Run: python test_settings_apis.py")
    else:
        print("\n❌ Table creation failed. Check the errors above.")
