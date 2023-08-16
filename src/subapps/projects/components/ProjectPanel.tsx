import * as React from 'react';
import { Button } from 'antd';

import ProjectMetaContaier from '../containers/ProjectMetaContainer';
import ActivitiesLinkingContainer from '../containers/ActivitiesLinkingContainer';

import './ProjectPanel.scss';

const ProjectPanel: React.FC<{
  projectLabel: string;
  orgLabel: string;
}> = ({ projectLabel, orgLabel }) => {
  const [showInfo, setShowInfo] = React.useState<boolean>(false);

  return (
    <div className="project-panel">
      <span className="project-panel__name">{projectLabel}</span>
      <div className="project-panel__actions">
        <Button onClick={() => setShowInfo(true)}>Project Info</Button>
        {showInfo && (
          <ProjectMetaContaier
            projectLabel={projectLabel}
            orgLabel={orgLabel}
            onClose={() => setShowInfo(false)}
          />
        )}
        <ActivitiesLinkingContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
        />
      </div>
    </div>
  );
};

export default ProjectPanel;
