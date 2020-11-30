import * as React from 'react';
import { Button } from 'antd';

import NewActivityContainer from '../containers/NewActivityContainer';
import TemplatesContainer from '../containers/TemplatesContainer';
import ProjectMetaContaier from '../containers/ProjectMetaContainer';
import NotificationsContainer from '../containers/NotificationsContainer';

import './ProjectPanel.less';

const ProjectPanel: React.FC<{
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
  activityLabel?: string;
  activitySelfUrl?: string;
  siblings?: {
    name: string;
    '@id': string;
  }[];
}> = ({
  projectLabel,
  orgLabel,
  onUpdate,
  activityLabel,
  activitySelfUrl,
  siblings,
}) => {
  const [showInfo, setShowInfo] = React.useState<boolean>(false);

  return (
    <div className="project-panel">
      <span className="project-panel__name">{projectLabel}</span>
      <div className="project-panel__actions">
        <NewActivityContainer
          projectLabel={projectLabel}
          orgLabel={orgLabel}
          onSuccess={onUpdate}
          parentActivityLabel={activityLabel}
          parentActivitySelfUrl={activitySelfUrl}
          siblings={siblings}
        />
        <TemplatesContainer />
        <Button onClick={() => setShowInfo(true)}>Project Info</Button>
        {showInfo && (
          <ProjectMetaContaier
            projectLabel={projectLabel}
            orgLabel={orgLabel}
            onClose={() => setShowInfo(false)}
          />
        )}
        <NotificationsContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
        />
      </div>
    </div>
  );
};

export default ProjectPanel;
