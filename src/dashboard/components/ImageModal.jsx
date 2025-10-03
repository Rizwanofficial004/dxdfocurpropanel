import React, { useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';

// Simple theme detection hook that doesn't depend on context
const useThemeDetection = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const isDark = theme === 'dark' || 
                    document.documentElement.classList.contains('dark') ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    // Check initial theme
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  return { isDarkMode };
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: zoomIn 0.3s ease-out;

  @keyframes zoomIn {
    from { 
      opacity: 0;
      transform: scale(0.8);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ModalImage = styled.img`
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  min-width: 200px;
  min-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  background-color: ${props => props.isDarkMode ? '#1a1a1a' : '#ffffff'};
  border: 2px solid ${props => props.isDarkMode ? '#374151' : '#e5e7eb'};
`;

const CloseButton = styled.button`
  position: absolute;
  top: -50px;
  right: -50px;
  width: 40px;
  height: 40px;
  background-color: ${props => props.isDarkMode ? '#374151' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#374151'};
  border: none;
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 10001;

  &:hover {
    background-color: ${props => props.isDarkMode ? '#4b5563' : '#f3f4f6'};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    top: 20px;
    right: 20px;
    width: 35px;
    height: 35px;
    font-size: 16px;
  }
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'prev' ? 'left: -80px;' : 'right: -80px;'}
  width: 50px;
  height: 50px;
  background-color: ${props => props.isDarkMode ? '#374151' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#374151'};
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.3 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  z-index: 10001;

  &:hover:not(:disabled) {
    background-color: ${props => props.isDarkMode ? '#4b5563' : '#f3f4f6'};
    transform: translateY(-50%) scale(1.1);
  }

  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.95);
  }

  @media (max-width: 768px) {
    ${props => props.direction === 'prev' ? 'left: -60px;' : 'right: -60px;'}
    width: 45px;
    height: 45px;
    font-size: 18px;
  }

  @media (max-width: 480px) {
    ${props => props.direction === 'prev' ? 'left: 20px;' : 'right: 20px;'}
    top: auto;
    bottom: 80px;
    transform: none;
    
    &:hover:not(:disabled) {
      transform: scale(1.1);
    }
    
    &:active:not(:disabled) {
      transform: scale(0.95);
    }
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => props.isDarkMode ? '#374151' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#374151'};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  z-index: 10001;

  @media (max-width: 768px) {
    bottom: -40px;
    font-size: 12px;
    padding: 6px 12px;
  }
  
  @media (max-width: 480px) {
    bottom: 20px;
  }
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${props => props.isDarkMode ? '#374151' : '#e5e7eb'};
  border-top: 4px solid ${props => props.isDarkMode ? '#60a5fa' : '#3b82f6'};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.isDarkMode ? '#fca5a5' : '#ef4444'};
  text-align: center;
  padding: 20px;
  background-color: ${props => props.isDarkMode ? '#374151' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const ImageModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  currentIndex = 0, 
  onNavigate,
  showNavigation = true,
  showCounter = true,
  loading = false,
  error = null,
  onImageLoad,
  onImageError
}) => {
  const { isDarkMode } = useThemeDetection();

  // Internal loading and error state
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0); // Track which URL we're trying

  // Add loading state when image changes
  useEffect(() => {
    if (isOpen && currentImage) {
      setImageLoading(true);
      setImageError(null);
      setCurrentUrlIndex(0); // Reset URL index when image changes
    }
  }, [isOpen, currentIndex, images]); // Changed dependency to images instead of currentImage

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        if (onClose) onClose();
        break;
      case 'ArrowLeft':
        if (showNavigation && currentIndex > 0 && onNavigate) {
          onNavigate(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (showNavigation && currentIndex < images.length - 1 && onNavigate) {
          onNavigate(currentIndex + 1);
        }
        break;
      default:
        break;
    }
  }, [isOpen, onClose, onNavigate, currentIndex, images.length, showNavigation]);

  // Add keyboard event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown]);

  // Handle overlay click to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1 && onNavigate) {
      onNavigate(currentIndex + 1);
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  
  // Safety check
  if (!currentImage && !loading && !error) {
    return null;
  }

  return (
    <ModalOverlay isDarkMode={isDarkMode} onClick={handleOverlayClick}>
      <ModalContent>
        {(loading || imageLoading) ? (
          <LoadingSpinner isDarkMode={isDarkMode} />
        ) : (error || imageError) ? (
          <ErrorMessage isDarkMode={isDarkMode}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Image Load Failed</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {error || imageError}
              </div>
              <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>
                Check your network connection or image server status
              </div>
            </div>
          </ErrorMessage>
        ) : currentImage ? (
          <>
            <ModalImage 
              src={currentImage.url || currentImage.src || currentImage}
              alt={currentImage.alt || currentImage.title || `Image ${currentIndex + 1}`}
              isDarkMode={isDarkMode}
              onLoad={(e) => {
                console.log('✅ Image loaded successfully:', e.target.src);
                setImageLoading(false);
                setImageError(null);
                if (onImageLoad) onImageLoad(e);
              }}
              onError={(e) => {
                console.error('❌ Image failed to load:', e.target.src);
                
                // Try next URL in fallback list
                const fallbackUrls = currentImage.fallbackUrls || [currentImage.fallbackUrl, currentImage.originalData?.screenshot_url].filter(Boolean);
                
                if (currentUrlIndex < fallbackUrls.length - 1) {
                  const nextUrlIndex = currentUrlIndex + 1;
                  const nextUrl = fallbackUrls[nextUrlIndex];
                  console.log(`🔄 Trying fallback URL ${nextUrlIndex + 1}/${fallbackUrls.length}:`, nextUrl);
                  setCurrentUrlIndex(nextUrlIndex);
                  e.target.src = nextUrl;
                } else {
                  console.error('❌ All fallback URLs failed');
                  setImageError(`Failed to load image. Tried ${fallbackUrls.length} URLs.`);
                  setImageLoading(false);
                  if (onImageError) onImageError(e);
                }
              }}
            />
            
            {/* Close Button */}
            <CloseButton 
              isDarkMode={isDarkMode} 
              onClick={onClose}
              title="Close (ESC)"
            >
              ×
            </CloseButton>
            
            {/* Navigation Buttons */}
            {showNavigation && images.length > 1 && (
              <>
                <NavigationButton 
                  direction="prev"
                  isDarkMode={isDarkMode}
                  disabled={currentIndex === 0}
                  onClick={handlePrevious}
                  title="Previous (←)"
                >
                  ←
                </NavigationButton>
                
                <NavigationButton 
                  direction="next"
                  isDarkMode={isDarkMode}
                  disabled={currentIndex === images.length - 1}
                  onClick={handleNext}
                  title="Next (→)"
                >
                  →
                </NavigationButton>
              </>
            )}
            
            {/* Image Counter */}
            {showCounter && images.length > 1 && (
              <ImageCounter isDarkMode={isDarkMode}>
                {currentIndex + 1} of {images.length}
              </ImageCounter>
            )}
          </>
        ) : (
          <ErrorMessage isDarkMode={isDarkMode}>
            No image to display
          </ErrorMessage>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default ImageModal;