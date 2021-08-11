import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import ProjectQuotas from '../components/Projects/ProjectQuotas';

const QuotasContainer: React.FC<{ orgLabel: string; projectLabel: string }> = ({
  orgLabel,
  projectLabel,
}) => {
  const nexus = useNexusContext();
  const [quota, setQuota] = React.useState<any>();
  const [projectStats, setProjectStats] = React.useState<any>();

  React.useEffect(() => {
    // load project quotas
    console.log('loading quotas....');
    loadQuotas();
    loadStats();
  }, []);

  const loadQuotas = async () => {
    await nexus
      .httpGet({
        path: `http://delta.dev.nexus.ocp.bbp.epfl.ch/v1/quotas/${orgLabel}/${projectLabel}`,
      })
      .then(resp => {
        console.log('resp', resp.resources);

        setQuota(resp);
      });
  };

  const loadStats = async () => {
    await nexus
      .httpGet({
        path: `http://delta.dev.nexus.ocp.bbp.epfl.ch/v1/projects/${orgLabel}/${projectLabel}/statistics`,
      })
      .then(resp => {
        console.log('resp', resp);

        setProjectStats(resp);
      });
  };

  if (!quota || !projectStats) return null;

  return <ProjectQuotas quota={quota} statistics={projectStats} />;
};

export default QuotasContainer;
