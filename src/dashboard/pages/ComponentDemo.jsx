import React from 'react';
import styled from 'styled-components';
import { CurrentStatus, CompanyAverage } from '../components';

const DemoContainer = styled.div`
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
`;

const ComponentsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const SectionTitle = styled.h1`
  text-align: center;
  color: #1f2937;
  margin-bottom: 32px;
  font-size: 24px;
  font-weight: 600;
`;

const ComponentDemo = () => {
  return (
    <DemoContainer>
      <SectionTitle>Dashboard Components Demo</SectionTitle>
      <ComponentsGrid>
        <CurrentStatus />
        <CompanyAverage />
      </ComponentsGrid>
    </DemoContainer>
  );
};

export default ComponentDemo;
