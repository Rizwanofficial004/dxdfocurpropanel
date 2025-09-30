import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import EmployeeCards from '../components/employees/EmployeeCards';
import toastService from '../../services/toastService';
import {
  EmployeesPageWrapper,
  PageHeader,
  PageTitle,
  PageSubtitle,
  EmployeesWrapper,
  EmployeesContainer,
  EmployeesHeader,
  EmployeesTitle,
  EmployeesSubtitle,
  StatsSummary,
  StatCard,
  StatIcon,
  StatValue,
  StatLabel,
  FilterSection,
  FilterInput,
  EmployeesGrid,
  LoadingSpinner,
  NoDataMessage,
  EmployeeCard,
  EmployeeAvatar,
  EmployeeInfo,
  EmployeeName,
  EmployeeTitle,
  EmployeeEmail,
  EmployeeContact,
  EmployeeDetails,
  DetailItem,
  DetailLabel,
  DetailValue,
  RatingSection,
  RatingStars,
  Star,
  RatingValue,
  ActionButtons,
  ActionButton,
  AIInsightsSection,
  AIInsightsTitle,
  AIInsightsList,
  AIInsightItem
} from './Employees.styles';

// OpenAI Integration for Employee Insights
const generateAIInsights = async (employee) => {
  try {
    // Prepare employee data for AI analysis
    const employeeContext = {
      name: employee.name,
      email: employee.email,
      jobTitle: employee.jobTitle || 'Not specified',
      hourlyRate: employee.hourlyRate || 0,
      rating: employee.rating || 0,
      fileCount: employee.file_count || 0,
      storageMB: employee.storage_size_mb || 0,
      joinDate: employee.joinDate,
      location: employee.location || 'Not specified',
      performanceScore: employee.performance_score || 0
    };

    const prompt = `Analyze this employee's profile and provide 4 concise, professional insights (max 50 chars each):

Employee Profile:
- Name: ${employeeContext.name}
- Role: ${employeeContext.jobTitle}
- Hourly Rate: ₺${employeeContext.hourlyRate}/hr
- Performance Score: ${employeeContext.performanceScore}%
- Rating: ${employeeContext.rating}/5
- Screenshots: ${employeeContext.fileCount} files
- Storage Usage: ${employeeContext.storageMB} MB
- Location: ${employeeContext.location}
- Email Domain: ${employeeContext.email.split('@')[1]}

Generate 4 bullet points focusing on:
1. Performance assessment
2. Productivity insights
3. Work pattern analysis
4. Growth potential

Format as JSON array: ["insight1", "insight2", "insight3", "insight4"]`;

    // Call OpenAI API (you'll need to replace with your actual API key)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_OPENAI_API_KEY', // Replace with your actual API key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an HR analytics AI that provides professional, data-driven insights about employees. Keep insights concise and actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const insightsText = aiData.choices[0].message.content.trim();
    
    try {
      // Try to parse as JSON array
      const insights = JSON.parse(insightsText);
      if (Array.isArray(insights) && insights.length >= 4) {
        return insights.slice(0, 4); // Take first 4 insights
      }
    } catch (parseError) {
      // If JSON parsing fails, split by lines or generate fallback
      const lines = insightsText.split('\n').filter(line => line.trim());
      if (lines.length >= 4) {
        return lines.slice(0, 4).map(line => line.replace(/^[-•*]\s*/, '').trim());
      }
    }

    // Fallback if AI response is invalid
    return generateFallbackInsights(employeeContext);

  } catch (error) {
    console.error('🤖 AI insights generation failed:', error);
    return generateFallbackInsights(employee);
  }
};

// Fallback AI insights based on CRM data
const generateFallbackInsights = (employee) => {
  const insights = [];
  
  // Staff ID insight
  if (employee.crm_staff_id || employee.staff_id) {
    insights.push(`� Staff ID: ${employee.crm_staff_id || employee.staff_id}`);
  } else {
    insights.push('🆔 Staff ID: Not assigned');
  }
  
  // Hourly Rate insight
  const rate = parseFloat(employee.crm_hourly_rate || employee.hourlyRate || 0);
  if (rate > 150) {
    insights.push(`� Premium rate: $${rate}/hr - Senior expert`);
  } else if (rate > 100) {
    insights.push(`� High rate: $${rate}/hr - Experienced`);
  } else if (rate > 50) {
    insights.push(`� Standard rate: $${rate}/hr - Professional`);
  } else if (rate > 0) {
    insights.push(`� Entry rate: $${rate}/hr - Junior level`);
  } else {
    insights.push('💰 Hourly rate: Not set');
  }
  
  // Phone number insight
  const phone = employee.crm_phonenumber || employee.phone;
  if (phone && phone !== 'No Phone') {
    if (phone.includes('+90')) {
      insights.push('📞 Turkey contact: Turkish number');
    } else if (phone.includes('+92')) {
      insights.push('📞 Pakistan contact: Pakistani number');
    } else {
      insights.push('📞 International contact available');
    }
  } else {
    insights.push('� Phone: Contact info missing');
  }
  
  // Status insight
  if (employee.status === 'Active') {
    insights.push('✅ Active employee - Currently working');
  } else {
    insights.push('⏸️ Inactive employee - Not working');
  }
  
  return insights;
};

// Fetch screenshot count data from DDS API
const fetchScreenshotData = async () => {
  console.log('📸 Fetching screenshot data from DDS API...');
  
  try {
    // Use Vite proxy to fetch screenshot data without CORS issues
    const response = await fetch('/api/actual-count-total/screenshots/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) {
      throw new Error(`Screenshot API Error: ${response.status} ${response.statusText}`);
    }
    
    const screenshotData = await response.json();
    console.log('📸 Screenshot API Response:', screenshotData);
    console.log(`📸 Total Screenshots: ${screenshotData.total_screenshots?.toLocaleString()}`);
    console.log(`📸 Total Users: ${screenshotData.total_users}`);
    
    if (!screenshotData.success || !Array.isArray(screenshotData.users)) {
      throw new Error('Screenshot API returned invalid data format');
    }
    
    // Convert array to object for easier lookup by email
    const screenshotMap = {};
    screenshotData.users.forEach(user => {
      if (user.user_email) {
        screenshotMap[user.user_email.toLowerCase()] = {
          screenshot_count: user.screenshot_count || 0,
          last_updated: user.last_updated,
          latest_screenshot_date: user.latest_screenshot_date,
          total_size_bytes: user.total_size_bytes || 0,
          project_count: user.project_count || 0,
          projects: user.projects || {},
          percentage: user.percentage || 0
        };
      }
    });
    
    console.log(`📸 Successfully processed screenshot data for ${Object.keys(screenshotMap).length} users`);
    console.log('📸 Top 5 users by screenshot count:', 
      screenshotData.users
        .sort((a, b) => b.screenshot_count - a.screenshot_count)
        .slice(0, 5)
        .map(u => `${u.user_email}: ${u.screenshot_count.toLocaleString()}`)
    );
    
    return {
      data: screenshotMap,
      total_screenshots: screenshotData.total_screenshots || 0,
      total_users: screenshotData.total_users || 0,
      timestamp: screenshotData.timestamp,
      status: screenshotData.status
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch screenshot data:', error);
    return {
      data: {},
      total_screenshots: 0,
      total_users: 0,
      error: error.message
    };
  }
};

// Fetch employees data via Vite Proxy (frontend-only CORS solution)
const fetchEmployeesFromCRM = async () => {
  console.log('🏢 Fetching employees via Vite Proxy (frontend-only solution)...');
  
  try {
    // Use Vite's built-in proxy to bypass CORS (no backend needed)
    const proxyResponse = await fetch('/crm-api/staffs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(30000)
    });
    
    if (!proxyResponse.ok) {
      console.error('❌ Vite Proxy Error - Status:', proxyResponse.status);
      console.error('❌ Vite Proxy Error - Status Text:', proxyResponse.statusText);
      console.error('❌ Vite Proxy Error - Headers:', Object.fromEntries(proxyResponse.headers.entries()));
      throw new Error(`Vite Proxy Error: ${proxyResponse.status} ${proxyResponse.statusText}`);
    }
    
    console.log('✅ Vite Proxy Response OK - Status:', proxyResponse.status);
    console.log('✅ Vite Proxy Response Headers:', Object.fromEntries(proxyResponse.headers.entries()));
    
    const crmData = await proxyResponse.json();
    console.log('🏢 CRM Response received:', crmData);
    console.log('🏢 CRM Response type:', typeof crmData);
    console.log('🏢 CRM Response is array:', Array.isArray(crmData));
    console.log('🏢 CRM Response length (if array):', Array.isArray(crmData) ? crmData.length : 'N/A');
    console.log('🏢 First 100 chars of response:', JSON.stringify(crmData).substring(0, 100));
    
    // Process CRM staff data - handle both string and array responses
    let staffArray;
    if (typeof crmData === 'string') {
      try {
        console.log('🔄 Attempting to parse string response...');
        // If response is a JSON string, parse it
        staffArray = JSON.parse(crmData);
        console.log('🏢 Parsed string response to array:', Array.isArray(staffArray));
        console.log('🏢 Parsed array length:', Array.isArray(staffArray) ? staffArray.length : 'Not an array');
      } catch (parseError) {
        console.error('❌ Failed to parse CRM response string:', parseError);
        console.error('❌ String content that failed to parse:', crmData.substring(0, 200));
        throw new Error('CRM API returned invalid JSON string');
      }
    } else if (Array.isArray(crmData)) {
      // If response is already an array
      staffArray = crmData;
      console.log('🏢 Response is already an array with length:', staffArray.length);
    } else {
      console.error('❌ CRM API returned unexpected data type:', typeof crmData);
      console.error('❌ Actual response:', crmData);
      throw new Error('CRM API returned invalid data format - expected array or JSON string');
    }
    
    if (!Array.isArray(staffArray)) {
      console.error('❌ Final staffArray is not an array:', typeof staffArray);
      console.error('❌ staffArray content:', staffArray);
      throw new Error('CRM API returned invalid data format - could not convert to array');
    }
    
    console.log(`🎉 Successfully parsed ${staffArray.length} staff members from CRM`);
    console.log('📋 First staff member sample:', staffArray[0]);
    console.log('📋 Staff member keys:', staffArray[0] ? Object.keys(staffArray[0]) : 'No staff members');
    
    
    
    // Helper function to format phone numbers (Turkish/Pakistani/International)
    const formatPhoneNumber = (phone) => {
      if (!phone || phone.trim() === '') return 'No Phone';
      
      // Clean phone number
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Turkish numbers (+90)
      if (cleanPhone.startsWith('90') && cleanPhone.length >= 11) {
        const formatted = cleanPhone.slice(2);
        return `+90 ${formatted.slice(0, 3)} ${formatted.slice(3, 6)} ${formatted.slice(6)}`;
      }
      // Pakistani numbers (+92)
      if (cleanPhone.startsWith('92') && cleanPhone.length >= 11) {
        const formatted = cleanPhone.slice(2);
        return `+92 ${formatted.slice(0, 3)} ${formatted.slice(3, 6)} ${formatted.slice(6)}`;
      }
      // US/International fallback
      if (cleanPhone.length === 10) {
        return `+1 (${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
      }
      
      return phone; // Return as-is if no format matches
    };
    
    // Convert CRM data to employee objects
    console.log('🔄 Starting to convert CRM data to employee objects...');
    const employees = staffArray.map((staff, index) => {
      if (index < 3) { // Log first 3 employees in detail
        console.log(`🔄 Processing CRM staff ${index + 1}: ${staff.firstname} ${staff.lastname}`);
        console.log(`📸 Profile image: ${staff.profile_image}`);
        console.log(`🆔 Staff ID: ${staff.staffid}`);
        console.log(`💰 Hourly Rate: ${staff.hourly_rate}`);
        console.log(`📞 Phone: ${staff.phonenumber}`);
        console.log(`📧 Email: ${staff.email}`);
        console.log(`✅ Active: ${staff.active}`);
      }
      
      // Generate multiple avatar URL possibilities for better fallback
      let avatarUrl = null;
      let avatarThumbUrl = null;
      let avatarOriginalUrl = null;
      let avatarAltUrl = null;
      
      if (staff.profile_image && staff.profile_image !== null && staff.profile_image.trim() !== '') {
        console.log(`🔧 Building avatar URL for ${staff.firstname}:`);
        console.log(`   📁 Base URL: https://crm.deluxebilisim.com/uploads/staff_profile_images/`);
        console.log(`   🆔 Staff ID: ${staff.staffid}`);
        console.log(`   🖼️ Profile Image: ${staff.profile_image}`);
        
        // Primary URL - Your specified pattern: staff_id/thumb_profile_image (with proper encoding)
        avatarUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.staffid}/thumb_${encodeURIComponent(staff.profile_image)}`;
        
        // Thumbnail version (same as primary for your pattern)
        avatarThumbUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.staffid}/thumb_${encodeURIComponent(staff.profile_image)}`;
        
        // Original version without thumb_ prefix
        avatarOriginalUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.staffid}/${encodeURIComponent(staff.profile_image)}`;
        
        // Alternative 1: Try with underscores instead of spaces (like CRM system)
        const profileImageUnderscore = staff.profile_image.replace(/\s+/g, '_').replace(/[öüğıçş]/g, (match) => {
          const map = { 'ö': 'o', 'ü': 'u', 'ğ': 'g', 'ı': 'i', 'ç': 'c', 'ş': 's' };
          return map[match] || match;
        });
        const avatarUnderscoreUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.staffid}/thumb_${profileImageUnderscore}`;
        
        // Alternative with media path slug
        if (staff.media_path_slug) {
          avatarAltUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.media_path_slug}/thumb_${encodeURIComponent(staff.profile_image)}`;
        } else {
          avatarAltUrl = avatarUnderscoreUrl; // Use underscore version as alternative
        }
        
        console.log(`✅ Final Avatar URLs:`);
        console.log(`   🎯 Primary (Encoded): ${avatarUrl}`);
        console.log(`   📸 Thumb: ${avatarThumbUrl}`);
        console.log(`   📁 Original (No thumb_): ${avatarOriginalUrl}`);
        console.log(`   🔄 Alternative (Underscore): ${avatarUnderscoreUrl}`);
        if (avatarAltUrl && avatarAltUrl !== avatarUnderscoreUrl) console.log(`   🆔 Media Path: ${avatarAltUrl}`);
      } else {
        console.log(`❌ No profile image for ${staff.firstname} ${staff.lastname}`);
      }
      
      return {
        id: staff.staffid || `staff_${index + 1}`,
        name: staff.full_name || `${staff.firstname || ''} ${staff.lastname || ''}`.trim() || 'No Name',
        email: staff.email || 'No Email',
        phone: formatPhoneNumber(staff.phonenumber),
        jobTitle: staff.job_position ? getJobPositionName(staff.job_position) : 'Not Specified',
        hourlyRate: parseFloat(staff.hourly_rate) || 0,
        rating: staff.rating || 4.0, // Default rating if not provided in CRM
        status: staff.active === '1' ? 'Active' : 'Inactive',
        joinDate: staff.datecreated ? staff.datecreated.split(' ')[0] : new Date().toISOString().split('T')[0],
        location: staff.home_town || staff.current_address || 'Not Specified',
        avatar: avatarUrl,
        avatar_thumb: avatarThumbUrl,
        avatar_original: avatarOriginalUrl,
        avatar_alt: avatarAltUrl,
        initials: (staff.firstname?.charAt(0) || '') + (staff.lastname?.charAt(0) || ''),
        staff_id: staff.staff_identifi || staff.staffid || `ID_${index + 1}`,
        staffid: staff.staffid, // Add staffid for avatar URL construction
        profile_image: staff.profile_image, // Add profile_image field for debugging
        performance_score: staff.performance_score || 85, // Default performance score if not provided
        ai_insights: [],
        is_logged_in: staff.is_logged_in === '1',
        last_activity: staff.last_activity || staff.last_login || new Date().toISOString(),
        currency: 'TL',
        
        // CRM specific fields - showing the ones you requested
        crm_staff_id: staff.staff_identifi, // This is the staff_id you wanted
        crm_hourly_rate: staff.hourly_rate, // This is the hourly_rate you wanted  
        crm_phonenumber: staff.phonenumber, // This is the phonenumber you wanted
        
        // Additional CRM data for reference
        crm_data: staff,
        contract_type: staff.customfields?.find(cf => cf.label.includes('Contract'))?.value || 'Not Specified',
        expertise: staff.customfields?.find(cf => cf.label.includes('Expertise'))?.value || 'Not Specified',
        iban: staff.customfields?.find(cf => cf.label.includes('IBAN'))?.value || 'Not Provided'
      };
    });
    
    // Fetch screenshot data and merge with employee data
    console.log('📸 Fetching screenshot data to merge with CRM data...');
    const screenshotInfo = await fetchScreenshotData();
    
    // Generate AI insights for each employee and merge screenshot data
    console.log('🤖 Generating AI insights for employees...');
    const employeesWithAI = await Promise.all(
      employees.map(async (employee) => {
        const aiInsights = generateFallbackInsights(employee);
        
        // Look up screenshot data for this employee
        const emailKey = employee.email.toLowerCase();
        const screenshotData = screenshotInfo.data[emailKey] || {
          screenshot_count: 0,
          last_updated: null,
          latest_screenshot_date: null,
          total_size_bytes: 0,
          project_count: 0,
          projects: {},
          percentage: 0
        };
        
        if (screenshotData.screenshot_count > 0) {
          console.log(`📸 Screenshot data for ${employee.name} (${employee.email}):`, {
            screenshots: screenshotData.screenshot_count.toLocaleString(),
            percentage: screenshotData.percentage + '%',
            projects: screenshotData.project_count,
            storage: (screenshotData.total_size_bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
          });
        }
        
        return {
          ...employee,
          ai_insights: aiInsights,
          // Add comprehensive screenshot fields from API
          screenshot_count: screenshotData.screenshot_count,
          screenshot_last_updated: screenshotData.last_updated,
          screenshot_latest_date: screenshotData.latest_screenshot_date,
          screenshot_percentage: screenshotData.percentage,
          screenshot_storage_bytes: screenshotData.total_size_bytes,
          screenshot_storage_gb: (screenshotData.total_size_bytes / (1024 * 1024 * 1024)).toFixed(2),
          screenshot_project_count: screenshotData.project_count,
          screenshot_projects: screenshotData.projects,
          // Add total stats for reference
          total_screenshots_company: screenshotInfo.total_screenshots,
          total_users_company: screenshotInfo.total_users,
          screenshot_api_status: screenshotInfo.status,
          screenshot_api_timestamp: screenshotInfo.timestamp
        };
      })
    );
    
    console.log(`🎉 Successfully processed ${employeesWithAI.length} employees from CRM`);
    console.log(`📸 Screenshot data summary:`, {
      totalEmployees: employeesWithAI.length,
      employeesWithScreenshots: employeesWithAI.filter(emp => emp.screenshot_count > 0).length,
      totalScreenshots: employeesWithAI.reduce((sum, emp) => sum + (emp.screenshot_count || 0), 0).toLocaleString(),
      totalProjects: employeesWithAI.reduce((sum, emp) => sum + (emp.screenshot_project_count || 0), 0),
      totalStorageGB: employeesWithAI.reduce((sum, emp) => sum + (parseFloat(emp.screenshot_storage_gb) || 0), 0).toFixed(2) + ' GB'
    });
    console.log('📊 Top 3 employees by screenshots:', 
      employeesWithAI
        .filter(emp => emp.screenshot_count > 0)
        .sort((a, b) => b.screenshot_count - a.screenshot_count)
        .slice(0, 3)
        .map(emp => `${emp.name}: ${emp.screenshot_count.toLocaleString()} (${emp.screenshot_percentage}%)`)
    );
    console.log('📊 Sample employee with full data:', employeesWithAI.find(emp => emp.screenshot_count > 0));
    
    return employeesWithAI;
    
  } catch (error) {
    console.error('❌ Vite Proxy failed:', error);
    throw error; // Re-throw the error instead of falling back to mock data
  }
};

// Helper functions for job positions and workplaces
const getJobPositionName = (position) => {
  const positions = {
    '1': 'Project Manager',
    '2': 'Graphic Designer', 
    '3': 'General Coordinator',
    '4': 'Administrator',
    '5': 'SEO Specialist',
    '6': 'Developer',
    '7': 'Senior Developer',
    '8': 'Team Lead',
    '9': 'Quality Assurance',
    '10': 'Content Manager',
    '11': 'UI/UX Designer',
    '12': 'Digital Marketing'
  };
  return positions[position] || `Position ${position}`;
};

// Animated Counter Component
const AnimatedCounter = ({ target, prefix = '', suffix = '' }) => {
  return <span>{prefix}{target}{suffix}</span>;
};

// Employee Card Component
const Employee3DCard = ({ employee, index, isDarkMode, onEdit, onDelete, onView }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          filled={i <= fullStars || (i === fullStars + 1 && hasHalfStar)}
          isDarkMode={isDarkMode}
        >
          {i <= fullStars ? '⭐' : (i === fullStars + 1 && hasHalfStar ? '⭐' : '☆')}
        </Star>
      );
    }
    return stars;
  };

  return (
    <>
      <EmployeeCard
      index={index}
      isDarkMode={isDarkMode}
    >
      <EmployeeAvatar className="employee-avatar">
        {(employee.avatar || employee.profile_image) ? (
          <>
            {console.log(`🖼️ Loading avatar for ${employee.name}:`, employee.avatar)}
            <img 
            src={employee.avatar} 
            alt={employee.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              console.log(`❌ Avatar failed for ${employee.name} (ID: ${employee.staffid}): ${e.target.src}`);
              console.log(`📋 Profile image field:`, employee.profile_image);
              console.log(`🔍 Error details:`, e);
              console.log(`🌐 Testing URL accessibility...`);
              
              // Test if the URL is accessible
              fetch(e.target.src, { method: 'HEAD', mode: 'no-cors' })
                .then(() => console.log(`✅ URL is accessible: ${e.target.src}`))
                .catch(err => console.log(`❌ URL not accessible: ${e.target.src}`, err));
              
              // Prevent infinite loops - check if we've already tried all options
              if (e.target.hasAttribute('data-fallback-tried')) {
                console.log(`🛑 All fallbacks tried for ${employee.name}, showing initials`);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
                return;
              }
              
              // Try thumb version
              if (employee.avatar_thumb && e.target.src !== employee.avatar_thumb) {
                console.log(`🔄 Trying thumb version: ${employee.avatar_thumb}`);
                e.target.src = employee.avatar_thumb;
                return;
              }
              // Try original path version
              if (employee.avatar_original && e.target.src !== employee.avatar_original) {
                console.log(`🔄 Trying original path: ${employee.avatar_original}`);
                e.target.src = employee.avatar_original;
                return;
              }
              // Try alternative version
              if (employee.avatar_alt && e.target.src !== employee.avatar_alt) {
                console.log(`🔄 Trying alternative path: ${employee.avatar_alt}`);
                e.target.src = employee.avatar_alt;
                return;
              }
              
              // Try additional fallback patterns
              const staffId = employee.staffid || employee.staff_id;
              const profileImg = employee.profile_image;
              
              if (staffId && profileImg) {
                // Pattern 1: Raw filename without encoding
                const rawUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staffId}/thumb_${profileImg}`;
                if (e.target.src !== rawUrl) {
                  console.log(`🔄 Trying raw filename: ${rawUrl}`);
                  e.target.src = rawUrl;
                  return;
                }
                
                // Pattern 2: No thumb prefix
                const noThumbUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staffId}/${profileImg}`;
                if (e.target.src !== noThumbUrl) {
                  console.log(`🔄 Trying no thumb prefix: ${noThumbUrl}`);
                  e.target.src = noThumbUrl;
                  return;
                }
                
                // Pattern 3: Simplified ASCII (like your CRM shows)
                const simplifiedName = profileImg
                  .replace(/\s+/g, '_')
                  .replace(/[öÖ]/g, 'o')
                  .replace(/[üÜ]/g, 'u')
                  .replace(/[ğĞ]/g, 'g')
                  .replace(/[ıİ]/g, 'i')
                  .replace(/[çÇ]/g, 'c')
                  .replace(/[şŞ]/g, 's');
                const simplifiedUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staffId}/thumb_${simplifiedName}`;
                if (e.target.src !== simplifiedUrl) {
                  console.log(`🔄 Trying simplified ASCII: ${simplifiedUrl}`);
                  e.target.src = simplifiedUrl;
                  return;
                }
              }
              
              // Try generated avatar
              const generatedAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
              if (e.target.src !== generatedAvatar) {
                console.log(`🔄 Trying generated avatar for: ${employee.name}`);
                e.target.src = generatedAvatar;
                e.target.setAttribute('data-fallback-tried', 'true'); // Mark that we've tried all fallbacks
                return;
              }
              // If even generated avatar fails, show initials
              console.log(`🔄 Final fallback to initials for: ${employee.name}`);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            onLoad={(e) => {
              console.log(`✅ Avatar loaded successfully for ${employee.name} (ID: ${employee.staffid}): ${e.target.src}`);
            }}
          />
          </>
        ) : null}
        <span style={{ 
          display: (employee.avatar || employee.profile_image) ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#6366f1',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {employee.initials}
        </span>
      </EmployeeAvatar>

      <EmployeeInfo className="employee-info">
        <EmployeeName isDarkMode={isDarkMode}>{employee.name}</EmployeeName>
        <EmployeeTitle isDarkMode={isDarkMode}>{employee.jobTitle || 'No Title'}</EmployeeTitle>
        <EmployeeEmail isDarkMode={isDarkMode}>{employee.email || 'No Email'}</EmployeeEmail>
        <EmployeeContact isDarkMode={isDarkMode}>{employee.phone || 'No Phone'}</EmployeeContact>
      </EmployeeInfo>

      <EmployeeDetails>
        {/* Highlighted CRM Fields - Staff ID, Hourly Rate, Phone Number */}
        <DetailItem isDarkMode={isDarkMode} style={{ backgroundColor: isDarkMode ? 'rgba(66, 153, 225, 0.15)' : 'rgba(66, 153, 225, 0.1)', borderRadius: '6px', padding: '8px' }}>
          <DetailLabel isDarkMode={isDarkMode} style={{ fontWeight: 'bold', color: '#3182ce' }}>🆔 Staff ID</DetailLabel>
          <DetailValue isDarkMode={isDarkMode} style={{ fontWeight: 'bold', color: '#3182ce' }}>
            {employee.crm_staff_id || employee.staff_id || 'No ID'}
          </DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode} style={{ backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', padding: '8px' }}>
          <DetailLabel isDarkMode={isDarkMode} style={{ fontWeight: 'bold', color: '#22c55e' }}>💰 Hourly Rate</DetailLabel>
          <DetailValue isDarkMode={isDarkMode} style={{ fontWeight: 'bold', color: '#22c55e' }}>
            ₺{employee.crm_hourly_rate || employee.hourlyRate || '0.00'}/hr
          </DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode} style={{ backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)', borderRadius: '6px', padding: '8px' }}>
          <DetailLabel isDarkMode={isDarkMode} style={{ fontWeight: 'bold', color: '#a855f7' }}>📞 Phone Number</DetailLabel>
          <DetailValue isDarkMode={isDarkMode} style={{ fontWeight: 'bold', color: '#a855f7' }}>
            {employee.crm_phonenumber || employee.phone || 'No Phone'}
          </DetailValue>
        </DetailItem>
        
        {/* Additional Employee Details */}
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>📍 Location</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>{employee.location || 'Not Specified'}</DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>📅 Join Date</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>
            {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'Not Available'}
          </DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>📊 Performance</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>
            {employee.performance_score ? `${employee.performance_score.toFixed(1)}%` : 'No Data'}
          </DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>✅ Status</DetailLabel>
          <DetailValue isDarkMode={isDarkMode} style={{ 
            color: employee.status === 'Active' ? '#22c55e' : '#ef4444',
            fontWeight: 'bold'
          }}>
            {employee.status || 'Unknown'}
          </DetailValue>
        </DetailItem>
        {employee.contract_type && employee.contract_type !== 'Not Specified' && (
          <DetailItem isDarkMode={isDarkMode}>
            <DetailLabel isDarkMode={isDarkMode}>� Contract</DetailLabel>
            <DetailValue isDarkMode={isDarkMode}>{employee.contract_type}</DetailValue>
          </DetailItem>
        )}
        {employee.expertise && employee.expertise !== 'Not Specified' && (
          <DetailItem isDarkMode={isDarkMode}>
            <DetailLabel isDarkMode={isDarkMode}>🎯 Expertise</DetailLabel>
            <DetailValue isDarkMode={isDarkMode}>{employee.expertise}</DetailValue>
          </DetailItem>
        )}
      </EmployeeDetails>

      {/* 📸 Screenshot Analytics Section */}
      {employee.screenshot_count && employee.screenshot_count > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)', 
          borderRadius: '12px',
          border: '2px solid #22c55e',
          boxShadow: '0 4px 8px rgba(34, 197, 94, 0.2)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📸 Screenshot Analytics
            <span style={{ 
              fontSize: '12px', 
              backgroundColor: '#22c55e', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px',
              fontWeight: 'normal'
            }}>
              {employee.screenshot_percentage}% of company
            </span>
          </h3>
          
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              padding: '12px', 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>
                {employee.screenshot_count.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                Total Screenshots
              </div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                {employee.screenshot_project_count || 0}
              </div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                Active Projects
              </div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7' }}>
                {employee.screenshot_storage_gb || '0'} GB
              </div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                Storage Used
              </div>
            </div>
            
            {employee.screenshot_latest_date && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {new Date(employee.screenshot_latest_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
                <div style={{ fontSize: '11px', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>
                  Last Activity
                </div>
              </div>
            )}
          </div>

          {/* Projects Breakdown */}
          {employee.screenshot_projects && Object.keys(employee.screenshot_projects).length > 0 && (
            <div>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: isDarkMode ? '#f3f4f6' : '#374151'
              }}>
                📁 Project Breakdown ({Object.keys(employee.screenshot_projects).length} projects)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(employee.screenshot_projects)
                  .sort(([,a], [,b]) => b - a) // Sort by screenshot count
                  .slice(0, 10) // Show top 10 projects
                  .map(([projectName, count], idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      fontSize: '12px',
                      padding: '8px 12px',
                      backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '6px',
                      border: '1px solid ' + (isDarkMode ? '#4b5563' : '#e5e7eb')
                    }}>
                      <span style={{ 
                        color: isDarkMode ? '#d1d5db' : '#4b5563',
                        flex: 1,
                        marginRight: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px'
                      }} title={projectName}>
                        {projectName}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '60px',
                          height: '4px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min((count / Math.max(...Object.values(employee.screenshot_projects))) * 100, 100)}%`,
                            height: '100%',
                            backgroundColor: '#22c55e',
                            borderRadius: '2px'
                          }}></div>
                        </div>
                        <span style={{ 
                          fontWeight: 'bold',
                          color: '#22c55e',
                          minWidth: '60px',
                          textAlign: 'right'
                        }}>
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                {Object.keys(employee.screenshot_projects).length > 10 && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    marginTop: '8px',
                    padding: '8px'
                  }}>
                    +{Object.keys(employee.screenshot_projects).length - 10} more projects...
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* API Info */}
          <div style={{ 
            marginTop: '12px', 
            padding: '8px 12px', 
            backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(243, 244, 246, 0.8)', 
            borderRadius: '6px',
            fontSize: '10px',
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            📊 Data source: dxdtime.ddsolutions.io/api/actual-count-total/screenshots/
            {employee.screenshot_last_updated && (
              <span> • Last updated: {new Date(employee.screenshot_last_updated).toLocaleString()}</span>
            )}
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      {employee.ai_insights && employee.ai_insights.length > 0 && (
        <AIInsightsSection>
          <AIInsightsTitle isDarkMode={isDarkMode}>🤖 AI Insights</AIInsightsTitle>
          <AIInsightsList>
            {employee.ai_insights.map((insight, idx) => (
              <AIInsightItem key={idx} isDarkMode={isDarkMode}>
                {insight}
              </AIInsightItem>
            ))}
          </AIInsightsList>
        </AIInsightsSection>
      )}

      <RatingSection className="employee-rating">
        <RatingStars>
          {renderStars(employee.rating)}
        </RatingStars>
        <RatingValue isDarkMode={isDarkMode}>
          {employee.rating.toFixed(1)}/5.0
        </RatingValue>
      </RatingSection>

      <ActionButtons className="employee-actions">
        <ActionButton variant="primary" onClick={() => onView(employee.id)}>
          👁️ View
        </ActionButton>
        <ActionButton variant="secondary" onClick={() => onEdit(employee.id)}>
          ✏️ Edit
        </ActionButton>
        <ActionButton variant="danger" onClick={() => onDelete(employee.id)}>
          🗑️ Delete
        </ActionButton>
      </ActionButtons>
    </EmployeeCard>
  </>
  );
};

// Statistics Card Component
const StatsCard3D = ({ icon, value, label, color, isDarkMode }) => {
  return (
    <StatCard
      color={color}
      isDarkMode={isDarkMode}
    >
      <StatIcon>{icon}</StatIcon>
      <StatValue color={color}>
        <AnimatedCounter target={parseInt(value)} />
      </StatValue>
      <StatLabel isDarkMode={isDarkMode}>{label}</StatLabel>
    </StatCard>
  );
};

const Employees = () => {
  const themeContext = useTheme();
  const { isDarkMode = false, theme = {} } = themeContext || {};
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch employees data directly from CRM API on component mount
  useEffect(() => {
    const loadCRMEmployees = async () => {
      setLoading(true);
      try {
        console.log('🔄 Loading employees directly from CRM API...');
        const crmEmployeesData = await fetchEmployeesFromCRM();
        console.log(`🎉 Successfully loaded ${crmEmployeesData.length} employees from CRM`);
        console.log('📋 Employee names:', crmEmployeesData.map(emp => emp.name));
        console.log('🔍 About to set employeesData state with:', crmEmployeesData.length, 'employees');
        
        // Debug profile images
        console.log('\n📸 PROFILE IMAGE DEBUG:');
        crmEmployeesData.forEach((emp, index) => {
          if (index < 3) { // Only log first 3 to avoid spam
            console.log(`${index + 1}. ${emp.name} (ID: ${emp.staffid}):`, {
              profile_image: emp.profile_image,
              hasAvatar: !!emp.avatar,
              avatarUrl: emp.avatar,
              avatarThumb: emp.avatar_thumb,
              avatarOriginal: emp.avatar_original,
              avatarAlt: emp.avatar_alt
            });
          }
        });
        console.log('📸 ===============================\n');
        
        setEmployeesData(crmEmployeesData);
        console.log('✅ State has been updated with employee data');
      } catch (error) {
        console.error('❌ Failed to load CRM employee data:', error);
        console.log('🔄 CRM API failed, using fallback data...');
        console.log('🔍 Error details:', {
          message: error.message,
          stack: error.stack,
          type: error.constructor.name
        });
        // Set empty array instead of keeping loading state
        setEmployeesData([]);
      } finally {
        setLoading(false);
      }
    };

    loadCRMEmployees();
  }, []);

  // Calculate statistics with proper null handling
  const stats = {
    totalEmployees: employeesData.length || 0,
    averageRating: employeesData.length > 0 ? 
      Number((employeesData.reduce((sum, emp) => sum + (emp.rating || 0), 0) / employeesData.length).toFixed(1)) : 0,
    averageHourlyRate: employeesData.length > 0 ? 
      Math.round(employeesData.filter(emp => emp.hourlyRate > 0).reduce((sum, emp) => sum + (emp.hourlyRate || 0), 0) / 
        Math.max(employeesData.filter(emp => emp.hourlyRate > 0).length, 1)) : 0,
    totalScreenshots: employeesData.length > 0 ? 
      employeesData.reduce((sum, emp) => sum + (emp.screenshot_count || 0), 0) : 0,
    employeesWithScreenshots: employeesData.filter(emp => emp.screenshot_count > 0).length,
    totalScreenshotProjects: employeesData.reduce((sum, emp) => sum + (emp.screenshot_project_count || 0), 0),
    totalStorageGB: employeesData.reduce((sum, emp) => sum + (parseFloat(emp.screenshot_storage_gb) || 0), 0).toFixed(1)
  };

  console.log('📊 Current Statistics:', stats);
  console.log('📊 Employees Data Length:', employeesData.length);
  console.log('📊 Sample Employee:', employeesData[0]);
  console.log('📊 Loading state:', loading);
  console.log('📊 Search term:', searchTerm);

  // Filter data based on search and filters with null checks
  const filteredData = employeesData.filter(employee => {
    if (!employee) return false;
    
    const name = employee.name || '';
    const email = employee.email || '';
    const jobTitle = employee.jobTitle || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  console.log('📊 Filtered Data Length:', filteredData.length);
  console.log('📊 Filtered Data Sample:', filteredData[0]);

  const handleRefreshData = async () => {
    console.log('🔄 Manual refresh requested...');
    setLoading(true);
    try {
      const freshData = await fetchEmployeesFromCRM();
      setEmployeesData(freshData);
      
      // Count employees with screenshot data
      const employeesWithScreenshots = freshData.filter(emp => emp.screenshot_count > 0).length;
      const totalScreenshots = freshData.reduce((sum, emp) => sum + (emp.screenshot_count || 0), 0);
      
      toastService.success(`✅ Successfully refreshed!\n📊 Loaded ${freshData.length} employees from CRM\n📸 ${employeesWithScreenshots} employees have screenshot data\n📈 Total screenshots: ${totalScreenshots.toLocaleString()}`);
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      toastService.error(`❌ Refresh failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (employeeId) => {
    console.log('View employee:', employeeId);
    // Implement view functionality
  };

  const handleEdit = (employeeId) => {
    console.log('Edit employee:', employeeId);
    // Implement edit functionality
  };

  const handleDelete = (employeeId) => {
    console.log('Delete employee:', employeeId);
    // Implement delete functionality with confirmation
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployeesData(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  return (
    <DashboardLayout headerTitle="Employee Management" headerBreadcrumb="Home / HR / Employees">
      <EmployeesWrapper isDarkMode={isDarkMode}>
        <EmployeesContainer>
          {/* Header Section */}
          <EmployeesHeader>
            <EmployeesTitle isDarkMode={isDarkMode}>
              🏢 CRM Employee Dashboard + 📸 Screenshot Analytics
            </EmployeesTitle>
            <EmployeesSubtitle isDarkMode={isDarkMode}>
              {loading ? 
                "🔄 Loading CRM employee data + Screenshot analytics from dxdtime.ddsolutions.io..." :
                employeesData.length > 0 ? 
                  `📊 Displaying ${employeesData.length} employees • ${stats.employeesWithScreenshots} with screenshot data • ${stats.totalScreenshots > 1000000 ? `${(stats.totalScreenshots / 1000000).toFixed(1)}M` : stats.totalScreenshots.toLocaleString()} total screenshots` :
                  "❌ No employee data found - Check API connections"
              }
            </EmployeesSubtitle>
          </EmployeesHeader>

          {/* Statistics Cards */}
          <StatsSummary>
            <StatsCard3D
              icon="👥"
              value={stats.totalEmployees}
              label="Total Employees"
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="📸"
              value={stats.totalScreenshots > 1000000 ? `${(stats.totalScreenshots / 1000000).toFixed(1)}M` : stats.totalScreenshots.toLocaleString()}
              label="Total Screenshots"
              color="#22c55e"
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="📁"
              value={stats.totalScreenshotProjects}
              label="Active Projects"
              color="#a855f7"
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="�"
              value={`${stats.totalStorageGB} GB`}
              label="Total Storage"
              color="#f59e0b"
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="⭐"
              value={stats.averageRating.toFixed(1)}
              label="Average Rating"
              color="#ef4444"
              isDarkMode={isDarkMode}
            />
          </StatsSummary>

          {/* Filters and Controls */}
          <FilterSection>
            <FilterInput
              type="text"
              placeholder="🔍 Search employees by name, email, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              isDarkMode={isDarkMode}
            />
            <button
              onClick={handleRefreshData}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: '14px',
                marginLeft: '10px'
              }}
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh Real Data'}
            </button>
          </FilterSection>

          {/* Employees Grid */}
          {loading ? (
            <LoadingSpinner isDarkMode={isDarkMode} />
          ) : filteredData.length === 0 ? (
            <NoDataMessage isDarkMode={isDarkMode}>
              No employees found matching your criteria
            </NoDataMessage>
          ) : (
            <EmployeesGrid>
              {filteredData.map((employee, index) => (
                <Employee3DCard
                  key={employee.id}
                  employee={employee}
                  index={index}
                  isDarkMode={isDarkMode}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </EmployeesGrid>
          )}
        </EmployeesContainer>
      </EmployeesWrapper>
    </DashboardLayout>
  );
};

export default Employees;
