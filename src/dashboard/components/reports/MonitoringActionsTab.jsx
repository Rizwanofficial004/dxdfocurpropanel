import React from 'react';

const MonitoringActionsTab = ({ theme }) => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', background: theme.colors.surface, borderRadius: '8px' }}>
      <h3>Monitoring Actions</h3>
      <p>System monitoring events and actions log.</p>
    </div>
  );
};

export default MonitoringActionsTab;