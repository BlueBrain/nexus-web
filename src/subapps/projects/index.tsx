import * as React from 'react';
import { SubApp } from '..';

import ProjectsListView from './views/ProjectsListView';
import ProjectView from './views/ProjectView';
import WorkflowStepView from './views/WorkflowStepView';

const title = 'Workflow';
const namespace = 'workflow';
const description = 'Create activities to support you data driven pipeline';
const subAppType = 'internal';
const icon = require('../../shared/images/flowIcon.svg');
const version = 'α';
const requireLogin = true;

const projectsSubappProps = {
  title,
  description,
  namespace,
  icon,
  subAppType,
  version,
  requireLogin,
};

export const ProjectsSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
  version: string;
  requireLogin: boolean;
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
        path: '/:orgLabel/:projectLabel',
        exact: true,
        component: ProjectsSubappProviderHOC(ProjectView),
      },
      {
        path: '/:orgLabel/:projectLabel/:stepId',
        exact: true,
        component: ProjectsSubappProviderHOC(WorkflowStepView),
      },
    ],
  };
};

export default Projects;
