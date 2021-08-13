import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { ProjectStatistics } from '@bbp/nexus-sdk';

import ProjectQuotas from '../components/Projects/ProjectQuotas';

const QuotasContainer: React.FC<{ orgLabel: string; projectLabel: string }> = ({
  orgLabel,
  projectLabel,
}) => {
  const nexus = useNexusContext();
  const [quota, setQuota] = React.useState<any>();
  const [projectStats, setProjectStats] = React.useState<ProjectStatistics>();

  React.useEffect(() => {
    // load project quotas
    console.log('loading quotas....');
    loadQuotas();
    loadStats();
  }, []);

  const loadQuotas = async () => {
    await nexus.Quotas.get(orgLabel, projectLabel).then((response: any) => {
      console.log('resp', response);

      setQuota(response);
    });
  };

  const loadStats = async () => {
    await nexus.Project.statistics(orgLabel, projectLabel).then(
      (response: ProjectStatistics) => {
        console.log('resp', response);

        setProjectStats(response);
      }
    );
  };

  if (!quota || !projectStats) return null;

  return <ProjectQuotas quota={quota} statistics={projectStats} />;
};

export default QuotasContainer;
