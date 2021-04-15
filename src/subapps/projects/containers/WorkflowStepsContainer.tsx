import * as React from 'react';
import { Modal } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';

import SingleStepContainer from './SingleStepContainer';
import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import { displayError, successNotification } from '../components/Notifications';
import { StepResource } from '../views/WorkflowStepView';
import ProjectPanel from '../components/ProjectPanel';
import { fetchTopLevelSteps } from '../utils';
import AddComponentButton from '../components/AddComponentButton';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import fusionConfig from '../config';
import { WorkflowStepMetadata } from './NewWorkflowStepContainer';

const WorkflowStepContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [steps, setSteps] = React.useState<StepResource[]>([]);
  const [showAddForm, setShowAddForm] = React.useState<boolean>(false);
  // switch to trigger step list update
  const [refreshSteps, setRefreshSteps] = React.useState<boolean>(false);

  const waitAntReloadSteps = () =>
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

  // TODO: refactor ProjectPanel, SingleStepContainer and NewWorkflowStepsContainer
  const submitNewStep = (data: WorkflowStepMetadata) => {
    const { name } = data;

    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.workflowStepType,
      ...data,
    })
      .then(() => {
        setShowAddForm(false);
        successNotification(`New step ${name} created successfully`);
        waitAntReloadSteps();
      })
      .catch(error => {
        setShowAddForm(false);
        displayError(error, 'An error occurred');
      });
  };

  return (
    <>
      <ProjectPanel
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        onUpdate={waitAntReloadSteps}
        siblings={siblings}
      />
      <AddComponentButton
        addNewStep={() => setShowAddForm(true)}
        addDataTable={() => {}}
        addCode={() => {}}
        addDataset={() => {}}
      />
      <StepsBoard>
        {steps &&
          stepsWithChildren.map(step => (
            <SingleStepContainer
              step={step}
              key={step['@id']}
              projectLabel={projectLabel}
              orgLabel={orgLabel}
              onUpdate={waitAntReloadSteps}
            />
          ))}
      </StepsBoard>
      <Modal
        visible={showAddForm}
        footer={null}
        onCancel={() => setShowAddForm(false)}
        width={800}
        destroyOnClose={true}
      >
        <WorkflowStepWithActivityForm
          title="Create New Step"
          onClickCancel={() => setShowAddForm(false)}
          onSubmit={submitNewStep}
          busy={false}
          siblings={siblings}
          activityList={[]}
        />
      </Modal>
    </>
  );
};

export default WorkflowStepContainer;
