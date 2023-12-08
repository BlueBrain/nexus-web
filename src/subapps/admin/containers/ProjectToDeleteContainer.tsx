import { ProjectDeletionConfig, ProjectStatistics } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';

import ProjectWarning from '../components/Projects/ProjectWarning';

const ProjectToDeleteContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const [deletionConfig, setDeletionConfig] = React.useState<ProjectDeletionConfig>();
  const [lastUpdated, setLastUpdated] = React.useState<string>();
  const nexus = useNexusContext();

  React.useEffect(() => {
    loadDeletionConfig();
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    await nexus.Project.statistics(orgLabel, projectLabel)
      .then((response: ProjectStatistics) => {
        setLastUpdated(response.lastProcessedEventDateTime);
      })
      .catch((error) => {
        // fail silently
      });
  };

  const loadDeletionConfig = async () => {
    await nexus.Project.deletionConfig()
      .then((response: ProjectDeletionConfig) => {
        setDeletionConfig(response);
      })
      .catch((error) => {
        // fail silently
      });
  };

  const projectName = `${orgLabel}/${projectLabel}`;

  const isIncluded = () => {
    let included = false;

    deletionConfig?._includedProjects.forEach((includedProject) => {
      if (new RegExp(includedProject).test(projectName)) included = true;
    });

    return included;
  };

  const isExcluded = () => {
    let excluded = false;

    deletionConfig?._excludedProjects.forEach((excludedProject) => {
      if (new RegExp(excludedProject).test(projectName)) excluded = true;
    });

    return excluded;
  };

  if (!lastUpdated || !deletionConfig || isExcluded()) return null;

  if (isIncluded()) {
    return (
      <ProjectWarning
        projectLastUpdatedAt={lastUpdated}
        duration={deletionConfig._idleIntervalInSeconds}
      />
    );
  }

  return null;
};

export default ProjectToDeleteContainer;
