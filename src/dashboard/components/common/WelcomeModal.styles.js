import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

export const ModalContent = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 680px;
  display: flex;
  overflow: hidden;
  font-family: 'Inter', sans-serif;

  [data-theme="dark"] & {
    background-color: #1d232c;
  }
`;

export const IllustrationColumn = styled.div`
  flex: 1;
  background-color: #f0f5ff;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  [data-theme="dark"] & {
    background-color: #161a22;
  }
`;

export const ModalImage = styled.img`
  max-width: 100%;
  height: auto;
`;

export const ContentColumn = styled.div`
  flex: 1;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #aaa;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }

  [data-theme="dark"] & {
    color: #777;
    &:hover {
      color: #fff;
    }
  }
`;

export const ModalTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #1d232c;
  margin: 0 0 15px 0;

  [data-theme="dark"] & {
    color: #fff;
  }
`;

export const ModalDescription = styled.p`
  font-size: 16px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 30px 0;

  [data-theme="dark"] & {
    color: #ccc;
  }
`;

export const OkButton = styled.button`
  background: linear-gradient(90deg, #007aff, #0056b3);
  color: #fff;
  border: none;
  padding: 14px 35px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 122, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 122, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 5px 15px rgba(0, 122, 255, 0.3);
  }
`;