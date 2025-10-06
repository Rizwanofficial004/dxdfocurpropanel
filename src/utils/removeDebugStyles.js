// Remove any dynamically added red borders or debugging styles
export const removeRedBorders = () => {
  // Remove all elements with red borders
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const inlineStyle = element.style;
    
    // Check for red borders in computed styles
    if (computedStyle.borderColor && computedStyle.borderColor.includes('rgb(255, 0, 0)')) {
      element.style.border = 'none';
    }
    
    // Check for red borders in inline styles
    if (inlineStyle.border && inlineStyle.border.includes('red')) {
      element.style.border = 'none';
    }
    
    if (inlineStyle.borderColor && inlineStyle.borderColor.includes('red')) {
      element.style.borderColor = 'transparent';
    }
    
    // Remove outlines
    if (inlineStyle.outline && inlineStyle.outline.includes('red')) {
      element.style.outline = 'none';
    }
    
    // Remove any box-shadow with red
    if (inlineStyle.boxShadow && inlineStyle.boxShadow.includes('red')) {
      element.style.boxShadow = 'none';
    }
  });
  
  // Also remove any CSS classes that might add red borders
  const redBorderClasses = ['debug-border', 'red-border', 'error-border', 'highlight-border'];
  redBorderClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(el => el.classList.remove(className));
  });
};

// Run on load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', removeRedBorders);
  // Also run it immediately in case DOM is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeRedBorders);
  } else {
    removeRedBorders();
  }
  
  // Run periodically to catch any dynamically added borders
  setInterval(removeRedBorders, 1000);
}