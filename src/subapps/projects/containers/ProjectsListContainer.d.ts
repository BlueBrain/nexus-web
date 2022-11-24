import * as React from 'react';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';
declare type ProjectsListContainerType = {
  projects: ProjectResponseCommon[];
  projectType: string;
};
declare const ProjectsListContainer: React.FC<ProjectsListContainerType>;
export default ProjectsListContainer;
