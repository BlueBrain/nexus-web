import * as React from 'react';
import { Modal, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';

import WorkflowStepWithActivityForm from '../components/WorkflowSteps/WorkflowStepWithActivityForm';
import ActioButton from '../components/ActionButton';
import { Status } from '../components/StatusIcon';
import { displayError, successNotification } from '../components/Notifications';
import fusionConfig from '../config';
import { useActivitySubClasses } from '../hooks/useActivitySubClasses';

export type WorkflowStepMetadata = {
  name: string;
  activityType?: string;
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
  'nxv:activities':
    | {
        '@id': string;
      }
    | {
        '@id': string;
      }[];
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
  const { subClasses, fetchSubClasses, error } = useActivitySubClasses();

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

        successNotification(`New step ${name} created successfully`);
      })
      .catch(error => {
        setShowForm(false);
        setBusy(false);
        displayError(error, 'An error occurred');
      });
  };

  const onClickAddStep = () => {
    fetchSubClasses();
    setShowForm(true);
  };

  if (error) displayError(error, 'Failed to load activities');

  return (
    <>
      <ActioButton icon="Add" onClick={onClickAddStep} title="Add step" />
      <Modal
        visible={showForm}
        footer={null}
        onCancel={() => setShowForm(false)}
        width={1150}
        destroyOnClose={true}
      >
        <WorkflowStepWithActivityForm
          title="Create New Step"
          onClickCancel={() => setShowForm(false)}
          onSubmit={submitNewStep}
          busy={busy}
          parentLabel={parentStepLabel}
          siblings={siblings}
          activityList={subClasses}
        />
      </Modal>
    </>
  );
};

export default NewWorkflowStepContainer;
