import * as React from 'react';
import { Button, Modal } from 'antd';
import ActioButton from '../components/ActionButton';
import { ProjectMetadata } from './ProjectForm';

import './ProjectHeader.less';

const ProjectHeader: React.FC<{
  children?: React.ReactChild;
  project: ProjectMetadata;
}> = ({ project, children }) => {
  return (
    <div className="project-header">
      <span className="project-header__name">{project.name}</span>
      <div className="project-header__actions">
        <div className="project-header__buttons">
          <ActioButton icon="Add" onClick={() => {}} title="Add new activity" />
          <ActioButton
            icon="Add"
            onClick={() => {}}
            title="Add activities from template"
          />
        </div>
        {children}
      </div>
    </div>
  );
};

export default ProjectHeader;
