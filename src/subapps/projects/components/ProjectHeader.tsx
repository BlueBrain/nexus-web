import * as React from 'react';

import './ProjectHeader.less';

const ProjectHeader: React.FC<{
  children?: React.ReactChild;
  title: string;
}> = ({ children, title }) => {
  return (
    <div className="project-header">
      <span className="project-header__name">{title}</span>
      <div className="project-header__actions">{children}</div>
    </div>
  );
};

export default ProjectHeader;
