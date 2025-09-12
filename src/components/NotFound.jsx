import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8fafc;
  color: #1e293b;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
`;

const BackLink = styled.a`
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
`;

export default function NotFound() {
  return (
    <Wrapper>
      <Title>🚧 Page Under Development</Title>
      <Message>
        We’re working hard to bring you this feature.  
        Please check back later!
      </Message>
      <BackLink href="/admin-panel">⬅ Go back to Dashboard</BackLink>
    </Wrapper>
  );
}
