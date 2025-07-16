import React, { useState, useEffect } from 'react';

/**
 * Live Tracking Dashboard Component
 * 
 * This component demonstrates how to integrate with the Django Live Tracking API
 * to display real-time employee monitoring data.
 */

const LiveTrackingDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    limit: 20,
    refresh: false
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  // API configuration
  const API_BASE = 'http://127.0.0.1:8000/api';
  const REFRESH_INTERVAL = 30000; // 30 seconds

  // Fetch live tracking data
  const fetchLiveTrackingData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.refresh) params.append('refresh', 'true');

      const response = await fetch(`${API_BASE}/live-tracking/?${params}`);
      const data = await response.json();

      if (data.success && data.data.live_tracking) {
        setEmployees(data.data.live_tracking.employees || []);
        setSummary(data.data.live_tracking.summary || {});
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch live tracking data');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchLiveTrackingData();
    
    const interval = setInterval(() => {
      fetchLiveTrackingData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Manual refresh
  const handleManualRefresh = () => {
    setFilters(prev => ({ ...prev, refresh: true }));
    setTimeout(() => {
      setFilters(prev => ({ ...prev, refresh: false }));
    }, 1000);
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Online': return 'text-green-600 bg-green-100';
      case 'Idle': return 'text-yellow-600 bg-yellow-100';
      case 'Offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Employee Tracking</h1>
        <p className="text-gray-600">
          Real-time monitoring of employee activity and productivity
        </p>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Online">Online</option>
              <option value="Idle">Idle</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Employees
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex-1">
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
          <p className="text-2xl font-bold text-gray-900">{summary.total_employees || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Now</h3>
          <p className="text-2xl font-bold text-green-600">{summary.active_employees || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Online</h3>
          <p className="text-2xl font-bold text-blue-600">{summary.status_breakdown?.online || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Work Time</h3>
          <p className="text-2xl font-bold text-purple-600">{summary.average_working_time || 'N/A'}</p>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.employee_id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Employee Header */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {employee.profile_image ? (
                    <img
                      src={employee.profile_image}
                      alt={employee.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {employee.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {employee.email}
                  </p>
                </div>
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.current_status)}`}>
                  {employee.current_status}
                </div>
              </div>
            </div>

            {/* Screenshot */}
            <div className="p-4">
              {employee.screenshot?.has_preview ? (
                <div className="relative">
                  <img
                    src={employee.screenshot.url}
                    alt="Latest screenshot"
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Live
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No screenshot available</span>
                </div>
              )}
            </div>

            {/* Employee Details */}
            <div className="p-4 pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Task:</span>
                  <span className="font-medium text-gray-900">{employee.current_task?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Working Time:</span>
                  <span className="font-medium text-gray-900">
                    {formatTime(employee.time_info?.total_working_time)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Activity:</span>
                  <span className="font-medium text-gray-900">
                    {employee.time_info?.last_activity_text || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium text-gray-900">
                    {employee.location?.office || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Productivity Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Activity Score</span>
                  <span>{employee.productivity?.activity_score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${employee.productivity?.activity_score || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Data Message */}
      {!loading && employees.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No employees found</div>
          <p className="text-gray-500">
            Try adjusting your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingDashboard;
