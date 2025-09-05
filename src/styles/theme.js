// Theme configuration using styled-components
export const lightTheme = {
  colors: {
    // Primary brand colors
    primary: '#4A90E2', // Blue from the design
    primaryDark: '#357ABD',
    primaryLight: '#6BA3E8',
    
    // Background colors
    background: '#edf6fc',
    cardBackground: '#ffffff',
    
    // Text colors
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      muted: '#999999',
      light: '#cccccc'
    },
    
    // UI element colors
    border: '#e0e0e0',
    borderHover: '#4A90E2',
    input: {
      background: '#f8f9fa',
      border: '#e0e0e0',
      borderFocus: '#4A90E2',
      borderError: '#ff4444'
    },
    
    // State colors
    success: '#4caf50',
    error: '#ff4444',
    warning: '#ff9800',
    info: '#2196f3',
    
    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(74, 144, 226, 0.3)'
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      mono: "'JetBrains Mono', 'Monaco', 'Menlo', monospace"
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'  // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem'    // 96px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  },
  
  // Breakpoints
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease-out',
    normal: '0.25s ease-out',
    slow: '0.35s ease-out'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    // Background colors for dark theme
    background: 'linear-gradient(135deg, #1a237e 0%, #283593 25%, #3949ab 50%, #3f51b5 75%, #5c6bc0 100%)',
    cardBackground: '#2d3748',
    
    // Text colors for dark theme
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      muted: '#a0aec0',
      light: '#718096'
    },
    
    // UI element colors for dark theme
    border: '#4a5568',
    input: {
      background: '#4a5568',
      border: '#4a5568',
      borderFocus: '#4A90E2',
      borderError: '#ff4444'
    }
  }
};

// Export default theme
export default lightTheme;
