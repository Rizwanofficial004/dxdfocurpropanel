import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Slider,
  SliderContainer,
  SliderLabel,
  SliderValue,
  SliderGroup
} from '../../styles/commonStyles';

const SliderDemo = () => {
  const { theme, isDarkMode } = useTheme();
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(75);
  const [range, setRange] = useState([20, 80]);

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3 style={{ color: theme.colors.text.primary, marginBottom: '20px' }}>
        Dark/Light Mode Sliders Demo
      </h3>

      {/* Basic Slider */}
      <SliderGroup theme={theme} isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SliderLabel theme={theme} isDarkMode={isDarkMode}>
            Volume
          </SliderLabel>
          <SliderValue theme={theme} isDarkMode={isDarkMode}>
            {volume}%
          </SliderValue>
        </div>
        <SliderContainer theme={theme} isDarkMode={isDarkMode}>
          <Slider
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </SliderContainer>
      </SliderGroup>

      {/* Brightness Slider */}
      <SliderGroup theme={theme} isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SliderLabel theme={theme} isDarkMode={isDarkMode}>
            Brightness
          </SliderLabel>
          <SliderValue theme={theme} isDarkMode={isDarkMode}>
            {brightness}%
          </SliderValue>
        </div>
        <SliderContainer theme={theme} isDarkMode={isDarkMode}>
          <Slider
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(e.target.value)}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </SliderContainer>
      </SliderGroup>

      {/* Disabled Slider Example */}
      <SliderGroup theme={theme} isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SliderLabel theme={theme} isDarkMode={isDarkMode}>
            Disabled Slider
          </SliderLabel>
          <SliderValue theme={theme} isDarkMode={isDarkMode}>
            30%
          </SliderValue>
        </div>
        <SliderContainer theme={theme} isDarkMode={isDarkMode}>
          <Slider
            min="0"
            max="100"
            value="30"
            disabled
            theme={theme}
            isDarkMode={isDarkMode}
          />
        </SliderContainer>
      </SliderGroup>

      {/* HTML Range Input with Global CSS */}
      <div style={{ marginTop: '30px' }}>
        <label style={{ 
          color: theme.colors.text.primary, 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Global CSS Styled Slider
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value="60"
          style={{ width: '100%' }}
          className="slider-primary"
        />
      </div>

      {/* Different Colored Sliders */}
      <div style={{ marginTop: '20px' }}>
        <label style={{ 
          color: theme.colors.text.primary, 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Success Slider
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value="80"
          style={{ width: '100%' }}
          className="slider-success"
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label style={{ 
          color: theme.colors.text.primary, 
          display: 'block', 
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Warning Slider
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value="40"
          style={{ width: '100%' }}
          className="slider-warning"
        />
      </div>
    </div>
  );
};

export default SliderDemo;
