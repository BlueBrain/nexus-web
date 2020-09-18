import * as React from 'react';
import { useRouteMatch } from 'react-router';

import { useProjectsSubappContext } from '..';
import ProjectPanel from '../components/ProjectPanel';
import ActivitiesContainer from '../containers/ActivitiesContainer';

import './ProjectView.less';

const ProjectView: React.FC = () => {
  const subapp = useProjectsSubappContext();
  const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
    `/${subapp.namespace}/:orgLabel/:projectLabel`
  );
  const projectLabel = match?.params.projectLabel;
  const orgLabel = match?.params.orgLabel;
  // switch to trigger activities list update
  const [refreshActivities, setRefreshActivities] = React.useState<boolean>(
    false
  );

  const waitAntReloadActivities = () =>
    setTimeout(() => setRefreshActivities(!refreshActivities), 3500);

  return (
    <>
      {projectLabel && orgLabel ? (
        <div className="project-view__container">
          {orgLabel && projectLabel && (
            <ProjectPanel orgLabel={orgLabel} projectLabel={projectLabel} />
          )}
          {orgLabel && projectLabel && (
            <ActivitiesContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              refresh={refreshActivities}
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
