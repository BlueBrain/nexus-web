import * as React from 'react';
import { ProjectStatistics, Quota } from '@bbp/nexus-sdk';
import './ProjectQuotas.less';
declare const ProjectQuotas: React.FC<{
  quota: Quota;
  statistics: ProjectStatistics;
}>;
export default ProjectQuotas;
