import React from 'react';

export const NoDataCell: React.FC<{}> = () => {
  return (
    <div
      style={{
        color: '#CE2A2A',
        backgroundColor: '#ffd9d9',
        fontWeight: 600,
        lineHeight: '17.5px',
        padding: '5px',
        paddingLeft: '10px',
      }}
    >
      No data
    </div>
  );
};
