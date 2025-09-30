import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
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
  const { language } = useLanguage();

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus trap for accessibility
    const modal = document.querySelector('[data-welcome-modal]');
    if (modal) {
      modal.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const content = {
    en: {
      title: "Welcome to Your Dashboard!",
      description: "We're excited to have you on board. Our new dashboard is designed to provide you with a seamless and intuitive experience.",
      button: "Let's Get Started"
    },
    tr: {
      title: "Dashboard'unuza Hoş Geldiniz!",
      description: "Sizi aramızda görmekten mutluluk duyuyoruz. Yeni dashboard'umuz size sorunsuz ve sezgisel bir deneyim sunmak için tasarlandı.",
      button: "Başlayalım"
    }
  };

  const currentContent = content[language] || content.en;

  const handleOverlayClick = (e) => {
    // Close modal when clicking on overlay (not content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick} data-welcome-modal tabIndex={-1}>
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
          <CloseButton 
            onClick={onClose}
            aria-label={language === 'tr' ? 'Kapat' : 'Close'}
            title={language === 'tr' ? 'Kapat' : 'Close'}
          >
            &times;
          </CloseButton>
          <ModalTitle>{currentContent.title}</ModalTitle>
          <ModalDescription>
            {currentContent.description}
          </ModalDescription>
          <OkButton onClick={onClose} autoFocus>
            {currentContent.button}
          </OkButton>
        </ContentColumn>
      </ModalContent>
    </ModalOverlay>
  );
};

export default WelcomeModal;
