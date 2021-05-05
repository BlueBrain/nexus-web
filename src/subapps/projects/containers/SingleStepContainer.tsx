import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Modal } from 'antd';

import { displayError } from '../components/Notifications';
import StepCard from '../components/WorkflowSteps/StepCard';
import { isParentLink } from '../utils';
import { useUpdateStep } from '../hooks/useUpdateStep';
import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import fusionConfig from '../config';
import { StepResource, WorkflowStepMetadata } from '../types';
import { WORKFLOW_STEP_CONTEXT } from '../fusionContext';

const SingleStepContainer: React.FC<{
  projectLabel: string;
  orgLabel: string;
  step: StepResource;
  onUpdate: () => void;
  parentLabel?: string;
}> = ({ projectLabel, orgLabel, step, onUpdate, parentLabel }) => {
  const nexus = useNexusContext();
  const [children, setChildren] = React.useState<any[]>([]);
  const [showAddForm, setShowAddForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);
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

  const submitNewStep = (data: WorkflowStepMetadata) => {
    setBusy(true);

    if (step.hasParent) {
      data.hasParent = step.hasParent;
    }

    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.workflowStepType,
      '@context': WORKFLOW_STEP_CONTEXT['@id'],
      ...data,
    })
      .then(() => {
        onUpdate();
        setShowAddForm(false);
        setBusy(false);
      })
      .catch(error => {
        setShowAddForm(false);
        setBusy(false);
        displayError(error, 'An error occurred');
      });
  };

  const updateName = (newName: string) => {
    updateStep(step['@id'], { name: newName });
  };

  if (!step) return null;

  return (
    <>
      <StepCard
        step={step}
        substeps={children}
        key={step['@id']}
        projectLabel={projectLabel}
        orgLabel={orgLabel}
        onStatusChange={onStatusChange}
        onPostionChange={onPositionChange}
        onClickAddCard={() => setShowAddForm(true)}
        onNameChange={updateName}
      />
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
          busy={busy}
          activityList={[]}
          informedByIds={[step._self]}
          parentLabel={parentLabel}
          siblings={[
            {
              name: step.name,
              '@id': step._self,
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default SingleStepContainer;
