const lightTheme = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f8fafc',
    surface: '#ffffff',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      light: '#94a3b8'
    },
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    hover: '#f1f5f9',
    slider: {
      track: '#e2e8f0',
      thumb: '#2563eb',
      surface: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  }
};

const darkTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#94a3b8',
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#f87171',
    background: '#0f172a',
    surface: '#1e293b',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      light: '#94a3b8'
    },
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
    hover: '#334155',
    slider: {
      track: '#334155',
      thumb: '#3b82f6',
      surface: '#1e293b',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  }
};

const commonTheme = {
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
};

export const getTheme = (mode = 'light') => ({
  ...commonTheme,
  ...(mode === 'dark' ? darkTheme : lightTheme),
  mode
});

export const theme = getTheme('light');
