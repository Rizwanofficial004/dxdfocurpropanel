import styled from 'styled-components';

// Styled components
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: transparent;
  border-radius: 12px;
//   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
`;

export const DateNav = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px dashed #e5e7eb;
  height: auto;
  padding: 10px 5px;
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
`;

export const EmptyStateContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #e5e7eb;
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
`;
