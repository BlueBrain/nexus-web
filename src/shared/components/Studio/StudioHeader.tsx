import * as React from 'react';

import './StudioHeader.less';

const StudioHeader: React.FC<{
  children: React.ReactChild[];
}> = ({ children }) => {
  return (
    <div className="studio-header">
      {children}
    </div>
  );
}

export default StudioHeader;