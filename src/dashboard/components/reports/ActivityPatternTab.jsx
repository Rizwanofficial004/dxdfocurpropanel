import React from 'react';

const ActivityPatternTab = ({ theme }) => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', background: theme.colors.surface, borderRadius: '8px' }}>
      <h3>Activity Pattern</h3>
      <p>Detailed activity pattern analysis and charts.</p>
    </div>
  );
};

export default ActivityPatternTab;