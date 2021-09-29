import * as React from 'react';
import { Alert } from 'antd';
import * as moment from 'moment';

import './ProjectWarning.less';

const ProjectWarning: React.FC<{
  projectLastUpdatedAt: string;
  duration: number;
}> = ({ projectLastUpdatedAt, duration }) => {
  console.log('projectLastUpdatedAt', projectLastUpdatedAt);
  console.log('duration', duration);

  let deletionTime;

  if (projectLastUpdatedAt && duration) {
    deletionTime = moment(projectLastUpdatedAt)
      .add(duration, 'seconds')
      .format('LLL');
  } else {
    deletionTime = '';
  }

  const message = `Your project and data will be automatically deleted on ${deletionTime} if you don't update any resources until then. After deletion, a new empty project will be created for you if you connect to Nexus again.`;

  return (
    <div className="project-warning">
      <Alert message={message} type="info" showIcon />
    </div>
  );
};

export default ProjectWarning;
