#!/usr/bin/env python3
"""
Simple Project Names and Count API
Returns just project names and total count as requested
"""

import requests
import json

# CRM Configuration
CRM_BASE_URL = "https://crm.deluxebilisim.com/api"
CRM_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o"

def get_project_names_and_count():
    """Get project names and total count"""
    try:
        headers = {
            'authtoken': CRM_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'DDS-Focus-Time-Dashboard/1.0'
        }
        
        print("🔍 Fetching projects from CRM...")
        response = requests.get(f"{CRM_BASE_URL}/projects", headers=headers, timeout=30)
        
        if response.status_code == 200:
            projects = response.json()
            
            # Extract just project names
            project_names = []
            for project in projects:
                project_names.append({
                    "id": project.get("id"),
                    "name": project.get("name")
                })
            
            # Return simple response
            result = {
                "total_projects": len(projects),
                "project_names": project_names
            }
            
            return result
        else:
            return {
                "error": f"CRM API returned status code: {response.status_code}",
                "total_projects": 0,
                "project_names": []
            }
            
    except Exception as e:
        return {
            "error": f"Failed to fetch projects: {str(e)}",
            "total_projects": 0,
            "project_names": []
        }

def main():
    """Main function to get and display project names and count"""
    print("📋 PROJECT NAMES AND COUNT")
    print("=" * 50)
    
    result = get_project_names_and_count()
    
    if "error" in result:
        print(f"❌ Error: {result['error']}")
    else:
        print(f"✅ Total Projects: {result['total_projects']}")
        print("\n📝 Project Names:")
        print("-" * 30)
        
        for i, project in enumerate(result['project_names'], 1):
            print(f"{i:3d}. {project['name']} (ID: {project['id']})")
    
    print("=" * 50)
    
    # Also save to JSON file for easy access
    with open('project_names_and_count.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print("💾 Results saved to: project_names_and_count.json")

if __name__ == '__main__':
    main()
