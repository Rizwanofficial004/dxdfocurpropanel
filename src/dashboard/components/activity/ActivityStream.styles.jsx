import styled from 'styled-components';

// Styled components
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: ${props => props.dashboard ? '20px 0' : '20px'};
  background: transparent;
  border-radius: 12px;
//   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  [data-theme="dark"] & {
    background: transparent;
  }
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

export const DateNav = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
    background: #f9fafb;
    border-radius: 8px;
  height: auto;
  padding: 10px 5px;

  [data-theme="dark"] & {
    background: #1d232c;
  }
`;

export const EmployeeTab = styled.div`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  height: auto;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &:active {
    background: #f3f4f6;
  }

  [data-theme="dark"] & {
    background: #1d232c;
    color: #f8fafc;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

    &:hover {
      background: #334155;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }

    &:active {
      background: #475569;
    }
  }
`;

export const DateTab = styled.div`
  padding: 4px 16px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  background: ${props => props.active ? '#0066FF' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#6b7280'};
  height: auto;
  min-width: 56px;

  .date {
    font-weight: 600;
    line-height: 1;
  }
  
  .month {
    font-size: 11px;
    opacity: 0.9;
    margin-top: 2px;
  }

  [data-theme="dark"] & {
    color: ${props => props.active ? '#fff' : '#fff'};
  }
`;

export const ArrowButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  font-size: 16px;
  
  &:hover {
    color: #6b7280;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
  }

  [data-theme="dark"] & {
    color: #f8fafc;

    &:hover {
      color: #d1d5db;
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  gap: 12px;

`;

export const SearchContainer = styled.div`
  min-width: 280px;
  max-width: 320px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  background: #f9fafb;
  color: #111827;
  transition: all 0.2s;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:focus {
    outline: none;
    border-color: #0066FF;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 102, 255, 0.1);
  }

  &::selection {
    background: rgba(0, 102, 255, 0.1);
  }

  [data-theme="dark"] & {
    background: #0f172a;
    border-color: #6b7280;
    color: #fff;

    &::placeholder {
      color: #d1d5db;
    }

    &:focus {
      background: #1d232c;
      border-color: #0066FF;
      box-shadow: 0 1px 2px rgba(0, 102, 255, 0.3);
    }
  }
`;

export const SearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;

  [data-theme="dark"] & {
    background: #1d232c;
    border-color: #6b7280;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
`;

export const SearchDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
  }

  [data-theme="dark"] & {
    border-color: #374151;

    &:hover {
      background: #374151;
    }
  }
`;

export const SearchDropdownAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4285f4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
`;

export const SearchDropdownInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SearchDropdownName = styled.div`
  font-weight: 500;
  color: #202124;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  [data-theme="dark"] & {
    color: #fff;
  }
`;

export const SearchDropdownEmail = styled.div`
  font-size: 12px;
  color: #5f6368;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  [data-theme="dark"] & {
    color: #d1d5db;
  }
`;

export const EmptyStateContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: transparent;
  border-radius: 8px;

  [data-theme="dark"] & {
    background: transparent;
  }
`;

export const EmptyIcon = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
  opacity: 0.9;
`;

export const EmptyText = styled.div`
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  line-height: 1.4;

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

export const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const Select = styled.select`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  outline: none;
  min-width: 100px;

  &:focus {
    border-color: #0066FF;
    box-shadow: 0 1px 2px rgba(0, 102, 255, 0.1);
  }

  &:hover {
    background: #f9fafb;
  }

  [data-theme="dark"] & {
    /* dark-mode selects should use #1e293b as requested */
    background: #1e293b;
    border-color: #6b7280;
    color: #fff;

    &:focus {
      border-color: #0066FF;
      box-shadow: 0 1px 2px rgba(0, 102, 255, 0.3);
    }

    &:hover {
      background: #334155;
    }
  }
`;

export const DateRowContainer = styled.div`
  display: flex;
  gap: 6px;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  overflow-x: auto;
  min-width: fit-content;
  max-width: 100%;

  [data-theme="dark"] & {
    background: #1d232c;
    border-color: #6b7280;
  }
`;

export const DateItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 50px;
  font-size: 11px;
  cursor: pointer;
  border-radius: 4px;
  position: relative;
  background: ${props => props.isSelected ? '#4285f4' : 'transparent'};
  color: ${props => props.isSelected ? 'white' : '#202124'};
  font-weight: ${props => props.isSelected ? '600' : '400'};
  transition: all 0.2s;
  border: ${props => props.isSelected ? '1px solid #4285f4' : '1px solid #e1e5e9'};

  &:hover {
    background: ${props => props.isSelected ? '#4285f4' : '#f5f5f5'};
  }

  [data-theme="dark"] & {
    color: ${props => props.isSelected ? 'white' : '#fff'};
    border-color: ${props => props.isSelected ? '#4285f4' : '#6b7280'};

    &:hover {
      background: ${props => props.isSelected ? '#4285f4' : '#374151'};
    }
  }
`;
