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
        await navigator.clipboard.writeText(logData.content);
        if (onCopyToClipboard) {
          onCopyToClipboard();
        }
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
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
          {/* Session Info Section */}
          {parsed.session_info && (
            <JsonSection>
              <JsonSectionHeader>📋 Session Information</JsonSectionHeader>
              <JsonSectionContent>
                <div><strong>Email:</strong> {parsed.session_info.email}</div>
                <div><strong>Task:</strong> {parsed.session_info.task_name}</div>
                <div><strong>Task ID:</strong> {parsed.session_info.task_id}</div>
                <div><strong>Staff ID:</strong> {parsed.session_info.staff_id}</div>
                <div><strong>Note:</strong> {parsed.session_info.note || 'N/A'}</div>
                <div><strong>Completed:</strong> {new Date(parsed.session_info.completed_at).toLocaleString()}</div>
              </JsonSectionContent>
            </JsonSection>
          )}

          {/* Program Tracking Section */}
          {parsed.program_tracking && (
            <JsonSection>
              <JsonSectionHeader>⏱️ Program Tracking</JsonSectionHeader>
              <JsonSectionContent>
                <div><strong>Duration:</strong> {parsed.program_tracking.session_duration_formatted}</div>
                <div><strong>Programs Tracked:</strong> {parsed.program_tracking.programs_tracked}</div>
                <div><strong>Session Start:</strong> {new Date(parsed.program_tracking.session_start).toLocaleString()}</div>
                <div><strong>Session End:</strong> {new Date(parsed.program_tracking.session_end).toLocaleString()}</div>
                
                {parsed.program_tracking.programs && parsed.program_tracking.programs.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <strong>Programs:</strong>
                    {parsed.program_tracking.programs.map((program, index) => (
                      <div key={index} style={{ 
                        marginLeft: '16px', 
                        marginTop: '8px',
                        padding: '8px',
                        background: '#f7fafc',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div><strong>{program.process_name}</strong></div>
                        <div>Time: {program.total_time_formatted}</div>
                        {program.window_titles && program.window_titles.length > 0 && (
                          <div>Windows: {program.window_titles.join(', ')}</div>
                        )}
                        {program.browser_domains && program.browser_domains.length > 0 && (
                          <div>Domains: {program.browser_domains.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </JsonSectionContent>
            </JsonSection>
          )}

          {/* Session Logs Section */}
          {parsed.session_logs !== undefined && (
            <JsonSection>
              <JsonSectionHeader>📝 Session Logs</JsonSectionHeader>
              <JsonSectionContent>
                {parsed.session_logs.length === 0 ? (
                  <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>No session logs recorded</div>
                ) : (
                  parsed.session_logs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      {JSON.stringify(log, null, 2)}
                    </div>
                  ))
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
            View Log: {logData?.fileName || 'Unknown File'}
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
          >
            📋 Copy to Clipboard
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
