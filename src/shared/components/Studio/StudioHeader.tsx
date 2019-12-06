import * as React from 'react';

import './StudioHeader.less';

const StudioHeader: React.FC<{
  children: React.ReactChild[];
  label: string;
  description?: string;
}> = ({ children, label, description }) => {
  return (
    <div className="studio-header">
      <h1 className="title">
        {label}
      </h1>
      <div>
        {children}
      </div>
      {description && (
        <p className="description">{description}</p>
      )}
    </div>
  );
}

export default StudioHeader;