import * as React from 'react';
import { Alert } from 'antd';

import './ProjectWarning.less';

const ProjectWarning: React.FC<{}> = () => {
  return (
    <div className="project-warning">
      <Alert
        message="Your project and data will be automatically deleted on {projectCreatedAt + duration}. After that date, a new empty project will be created for you if you connect to Nexus again."
        type="info"
        showIcon
      />
    </div>
  );
};

export default ProjectWarning;
