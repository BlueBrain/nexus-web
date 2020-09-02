import * as React from 'react';

import './ProjectHeader.less';

const ProjectHeader: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <div className="project-header">
      <div>
        <span className="project-name">{name}</span>
        <button>Add new activity</button>
        <button>Add activities from template</button>
      </div>
      <button>Product Information</button>
    </div>
  );
};

export default ProjectHeader;
