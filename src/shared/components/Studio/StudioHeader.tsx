import * as React from 'react';

import './StudioHeader.less';

const StudioHeader: React.FC<{
  label: string;
  description?: string;
}> = ({ children, label, description }) => {
  return (
    <div className="studio-header">
      <div>
        <h1 className="title">{label}</h1>
        {description && <p className="description">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default StudioHeader;
