import './ProjectView.scss';

import * as React from 'react';
import { useRouteMatch } from 'react-router';

import { useProjectsSubappContext } from '..';
import WorkflowStepsContainer from '../containers/WorkflowStepsContainer';

const ProjectView: React.FC = () => {
  const subapp = useProjectsSubappContext();
  const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
    `/${subapp.namespace}/:orgLabel/:projectLabel`
  );
  const projectLabel = match?.params.projectLabel;
  const orgLabel = match?.params.orgLabel;

  return (
    <>
      {projectLabel && orgLabel ? (
        <div className="project-view__container">
          {orgLabel && projectLabel && (
            <WorkflowStepsContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
            />
          )}
        </div>
      ) : (
        <div className="project-view__container">
          <h2>Project not found</h2>
        </div>
      )}
    </>
  );
};

export default ProjectView;
