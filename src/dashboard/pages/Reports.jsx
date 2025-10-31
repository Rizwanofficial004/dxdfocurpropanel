import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Main wrapper
const ReportsWrapper = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: hidden;
`;

// Layout container
const ReportsLayout = styled.div`
  display: flex;
  gap: 24px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: hidden;
  min-width: 0;
`;

// Left sidebar for employee selection
const EmployeeSelection = styled.div`
  width: 300px;
  min-width: 280px;
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const EmployeeHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
  text-transform: uppercase;
`;

const EmployeeSearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const EmployeeList = styled.div`
  overflow-y: auto;
`;

const EmployeeItem = styled.div`
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  background: ${props => props.selected ? props.theme.colors.primary + '20' : 'transparent'};
  border: ${props => props.selected ? `1px solid ${props.theme.colors.primary}` : '1px solid transparent'};
  
  &:hover {
    background: ${props => props.theme.colors.primary}10;
  }
`;
const EmployeeInner = styled.div` 

`;
const EmployeeName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const EmployeeDepartment = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

// Right content area for reports
const ReportsContent = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: hidden;
  min-width: 0;
`;

const ReportsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ActivePassiveContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const TimeSection = styled.div`
  text-align: center;
`;

const TimeSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const TimeSectionValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.color || props.theme.colors.primary};
`;

// Time breakdown grid
const TimeBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
  margin-top: 20px;
`;

const TimeCategory = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid ${props => props.theme.colors.border};
`;

const CategoryHeader = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const CategoryValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const CategoryPercentage = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.text.tertiary};
`;

const CategoryIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: ${props => props.color};
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
`;

// Filter Components
const FilterSection = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const FilterLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  width: 100%;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
  width: 100%;
`;

const CalendarDay = styled.div`
  padding: 6px 2px;
  text-align: center;
  font-size: 10px;
  cursor: pointer;
  border-radius: 4px;
  background: ${props => {
    if (props.selected) return '#3b82f6';
    if (props.today) return '#10b981';
    return props.theme.colors.surface;
  }};
  color: ${props => {
    if (props.selected || props.today) return 'white';
    return props.theme.colors.text.primary;
  }};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      if (props.selected) return '#3b82f6';
      if (props.today) return '#10b981';
      return props.theme.colors.primary + '20';
    }};
  }
`;

const DayHeader = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.tertiary};
  margin-bottom: 2px;
  text-transform: uppercase;
`;

const HourGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
  width: 100%;
`;

const HourSlot = styled.div`
  padding: 6px 4px;
  text-align: center;
  font-size: 10px;
  font-weight: 500;
  border-radius: 4px;
  background: ${props => {
    if (props.selected) return '#3b82f6';
    return props.theme.colors.surface;
  }};
  color: ${props => props.selected ? 'white' : props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.selected ? '#3b82f6' : props.theme.colors.primary + '20'};
  }
`;

const SummaryContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 16px;
`;

const SummaryText = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  
  span {
    color: ${props => props.theme.colors.primary};
  }
`;

// Tab Navigation Components
const TabContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${props => props.theme.mode === 'dark' ? '#1e293b' : '#f8fafc'};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 24px;
  gap: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const TabScrollContainer = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scroll-behavior: smooth;
  flex: 1;
  padding: 0 4px;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid ${props => props.active ? 'transparent' : props.theme.colors.border};
  border-radius: 8px;
  background: ${props => {
    if (props.active) {
      return props.theme.mode === 'dark' ? '#3b82f6' : '#2563eb';
    }
    return props.theme.mode === 'dark' ? '#374151' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return 'white';
    return props.theme.mode === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: fit-content;
  flex-shrink: 0;
  box-shadow: ${props => props.active ? '0 4px 8px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    background: ${props => {
      if (props.active) return props.theme.mode === 'dark' ? '#3b82f6' : '#2563eb';
      return props.theme.mode === 'dark' ? '#4b5563' : '#f1f5f9';
    }};
    transform: translateY(-1px);
    box-shadow: ${props => props.active ? '0 6px 12px rgba(59, 130, 246, 0.4)' : '0 4px 8px rgba(0, 0, 0, 0.15)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const TabIcon = styled.span`
  font-size: 14px;
  opacity: ${props => props.active ? 1 : 0.7};
`;

const NavigationArrow = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? '#374151' : '#ffffff'};
  color: ${props => props.theme.mode === 'dark' ? '#e5e7eb' : '#374151'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.mode === 'dark' ? '#4b5563' : '#f1f5f9'};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
    background: ${props => props.theme.mode === 'dark' ? '#1f2937' : '#f9fafb'};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// Top Activity Components
const TopActivityContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

const TopActivityHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TopActivityTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

const TopActivityContent = styled.div`
  padding: 24px;
`;

const WorkTimeSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
`;

const WorkTimeStats = styled.div`
  flex: 1;
`;

const WorkTimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WorkTimeLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color || props.theme.colors.text.primary};
  text-transform: uppercase;
  min-width: 80px;
`;

const WorkTimeBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const WorkTimeProgress = styled.div`
  height: 100%;
  background: ${props => props.color};
  width: ${props => props.percentage}%;
  border-radius: 4px;
`;

const WorkTimeValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  min-width: 60px;
`;

const WorkTimePercentage = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  min-width: 40px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  min-width: 120px;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const UserDuration = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const ApplicationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const ApplicationCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AppIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.color};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 12px;
`;

const AppName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const AppDuration = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const AppPercentage = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.tertiary};
`;

// Breaks & Meetings Components
const BreaksMeetContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const BreakMeetSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

const BreakMeetHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BreakMeetTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

const InfoIcon = styled.span`
  width: 16px;
  height: 16px;
  background: ${props => props.theme.colors.text.tertiary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const BreakMeetTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const BreakMeetTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const BreakMeetHeaderRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const BreakMeetHeaderCell = styled.th`
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BreakMeetTableBody = styled.tbody``;

const BreakMeetRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.background + '50'};
  }
`;

const BreakMeetCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  
  &.total-row {
    font-weight: 600;
    background: ${props => props.theme.colors.background};
  }
`;

const DefinedBreakSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 24px;
`;

const DefinedBreakHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DefinedBreakTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

// Task Table Components (for TASK tab)
const TaskContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

const TaskHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TaskTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

const TaskTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TaskTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const TaskHeaderRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TaskHeaderCell = styled.th`
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TaskTableBody = styled.tbody``;

const TaskRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.background + '50'};
  }
`;

const TaskCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  
  &.total-row {
    font-weight: 600;
    background: ${props => props.theme.colors.background};
  }
`;

// IDLE Tab Components
const IdleContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const IdleTableSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

const IdleChartSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

const IdleHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const IdleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

const IdleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const IdleTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const IdleHeaderRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const IdleHeaderCell = styled.th`
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const IdleTableBody = styled.tbody``;

const IdleRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.background + '50'};
  }
`;

const IdleCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  
  &.total-row {
    font-weight: 600;
    background: ${props => props.theme.colors.background};
  }
`;

const PieChartWrapper = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
`;

const PieChart = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0deg 18deg,
    #e5e7eb 18deg 360deg
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  
  &::before {
    content: '';
    width: 120px;
    height: 120px;
    background: ${props => props.theme.colors.surface};
    border-radius: 50%;
    position: absolute;
  }
  
  &::after {
    content: '95%';
    position: absolute;
    z-index: 1;
    font-size: 24px;
    font-weight: 700;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.text.primary};
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  background: ${props => props.color};
  border-radius: 2px;
`;

const LegendText = styled.span`
  font-weight: 500;
`;

// Time Log Summary Sub-tabs
const TimeLogSummaryContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

const TimeLogSummaryHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TimeLogSummaryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

const SubTabContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const SubTabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid ${props => props.active ? 'transparent' : props.theme.colors.border};
  border-radius: 8px;
  background: ${props => {
    if (props.active) {
      return props.theme.mode === 'dark' ? '#3b82f6' : '#2563eb';
    }
    return props.theme.mode === 'dark' ? '#374151' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return 'white';
    return props.theme.mode === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  
  &:hover {
    background: ${props => {
      if (props.active) return props.theme.mode === 'dark' ? '#3b82f6' : '#2563eb';
      return props.theme.mode === 'dark' ? '#4b5563' : '#f1f5f9';
    }};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SubTabIcon = styled.span`
  font-size: 14px;
  opacity: ${props => props.active ? 1 : 0.7};
`;

const HelpIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.theme.colors.text.tertiary};
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  margin-left: 8px;
`;

const TimeLogContent = styled.div`
  padding: 24px;
  min-height: 400px;
`;

// Weekly Report Table Components
const WeeklyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const WeeklyTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const WeeklyHeaderRow = styled.tr`
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

const WeeklyHeaderCell = styled.th`
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.background + '80'};
  }
`;

const SortIcon = styled.span`
  margin-left: 8px;
  font-size: 10px;
  opacity: 0.6;
`;

const WeeklyTableBody = styled.tbody``;

const WeeklyRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.background + '50'};
  }
  
  &:hover {
    background: ${props => props.theme.colors.primary}10;
  }
`;

const WeeklyCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const EmployeeNameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WeeklyEmployeeName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  font-size: 14px;
`;

const EmployeeTeams = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const HoursCell = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const NotEnoughData = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.tertiary};
  font-style: italic;
`;

const NoteText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 16px;
  padding: 12px 16px;
  background: ${props => props.theme.colors.background};
  border-radius: 6px;
  border-left: 3px solid ${props => props.theme.colors.primary};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 20px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
`;

const PaginationLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PaginationSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PaginationArrow = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.3;
  }
`;

const Reports = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedDate, setSelectedDate] = useState('27');
  const [selectedHour, setSelectedHour] = useState('All');
  const [activeTab, setActiveTab] = useState('TASK');
  const [activeTimeLogTab, setActiveTimeLogTab] = useState('WEEKLY');

  // Tab scroll states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabScrollRef = React.useRef(null);

  // Tab data
  const tabs = [
    { id: 'SCREENS', name: 'SCREENS', icon: '🖥️' },
    { id: 'FOCUS_TIMELINE', name: 'FOCUS TIMELINE', icon: '⏱️' },
    { id: 'TASK', name: 'TASK', icon: '📋' },
    { id: 'ACTIVITY_PATTERN', name: 'ACTIVITY PATTERN', icon: '📊' },
    { id: 'TOP_ACTIVITY', name: 'TOP ACTIVITY', icon: '🔥' },
    { id: 'OT_REPORT', name: 'OT REPORT', icon: '📈' },
    { id: 'MONITORING_ACTIONS', name: 'MONITORING ACTIONS', icon: '👁️' },
    { id: 'BREAKS_MEET', name: 'BREAKS & MEET', icon: '☕' },
    { id: 'IDLE', name: 'IDLE', icon: '😴' },
    { id: 'OFFLINE', name: 'OFFLINE', icon: '📴' },
    { id: 'TIME_LOG_SUMMARY', name: 'TIME LOG SUMMARY', icon: '📅' },
  ];

  // Task data for TASK tab
  const taskData = [
    {
      name: 'BackEnd Work',
      project: 'Software development',
      start: '7:56 PM',
      stop: '8:21 PM',
      duration: '0h 24m'
    },
    {
      name: 'BackEnd Work',
      project: 'Software development',
      start: '4:34 PM',
      stop: '7:32 PM',
      duration: '2h 57m'
    },
    {
      name: 'BackEnd Work',
      project: 'Software development',
      start: '4:21 PM',
      stop: '4:34 PM',
      duration: '0h 13m'
    }
  ];

  // Calculate total duration
  const totalDuration = '3h 35m';

  // Work time data for TOP_ACTIVITY tab
  const workTimeData = [
    { label: 'IDLE', value: '0h 6m', percentage: 1.82, color: '#6b7280' },
    { label: 'MEETING', value: '0h 20m', percentage: 6.19, color: '#3b82f6' },
    { label: 'BREAKS', value: '0h 54m', percentage: 16.14, color: '#f97316' },
    { label: 'Active hours', value: '4h 30m', percentage: 82.04, color: '#10b981' },
  ];

  // Application usage data
  const applicationData = [
    { name: 'Google-chrome', duration: '3h 25m', percentage: '98%', color: '#4285f4' },
    { name: 'Wine', duration: '0h 15m', percentage: '22%', color: '#8b5cf6' },
    { name: 'firefox', duration: '0h 3m', percentage: '3%', color: '#ff7139' },
    { name: 'Google-chrome-s', duration: '0h 1m', percentage: '2%', color: '#4285f4' },
    { name: 'libreoffice-calc', duration: '0h 1m', percentage: '1%', color: '#0369a1' },
  ];

  // Break data for BREAKS_MEET tab
  const breakData = [
    { start: '2:24 PM', stop: '3:17 PM', duration: '0h 53m' }
  ];

  // Meeting data for BREAKS_MEET tab
  const meetingData = [
    { start: '2:03 PM', stop: '2:24 PM', duration: '0h 20m' }
  ];

  // Defined break data
  const definedBreakData = [
    { start: '11:00 AM', stop: '11:15 AM', duration: '0h 15m' },
    { start: '2:00 PM', stop: '2:30 PM', duration: '0h 30m' },
    { start: '5:30 PM', stop: '5:45 PM', duration: '0h 15m' }
  ];

  // IDLE data for IDLE tab
  const idleData = [
    { start: '10:59 AM', stop: '11:11 AM', duration: '0h 12m' },
    { start: '11:25 AM', stop: '11:29 AM', duration: '0h 4m' },
    { start: '4:26 PM', stop: '4:31 PM', duration: '0h 5m' },
    { start: '5:08 PM', stop: '5:13 PM', duration: '0h 5m' },
    { start: '6:39 PM', stop: '6:42 PM', duration: '0h 3m' }
  ];

  // OFFLINE data for OFFLINE tab
  const offlineData = [
    { start: '10:59 AM', stop: '11:11 AM', duration: '0h 12m' },
    { start: '11:25 AM', stop: '11:29 AM', duration: '0h 4m' },
    { start: '4:26 PM', stop: '4:31 PM', duration: '0h 5m' },
    { start: '5:08 PM', stop: '5:13 PM', duration: '0h 5m' },
    { start: '6:39 PM', stop: '6:42 PM', duration: '0h 3m' }
  ];

  // Sample employee data
  const sampleEmployees = [
    { id: 1, name: 'Abaa', department: 'No Department', selected: true },
    { id: 2, name: 'John Smith', department: 'Engineering' },
    { id: 3, name: 'Sarah Johnson', department: 'Marketing' },
    { id: 4, name: 'Mike Wilson', department: 'Sales' },
    { id: 5, name: 'Lisa Chen', department: 'Design' },
  ];

  // Weekly Report data
  const weeklyReportData = [
    { name: 'Aba', teams: 'Sales,Auditing Team,Finance', apr2024: '31h 29m', mar2024: '36h 25m', feb2024: null },
    { name: 'Adams', teams: 'Sales & Marketting,Auditing Team', apr2024: '20h 25m', mar2024: null, feb2024: '0h 3m' },
    { name: 'Alita', teams: 'Promotion,IT Team', apr2024: '0h 12m', mar2024: '8h 9m', feb2024: '0h 5m' },
    { name: 'Diana', teams: 'Auditing Team', apr2024: '13h 43m', mar2024: '8h 52m', feb2024: '0h 24m' },
    { name: 'farina', teams: 'HR Admin,Back Office', apr2024: null, mar2024: null, feb2024: '0h 45m' },
    { name: 'Veronica', teams: 'Marketing,Sales,Auditing Team', apr2024: '4h 5m', mar2024: null, feb2024: null },
    { name: 'Alexei', teams: 'Finance,Auditing Team', apr2024: null, mar2024: null, feb2024: null },
  ];

  // Filter options
  const years = ['2023', '2024', '2025'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  const dates = Array.from({length: 31}, (_, i) => (i + 1).toString());
  const hours = ['All', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', 
                '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];

  // Calendar days for display
  const calendarDays = [
    { day: 17, dayName: 'Sat' },
    { day: 18, dayName: 'Sun' },
    { day: 19, dayName: 'Mon' },
    { day: 20, dayName: 'Tue' },
    { day: 21, dayName: 'Wed' },
    { day: 22, dayName: 'Thu' },
    { day: 23, dayName: 'Fri' },
    { day: 24, dayName: 'Sat' },
    { day: 25, dayName: 'Sun' },
    { day: 26, dayName: 'Mon' },
    { day: 27, dayName: 'Tue', selected: true },
    { day: 28, dayName: 'Wed', today: true },
  ];

  // Sample time data
  const timeData = {
    loggedTime: '9h 50m',
    productive: '3h 19m',
    distraction: '0h 12m',
    neutral: '0h 40m',
    meetings: '4h 13m',
    break: '0h 55m',
    idle: '0h 29m',
    offline: '0h 0m',
    activeHours: '8h 25m',
    passiveHours: '1h 24m'
  };

  useEffect(() => {
    setEmployees(sampleEmployees);
    setSelectedEmployee(sampleEmployees[0]);
  }, []);

  const checkScrollButtons = useCallback(() => {
    if (tabScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollTabs = useCallback((direction) => {
    if (tabScrollRef.current) {
      const scrollAmount = 250;
      const newScrollLeft = direction === 'left' 
        ? tabScrollRef.current.scrollLeft - scrollAmount
        : tabScrollRef.current.scrollLeft + scrollAmount;
      
      tabScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollButtons, 300);
    }
  }, [checkScrollButtons]);

  useEffect(() => {
    // Multiple checks to ensure DOM is ready
    const timer1 = setTimeout(checkScrollButtons, 50);
    const timer2 = setTimeout(checkScrollButtons, 200);
    const timer3 = setTimeout(checkScrollButtons, 500);
    
    // Add scroll detection when component mounts and when window resizes
    const handleResize = () => {
      setTimeout(checkScrollButtons, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollButtons]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'TASK':
        return (
          <TaskContainer theme={theme}>
            <TaskHeader theme={theme}>
              <TaskTitle theme={theme}>Task</TaskTitle>
            </TaskHeader>
            <TaskTable>
              <TaskTableHeader theme={theme}>
                <TaskHeaderRow>
                  <TaskHeaderCell theme={theme}>Name</TaskHeaderCell>
                  <TaskHeaderCell theme={theme}>Project</TaskHeaderCell>
                  <TaskHeaderCell theme={theme}>Start</TaskHeaderCell>
                  <TaskHeaderCell theme={theme}>Stop</TaskHeaderCell>
                  <TaskHeaderCell theme={theme}>Duration</TaskHeaderCell>
                </TaskHeaderRow>
              </TaskTableHeader>
              <TaskTableBody>
                {taskData.map((task, index) => (
                  <TaskRow key={index}>
                    <TaskCell theme={theme}>{task.name}</TaskCell>
                    <TaskCell theme={theme}>{task.project}</TaskCell>
                    <TaskCell theme={theme}>{task.start}</TaskCell>
                    <TaskCell theme={theme}>{task.stop}</TaskCell>
                    <TaskCell theme={theme}>{task.duration}</TaskCell>
                  </TaskRow>
                ))}
                <TaskRow>
                  <TaskCell theme={theme} className="total-row">Total duration</TaskCell>
                  <TaskCell theme={theme} className="total-row"></TaskCell>
                  <TaskCell theme={theme} className="total-row"></TaskCell>
                  <TaskCell theme={theme} className="total-row"></TaskCell>
                  <TaskCell theme={theme} className="total-row">{totalDuration}</TaskCell>
                </TaskRow>
              </TaskTableBody>
            </TaskTable>
          </TaskContainer>
        );
      
      case 'SCREENS':
        return (
          <div style={{ padding: '40px', textAlign: 'center', background: theme.colors.surface, borderRadius: '8px' }}>
            <h3>Screens View</h3>
            <p>Screen capture and monitoring data will be displayed here.</p>
          </div>
        );
      
      case 'FOCUS_TIMELINE':
        return (
          <div style={{ padding: '40px', textAlign: 'center', background: theme.colors.surface, borderRadius: '8px' }}>
            <h3>Focus Timeline</h3>
            <p>Timeline view of focus and productivity patterns.</p>
          </div>
        );
      
      case 'ACTIVITY_PATTERN':
        return (
          <div style={{ padding: '40px', textAlign: 'center', background: theme.colors.surface, borderRadius: '8px' }}>
            <h3>Activity Pattern</h3>
            <p>Detailed activity pattern analysis and charts.</p>
          </div>
        );
      
      case 'TOP_ACTIVITY':
        return (
          <TopActivityContainer theme={theme}>
            <TopActivityHeader theme={theme}>
              <TopActivityTitle theme={theme}>Work Time</TopActivityTitle>
            </TopActivityHeader>
            <TopActivityContent theme={theme}>
              <WorkTimeSection>
                <WorkTimeStats>
                  {workTimeData.map((item, index) => (
                    <WorkTimeItem key={index}>
                      <WorkTimeLabel theme={theme} color={item.color}>
                        {item.label}
                      </WorkTimeLabel>
                      <span style={{ fontSize: '12px', minWidth: '20px' }}>{index + 1}</span>
                      <WorkTimeBar theme={theme}>
                        <WorkTimeProgress color={item.color} percentage={item.percentage} />
                      </WorkTimeBar>
                      <WorkTimeValue theme={theme}>{item.value}</WorkTimeValue>
                      <WorkTimePercentage theme={theme}>{item.percentage}%</WorkTimePercentage>
                    </WorkTimeItem>
                  ))}
                </WorkTimeStats>
                <UserInfo theme={theme}>
                  <UserName theme={theme}>ABAA</UserName>
                  <UserDuration theme={theme}>(5h 30m)</UserDuration>
                </UserInfo>
              </WorkTimeSection>
              
              <ApplicationsGrid>
                {applicationData.map((app, index) => (
                  <ApplicationCard key={index} theme={theme}>
                    <AppIcon color={app.color}>
                      {app.percentage}
                    </AppIcon>
                    <AppName theme={theme}>{app.name}</AppName>
                    <AppDuration theme={theme}>{app.duration}</AppDuration>
                  </ApplicationCard>
                ))}
              </ApplicationsGrid>
            </TopActivityContent>
          </TopActivityContainer>
        );
      
      case 'OT_REPORT':
        return (
          <div style={{ padding: '40px', textAlign: 'center', background: theme.colors.surface, borderRadius: '8px' }}>
            <h3>OT Report</h3>
            <p>Overtime tracking and analysis reports.</p>
          </div>
        );
      
      case 'MONITORING_ACTIONS':
        return (
          <div style={{ padding: '40px', textAlign: 'center', background: theme.colors.surface, borderRadius: '8px' }}>
            <h3>Monitoring Actions</h3>
            <p>System monitoring events and actions log.</p>
          </div>
        );
      
      case 'BREAKS_MEET':
        return (
          <div>
            <BreaksMeetContainer>
              {/* Break Section */}
              <BreakMeetSection theme={theme}>
                <BreakMeetHeader theme={theme}>
                  <BreakMeetTitle theme={theme}>Break</BreakMeetTitle>
                  <InfoIcon theme={theme}>i</InfoIcon>
                </BreakMeetHeader>
                <BreakMeetTable>
                  <BreakMeetTableHeader theme={theme}>
                    <BreakMeetHeaderRow>
                      <BreakMeetHeaderCell theme={theme}>Start</BreakMeetHeaderCell>
                      <BreakMeetHeaderCell theme={theme}>Stop</BreakMeetHeaderCell>
                      <BreakMeetHeaderCell theme={theme}>Duration</BreakMeetHeaderCell>
                    </BreakMeetHeaderRow>
                  </BreakMeetTableHeader>
                  <BreakMeetTableBody>
                    {breakData.map((breakItem, index) => (
                      <BreakMeetRow key={index}>
                        <BreakMeetCell theme={theme}>{breakItem.start}</BreakMeetCell>
                        <BreakMeetCell theme={theme}>{breakItem.stop}</BreakMeetCell>
                        <BreakMeetCell theme={theme}>{breakItem.duration}</BreakMeetCell>
                      </BreakMeetRow>
                    ))}
                    <BreakMeetRow>
                      <BreakMeetCell theme={theme} className="total-row">Total duration</BreakMeetCell>
                      <BreakMeetCell theme={theme} className="total-row"></BreakMeetCell>
                      <BreakMeetCell theme={theme} className="total-row">0h 53m</BreakMeetCell>
                    </BreakMeetRow>
                  </BreakMeetTableBody>
                </BreakMeetTable>
              </BreakMeetSection>

              {/* Meeting Section */}
              <BreakMeetSection theme={theme}>
                <BreakMeetHeader theme={theme}>
                  <BreakMeetTitle theme={theme}>Meeting</BreakMeetTitle>
                </BreakMeetHeader>
                <BreakMeetTable>
                  <BreakMeetTableHeader theme={theme}>
                    <BreakMeetHeaderRow>
                      <BreakMeetHeaderCell theme={theme}>Start</BreakMeetHeaderCell>
                      <BreakMeetHeaderCell theme={theme}>Stop</BreakMeetHeaderCell>
                      <BreakMeetHeaderCell theme={theme}>Duration</BreakMeetHeaderCell>
                    </BreakMeetHeaderRow>
                  </BreakMeetTableHeader>
                  <BreakMeetTableBody>
                    {meetingData.map((meeting, index) => (
                      <BreakMeetRow key={index}>
                        <BreakMeetCell theme={theme}>{meeting.start}</BreakMeetCell>
                        <BreakMeetCell theme={theme}>{meeting.stop}</BreakMeetCell>
                        <BreakMeetCell theme={theme}>{meeting.duration}</BreakMeetCell>
                      </BreakMeetRow>
                    ))}
                    <BreakMeetRow>
                      <BreakMeetCell theme={theme} className="total-row">Total duration</BreakMeetCell>
                      <BreakMeetCell theme={theme} className="total-row"></BreakMeetCell>
                      <BreakMeetCell theme={theme} className="total-row">0h 20m</BreakMeetCell>
                    </BreakMeetRow>
                  </BreakMeetTableBody>
                </BreakMeetTable>
              </BreakMeetSection>
            </BreaksMeetContainer>

            {/* Defined Break Section */}
            <DefinedBreakSection theme={theme}>
              <DefinedBreakHeader theme={theme}>
                <DefinedBreakTitle theme={theme}>Defined Break</DefinedBreakTitle>
                <InfoIcon theme={theme}>i</InfoIcon>
              </DefinedBreakHeader>
              <BreakMeetTable>
                <BreakMeetTableHeader theme={theme}>
                  <BreakMeetHeaderRow>
                    <BreakMeetHeaderCell theme={theme}>Start</BreakMeetHeaderCell>
                    <BreakMeetHeaderCell theme={theme}>Stop</BreakMeetHeaderCell>
                    <BreakMeetHeaderCell theme={theme}>Duration</BreakMeetHeaderCell>
                  </BreakMeetHeaderRow>
                </BreakMeetTableHeader>
                <BreakMeetTableBody>
                  {definedBreakData.map((definedBreak, index) => (
                    <BreakMeetRow key={index}>
                      <BreakMeetCell theme={theme}>{definedBreak.start}</BreakMeetCell>
                      <BreakMeetCell theme={theme}>{definedBreak.stop}</BreakMeetCell>
                      <BreakMeetCell theme={theme}>{definedBreak.duration}</BreakMeetCell>
                    </BreakMeetRow>
                  ))}
                  <BreakMeetRow>
                    <BreakMeetCell theme={theme} className="total-row">Total duration</BreakMeetCell>
                    <BreakMeetCell theme={theme} className="total-row"></BreakMeetCell>
                    <BreakMeetCell theme={theme} className="total-row">1h 0m</BreakMeetCell>
                  </BreakMeetRow>
                </BreakMeetTableBody>
              </BreakMeetTable>
            </DefinedBreakSection>
          </div>
        );
      
      case 'IDLE':
        return (
          <IdleContainer>
            {/* IDLE Table Section */}
            <IdleTableSection theme={theme}>
              <IdleHeader theme={theme}>
                <IdleTitle theme={theme}>IDLE</IdleTitle>
              </IdleHeader>
              <IdleTable>
                <IdleTableHeader theme={theme}>
                  <IdleHeaderRow>
                    <IdleHeaderCell theme={theme}>START</IdleHeaderCell>
                    <IdleHeaderCell theme={theme}>STOP</IdleHeaderCell>
                    <IdleHeaderCell theme={theme}>DURATION</IdleHeaderCell>
                  </IdleHeaderRow>
                </IdleTableHeader>
                <IdleTableBody>
                  {idleData.map((idle, index) => (
                    <IdleRow key={index}>
                      <IdleCell theme={theme}>{idle.start}</IdleCell>
                      <IdleCell theme={theme}>{idle.stop}</IdleCell>
                      <IdleCell theme={theme}>{idle.duration}</IdleCell>
                    </IdleRow>
                  ))}
                  <IdleRow>
                    <IdleCell theme={theme} className="total-row">Total duration</IdleCell>
                    <IdleCell theme={theme} className="total-row"></IdleCell>
                    <IdleCell theme={theme} className="total-row">0h 29m</IdleCell>
                  </IdleRow>
                </IdleTableBody>
              </IdleTable>
            </IdleTableSection>

            {/* IDLE Chart Section */}
            <IdleChartSection theme={theme}>
              <IdleHeader theme={theme}>
                <IdleTitle theme={theme}>IDLE CHART</IdleTitle>
              </IdleHeader>
              <PieChartWrapper>
                <PieChart theme={theme} />
                <ChartLegend>
                  <LegendItem theme={theme}>
                    <LegendColor color="#3b82f6" />
                    <LegendText>Logged Hours 9h 50m</LegendText>
                  </LegendItem>
                  <LegendItem theme={theme}>
                    <LegendColor color="#e5e7eb" />
                    <LegendText>Idle Hours 0h 29m</LegendText>
                  </LegendItem>
                </ChartLegend>
              </PieChartWrapper>
            </IdleChartSection>
          </IdleContainer>
        );
      
      case 'OFFLINE':
        return (
          <IdleContainer>
            {/* OFFLINE Table Section */}
            <IdleTableSection theme={theme}>
              <IdleHeader theme={theme}>
                <IdleTitle theme={theme}>OFFLINE</IdleTitle>
              </IdleHeader>
              <IdleTable>
                <IdleTableHeader theme={theme}>
                  <IdleHeaderRow>
                    <IdleHeaderCell theme={theme}>START</IdleHeaderCell>
                    <IdleHeaderCell theme={theme}>STOP</IdleHeaderCell>
                    <IdleHeaderCell theme={theme}>DURATION</IdleHeaderCell>
                  </IdleHeaderRow>
                </IdleTableHeader>
                <IdleTableBody>
                  {offlineData.map((offline, index) => (
                    <IdleRow key={index}>
                      <IdleCell theme={theme}>{offline.start}</IdleCell>
                      <IdleCell theme={theme}>{offline.stop}</IdleCell>
                      <IdleCell theme={theme}>{offline.duration}</IdleCell>
                    </IdleRow>
                  ))}
                  <IdleRow>
                    <IdleCell theme={theme} className="total-row">Total duration</IdleCell>
                    <IdleCell theme={theme} className="total-row"></IdleCell>
                    <IdleCell theme={theme} className="total-row">0h 29m</IdleCell>
                  </IdleRow>
                </IdleTableBody>
              </IdleTable>
            </IdleTableSection>

            {/* OFFLINE Chart Section */}
            <IdleChartSection theme={theme}>
              <IdleHeader theme={theme}>
                <IdleTitle theme={theme}>OFFLINE CHART</IdleTitle>
              </IdleHeader>
              <PieChartWrapper>
                <PieChart theme={theme} />
                <ChartLegend>
                  <LegendItem theme={theme}>
                    <LegendColor color="#3b82f6" />
                    <LegendText>Logged Hours 9h 50m</LegendText>
                  </LegendItem>
                  <LegendItem theme={theme}>
                    <LegendColor color="#e5e7eb" />
                    <LegendText>Offline Hours 0h 29m</LegendText>
                  </LegendItem>
                </ChartLegend>
              </PieChartWrapper>
            </IdleChartSection>
          </IdleContainer>
        );
      
      case 'TIME_LOG_SUMMARY':
        return (
          <TimeLogSummaryContainer theme={theme}>
            <TimeLogSummaryHeader theme={theme}>
              <TimeLogSummaryTitle theme={theme}>Time Log Summary</TimeLogSummaryTitle>
            </TimeLogSummaryHeader>
            <SubTabContainer theme={theme}>
              <SubTabButton
                theme={theme}
                active={activeTimeLogTab === 'WEEKLY'}
                onClick={() => setActiveTimeLogTab('WEEKLY')}
              >
                <SubTabIcon active={activeTimeLogTab === 'WEEKLY'}>📊</SubTabIcon>
                Weekly Report
                <HelpIcon theme={theme}>?</HelpIcon>
              </SubTabButton>
              <SubTabButton
                theme={theme}
                active={activeTimeLogTab === 'MONTHLY'}
                onClick={() => setActiveTimeLogTab('MONTHLY')}
              >
                <SubTabIcon active={activeTimeLogTab === 'MONTHLY'}>⏰</SubTabIcon>
                Monthly Reports
                <HelpIcon theme={theme}>?</HelpIcon>
              </SubTabButton>
            </SubTabContainer>
            <TimeLogContent theme={theme}>
              {activeTimeLogTab === 'WEEKLY' && (
                <>
                  <NoteText theme={theme}>
                    Current month calculation does not include today's data.
                  </NoteText>
                </>
              )}
              {activeTimeLogTab === 'MONTHLY' && (
                <>
                  <WeeklyTable>
                    <WeeklyTableHeader theme={theme}>
                      <WeeklyHeaderRow>
                        <WeeklyHeaderCell theme={theme}>
                          Name
                          <SortIcon>▲</SortIcon>
                        </WeeklyHeaderCell>
                        <WeeklyHeaderCell theme={theme}>Apr 2024</WeeklyHeaderCell>
                        <WeeklyHeaderCell theme={theme}>Mar 2024</WeeklyHeaderCell>
                        <WeeklyHeaderCell theme={theme}>Feb 2024</WeeklyHeaderCell>
                      </WeeklyHeaderRow>
                    </WeeklyTableHeader>
                    <WeeklyTableBody>
                      {weeklyReportData.map((employee, index) => (
                        <WeeklyRow key={index}>
                          <WeeklyCell theme={theme}>
                            <EmployeeNameCell>
                              <WeeklyEmployeeName theme={theme}>{employee.name}</WeeklyEmployeeName>
                              <EmployeeTeams theme={theme}>{employee.teams}</EmployeeTeams>
                            </EmployeeNameCell>
                          </WeeklyCell>
                          <WeeklyCell theme={theme}>
                            {employee.apr2024 ? (
                              <HoursCell theme={theme}>{employee.apr2024}</HoursCell>
                            ) : (
                              <NotEnoughData theme={theme}>Not enough data</NotEnoughData>
                            )}
                          </WeeklyCell>
                          <WeeklyCell theme={theme}>
                            {employee.mar2024 ? (
                              <HoursCell theme={theme}>{employee.mar2024}</HoursCell>
                            ) : (
                              <NotEnoughData theme={theme}>Not enough data</NotEnoughData>
                            )}
                          </WeeklyCell>
                          <WeeklyCell theme={theme}>
                            {employee.feb2024 ? (
                              <HoursCell theme={theme}>{employee.feb2024}</HoursCell>
                            ) : (
                              <NotEnoughData theme={theme}>Not enough data</NotEnoughData>
                            )}
                          </WeeklyCell>
                        </WeeklyRow>
                      ))}
                    </WeeklyTableBody>
                  </WeeklyTable>

                  <PaginationContainer theme={theme}>
                    <PaginationLeft>
                      <span style={{ fontSize: '14px', color: theme.colors.text.secondary }}>
                        Employees per page:
                      </span>
                      <PaginationSelect theme={theme}>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </PaginationSelect>
                      <PaginationInfo theme={theme}>1 - 7 of 7</PaginationInfo>
                    </PaginationLeft>
                    <PaginationControls>
                      <PaginationArrow theme={theme} disabled>«</PaginationArrow>
                      <PaginationArrow theme={theme} disabled>‹</PaginationArrow>
                      <PaginationArrow theme={theme} disabled>›</PaginationArrow>
                      <PaginationArrow theme={theme} disabled>»</PaginationArrow>
                    </PaginationControls>
                  </PaginationContainer>
                </>
              )}
            </TimeLogContent>
          </TimeLogSummaryContainer>
        );
      
      default:
        return (
          <>
            <ReportsHeader>
              <ActivePassiveContainer>
                <TimeSection>
                  <TimeSectionLabel theme={theme}>Active Hours</TimeSectionLabel>
                  <TimeSectionValue theme={theme} color="#3b82f6">
                    {timeData.activeHours} ⓘ
                  </TimeSectionValue>
                </TimeSection>
                <TimeSection>
                  <TimeSectionLabel theme={theme}>Passive Hours</TimeSectionLabel>
                  <TimeSectionValue theme={theme} color="#3b82f6">
                    {timeData.passiveHours} ⓘ
                  </TimeSectionValue>
                </TimeSection>
              </ActivePassiveContainer>
            </ReportsHeader>

            <TimeBreakdown>
              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Logged Time
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.loggedTime}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Productive
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.productive}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Distraction
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.distraction}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Neutral
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.neutral}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Meetings
                  <CategoryIcon color="#3b82f6">4</CategoryIcon>
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.meetings}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Break
                  <CategoryIcon color="#f97316">1</CategoryIcon>
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.break}</CategoryValue>
                <CategoryPercentage theme={theme}>4.92 % ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Idle
                  <CategoryIcon color="#6b7280">5</CategoryIcon>
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.idle}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Offline
                  <CategoryIcon color="#000000">0</CategoryIcon>
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.offline}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>
            </TimeBreakdown>
          </>
        );
    }
  };

  return (
    <DashboardLayout headerTitle="Employee Reports" headerBreadcrumb={[{ label: t('dashboard'), path: '/dashboard' }, { label: 'Reports' }]}>
      <ReportsWrapper theme={theme}>
        <ReportsLayout>
          {/* Left sidebar - Employee selection */}
          <EmployeeSelection theme={theme}>
            <EmployeeHeader theme={theme}>EMPLOYEE</EmployeeHeader>
            <EmployeeSearchInput
              theme={theme}
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <EmployeeList>
              {filteredEmployees.map((employee) => (
                <EmployeeItem
                  key={employee.id}
                  theme={theme}
                  selected={selectedEmployee?.id === employee.id}
                  onClick={() => handleEmployeeSelect(employee)}
                >
                  <EmployeeInner>
                  <EmployeeName theme={theme}>{employee.name}</EmployeeName>
                  <EmployeeDepartment theme={theme}>{employee.department}</EmployeeDepartment>
                  </EmployeeInner>
                  {selectedEmployee?.id === employee.id && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444' }}>✕</div>
                  )}
                </EmployeeItem>
              ))}
            </EmployeeList>
          </EmployeeSelection>

          {/* Right content - Time reports */}
          <ReportsContent theme={theme}>
            {/* Filter Section */}
            <FilterSection theme={theme}>
              <FilterRow>
                {/* Year Filter */}
                <FilterGroup>
                  <FilterLabel theme={theme}>Year</FilterLabel>
                  <FilterSelect
                    theme={theme}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </FilterSelect>
                </FilterGroup>

                {/* Month Filter */}
                <FilterGroup>
                  <FilterLabel theme={theme}>Month</FilterLabel>
                  <FilterSelect
                    theme={theme}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </FilterSelect>
                </FilterGroup>

                {/* Date Filter */}
                <FilterGroup>
                  <FilterLabel theme={theme}>Date</FilterLabel>
                  <FilterSelect
                    theme={theme}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  >
                    <option value="">Select Date</option>
                    {dates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </FilterSelect>
                </FilterGroup>

                {/* Hour Filter */}
                <FilterGroup>
                  <FilterLabel theme={theme}>Hour</FilterLabel>
                  <FilterSelect
                    theme={theme}
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                  >
                    {hours.map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </FilterSelect>
                </FilterGroup>

                {/* Calendar View */}
                <FilterGroup style={{ flex: 2 }}>
                  <FilterLabel theme={theme}>Calendar View</FilterLabel>
                  <CalendarGrid>
                    {calendarDays.map((day, index) => (
                      <CalendarDay
                        key={index}
                        theme={theme}
                        selected={day.day.toString() === selectedDate}
                        today={day.today}
                        onClick={() => setSelectedDate(day.day.toString())}
                      >
                        <DayHeader theme={theme}>{day.dayName}</DayHeader>
                        <div>{day.day}</div>
                      </CalendarDay>
                    ))}
                  </CalendarGrid>
                </FilterGroup>

                {/* Hour Range */}
                <FilterGroup style={{ flex: 1.5 }}>
                  <FilterLabel theme={theme}>Hour Range</FilterLabel>
                  <HourGrid>
                    {hours.slice(1, 13).map((hour, index) => (
                      <HourSlot
                        key={index}
                        theme={theme}
                        selected={selectedHour === hour}
                        onClick={() => setSelectedHour(hour)}
                      >
                        {hour}
                      </HourSlot>
                    ))}
                  </HourGrid>
                </FilterGroup>
              </FilterRow>

              {/* Summary */}
              <SummaryContainer theme={theme}>
                <SummaryText theme={theme}>
                  Showing data for: <span>{selectedMonth} {selectedDate}, {selectedYear}</span>
                  {selectedHour !== 'All' && <span> at {selectedHour}</span>}
                </SummaryText>
              </SummaryContainer>
            </FilterSection>

            {/* Tab Navigation */}
            <TabContainer theme={theme}>
              <NavigationArrow 
                theme={theme}
                disabled={!canScrollLeft}
                onClick={() => scrollTabs('left')}
              >
                ←
              </NavigationArrow>
              
              <TabScrollContainer 
                ref={tabScrollRef}
                onScroll={checkScrollButtons}
              >
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    theme={theme}
                    active={activeTab === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <TabIcon active={activeTab === tab.id}>{tab.icon}</TabIcon>
                    {tab.name}
                  </TabButton>
                ))}
              </TabScrollContainer>
              
              <NavigationArrow 
                theme={theme}
                disabled={!canScrollRight}
                onClick={() => scrollTabs('right')}
              >
                →
              </NavigationArrow>
            </TabContainer>

            {/* Tab Content */}
            {renderTabContent()}
          </ReportsContent>
        </ReportsLayout>
      </ReportsWrapper>
    </DashboardLayout>
  );
};

export default Reports;