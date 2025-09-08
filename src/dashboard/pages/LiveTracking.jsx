import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import './LiveTracking.css';

const LiveTracking = () => {
  const { t } = useLanguage();
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  return (
    <DashboardLayout>
      <div className="live-tracking-page">
        {/* Live Tracking Card */}
        <div className="live-tracking-card">
          {/* Top Notification Banner */}
          <div className="notification-banner">
            <div className="notification-content">
              <span>Your user profile has been successfully created.</span>
              <span>
                You can now download the client app from{' '}
                <a href="https://focusro.com/download" className="download-link">
                  https://focusro.com/download
                </a>{' '}
                and log in with your password to explore the features.
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="card-header">
            <div className="header-left">
              <h1 className="live-tracking-title">
                LIVE TRACKING
                <span className="help-icon">?</span>
              </h1>
            </div>
            <div className="header-controls">
              <button className="team-button">
                Choose a team
              </button>
              <select 
                className="team-dropdown" 
                value={selectedTeam} 
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option>All Teams</option>
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
              <div className="date-time-controls">
                <div className="date-picker">
                  <span className="icon">📅</span>
                  <span>Date: 08-09-2025</span>
                </div>
                <div className="time-picker">
                  <span className="icon">🕐</span>
                  <span>03:09:02 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="content-area">
            {/* No Data State */}
            <div className="no-data-container">
              <div className="no-data-icon">
                <div className="document-icon">
                  <div className="colored-squares">
                    <div className="square red"></div>
                    <div className="square yellow"></div>
                    <div className="square green"></div>
                    <div className="square blue"></div>
                  </div>
                </div>
              </div>
              <p className="no-data-text">Not enough data</p>
            </div>
          </div>

          {/* Bottom Pagination */}
          <div className="pagination-footer">
            <div className="pagination-left">
              <div className="screens-per-page">
                <span>Screens per page:</span>
                <select 
                  className="screens-selector" 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                </select>
              </div>
            </div>
            <div className="pagination-right">
              <span className="page-info">0 of 0</span>
              <div className="pagination-nav">
                <button className="nav-button" disabled>‹</button>
                <button className="nav-button" disabled>›</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveTracking;
