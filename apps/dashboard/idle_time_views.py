from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import requests
from django.conf import settings
from datetime import datetime, timedelta
import json
from collections import defaultdict


class IdleTimeView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Calculate idle times between work sessions for each user.
        Idle time = gap between when user ends work and starts next session.
        """
        try:
            # Get query parameters
            staff_id = request.GET.get('staff_id')  # Filter by specific staff
            date_from = request.GET.get('date_from')  # YYYY-MM-DD format
            date_to = request.GET.get('date_to')      # YYYY-MM-DD format
            min_idle_minutes = float(request.GET.get('min_idle_minutes', 5))  # Minimum idle time to report
            
            # Fetch timesheets from CRM
            timesheets_data = self._fetch_timesheets()
            
            if not timesheets_data:
                return Response({
                    'status': 'error',
                    'message': 'Failed to fetch timesheets from CRM'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Process idle time calculations
            idle_analysis = self._calculate_idle_times(
                timesheets_data, 
                staff_id, 
                date_from, 
                date_to, 
                min_idle_minutes
            )
            
            return Response({
                'status': 'success',
                'message': 'Idle times calculated successfully',
                'filters': {
                    'staff_id': staff_id,
                    'date_from': date_from,
                    'date_to': date_to,
                    'min_idle_minutes': min_idle_minutes
                },
                'data': idle_analysis
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error calculating idle times: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _fetch_timesheets(self):
        """Fetch raw timesheets directly from Perfex CRM API"""
        try:
            headers = {
                'authtoken': settings.CRM_TOKEN,
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{settings.CRM_BASE_URL}/api/timesheets",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"CRM API Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error fetching timesheets: {str(e)}")
            return None
    
    def _calculate_idle_times(self, timesheets_data, staff_id_filter, date_from, date_to, min_idle_minutes):
        """Calculate idle times between work sessions for each user"""
        try:
            # Get staff lookup for names
            staff_lookup = self._fetch_staff_lookup()
            
            # Filter and organize timesheets by staff
            staff_sessions = defaultdict(list)
            processed_count = 0
            skipped_count = 0
            
            print(f"Debug: Starting to process {len(timesheets_data)} timesheets")
            
            for timesheet in timesheets_data:
                try:
                    ts_staff_id = timesheet.get('staff_id')
                    start_time = timesheet.get('start_time')
                    end_time = timesheet.get('end_time')
                    
                    # Skip if no valid times or end time is 0
                    if not start_time or not end_time or str(end_time) == '0' or not ts_staff_id:
                        skipped_count += 1
                        continue
                    
                    # Filter by staff if specified
                    if staff_id_filter and str(ts_staff_id) != str(staff_id_filter):
                        skipped_count += 1
                        continue
                    
                    # Convert timestamps - handle raw Unix timestamps from CRM
                    try:
                        start_timestamp = int(start_time)
                        end_timestamp = int(end_time)
                        
                        # Skip if timestamps are invalid (too old or in future)
                        if start_timestamp < 1000000000 or end_timestamp < 1000000000:
                            skipped_count += 1
                            continue
                        
                        start_dt = datetime.fromtimestamp(start_timestamp)
                        end_dt = datetime.fromtimestamp(end_timestamp)
                        
                        # Skip if end time is before start time
                        if end_dt <= start_dt:
                            skipped_count += 1
                            continue
                        
                    except (ValueError, TypeError) as e:
                        print(f"Error parsing timestamps for entry {timesheet.get('id')}: start={start_time}, end={end_time}, error={e}")
                        skipped_count += 1
                        continue
                    
                    # Filter by date range if specified
                    if date_from:
                        try:
                            date_from_dt = datetime.strptime(date_from, '%Y-%m-%d')
                            if start_dt.date() < date_from_dt.date():
                                skipped_count += 1
                                continue
                        except ValueError:
                            pass
                    
                    if date_to:
                        try:
                            date_to_dt = datetime.strptime(date_to, '%Y-%m-%d')
                            if start_dt.date() > date_to_dt.date():
                                skipped_count += 1
                                continue
                        except ValueError:
                            pass
                    
                    # Add to staff sessions
                    staff_sessions[ts_staff_id].append({
                        'id': timesheet.get('id'),
                        'task_id': timesheet.get('task_id'),
                        'start_time': start_dt,
                        'end_time': end_dt,
                        'note': timesheet.get('note', ''),
                        'is_system_idle': 'Auto-paused due to' in str(timesheet.get('note', ''))
                    })
                    processed_count += 1
                    
                except Exception as e:
                    print(f"Error processing timesheet {timesheet.get('id')}: {str(e)}")
                    skipped_count += 1
                    continue
            
            print(f"Debug: Processed {processed_count} timesheets, skipped {skipped_count}")
            print(f"Debug: Found {len(staff_sessions)} staff with valid sessions")
            
            # Calculate idle times for each staff member
            idle_analysis = {
                'idle_entries': [],
                'summary': {
                    'total_idle_entries': 0,
                    'total_idle_hours': 0,
                    'staff_analyzed': len(staff_sessions)
                }
            }
            
            all_idle_entries = []
            
            for staff_id, sessions in staff_sessions.items():
                # Sort sessions by start time
                sessions.sort(key=lambda x: x['start_time'])
                
                staff_name = staff_lookup.get(staff_id, f"Staff {staff_id}")
                
                print(f"Debug: Processing {len(sessions)} sessions for staff {staff_id}")
                
                # Calculate gaps between consecutive work sessions
                for i in range(len(sessions) - 1):
                    current_session = sessions[i]
                    next_session = sessions[i + 1]
                    
                    # Only calculate idle if next session starts after current session ends
                    idle_start = current_session['end_time']
                    idle_end = next_session['start_time']
                    
                    # Only count if there's a meaningful gap
                    if idle_end > idle_start:
                        idle_duration = idle_end - idle_start
                        idle_minutes = idle_duration.total_seconds() / 60
                        
                        # Apply 3-minute threshold and maximum reasonable limit (24 hours)
                        if idle_minutes >= min_idle_minutes and idle_minutes <= (24 * 60):
                            # Simple entry with only requested fields
                            idle_entry = {
                                'staff_name': staff_name,
                                'staff_task': f"Task {current_session['task_id']} → Task {next_session['task_id']}",
                                'start_time': idle_start.strftime('%Y-%m-%d %H:%M:%S'),
                                'end_time': idle_end.strftime('%Y-%m-%d %H:%M:%S'),
                                'idle_time_minutes': round(idle_minutes, 2),
                                'idle_time_hours': round(idle_minutes / 60, 2),
                                'date': idle_start.strftime('%Y-%m-%d'),
                                'staff_id': staff_id
                            }
                            
                            all_idle_entries.append(idle_entry)
                            
                            print(f"Debug: Found idle period for staff {staff_id}: {idle_minutes:.2f} minutes")
            
            # Sort by idle time (longest first)
            all_idle_entries.sort(key=lambda x: x['idle_time_minutes'], reverse=True)
            
            # Update summary
            if all_idle_entries:
                total_idle_seconds = sum(entry['idle_time_minutes'] * 60 for entry in all_idle_entries)
                idle_analysis['summary'].update({
                    'total_idle_entries': len(all_idle_entries),
                    'total_idle_hours': round(total_idle_seconds / 3600, 2),
                    'average_idle_minutes': round(sum(entry['idle_time_minutes'] for entry in all_idle_entries) / len(all_idle_entries), 2)
                })
            
            idle_analysis['idle_entries'] = all_idle_entries
            
            print(f"Debug: Final result - {len(all_idle_entries)} idle entries found")
            
            return idle_analysis
            
        except Exception as e:
            print(f"Error calculating idle times: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'staff_idle_times': [], 'summary': {}}
    
    def _fetch_staff_lookup(self):
        """Fetch staff data for name lookup"""
        try:
            headers = {
                'authtoken': settings.CRM_TOKEN,
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{settings.CRM_BASE_URL}/api/staffs",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                staff_data = response.json()
                lookup = {}
                for staff in staff_data:
                    lookup[staff.get('staffid')] = f"{staff.get('firstname', '')} {staff.get('lastname', '')}".strip()
                return lookup
            
        except Exception as e:
            print(f"Error fetching staff lookup: {str(e)}")
        
        return {}