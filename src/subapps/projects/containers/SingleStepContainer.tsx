import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import { displayError, successNotification } from '../components/Notifications';
import StepCard from '../components/WorkflowSteps/StepCard';
import { StepResource } from '../views/WorkflowStepView';
import { isParentLink } from '../utils';
import { useStepStatus } from '../hooks/useStepStatus';

const SignleStepContainer: React.FC<{
  projectLabel: string;
  orgLabel: string;
  step: StepResource;
}> = ({ projectLabel, orgLabel, step }) => {
  const nexus = useNexusContext();
  const [children, setChildren] = React.useState<any[]>([]);
  const { updateStatus, success, error } = useStepStatus(
    orgLabel,
    projectLabel
  );

  React.useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = () => {
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(step['@id']),
      'incoming'
    )
      .then(response =>
        Promise.all(
          response._results
            .filter(link => isParentLink(link))
            .map(link => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(link['@id'])
              );
            })
        )
          .then(response => {
            setChildren(response);
          })
          .catch(error => displayError(error, 'Failed to load Workflow Steps'))
      )
      .catch(error => displayError(error, 'Failed to load Workflow Steps'));
  };

  const onStatusChange = (stepId: string, rev: number, status: string) => {
    updateStatus(stepId, rev, status);
  };

  if (error) {
    displayError(error, 'Failed to update status');
  }

  if (success) {
    successNotification('Status was updates successfully');
  }

  if (!step) return null;

  return (
    <StepCard
      step={step}
      substeps={children}
      key={step['@id']}
      projectLabel={projectLabel}
      orgLabel={orgLabel}
      onStatusChange={onStatusChange}
    />
  );
};

export default SignleStepContainer;
