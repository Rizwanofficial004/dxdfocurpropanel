import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  max-width: 800px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-size: 18px;
  font-weight: 600;
  word-break: break-word;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
  }
`;

const LogContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 60vh;
  min-height: 200px;
  color: #2d3748;

  /* JSON syntax highlighting */
  .json-key {
    color: #e53e3e;
    font-weight: 600;
  }
  
  .json-string {
    color: #38a169;
  }
  
  .json-number {
    color: #3182ce;
  }
  
  .json-boolean {
    color: #805ad5;
    font-weight: 600;
  }
  
  .json-null {
    color: #a0aec0;
    font-style: italic;
  }
`;

const JsonSection = styled.div`
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
`;

const JsonSectionHeader = styled.div`
  background: #edf2f7;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 12px;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const JsonSectionContent = styled.div`
  padding: 12px;
  background: white;
  font-size: 12px;
  line-height: 1.5;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #5f6368;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #d32f2f;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.div`
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.6;
  max-width: 500px;
  white-space: pre-line;
  text-align: left;
  
  /* Style for file info in error messages */
  strong {
    color: #2d3748;
  }
  
  /* Improve readability for CORS error messages */
  .cors-info {
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    margin: 12px 0;
    font-size: 13px;
  }
  
  .solution-box {
    background: #e6fffa;
    border: 1px solid #81e6d9;
    border-radius: 6px;
    padding: 12px;
    margin: 12px 0;
    color: #2d3748;
  }
  
  .error-code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    background: #fed7d7;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const RetryButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #1557b0;
  }
`;

const DownloadButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #218838;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.primaryHover};
    }
  ` : `
    background: ${props.theme.colors.border};
    color: ${props.theme.colors.text};
    
    &:hover {
      background: ${props.theme.colors.textSecondary};
      color: white;
    }
  `}
`;

const FileInfo = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LogViewModal = ({ 
  isOpen, 
  onClose, 
  logData, 
  loading, 
  error, 
  onRetry,
  onCopyToClipboard,
  onDownload 
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopyClick = async () => {
    if (logData?.content) {
      try {
        // Create a human-readable summary for copying
        const parsed = JSON.parse(logData.content);
        let formattedText = `📊 ACTIVITY LOG REPORT\n`;
        formattedText += `${'='.repeat(50)}\n\n`;
        
        if (parsed.session_info) {
          formattedText += `👤 SESSION INFORMATION:\n`;
          formattedText += `• User: ${parsed.session_info.email}\n`;
          formattedText += `• Task: ${parsed.session_info.task_name}\n`;
          formattedText += `• Task ID: ${parsed.session_info.task_id}\n`;
          formattedText += `• Staff ID: ${parsed.session_info.staff_id}\n`;
          formattedText += `• Completed: ${new Date(parsed.session_info.completed_at).toLocaleString()}\n`;
          if (parsed.session_info.note) {
            formattedText += `• Note: ${parsed.session_info.note}\n`;
          }
          formattedText += `\n`;
        }
        
        if (parsed.program_tracking) {
          formattedText += `⏱️ PROGRAM TRACKING SUMMARY:\n`;
          formattedText += `• Duration: ${parsed.program_tracking.session_duration_formatted}\n`;
          formattedText += `• Programs Tracked: ${parsed.program_tracking.programs_tracked}\n`;
          formattedText += `• Session Start: ${new Date(parsed.program_tracking.session_start).toLocaleString()}\n`;
          formattedText += `• Session End: ${new Date(parsed.program_tracking.session_end).toLocaleString()}\n\n`;
          
          if (parsed.program_tracking.programs && parsed.program_tracking.programs.length > 0) {
            formattedText += `💻 PROGRAM DETAILS:\n`;
            parsed.program_tracking.programs.forEach((program, index) => {
              formattedText += `\n${index + 1}. ${program.process_name}\n`;
              formattedText += `   • Time Used: ${program.total_time_formatted}\n`;
              if (program.window_titles && program.window_titles.length > 0) {
                formattedText += `   • Windows: ${program.window_titles.join(', ')}\n`;
              }
              if (program.browser_domains && program.browser_domains.length > 0) {
                formattedText += `   • Websites: ${program.browser_domains.join(', ')}\n`;
              }
            });
          }
        }
        
        formattedText += `\n${'='.repeat(50)}\n`;
        formattedText += `Generated: ${new Date().toLocaleString()}\n`;
        
        await navigator.clipboard.writeText(formattedText);
        
        if (onCopyToClipboard) {
          onCopyToClipboard();
        }
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        // Fallback to raw content
        try {
          await navigator.clipboard.writeText(logData.content);
          if (onCopyToClipboard) {
            onCopyToClipboard();
          }
        } catch (fallbackErr) {
          console.error('Fallback copy also failed:', fallbackErr);
        }
      }
    }
  };

  const formatJsonContent = (content) => {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return content;
    }
  };

  const renderJsonSections = (content) => {
    try {
      const parsed = JSON.parse(content);
      
      return (
        <div>
          {/* Quick Summary Banner */}
          {parsed.session_info && parsed.program_tracking && (
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                📋 {parsed.session_info.task_name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '14px', opacity: '0.9' }}>
                <span>👤 {parsed.session_info.email}</span>
                <span>⏱️ {parsed.program_tracking.session_duration_formatted}</span>
                <span>💻 {parsed.program_tracking.programs_tracked} programs</span>
              </div>
            </div>
          )}

          {/* Session Info Section */}
          {parsed.session_info && (
            <JsonSection>
              <JsonSectionHeader>� Session Information</JsonSectionHeader>
              <JsonSectionContent>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>👤 USER</div>
                    <div style={{ fontWeight: '600', color: '#2d3748' }}>{parsed.session_info.email}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>💼 TASK</div>
                    <div style={{ fontWeight: '600', color: '#2d3748' }}>{parsed.session_info.task_name}</div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#fff5f5', padding: '12px', borderRadius: '6px', border: '1px solid #fed7d7' }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>🔢 TASK ID</div>
                    <div style={{ fontWeight: '600', color: '#c53030' }}>{parsed.session_info.task_id}</div>
                  </div>
                  <div style={{ background: '#f0fff4', padding: '12px', borderRadius: '6px', border: '1px solid #c6f6d5' }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>👥 STAFF ID</div>
                    <div style={{ fontWeight: '600', color: '#38a169' }}>{parsed.session_info.staff_id}</div>
                  </div>
                  <div style={{ background: '#f7fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>📅 COMPLETED</div>
                    <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '11px' }}>
                      {new Date(parsed.session_info.completed_at).toLocaleDateString()} <br/>
                      {new Date(parsed.session_info.completed_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {parsed.session_info.note && (
                  <div style={{ background: '#fffbf0', padding: '12px', borderRadius: '6px', border: '1px solid #feeaa7' }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>📝 NOTE</div>
                    <div style={{ color: '#744210', fontStyle: 'italic' }}>{parsed.session_info.note}</div>
                  </div>
                )}
              </JsonSectionContent>
            </JsonSection>
          )}

          {/* Program Tracking Section */}
          {parsed.program_tracking && (
            <JsonSection>
              <JsonSectionHeader>⏱️ Program Tracking Summary</JsonSectionHeader>
              <JsonSectionContent>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#e6fffa', padding: '16px', borderRadius: '8px', border: '1px solid #81e6d9', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#234e52' }}>{parsed.program_tracking.session_duration_formatted}</div>
                    <div style={{ fontSize: '12px', color: '#4a5568', marginTop: '4px' }}>⏰ Total Duration</div>
                  </div>
                  <div style={{ background: '#f0f4ff', padding: '16px', borderRadius: '8px', border: '1px solid #c3dafe', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#3c366b' }}>{parsed.program_tracking.programs_tracked}</div>
                    <div style={{ fontSize: '12px', color: '#4a5568', marginTop: '4px' }}>💻 Programs Tracked</div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>🚀 SESSION START</div>
                    <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '13px' }}>
                      {new Date(parsed.program_tracking.session_start).toLocaleDateString()}<br/>
                      {new Date(parsed.program_tracking.session_start).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>🏁 SESSION END</div>
                    <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '13px' }}>
                      {new Date(parsed.program_tracking.session_end).toLocaleDateString()}<br/>
                      {new Date(parsed.program_tracking.session_end).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {parsed.program_tracking.programs && parsed.program_tracking.programs.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>💻</span> Program Usage Details
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {parsed.program_tracking.programs.map((program, index) => (
                        <div key={index} style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '16px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600' }}>{program.process_name}</div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                              {program.total_time_formatted}
                            </div>
                          </div>
                          
                          {program.window_titles && program.window_titles.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ fontSize: '12px', opacity: '0.8', marginBottom: '4px' }}>🪟 Windows:</div>
                              <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px' }}>
                                {program.window_titles.join(' • ')}
                              </div>
                            </div>
                          )}
                          
                          {program.browser_domains && program.browser_domains.length > 0 && (
                            <div>
                              <div style={{ fontSize: '12px', opacity: '0.8', marginBottom: '4px' }}>🌐 Websites:</div>
                              <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px' }}>
                                {program.browser_domains.join(' • ')}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </JsonSectionContent>
            </JsonSection>
          )}

          {/* Session Logs Section */}
          {parsed.session_logs !== undefined && (
            <JsonSection>
              <JsonSectionHeader>📝 Additional Session Data</JsonSectionHeader>
              <JsonSectionContent>
                {parsed.session_logs.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '24px', 
                    color: '#a0aec0', 
                    fontStyle: 'italic',
                    background: '#f7fafc',
                    borderRadius: '6px',
                    border: '1px dashed #e2e8f0'
                  }}>
                    📄 No additional session logs recorded
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {parsed.session_logs.map((log, index) => (
                      <div key={index} style={{ 
                        background: '#f8fafc', 
                        padding: '12px', 
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#2d3748'
                      }}>
                        <div style={{ color: '#718096', marginBottom: '4px' }}>Log Entry #{index + 1}:</div>
                        {JSON.stringify(log, null, 2)}
                      </div>
                    ))}
                  </div>
                )}
              </JsonSectionContent>
            </JsonSection>
          )}

          {/* Raw JSON Section */}
          <JsonSection>
            <JsonSectionHeader>🔧 Raw JSON Data</JsonSectionHeader>
            <JsonSectionContent>
              <pre style={{ 
                margin: 0, 
                fontSize: '11px', 
                lineHeight: 1.4,
                color: '#2d3748'
              }}>
                {formatJsonContent(content)}
              </pre>
            </JsonSectionContent>
          </JsonSection>
        </div>
      );
    } catch (e) {
      // If JSON parsing fails, show formatted content
      return (
        <pre style={{ margin: 0, color: '#2d3748' }}>
          {formatJsonContent(content)}
        </pre>
      );
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading log content...</p>
        </LoadingContainer>
      );
    }

    if (error) {
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorMessage>
            <div className="cors-info">
              <strong>🔒 Browser Security Restriction</strong><br/>
              This log file cannot be viewed directly in the browser due to CORS (Cross-Origin Resource Sharing) policy restrictions from AWS S3.
            </div>
            
            <div className="solution-box">
              <strong>💡 Solution:</strong><br/>
              • Click <strong>"Download Instead"</strong> below to save the file<br/>
              • Open the downloaded file with any text editor<br/>
              • The file will contain the complete log data in JSON format
            </div>
            
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#718096' }}>
              <strong>📋 File Information:</strong><br/>
              • Name: <span className="error-code">{error.includes('Log File:') ? error.split('Log File: ')[1]?.split('\n')[0] : 'Unknown'}</span><br/>
              • This is a technical limitation, not an error with your account
            </div>
            
            {error.includes('HTTP error') && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#e53e3e' }}>
                <strong>Technical Details:</strong> {error}
              </div>
            )}
          </ErrorMessage>
          <ErrorActions>
            {onRetry && (
              <RetryButton onClick={onRetry}>
                🔄 Try Again
              </RetryButton>
            )}
            {onDownload && (
              <DownloadButton onClick={onDownload}>
                📥 Download Instead
              </DownloadButton>
            )}
          </ErrorActions>
        </ErrorContainer>
      );
    }

    if (logData?.content) {
      return (
        <>
          {logData.fileInfo && (
            <FileInfo theme={theme}>
              <InfoItem>📄 {logData.fileName}</InfoItem>
              {logData.fileInfo.size && (
                <InfoItem>📊 {logData.fileInfo.size}</InfoItem>
              )}
              {logData.fileInfo.user && (
                <InfoItem>👤 {logData.fileInfo.user}</InfoItem>
              )}
              {logData.fileInfo.date && (
                <InfoItem>📅 {logData.fileInfo.date}</InfoItem>
              )}
            </FileInfo>
          )}
          <LogContentContainer theme={theme}>
            {renderJsonSections(logData.content)}
          </LogContentContainer>
        </>
      );
    }

    return (
      <ErrorContainer>
        <ErrorIcon>📄</ErrorIcon>
        <p>No content available</p>
      </ErrorContainer>
    );
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            📊 Activity Log Report: {logData?.fileName || 'Unknown File'}
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>
            ×
          </CloseButton>
        </ModalHeader>
        
        {renderContent()}
        
        <ModalActions theme={theme}>
          <ModalButton 
            variant="secondary" 
            theme={theme}
            onClick={handleCopyClick}
            disabled={!logData?.content}
            title="Copy formatted report to clipboard"
          >
            📋 Copy Report
          </ModalButton>
          <ModalButton 
            variant="primary" 
            theme={theme}
            onClick={onClose}
          >
            Close
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LogViewModal;
