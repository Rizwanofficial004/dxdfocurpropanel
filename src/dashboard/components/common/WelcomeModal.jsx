import React from 'react';
import {
  ModalOverlay,
  ModalContent,
  IllustrationColumn,
  ContentColumn,
  CloseButton,
  ModalImage,
  ModalTitle,
  ModalDescription,
  OkButton,
} from './WelcomeModal.styles';

const WelcomeModal = ({ onClose }) => {
  return (
    <ModalOverlay>
      <ModalContent>
        <IllustrationColumn>
          <svg xmlns="" viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-monitor" style={{width: '100%', height: 'auto'}}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
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
