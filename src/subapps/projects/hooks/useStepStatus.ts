import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import fusionConfig from '../config';
import { Resource } from '@bbp/nexus-sdk';

export const useStepStatus = (orgLabel: string, projectLabel: string) => {
  const nexus = useNexusContext();
  const [error, setError] = React.useState<Error>();
  const [success, setSuccess] = React.useState<boolean>();
  const [updatedResource, setUpdatedResource] = React.useState<Resource>();

  const updateStatus = async (
    stepId: string,
    rev: number,
    newStatus: string
  ) => {
    try {
      const originalPayload = await nexus.Resource.getSource(
        orgLabel,
        projectLabel,
        encodeURIComponent(stepId)
      );

      const revCopy = updatedResource ? updatedResource._rev : rev;

      const updatedCopy = await nexus.Resource.update(
        orgLabel,
        projectLabel,
        stepId,
        revCopy,
        {
          ...originalPayload,
          status: newStatus,
          '@type': fusionConfig.workflowStepType,
        }
      );
      setUpdatedResource(updatedCopy);

      setSuccess(true);
    } catch (error) {
      setError(error);
    }
  };

  return {
    updateStatus,
    success,
    error,
  };
};
