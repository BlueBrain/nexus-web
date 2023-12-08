import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';

import fusionConfig from '../config';

export const useUpdateStep = (
  orgLabel: string,
  projectLabel: string,
  rev: number
) => {
  const nexus = useNexusContext();
  const [error, setError] = React.useState<Error>();
  const [success, setSuccess] = React.useState<boolean>();
  const [localCopy, setLocalCopy] = React.useState<number>(rev);

  const updateStep = async (
    stepId: string,
    data: {
      [key: string]: any;
    }
  ) => {
    try {
      const originalPayload = await nexus.Resource.getSource(
        orgLabel,
        projectLabel,
        encodeURIComponent(stepId)
      );

      const updateResource = await nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(stepId),
        localCopy,
        {
          ...originalPayload,
          ...data,
          '@type': fusionConfig.workflowStepType,
        }
      );
      setLocalCopy(updateResource._rev);
      setSuccess(true);
    } catch (err) {
      setError(error);
    }
  };

  return {
    updateStep,
    success,
    error,
  };
};
