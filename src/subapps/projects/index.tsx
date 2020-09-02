import * as React from 'react';
import { SubApp } from '..';

import ProjectsListView from './views/ProjectsListView';
import ProjectView from './views/ProjectView';

const title = 'Projects';
const namespace = 'projects';
const icon = require('../../shared/images/flowIcon.svg');

const projectsSubappProps = {
  title,
  namespace,
  icon,
};

export const ProjectsSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
}>(projectsSubappProps);

export function useProjectsSubappContext() {
  const projectsSubappProps = React.useContext(ProjectsSubappContext);

  return projectsSubappProps;
}

export const ProjectsSubappProviderHOC = (
  component: React.FunctionComponent
) => {
  return () => (
    <ProjectsSubappContext.Provider value={projectsSubappProps}>
      {component({})}
    </ProjectsSubappContext.Provider>
  );
};

const Projects: SubApp = () => {
  return {
    ...projectsSubappProps,
    routes: [
      {
        path: '/',
        exact: true,
        component: ProjectsSubappProviderHOC(ProjectsListView),
      },
      {
        path: '/:project',
        exact: true,
        component: ProjectsSubappProviderHOC(ProjectView),
      },
    ],
  };
};

export default Projects;
