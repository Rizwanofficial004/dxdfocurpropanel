import React from 'react';
import { useLocation } from 'react-router-dom';
import CredentialsSettings from './settings/CredentialsSettings';

const Settings = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine which settings component to render based on the path
  const renderSettingsComponent = () => {
    switch (currentPath) {
      case '/dashboard/settings/credentials':
        return <CredentialsSettings />;
      default:
        // Default to Credentials Settings if no specific path matches
        return <CredentialsSettings />;
    }
  };

  return renderSettingsComponent();
};

export default Settings;
