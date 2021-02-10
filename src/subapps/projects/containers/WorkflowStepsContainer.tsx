import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';

import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import { displayError, successNotification } from '../components/Notifications';
import { StepResource } from '../views/WorkflowStepView';
import StepCard from '../components/WorkflowSteps/StepCard';
import ProjectPanel from '../components/ProjectPanel';
import { fetchTopLevelSteps } from '../utils';
import { useStepStatus } from '../hooks/useStepStatus';

const WorkflowStepContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [steps, setSteps] = React.useState<StepResource[]>([]);
  const [orderedSteps, setOrderedSteps] = React.useState<any[]>([]);
  // switch to trigger step list update
  const [refreshSteps, setRefreshSteps] = React.useState<boolean>(false);
  const { updateStatus, success, error } = useStepStatus(
    orgLabel,
    projectLabel
  );

  const waitAntReloadActivities = () =>
    setTimeout(() => setRefreshSteps(!refreshSteps), 3500);

  React.useEffect(() => {
    fetchAllSteps(nexus, orgLabel, projectLabel);
  }, [refreshSteps]);

  React.useEffect(() => {
    const firstSteps = steps.filter(step => !step.wasInformedBy);

    const findNextSteps = (id: string) => {
      return steps.filter(
        step => (step.wasInformedBy && step.wasInformedBy['@id']) === id
      );
    };

    const orderedNext: any[] = [];

    firstSteps.forEach(step => {
      const nextSteps = findNextSteps(step['@id']);

      console.log('nextSteps', nextSteps);

      nextSteps.forEach(step => {
        orderedNext.push({ step, order: 2 });
      });
    });

    console.log('orderedNext', orderedNext);

    setOrderedSteps([...orderedSteps, ...orderedNext]);
  }, [steps]);

  console.log('orderedSteps', orderedSteps);

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

  const onStatusChange = (stepId: string, rev: number, status: string) => {
    updateStatus(stepId, rev, status);
  };

  if (error) {
    displayError(error, 'Failed to update status');
  }

  if (success) {
    successNotification('Status was updates successfully');
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
            />
          ))}
      </StepsBoard>
    </>
  );
};

export default WorkflowStepContainer;
