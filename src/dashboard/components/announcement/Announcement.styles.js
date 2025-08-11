import styled from 'styled-components';

// Enhanced theme detection for compatibility
const getThemeProps = (props) => {
  const isDarkMode = props.isDarkMode || props.theme?.mode === 'dark' || props.theme?.name === 'dark';
  return { isDarkMode, theme: props.theme };
};

export const Container = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.surface || '#ffffff');
  }};
  border-radius: ${props => props.theme?.borderRadius?.xl || '12px'};
  padding: ${props => props.theme?.spacing?.xl || '24px'};
  box-shadow: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? 
      (theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.3)') : 
      (theme?.shadows?.md || '0 4px 12px rgba(0, 0, 0, 0.05)');
  }};
  border: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? `1px solid ${theme?.colors?.border || '#334155'}` : 'none';
  }};
`;

export const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme?.spacing?.lg || '20px'};
`;

export const Title = styled.h2`
  font-size: ${props => props.theme?.typography?.fontSize?.lg || '18px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || 'bold'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
  }};
  margin: 0;
`;

export const Toolbar = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.sm || '12px'};

  svg {
    cursor: pointer;
    font-size: ${props => props.theme?.typography?.fontSize?.lg || '18px'};
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#4b5563');
    }};
    transition: color 0.2s ease;

    &:hover {
      color: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#6d28d9');
      }};
    }
  }
`;

export const FilterBar = styled.div`
  display: flex;
  gap: ${props => props.theme?.spacing?.md || '16px'};
  margin-bottom: ${props => props.theme?.spacing?.md || '16px'};
`;

export const FilterInput = styled.input`
  padding: ${props => props.theme?.spacing?.sm || '6px 10px'};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#d1d5db');
  }};
  border-radius: ${props => props.theme?.borderRadius?.sm || '4px'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#ffffff');
  }};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
  }};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#6d28d9');
    }};
    box-shadow: 0 0 0 3px ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      const primaryColor = isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#6d28d9');
      return `${primaryColor}20`;
    }};
  }

  &::placeholder {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.light || '#94a3b8') : (theme?.colors?.text?.light || '#9ca3af');
    }};
  }
`;

export const DataGridContainer = styled.div`
  height: 400px;
  width: 100%;
  
  .MuiDataGrid-root {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#ffffff');
    }};
    border: 1px solid ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
    }};
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
    }};
  }

  .MuiDataGrid-cell {
    border-bottom: 1px solid ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
    }};
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
    }};
  }

  /* Top container and headers */
  .MuiDataGrid-topContainer,
  .MuiDataGrid-container--top,
  .css-b1wygl {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#ffffff');
    }} !important;
  }

  .MuiDataGrid-columnHeaders {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#334155') : (theme?.colors?.hover || '#f9fafb');
    }} !important;
    border-bottom: 1px solid ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.border || '#475569') : (theme?.colors?.border || '#e5e7eb');
    }} !important;
  }

  .MuiDataGrid-columnHeader {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#334155') : (theme?.colors?.hover || '#f9fafb');
    }} !important;
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
    }} !important;
    font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  }

  .MuiDataGrid-columnHeaderTitle {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
    }} !important;
    font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  }

  .MuiDataGrid-row {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#ffffff');
    }} !important;
    
    &:hover {
      background: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        return isDarkMode ? (theme?.colors?.hover || '#475569') : (theme?.colors?.hover || '#f3f4f6');
      }} !important;
      cursor: pointer;
    }

    &.Mui-selected {
      background: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        const primaryColor = isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#6d28d9');
        return `${primaryColor}20`;
      }} !important;

      &:hover {
        background: ${props => {
          const { isDarkMode, theme } = getThemeProps(props);
          const primaryColor = isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#6d28d9');
          return `${primaryColor}30`;
        }} !important;
      }
    }
  }

  .MuiDataGrid-footerContainer {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#ffffff');
    }};
    border-top: 1px solid ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
    }};
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
    }};
  }

  .MuiTablePagination-root {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
    }};
  }

  .MuiTablePagination-selectIcon {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
    }};
  }

  .MuiIconButton-root {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
    }};

    &:hover {
      background: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        return isDarkMode ? (theme?.colors?.hover || '#334155') : (theme?.colors?.hover || '#f3f4f6');
      }};
    }

    &.Mui-disabled {
      color: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        return isDarkMode ? (theme?.colors?.text?.light || '#64748b') : (theme?.colors?.text?.light || '#9ca3af');
      }};
    }
  }

  .MuiDataGrid-menuIcon {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
    }};
  }

  .MuiDataGrid-sortIcon {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
    }};
  }

  /* Virtual scroller and main content */
  .MuiDataGrid-virtualScroller {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#ffffff');
    }} !important;
  }

  .MuiDataGrid-main {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#ffffff');
    }} !important;
  }

  /* Ensure overlay elements match theme */
  .MuiDataGrid-overlay {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#ffffff');
    }} !important;
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
    }} !important;
  }

  .MuiDataGrid-columnSeparator {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
    }};
  }
`;

export const NoDataMessage = styled.div`
  padding: ${props => props.theme?.spacing?.xl || '24px'};
  text-align: center;
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
  }};
  font-size: ${props => props.theme?.typography?.fontSize?.md || '16px'};
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#f9fafb');
  }};
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
  }};
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
  }};
`;
