import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { ProjectStatistics, ProjectDeletionConfig } from '@bbp/nexus-sdk';

import ProjectWarning from '../components/Projects/ProjectWarning';

const ProjectToDeleteContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const [idleInterval, setIdleInterval] = React.useState<number>();
  const [lastUpdated, setLastUpdated] = React.useState<string>();
  const nexus = useNexusContext();

  React.useEffect(() => {
    loadDeletionConfig();
    loadStatistics();
  });

  // const temp = {
  //   '@context':
  //     'https://bluebrain.github.io/nexus/contexts/project-deletion.json',
  //   '@type': 'ProjectDeletionConfig',
  //   _idleIntervalInSeconds: 2592000,
  //   _idleCheckPeriodInSeconds: 5,
  //   _deleteDeprecatedProjects: true,
  //   _includedProjects: ['some.+'],
  //   _excludedProjects: ['.+'],
  // };

  const loadStatistics = async () => {
    await nexus.Project.statistics(orgLabel, projectLabel)
      .then((response: ProjectStatistics) => {
        setLastUpdated(response.lastProcessedEventDateTime);
      })
      .catch(error => {
        // fail silently
      });
  };

  const loadDeletionConfig = async () => {
    await nexus.Project.deletionConfig()
      .then((response: ProjectDeletionConfig) => {
        setIdleInterval(response._idleIntervalInSeconds);
      })
      .catch(error => {
        // fail silently
      });
  };

  if (!lastUpdated || !idleInterval) return null;

  return (
    <ProjectWarning
      projectLastUpdatedAt={lastUpdated}
      duration={idleInterval}
    />
  );
};

export default ProjectToDeleteContainer;
