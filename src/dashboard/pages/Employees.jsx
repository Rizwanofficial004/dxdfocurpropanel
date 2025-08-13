import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import EmployeeCards from '../components/employees/EmployeeCards';
import styled from 'styled-components';

const EmployeesPageWrapper = styled.div`
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
`;

// Additional styled components for the enhanced UI
const EmployeesWrapper = styled.div`
  padding: 2rem;
  background: ${props => props.isDarkMode ? '#1a202c' : '#f7fafc'};
  min-height: 100vh;
`;

const EmployeesContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const EmployeesHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const EmployeesTitle = styled.h1`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const EmployeesSubtitle = styled.p`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: ${props => props.isDarkMode ? '#2d3748' : '#ffffff'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.color || '#e2e8f0'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || '#3182ce'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem;
  border: 2px solid ${props => props.isDarkMode ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => props.isDarkMode ? '#2d3748' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 2px solid ${props => props.isDarkMode ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => props.isDarkMode ? '#2d3748' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
  }
`;

const EmployeesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  
  &::before {
    content: '⟳';
    font-size: 2rem;
    margin-right: 0.5rem;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 1.1rem;
`;

// Employee Card Styled Components
const EmployeeCard = styled.div`
  background: ${props => props.isDarkMode ? '#2d3748' : '#ffffff'};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid ${props => props.isDarkMode ? '#4a5568' : '#e2e8f0'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  }
`;

const EmployeeAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  overflow: hidden;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmployeeInfo = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const EmployeeName = styled.h3`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const EmployeeTitle = styled.p`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const EmployeeEmail = styled.p`
  color: ${props => props.isDarkMode ? '#81c784' : '#2e7d32'};
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const EmployeeContact = styled.p`
  color: ${props => props.isDarkMode ? '#90caf9' : '#1976d2'};
  font-size: 0.9rem;
`;

const EmployeeDetails = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.isDarkMode ? '#4a5568' : '#e2e8f0'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 0.85rem;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  font-size: 0.85rem;
  font-weight: 600;
`;

const RatingSection = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const RatingStars = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const Star = styled.span`
  font-size: 1.2rem;
  color: ${props => props.filled ? '#fbbf24' : '#d1d5db'};
`;

const RatingValue = styled.div`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    if (props.variant === 'primary') {
      return `
        background: #3182ce;
        color: white;
        &:hover { background: #2c5282; }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background: #38a169;
        color: white;
        &:hover { background: #2f855a; }
      `;
    } else if (props.variant === 'danger') {
      return `
        background: #e53e3e;
        color: white;
        &:hover { background: #c53030; }
      `;
    }
  }}
`;

// AI Insights Styled Components
const AIInsightsSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.isDarkMode ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'};
  border-radius: 8px;
  border-left: 4px solid #4299e1;
`;

const AIInsightsTitle = styled.h4`
  color: ${props => props.isDarkMode ? '#63b3ed' : '#3182ce'};
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AIInsightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const AIInsightItem = styled.li`
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#2d3748'};
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
  
  &:before {
    content: '✨';
    position: absolute;
    left: 0;
    color: #4299e1;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// OpenAI Integration for Employee Insights
const generateAIInsights = async (employee) => {
  try {
    // Prepare employee data for AI analysis
    const employeeContext = {
      name: employee.name,
      email: employee.email,
      jobTitle: employee.jobTitle || 'Not specified',
      department: employee.department || 'Not specified',
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
- Department: ${employeeContext.department}
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

// Fetch screenshot count data from API
const fetchScreenshotData = async () => {
  console.log('📸 Fetching screenshot data from API...');
  
  try {
    const response = await fetch('http://127.0.0.1:8010/api/actual-count-total/screenshots/', {
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
          percentage: user.percentage || 0
        };
      }
    });
    
    console.log(`📸 Successfully processed screenshot data for ${Object.keys(screenshotMap).length} users`);
    return {
      data: screenshotMap,
      total_screenshots: screenshotData.total_screenshots || 0,
      total_users: screenshotData.total_users || 0
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch screenshot data:', error);
    return {
      data: {},
      total_screenshots: 0,
      total_users: 0
    };
  }
};

// Fetch employees data directly from CRM API
const fetchEmployeesFromCRM = async () => {
  console.log('🏢 Fetching employees directly from CRM API...');
  
  try {
    const crmResponse = await fetch('https://crm.deluxebilisim.com/api/staffs', {
      method: 'GET',
      headers: {
        'authtoken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(30000)
    });
    
    if (!crmResponse.ok) {
      throw new Error(`CRM API Error: ${crmResponse.status} ${crmResponse.statusText}`);
    }
    
    const crmData = await crmResponse.json();
    console.log('🏢 CRM Response received:', crmData);
    
    // Process CRM staff data
    if (!Array.isArray(crmData)) {
      throw new Error('CRM API returned invalid data format');
    }
    
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
    const employees = crmData.map((staff, index) => {
      console.log(`🔄 Processing CRM staff: ${staff.firstname} ${staff.lastname}`);
      console.log(`📸 Profile image: ${staff.profile_image}`);
      console.log(`🆔 Staff ID: ${staff.staffid}`);
      
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
        department: staff.workplace ? getWorkplaceName(staff.workplace) : 'Not Assigned',
        hourlyRate: parseFloat(staff.hourly_rate) || 0,
        rating: Math.random() * 2 + 3, // 3-5 range since no rating in CRM
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
        performance_score: Math.round(Math.random() * 30 + 70), // Mock performance score
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
          percentage: 0
        };
        
        console.log(`📸 Screenshot data for ${employee.name} (${employee.email}):`, screenshotData);
        
        return {
          ...employee,
          ai_insights: aiInsights,
          // Add screenshot fields
          screenshot_count: screenshotData.screenshot_count,
          screenshot_last_updated: screenshotData.last_updated,
          screenshot_percentage: screenshotData.percentage,
          // Add total stats for reference
          total_screenshots_company: screenshotInfo.total_screenshots,
          total_users_company: screenshotInfo.total_users
        };
      })
    );
    
    console.log(`🎉 Successfully processed ${employeesWithAI.length} employees from CRM`);
    console.log(`📸 Merged screenshot data for ${Object.keys(screenshotInfo.data).length} users`);
    console.log(`📊 Company total screenshots: ${screenshotInfo.total_screenshots.toLocaleString()}`);
    console.log('📊 Sample employee with screenshot data:', employeesWithAI[0]);
    
    return employeesWithAI;
    
  } catch (error) {
    console.error('❌ CRM API failed:', error);
    console.log('🔄 Falling back to mock data...');
    return generateMockEmployeesFromCRM();
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

const getWorkplaceName = (workplace) => {
  const workplaces = {
    '0': 'Remote',
    '1': 'Main Office',
    '2': 'Branch Office'
  };
  return workplaces[workplace] || `Workplace ${workplace}`;
};

// Generate mock data based on your CRM structure
const generateMockEmployeesFromCRM = () => {
  const mockStaff = [
    // Complete CRM staff data from your API response (30+ employees)
    {
      staffid: '212', firstname: 'Zeynep', lastname: 'Avlamaz', email: 'zzavlamaz@gmail.com',
      phonenumber: '+905061448360', hourly_rate: '133.33', staff_identifi: 'PK00099', active: '0',
      datecreated: '2025-06-18 19:49:30'
    },
    {
      staffid: '221', firstname: 'Zahra', lastname: 'H', email: 'zahraawaaais@gmail.com',
      phonenumber: '+923155809288', hourly_rate: '1.00', staff_identifi: null, active: '1',
      datecreated: '2025-07-12 00:31:59', profile_image: 'Zahra.jpeg'
    },
    {
      staffid: '162', firstname: 'Yunus', lastname: 'Katırcı', email: 'yunussemrekatirci@gmail.com',
      phonenumber: '+905531463314', hourly_rate: '133.33', staff_identifi: 'PK00059', active: '1',
      datecreated: '2025-02-03 19:15:55'
    },
    {
      staffid: '211', firstname: 'Yunus', lastname: 'Acar', email: 'yunsacr@gmail.com',
      phonenumber: '', hourly_rate: '133.33', staff_identifi: 'PK00098', active: '0',
      datecreated: '2025-06-18 19:41:00'
    },
    {
      staffid: '190', firstname: 'Yiğit', lastname: 'Gündoğdu', email: 'yigitgundogdu2000@hotmail.com',
      phonenumber: '', hourly_rate: '133.33', staff_identifi: 'PK0464', active: '0',
      datecreated: '2025-04-04 13:23:54'
    },
    {
      staffid: '142', firstname: 'Yakup', lastname: 'Canözü', email: 'Yaup.61@gmail.com',
      phonenumber: '', hourly_rate: '110.00', staff_identifi: 'PK00042', active: '0',
      datecreated: '2024-11-06 19:07:24'
    },
    {
      staffid: '148', firstname: 'Ural', lastname: 'Şahin', email: 'u.sahin@deluxebilisim.com',
      phonenumber: '+90 544 725 19 51', hourly_rate: '0.00', staff_identifi: 'DDS041', active: '1',
      datecreated: '2024-12-08 12:31:38'
    },
    {
      staffid: '156', firstname: 'Tuğçe Hatice', lastname: 'Açıkyürek', email: 'acikyurektugce@gmail.com',
      phonenumber: '+905531784670', hourly_rate: '133.33', staff_identifi: 'PK00054', active: '0',
      datecreated: '2025-01-06 15:53:26'
    },
    {
      staffid: '141', firstname: 'Tuğba', lastname: 'Çalıkoğlu', email: 'tugbacalik84@gmail.com',
      phonenumber: '+905313504024', hourly_rate: '110.00', staff_identifi: 'PK00041', active: '1',
      datecreated: '2024-11-03 18:50:33'
    },
    {
      staffid: '152', firstname: 'Silinmiş', lastname: 'Personel', email: 'x@deluxebilisim.com',
      phonenumber: '', hourly_rate: '1.00', staff_identifi: null, active: '0',
      datecreated: '2024-12-28 17:36:39'
    },
    {
      staffid: '214', firstname: 'Shazif', lastname: 'Abbas', email: 'mirzashazif123@gmail.com',
      phonenumber: '+923089183285', hourly_rate: '132.36', staff_identifi: 'PK00101', active: '1',
      datecreated: '2025-06-23 17:40:26'
    },
    {
      staffid: '219', firstname: 'Selim', lastname: 'Yalçıntaş', email: 'selimyalcnts@gmail.com',
      phonenumber: '+905452292124', hourly_rate: '124.44', staff_identifi: 'PK00105', active: '1',
      datecreated: '2025-07-05 00:37:49'
    },
    {
      staffid: '172', firstname: 'Sarp', lastname: 'Boztürk', email: 'sarpbozturk@gmail.com',
      phonenumber: '+90 539 584 80 08', hourly_rate: '0.00', staff_identifi: null, active: '1',
      datecreated: '2025-02-19 09:29:24'
    },
    {
      staffid: '208', firstname: 'Ömer', lastname: 'Yalçın', email: 'omerfrkyalcin@gmail.com',
      phonenumber: '+90 541 104 01 04', hourly_rate: '124.44', staff_identifi: 'PK00095', active: '1',
      datecreated: '2025-06-14 15:18:10', profile_image: 'PNG görüntüsü.png'
    },
    {
      staffid: '203', firstname: 'Nawaz', lastname: 'Muhammed', email: 'nawaz@dxdglobal.com',
      phonenumber: '+923451555566', hourly_rate: '0.00', staff_identifi: 'PK0465', active: '1',
      datecreated: '2025-06-03 23:03:29', profile_image: 'WhatsApp Image 2025-06-14 at 11.36.16 (1).jpeg'
    },
    {
      staffid: '215', firstname: 'Mohsin', lastname: 'Abbass', email: 'mohsinabbass688630@gmail.com',
      phonenumber: '+923106977673', hourly_rate: '132.36', staff_identifi: 'PK00102', active: '1',
      datecreated: '2025-06-24 09:34:46'
    },
    {
      staffid: '56', firstname: 'Merve', lastname: 'Balkılıç', email: 'm.balkilic@deluxebilisim.com',
      phonenumber: '', hourly_rate: '160.00', staff_identifi: '3', active: '0',
      datecreated: '2023-04-07 09:14:33'
    },
    {
      staffid: '222', firstname: 'Mehmet Fırat', lastname: 'Fidan', email: 'm.fidan.firat@gmail.com',
      phonenumber: '+905444807191', hourly_rate: '155.55', staff_identifi: 'PK00107', active: '1',
      datecreated: '2025-07-12 13:47:07'
    },
    {
      staffid: '37', firstname: 'Mehmet Fatih', lastname: 'Önk', email: 'fatih.onk@deluxebilisim.com',
      phonenumber: '+90 531 318 50 82', hourly_rate: '170.00', staff_identifi: '11', active: '1',
      datecreated: '2022-04-30 13:21:04'
    },
    {
      staffid: '218', firstname: 'Mansoor Ur', lastname: 'Rehman', email: 'mansoorurrehman@live.com',
      phonenumber: '+92 300 46 33 393', hourly_rate: '124.44', staff_identifi: 'PK0466', active: '1',
      datecreated: '2025-06-28 11:06:49'
    },
    {
      staffid: '179', firstname: 'Kevser', lastname: 'Gündoğdu', email: 'kevserhuseyin18@gmail.com',
      phonenumber: '+90 554 115 53 53', hourly_rate: '110.00', staff_identifi: 'PK00072', active: '1',
      datecreated: '2025-02-28 12:27:25'
    },
    {
      staffid: '189', firstname: 'İlahe', lastname: 'Avcı', email: 'ilahe.avci2004@gmail.com',
      phonenumber: '+905527244924', hourly_rate: '104.44', staff_identifi: 'PK00082', active: '1',
      datecreated: '2025-03-28 16:51:03'
    },
    {
      staffid: '188', firstname: 'Hamza', lastname: 'Haseeb', email: 'haseebcodejourney@gmail.com',
      phonenumber: '+90 548 831 2137', hourly_rate: '164.44', staff_identifi: 'PK00081', active: '1',
      datecreated: '2025-03-27 15:41:11', profile_image: 'profile_hamza.jpg'
    },
    {
      staffid: '180', firstname: 'Gülsüm Melisa', lastname: 'Arı', email: 'gulsummelisa.23@gmail.com',
      phonenumber: '+90 531 839 4807', hourly_rate: '111.11', staff_identifi: 'PK00073', active: '1',
      datecreated: '2025-03-01 10:40:21'
    },
    {
      staffid: '73', firstname: 'Furkan', lastname: 'Aydın', email: 'frknaydinresmi@gmail.com',
      phonenumber: '+905380611224', hourly_rate: '115.00', staff_identifi: 'PK0248', active: '1',
      datecreated: '2023-06-03 13:00:40'
    },
    {
      staffid: '1', firstname: 'Deniz', lastname: 'Üstündağ', email: 'deniz@dxdglobal.com',
      phonenumber: '905488591559', hourly_rate: '300.00', staff_identifi: 'PK0001', active: '1',
      datecreated: '2020-12-29 16:01:33', profile_image: 'deniz_profile.jpg'
    },
    {
      staffid: '217', firstname: 'Danish', lastname: 'Ali', email: 'danish.ali9801@gmail.com',
      phonenumber: '+923248414335', hourly_rate: '132.53', staff_identifi: 'PK00104', active: '1',
      datecreated: '2025-06-27 12:12:56'
    },
    {
      staffid: '39', firstname: 'Çağla', lastname: 'Şahar', email: 'cagla.shr@gmail.com',
      phonenumber: '+905523431849', hourly_rate: '120.00', staff_identifi: 'PK0035', active: '1',
      datecreated: '2022-05-07 13:19:39'
    },
    {
      staffid: '146', firstname: 'Begüm Damla', lastname: 'Şen', email: 'begumdamlasen@gmail.com',
      phonenumber: '+905453994271', hourly_rate: '105.00', staff_identifi: 'PK00046', active: '1',
      datecreated: '2024-11-19 14:55:21', profile_image: 'IMG_20241206_004826_089.jpg'
    },
    {
      staffid: '223', firstname: 'Aybüke Fatma', lastname: 'Çetin Bozkurt', email: 'aybuke.designer@gmail.com',
      phonenumber: '05309310105', hourly_rate: '142.22', staff_identifi: 'PK00108', active: '1',
      datecreated: '2025-07-15 13:20:28'
    },
    {
      staffid: '187', firstname: 'Atakan İzzet', lastname: 'Kahraman', email: 'atakankahraman35@outlook.com',
      phonenumber: '+90 5346649598', hourly_rate: '133.33', staff_identifi: 'PK00080', active: '1',
      datecreated: '2025-03-27 14:12:04'
    }
  ];

  return mockStaff.map((staff, index) => {
    // Use your specified URL pattern: staffid/thumb_profile_image (with proper encoding)
    const avatarUrl = staff.profile_image ? 
      `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.staffid}/thumb_${encodeURIComponent(staff.profile_image)}` : 
      null;
    const avatarThumbUrl = staff.profile_image ? 
      `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.staffid}/thumb_${encodeURIComponent(staff.profile_image)}` : 
      null;
    const avatarOriginalUrl = staff.profile_image ? 
      `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.staffid}/${encodeURIComponent(staff.profile_image)}` : 
      null;
    
    if (staff.profile_image) {
      console.log(`🖼️ Mock Avatar URLs for ${staff.firstname}:`);
      console.log(`   Main: ${avatarUrl}`);
      console.log(`   Thumb: ${avatarThumbUrl}`);
      console.log(`   Original: ${avatarOriginalUrl}`);
    }
    
    return ({
    id: staff.staffid,
    name: `${staff.firstname} ${staff.lastname}`,
    email: staff.email,
    phone: staff.phonenumber || 'No Phone',
    jobTitle: 'Developer',
    department: 'Development',
    hourlyRate: parseFloat(staff.hourly_rate),
    rating: Math.random() * 2 + 3,
    status: staff.active === '1' ? 'Active' : 'Inactive',
    joinDate: staff.datecreated.split(' ')[0],
    location: 'Remote',
    avatar: avatarUrl,
    avatar_thumb: avatarThumbUrl,
    avatar_original: avatarOriginalUrl,
    initials: staff.firstname.charAt(0) + staff.lastname.charAt(0),
    staff_id: staff.staff_identifi || `ID_${staff.staffid}`,
    staffid: staff.staffid, // Add staffid for debugging
    profile_image: staff.profile_image, // Add profile_image for debugging
    performance_score: Math.round(Math.random() * 30 + 70),
    ai_insights: [
      `� Hourly Rate: ₺${staff.hourly_rate}/hr`,
      `� Phone: ${staff.phonenumber}`,
      `� Staff ID: ${staff.staff_identifi}`,
      `📅 Joined: ${staff.datecreated.split(' ')[0]}`
    ],
    crm_staff_id: staff.staff_identifi,
    crm_hourly_rate: staff.hourly_rate,
    crm_phonenumber: staff.phonenumber
  });
});
};

// Generate mock employees as fallback
const generateMockEmployees = () => {
  const mockUsers = [
    { email: 'amirishaque67@gmail.com', username: 'amirishaque67', file_count: 1000, storage_mb: 222.65 },
    { email: 'atakankahraman35@outlook.com', username: 'atakankahraman35', file_count: 1000, storage_mb: 418.37 },
    { email: 'begumdamlasen@gmail.com', username: 'begumdamlasen', file_count: 1000, storage_mb: 475.07 },
    { email: 'haseebcodejourney@gmail.com', username: 'haseebcodejourney', file_count: 850, storage_mb: 320.12 }
  ];

  return mockUsers.map((user, index) => {
    const domain = user.email.split('@')[1];
    const department = domain.includes('gmail') ? 'External' : 
                      domain.includes('outlook') ? 'External' : 'Internal';
    
    return {
      id: user.email.replace(/[^a-zA-Z0-9]/g, ''),
      name: user.username.charAt(0).toUpperCase() + user.username.slice(1),
      email: user.email,
      phone: '+1 (555) ' + Math.random().toString().substr(2, 8),
      jobTitle: user.file_count > 800 ? 'Senior Developer' : 'Developer',
      department: department,
      hourlyRate: Math.min(Math.max(Math.round(user.file_count / 20), 15), 150),
      rating: Math.min(Math.max((user.file_count / 200) + (user.storage_mb / 100), 1), 5),
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      location: domain.includes('gmail') ? 'Remote' : 'Office',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      initials: user.username.substring(0, 2).toUpperCase(),
      staff_id: 'MOCK_' + (index + 1).toString().padStart(3, '0'),
      staffid: 'MOCK_' + (index + 1).toString().padStart(3, '0'), // Add staffid for debugging
      profile_image: null, // Mock data doesn't have real profile images
      performance_score: Math.round((user.file_count / 200) * 20),
      ai_insights: [
        `Has ${user.file_count} screenshots stored`,
        `Total storage: ${user.storage_mb} MB`,
        'File types: webp',
        `Activity level: ${user.file_count > 500 ? 'High' : 'Medium'}`
      ],
      is_logged_in: true,
      last_activity: new Date().toISOString(),
      currency: 'TL',
      screenshots_folder: `screenshots/${user.username}_at_${domain.replace('.', '_')}/`,
      file_count: user.file_count,
      storage_size_mb: user.storage_mb,
      folder_name: `${user.username}_at_${domain.replace('.', '_')}`
    };
  });
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
          <DetailLabel isDarkMode={isDarkMode}>🏢 Department</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>{employee.department || 'Not Assigned'}</DetailValue>
        </DetailItem>
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
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Fetch employees data directly from CRM API on component mount
  useEffect(() => {
    const loadCRMEmployees = async () => {
      setLoading(true);
      try {
        console.log('🔄 Loading employees directly from CRM API...');
        const crmEmployeesData = await fetchEmployeesFromCRM();
        console.log(`🎉 Successfully loaded ${crmEmployeesData.length} employees from CRM`);
        console.log('📋 Employee names:', crmEmployeesData.map(emp => emp.name));
        
        // Debug profile images
        console.log('\n📸 PROFILE IMAGE DEBUG:');
        crmEmployeesData.forEach((emp, index) => {
          console.log(`${index + 1}. ${emp.name} (ID: ${emp.staffid}):`, {
            profile_image: emp.profile_image,
            hasAvatar: !!emp.avatar,
            avatarUrl: emp.avatar,
            avatarThumb: emp.avatar_thumb,
            avatarOriginal: emp.avatar_original,
            avatarAlt: emp.avatar_alt
          });
        });
        console.log('📸 ===============================\n');
        
        setEmployeesData(crmEmployeesData);
      } catch (error) {
        console.error('❌ Failed to load CRM employee data:', error);
        console.log('🔄 CRM API failed, using fallback data...');
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
    departments: new Set(employeesData.map(emp => emp.department).filter(dept => dept && dept !== 'null')).size || 0
  };

  console.log('📊 Current Statistics:', stats);
  console.log('📊 Employees Data Length:', employeesData.length);
  console.log('📊 Sample Employee:', employeesData[0]);

  // Filter data based on search and filters with null checks
  const filteredData = employeesData.filter(employee => {
    if (!employee) return false;
    
    const name = employee.name || '';
    const email = employee.email || '';
    const jobTitle = employee.jobTitle || '';
    const department = employee.department || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'All' || department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter (excluding null/undefined)
  const departments = ['All', ...new Set(employeesData.map(emp => emp.department).filter(dept => dept))];

  const handleRefreshData = async () => {
    console.log('🔄 Manual refresh requested...');
    setLoading(true);
    try {
      const freshData = await fetchEmployeesFromCRM();
      setEmployeesData(freshData);
      alert(`✅ Successfully refreshed! Loaded ${freshData.length} employees from CRM database.`);
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      alert(`❌ Refresh failed: ${error.message}`);
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
              🏢 CRM Employee Dashboard - Staff ID | Hourly Rate | Phone Number
            </EmployeesTitle>
            <EmployeesSubtitle isDarkMode={isDarkMode}>
              {loading ? 
                "🔄 Loading employee data from CRM API (crm.deluxebilisim.com/api/staffs)..." :
                employeesData.length > 0 ? 
                  `📊 Displaying ${employeesData.length} employees with Staff ID, Hourly Rate, and Phone Number from CRM` :
                  "❌ No employee data found - Check CRM API connection"
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
              icon="⭐"
              value={stats.averageRating.toFixed(1)}
              label="Average Rating"
              color="#fbbf24"
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="💰"
              value={`$${stats.averageHourlyRate}`}
              label="Avg Hourly Rate"
              color="#10b981"
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="🏢"
              value={stats.departments}
              label="Departments"
              color="#8b5cf6"
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
            <FilterSelect
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              isDarkMode={isDarkMode}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </FilterSelect>
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
