import * as React from 'react';
import { Modal, Spin } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';

import SingleStepContainer from './SingleStepContainer';
import StepsBoard from '../components/WorkflowSteps/StepsBoard';
import ProjectPanel from '../components/ProjectPanel';
import { fetchTopLevelSteps } from '../utils';
import AddComponentButton from '../components/AddComponentButton';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import fusionConfig from '../config';
import { StepResource, WorkflowStepMetadata } from '../types';
import { WORKFLOW_STEP_CONTEXT } from '../fusionContext';
import {
  createTableContext,
  createWorkflowStepContext,
} from '../utils/workFlowMetadataUtils';
import useNotification, {
  parseNexusError,
} from '../../../shared/hooks/useNotification';
import './WorkflowStepsContainer.less';

const WorkflowStepContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const notification = useNotification();
  const [steps, setSteps] = React.useState<StepResource[]>([]);
  const [showAddForm, setShowAddForm] = React.useState<boolean>(false);
  // switch to trigger step list update
  const [refreshSteps, setRefreshSteps] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const reloadSteps = () => setRefreshSteps(!refreshSteps);

  React.useEffect(() => {
    setBusy(true);
    Promise.all([
      checkForContext(),
      fetchAllSteps(nexus, orgLabel, projectLabel),
    ]).then(() => setBusy(false));
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
      notification.error({
        message: 'Failed to fetch workflow steps',
        description: parseNexusError(e),
      });
    }
  };

  const checkForContext = async () => {
    try {
      await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(WORKFLOW_STEP_CONTEXT['@id'])
      );
    } catch (ex) {
      if (ex['@type'] === 'ResourceNotFound') {
        createWorkflowStepContext(orgLabel, projectLabel, nexus);
        createTableContext(orgLabel, projectLabel, nexus);
      }
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

  const submitNewStep = (data: WorkflowStepMetadata) => {
    const { name } = data;

    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.workflowStepType,
      '@context': WORKFLOW_STEP_CONTEXT['@id'],
      ...data,
    })
      .then(() => {
        setShowAddForm(false);
        notification.success({
          message: `New step ${name} created successfully`,
        });
        reloadSteps();
      })
      .catch(error => {
        setShowAddForm(false);
        notification.error({
          message: 'An error occurred',
          description: parseNexusError(error),
        });
      });
  };

  return (
    <>
      <Spin
        spinning={busy}
        tip="Please wait..."
        wrapperClassName="workflow_board_spin_wrapper"
      >
        <ProjectPanel orgLabel={orgLabel} projectLabel={projectLabel} />
        <AddComponentButton addNewStep={() => setShowAddForm(true)} />
        <StepsBoard>
          {steps &&
            stepsWithChildren.map(step => (
              <SingleStepContainer
                step={step}
                key={step['@id']}
                projectLabel={projectLabel}
                orgLabel={orgLabel}
                onUpdate={reloadSteps}
              />
            ))}
        </StepsBoard>
      </Spin>
      <Modal
        open={showAddForm}
        footer={null}
        onCancel={() => setShowAddForm(false)}
        width={800}
        destroyOnClose={true}
      >
        <WorkflowStepWithActivityForm
          title="Create New Step"
          onClickCancel={() => setShowAddForm(false)}
          onSubmit={submitNewStep}
          busy={busy}
          siblings={siblings}
          activityList={[]}
        />
      </Modal>
    </>
  );
};

export default WorkflowStepContainer;
