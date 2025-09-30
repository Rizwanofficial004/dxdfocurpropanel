import React from 'react';
import { useLocation } from 'react-router-dom';
import StyleSettings from './StyleSettings';
import CredentialsSettings from './settings/CredentialsSettings';

const Settings = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine which settings component to render based on the path
  const renderSettingsComponent = () => {
    switch (currentPath) {
      case '/dashboard/settings/style':
        return <StyleSettings />;
      case '/dashboard/settings/credentials':
        return <CredentialsSettings />;
      default:
        // Default to Style Settings if no specific path matches
        return <StyleSettings />;
    }
  };

  return renderSettingsComponent();
};

export default Settings;
