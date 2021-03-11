import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import { displayError } from '../components/Notifications';
import StepCard from '../components/WorkflowSteps/StepCard';
import { StepResource } from '../views/WorkflowStepView';
import { isParentLink } from '../utils';
import { useUpdateStep } from '../hooks/useUpdateStep';

const SingleStepContainer: React.FC<{
  projectLabel: string;
  orgLabel: string;
  step: StepResource;
}> = ({ projectLabel, orgLabel, step }) => {
  const nexus = useNexusContext();
  const [children, setChildren] = React.useState<any[]>([]);
  const { updateStep, success, error } = useUpdateStep(
    orgLabel,
    projectLabel,
    step._rev
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

  const onStatusChange = (stepId: string, newStatus: string) => {
    updateStep(stepId, { status: newStatus });
  };

  const onPositionChange = (stepId: string, data: any) => {
    updateStep(stepId, data);
  };

  if (error) {
    displayError(error, 'Failed to update Workflow Step');
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
      onPostionChange={onPositionChange}
    />
  );
};

export default SingleStepContainer;
