import React, { useState, useRef, useEffect } from 'react';
import { TooltipWrapper, TooltipIcon, TooltipContent } from './Tooltip.styles';

/**
 * Generic Tooltip Component with Auto-positioning
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to display with tooltip
 * @param {string} props.text - The tooltip message to display on hover
 * @param {Object} props.theme - Theme object for styling
 * @param {string} [props.icon='ⓘ'] - Custom icon to display (default: info icon)
 * 
 * @example
 * <Tooltip text="This is a tooltip" theme={theme}>
 *   Hover over me
 * </Tooltip>
 */
const Tooltip = ({ children, text, theme, icon = 'ⓘ' }) => {
  const [show, setShow] = useState(false);
  const [isPinned, setIsPinned] = useState(false); // Track if tooltip is pinned by click
  const [position, setPosition] = useState({ vertical: 'top', horizontal: 'center' });
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);
  
  useEffect(() => {
    if (show && wrapperRef.current && tooltipRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => calculatePosition(), 10);
    }
  }, [show]);
  
  const calculatePosition = () => {
    const wrapper = wrapperRef.current;
    const tooltip = tooltipRef.current;
    
    if (!wrapper || !tooltip) return;
    
    const wrapperRect = wrapper.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const spaceTop = wrapperRect.top;
    const spaceBottom = viewportHeight - wrapperRect.bottom;
    
    let vertical = 'top'; // Default to top (above)
    let horizontal = 'center';
    
    // Determine vertical position - prefer top (above)
    if (spaceTop > tooltipRect.height + 10) {
      vertical = 'top';
    } else if (spaceBottom > tooltipRect.height + 10) {
      vertical = 'bottom';
    } else {
      vertical = spaceTop > spaceBottom ? 'top' : 'bottom';
    }
    
    // Determine horizontal position
    const tooltipHalfWidth = tooltipRect.width / 2;
    const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
    
    if (wrapperCenter - tooltipHalfWidth < 10) {
      horizontal = 'left';
    } else if (wrapperCenter + tooltipHalfWidth > viewportWidth - 10) {
      horizontal = 'right';
    } else {
      horizontal = 'center';
    }
    
    console.log('Tooltip position:', { vertical, horizontal, show, isPinned });
    setPosition({ vertical, horizontal });
  };
  
  const handleClick = (e) => {
    e.stopPropagation();
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    setShow(newPinnedState);
    console.log('Tooltip clicked, isPinned:', newPinnedState, 'show:', newPinnedState);
  };
  
  const handleMouseEnter = () => {
    if (!isPinned) {
      console.log('Mouse entered (not pinned)');
      setShow(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!isPinned) {
      console.log('Mouse left (not pinned)');
      setShow(false);
    }
  };

  // Determine if we're in dark mode from the theme object
  const isDarkMode = theme?.mode === 'dark';
  
  console.log('Tooltip theme:', { mode: theme?.mode, isDarkMode });

  return (
    <TooltipWrapper
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
      <TooltipContent 
        ref={tooltipRef}
        show={show} 
        theme={theme}
        $isDarkMode={isDarkMode}
        position={position}
      >
        {text}
      </TooltipContent>
    </TooltipWrapper>
  );
};

export default Tooltip;
