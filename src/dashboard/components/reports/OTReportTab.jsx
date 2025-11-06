import React from 'react';

const OTReportTab = ({ theme }) => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', background: theme.colors.surface, borderRadius: '8px' }}>
      <h3>OT Report</h3>
      <p>Overtime tracking and analysis reports.</p>
    </div>
  );
};

export default OTReportTab;