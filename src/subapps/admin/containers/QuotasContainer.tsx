import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { ProjectStatistics, Quota } from '@bbp/nexus-sdk/es';

import ProjectQuotas from '../components/Projects/ProjectQuotas';

const QuotasContainer: React.FC<{ orgLabel: string; projectLabel: string }> = ({
  orgLabel,
  projectLabel,
}) => {
  const nexus = useNexusContext();
  const [quota, setQuota] = React.useState<Quota>();
  const [projectStats, setProjectStats] = React.useState<ProjectStatistics>();

  React.useEffect(() => {
    loadQuotas();
    loadStats();
  }, []);

  const loadQuotas = async () => {
    await nexus.Quotas.get(orgLabel, projectLabel)
      .then((response: any) => {
        setQuota(response);
      })
      .catch(() => {
        // fail silently
      });
  };

  const loadStats = async () => {
    await nexus.Project.statistics(orgLabel, projectLabel)
      .then((response: ProjectStatistics) => {
        setProjectStats(response);
      })
      .catch(() => {
        // fail silently
      });
  };

  if (!quota || !projectStats) return null;

  return <ProjectQuotas quota={quota} statistics={projectStats} />;
};

export default QuotasContainer;
