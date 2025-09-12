import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';

const OldScreenshots = () => {
  const { t, language } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef(null);
  
  // Calendar state
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState('SEP');
  const [activeDate, setActiveDate] = useState('01');
  const [searchValue, setSearchValue] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Fetch employees from API
  const fetchEmployees = async (searchQuery = '') => {
    setLoadingEmployees(true);
    try {
      const response = await fetch(`https://dxdtime.ddsolutions.io/api/users/search/?q=${searchQuery}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      
      // Transform API data to match our component structure
      const transformedEmployees = data.map((user, index) => ({
        id: user.id || index,
        name: user.username || user.first_name + ' ' + user.last_name || 'Unknown User',
        email: user.email || 'No email',
        avatar: (user.first_name || user.username || 'U').charAt(0).toUpperCase(),
        color: getRandomColor(index)
      }));
      
      setEmployees(transformedEmployees);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again.');
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Generate consistent colors for avatars
  const getRandomColor = (index) => {
    const colors = ['#4285f4', '#7c4dff', '#00acc1', '#ff9800', '#4caf50', '#f44336', '#9c27b0', '#2196f3'];
    return colors[index % colors.length];
  };

  // Load initial employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Function to fetch screenshots from server
  const fetchScreenshots = async (employee, date) => {
    setLoading(true);
    setError(null);
    
    try {
      // Construct the API endpoint for screenshots
      const formattedDate = `${selectedYear}-${getMonthNumber(selectedMonth)}-${date}`;
      const response = await fetch(`https://dxdtime.ddsolutions.io/api/screenshots/${employee.id}?date=${formattedDate}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No screenshots found for this date
          setScreenshots([]);
          return;
        }
        throw new Error('Failed to fetch screenshots');
      }
      
      const data = await response.json();
      setScreenshots(data.screenshots || data.results || data || []);
    } catch (err) {
      console.error('Error fetching screenshots:', err);
      setError('Failed to load screenshots. Please try again.');
      setScreenshots([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert month name to number
  const getMonthNumber = (monthName) => {
    const months = {
      'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
      'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
      'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };
    return months[monthName] || '01';
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    fetchScreenshots(employee, activeDate);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setActiveDate(date);
    if (selectedEmployee) {
      fetchScreenshots(selectedEmployee, date);
    }
  };

  // Generate days for the current month
  const generateDaysForMonth = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i.toString().padStart(2, '0'));
    }
    return days;
  };

  const monthDays = generateDaysForMonth();

  return (
    <DashboardLayout>
      <div style={{
        background: '#f8f9fa',
        minHeight: '100vh',
        color: '#2d3748',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Header Section */}
        <div style={{
          padding: '20px 40px',
          borderBottom: '1px solid #e2e8f0',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '500',
              margin: 0,
              color: '#2d3748'
            }}>
              Real Time Activity Stream
            </h1>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  padding: '8px 12px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  padding: '8px 12px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="JAN">JAN</option>
                <option value="FEB">FEB</option>
                <option value="MAR">MAR</option>
                <option value="APR">APR</option>
                <option value="MAY">MAY</option>
                <option value="JUN">JUN</option>
                <option value="JUL">JUL</option>
                <option value="AUG">AUG</option>
                <option value="SEP">SEP</option>
                <option value="OCT">OCT</option>
                <option value="NOV">NOV</option>
                <option value="DEC">DEC</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowHelp(!showHelp)}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              color: '#374151',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ?
          </button>
        </div>

        {/* Date Navigation */}
        <div style={{
          padding: '20px 40px',
          borderBottom: '1px solid #e2e8f0',
          background: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              marginRight: '20px',
              fontWeight: '500'
            }}>
              Search<br/>Employee
            </div>
            
            <button style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '10px'
            }}>
              ←
            </button>
            
            {monthDays.slice(0, 26).map((day, index) => (
              <div
                key={day}
                onClick={() => handleDateSelect(day)}
                style={{
                  background: activeDate === day ? '#e0f2fe' : 'white',
                  border: activeDate === day ? '2px solid #0284c7' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  minWidth: '50px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  {day}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#6b7280',
                  marginTop: '2px'
                }}>
                  {selectedMonth}
                </div>
                {/* Green dot indicator for day 01 and 10 */}
                {(day === '01' || day === '10') && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '6px',
                    height: '6px',
                    background: '#10b981',
                    borderRadius: '50%'
                  }}></div>
                )}
              </div>
            ))}
            
            <button style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '10px'
            }}>
              →
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 180px)'
        }}>
          {/* Left Sidebar - Employee Search */}
          <div style={{
            width: '350px',
            background: 'white',
            borderRight: '1px solid #e5e7eb',
            padding: '20px'
          }}>
            <div style={{
              marginBottom: '20px'
            }}>
              <input
                type="text"
                placeholder="Search employee name..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  width: '100%',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  padding: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Employee List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              {loadingEmployees ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 15px'
                  }}></div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading employees...</p>
                </div>
              ) : employees.length > 0 ? (
                employees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleEmployeeSelect(employee)}
                  style={{
                    background: selectedEmployee?.id === employee.id ? '#f0f9ff' : 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: employee.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {employee.avatar}
                  </div>
                  <div>
                    <div style={{
                      color: '#1f2937',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {employee.name}
                    </div>
                    <div style={{
                      color: '#6b7280',
                      fontSize: '12px'
                    }}>
                      {employee.email}
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px'
                }}>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    {searchValue ? 'No employees found' : 'No employees available'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{
            flex: 1,
            background: '#f8f9fa',
            padding: '20px'
          }}>
            {selectedEmployee ? (
              <div>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: selectedEmployee.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '20px'
                    }}>
                      {selectedEmployee.avatar}
                    </div>
                    <div>
                      <h2 style={{
                        color: '#1f2937',
                        fontSize: '20px',
                        margin: 0,
                        marginBottom: '5px'
                      }}>
                        {selectedEmployee.name}
                      </h2>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        Screenshots for {selectedMonth} {activeDate}, {selectedYear}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Screenshots Section */}
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  {loading ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                      }}></div>
                      <p style={{ color: '#6b7280' }}>Loading screenshots...</p>
                    </div>
                  ) : error ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#dc2626'
                    }}>
                      <p>{error}</p>
                      <button
                        onClick={() => fetchScreenshots(selectedEmployee, activeDate)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          marginTop: '10px'
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : screenshots.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '15px'
                    }}>
                      {screenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: 'white'
                          }}
                        >
                          <img
                            src={screenshot.url}
                            alt={`Screenshot ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            padding: '10px',
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            {screenshot.timestamp || `Screenshot ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px'
                    }}>
                      <div style={{
                        fontSize: '48px',
                        marginBottom: '20px'
                      }}>
                        📷
                      </div>
                      <h3 style={{
                        color: '#6b7280',
                        fontSize: '16px',
                        fontWeight: '400',
                        margin: 0
                      }}>
                        No screenshots found for this date
                      </h3>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
              }}>
                <div>
                  <img 
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI2NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOUI5QjlCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBkYXRhPC90ZXh0Pgo8L3N2Zz4K"
                    alt="No data"
                    style={{
                      marginBottom: '20px',
                      opacity: 0.7
                    }}
                  />
                  <h2 style={{
                    color: '#9ca3af',
                    fontSize: '18px',
                    fontWeight: '400',
                    margin: 0
                  }}>
                    Search for employees to view their activity stream
                  </h2>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div
              ref={helpRef}
              style={{
                background: 'white',
                color: '#1f2937',
                padding: '30px',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                border: '1px solid #e5e7eb'
              }}
            >
              <h3 style={{ marginTop: 0, color: '#1f2937' }}>Help - Real Time Activity Stream</h3>
              <ul style={{ lineHeight: '1.6', color: '#374151' }}>
                <li>Select year and month from the dropdown menus</li>
                <li>Navigate through dates using the date cards</li>
                <li>Search for employees in real-time using the search box</li>
                <li>Click on an employee to view their screenshots</li>
                <li>Screenshots are automatically fetched from the server</li>
                <li>Use different dates to view screenshots from different days</li>
                <li>Employee data is loaded dynamically from the API</li>
              </ul>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginTop: '15px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default OldScreenshots;
