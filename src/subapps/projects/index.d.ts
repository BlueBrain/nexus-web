import * as React from 'react';
import { SubApp } from '..';
export declare const ProjectsSubappContext: React.Context<{
  title: string;
  namespace: string;
  icon: string;
  version: string;
  requireLogin: boolean;
}>;
export declare function useProjectsSubappContext(): {
  title: string;
  namespace: string;
  icon: string;
  version: string;
  requireLogin: boolean;
};
export declare const ProjectsSubappProviderHOC: (
  component: React.FunctionComponent
) => () => JSX.Element;
declare const Projects: SubApp;
export default Projects;
