import * as React from 'react';
import { Tag } from 'antd';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';

import './ProjectItem.scss';

const ProjectItem: React.FunctionComponent<ProjectResponseCommon> = props => {
  return (
    <div className="project-item">
      <p className="label">{props._label}</p>
      {props._deprecated && <Tag color="red">deprecated</Tag>}
      {props.description && <p className="description">{props.description}</p>}
    </div>
  );
};

export default ProjectItem;
