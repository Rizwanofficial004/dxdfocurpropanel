#!/usr/bin/env python3
"""
Quick AI Project Status Demo
Shows the categorized projects by status using our AI system
"""

import json
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def display_categorization_results():
    """Display the AI categorization results"""
    try:
        # Read the saved results
        with open('ai_categorization_results.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("🤖 AI PROJECT STATUS CATEGORIZATION RESULTS")
        print("=" * 60)
        
        summary = data.get("summary", {})
        categorized_projects = data.get("categorized_projects", {})
        
        # Status emojis and descriptions
        status_info = {
            "not_started": {"emoji": "🔵", "desc": "Not Started"},
            "in_progress": {"emoji": "🟠", "desc": "In Progress"}, 
            "onhold": {"emoji": "🟡", "desc": "On Hold"},
            "cancel": {"emoji": "🔴", "desc": "Cancelled"},
            "finished": {"emoji": "🟢", "desc": "Finished"}
        }
        
        print("\n📊 SUMMARY:")
        print("-" * 30)
        total = 0
        for status, info in status_info.items():
            count = summary.get(f"{status}_count", 0)
            total += count
            print(f"{info['emoji']} {info['desc']:<12}: {count:>3}")
        print("-" * 30)
        print(f"📋 Total Projects: {total}")
        
        print("\n📝 PROJECT DETAILS BY STATUS:")
        print("=" * 60)
        
        for status, info in status_info.items():
            projects = categorized_projects.get(status, [])
            if projects:
                print(f"\n{info['emoji']} {info['desc'].upper()} ({len(projects)} projects):")
                print("-" * 50)
                for i, project in enumerate(projects[:10], 1):  # Show first 10
                    name = project.get("name", "Unknown")
                    # Truncate long names
                    if len(name) > 60:
                        name = name[:57] + "..."
                    print(f"{i:2d}. {name}")
                    
                if len(projects) > 10:
                    print(f"     ... and {len(projects) - 10} more projects")
        
        # API endpoint information
        print("\n" + "=" * 60)
        print("🔗 YOUR NEW AI API ENDPOINTS:")
        print("=" * 60)
        print("1. GET /api/projects/ai-categorization/")
        print("   → Full categorization with project details")
        print("\n2. GET /api/projects/status-summary/")
        print("   → Quick status counts for dashboard")
        
        print("\n📊 Sample JSON Response:")
        print("-" * 30)
        sample_response = {
            "success": True,
            "total_projects": total,
            "status_summary": summary,
            "ai_powered": True
        }
        print(json.dumps(sample_response, indent=2))
        
        print("\n✅ AI categorization completed successfully!")
        print("🎯 Use these endpoints in your dashboard to show project status!")
        
    except FileNotFoundError:
        print("❌ Results file not found. Please run the AI categorization test first.")
    except Exception as e:
        print(f"❌ Error reading results: {e}")

if __name__ == '__main__':
    display_categorization_results()
