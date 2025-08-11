import React, { useState } from 'react';
import styled from 'styled-components';
import { ImageModal } from '../common/ImageModal';

const TestContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const TestButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px;
  
  &:hover {
    background: #2563eb;
  }
`;

const TestImage = styled.img`
  width: 200px;
  height: 150px;
  object-fit: cover;
  margin: 10px;
  cursor: pointer;
  border-radius: 8px;
  border: 2px solid #ddd;
  
  &:hover {
    border-color: #3b82f6;
  }
`;

const ModalTest = ({ theme, isDarkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);

  // Sample test images
  const testImages = [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
  ];

  const openImageModal = (imageUrl, allImages = [imageUrl]) => {
    console.log('Opening modal with image:', imageUrl);
    setModalImages(allImages);
    setModalCurrentIndex(allImages.indexOf(imageUrl));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setModalImages([]);
    setModalCurrentIndex(0);
  };

  const handleFullscreenTest = () => {
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
    
    // Wait a bit then open modal
    setTimeout(() => {
      openImageModal(testImages[0], testImages);
    }, 1000);
  };

  return (
    <TestContainer>
      <h2>Image Modal Test</h2>
      <p>Click the buttons below to test the modal functionality:</p>
      
      <div>
        <TestButton onClick={() => openImageModal(testImages[0], testImages)}>
          Test Modal (Normal)
        </TestButton>
        
        <TestButton onClick={handleFullscreenTest}>
          Test Modal (Fullscreen)
        </TestButton>
        
        <TestButton onClick={() => {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        }}>
          Exit Fullscreen
        </TestButton>
      </div>
      
      <div>
        <h3>Click any image to open modal:</h3>
        {testImages.map((imageUrl, index) => (
          <TestImage
            key={index}
            src={imageUrl}
            alt={`Test image ${index + 1}`}
            onClick={() => openImageModal(imageUrl, testImages)}
          />
        ))}
      </div>

      {isModalOpen && (
        <ImageModal
          theme={theme}
          isDarkMode={isDarkMode}
          isOpen={isModalOpen}
          images={modalImages}
          currentIndex={modalCurrentIndex}
          onClose={closeModal}
          onNavigate={setModalCurrentIndex}
        />
      )}
    </TestContainer>
  );
};

export default ModalTest;
