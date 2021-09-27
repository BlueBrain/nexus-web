import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { ProjectStatistics } from '@bbp/nexus-sdk';

import ProjectWarning from '../components/Projects/ProjectWarning';

const ProjectToDeleteContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const [duration, setDuration] = React.useState<any>();
  const nexus = useNexusContext();

  React.useEffect(() => {
    loadStatistics();
  });

  const loadStatistics = async () => {
    await nexus.Project.statistics(orgLabel, projectLabel)
      .then((response: ProjectStatistics) => {
        // @ts-ignore
        setDuration(response.duration);
      })
      .catch(error => {
        // fail silently
      });
  };

  return <ProjectWarning />;
};

export default ProjectToDeleteContainer;
