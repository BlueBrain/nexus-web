import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';

import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import fusionConfig from '../config';
import { displayError } from '../components/Notifications';
import { StepResource } from '../views/WorkflowStepView';
import StepCard from '../components/WorkflowSteps/StepCard';
import ProjectPanel from '../components/ProjectPanel';

const WorkflowStepContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  const [steps, setSteps] = React.useState<StepResource[]>([]);
  // switch to trigger step list update
  const [refreshSteps, setRefreshSteps] = React.useState<boolean>(false);

  const waitAntReloadActivities = () =>
    setTimeout(() => setRefreshSteps(!refreshSteps), 3500);

  React.useEffect(() => {
    nexus.Resource.list(orgLabel, projectLabel, {
      type: fusionConfig.workflowStepType,
      size: 200,
      deprecated: false,
    })
      .then(response => {
        fetchActivities(response._results);
      })
      .catch(error => displayError(error, 'An error occurred'));
  }, [refreshSteps]);

  const fetchActivities = (activities: any) => {
    Promise.all(
      activities.map((activity: any) => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity['@id'])
        );
      })
    )
      .then(response => setSteps(response as StepResource[]))
      .catch(error => displayError(error, 'An error occurred'));
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
            />
          ))}
      </StepsBoard>
    </>
  );
};

export default WorkflowStepContainer;
