import './ProjectItem.scss';

import { ProjectResponseCommon } from '@bbp/nexus-sdk/es';
import { Tag } from 'antd';
import * as React from 'react';

const ProjectItem: React.FunctionComponent<ProjectResponseCommon> = (props) => {
  return (
    <div className="project-item">
      <p className="label">{props._label}</p>
      {props._deprecated && <Tag color="red">deprecated</Tag>}
      {props.description && <p className="description">{props.description}</p>}
    </div>
  );
};

export default ProjectItem;
