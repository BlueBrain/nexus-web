import * as React from 'react';

const ResourceInfoPanel: React.FC<{ typeInfo: string }> = ({ typeInfo }) => {
  return (
    <div style={{ width: '20%', backgroundColor: '#fff', padding: '10px' }}>
      <h3>{typeInfo}...</h3>
    </div>
  );
};

export default ResourceInfoPanel;
