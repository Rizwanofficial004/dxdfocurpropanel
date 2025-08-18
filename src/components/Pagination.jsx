import React from 'react';

function PaginationWithDots({ currentPage, totalPages, onPageChange, isDarkMode }) {
  // Compact pagination with dots
  const getPages = () => {
    const pages = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const showLeft = currentPage > 4;
      const showRight = currentPage < totalPages - 3;
      pages.push(1);
      if (showLeft) pages.push('dots-left');
      // Show up to 2 before and after current
      const start = Math.max(2, showLeft ? currentPage - 1 : 2);
      const end = Math.min(totalPages - 1, showRight ? currentPage + 1 : totalPages - 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (showRight) pages.push('dots-right');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: 'none',
          background: isDarkMode ? '#374151' : '#e5e7eb',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontWeight: 500
        }}
      >
        {'<'}
      </button>
      {getPages().map((p, idx) =>
        typeof p === 'string' && p.startsWith('dots') ? (
          <span key={p + idx} style={{ padding: '0 4px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: p === currentPage ? '2px solid #2563eb' : '1px solid #d1d5db',
              background: p === currentPage ? (isDarkMode ? '#2563eb' : '#3b82f6') : (isDarkMode ? '#4b5563' : '#fff'),
              color: p === currentPage ? '#fff' : (isDarkMode ? '#f3f4f6' : '#1f2937'),
              fontWeight: p === currentPage ? 700 : 500,
              cursor: p === currentPage ? 'default' : 'pointer',
              minWidth: 32
            }}
            disabled={p === currentPage}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: 'none',
          background: isDarkMode ? '#374151' : '#e5e7eb',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontWeight: 500
        }}
      >
        {'>'}
      </button>
    </div>
  );
}

export default PaginationWithDots;
