import React from 'react';
import {
  ModalOverlay,
  ModalContent,
  IllustrationColumn,
  ContentColumn,
  CloseButton,
  ModalTitle,
  ModalDescription,
  OkButton,
} from './WelcomeModal.styles';

const WelcomeModal = ({ onClose }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <IllustrationColumn>
          <svg
            width="100%"
            height="auto"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#007aff"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="7 12 10 9 14 13 17 10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7" cy="12" r="0.5" fill="#007aff" />
            <circle cx="10" cy="9" r="0.5" fill="#007aff" />
            <circle cx="14" cy="13" r="0.5" fill="#007aff" />
            <circle cx="17" cy="10" r="0.5" fill="#007aff" />
          </svg>
        </IllustrationColumn>
        <ContentColumn>
          <CloseButton onClick={onClose}>&times;</CloseButton>
          <ModalTitle>Welcome to Your Dashboard!</ModalTitle>
          <ModalDescription>
            We're excited to have you on board. Our new dashboard is designed to provide you with a seamless and intuitive experience.
          </ModalDescription>
          <OkButton onClick={onClose}>Let's Get Started</OkButton>
        </ContentColumn>
      </ModalContent>
    </ModalOverlay>
  );
};

export default WelcomeModal;
