#!/usr/bin/env python3
"""
Database Explorer - Step 1
Connect to MySQL database and explore all tables and structure
"""

import mysql.connector
import json
from datetime import datetime

# Database Configuration
DB_CONFIG = {
    'host': '92.113.22.65',
    'user': 'u906714182_sqlrrefdvdv', 
    'password': '3@6*t:lU',
    'database': 'u906714182_sqlrrefdvdv',
    'port': 3306
}

def explore_database():
    """Step 1: Explore database structure"""
    print("🔍 DATABASE EXPLORATION - STEP 1")
    print("=" * 60)
    print(f"Host: {DB_CONFIG['host']}")
    print(f"Database: {DB_CONFIG['database']}")
    print(f"Time: {datetime.now().isoformat()}")
    print("-" * 60)
    
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("✅ Database connection successful!")
        
        # Get all tables
        print("\n📋 DISCOVERING ALL TABLES:")
        print("-" * 40)
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        table_info = {}
        
        for (table_name,) in tables:
            print(f"\n🔸 Table: {table_name}")
            
            # Get table structure
            cursor.execute(f"DESCRIBE {table_name}")
            columns = cursor.fetchall()
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cursor.fetchone()[0]
            
            print(f"   📊 Rows: {row_count}")
            print(f"   📝 Columns: {len(columns)}")
            
            # Store table info
            table_info[table_name] = {
                'row_count': row_count,
                'columns': []
            }
            
            # Show columns
            for column in columns:
                field_name = column[0]
                field_type = column[1]
                is_null = column[2]
                key = column[3]
                default = column[4]
                extra = column[5]
                
                print(f"     • {field_name} ({field_type})")
                
                table_info[table_name]['columns'].append({
                    'name': field_name,
                    'type': field_type,
                    'null': is_null,
                    'key': key,
                    'default': default,
                    'extra': extra
                })
        
        # Show sample data from each table
        print("\n📊 SAMPLE DATA FROM EACH TABLE:")
        print("=" * 60)
        
        for table_name in table_info.keys():
            print(f"\n🔸 {table_name} - Sample Data:")
            print("-" * 40)
            
            try:
                # Get first 3 rows
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
                sample_rows = cursor.fetchall()
                
                if sample_rows:
                    # Get column names
                    cursor.execute(f"DESCRIBE {table_name}")
                    columns = [col[0] for col in cursor.fetchall()]
                    
                    for i, row in enumerate(sample_rows, 1):
                        print(f"   Row {i}:")
                        for j, value in enumerate(row):
                            if j < len(columns):
                                # Truncate long values
                                display_value = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
                                print(f"     {columns[j]}: {display_value}")
                        print()
                else:
                    print("     (No data)")
                    
            except Exception as e:
                print(f"     Error reading sample data: {e}")
        
        # Save structure to file
        with open('database_structure.json', 'w', encoding='utf-8') as f:
            json.dump(table_info, f, indent=2, default=str)
        
        print("\n💾 Database structure saved to: database_structure.json")
        
        # Summary
        print(f"\n📋 SUMMARY:")
        print("-" * 30)
        print(f"Total Tables: {len(table_info)}")
        total_rows = sum(info['row_count'] for info in table_info.values())
        print(f"Total Rows: {total_rows}")
        
        # Most important tables (by row count)
        sorted_tables = sorted(table_info.items(), key=lambda x: x[1]['row_count'], reverse=True)
        print(f"\n🏆 LARGEST TABLES:")
        for table_name, info in sorted_tables[:5]:
            print(f"   {table_name}: {info['row_count']} rows")
        
        cursor.close()
        connection.close()
        
        return table_info
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return None

def identify_key_tables(table_info):
    """Step 2: Identify key tables for API"""
    print(f"\n🎯 IDENTIFYING KEY TABLES FOR API:")
    print("=" * 50)
    
    if not table_info:
        print("❌ No table information available")
        return
    
    # Look for common CRM/project tables
    key_patterns = [
        'project', 'user', 'client', 'customer', 'task', 'status', 
        'employee', 'member', 'contact', 'company', 'order', 'invoice'
    ]
    
    key_tables = []
    
    for table_name, info in table_info.items():
        table_lower = table_name.lower()
        
        # Check if table name contains key patterns
        is_key_table = any(pattern in table_lower for pattern in key_patterns)
        
        # Also consider tables with significant data
        has_data = info['row_count'] > 0
        
        if is_key_table or has_data:
            key_tables.append({
                'name': table_name,
                'rows': info['row_count'],
                'columns': len(info['columns']),
                'priority': 'high' if is_key_table and has_data else 'medium'
            })
    
    # Sort by priority and row count
    key_tables.sort(key=lambda x: (x['priority'] == 'high', x['rows']), reverse=True)
    
    print("🔑 KEY TABLES IDENTIFIED:")
    for table in key_tables[:10]:  # Show top 10
        priority_icon = "🔥" if table['priority'] == 'high' else "📋"
        print(f"   {priority_icon} {table['name']} - {table['rows']} rows, {table['columns']} columns")
    
    return key_tables

if __name__ == '__main__':
    print("🚀 DATABASE EXPLORATION STARTING...")
    print("This will help us understand your database structure")
    print("for creating the comprehensive API")
    print()
    
    # Step 1: Explore database
    table_info = explore_database()
    
    if table_info:
        # Step 2: Identify key tables
        key_tables = identify_key_tables(table_info)
        
        print(f"\n✅ STEP 1 COMPLETED!")
        print("Next: We'll create AI-powered queries and build the unified API")
        print(f"Time: {datetime.now().isoformat()}")
    else:
        print("❌ Database exploration failed")
