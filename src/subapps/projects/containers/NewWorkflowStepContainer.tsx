import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import WorkflowStepForm from '../components/WorkflowSteps/WorkflowStepForm';
import ActioButton from '../components/ActionButton';
import { Status } from '../components/StatusIcon';
import { displayError } from '../components/Notifications';
import fusionConfig from '../config';

export type WorkflowStepMetadata = {
  name: string;
  description: string;
  summary?: string;
  dueDate: string;
  status: Status;
  hasParent?: {
    '@id': string;
  };
  wasInformedBy?: {
    '@id': string;
  };
};

const NewWorkflowStepContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onSuccess(): void;
  parentStepLabel?: string;
  parentStepSelfUrl?: string;
  siblings?: {
    name: string;
    '@id': string;
  }[];
}> = ({
  orgLabel,
  projectLabel,
  onSuccess,
  parentStepLabel,
  parentStepSelfUrl,
  siblings,
}) => {
  const nexus = useNexusContext();

  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  const submitNewStep = (data: WorkflowStepMetadata) => {
    setBusy(true);
    const { name } = data;

    if (parentStepSelfUrl) {
      data.hasParent = {
        '@id': parentStepSelfUrl,
      };
    }

    nexus.Resource.create(orgLabel, projectLabel, {
      '@type': fusionConfig.workflowStepType,
      ...data,
    })
      .then(() => {
        onSuccess();
        setShowForm(false);
        setBusy(false);

        notification.success({
          message: `New step ${name} created successfully`,
          description: 'Updating Workflow...',
        });
      })
      .catch(error => {
        setShowForm(false);
        setBusy(false);
        displayError(error, 'An error occurred');
      });
  };

  return (
    <>
      <ActioButton
        icon="Add"
        onClick={() => setShowForm(true)}
        title="Add step"
      />
      <Modal
        visible={showForm}
        footer={null}
        onCancel={() => setShowForm(false)}
        width={1150}
        destroyOnClose={true}
      >
        {/* TODO: adapt form https://github.com/BlueBrain/nexus/issues/1814 */}
        <WorkflowStepForm
          title="Create New Step"
          onClickCancel={() => setShowForm(false)}
          onSubmit={submitNewStep}
          busy={busy}
          parentLabel={parentStepLabel}
          siblings={siblings}
        />
      </Modal>
    </>
  );
};

export default NewWorkflowStepContainer;
