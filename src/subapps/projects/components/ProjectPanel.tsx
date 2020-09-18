import * as React from 'react';

import NewActivityContainer from '../containers/NewActivityContainer';
import TemplatesContainer from '../containers/TemplatesContainer';
import ProjectMetaContaier from '../containers/ProjectMetaContainer';

import './ProjectPanel.less';

const ProjectPanel: React.FC<{
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
}> = ({ projectLabel, orgLabel, onUpdate }) => {
  return (
    <div className="project-panel">
      <span className="project-panel__name">{projectLabel}</span>
      <div className="project-panel__actions">
        <NewActivityContainer
          projectLabel={projectLabel}
          orgLabel={orgLabel}
          onSuccess={onUpdate}
        />
        <TemplatesContainer />
        <ProjectMetaContaier projectLabel={projectLabel} orgLabel={orgLabel} />
      </div>
    </div>
  );
};

export default ProjectPanel;
