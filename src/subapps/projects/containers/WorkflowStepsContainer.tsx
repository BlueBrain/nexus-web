import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';

import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import { displayError, successNotification } from '../components/Notifications';
import { StepResource } from '../views/WorkflowStepView';
import StepCard from '../components/WorkflowSteps/StepCard';
import ProjectPanel from '../components/ProjectPanel';
import { fetchTopLevelSteps } from '../utils';
import { useUpdateStep } from '../hooks/useUpdateStep';

const WorkflowStepContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [steps, setSteps] = React.useState<StepResource[]>([]);
  // switch to trigger step list update
  const [refreshSteps, setRefreshSteps] = React.useState<boolean>(false);
  const { updateStep, success, error } = useUpdateStep(orgLabel, projectLabel);

  const waitAntReloadActivities = () =>
    setTimeout(() => setRefreshSteps(!refreshSteps), 3500);

  React.useEffect(() => {
    fetchAllSteps(nexus, orgLabel, projectLabel);
  }, [refreshSteps]);

  const fetchAllSteps = async (
    nexus: NexusClient,
    orgLabel: string,
    projectLabel: string
  ) => {
    try {
      const allSteps = (await fetchTopLevelSteps(
        nexus,
        orgLabel,
        projectLabel
      )) as StepResource[];
      setSteps(allSteps);
    } catch (e) {
      displayError(e, 'Failed to fetch workflow steps');
    }
  };

  const topLevelSteps: StepResource[] = steps.filter(step => !step.hasParent);

  const children: StepResource[] = steps.filter(step => !!step.hasParent);

  const stepsWithChildren = topLevelSteps.map(step => {
    const substeps = children.filter(
      substep => substep.hasParent && substep.hasParent['@id'] === step['@id']
    );

    return {
      ...step,
      substeps,
    };
  });

  const siblings = topLevelSteps.map(sibling => ({
    name: sibling.name,
    '@id': sibling._self,
  }));

  const onStatusChange = (stepId: string, rev: number, newStatus: string) => {
    updateStep(stepId, rev, { status: newStatus });
  };

  const onPositionChange = (stepId: string, rev: number, data: any) => {
    updateStep(stepId, rev, data);
  };

  if (error) {
    displayError(error, 'Failed to update');
  }

  if (success) {
    successNotification('Workflow Step updated successfully');
  }

  return (
    <>
      <ProjectPanel
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onUpdate={waitAntReloadActivities}
        siblings={siblings}
      />
      <StepsBoard>
        {steps &&
          stepsWithChildren.map(step => (
            <StepCard
              step={step}
              substeps={step.substeps}
              key={step['@id']}
              projectLabel={projectLabel}
              orgLabel={orgLabel}
              onStatusChange={onStatusChange}
              onPostionChange={onPositionChange}
            />
          ))}
      </StepsBoard>
    </>
  );
};

export default WorkflowStepContainer;
