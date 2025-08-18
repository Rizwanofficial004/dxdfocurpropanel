import React from 'react';
import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
  padding: 16px;
  background: ${props => props.isDarkMode ? '#374151' : '#f9fafb'};
  border-radius: 8px;
  border: 1px solid ${props => props.isDarkMode ? '#4b5563' : '#e5e7eb'};
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => props.isDarkMode ? '#4b5563' : '#d1d5db'};
  background: ${props => {
    if (props.active) {
      return props.isDarkMode ? '#3b82f6' : '#2563eb';
    }
    return props.isDarkMode ? '#374151' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) {
      return '#ffffff';
    }
    return props.isDarkMode ? '#f3f4f6' : '#374151';
  }};
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  min-width: 40px;

  &:hover:not(:disabled) {
    background: ${props => {
      if (props.active) {
        return props.isDarkMode ? '#2563eb' : '#1d4ed8';
      }
      return props.isDarkMode ? '#4b5563' : '#f3f4f6';
    }};
    border-color: ${props => props.isDarkMode ? '#6b7280' : '#9ca3af'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PaginationInfo = styled.div`
  font-size: 12px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  margin-left: 16px;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 8px;
    width: 100%;
    text-align: center;
  }
`;

const PaginationEllipsis = styled.span`
  padding: 8px 4px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  font-size: 14px;
`;

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isDarkMode, 
  theme,
  isLoading = false,
  itemsPerPage = 20,
  totalItems = 0,
  currentItems = 0,
  context = 'screenshots' // 'screenshots', 'folders', etc.
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate range around current page
      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const getContextText = () => {
    switch (context) {
      case 'folders':
        return 'folders';
      case 'screenshots':
        return 'screenshots';
      case 'folderScreenshots':
        return 'screenshots';
      default:
        return 'items';
    }
  };

  return (
    <PaginationContainer isDarkMode={isDarkMode} theme={theme}>
      {/* Previous Button */}
      <PaginationButton
        isDarkMode={isDarkMode}
        theme={theme}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        title="Previous page"
      >
        ← Previous
      </PaginationButton>
      
      {/* Page Numbers */}
      {pageNumbers.map((page, index) => (
        page === '...' ? (
          <PaginationEllipsis key={`ellipsis-${index}`} isDarkMode={isDarkMode}>
            ...
          </PaginationEllipsis>
        ) : (
          <PaginationButton
            key={page}
            isDarkMode={isDarkMode}
            theme={theme}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
            disabled={isLoading}
            title={`Go to page ${page}`}
          >
            {page}
          </PaginationButton>
        )
      ))}
      
      {/* Next Button */}
      <PaginationButton
        isDarkMode={isDarkMode}
        theme={theme}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        title="Next page"
      >
        Next →
      </PaginationButton>
      
      {/* Pagination Info */}
      <PaginationInfo isDarkMode={isDarkMode} theme={theme}>
        Page {currentPage} of {totalPages}
        {totalItems > 0 && (
          <>
            {' '}({currentItems} of {totalItems} {getContextText()}, showing {itemsPerPage} per page)
          </>
        )}
        {isLoading && (
          <span style={{ color: '#f59e0b', marginLeft: '8px' }}>
            Loading...
          </span>
        )}
      </PaginationInfo>
    </PaginationContainer>
  );
};

export default Pagination;
