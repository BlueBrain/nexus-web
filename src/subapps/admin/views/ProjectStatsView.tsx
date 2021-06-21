import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';

import { useAdminSubappContext } from '..';
import ProjectStatsContainer from '../containers/ProjectStatsContainer';

import './ProjectStatsView.less';

const ProjectStatsView: React.FC<{}> = () => {
  const nexus = useNexusContext();
  const subapp = useAdminSubappContext();
  const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
    `/${subapp.namespace}/:orgLabel/:projectLabel`
  );
  const {
    params: { orgLabel, projectLabel },
  } = match || {
    params: {
      orgLabel: '',
      projectLabel: '',
    },
  };

  return (
    <div className="project-stats-view">
      <h1 className="project-stats-view__title">
        {orgLabel} &gt; {projectLabel}
      </h1>
      <ProjectStatsContainer />
    </div>
  );
};

export default ProjectStatsView;
