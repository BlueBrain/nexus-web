import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import fusionConfig from '../config';

export const useStepStatus = (orgLabel: string, projectLabel: string) => {
  const nexus = useNexusContext();
  const [error, setError] = React.useState<Error>();
  const [success, setSuccess] = React.useState<boolean>();

  const updateStatus = async (
    stepId: string,
    rev: number,
    newStatus: string
  ) => {
    await nexus.Resource.getSource(
      orgLabel,
      projectLabel,
      encodeURIComponent(stepId)
    )
      .then(response => {
        const originalPayload = response;

        return nexus.Resource.update(orgLabel, projectLabel, stepId, rev, {
          ...originalPayload,
          status: newStatus,
          '@type': fusionConfig.workflowStepType,
        });
      })
      .then(() => setSuccess(true))
      .catch(error => setError(error));
  };

  return {
    updateStatus,
    success,
    error,
  };
};
