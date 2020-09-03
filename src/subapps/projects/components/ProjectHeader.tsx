import * as React from 'react';
import { Button } from 'antd';

import ActioButton from '../components/ActionButton';

import './ProjectHeader.less';

const ProjectHeader: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <div className="project-header">
      <span className="project-header__name">{name}</span>
      <div className="project-header__actions">
        <div className="project-header__buttons">
          <ActioButton icon="Add" onClick={() => {}} title="Add new activity" />
          <ActioButton
            icon="Add"
            onClick={() => {}}
            title="Add activities from template"
          />
        </div>
        <div>
          <Button>Project Information</Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
