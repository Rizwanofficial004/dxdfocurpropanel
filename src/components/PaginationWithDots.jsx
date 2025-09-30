import React from 'react';
import {
  PaginationContainer,
  PaginationButton,
  PaginationInfo
} from './ActivityStream.styles';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalCount, 
  displayedCount,
  loading = false,
  onPageChange,
  theme,
  isDarkMode,
  showInfo = true,
  customInfo = null
}) => {
  // Don't render if there's only one page or no data
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const range = [];
    const rangeWithDots = [];

    // For many pages, show even fewer numbers
    const delta = totalPages > 20 ? 1 : 2;
    
    // Always show first page
    rangeWithDots.push(1);
    
    // If we're far from the start, add dots after 1
    if (currentPage - delta > 2) {
      rangeWithDots.push('...');
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      if (i === 2 && currentPage - delta > 3) continue; // Skip if too far
      if (i === totalPages - 1 && currentPage + delta < totalPages - 2) continue; // Skip if too far
      range.push(i);
    }
    
    // Add the range around current page
    rangeWithDots.push(...range);
    
    // If we're far from the end, add dots before last page
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...');
    }
    
    // Always show last page if it's not already included
    if (rangeWithDots[rangeWithDots.length - 1] !== totalPages) {
      rangeWithDots.push(totalPages);
    }
    
    // For very large page counts, ensure we're not showing too many numbers
    if (totalPages > 50 && rangeWithDots.filter(x => x !== '...').length > 5) {
      const simplified = [];
      simplified.push(1); // First page
      if (currentPage > 3) simplified.push('...'); // Dots after first
      if (currentPage !== 1 && currentPage !== totalPages) simplified.push(currentPage); // Current page
      if (currentPage < totalPages - 2) simplified.push('...'); // Dots before last
      simplified.push(totalPages); // Last page
      return simplified;
    }
    
    return rangeWithDots;
  };

  const handlePageClick = (page) => {
    if (page === '...' || page === currentPage || loading) return;
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <PaginationContainer theme={theme} isDarkMode={isDarkMode}>
      <PaginationButton
        theme={theme} 
        isDarkMode={isDarkMode}
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1 || loading}
      >
        Previous
      </PaginationButton>
      
      {getPageNumbers().map((page, index) =>
        page === '...' ? (
          <span 
            key={index} 
            style={{ 
              padding: '8px 4px', 
              color: '#6b7280',
              userSelect: 'none'
            }}
          >
            ...
          </span>
        ) : (
          <PaginationButton
            theme={theme} 
            isDarkMode={isDarkMode}
            key={index}
            active={page === currentPage}
            onClick={() => handlePageClick(page)}
            disabled={loading}
          >
            {page}
          </PaginationButton>
        )
      )}
      
      <PaginationButton
        theme={theme} 
        isDarkMode={isDarkMode}
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
      >
        Next
      </PaginationButton>
      
      {showInfo && (
        <PaginationInfo theme={theme} isDarkMode={isDarkMode}>
          {customInfo || (
            `Page ${currentPage} of ${totalPages} (${displayedCount} of ${totalCount} screenshots)`
          )}
        </PaginationInfo>
      )}
    </PaginationContainer>
  );
};

// Enhanced Pagination for Folder Screenshots with per-page controls
export const FolderPagination = ({ 
  folderPagination, 
  perPageLimit,
  onPageChange,
  onPerPageLimitChange,
  loading = false,
  theme,
  isDarkMode,
  displayedCount,
  folderName
}) => {
  const { page, totalPages, totalCount } = folderPagination;

  if (totalPages <= 1 && totalCount <= perPageLimit) return null;

  return (
    <div>
      {/* Per-page limit selector */}
      {totalCount > 20 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }}>
          <span>Show per page:</span>
          <select 
            value={perPageLimit} 
            onChange={(e) => onPerPageLimitChange(parseInt(e.target.value))}
            disabled={loading}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#1f2937',
              fontSize: '12px'
            }}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
            <option value={200}>200</option>
            <option value={250}>250</option>
            <option value={300}>300</option>
            <option value={500}>500</option>
          </select>
          {loading && (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Loading...
            </span>
          )}
          {totalCount > 100 && (
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              💡 Large folder ({totalCount} screenshots) - adjust per-page limit for better performance
            </span>
          )}
        </div>
      )}

      {/* Main pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        displayedCount={displayedCount}
        loading={loading}
        onPageChange={onPageChange}
        theme={theme}
        isDarkMode={isDarkMode}
        showInfo={true}
        customInfo={`Page ${page} of ${totalPages} (${displayedCount} of ${totalCount} screenshots, showing ${perPageLimit} per page)`}
      />
    </div>
  );
};

export default Pagination;