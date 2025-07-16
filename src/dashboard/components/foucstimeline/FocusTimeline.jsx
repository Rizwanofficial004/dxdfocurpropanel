// ActivityTimeline.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TextField, Autocomplete, CircularProgress, Button, Box } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';
import dayjs from 'dayjs';
import axios from 'axios';

const Wrapper = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const FilterSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const FilterTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
`;

const FilterItem = styled.div`
  background: ${props => props.selected ? '#0364ff' : 'white'};
  color: ${props => props.selected ? 'white' : '#374151'};
  border: 1px solid ${props => props.selected ? '#0364ff' : '#d1d5db'};
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: ${props => props.selected ? '#0364ff' : '#f3f4f6'};
    border-color: ${props => props.selected ? '#0364ff' : '#9ca3af'};
  }
`;

const FilterCount = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background: ${props => props.selected ? 'rgba(255,255,255,0.2)' : '#e5e7eb'};
  color: ${props => props.selected ? 'white' : '#6b7280'};
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
`;

const BreadcrumbItem = styled.span`
  color: ${props => props.active ? '#0364ff' : '#6b7280'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    color: ${props => props.clickable ? '#0364ff' : props.active ? '#0364ff' : '#6b7280'};
  }
`;

const SearchInfo = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #0369a1;
`;

const LogItem = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const LogImage = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
`;

const LogContent = styled.div`
  flex: 1;
`;

const LogTimestamp = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const LogAction = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const LogDetails = styled.div`
  font-size: 13px;
  color: #4b5563;
`;

const CategorySection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CategoryTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const CategoryCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #0364ff;
  }
`;

const CategoryName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CategoryTime = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #0364ff;
`;

const CategoryIcon = styled.span`
  font-size: 20px;
`;

const ProgramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
`;

const ProgramItem = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ProgramName = styled.div`
  font-weight: 500;
  color: #374151;
  font-size: 13px;
  flex: 1;
  margin-right: 8px;
`;

const ProgramTime = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 12px;
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient || '#667eea 0%, #764ba2 100%'});
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const SearchBox = styled(TextField)`
  width: 240px;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 20px;
  border-left: 2px dashed #e5e7eb;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Icon = styled.div`
  position: absolute;
  left: -12px;
  top: 0;
  background: #8b5cf6;
  color: white;
  border-radius: 50%;
  padding: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const TitleText = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const Media = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 6px;

  img {
    border-radius: 6px;
    width: 48px;
    height: 48px;
    object-fit: cover;
  }
`;

const Badge = styled.div`
  background: #22c55e;
  color: white;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  margin-left: auto;
`;

const FocusTimeline = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  
  // Filter states for hierarchical filtering
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserSelected, setIsUserSelected] = useState(false);
  
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskSelected, setIsTaskSelected] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  
  const [fileLogs, setFileLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  // State for JSON file content display
  const [isJsonData, setIsJsonData] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  
  const [backendStatus, setBackendStatus] = useState('unknown');

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await axios.get('https://dxdtime.ddsolutions.io/api/logs/search/?search=test&limit=5', {
          timeout: 5000
        });
        setBackendStatus('connected');
      } catch (err) {
        setBackendStatus('disconnected');
      }
    };
    checkBackendStatus();
  }, []);

  // Fetch user suggestions
  const fetchSearchSuggestions = async (query) => {
    if (!query || query.length < 1) {
      setSearchSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const response = await axios.get(`https://dxdtime.ddsolutions.io/api/logs/search/?search=${encodeURIComponent(query)}&limit=10`, {
        timeout: 8000
      });
      
      let suggestions = [];
      
      // Handle the actual API response structure
      if (response.data?.success && response.data?.data?.users && Array.isArray(response.data.data.users)) {
        suggestions = response.data.data.users.map(user => ({
          label: user.display_name ? `${user.display_name} (${user.email})` : user.email,
          value: user.email || user.username,
          email: user.email,
          display_name: user.display_name || user.username,
          username: user.username,
          screenshot_count: user.log_statistics?.total_files || 0,
          staff_id: user.staff_id,
          profile_image: user.profile_image,
          folder_name: user.folder_name,
          has_logs: user.has_logs,
          total_size_mb: user.log_statistics?.total_size_mb,
          date_folders: user.log_statistics?.date_folders || [],
          source: user.source
        }));
      }
      
      setSearchSuggestions(suggestions);
    } catch (err) {
      console.error('API Error:', err);
      // Fallback test data
      const testUsers = [
        {
          label: 'Haseeb Developer (haseebcodejourney@gmail.com)',
          value: 'haseebcodejourney@gmail.com',
          email: 'haseebcodejourney@gmail.com',
          display_name: 'Haseeb Developer',
          username: 'haseebcodejourney',
          screenshot_count: 94,
          staff_id: 'HAS001',
          profile_image: null,
          folder_name: 'haseebcodejourney_at_gmail.com',
          has_logs: true,
          total_size_mb: 15.24,
          date_folders: ['DDSFocusPro_v1_4', 'DDSFocusPro_v1_5'],
          source: 'S3_Logs'
        },
        {
          label: 'Mervegucluu 0044 (mervegucluu.0044@gmail.com)',
          value: 'mervegucluu.0044@gmail.com',
          email: 'mervegucluu.0044@gmail.com',
          display_name: 'Mervegucluu 0044',
          username: 'mervegucluu.0044',
          screenshot_count: 5000,
          staff_id: 'MERVEG',
          has_logs: true,
          total_size_mb: 45.2,
          date_folders: ['2025_Project1', '2025_Project2'],
          source: 'S3_Logs'
        }
      ];
      
      const filteredUsers = testUsers.filter(user => {
        const query_lower = query.toLowerCase();
        return user.display_name.toLowerCase().includes(query_lower) ||
               user.email.toLowerCase().includes(query_lower) ||
               user.username.toLowerCase().includes(query_lower) ||
               user.staff_id.toLowerCase().includes(query_lower);
      });
      
      setSearchSuggestions(filteredUsers);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Fetch tasks/categories for selected user
  const fetchUserTasks = async (user) => {
    if (!user) return;
    
    try {
      setLoadingTasks(true);
      
      // Use date_folders from the API response as tasks if available
      if (user.date_folders && user.date_folders.length > 0) {
        const tasksFromFolders = user.date_folders.map((folder, index) => ({
          name: folder,
          count: Math.floor(Math.random() * 20) + 5, // Random program count for demo
          time: `${(Math.random() * 30 + 10).toFixed(1)} mins`, // Random time for demo
          category: folder,
          type: 'project_folder',
          id: folder.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          folder_path: `${user.folder_name}/${folder}`
        }));
        
        setAvailableTasks(tasksFromFolders);
      } else {
        // Fallback to activity categories
        const tasksFromCategories = Object.entries(activityData.categories).map(([category, time]) => {
          const programsInCategory = Object.entries(activityData.programs).filter(([program]) => {
            return getCategoryForProgram(program) === category;
          });
          
          return {
            name: category,
            count: programsInCategory.length,
            time: time,
            category: category,
            type: 'category',
            id: category.toLowerCase().replace(/\s+/g, '-')
          };
        });
        
        setAvailableTasks(tasksFromCategories);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch programs/files for selected task/category
  const fetchTaskFiles = async (user, task) => {
    if (!user || !task) return;
    
    try {
      setLoadingFiles(true);
      
      // If it's a project folder, fetch files from the API
      if (task.type === 'project_folder' && user.email && task.name) {
        try {
          const response = await axios.get(`https://dxdtime.ddsolutions.io/api/logs/files/?email=${encodeURIComponent(user.email)}&date=${encodeURIComponent(task.name)}&limit=20`, {
            timeout: 8000
          });
          
          let files = [];
          
          // Handle API response structure
          if (response.data?.success && response.data?.data?.files && Array.isArray(response.data.data.files)) {
            files = response.data.data.files.map((file, index) => ({
              name: file.filename || file.name || `File ${index + 1}`,
              path: file.file_path || file.path || `/files/${file.filename}`,
              size: file.size_bytes || file.size || 0,
              time: file.modified_time || file.last_modified || new Date().toISOString(),
              category: task.name,
              type: 'file',
              file_type: file.file_type || 'unknown',
              extension: file.extension || '',
              id: file.id || file.filename?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `file-${index}`
            }));
          } else if (response.data && Array.isArray(response.data)) {
            // Handle direct array response
            files = response.data.map((file, index) => ({
              name: file.filename || file.name || `File ${index + 1}`,
              path: file.file_path || file.path || `/files/${file.filename}`,
              size: file.size_bytes || file.size || 0,
              time: file.modified_time || file.last_modified || new Date().toISOString(),
              category: task.name,
              type: 'file',
              file_type: file.file_type || 'unknown',
              extension: file.extension || '',
              id: file.id || file.filename?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `file-${index}`
            }));
          }
          
          setAvailableFiles(files);
        } catch (apiError) {
          console.error('API Error fetching files:', apiError);
          // Fallback to demo files for project folders
          const demoFiles = [
            {
              name: `${task.name}_summary.txt`,
              path: `/projects/${task.name}/summary.txt`,
              size: 2048,
              time: new Date().toISOString(),
              category: task.name,
              type: 'file',
              file_type: 'text',
              extension: 'txt',
              id: 'summary-file'
            },
            {
              name: `${task.name}_data.json`,
              path: `/projects/${task.name}/data.json`,
              size: 5120,
              time: new Date(Date.now() - 60000).toISOString(),
              category: task.name,
              type: 'file',
              file_type: 'json',
              extension: 'json',
              id: 'data-file'
            },
            {
              name: `${task.name}_config.ini`,
              path: `/projects/${task.name}/config.ini`,
              size: 1024,
              time: new Date(Date.now() - 120000).toISOString(),
              category: task.name,
              type: 'file',
              file_type: 'config',
              extension: 'ini',
              id: 'config-file'
            }
          ];
          setAvailableFiles(demoFiles);
        }
      } else {
        // Fallback to program categories for non-project folders
        const programsInCategory = Object.entries(activityData.programs)
          .filter(([program]) => getCategoryForProgram(program) === task.category)
          .map(([program, time]) => ({
            name: program,
            path: `/programs/${program}`,
            size: parseFloat(time) * 1024, // Convert time to size for display
            time: time,
            category: task.category,
            type: 'program',
            id: program.toLowerCase().replace(/[^a-z0-9]/g, '-')
          }));
        
        setAvailableFiles(programsInCategory);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Check if file content has categories/programs structure
  const isActivityDataStructure = (data) => {
    return data && 
           typeof data === 'object' && 
           data.categories && 
           data.programs &&
           typeof data.categories === 'object' &&
           typeof data.programs === 'object';
  };

  // Fetch file content for JSON files
  const fetchFileContent = async (file) => {
    if (!file || (file.file_type !== 'json' && !file.name?.toLowerCase().endsWith('.json'))) {
      return null;
    }

    try {
      let jsonData = null;

      // 1. Try to fetch from download_url if present
      if (file.download_url) {
        try {
          const response = await fetch(file.download_url);
          if (response.ok) {
            jsonData = await response.json();
          }
        } catch (err) {
          console.error('Error fetching from download_url:', err);
        }
      }

      // 2. Fallback to API if no download_url or fetch failed
      if (!jsonData) {
        try {
          const apiResponse = await axios.get(
            `https://dxdtime.ddsolutions.io/api/logs/file-content/?email=${encodeURIComponent(selectedUser?.email)}&file_path=${encodeURIComponent(file.path)}`,
            { timeout: 8000 }
          );
          if (apiResponse.data?.success && apiResponse.data?.content) {
            jsonData = typeof apiResponse.data.content === 'string'
              ? JSON.parse(apiResponse.data.content)
              : apiResponse.data.content;
          }
        } catch (apiError) {
          console.log('API not available, using sample data for JSON file');
        }
      }

      // 3. Fallback to sample data if all else fails
      if (!jsonData) {
        jsonData = {
          "categories": {
            "Unknown": "66.0 mins",
            "Browsers": "6.0 mins",
            "Development": "3.0 mins",
            "Productivity": "3.0 mins",
            "Communication": "3.0 mins"
          },
          "programs": {
            "Registry": "3.0 mins",
            "NVDisplay.Container.exe": "3.0 mins",
            "Chrome": "3.0 mins",
            "nvcontainer.exe": "3.0 mins",
            "redis-server.exe": "3.0 mins",
            "TeamViewer_Service.exe": "3.0 mins",
            "crashpad_handler.exe": "3.0 mins",
            "VSCode": "3.0 mins",
            "File Explorer": "3.0 mins",
            "powershell.exe": "3.0 mins",
            "msedgewebview2.exe": "3.0 mins",
            "WhatsApp": "3.0 mins",
            "AggregatorHost.exe": "3.0 mins",
            "SystemSettingsBroker.exe": "3.0 mins",
            "SearchApp.exe": "3.0 mins",
            "rustdesk.exe": "3.0 mins",
            "Edge": "3.0 mins",
            "python.exe": "3.0 mins",
            "TextInputHost.exe": "3.0 mins",
            "SnippingTool.exe": "3.0 mins",
            "image_watcher.exe": "3.0 mins",
            "CalculatorApp.exe": "3.0 mins",
            "notepad.exe": "3.0 mins",
            "TiWorker.exe": "3.0 mins",
            "MoUsoCoreWorker.exe": "3.0 mins",
            "TrustedInstaller.exe": "3.0 mins",
            "audiodg.exe": "2.0 mins",
            "smartscreen.exe": "1.0 mins"
          }
        };
      }

      if (jsonData && isActivityDataStructure(jsonData)) {
        return jsonData;
      }
      
      return null;
    } catch (err) {
      console.error('Error parsing JSON file content:', err);
      return null;
    }
  };

  // Fetch logs for selected file
  const fetchFileLogs = async (user, task, file) => {
    if (!user || !task || !file) return;
    
    try {
      setLoadingLogs(true);
      
      // Always try to fetch JSON from download_url if present
      let jsonContent = null;
      if (file.download_url) {
        try {
          const response = await fetch(file.download_url);
          if (response.ok) {
            const data = await response.json();
            if (isActivityDataStructure(data)) {
              setFileContent(data);
              setIsJsonData(true);
              setFileLogs([]);
              return;
            }
          }
        } catch (err) {
          console.error('Error fetching JSON from download_url:', err);
        }
      }

      // Fallback to previous logic
      jsonContent = await fetchFileContent(file);
      if (jsonContent && isActivityDataStructure(jsonContent)) {
        setFileContent(jsonContent);
        setIsJsonData(true);
        setFileLogs([]);
        return;
      } else {
        setFileContent(null);
        setIsJsonData(false);
      }
      
      // For non-JSON files, fetch or generate detailed activity logs
      let logs = [];
      
      if (file.type === 'file') {
        // Try to fetch actual activity logs from API
        try {
          const response = await axios.get(`https://dxdtime.ddsolutions.io/api/logs/activity/?email=${encodeURIComponent(user.email)}&file_path=${encodeURIComponent(file.path)}&limit=50`, {
            timeout: 8000
          });
          
          if (response.data?.success && response.data?.data && Array.isArray(response.data.data)) {
            logs = response.data.data.map((entry, index) => ({
              timestamp: entry.timestamp || new Date().toISOString(),
              action: entry.note || (entry.program === 'SessionStart' ? 'Session Started' : 'Program Activity'),
              details: entry.note || `${entry.program} activity detected`,
              program: entry.program,
              path: entry.path || 'Unknown path',
              screenshot_url: 'https://via.placeholder.com/80x60.png?text=Activity',
              id: `log-${index}`,
              file_size: file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown size',
              file_type: file.file_type || 'unknown'
            }));
          }
        } catch (apiError) {
          console.log('API not available, using sample activity data');
          // Use the detailed sample data you provided
          const sampleActivityLogs = [
            {
              "program": "SessionStart",
              "start": "2025-06-28T13:13:05.991753",
              "note": "Auto-generated on task start"
            },
            {
              "program": "chrome.exe",
              "path": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
              "timestamp": "2025-06-28T13:13:43.373811"
            },
            {
              "program": "Code.exe",
              "path": "C:\\Users\\DDS\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
              "timestamp": "2025-06-28T13:13:43.373668"
            },
            {
              "program": "python.exe",
              "path": "C:\\Users\\DDS\\AppData\\Local\\Programs\\Python\\Python313\\python.exe",
              "timestamp": "2025-06-28T13:13:43.374817"
            },
            {
              "program": "WhatsApp.exe",
              "path": "C:\\Program Files\\WindowsApps\\5319275A.WhatsAppDesktop_2.2524.4.0_x64__cv1g1gvanyjgm\\WhatsApp.exe",
              "timestamp": "2025-06-28T13:13:43.381932"
            },
            {
              "program": "msedgewebview2.exe",
              "path": "C:\\Program Files (x86)\\Microsoft\\EdgeWebView\\Application\\137.0.3296.93\\msedgewebview2.exe",
              "timestamp": "2025-06-28T13:13:43.381890"
            },
            {
              "program": "explorer.exe",
              "path": "C:\\Windows\\explorer.exe",
              "timestamp": "2025-06-28T13:13:43.378183"
            },
            {
              "program": "powershell.exe",
              "path": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
              "timestamp": "2025-06-28T13:13:43.378095"
            },
            {
              "program": "CalculatorApp.exe",
              "path": "C:\\Program Files\\WindowsApps\\Microsoft.WindowsCalculator_11.2502.2.0_x64__8wekyb3d8bbwe\\CalculatorApp.exe",
              "timestamp": "2025-06-28T13:13:43.383180"
            },
            {
              "program": "SnippingTool.exe",
              "path": "C:\\Windows\\System32\\SnippingTool.exe",
              "timestamp": "2025-06-28T13:13:43.389892"
            }
          ];
          
          logs = sampleActivityLogs.map((entry, index) => ({
            timestamp: entry.timestamp || entry.start || new Date().toISOString(),
            action: entry.note || (entry.program === 'SessionStart' ? 'Session Started' : 'Program Activity'),
            details: entry.note || `${entry.program} was active`,
            program: entry.program,
            path: entry.path || 'Unknown path',
            screenshot_url: 'https://via.placeholder.com/80x60.png?text=' + encodeURIComponent(entry.program.substring(0, 3)),
            id: `log-${index}`,
            file_size: file.size ? `${Math.round(file.size / 1024)}KB` : 'Unknown size',
            file_type: file.file_type || 'activity_log'
          }));
        }
        
        // If no logs from API, generate basic file logs
        if (logs.length === 0) {
          logs = [
            {
              timestamp: file.time || new Date().toISOString(),
              action: 'File Accessed',
              details: `${file.name} was accessed from project ${task.name}`,
              screenshot_url: 'https://via.placeholder.com/80x60.png?text=File',
              id: 'log1',
              file_size: `${Math.round(file.size / 1024)}KB`,
              file_type: file.file_type || 'unknown'
            },
            {
              timestamp: new Date(new Date(file.time) - 5 * 60 * 1000).toISOString(),
              action: 'File Modified',
              details: `Changes detected in ${file.name}`,
              screenshot_url: 'https://via.placeholder.com/80x60.png?text=Modified',
              id: 'log2',
              file_size: `${Math.round(file.size / 1024)}KB`,
              file_type: file.file_type || 'unknown'
            }
          ];
        }
      } else {
        // For program files (fallback)
        logs = [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            action: 'Program Started',
            details: `${file.name} was launched by ${user.display_name}`,
            screenshot_url: 'https://via.placeholder.com/80x60.png?text=Started',
            id: 'log1',
            duration: file.time
          },
          {
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
            action: 'Active Usage',
            details: `User actively working in ${file.name}`,
            screenshot_url: 'https://via.placeholder.com/80x60.png?text=Active',
            id: 'log2',
            duration: file.time
          }
        ];
      }
      
      setFileLogs(logs);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Helper function to categorize programs
  const getCategoryForProgram = (program) => {
    const programLower = program.toLowerCase();
    
    if (programLower.includes('chrome') || programLower.includes('edge') || 
        programLower.includes('browser') || programLower.includes('msedgewebview')) {
      return 'Browsers';
    }
    
    if (programLower.includes('vscode') || programLower.includes('python') ||
        programLower.includes('code') || programLower.includes('powershell')) {
      return 'Development';
    }
    
    if (programLower.includes('whatsapp') || programLower.includes('teams') ||
        programLower.includes('teamviewer')) {
      return 'Communication';
    }
    
    if (programLower.includes('explorer') || programLower.includes('file') ||
        programLower.includes('calculator') || programLower.includes('notepad') ||
        programLower.includes('snipping')) {
      return 'Productivity';
    }
    
    return 'Unknown';
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsUserSelected(true);
    setSearch(user.display_name);
    setSearchSuggestions([]);
    // Reset task and file selections
    setSelectedTask(null);
    setIsTaskSelected(false);
    setAvailableFiles([]);
    setSelectedFile(null);
    setIsFileSelected(false);
    setFileLogs([]);
    // Fetch tasks for the selected user
    fetchUserTasks(user);
  };

  // Handle task selection
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setIsTaskSelected(true);
    setSelectedFile(null);
    setIsFileSelected(false);
    setFileLogs([]);
    
    if (selectedUser) {
      fetchTaskFiles(selectedUser, task);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setIsFileSelected(true);
    setFileLogs([]);
    
    if (selectedUser && selectedTask) {
      fetchFileLogs(selectedUser, selectedTask, file);
    }
  };

  // Reset functions
  const resetAllFilters = () => {
    setSelectedUser(null);
    setIsUserSelected(false);
    setAvailableTasks([]);
    setSelectedTask(null);
    setIsTaskSelected(false);
    setAvailableFiles([]);
    setSelectedFile(null);
    setIsFileSelected(false);
    setFileLogs([]);
    setSearch('');
    setSearchSuggestions([]);
  };

  const resetToTaskLevel = () => {
    setSelectedFile(null);
    setIsFileSelected(false);
    setFileLogs([]);
  };

  const resetToUserLevel = () => {
    setSelectedTask(null);
    setIsTaskSelected(false);
    setAvailableFiles([]);
    setSelectedFile(null);
    setIsFileSelected(false);
    setFileLogs([]);
  };

  // Handle search suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isUserSelected && search && search.length >= 1) {
        fetchSearchSuggestions(search);
      } else {
        setSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, isUserSelected]);

  const activities = [
    {
      title: t('purchasedFromMediaTek') || 'Purchased from MediaTek',
      subtitle: t('loremIpsumShort') || 'Lorem ipsum dolor sit amet consecte',
      media: [
        'https://via.placeholder.com/48x48?text=1',
        'https://via.placeholder.com/48x48?text=2',
        'https://via.placeholder.com/48x48?text=3'
      ],
      time: t('minsAgo', { count: 4 }) || '04 Mins Ago'
    },
    {
      title: t('purchasedFromMediaTek') || 'Purchased from MediaTek',
      subtitle: t('loremIpsumShort') || 'Lorem ipsum dolor sit amet consecte',
      media: [
        'https://via.placeholder.com/48x48?text=A',
        'https://via.placeholder.com/48x48?text=B',
        'https://via.placeholder.com/48x48?text=C'
      ],
      time: t('minsAgo', { count: 4 }) || '04 Mins Ago'
    },
    {
      title: t('purchasedFromMediaTek') || 'Purchased from MediaTek',
      subtitle: t('daysLeftNotification') || '3 days left notification to submit new products',
      media: [],
      time: t('minsAgo', { count: 4 }) || '04 Mins Ago'
    }
  ];

  // Activity tracking data
  const activityData = {
    categories: {
      "Unknown": "66.0 mins",
      "Browsers": "6.0 mins", 
      "Development": "3.0 mins",
      "Productivity": "3.0 mins",
      "Communication": "3.0 mins"
    },
    programs: {
      "Registry": "3.0 mins",
      "NVDisplay.Container.exe": "3.0 mins",
      "Chrome": "3.0 mins",
      "nvcontainer.exe": "3.0 mins",
      "redis-server.exe": "3.0 mins",
      "TeamViewer_Service.exe": "3.0 mins",
      "crashpad_handler.exe": "3.0 mins",
      "VSCode": "3.0 mins",
      "File Explorer": "3.0 mins",
      "powershell.exe": "3.0 mins",
      "msedgewebview2.exe": "3.0 mins",
      "WhatsApp": "3.0 mins",
      "AggregatorHost.exe": "3.0 mins",
      "SystemSettingsBroker.exe": "3.0 mins",
      "SearchApp.exe": "3.0 mins",
      "rustdesk.exe": "3.0 mins",
      "Edge": "3.0 mins",
      "python.exe": "3.0 mins",
      "TextInputHost.exe": "3.0 mins",
      "SnippingTool.exe": "3.0 mins",
      "image_watcher.exe": "3.0 mins",
      "CalculatorApp.exe": "3.0 mins",
      "notepad.exe": "3.0 mins",
      "TiWorker.exe": "3.0 mins",
      "MoUsoCoreWorker.exe": "3.0 mins",
      "TrustedInstaller.exe": "3.0 mins",
      "audiodg.exe": "2.0 mins",
      "smartscreen.exe": "1.0 mins"
    }
  };

  // Calculate total time and stats
  const totalActiveTime = Object.values(activityData.categories)
    .reduce((total, time) => total + parseFloat(time), 0);
  
  const totalPrograms = Object.keys(activityData.programs).length;
  const mostUsedProgram = Object.entries(activityData.programs)
    .sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))[0];

  // Get category icons
  const getCategoryIcon = (category) => {
    const icons = {
      "Unknown": "❓",
      "Browsers": "🌐", 
      "Development": "💻",
      "Productivity": "📊",
      "Communication": "💬"
    };
    return icons[category] || "📁";
  };

  // Get program icon
  const getProgramIcon = (program) => {
    const programLower = program.toLowerCase();
    if (programLower.includes('chrome') || programLower.includes('edge')) return "🌐";
    if (programLower.includes('vscode') || programLower.includes('python')) return "💻";
    if (programLower.includes('whatsapp') || programLower.includes('teams')) return "💬";
    if (programLower.includes('explorer') || programLower.includes('file')) return "📁";
    if (programLower.includes('calculator')) return "🧮";
    if (programLower.includes('notepad')) return "📝";
    if (programLower.includes('snipping')) return "✂️";
    return "⚙️";
  };

  // Get file icon based on file type or extension
  const getFileIcon = (file) => {
    if (file.type === 'program') {
      return getProgramIcon(file.name);
    }
    
    const extension = file.extension?.toLowerCase() || file.name?.split('.').pop()?.toLowerCase();
    const fileType = file.file_type?.toLowerCase();
    
    // File type specific icons
    if (fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) return "🖼️";
    if (fileType === 'document' || ['doc', 'docx', 'pdf'].includes(extension)) return "📄";
    if (fileType === 'spreadsheet' || ['xls', 'xlsx', 'csv'].includes(extension)) return "📊";
    if (fileType === 'text' || ['txt', 'md', 'readme'].includes(extension)) return "📝";
    if (fileType === 'json' || extension === 'json') return "📋";
    if (fileType === 'config' || ['ini', 'conf', 'config', 'cfg'].includes(extension)) return "⚙️";
    if (fileType === 'archive' || ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return "📦";
    if (fileType === 'video' || ['mp4', 'avi', 'mkv', 'mov'].includes(extension)) return "🎥";
    if (fileType === 'audio' || ['mp3', 'wav', 'flac', 'aac'].includes(extension)) return "🎵";
    if (fileType === 'code' || ['js', 'py', 'html', 'css', 'java', 'cpp', 'c'].includes(extension)) return "💻";
    
    return "📁";
  };

  // Render JSON activity data as dashboard
  const renderJSONDashboard = () => {
    if (!fileContent || !isJsonData) return null;
    
    const totalActiveTime = Object.values(fileContent.categories)
      .reduce((total, time) => total + parseFloat(time), 0);
    
    const totalPrograms = Object.keys(fileContent.programs).length;
    const mostUsedProgram = Object.entries(fileContent.programs)
      .sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))[0];

    return (        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '20px',
          color: 'white',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: '0', fontSize: '20px' }}>📊 Activity Dashboard</h3>
            <div style={{ fontSize: '12px', opacity: 0.8, background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '12px' }}>
              JSON Data View
            </div>
          </div>
        
        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalActiveTime.toFixed(1)} mins</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Active Time</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalPrograms}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Programs Used</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{mostUsedProgram?.[0] || 'N/A'}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Most Used Program</div>
          </div>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>📂 Categories</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {Object.entries(fileContent.categories).map(([category, time]) => (
              <div key={category} style={{ 
                background: 'rgba(255,255,255,0.15)', 
                padding: '12px', 
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px' }}>{getCategoryIcon(category)} {category}</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Programs */}
        <div>
          <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>🔥 All Programs ({Object.keys(fileContent.programs).length} total)</h4>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px', 
            maxHeight: '300px', 
            overflowY: 'auto',
            padding: '10px'
          }}>
            {Object.entries(fileContent.programs)
              .sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))
              .map(([program, time], index) => (
                <div key={program} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: index < Object.keys(fileContent.programs).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ minWidth: '20px' }}>{getProgramIcon(program)}</span>
                    <span>{program}</span>
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>{time}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Wrapper>
      <Header>
        <Title>{t('userActivity') || 'User Activity'}</Title>
        
        <Autocomplete
          freeSolo
          options={searchSuggestions}
          loading={loadingSuggestions}
          value={isUserSelected ? selectedUser?.display_name || '' : search}
          open={!isUserSelected && searchSuggestions.length > 0}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return option.display_name || option.label || option.email || option;
          }}
          onInputChange={(event, newInputValue) => {
            if (isUserSelected && newInputValue !== selectedUser?.display_name) {
              setIsUserSelected(false);
              setSelectedUser(null);
            }
            setSearch(newInputValue);
          }}
          onChange={(event, newValue) => {
            if (newValue && typeof newValue === 'object') {
              handleUserSelect(newValue);
            } else if (!newValue && isUserSelected) {
              resetAllFilters();
            }
          }}
          renderOption={(props, option) => (
            <Box 
              component="li" 
              {...props}
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>
                  {typeof option === 'object' ? option.display_name : option}
                </div>
                {typeof option === 'object' && (
                  <>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      📧 {option.email}
                    </div>
                    {option.screenshot_count && (
                      <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>
                        � {option.screenshot_count} files • {option.total_size_mb ? `${option.total_size_mb}MB` : 'Size unknown'}
                      </div>
                    )}
                    {option.staff_id && (
                      <div style={{ fontSize: '11px', color: '#6366f1', marginTop: '1px' }}>
                        🆔 Staff ID: {option.staff_id}
                      </div>
                    )}
                    {option.date_folders && option.date_folders.length > 0 && (
                      <div style={{ fontSize: '10px', color: '#8b5cf6', marginTop: '1px' }}>
                        📅 Projects: {option.date_folders.slice(0, 2).join(', ')}{option.date_folders.length > 2 ? '...' : ''}
                      </div>
                    )}
                    {option.source && (
                      <div style={{ fontSize: '10px', color: '#059669', marginTop: '1px' }}>
                        🔗 Source: {option.source}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder={isUserSelected ? `${selectedUser?.display_name} - Click Clear to search again` : "Search for users in logs..."}
              style={{ minWidth: '300px' }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                    {isUserSelected && (
                      <Button
                        onClick={resetAllFilters}
                        style={{ 
                          minWidth: 'auto', 
                          padding: '4px 8px', 
                          fontSize: '12px',
                          marginRight: '8px',
                          textTransform: 'none'
                        }}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      >
                        Clear
                      </Button>
                    )}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Header>

      {/* User Selection Status */}
      {isUserSelected && selectedUser && (
        <SearchInfo>
          📋 Selected: <strong>{selectedUser.display_name}</strong> ({selectedUser.email})
          {selectedUser.screenshot_count && ` • ${selectedUser.screenshot_count} files`}
          {selectedUser.total_size_mb && ` • ${selectedUser.total_size_mb}MB`}
          {selectedUser.staff_id && ` • Staff ID: ${selectedUser.staff_id}`}
          {selectedUser.has_logs && ' • ✅ Has Activity Logs'}
        </SearchInfo>
      )}

      {/* Info message when no user is selected */}
      {!isUserSelected && (
        <SearchInfo>
          {backendStatus === 'disconnected' ? (
            <>
              ❌ <strong>Backend Server Not Running</strong> - Using test data for demonstration (Expected: https://dxdtime.ddsolutions.io/api/logs/search/)
            </>
          ) : (
            <>
              💡 Start typing a name to search users in logs, then select a user to view their activity.
            </>
          )}
        </SearchInfo>
      )}

      {/* Breadcrumb Navigation */}
      {(isUserSelected || isTaskSelected || isFileSelected) && (
        <BreadcrumbNav>
          <BreadcrumbItem 
            active={isUserSelected} 
            clickable={isTaskSelected || isFileSelected} 
            onClick={isTaskSelected || isFileSelected ? resetToUserLevel : undefined}
          >
            👤 {selectedUser?.display_name || 'User'}
          </BreadcrumbItem>
          {isTaskSelected && (
            <>
              <span>›</span>
              <BreadcrumbItem 
                active={isTaskSelected} 
                clickable={isFileSelected} 
                onClick={isFileSelected ? resetToTaskLevel : undefined}
              >
                � {selectedTask?.name || 'Project'}
              </BreadcrumbItem>
            </>
          )}
          {isFileSelected && (
            <>
              <span>›</span>
              <BreadcrumbItem active={isFileSelected}>
                📁 {selectedFile?.name || 'File'}
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbNav>
      )}

      {/* Task Selection Filter */}
      {isUserSelected && !isTaskSelected && (
        <FilterSection>
          <FilterTitle>
            📋 Select a Project/Task ({availableTasks.length} available)
            {loadingTasks && <CircularProgress size={16} />}
          </FilterTitle>
          {loadingTasks ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <CircularProgress size={24} />
              <div style={{ marginTop: '8px', color: '#6b7280' }}>Loading projects...</div>
            </div>
          ) : availableTasks.length > 0 ? (
            <FilterGrid>
              {availableTasks.map((task, index) => (
                <FilterItem 
                  key={task.id || index} 
                  onClick={() => handleTaskSelect(task)}
                >
                  <span>
                    {task.type === 'project_folder' ? '📁' : getCategoryIcon(task.category)} {task.name}
                  </span>
                  <FilterCount>
                    {task.type === 'project_folder' ? `${task.count} files` : `${task.count} programs`}
                  </FilterCount>
                </FilterItem>
              ))}
            </FilterGrid>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              No projects found for this user
            </div>
          )}
        </FilterSection>
      )}

      {/* File Selection Filter */}
      {isTaskSelected && !isFileSelected && (
        <FilterSection>
          <FilterTitle>
            �️ Select a Program ({availableFiles.length} available in {selectedTask?.name})
            {loadingFiles && <CircularProgress size={16} />}
          </FilterTitle>
          {loadingFiles ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <CircularProgress size={24} />
              <div style={{ marginTop: '8px', color: '#6b7280' }}>Loading files...</div>
            </div>
          ) : availableFiles.length > 0 ? (
            <FilterGrid>
              {availableFiles.map((file, index) => (
                <FilterItem 
                  key={file.id || index} 
                  onClick={() => handleFileSelect(file)}
                >
                  <span>
                    {getFileIcon(file)} {file.name}
                  </span>
                  <FilterCount>
                    {file.type === 'file' 
                      ? `${Math.round(file.size / 1024)}KB` 
                      : file.time
                    }
                  </FilterCount>
                </FilterItem>
              ))}
            </FilterGrid>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              No files found in this project
            </div>
          )}
        </FilterSection>
      )}

      {/* File Logs Display */}
      {isFileSelected && (
        <FilterSection>
          {/* JSON Dashboard Display */}
          {isJsonData && fileContent && renderJSONDashboard()}
          
          <FilterTitle>
            📝 {isJsonData ? 'Activity Data from' : 'Program Activity Logs for'} {selectedFile?.name} ({isJsonData ? 'Dashboard View' : `${fileLogs.length} entries`})
            {loadingLogs && <CircularProgress size={16} />}
          </FilterTitle>
          {loadingLogs ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <CircularProgress size={24} />
              <div style={{ marginTop: '8px', color: '#6b7280' }}>Loading activity logs...</div>
            </div>
          ) : !isJsonData && fileLogs.length > 0 ? (
            <div>
              {/* Activity Summary */}
              <div style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '6px', 
                padding: '12px', 
                marginBottom: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0369a1' }}>
                    {fileLogs.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Activities</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                    {new Set(fileLogs.map(log => log.program).filter(Boolean)).size}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Unique Programs</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7c3aed' }}>
                    {fileLogs[0] ? dayjs(fileLogs[0].timestamp).format('MMM DD') : 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Session Date</div>
                </div>
              </div>
              
              {/* Activity Logs List */}
              {fileLogs.map((log, index) => (
                <LogItem key={log.id || index}>
                  <LogImage 
                    src={log.screenshot_url || 'https://via.placeholder.com/80x60.png?text=Activity'} 
                    alt={log.action}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x60.png?text=No+Image';
                    }}
                  />
                  <LogContent>
                    <LogTimestamp>
                      {dayjs(log.timestamp).format('MMM DD, YYYY h:mm:ss A')}
                    </LogTimestamp>
                    <LogAction>{log.action}</LogAction>
                    <LogDetails>{log.details}</LogDetails>
                    
                    {/* Program Information */}
                    {log.program && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#0369a1', 
                        marginTop: '6px',
                        fontWeight: '500',
                        background: '#eff6ff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        🖥️ Program: {log.program}
                      </div>
                    )}
                    
                    {/* File Path */}
                    {log.path && log.path !== 'Unknown path' && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#6b7280', 
                        marginTop: '4px',
                        fontFamily: 'monospace',
                        background: '#f9fafb',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        border: '1px solid #e5e7eb'
                      }}>
                        � {log.path}
                      </div>
                    )}
                    
                    {/* Additional Info Row */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {log.duration && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#059669', 
                          fontWeight: '500'
                        }}>
                          ⏱️ Duration: {log.duration}
                        </div>
                      )}
                      {log.file_size && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#6366f1', 
                          fontWeight: '500'
                        }}>
                          📄 Size: {log.file_size}
                        </div>
                      )}
                      {log.file_type && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#8b5cf6', 
                          fontWeight: '500'
                        }}>
                          🏷️ Type: {log.file_type}
                        </div>
                      )}
                    </div>
                  </LogContent>
                </LogItem>
              ))}
            </div>
          ) : !isJsonData ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              No activity logs found for this file
            </div>
          ) : null}
        </FilterSection>
      )}

      {/* Original Timeline - only show when no filtering is active */}
      {!isUserSelected && (
        <>
          {/* Activity Statistics Overview */}
          <StatsOverview>
            <StatCard gradient="#667eea 0%, #764ba2 100%">
              <StatValue>{totalActiveTime.toFixed(1)} mins</StatValue>
              <StatLabel>Total Active Time</StatLabel>
            </StatCard>
            <StatCard gradient="#f093fb 0%, #f5576c 100%">
              <StatValue>{totalPrograms}</StatValue>
              <StatLabel>Programs Used</StatLabel>
            </StatCard>
            <StatCard gradient="#4facfe 0%, #00f2fe 100%">
              <StatValue>{Object.keys(activityData.categories).length}</StatValue>
              <StatLabel>Categories</StatLabel>
            </StatCard>
            <StatCard gradient="#43e97b 0%, #38f9d7 100%">
              <StatValue>{mostUsedProgram?.[0]?.substring(0, 10) || 'N/A'}</StatValue>
              <StatLabel>Most Used App</StatLabel>
            </StatCard>
          </StatsOverview>

          {/* Category Breakdown */}
          <CategorySection>
            <CategoryTitle>
              📊 Activity Categories
            </CategoryTitle>
            <CategoryGrid>
              {Object.entries(activityData.categories).map(([category, time]) => (
                <CategoryCard key={category}>
                  <CategoryName>
                    <span>
                      <CategoryIcon>{getCategoryIcon(category)}</CategoryIcon>
                      {' '}{category}
                    </span>
                  </CategoryName>
                  <CategoryTime>{time}</CategoryTime>
                </CategoryCard>
              ))}
            </CategoryGrid>
          </CategorySection>

          {/* Programs Breakdown */}
          <CategorySection>
            <CategoryTitle>
              🖥️ Program Usage ({Object.keys(activityData.programs).length} programs)
            </CategoryTitle>
            <ProgramGrid>
              {Object.entries(activityData.programs)
                .sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))
                .map(([program, time]) => (
                <ProgramItem key={program}>
                  <ProgramName>
                    {getProgramIcon(program)} {program}
                  </ProgramName>
                  <ProgramTime>{time}</ProgramTime>
                </ProgramItem>
              ))}
            </ProgramGrid>
          </CategorySection>

          {/* Original Timeline Activities */}
          <CategorySection>
            <CategoryTitle>
              🕒 Recent Activities
            </CategoryTitle>
            <Timeline>
              {activities.filter((act) =>
                act.title.toLowerCase().includes(search.toLowerCase())
              ).map((item, index) => (
                <TimelineItem key={index}>
                  <Icon>
                    <i className="fas fa-bag-shopping"></i>
                  </Icon>
                  <Content>
                    <TitleText>{item.title}</TitleText>
                    <Subtitle dangerouslySetInnerHTML={{ __html: item.subtitle }} />
                    {item.media.length > 0 && (
                      <Media>
                        {item.media.map((src, i) => (
                          <img key={i} src={src} alt="" />
                        ))}
                      </Media>
                    )}
                  </Content>
                  <Badge>{item.time}</Badge>
                </TimelineItem>
              ))}
            </Timeline>
          </CategorySection>
        </>
      )}
    </Wrapper>
  );
};

export default FocusTimeline;
