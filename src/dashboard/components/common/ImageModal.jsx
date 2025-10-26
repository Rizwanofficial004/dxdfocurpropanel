import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaChevronLeft, FaChevronRight, FaExpand, FaCompress } from 'react-icons/fa';

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Enhanced theme detection
const getThemeProps = (props) => {
  const isDarkMode = props.isDarkMode || props.theme?.mode === 'dark' || props.theme?.name === 'dark';
  return { isDarkMode, theme: props.theme };
};

// Styled Components
export const ModalOverlay = styled(motion.div)`
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: ${props => {
    const { isDarkMode } = getThemeProps(props);
    return isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.85)';
  }} !important;
  backdrop-filter: blur(8px) !important;
  z-index: 99999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px !important;
  animation: ${fadeIn} 0.3s ease-out !important;
  isolation: isolate !important;
  pointer-events: auto !important;
`;

export const ModalContainer = styled(motion.div)`
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.surface || '#ffffff');
  }};
  border-radius: ${props => props.theme?.borderRadius?.xl || '16px'};
  box-shadow: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? 
      (theme?.shadows?.xl || '0 25px 50px rgba(0, 0, 0, 0.6)') :
      (theme?.shadows?.xl || '0 25px 50px rgba(0, 0, 0, 0.25)');
  }};
  border: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? `1px solid ${theme?.colors?.border || '#334155'}` : 'none';
  }};
  overflow: hidden;
  animation: ${slideIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 100000;
  isolation: isolate;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.hover || '#334155') : (theme?.colors?.background || '#f8fafc');
  }};
  border-bottom: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e2e8f0');
  }};
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme?.typography?.fontSize?.lg || '18px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1e293b');
  }};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ModalActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ActionButton = styled.button`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.variant === 'primary') {
      return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#2563eb');
    }
    return 'transparent';
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.variant === 'primary') {
      return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#2563eb');
    }
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e2e8f0');
  }};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.variant === 'primary') {
      return '#ffffff';
    }
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1e293b');
  }};
  padding: 8px 12px;
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || '500'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      if (props.variant === 'primary') {
        return isDarkMode ? '#2563eb' : '#1d4ed8';
      }
      return isDarkMode ? (theme?.colors?.hover || '#475569') : (theme?.colors?.hover || '#f1f5f9');
    }};
    transform: translateY(-1px);
    box-shadow: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? 
        (theme?.shadows?.md || '0 4px 8px rgba(0, 0, 0, 0.3)') :
        (theme?.shadows?.sm || '0 2px 4px rgba(0, 0, 0, 0.1)');
    }};
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CloseButton = styled(ActionButton)`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? '#dc2626' : '#ef4444';
  }};
  border-color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? '#dc2626' : '#ef4444';
  }};
  color: #ffffff;

  &:hover {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? '#b91c1c' : '#dc2626';
    }};
  }
`;

export const ModalContent = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? '#0f172a' : '#f8fafc';
  }};
`;

export const ImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-height: 70vh;
`;

export const ModalImage = styled(motion.img)`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  box-shadow: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? 
      (theme?.shadows?.lg || '0 10px 15px rgba(0, 0, 0, 0.4)') :
      (theme?.shadows?.md || '0 4px 8px rgba(0, 0, 0, 0.1)');
  }};
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const NavigationButton = styled.button`
  padding: 0px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'left' ? 'left: 20px;' : 'right: 20px;'}
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e2e8f0');
  }};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1e293b');
  }};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  z-index: 10;

  &:hover {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#2563eb');
    }};
    color: #ffffff;
    transform: translateY(-50%) scale(1.1);
    box-shadow: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? 
        (theme?.shadows?.lg || '0 8px 16px rgba(0, 0, 0, 0.4)') :
        (theme?.shadows?.md || '0 4px 8px rgba(0, 0, 0, 0.15)');
    }};
  }

  &:active {
    transform: translateY(-50%) scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        return isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
      }};
      color: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1e293b');
      }};
      transform: translateY(-50%);
    }
  }
`;

export const ImageInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)';
  }};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1e293b');
  }};
  padding: 16px 20px;
  backdrop-filter: blur(8px);
  border-top: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e2e8f0');
  }};
`;

export const ImageTitle = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  margin-bottom: 4px;
`;

export const ImageDetails = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.xs || '12px'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#64748b');
  }};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const LoadingSpinner = styled(motion.div)`
  width: 48px;
  height: 48px;
  border: 4px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e2e8f0');
  }};
  border-top: 4px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#2563eb');
  }};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Main Modal Component
const ImageModal = ({ 
  isOpen, 
  onClose, 
  images = [], 
  currentIndex = 0, 
  onIndexChange,
  theme,
  isDarkMode 
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for left, 1 for right, 0 for no slide

  // Update internal index when prop changes
  useEffect(() => {
    setCurrentImageIndex(currentIndex);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'd':
        case 'D':
          handleDownload();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const currentImage = images[currentImageIndex];

  const handlePrevious = useCallback(() => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setSlideDirection(-1);
      setCurrentImageIndex(newIndex);
      setImageLoading(true);
      onIndexChange?.(newIndex);
    }
  }, [currentImageIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    if (currentImageIndex < images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setSlideDirection(1);
      setCurrentImageIndex(newIndex);
      setImageLoading(true);
      onIndexChange?.(newIndex);
    }
  }, [currentImageIndex, images.length, onIndexChange]);

  const handleDownload = useCallback(async () => {
    if (!currentImage || downloadLoading) return;
    
    setDownloadLoading(true);
    
    try {
      const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage.src || currentImage.image;
      const imageName = typeof currentImage === 'string' 
        ? `screenshot-${currentImageIndex + 1}.jpg`
        : currentImage.title || currentImage.task || `screenshot-${currentImageIndex + 1}.jpg`;

      // Try to download via fetch for CORS support
      try {
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = imageName.replace(/[^a-z0-9.-]/gi, '_');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          throw new Error('Fetch failed');
        }
      } catch (fetchError) {
        // Fallback to direct link download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = imageName.replace(/[^a-z0-9.-]/gi, '_');
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      // Error handling without logging
    } finally {
      setDownloadLoading(false);
    }
  }, [currentImage, currentImageIndex, downloadLoading]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !currentImage) {
    return null;
  }

  const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage.src || currentImage.image;
  const imageTitle = typeof currentImage === 'string' 
    ? `Screenshot ${currentImageIndex + 1}`
    : currentImage.title || currentImage.task || `Screenshot ${currentImageIndex + 1}`;
  const imageTime = typeof currentImage === 'object' ? currentImage.time : '';

  // Ensure document.body exists before creating portal
  if (typeof document === 'undefined' || !document.body) {
    return null;
  }

  const modalContent = (
    <AnimatePresence mode="wait">
      <ModalOverlay
        theme={theme}
        isDarkMode={isDarkMode}
        onClick={handleOverlayClick}
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.1, 0.25, 1],
          backdropFilter: { duration: 0.3 }
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          pointerEvents: 'auto'
        }}
      >
        <ModalContainer
          theme={theme}
          isDarkMode={isDarkMode}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <ModalHeader theme={theme} isDarkMode={isDarkMode}>
            <ModalTitle theme={theme} isDarkMode={isDarkMode}>
              📷 {imageTitle}
              {images.length > 1 && (
                <span style={{ fontSize: '14px', fontWeight: 'normal', opacity: 0.7 }}>
                  ({currentImageIndex + 1} of {images.length})
                </span>
              )}
            </ModalTitle>
            <ModalActions>
              <ActionButton
                variant="primary"
                onClick={handleDownload}
                theme={theme}
                isDarkMode={isDarkMode}
                title="Download Image (D)"
                disabled={downloadLoading}
                style={{
                  opacity: downloadLoading ? 0.7 : 1,
                  cursor: downloadLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {downloadLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ width: 14, height: 14, display: 'inline-block' }}
                    >
                      ⟳
                    </motion.div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Download
                  </>
                )}
              </ActionButton>
              <CloseButton
                onClick={onClose}
                theme={theme}
                isDarkMode={isDarkMode}
                title="Close (Esc)"
              >
                <FaTimes />
              </CloseButton>
            </ModalActions>
          </ModalHeader>

          <ModalContent theme={theme} isDarkMode={isDarkMode}>
            <ImageContainer>
              {/* Temporarily removed loading spinner for debugging */}
              
              {/* Simple test image */}
              <div style={{ 
                position: 'absolute', 
                top: '10px', 
                left: '10px', 
                background: 'yellow', 
                padding: '10px',
                zIndex: 1000
              }}>
                URL: {imageUrl ? imageUrl.substring(0, 50) + '...' : 'No URL'}
              </div>
              
              <ModalImage
                src={imageUrl}
                alt={imageTitle}
                theme={theme}
                onLoad={() => {
                  setImageLoading(false);
                  setSlideDirection(0);
                }}
                onError={(e) => {
                  setImageLoading(false);
                  setSlideDirection(0);
                }}
                key={`image-${currentImageIndex}`}
                initial={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  y: 0 
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: 0,
                  y: 0
                }}
                transition={{ 
                  duration: 0.3
                }}
                style={{ 
                  display: 'block',
                  opacity: 1,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto'
                }}
              />

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <NavigationButton
                    direction="left"
                    onClick={handlePrevious}
                    disabled={currentImageIndex === 0}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    title="Previous Image (←)"
                  >
                    <FaChevronLeft />
                  </NavigationButton>
                  <NavigationButton
                    direction="right"
                    onClick={handleNext}
                    disabled={currentImageIndex === images.length - 1}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    title="Next Image (→)"
                  >
                    <FaChevronRight />
                  </NavigationButton>
                </>
              )}
            </ImageContainer>

            <ImageInfo theme={theme} isDarkMode={isDarkMode}>
              <ImageTitle theme={theme}>{imageTitle}</ImageTitle>
              <ImageDetails theme={theme} isDarkMode={isDarkMode}>
                <span>{imageTime}</span>
                <span>
                  🔗 <a 
                    href={imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: isDarkMode ? '#60a5fa' : '#2563eb',
                      textDecoration: 'none'
                    }}
                  >
                    View Original
                  </a>
                </span>
              </ImageDetails>
            </ImageInfo>
          </ModalContent>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );

  try {
    return createPortal(modalContent, document.body);
  } catch (error) {
    return modalContent; // Fallback to regular rendering
  }
};

export default ImageModal;
